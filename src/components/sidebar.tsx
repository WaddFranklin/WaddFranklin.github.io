// src/components/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import { menuItems } from './nav-menu';
import { useAuth } from './auth-provider'; // 1. Importar o useAuth

import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LogOut, Menu, PanelLeft } from 'lucide-react';
import { Badge } from './ui/badge'; // 2. Importar o Badge

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile } = useAuth(); // 3. Pegar o userProfile

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
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            {!isCollapsed && (
              <div className="flex flex-col items-start">
                <span className="ml-2">AppVendas</span>
                {/* --- INÍCIO DA ALTERAÇÃO --- */}
                {userProfile && (
                  <Badge
                    variant={
                      userProfile.plan === 'Pro' ? 'default' : 'secondary'
                    }
                    className="ml-2 mt-1 h-5 text-xs"
                  >
                    {userProfile.plan}
                  </Badge>
                )}
                {/* --- FIM DA ALTERAÇÃO --- */}
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
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
          {/* O código da navegação (nav) permanece o mesmo */}
          <nav className="grid items-start gap-1 px-4 py-4 text-sm font-medium">
            {menuItems.map(({ href, label, icon: Icon, isDisabled }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Link
                    href={isDisabled ? '#' : href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                      isCollapsed && 'justify-center',
                      pathname === href && 'bg-muted text-primary',
                      isDisabled && 'cursor-not-allowed opacity-50',
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

          {/* O código do rodapé (logout) permanece o mesmo */}
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
