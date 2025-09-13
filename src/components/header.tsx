// src/components/header.tsx
'use client';

import { useAuth } from './auth-provider';
import { Button } from './ui/button';
import { Menu } from 'lucide-react'; // 1. "PanelLeft" foi removido daqui

interface HeaderProps {
  onMenuClick: () => void;
  isDesktopSidebarCollapsed: boolean;
  toggleDesktopSidebar: () => void;
}

export default function Header({
  onMenuClick,
  isDesktopSidebarCollapsed,
  toggleDesktopSidebar,
}: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Button
        size="icon"
        variant="outline"
        className="sm:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Abrir menu</span>
      </Button>

      {isDesktopSidebarCollapsed && (
        <Button
          size="icon"
          variant="outline"
          className="hidden sm:inline-flex"
          onClick={toggleDesktopSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Expandir menu</span>
        </Button>
      )}

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
