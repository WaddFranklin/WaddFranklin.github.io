// src/components/app-shell.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from './sidebar';
import Header from './header';
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { menuItems } from './nav-menu';
import { Button } from './ui/button';
import { LogOut, Package2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pathname = usePathname();
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
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
      />

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="flex w-[280px] flex-col p-0">
          <SheetHeader className="h-14 items-center border-b px-4">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <SheetTitle className="text-lg">AppVendas</SheetTitle>
            </Link>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start gap-1 p-2 text-base font-medium">
              {menuItems.map(({ href, label, icon: Icon }) => (
                <SheetClose asChild key={label}>
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                      pathname === href && 'bg-muted text-primary',
                      href === '#' && 'cursor-not-allowed opacity-50',
                    )}
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

      <div className="flex flex-1 flex-col">
        {/* 1. Passando as novas propriedades para o Header */}
        <Header
          onMenuClick={() => setIsMobileMenuOpen(true)}
          isDesktopSidebarCollapsed={isCollapsed}
          toggleDesktopSidebar={() => setIsCollapsed(!isCollapsed)}
        />
        <main className="flex-1 space-y-6 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
