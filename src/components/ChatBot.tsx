'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ChatBotProps {
  initialMessages?: Message[];
}

export default function ChatBot({ initialMessages = [] }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Уучлаарай, алдаа гарлаа: ${data.error}`, timestamp: new Date() },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message, timestamp: new Date() },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Уучлаарай, алдаа гарлаа. Дахин оролдоно уу.', timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
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

  const quickPrompts = [
    { text: 'Миний долоо хоног яаж өнгөрөв?', icon: '📊' },
    { text: 'Дасгалын зөвлөгөө өгнө үү', icon: '💪' },
    { text: 'Сүүлийн гүйлтүүдийг шинжлээрэй', icon: '🏃' },
    { text: 'Төлөвлөгөө гаргаж өгнө үү', icon: '📋' },
  ];

  return (
    <>
      {/* Toggle Button - Hidden on mobile with bottom nav */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed z-50 flex items-center justify-center transition-all duration-300',
          'w-14 h-14 rounded-full shadow-xl',
          'bg-gradient-to-br from-primary to-accent text-white',
          'hover:scale-110 hover:shadow-2xl active:scale-95',
          'bottom-20 right-4 md:bottom-6 md:right-6',
          isOpen && 'rotate-0'
        )}
        aria-label={isOpen ? 'Чат хаах' : 'AI чат нээх'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        )}
        {/* Notification dot */}
        {!isOpen && messages.length === 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-success border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-50 flex flex-col overflow-hidden',
            'bg-card border border-border rounded-2xl shadow-2xl',
            'transition-all duration-300 ease-out',
            // Mobile: full screen minus nav
            'inset-x-2 bottom-20 top-16 md:inset-auto',
            // Desktop: fixed size
            'md:bottom-24 md:right-6 md:w-[400px] md:h-[600px]',
            isMinimized && 'md:h-16'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">AI Дасгалжуулагч</h3>
                <p className="text-xs text-muted-foreground">Таны хувийн туслах</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                title="Түүх цэвэрлэх"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hidden md:block p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                title={isMinimized ? 'Томруулах' : 'Багасгах'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={isMinimized ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">Сайн байна уу!</h4>
                    <p className="text-sm text-muted-foreground mb-6">
                      Би таны AI дасгалжуулагч. Дасгалын талаар юу ч асууж болно!
                    </p>
                    <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt.text}
                          onClick={() => {
                            setInput(prompt.text);
                            inputRef.current?.focus();
                          }}
                          className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border text-sm text-left hover:border-primary/50 hover:bg-primary/5 transition-all"
                        >
                          <span>{prompt.icon}</span>
                          <span className="text-muted-foreground line-clamp-2">{prompt.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex gap-3 animate-fade-in',
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* Avatar */}
                    <div className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm',
                      msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gradient-to-br from-primary/20 to-accent/20 text-primary'
                    )}>
                      {msg.role === 'user' ? '👤' : '✨'}
                    </div>

                    {/* Message bubble */}
                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-4 py-3',
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-br-md'
                          : 'bg-card border border-border text-foreground rounded-bl-md'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      {msg.timestamp && (
                        <p className={cn(
                          'text-[10px] mt-1',
                          msg.role === 'user' ? 'text-white/60' : 'text-muted-foreground'
                        )}>
                          {msg.timestamp.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      ✨
                    </div>
                    <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border bg-card/80 backdrop-blur">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Асуултаа бичнэ үү..."
                    className="flex-1 bg-muted text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-xl transition-all',
                      'bg-gradient-to-br from-primary to-accent text-white',
                      'hover:shadow-lg hover:scale-105 active:scale-95',
                      'disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none'
                    )}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
