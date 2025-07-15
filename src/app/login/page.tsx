// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Corrigido: sem importar FirebaseError
import { auth } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) {
      // Abordagem correta: verificamos se o erro tem a propriedade 'code'
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string }; // Agora podemos usar 'code' com segurança
        console.error('Erro no login:', firebaseError.code);
        if (firebaseError.code === 'auth/invalid-credential') {
          setError('E-mail ou senha inválidos. Tente novamente.');
        } else {
          setError('Ocorreu um erro ao tentar fazer login.');
        }
      } else {
        // Para erros que não são do Firebase
        console.error('Erro inesperado:', err);
        setError('Ocorreu um erro inesperado.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Insira seu e-mail e senha para acessar o sistema.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
          </CardContent>
          <CardFooter className="mt-4">
            <Button className="w-full" type="submit">
              Entrar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
