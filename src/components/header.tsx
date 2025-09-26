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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Menu, LogOut, Package2 } from 'lucide-react';

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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-[280px] flex-col p-0">
          <div className="flex h-14 items-center border-b px-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span className="text-lg">AppVendas</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start gap-1 p-2 text-base font-medium">
              {menuItems.map(({ href, label, icon: Icon }) => (
                <SheetClose asChild key={label}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </div>
          <div className="mt-auto border-t p-2">
            <SheetClose asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-base font-medium"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 text-right">
        {user && (
          <p className="text-sm text-muted-foreground hidden sm:block">
            Bem-vindo, {user.displayName || user.email}
          </p>
        )}
      </div>
    </header>
  );
}