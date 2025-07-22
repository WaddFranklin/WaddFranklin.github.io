'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, SignUpFormValues } from '@/lib/types';
import { toast } from 'sonner';

// Importações do Firebase Auth
import { auth } from '@/lib/firebase/client';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const handleSignUp = async (values: SignUpFormValues) => {
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );

      await updateProfile(userCredential.user, {
        displayName: values.fullName,
      });

      toast.success('Cadastro realizado com sucesso!', {
        description: 'Você será redirecionado para o login.',
      });
      router.push('/login');
    } catch (error) {
      if (error instanceof FirebaseError) {
        toast.error('Erro no cadastro', {
          description: error.message,
        });
      } else {
        toast.error('Erro no cadastro', {
          description: 'Ocorreu um erro inesperado.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>
            Insira seus dados para criar uma nova conta.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSignUp)}>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <Label>Nome Completo</Label>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label>E-mail</Label>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label>Senha</Label>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="mt-4 flex flex-col gap-4">
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </CardFooter>
          </form>
        </Form>
        <div className="text-center text-sm">
          Já tem uma conta?{' '}
          <Link href="/login" className="underline">
            Fazer login
          </Link>
        </div>
      </Card>
    </div>
  );
}
