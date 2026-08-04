'use client';

import { useEffect, useRef } from 'react';
import { CheckCheck, Clock3, RotateCcw, Send } from 'lucide-react';
import type { SupportMessage } from '@/services/supportChatService';

interface SupportChatThreadProps {
  messages: SupportMessage[];
  currentRole: 'user' | 'admin';
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onRetry?: (clientId: string) => void;
  sending?: boolean;
  disabled?: boolean;
  typingLabel?: string | null;
  emptyLabel?: string;
}

const formatTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const SupportChatThread = ({
  messages,
  currentRole,
  draft,
  onDraftChange,
  onSend,
  onRetry,
  sending = false,
  disabled = false,
  typingLabel,
  emptyLabel = 'No messages yet. Start the conversation.',
}: SupportChatThreadProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typingLabel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || sending || disabled) return;
    onSend();
  };

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[280px] items-center justify-center">
            <p className="text-sm text-gray-400">{emptyLabel}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const mine = msg.senderRole === currentRole;
            return (
              <div
                key={msg.clientId || msg.id}
                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    mine
                      ? 'rounded-br-md bg-blue-600 text-white'
                      : 'rounded-bl-md border border-gray-100 bg-gray-50 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  <div
                    className={`mt-1.5 flex items-center gap-1.5 text-[10px] ${
                      mine ? 'justify-end text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    <span>{formatTime(msg.createdAt)}</span>
                    {mine && msg.deliveryStatus === 'sending' && (
                      <Clock3 size={12} className="opacity-80" />
                    )}
                    {mine && msg.deliveryStatus === 'sent' && (
                      <CheckCheck size={12} className="opacity-80" />
                    )}
                    {mine && msg.deliveryStatus === 'failed' && (
                      <button
                        type="button"
                        onClick={() => msg.clientId && onRetry?.(msg.clientId)}
                        className="inline-flex items-center gap-1 rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide hover:bg-white/25"
                      >
                        <RotateCcw size={10} />
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {typingLabel && (
          <p className="text-xs text-gray-400 italic px-1">{typingLabel}</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-100 p-3 sm:p-4"
      >
        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            value={draft}
            disabled={disabled}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!draft.trim() || sending || disabled) return;
                onSend();
              }
            }}
            placeholder={
              disabled
                ? 'This conversation is closed'
                : 'Type your message…'
            }
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            type="submit"
            disabled={disabled || sending || !draft.trim()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-100 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupportChatThread;
