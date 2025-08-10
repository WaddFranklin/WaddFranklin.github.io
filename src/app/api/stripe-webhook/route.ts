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

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session?.metadata?.firebaseUID;

  if (!userId) {
    return new NextResponse('Webhook Error: Missing user ID', { status: 400 });
  }

  const userRef = adminDb.collection('users').doc(userId);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );

        await userRef.update({
          subscriptionId: subscription.id,
          plan: 'Pro', // Ou extraia do produto se tiver múltiplos planos
          subscriptionStatus: subscription.status,
        });
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const newPlan = subscription.status === 'active' ? 'Pro' : 'Free';

        await userRef.update({
          plan: newPlan,
          subscriptionStatus: subscription.status,
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
