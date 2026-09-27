import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import type { ChatMessage, UserRole } from '../types';

interface ChatPaneProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUserId: string;
}

export const ChatPane: React.FC<ChatPaneProps> = ({
  messages,
  onSendMessage,
  currentUserId,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-950 select-none">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-500 py-8">
            <MessageSquare className="h-8 w-8 text-slate-700 mb-2" />
            <p className="text-xs">No chat messages yet.</p>
            <p className="text-[11px] text-slate-600">
              Send links, code snippets, or notes to the other participant.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === currentUserId;
            return (
              <div
                key={m._id || m.timestamp}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">{isMe ? 'You' : m.senderName}</span>
                  <span className="text-slate-600">·</span>
                  <span className="capitalize text-slate-500 text-[10px]">{m.senderRole}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[10px] tabular-nums">{formatTime(m.timestamp)}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed break-words font-sans ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {m.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message and press Enter..."
            className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
