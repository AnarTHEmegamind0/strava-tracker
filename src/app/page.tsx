'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCredentials, setHasCredentials] = useState<boolean | null>(null);
  
  // Credentials form state
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError) {
      setError(`Нэвтрэх алдаа: ${urlError}`);
      window.history.replaceState({}, '', '/');
    }

    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if user is already logged in
      const authResponse = await fetch('/api/athlete');
      if (authResponse.ok) {
        router.push('/dashboard');
        return;
      }
      
      // Check if credentials are configured
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
      
      setHasCredentials(true);
      setClientId('');
      setClientSecret('');
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FC4C02] border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Шалгаж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-20">
          <div className="text-center mb-12">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="#FC4C02">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.03 13.828h4.169" />
                </svg>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Дасгалын бүртгэл
                </h1>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Strava-тай холбогдож,
              <span className="text-[#FC4C02]"> AI зөвлөгөө</span> аваарай
            </h2>

            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Өөрийн гүйлт, унадаг дугуй, алхалтын бүртгэлээ хянаж, хувийн зөвлөгөө аваарай.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-md mx-auto mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Main Card */}
          <div className="max-w-lg mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              {!hasCredentials ? (
                /* Step 1: Enter Credentials */
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#FC4C02] text-white flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Strava App тохируулах
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Өөрийн Strava Developer App-ийн мэдээллийг оруулна уу
                      </p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Strava Developer App үүсгэх заавар
                    </h4>
                    <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
                      <li>
                        <a 
                          href="https://www.strava.com/settings/api" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                        >
                          Strava API Settings
                        </a>
                        {' '}хуудас руу орно уу
                      </li>
                      <li>Create & Manage Your App дээр дарна уу</li>
                      <li>Application Name: Ямар нэг нэр (жишээ: My Training Log)</li>
                      <li>Category: Training, Visualization гэх мэт</li>
                      <li>
                        <strong>Authorization Callback Domain:</strong>{' '}
                        <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">localhost</code>
                        {' '}(эсвэл таны domain)
                      </li>
                      <li>Client ID болон Client Secret-ээ хуулж аваад доор оруулна уу</li>
                    </ol>
                  </div>

                  {/* Credentials Form */}
                  <form onSubmit={handleSaveCredentials} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Client ID
                      </label>
                      <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="12345"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FC4C02] focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Client Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showSecret ? 'text' : 'password'}
                          value={clientSecret}
                          onChange={(e) => setClientSecret(e.target.value)}
                          placeholder="••••••••••••••••"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FC4C02] focus:border-transparent transition-colors pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {showSecret ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={saving || !clientId || !clientSecret}
                      className="w-full py-3 px-4 bg-[#FC4C02] hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Хадгалж байна...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Хадгалах
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                /* Step 2: Connect to Strava */
                <div className="p-6 md:p-8">
                  {/* Success indicator */}
                  <div className="flex items-center gap-3 mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-300">
                        Strava App тохируулагдсан
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Одоо Strava-тай холбогдох боломжтой
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#FC4C02] text-white flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Strava-тай холбогдох
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Strava бүртгэлээрээ нэвтрэн орно уу
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-[#FC4C02] hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.03 13.828h4.169" />
                    </svg>
                    Strava-тай холбогдох
                  </button>

                  {/* Option to reconfigure */}
                  <button
                    onClick={() => setHasCredentials(false)}
                    className="w-full mt-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Өөр Strava App ашиглах
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-10">
          Юу хийж чадах вэ?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '📊', title: 'Дасгалын хяналт', desc: 'Бүх дасгалаа нэг дороос харах' },
            { icon: '📈', title: 'Статистик', desc: 'Долоо хоног, сарын дэлгэрэнгүй статистик' },
            { icon: '🤖', title: 'AI Зөвлөгөө', desc: 'Хувийн дасгалын төлөвлөгөө, зөвлөгөө' },
            { icon: '🎯', title: 'Зорилго', desc: 'Долоо хоног, сарын зорилго тогтоох' },
            { icon: '🏆', title: 'Хувийн рекорд', desc: '5км, 10км, марафон хамгийн сайн хугацаа' },
            { icon: '🔮', title: 'Уралдааны таамаглал', desc: 'Riegel томьёо ашиглан таамаглал' },
          ].map((feature, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
              <span className="text-3xl mb-3 block">{feature.icon}</span>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#FC4C02">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.03 13.828h4.169" />
            </svg>
            <span className="font-semibold text-gray-900 dark:text-white">Дасгалын бүртгэл</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Strava API & Groq AI ашигласан
          </p>
        </div>
      </footer>
    </main>
  );
}
