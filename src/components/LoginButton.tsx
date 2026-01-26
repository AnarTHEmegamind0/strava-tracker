'use client';

export default function LoginButton() {
  const handleLogin = () => {
    window.location.href = '/api/auth/strava';
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-3 bg-[#FC4C02] hover:bg-[#e34402] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.03 13.828h4.169" />
      </svg>
      Connect with Strava
    </button>
  );
}
