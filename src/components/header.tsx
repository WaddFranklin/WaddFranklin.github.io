// src/components/header.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from './auth-provider';
import { menuItems } from './nav-menu';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';

import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      toast.error('Erro ao tentar sair.');
      console.error(error);
    }
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      {/* --- INÍCIO DO MENU MOBILE --- */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu de navegação</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold mb-4"
            >
              <span>AppVendas</span>
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
          <div className="mt-auto">
             <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-4 h-5 w-5" />
                Sair
              </Button>
          </div>
        </SheetContent>
      </Sheet>
      {/* --- FIM DO MENU MOBILE --- */}

      <div className="w-full flex-1 text-center sm:text-left">
         <h1 className="text-2xl font-bold">Dashboard de Vendas</h1>
         {user && (
           <p className="text-sm text-muted-foreground">
             Bem-vindo, {user.displayName || user.email}
           </p>
         )}
      </div>
    </header>
  );
}