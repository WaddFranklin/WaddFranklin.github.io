'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

export default function Header() {
  const { user, profile, supabase } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erro ao fazer logout:', error);
  } else {
    // Aguarde o evento de mudança de autenticação antes de redirecionar
    setTimeout(() => {
      router.push('/login');
    }, 500); // pequeno delay para garantir atualização do contexto
  }
};

  return (
    <header className="flex justify-between items-center mb-6 pb-4 border-b">
      <div>
        <h1 className="text-2xl font-bold">Controle de Vendas</h1>
        {user && (
          <p className="text-sm text-muted-foreground">
            Bem-vindo, {profile?.full_name || user.email}
          </p>
        )}
      </div>
      <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
        <LogOut className="mr-2 h-4 w-4" />
        {loggingOut ? 'Saindo...' : 'Sair'}
      </Button>
    </header>
  );
}