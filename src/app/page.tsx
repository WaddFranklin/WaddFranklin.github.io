// app/page.tsx
import ProtectedRoute from '@/components/protected-route';
import Header from '@/components/header';
import { SalesDashboard } from '@/components/sales-dashboard';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <main className="container mx-auto p-4 md:p-8">
        <Header />
        <SalesDashboard />
      </main>
    </ProtectedRoute>
  );
}
