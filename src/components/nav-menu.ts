// src/components/nav-menu.ts
import {
  LayoutDashboard,
  Wheat,
  History,
  User,
  Building2,
  Users,
} from 'lucide-react'; // 1. Importar o ícone Users

export const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/flours', label: 'Farinhas', icon: Wheat },
  { href: '/bakeries', label: 'Padarias', icon: Building2 },
  { href: '/clients', label: 'Clientes', icon: Users }, // 2. Adicionar nova linha para Clientes
  { href: '#', label: 'Histórico', icon: History },
  { href: '#', label: 'Meu Perfil', icon: User },
];
