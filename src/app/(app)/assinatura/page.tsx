// src/app/(app)/assinatura/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';
import { Crown, CheckCircle2 } from 'lucide-react';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function AssinaturaPage() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const isPro = userProfile?.plan === 'Pro';
  // NOVO: Verifica se o cancelamento está agendado
  const isCanceledAtPeriodEnd = userProfile?.cancelAtPeriodEnd === true;

  const proPriceId = 'price_1RuEA0PhlS20zt4gz3i7EmLj'; // Substitua pelo seu ID de preço real

  const handleCreateSession = async (action: 'checkout' | 'portal') => {
    if (!user) {
      toast.error('Você precisa estar logado.');
      return;
    }
    setLoading(true);

    try {
      const idToken = await user.getIdToken();
      let apiUrl = '';
      let body = {};

      if (action === 'checkout') {
        apiUrl = '/api/create-checkout-session';
        body = {
          priceId: proPriceId,
          successUrl: `${window.location.origin}/`,
          cancelUrl: `${window.location.origin}/assinatura`,
        };
      } else {
        apiUrl = '/api/create-portal-session';
        body = {
          returnUrl: `${window.location.origin}/assinatura`,
        };
      }

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Falha ao criar a sessão.');
      }

      const { sessionId, url } = await res.json();

      if (action === 'checkout') {
        const stripe = await stripePromise;
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId });
        }
      } else {
        window.location.href = url;
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- INÍCIO DA ALTERAÇÃO ---
  const getButtonText = () => {
    if (loading) return 'Aguarde...';
    if (!isPro) return 'Fazer Upgrade para o Pro';
    if (isCanceledAtPeriodEnd) return 'Reativar Assinatura';
    return 'Gerenciar Assinatura';
  };
  // --- FIM DA ALTERAÇÃO ---

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gerenciar Assinatura</h1>
        <p className="text-sm text-muted-foreground">
          {isPro
            ? 'Você está no plano Pro. Gerencie sua assinatura ou visualize suas faturas.'
            : 'Escolha o plano que melhor se adapta às suas necessidades.'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className={isPro ? 'opacity-60' : ''}>
          <CardHeader>
            <CardTitle>Plano Free</CardTitle>
            <CardDescription>
              Acesso de visualização. Perfeito para conhecer a plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              R$ 0,00
              <span className="text-sm font-normal text-muted-foreground">
                /mês
              </span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>- Visualizar dashboards</li>
              <li>- Funcionalidades de cadastro desabilitadas</li>
            </ul>
          </CardContent>
          <CardFooter>
            {userProfile?.plan === 'Free' && (
              <div className="flex items-center text-sm font-semibold">
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                Seu plano atual
              </div>
            )}
          </CardFooter>
        </Card>

        <Card className={isPro ? 'border-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="mr-2 h-5 w-5 text-yellow-500" />
              Plano Pro
            </CardTitle>
            <CardDescription>
              Acesso total a todos os recursos da plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-2xl font-bold">
                R$ 30,00
                <span className="text-sm font-normal text-muted-foreground">
                  /mês
                </span>
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>✓ Acesso total a todos os recursos</li>
                <li>✓ Cadastros ilimitados de vendas, clientes, etc.</li>
                <li>✓ Suporte prioritário</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            {/* --- INÍCIO DA ALTERAÇÃO --- */}
            <Button
              className="w-full"
              onClick={() => handleCreateSession(isPro ? 'portal' : 'checkout')}
              disabled={loading}
            >
              {getButtonText()}
            </Button>
            {/* --- FIM DA ALTERAÇÃO --- */}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
