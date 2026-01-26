'use client';

import { useState } from 'react';

export default function GoalSuggestions() {
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchSuggestions = async () => {
    if (suggestions) {
      setIsExpanded(!isExpanded);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/suggest-goals');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
        setIsExpanded(true);
      } else {
        setError('Зорилго санал болгох боломжгүй байна');
      }
    } catch (err) {
      console.error('Failed to fetch goal suggestions:', err);
      setError('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
      <button
        onClick={fetchSuggestions}
        disabled={loading}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              AI зорилго санал болгох
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Таны дасгалын түүхэнд үндэслэн ухаалаг зорилго санал болгоно
            </p>
          </div>
        </div>
        
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent" />
        ) : (
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && suggestions && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-purple-200 dark:border-purple-800 pt-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {suggestions}
                </div>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Дээрх зорилгуудаас сонгон нэмэх боломжтой
              </p>
              <button
                onClick={() => {
                  setSuggestions(null);
                  fetchSuggestions();
                }}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Дахин санал авах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="px-4 pb-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
