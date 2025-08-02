// src/components/nav-menu.ts
import { LayoutDashboard, Wheat, History, User, Building2 } from 'lucide-react';

export const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/flours', label: 'Farinhas', icon: Wheat },
  { href: '/bakeries', label: 'Padarias', icon: Building2 },
  { href: '#', label: 'Histórico', icon: History },
  { href: '#', label: 'Meu Perfil', icon: User },
];
