// src/app/(app)/pro/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

export default function ProPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para assinar o plano.');
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email,
          userName: user.displayName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redireciona o usuário para a página de checkout do Mercado Pago
        window.location.href = data.checkoutUrl;
      } else {
        toast.error('Erro ao criar assinatura', {
          description: data.error || 'Tente novamente mais tarde.',
        });
      }
    } catch (error) {
      toast.error('Erro de conexão', {
        description:
          'Não foi possível se comunicar com o servidor. Verifique sua conexão.',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Plano PRO</CardTitle>
          <CardDescription>
            Acesso ilimitado a todos os recursos da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <span className="text-4xl font-bold">R$ 30,00</span>
            <span className="text-muted-foreground">/mês</span>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Vendas e clientes ilimitados.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Relatórios avançados.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Suporte prioritário.</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? 'Aguarde...' : 'Assinar Agora'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
