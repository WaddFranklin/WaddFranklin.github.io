import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function LogoutPage() {
  const supabase = createServerComponentClient({ cookies });
  await supabase.auth.signOut();
  redirect('/login');
}