import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../lib/supabase/server';

const handler: APIRoute = async (context) => {
  const supabase = createSupabaseServerClient(context);
  await supabase.auth.signOut();
  return context.redirect('/');
};

export const GET = handler;
export const POST = handler;
