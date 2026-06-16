import type { APIRoute } from 'astro';

const STATUSES = ['wishlist', 'backlog', 'playing', 'completed', 'dropped'] as const;
type Status = (typeof STATUSES)[number];

export const POST: APIRoute = async (context) => {
  const { supabase, user } = context.locals;
  if (!user) return context.redirect('/login');

  const form = await context.request.formData();
  const action = String(form.get('action') ?? '');
  const igdbId = Number(form.get('igdb_id') ?? 0);
  const redirectTo = String(form.get('redirect_to') ?? '/my-games');

  if (!Number.isInteger(igdbId) || igdbId <= 0) {
    return new Response('Bad request', { status: 400 });
  }

  if (action === 'delete') {
    await supabase.from('user_games').delete().eq('user_id', user.id).eq('igdb_id', igdbId);
    return context.redirect(redirectTo);
  }

  if (action === 'set_status') {
    const status = String(form.get('status') ?? '') as Status;
    if (!STATUSES.includes(status)) return new Response('Bad status', { status: 400 });
    await supabase
      .from('user_games')
      .upsert(
        { user_id: user.id, igdb_id: igdbId, status, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,igdb_id' }
      );
    return context.redirect(redirectTo);
  }

  if (action === 'update_meta') {
    const ratingRaw = form.get('rating');
    const rating = ratingRaw === null || ratingRaw === '' ? null : Number(ratingRaw);
    const notes = String(form.get('notes') ?? '').slice(0, 2000) || null;
    if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 10)) {
      return new Response('Bad rating', { status: 400 });
    }
    await supabase
      .from('user_games')
      .update({ rating, notes, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('igdb_id', igdbId);
    return context.redirect(redirectTo);
  }

  return new Response('Unknown action', { status: 400 });
};
