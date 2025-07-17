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

// O tipo do nosso contexto agora também pode incluir o cliente Supabase
type AuthContextType = {
  user: User | null;
  loading: boolean;
  supabase: SupabaseClient;
};

// Criamos um cliente Supabase inicial que será substituído
const supabase = createClient();
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
    // A função onAuthStateChange do Supabase retorna um objeto com uma propriedade `subscription`
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // O 'session' contém as informações do usuário logado
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // A função de limpeza é retornada pela propriedade subscription
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
