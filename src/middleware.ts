import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase/server';

const PROTECTED_PATHS = ['/profile', '/my-games'];
const AUTH_PATHS = ['/login', '/signup'];

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient(context);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  context.locals.supabase = supabase;
  context.locals.user = user;

  const { pathname } = context.url;
  const isProtected = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isAuthPage = AUTH_PATHS.includes(pathname);

  if (isProtected && !user) {
    return context.redirect('/login');
  }
  if (isAuthPage && user) {
    return context.redirect('/profile');
  }

  return next();
});
