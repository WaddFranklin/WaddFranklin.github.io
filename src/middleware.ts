// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          // Se o middleware definir um cookie, adicione-o aos cabeçalhos da resposta.
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          // Se o middleware remover um cookie, atualize os cabeçalhos da requisição e da resposta.
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // LINHA CRÍTICA:
  // Atualiza a sessão do usuário. Se o token de acesso tiver expirado,
  // ele tentará atualizá-lo usando o token de atualização.
  // Isso garante que a sessão esteja sempre válida.
  await supabase.auth.getUser();

  return response;
}

// Garante que o middleware rode em todas as rotas necessárias
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto as de arquivos estáticos,
     * API (começando com /api/) e a própria rota de autenticação do Next.js.
     */
    '/((?!_next/static|_next/image|favicon.ico|api|auth).*)',
  ],
};