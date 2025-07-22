// src/components/header.tsx
'use client';

import { useAuth } from './auth-provider';

export default function Header() {
  const { user } = useAuth(); // Agora não temos mais o 'profile'

  return (
    <header className="mb-6 pb-4 border-b">
      <h1 className="text-2xl font-bold">Dashboard de Vendas</h1>
      {user && (
        <p className="text-sm text-muted-foreground">
          {/* Usamos user.displayName que foi definido no cadastro */}
          Bem-vindo, {user.displayName || user.email}
        </p>
      )}
    </header>
  );
}
