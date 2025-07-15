// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from '@/components/ui/sonner'; // ATENÇÃO: Importa de 'ui/sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Controle de Vendas',
  description: 'Aplicação para controle de vendas de farinhas',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable,
        )}
      >
        <AuthProvider>
          {children}
          <Toaster richColors /> {/* Adiciona o Sonner aqui */}
        </AuthProvider>
      </body>
    </html>
  );
}
