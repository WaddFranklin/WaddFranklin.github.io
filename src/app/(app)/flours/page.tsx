// src/app/(app)/flours/page.tsx
'use client';

import { FloursDashboard } from '@/components/flours-dashboard';

export default function FloursPage() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Gestão de Farinhas</h1>
        <p className="text-sm text-muted-foreground">
          Adicione, edite ou remova os tipos de farinha.
        </p>
      </div>
      <FloursDashboard />
    </>
  );
}