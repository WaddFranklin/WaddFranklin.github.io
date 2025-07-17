// src/components/auth-provider.tsx
'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { User, SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types'; // 1. IMPORTAMOS O TIPO DO BANCO

// O tipo do nosso contexto agora usa o SupabaseClient tipado
type AuthContextType = {
  user: User | null;
  loading: boolean;
  supabase: SupabaseClient<Database>; // 2. USAMOS O TIPO ESPECÍFICO AQUI
};

// Criamos um cliente Supabase inicial que será substituído
const supabase = createClient();

// O createContext agora espera o tipo correto e não dará mais erro
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  supabase,
});

// Componente Provedor
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = { user, loading, supabase };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook customizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
