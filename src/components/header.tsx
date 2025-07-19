// src/components/header.tsx
'use client';

import { useAuth } from './auth-provider';
// O botão e o ícone de toggle não são mais necessários aqui

// A interface de props também não é mais necessária
// interface HeaderProps {
//   toggleSidebar: () => void;
// }

export default function Header() {
  const { user, profile } = useAuth();

  return (
    // Removemos o botão e o flex container externo
    <header className="mb-6 pb-4 border-b">
      <h1 className="text-2xl font-bold">Dashboard de Vendas</h1>
      {user && (
        <p className="text-sm text-muted-foreground">
          Bem-vindo, {profile?.full_name || user.email}
        </p>
      )}
    </header>
  );
}
