'use client';

import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/context';
import DashboardHeader from '@/components/layout/DashboardHeader';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  hasPlan?: boolean; // Flag to show if this message contains a training plan
}

interface TrainingPlanConfig {
  duration: number;
  durationType: 'weeks' | 'days';
  goalType: string;
  targetDate?: string;
}

const quickPrompts = [
  { label: '📋 Төлөвлөгөө гаргах', prompt: 'Надад дасгалын төлөвлөгөө хэрэгтэй байна' },
  { label: 'Долоо хоногийн тойм', prompt: 'Энэ долоо хоногийн дасгалын тоймыг өгнө үү' },
  { label: 'Дасгалын зөвлөмж', prompt: 'Миний сүүлийн дасгалуудад үндэслэн ямар зөвлөмж өгөх вэ?' },
  { label: 'Гүйцэтгэлийн шинжилгээ', prompt: 'Миний сүүлийн гүйцэтгэлийг шинжилж, сайжруулах зөвлөмж өгнө үү' },
  { label: 'Нөхөн сэргээх', prompt: 'Миний дасгалын ачааллаас харахад ямар нөхөн сэргэлтийн зөвлөмж өгөх вэ?' },
  { label: 'Зорилго тавих', prompt: 'Миний одоогийн түвшинд үндэслэн бодитой фитнесийн зорилго тавихад тусална уу' },
];

const goalTypes = [
  { value: 'general', label: 'Ерөнхий фитнесс' },
  { value: '5k', label: '5км уралдаан' },
  { value: '10k', label: '10км уралдаан' },
  { value: 'half_marathon', label: 'Хагас марафон' },
  { value: 'marathon', label: 'Марафон' },
  { value: 'weight_loss', label: 'Жин хасах' },
  { value: 'endurance', label: 'Тэсвэр нэмэгдүүлэх' },
];

export default function CoachPage() {
  const { athlete, activities } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [trainingPlan, setTrainingPlan] = useState<string | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  const [savingPlanFromChat, setSavingPlanFromChat] = useState<number | null>(null); // Message index being saved
  const [savedPlanIndices, setSavedPlanIndices] = useState<Set<number>>(new Set());
  const [showPlanConfig, setShowPlanConfig] = useState(false);
  const [planConfig, setPlanConfig] = useState<TrainingPlanConfig>({
    duration: 4,
    durationType: 'weeks',
    goalType: 'general',
  });
  const messagesContainerRef = useRef<HTMLDivElement>(null);
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
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
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
        // Check if message contains a training plan
        const hasPlan = data.message.includes('[PLAN_READY]');
        const cleanedMessage = data.message.replace('[PLAN_READY]', '').trim();
        
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: cleanedMessage, hasPlan },
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
    setPlanSaved(false);
    setShowPlanConfig(false);
    try {
      const response = await fetch('/api/ai/training-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration: planConfig.duration,
          durationType: planConfig.durationType,
          goalType: planConfig.goalType,
          targetDate: planConfig.targetDate,
        }),
      });
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

  const savePlan = async () => {
    if (!trainingPlan) return;
    setSavingPlan(true);
    try {
      const durationText = planConfig.durationType === 'weeks' 
        ? `${planConfig.duration} долоо хоног` 
        : `${planConfig.duration} өдөр`;
      const goalLabel = goalTypes.find(g => g.value === planConfig.goalType)?.label || planConfig.goalType;
      
      const response = await fetch('/api/training-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${goalLabel} - ${durationText}`,
          description: `${goalLabel} зорилготой ${durationText} төлөвлөгөө`,
          duration: planConfig.duration,
          durationType: planConfig.durationType,
          goalType: planConfig.goalType,
          content: trainingPlan,
        }),
      });
      if (response.ok) {
        setPlanSaved(true);
      }
    } catch (err) {
      console.error('Failed to save training plan:', err);
    } finally {
      setSavingPlan(false);
    }
  };

  // Save training plan from chat message
  const savePlanFromChat = async (messageIndex: number, content: string) => {
    setSavingPlanFromChat(messageIndex);
    try {
      // Extract plan info from the message content
      // Try to find duration and goal info from the plan content
      let duration = 4;
      let durationType: 'weeks' | 'days' = 'weeks';
      let goalType = 'general';
      let title = 'AI Төлөвлөгөө';
      
      // Try to extract weeks/days from content
      const weekMatch = content.match(/(\d+)\s*(долоо хоног|7 хоног)/i);
      const dayMatch = content.match(/(\d+)\s*өдр/i);
      
      if (weekMatch) {
        duration = parseInt(weekMatch[1]);
        durationType = 'weeks';
      } else if (dayMatch) {
        duration = parseInt(dayMatch[1]);
        durationType = 'days';
      }
      
      // Try to extract goal type
      if (content.includes('5км') || content.includes('5 км')) {
        goalType = '5k';
        title = '5км бэлтгэл';
      } else if (content.includes('10км') || content.includes('10 км')) {
        goalType = '10k';
        title = '10км бэлтгэл';
      } else if (content.includes('марафон') || content.includes('marathon')) {
        if (content.includes('хагас') || content.includes('half')) {
          goalType = 'half_marathon';
          title = 'Хагас марафон бэлтгэл';
        } else {
          goalType = 'marathon';
          title = 'Марафон бэлтгэл';
        }
      } else if (content.includes('жин хас')) {
        goalType = 'weight_loss';
        title = 'Жин хасах төлөвлөгөө';
      }
      
      const durationText = durationType === 'weeks' 
        ? `${duration} долоо хоног` 
        : `${duration} өдөр`;
      
      const response = await fetch('/api/training-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${title} - ${durationText}`,
          description: `AI дасгалжуулагчтай ярилцаж үүсгэсэн ${durationText} төлөвлөгөө`,
          duration,
          durationType,
          goalType,
          content,
        }),
      });
      
      if (response.ok) {
        setSavedPlanIndices(prev => new Set([...prev, messageIndex]));
      }
    } catch (err) {
      console.error('Failed to save training plan from chat:', err);
    } finally {
      setSavingPlanFromChat(null);
    }
  };

  // Activity stats for sidebar
  const recentActivities = activities.slice(0, 5);
  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0) / 1000;
  const totalActivities = activities.length;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <DashboardHeader athlete={athlete} title="AI Дасгалжуулагч" />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Container - Scrollable */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-6"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  AI Туслах
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                  Би танд ямар ч асуултад хариулж, дасгалын зөвлөмж өгч, төлөвлөгөө боловсруулахад тусална.
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
              <div className="max-w-3xl mx-auto space-y-4 pb-4">
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
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">AI Туслах</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                      
                      {/* Show save button if this message contains a plan */}
                      {msg.role === 'assistant' && msg.hasPlan && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          {savedPlanIndices.has(i) ? (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Төлөвлөгөө хадгалагдсан!
                              <Link href="/plans" className="underline ml-1 text-[#FC4C02]">Үзэх →</Link>
                            </div>
                          ) : (
                            <button
                              onClick={() => savePlanFromChat(i, msg.content)}
                              disabled={savingPlanFromChat === i}
                              className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                            >
                              {savingPlanFromChat === i ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  Хадгалж байна...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                  </svg>
                                  Төлөвлөгөө хадгалах
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
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

          {/* Input Area - Fixed at bottom */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ямар ч асуулт асуугаарай..."
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
        <div className="hidden lg:flex lg:flex-col w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
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

            {/* Training Plan Generator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Төлөвлөгөө үүсгэх</h4>
                <button
                  onClick={() => setShowPlanConfig(!showPlanConfig)}
                  className="text-xs text-[#FC4C02] hover:text-[#e34402]"
                >
                  {showPlanConfig ? 'Хураах' : 'Тохируулах'}
                </button>
              </div>

              {showPlanConfig && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                  {/* Duration */}
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Хугацаа</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="52"
                        value={planConfig.duration}
                        onChange={(e) => setPlanConfig(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                        className="w-16 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded"
                      />
                      <select
                        value={planConfig.durationType}
                        onChange={(e) => setPlanConfig(prev => ({ ...prev, durationType: e.target.value as 'weeks' | 'days' }))}
                        className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded"
                      >
                        <option value="weeks">Долоо хоног</option>
                        <option value="days">Өдөр</option>
                      </select>
                    </div>
                  </div>

                  {/* Goal Type */}
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Зорилго</label>
                    <select
                      value={planConfig.goalType}
                      onChange={(e) => setPlanConfig(prev => ({ ...prev, goalType: e.target.value }))}
                      className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded"
                    >
                      {goalTypes.map(goal => (
                        <option key={goal.value} value={goal.value}>{goal.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Target Date (optional) */}
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Зорилтот огноо (заавал биш)</label>
                    <input
                      type="date"
                      value={planConfig.targetDate || ''}
                      onChange={(e) => setPlanConfig(prev => ({ ...prev, targetDate: e.target.value }))}
                      className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded"
                    />
                  </div>
                </div>
              )}

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
                    Төлөвлөгөө үүсгэх
                  </>
                )}
              </button>

              <Link 
                href="/plans"
                className="block mt-2 text-center text-xs text-gray-500 dark:text-gray-400 hover:text-[#FC4C02]"
              >
                Миний төлөвлөгөөнүүд үзэх →
              </Link>
            </div>

            {/* Training Plan Display */}
            {trainingPlan && (
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
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-48 overflow-y-auto mb-3">
                  {trainingPlan}
                </div>
                
                {/* Save Plan Button */}
                {!planSaved ? (
                  <button
                    onClick={savePlan}
                    disabled={savingPlan}
                    className="w-full px-3 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm rounded-lg flex items-center justify-center gap-2"
                  >
                    {savingPlan ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Хадгалж байна...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Төлөвлөгөө хадгалах
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-lg flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Хадгалагдсан!
                    <Link href="/plans" className="underline ml-1">Үзэх</Link>
                  </div>
                )}
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
    </div>
  );
}
