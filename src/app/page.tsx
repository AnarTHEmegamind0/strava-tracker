'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const STRAVA_GIF_URL = '/strava.gif';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCredentials, setHasCredentials] = useState<boolean | null>(null);

  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [saving, setSaving] = useState(false);
  const [gifFailed, setGifFailed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');

    if (urlError) {
      setError(`Нэвтрэх алдаа: ${urlError}`);
      window.history.replaceState({}, '', '/');
    }

    const checkAuth = async () => {
      try {
        const authResponse = await fetch('/api/athlete');
        if (authResponse.ok) {
          router.push('/dashboard');
          return;
        }

        const credResponse = await fetch('/api/settings/credentials');
        if (credResponse.ok) {
          const data = await credResponse.json();
          setHasCredentials(data.configured);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setChecking(false);
      }
    };

    void checkAuth();
  }, [router]);

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/settings/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, clientSecret }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save credentials');
      }

      handleLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save credentials');
    } finally {
      setSaving(false);
    }
  };

  const handleLogin = () => {
    window.location.href = '/api/auth/strava';
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#FC4C02] border-t-transparent" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Шалгаж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ffe8db_0%,#ffffff_50%,#ffffff_100%)] px-3 py-4 dark:bg-[radial-gradient(circle_at_top,#331506_0%,#09090b_50%,#09090b_100%)] sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-black/5 bg-white/95 shadow-[0_24px_80px_rgba(0,0,0,0.1)] backdrop-blur dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-[0_24px_90px_rgba(0,0,0,0.55)]">
        <div className="relative h-[44vh] min-h-[300px] w-full max-h-[480px] bg-gradient-to-br from-[#FC4C02] via-[#ff6b2c] to-[#ff9158]">
          {!gifFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={STRAVA_GIF_URL}
              alt="Strava preview"
              className="h-full w-full object-cover"
              onError={() => setGifFailed(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white">strava.gif</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
              Strava-тай холбогдох
            </h1>
            <p className="mt-1 text-sm text-white/90 sm:text-base">
              Client түлхүүрээ оруулаад Enter дарна
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-2xl space-y-5 p-5 sm:p-8">
          <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
              <a
                href="https://www.strava.com/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#FC4C02] underline-offset-4 hover:underline"
              >
                Strava API Settings
              </a>{' '}
              хэсгээс `Client ID` болон `Client Secret` аваад оруулна уу.
          </p>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          {hasCredentials ? (
            <button
              onClick={handleLogin}
              className="w-full rounded-xl bg-[#FC4C02] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[#e54501]"
            >
              Enter
            </button>
          ) : (
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <label htmlFor="client-id" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Client ID
                </label>
                <input
                  id="client-id"
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="12345"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 outline-none transition focus:border-[#FC4C02] focus:ring-2 focus:ring-[#FC4C02]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="client-secret" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Client Secret
                </label>
                <input
                  id="client-secret"
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="••••••••••••••••"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 outline-none transition focus:border-[#FC4C02] focus:ring-2 focus:ring-[#FC4C02]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={saving || !clientId || !clientSecret}
                className="w-full rounded-xl bg-[#FC4C02] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[#e54501] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {saving ? 'Түр хүлээнэ үү...' : 'Enter'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
