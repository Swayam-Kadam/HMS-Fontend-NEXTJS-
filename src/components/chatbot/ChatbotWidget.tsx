'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Bot,
  Loader2,
  MessageCircle,
  Phone,
  Send,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuthSession } from '@/context/AuthSessionContext';
import {
  parseChatbotError,
  sendChatbotMessage,
  type ChatbotMessage,
} from '@/services/chatbotService';
import {
  createSupportConversation,
  sendSupportMessageHttp,
} from '@/services/supportChatService';

const EMERGENCY_NUMBER = '+1 234 567 890';

const QUICK_REPLIES = [
  'How do I book an appointment?',
  'Which departments do you have?',
  'What are your visiting hours?',
  'Talk to a human',
];

interface UiMessage extends ChatbotMessage {
  id: string;
}

const WELCOME: UiMessage = {
  id: 'welcome',
  role: 'model',
  text:
    "Hi! I'm Apollo Assistant. I can help with appointments, departments, and general hospital info. How can I help you today?",
};

const ChatbotWidget = () => {
  const { authenticated } = useAuthSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);
  const [handoffLoading, setHandoffLoading] = useState(false);
  const [handoffDone, setHandoffDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: UiMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const history: ChatbotMessage[] = nextMessages
        .filter((m) => m.id !== 'welcome')
        .map(({ role, text: t }) => ({ role, text: t }));

      const res = await sendChatbotMessage(history);

      setMessages((prev) => [
        ...prev,
        { id: `m-${Date.now()}`, role: 'model', text: res.reply },
      ]);
      if (res.emergency) setEmergency(true);
      if (res.handoff) setShowHandoff(true);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: 'model', text: parseChatbotError(error) },
      ]);
      setShowHandoff(true);
    } finally {
      setLoading(false);
    }
  };

  const handleHandoff = async () => {
    if (!authenticated) return;
    setHandoffLoading(true);
    try {
      const { conversation } = await createSupportConversation({
        subject: 'Escalated from Apollo Assistant',
      });

      // Send a short transcript of the last user question to the human agent.
      const lastUser = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUser) {
        await sendSupportMessageHttp(
          conversation.id,
          `From chatbot: ${lastUser.text}`
        );
      }
      setHandoffDone(true);
    } catch {
      setHandoffDone(true);
    } finally {
      setHandoffLoading(false);
    }
  };

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-900/30 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        {open ? <X size={24} /> : <MessageCircle size={26} />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[60] flex h-[32rem] max-h-[calc(100vh-8rem)] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-700 to-blue-900 px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <Bot size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight">Apollo Assistant</p>
              <p className="text-[11px] text-blue-100">Typically replies instantly</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-lg p-1 hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Emergency banner */}
          {emergency && (
            <div className="flex items-start gap-2 border-b border-red-100 bg-red-50 px-4 py-2.5 text-xs text-red-700">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>
                This may be an emergency. Call{' '}
                <a href={`tel:${EMERGENCY_NUMBER}`} className="font-bold underline">
                  {EMERGENCY_NUMBER}
                </a>{' '}
                or go to the emergency department now.
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-3 py-4">
            {messages.map((msg) => {
              const mine = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  {!mine && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Bot size={15} />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                      mine
                        ? 'rounded-br-md bg-blue-600 text-white'
                        : 'rounded-bl-md border border-gray-100 bg-white text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  </div>
                  {mine && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <UserIcon size={15} />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Bot size={15} />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-gray-100 bg-white px-3 py-2.5">
                  <Loader2 size={14} className="animate-spin text-blue-600" />
                  <span className="text-xs">Thinking…</span>
                </div>
              </div>
            )}

            {/* Handoff CTA */}
            {showHandoff && !handoffDone && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
                <p className="mb-2 font-semibold">Need to talk to a person?</p>
                {authenticated ? (
                  <button
                    type="button"
                    onClick={handleHandoff}
                    disabled={handoffLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {handoffLoading && <Loader2 size={12} className="animate-spin" />}
                    Connect me to human support
                  </button>
                ) : (
                  <Link
                    href="/authorize?redirect=/support"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white hover:bg-blue-700"
                  >
                    Login to chat with support
                  </Link>
                )}
              </div>
            )}

            {handoffDone && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-800">
                <p className="mb-2 font-semibold">
                  Connected. An admin will reply in the support chat.
                </p>
                <Link
                  href="/support"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"
                >
                  Open support chat
                </Link>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 1 && !loading && (
            <div className="flex flex-wrap gap-1.5 border-t border-gray-100 bg-white px-3 py-2">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-gray-100 bg-white p-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask about appointments, departments…"
                className="max-h-24 min-h-[40px] flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="mt-2 flex items-center gap-1 text-[10px] leading-tight text-gray-400">
              <Phone size={10} />
              Not medical advice. For emergencies call {EMERGENCY_NUMBER}.
            </p>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
