// src/components/auth-provider.tsx
'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/client';
import { doc, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner'; // Importar o toast para notificar erros

// Interface para os dados do nosso usuário no Firestore
interface UserProfile {
  plan: 'Free' | 'Pro';
  subscriptionStatus?: string;
}

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: () => void = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Limpa qualquer listener anterior para evitar vazamento de memória
      unsubscribeSnapshot();

      setUser(user);

      if (user) {
        // Se há um usuário, escuta o perfil dele no Firestore
        const userRef = doc(db, 'users', user.uid);

        unsubscribeSnapshot = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
            } else {
              // Caso o documento não exista por algum motivo, define um perfil Free
              setUserProfile({ plan: 'Free' });
            }
            // A verificação de auth e perfil terminou
            setLoading(false);
          },
          (error) => {
            // NOVO: Captura de erro do listener do Firestore
            console.error('Erro ao buscar perfil do usuário:', error);
            toast.error('Erro ao carregar dados do usuário.');
            // Mesmo com erro, terminamos o carregamento para não travar a tela
            setLoading(false);
          },
        );
      } else {
        // Se não há usuário, não há perfil e o carregamento terminou
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, []);

  const value = { user, userProfile, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
