// components/protected-route.tsx
'use client';

import { useAuth } from './auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se não estiver carregando e não houver usuário, redireciona para o login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Se estiver carregando, pode mostrar um spinner ou tela de loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  // Se houver um usuário, renderiza o conteúdo da página protegida
  if (user) {
    return <>{children}</>;
  }

  // Retorna null enquanto redireciona para evitar piscar de tela
  return null;
}
