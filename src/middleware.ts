// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Cria uma resposta inicial que podemos modificar.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Cria um cliente Supabase que pode rodar no servidor (no middleware).
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // CORREÇÃO: Usando a nova API de cookies recomendada.
      // Esta abordagem é mais limpa e resolve o aviso de 'deprecated'.
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // A nova abordagem lida com a atualização dos cookies diretamente na resposta.
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // A nova abordagem lida com a remoção dos cookies diretamente na resposta.
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // A LINHA MAIS IMPORTANTE:
  // Tenta buscar a sessão do usuário. Se o token estiver expirado,
  // o Supabase irá tentar renová-lo usando o Refresh Token, mantendo a sessão ativa.
  await supabase.auth.getSession();

  // Retorna a resposta, possivelmente com os cookies de sessão atualizados.
  return response;
}

// Configuração que diz ao Next.js para rodar este middleware em todas as rotas,
// exceto as de arquivos estáticos (imagens, css, etc.).
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
