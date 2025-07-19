// src/app/page.tsx
'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/protected-route';
import Header from '@/components/header';
import { SalesDashboard } from '@/components/sales-dashboard';
import { Sidebar } from '@/components/sidebar';

export default function HomePage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full bg-muted/40">
        {/* Passamos apenas o estado e a função para o Sidebar */}
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className="flex flex-1 flex-col">
          {/* O Header não precisa mais de props */}
          <main className="flex-1 p-4 sm:p-6">
            <Header />
            <SalesDashboard />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
