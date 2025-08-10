// src/app/(app)/assinatura/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function AssinaturaPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Substitua pelo ID do preço do seu plano Pro no Stripe
  const proPriceId = 'price_1RuEA0PhlS20zt4gz3i7EmLj';

  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para fazer o upgrade.');
      return;
    }
    setLoading(true);

    try {
      const idToken = await user.getIdToken();

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          priceId: proPriceId,
          successUrl: `${window.location.origin}/`,
          cancelUrl: `${window.location.origin}/assinatura`,
        }),
      });

      if (!res.ok) {
        throw new Error('Falha ao criar a sessão de checkout.');
      }

      const { sessionId } = await res.json();
      const stripe = await stripePromise;

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          toast.error(error.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Ocorreu um erro ao tentar fazer o upgrade.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gerenciar Assinatura</h1>
        <p className="text-sm text-muted-foreground">
          Escolha o plano que melhor se adapta às suas necessidades.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
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
        </Card>

        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Plano Pro</CardTitle>
            <CardDescription>
              Acesso total a todos os recursos da plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-full">
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
            <Button
              className="mt-6 w-full"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? 'Aguarde...' : 'Fazer Upgrade para o Pro'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
