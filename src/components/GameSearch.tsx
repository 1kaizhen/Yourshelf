import { useEffect, useState } from 'react';

type GameLite = {
  igdb_id: number;
  name: string;
  slug: string;
  cover_url: string | null;
  year: number | null;
};

const API_BASE = import.meta.env.PUBLIC_API_URL;

export default function GameSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<GameLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!q.trim()) { setResults([]); setError(null); return; }
    const ac = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(q)}`, {
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = (await res.json()) as { results: GameLite[] };
        setResults(data.results);
        setError(null);
      } catch (e: unknown) {
        if ((e as Error).name !== 'AbortError') setError('Search failed');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { ac.abort(); clearTimeout(timer); };
  }, [q]);

  return (
    <div className="search">
      <input
        type="search"
        placeholder="Search games…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      {loading && <p className="hint">Searching…</p>}
      {error && <p className="hint err">{error}</p>}
      {!loading && q && results.length === 0 && !error && <p className="hint">No matches.</p>}

      <ul className="grid">
        {results.map((g) => (
          <li key={g.igdb_id}>
            <a href={`/games/${g.igdb_id}`}>
              {g.cover_url ? (
                <img src={g.cover_url} alt="" loading="lazy" />
              ) : (
                <div className="placeholder" />
              )}
              <div className="meta">
                <div className="name">{g.name}</div>
                {g.year && <div className="year">{g.year}</div>}
              </div>
            </a>
          </li>
        ))}
      </ul>

      <style>{`
        .search input {
          width: 100%; padding: 0.85rem 1rem;
          background: #0b0d10; border: 1px solid #2a3038;
          border-radius: 10px; color: #e6e8eb; font-size: 1rem;
        }
        .search input:focus { outline: none; border-color: #6366f1; }
        .hint { color: #9aa3ad; font-size: 0.9rem; margin: 0.75rem 0 0; }
        .hint.err { color: #ff8a93; }
        .grid {
          list-style: none; padding: 0; margin: 1.5rem 0 0;
          display: grid; gap: 1rem;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
        .grid a {
          display: block; text-decoration: none; color: inherit;
          background: #11151a; border: 1px solid #1f242b; border-radius: 10px;
          overflow: hidden; transition: border-color 0.15s, transform 0.15s;
        }
        .grid a:hover { border-color: #6366f1; transform: translateY(-2px); }
        .grid img, .placeholder {
          width: 100%; aspect-ratio: 3 / 4; object-fit: cover;
          background: #1a1f26; display: block;
        }
        .meta { padding: 0.6rem 0.75rem; }
        .name { font-size: 0.9rem; font-weight: 500; line-height: 1.3; }
        .year { font-size: 0.8rem; color: #9aa3ad; margin-top: 0.2rem; }
      `}</style>
    </div>
  );
}
