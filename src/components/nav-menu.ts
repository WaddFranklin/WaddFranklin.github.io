// src/components/nav-menu.ts
import {
  LayoutDashboard,
  Wheat,
  History,
  User,
  Building2,
  Users,
  Star,
} from 'lucide-react'; // 1. Importar o ícone Users

export const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/flours', label: 'Farinhas', icon: Wheat },
  { href: '/bakeries', label: 'Padarias', icon: Building2 },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/pro', label: 'Plano PRO', icon: Star },
  { href: '#', label: 'Histórico', icon: History },
  { href: '#', label: 'Meu Perfil', icon: User },
];
