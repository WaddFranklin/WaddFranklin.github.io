// src/components/header.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

export default function Header() {
  // Agora também pegamos o 'profile' do nosso hook
  const { user, profile, supabase } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error);
    } else {
      router.push('/login');
    }
  };

  return (
    <header className="flex justify-between items-center mb-6 pb-4 border-b">
      <div>
        <h1 className="text-2xl font-bold">Controle de Vendas</h1>
        {user && (
          <p className="text-sm text-muted-foreground">
            {/* Usamos o nome do perfil se ele existir, senão, o e-mail */}
            Bem-vindo, {profile?.full_name || user.email}
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
