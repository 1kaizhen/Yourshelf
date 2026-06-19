const API_BASE = import.meta.env.PUBLIC_API_URL;

export type GameLite = {
  igdb_id: number;
  name: string;
  slug: string;
  cover_url: string | null;
  year: number | null;
};

export type Company = { id: number; name: string };
export type GameRelation = { igdb_id: number; name: string };
export type HltbTimes = {
  main?: number | null;
  main_extra?: number | null;
  completionist?: number | null;
} | null;

export type GameDetail = GameLite & {
  summary: string | null;
  release_date: string | null;
  rating: number | null;
  rating_count: number | null;
  genres: string[];
  developers: Company[];
  publishers: Company[];
  dlcs: GameRelation[];
  expansions: GameRelation[];
  remakes: GameRelation[];
  remasters: GameRelation[];
  franchise_id: number | null;
  collection_id: number | null;
  hltb: HltbTimes;
};

export async function fetchGameDetail(id: number): Promise<GameDetail | null> {
  const res = await fetch(`${API_BASE}/api/games/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Game fetch failed: ${res.status}`);
  const { game } = (await res.json()) as { game: GameDetail };
  return game;
}

export async function fetchGameSeries(id: number): Promise<GameLite[]> {
  const res = await fetch(`${API_BASE}/api/games/${id}/series`);
  if (!res.ok) return [];
  const { series } = (await res.json()) as { series: GameLite[] };
  return series;
}

export type DiscoverParams = {
  genre?: string;
  theme?: string;
  developer?: string;
  publisher?: string;
  maxHours?: number;
  minHours?: number;
  sort?: 'rating' | 'release_date' | 'name';
  limit?: number;
};

export async function fetchDiscover(params: DiscoverParams = {}): Promise<GameLite[]> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '' && v !== null) qs.set(k, String(v));
  }
  const url = `${API_BASE}/api/discover?${qs.toString()}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[discover] ${res.status} ${res.statusText} for ${url} :: ${await res.text()}`);
      return [];
    }
    const { results } = (await res.json()) as { results: GameLite[] };
    return results;
  } catch (err) {
    console.warn(`[discover] fetch failed for ${url} :: ${(err as Error).message}`);
    return [];
  }
}

export type FeaturedPlatform = {
  key: 'windows' | 'playstation' | 'xbox' | 'switch' | 'mac';
  label: string;
};

export type FeaturedCard = {
  igdb_id: number;
  name: string;
  slug: string;
  cover_url: string | null;
  background_url: string;
  title_logo_url: string;
  blurb: string;
  rating: { value: string; source: string };
  hltb: { value: string; label: string };
  platforms: FeaturedPlatform[];
  extra_platform_count: number;
};

export async function fetchFeatured(): Promise<FeaturedCard | null> {
  const url = `${API_BASE}/api/featured`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const { featured } = (await res.json()) as { featured: FeaturedCard };
    return featured;
  } catch {
    return null;
  }
}

export type EnrichedCard = GameLite & {
  rating: number | null;
  rating_count: number | null;
  genres: string[];
  hours: number | null;
};

export async function fetchNewest(limit = 6): Promise<EnrichedCard[]> {
  try {
    const res = await fetch(`${API_BASE}/api/newest?limit=${limit}`);
    if (!res.ok) return [];
    const { cards } = (await res.json()) as { cards: EnrichedCard[] };
    return cards;
  } catch {
    return [];
  }
}

export type FreeGiveaway = {
  id: number;
  title: string;
  worth: string;
  thumbnail: string;
  image: string;
  description: string;
  url: string;
  platforms: string[];
  end_date: string | null;
};

export async function fetchFreeGames(limit = 6): Promise<FreeGiveaway[]> {
  try {
    const res = await fetch(`${API_BASE}/api/free-games?limit=${limit}`);
    if (!res.ok) return [];
    const body = (await res.json()) as { results?: FreeGiveaway[]; cards?: FreeGiveaway[]; games?: FreeGiveaway[] };
    const list = body.results ?? body.cards ?? body.games ?? [];
    return list.slice(0, limit);
  } catch {
    return [];
  }
}

export type BrowseCategory = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  covers: string[];
};

export async function fetchBrowseCategories(): Promise<BrowseCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/api/browse-categories`);
    if (!res.ok) return [];
    const { categories } = (await res.json()) as { categories: BrowseCategory[] };
    return categories;
  } catch {
    return [];
  }
}

export type CalendarGame = {
  igdb_id: number;
  name: string;
  slug: string;
  cover_url: string | null;
  hero_url: string | null;
  year: number | null;
  release_date: string;
  genres: string[];
};

export type CalendarDay = {
  date: string;
  day: number;
  month: string;
  weekday: string;
  games: CalendarGame[];
};

export async function fetchCalendar(days = 21): Promise<CalendarDay[]> {
  try {
    const res = await fetch(`${API_BASE}/api/calendar?days=${days}`);
    if (!res.ok) return [];
    const { calendar } = (await res.json()) as { calendar: CalendarDay[] };
    return calendar;
  } catch {
    return [];
  }
}

export async function fetchCardsByIds(ids: number[]): Promise<EnrichedCard[]> {
  if (ids.length === 0) return [];
  try {
    const res = await fetch(`${API_BASE}/api/cards?ids=${ids.join(',')}`);
    if (!res.ok) return [];
    const { cards } = (await res.json()) as { cards: EnrichedCard[] };
    return cards;
  } catch {
    return [];
  }
}

export async function fetchFeaturedList(): Promise<FeaturedCard[]> {
  const url = `${API_BASE}/api/featured/list`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const { featured } = (await res.json()) as { featured: FeaturedCard[] };
    return featured;
  } catch {
    return [];
  }
}

export async function fetchFeaturedRandom(count = 7): Promise<FeaturedCard[]> {
  const url = `${API_BASE}/api/featured/random?count=${count}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const { featured } = (await res.json()) as { featured: FeaturedCard[] };
    return featured;
  } catch {
    return [];
  }
}

export type PeoplesChoiceEntry = GameLite & { avg_rating: number; tracker_count: number };

export async function fetchPeoplesChoice(limit = 12): Promise<PeoplesChoiceEntry[]> {
  const url = `${API_BASE}/api/peoples-choice?limit=${limit}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[peoples-choice] ${res.status} ${res.statusText} :: ${await res.text()}`);
      return [];
    }
    const { results } = (await res.json()) as { results: PeoplesChoiceEntry[] };
    return results;
  } catch (err) {
    console.warn(`[peoples-choice] fetch failed :: ${(err as Error).message}`);
    return [];
  }
}

export async function fetchGamesByIds(ids: number[]): Promise<Map<number, GameLite>> {
  if (ids.length === 0) return new Map();
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const detail = await fetchGameDetail(id);
        if (!detail) return null;
        const lite: GameLite = {
          igdb_id: detail.igdb_id,
          name: detail.name,
          slug: detail.slug,
          cover_url: detail.cover_url,
          year: detail.year,
        };
        return lite;
      } catch {
        return null;
      }
    })
  );
  const map = new Map<number, GameLite>();
  for (const g of results) if (g) map.set(g.igdb_id, g);
  return map;
}
