// src/app/flours/page.tsx
'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/protected-route';
import Header from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { FloursDashboard } from '@/components/flours-dashboard'; // Componente que vamos criar

export default function FloursPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-4 sm:p-6">
            {/* Podemos reutilizar o Header ou criar um específico */}
            <header className="mb-6 pb-4 border-b">
                <h1 className="text-2xl font-bold">Gestão de Farinhas</h1>
                <p className="text-sm text-muted-foreground">
                    Adicione, edite ou remova os tipos de farinha.
                </p>
            </header>
            <FloursDashboard />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}