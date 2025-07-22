// src/components/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Importações do Firebase
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';

import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  User,
  History,
  LogOut,
  FileText,
  Menu,
  PanelLeft,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '#', label: 'Minhas Vendas', icon: FileText },
  { href: '#', label: 'Histórico', icon: History },
  { href: '#', label: 'Meu Perfil', icon: User },
];

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
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
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'hidden h-screen flex-col border-r bg-background sm:flex transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-64',
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold"
            onClick={() => setIsCollapsed(false)}
          >
            {!isCollapsed && <span className="ml-2">AppVendas</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto">
          <nav className="grid items-start gap-1 px-4 py-4 text-sm font-medium">
            {menuItems.map(({ href, label, icon: Icon }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    onClick={() => {
                      if (href === '/' && isCollapsed) {
                        setIsCollapsed(false);
                      }
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                      isCollapsed && 'justify-center',
                      pathname === href && 'bg-muted text-primary',
                      href === '#' && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {!isCollapsed && <span>{label}</span>}
                    <span className="sr-only">{label}</span>
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">{label}</TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>

          <div className="px-4 py-4 border-t mt-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start',
                    isCollapsed && 'justify-center',
                  )}
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  {!isCollapsed && <span className="ml-3">Sair</span>}
                  <span className="sr-only">Sair</span>
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">Sair</TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
