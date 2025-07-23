// src/app/(app)/page.tsx
'use client';

import { SalesDashboard } from '@/components/sales-dashboard';

export default function HomePage() {
  return (
    <>
      {/* O Título da Página agora vive aqui, e não no Header global */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard de Vendas</h1>
        <p className="text-sm text-muted-foreground">
          Visualize e gerencie as suas vendas.
        </p>
      </div>
      
      {/* O componente principal do dashboard */}
      <SalesDashboard />
    </>
  );
}