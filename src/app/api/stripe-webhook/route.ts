// src/app/api/stripe-webhook/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase/admin';
import { headers } from 'next/headers';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    console.error('Webhook signature verification failed.', error);
    return new NextResponse('Webhook Error: Invalid signature', {
      status: 400,
    });
  }

  const session = event.data.object as any; // Usar 'any' para acesso flexível
  const userId = session?.metadata?.firebaseUID;

  // Para eventos de assinatura, o userId está no customer metadata
  let finalUserId = userId;
  if (!finalUserId && session.customer) {
    try {
      const customer = await stripe.customers.retrieve(
        session.customer as string,
      );
      finalUserId = (customer as Stripe.Customer).metadata.firebaseUID;
    } catch (e) {
      console.error('Could not retrieve customer to find user id', e);
      return new NextResponse('Webhook Error: Could not find user', {
        status: 400,
      });
    }
  }

  if (!finalUserId) {
    return new NextResponse('Webhook Error: Missing user ID', { status: 400 });
  }

  const userRef = adminDb.collection('users').doc(finalUserId);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );

        await userRef.update({
          subscriptionId: subscription.id,
          plan: 'Pro',
          subscriptionStatus: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
        break;
      }

      // Evento disparado quando uma assinatura é cancelada (imediatamente ou no futuro) ou reativada
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const newPlan = subscription.status === 'active' ? 'Pro' : 'Free';

        await userRef.update({
          plan: newPlan,
          subscriptionStatus: subscription.status,
          // --- INÍCIO DA ADIÇÃO ---
          // Salva o estado de cancelamento agendado
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          // --- FIM DA ADIÇÃO ---
        });
        break;
      }

      // Evento disparado no fim do período para uma assinatura que foi cancelada
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await userRef.update({
          plan: 'Free',
          subscriptionStatus: subscription.status,
          cancelAtPeriodEnd: false, // Garante que o estado seja limpo
        });
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new NextResponse('Webhook handler error', { status: 500 });
  }

  return NextResponse.json({ received: true });
}
