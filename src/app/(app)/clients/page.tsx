// src/app/(app)/clients/page.tsx
'use client';

import { ClientsDashboard } from '@/components/clients-dashboard';

export default function ClientsPage() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
        <p className="text-sm text-muted-foreground">
          Visualize todos os seus clientes cadastrados.
        </p>
      </div>
      <ClientsDashboard />
    </>
  );
}
