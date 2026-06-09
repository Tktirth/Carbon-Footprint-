import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { api } from '../services/api';
import type { ChatMessage } from '../types';

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your Smart Sustainability Coach. 🌍\n\nI can help you understand your carbon footprint, explain your scoring metrics, and recommend high-impact improvement plans based on your habits.\n\nHow can I help you today?",
      suggestions: [
        'How is my carbon footprint calculated?',
        'Explain my sustainability score',
        'What is my largest emission source?',
        'Give me some easy tips to save CO₂',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.chatWithAssistant(textToSend);
      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.reply,
          suggestions: response.suggestions,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a few moments.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col space-y-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white">Sustainability Assistant</h1>
          <p className="text-gray-400 mt-1">
            Get instant answers to your environmental questions and receive personalized guidance.
          </p>
        </div>

        <Card className="flex-1 flex flex-col p-0 overflow-hidden" padding="none">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" role="log" aria-label="Chat messages history">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md
                      ${isUser ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-zinc-800 border border-zinc-700'}`}>
                      {isUser ? '👤' : '🤖'}
                    </div>

                    {/* Bubble */}
                    <div className="space-y-3">
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                        ${
                          isUser
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-tr-none'
                            : 'bg-white/5 border border-white/5 text-gray-300 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Suggestions (only for assistant and only on latest message) */}
                      {!isUser && msg.suggestions && msg.suggestions.length > 0 && index === messages.length - 1 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(sug)}
                              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-left"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm">
                  🤖
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none flex items-center gap-1.5" aria-label="Assistant is typing">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-black/20 flex gap-3">
            <input
              type="text"
              className="flex-1 bg-white/[0.03] border border-white/10 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
              placeholder="Ask a question about sustainability or your footprint..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Chat input message"
            />
            <Button type="submit" variant="primary" className="px-5">
              Send 🚀
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
