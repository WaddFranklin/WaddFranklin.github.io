'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { User, SupabaseClient } from '@supabase/supabase-js';
// ATUALIZADO: Importa do novo caminho
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/database.types';

type Profile = Database['appvendas']['Tables']['profiles']['Row'];

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  supabase: SupabaseClient<Database>;
};

const supabase = createClient();

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  supabase,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Erro ao buscar perfil:", error);
        }
        
        setProfile(data);
      } else {
        setProfile(null);
      }

      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = { user, profile, loading, supabase };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};