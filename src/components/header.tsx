// src/components/header.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

export default function Header() {
  const { user, supabase } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error);
    } else {
      // Redireciona para o login após o logout
      router.push('/login');
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
        <LogOut />
        Sair
      </Button>
    </header>
  );
}
