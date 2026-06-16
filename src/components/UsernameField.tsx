import { useEffect, useState } from 'react';
import { supabaseBrowser } from '../lib/supabase/browser';

type Status = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const USERNAME_RE = /^[a-zA-Z0-9_-]{2,30}$/;
const RESERVED = new Set([
  'login', 'signup', 'logout', 'verify', 'profile', 'my-games',
  'admin', 'api', 'auth', 'settings', 'about', 'help', 'support',
]);

export default function UsernameField() {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (!value) { setStatus('idle'); return; }
    if (!USERNAME_RE.test(value) || RESERVED.has(value.toLowerCase())) {
      setStatus('invalid');
      return;
    }
    setStatus('checking');
    const timer = setTimeout(async () => {
      const { data } = await supabaseBrowser
        .from('profiles')
        .select('id')
        .ilike('username', value)
        .maybeSingle();
      setStatus(data ? 'taken' : 'available');
    }, 350);
    return () => clearTimeout(timer);
  }, [value]);

  const message = {
    idle: '',
    invalid: '2–30 chars: letters, numbers, _ or -. No reserved names.',
    checking: 'Checking…',
    available: `✓ ${value} is available`,
    taken: `✗ ${value} is already taken`,
  }[status];

  const color = {
    idle: '#9aa3ad',
    invalid: '#ff8a93',
    checking: '#9aa3ad',
    available: '#6fdb9b',
    taken: '#ff8a93',
  }[status];

  return (
    <>
      <input
        name="username"
        defaultValue=""
        onInput={(e) => setValue((e.target as HTMLInputElement).value)}
        required
        autoComplete="username"
        minLength={2}
        maxLength={30}
      />
      <small style={{ display: 'block', marginTop: '0.25rem', color, minHeight: '1.1em' }}>
        {message}
      </small>
    </>
  );
}
