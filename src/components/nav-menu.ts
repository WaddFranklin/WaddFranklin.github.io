// src/components/nav-menu.ts
import {
  LayoutDashboard,
  Wheat,
  Building2,
  Users,
  Crown, // 1. Importar o ícone Crown
  User,
} from 'lucide-react';

export const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/flours', label: 'Farinhas', icon: Wheat },
  { href: '/bakeries', label: 'Padarias', icon: Building2 },
  { href: '/clients', label: 'Clientes', icon: Users },
  // 2. Adicionar o novo item de menu para a assinatura
  { href: '/assinatura', label: 'Assinatura', icon: Crown },
  { href: '#', label: 'Meu Perfil', icon: User, isDisabled: true }, // Adicionei isDisabled para clareza
];
