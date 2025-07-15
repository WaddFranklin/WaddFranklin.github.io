// components/header.tsx
'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from './auth-provider';
import { Button } from './ui/button';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Opcional: mostrar uma notificação de erro para o usuário
    }
  };

  return (
    <header className="flex justify-between items-center mb-6 pb-4 border-b">
      <div>
        <h1 className="text-2xl font-bold">Controle de Vendas</h1>
        {user && (
          <p className="text-sm text-muted-foreground">
            Bem-vindo, {user.email}
          </p>
        )}
      </div>
      <Button variant="outline" onClick={handleLogout}>
        Sair
      </Button>
    </header>
  );
}
