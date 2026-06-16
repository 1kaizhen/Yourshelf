import { createServerClient, parseCookieHeader, type CookieOptionsWithName } from '@supabase/ssr';
import type { APIContext, AstroGlobal } from 'astro';

type Ctx = APIContext | AstroGlobal;

const COOKIE_OPTIONS: CookieOptionsWithName = {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
};

export function createSupabaseServerClient(context: Ctx) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookieOptions: COOKIE_OPTIONS,
      cookies: {
        getAll() {
          const header = context.request.headers.get('Cookie') ?? '';
          return parseCookieHeader(header).map(({ name, value }) => ({
            name,
            value: value ?? '',
          }));
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            context.cookies.set(name, value, { ...COOKIE_OPTIONS, ...options });
          }
        },
      },
    }
  );
}
