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
