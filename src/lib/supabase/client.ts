// src/lib/supabaseClient.ts

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../database.types'; // Importa os tipos do banco de dados

export function createClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas');
  }

  // Informa ao cliente a estrutura do nosso banco de dados através do tipo 'Database'
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
