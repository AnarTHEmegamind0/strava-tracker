'use client';

import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/context';
import DashboardHeader from '@/components/layout/DashboardHeader';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const quickPrompts = [
  { label: 'Долоо хоногийн тойм', prompt: 'Энэ долоо хоногийн дасгалын тоймыг өгнө үү' },
  { label: 'Дасгалын зөвлөмж', prompt: 'Миний сүүлийн дасгалуудад үндэслэн ямар зөвлөмж өгөх вэ?' },
  { label: 'Гүйцэтгэлийн шинжилгээ', prompt: 'Миний сүүлийн гүйцэтгэлийг шинжилж, сайжруулах зөвлөмж өгнө үү' },
  { label: 'Нөхөн сэргээх', prompt: 'Миний дасгалын ачааллаас харахад ямар нөхөн сэргэлтийн зөвлөмж өгөх вэ?' },
  { label: 'Зорилго тавих', prompt: 'Миний одоогийн түвшинд үндэслэн бодитой фитнесийн зорилго тавихад тусална уу' },
  { label: 'Ахиц харьцуулах', prompt: 'Миний сүүлийн дасгалууд өмнөх долоо хоногуудтай хэрхэн харьцуулагдаж байна?' },
];

export default function CoachPage() {
  const { athlete, activities } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [trainigPlan, setTrainingPlan] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await fetch('/api/chat');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Алдаа: ${data.error}` },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.message },
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Уучлаарай, алдаа гарлаа. Дахин оролдоно уу.' },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    try {
      await fetch('/api/chat', { method: 'DELETE' });
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  const generateTrainingPlan = async () => {
    setGeneratingPlan(true);
    setTrainingPlan(null);
    try {
      const response = await fetch('/api/ai/training-plan', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setTrainingPlan(data.plan);
      }
    } catch (err) {
      console.error('Failed to generate training plan:', err);
    } finally {
      setGeneratingPlan(false);
    }
  };

  // Activity stats for sidebar
  const recentActivities = activities.slice(0, 5);
  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0) / 1000;
  const totalActivities = activities.length;

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader athlete={athlete} title="AI Дасгалжуулагч" />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  AI Фитнес Дасгалжуулагч
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                  Би таны Strava дасгалуудыг шинжилж, дасгалын зөвлөмж өгч, фитнесийн зорилгодоо хүрэхэд тусална.
                </p>
                
                {/* Quick Prompts */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl">
                  {quickPrompts.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => sendMessage(item.prompt)}
                      className="p-3 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#FC4C02] hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-[#FC4C02] text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🤖</span>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">AI Дасгалжуулагч</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🤖</span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Дасгалынхаа талаар асуугаарай..."
                    rows={1}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#FC4C02] placeholder-gray-400"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="p-3 bg-[#FC4C02] hover:bg-[#e34402] disabled:opacity-50 text-white rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              {messages.length > 0 && (
                <div className="mt-2 text-center">
                  <button
                    onClick={clearChat}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    Яриаг устгах
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Activity Context */}
        <div className="hidden lg:block w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Таны дасгалын мэдээлэл</h3>
          
          {/* Quick Stats */}
          <div className="space-y-3 mb-6">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">Нийт зай</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{totalDistance.toFixed(1)} км</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">Дасгалууд</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{totalActivities}</p>
            </div>
          </div>

          {/* Training Plan Button */}
          <div className="mb-6">
            <button
              onClick={generateTrainingPlan}
              disabled={generatingPlan}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#FC4C02] to-red-500 text-white rounded-xl hover:from-[#e34402] hover:to-red-600 disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2"
            >
              {generatingPlan ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Үүсгэж байна...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  7 хоногийн төлөвлөгөө
                </>
              )}
            </button>
          </div>

          {/* Training Plan Display */}
          {trainigPlan && (
            <div className="mb-6 p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>📋</span> Таны төлөвлөгөө
                </h4>
                <button
                  onClick={() => setTrainingPlan(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto">
                {trainigPlan}
              </div>
            </div>
          )}

          {/* Recent Activities */}
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Сүүлийн дасгалууд</h4>
          <div className="space-y-2">
            {recentActivities.map((activity) => (
              <div
                key={activity.strava_id}
                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm"
              >
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {activity.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(activity.distance / 1000).toFixed(2)} км • {activity.type}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
