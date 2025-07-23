// src/components/header.tsx
'use client';

import Link from 'next/link';
import { useAuth } from './auth-provider';
import { menuItems } from './nav-menu'; // Importa os itens de menu
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between mb-6 pb-4 border-b">
      <div>
        <h1 className="text-2xl font-bold">Dashboard de Vendas</h1>
        {user && (
          <p className="text-sm text-muted-foreground">
            Bem-vindo, {user.displayName || user.email}
          </p>
        )}
      </div>

      {/* --- INÍCIO DO MENU MOBILE --- */}
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="#"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                {/* Pode adicionar um ícone ou iniciais aqui */}
                <span className="sr-only">AppVendas</span>
              </Link>
              {menuItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      {/* --- FIM DO MENU MOBILE --- */}
    </header>
  );
}