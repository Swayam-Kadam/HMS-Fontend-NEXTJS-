'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Headphones,
  Loader2,
  MessageCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import SupportChatThread from '@/components/support/SupportChatThread';
import {
  useCreateSupportConversationMutation,
  useMarkSupportReadMutation,
  useMySupportConversationsQuery,
  useSupportMessagesQuery,
} from '@/hooks/queries';
import { queryKeys } from '@/lib/query-keys';
import {
  disconnectSupportSocket,
  emitWithAck,
  getSupportSocket,
} from '@/lib/socket';
import {
  parseSupportError,
  type SupportConversation,
  type SupportMessage,
} from '@/services/supportChatService';
import { toastError, toastSuccess } from '@/lib/swal';

type AckResponse = {
  ok: boolean;
  error?: string;
  message?: SupportMessage;
  conversation?: SupportConversation;
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'waiting_for_admin':
      return 'Waiting for admin';
    case 'waiting_for_user':
      return 'Awaiting your reply';
    case 'open':
      return 'Open';
    case 'closed':
      return 'Closed';
    default:
      return status;
  }
};

const SupportChatContent = () => {
  const queryClient = useQueryClient();
  const conversationsQuery = useMySupportConversationsQuery();
  const createMutation = useCreateSupportConversationMutation();
  const markReadMutation = useMarkSupportReadMutation();

  const conversations = conversationsQuery.data?.conversations ?? [];
  const activeConversation = useMemo(
    () =>
      conversations.find((c) => c.status !== 'closed') ||
      conversations[0] ||
      null,
    [conversations]
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const conversationId = selectedId || activeConversation?.id || null;
  const selected =
    conversations.find((c) => c.id === conversationId) || activeConversation;

  const messagesQuery = useSupportMessagesQuery(conversationId, Boolean(conversationId));
  const [localMessages, setLocalMessages] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [socketReady, setSocketReady] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [starting, setStarting] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinedId = useRef<string | null>(null);

  useEffect(() => {
    if (messagesQuery.data?.messages) {
      setLocalMessages(messagesQuery.data.messages);
    }
  }, [messagesQuery.data?.messages, conversationId]);

  useEffect(() => {
    if (!selectedId && activeConversation?.id) {
      setSelectedId(activeConversation.id);
    }
  }, [activeConversation?.id, selectedId]);

  const upsertConversation = useCallback(
    (conversation: SupportConversation) => {
      queryClient.setQueryData(
        queryKeys.supportConversationsMe,
        (prev: { conversations: SupportConversation[]; unreadTotal: number } | undefined) => {
          if (!prev) {
            return {
              conversations: [conversation],
              unreadTotal: conversation.unreadForUser || 0,
            };
          }
          const others = prev.conversations.filter((c) => c.id !== conversation.id);
          const conversationsNext = [conversation, ...others].sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime()
          );
          return {
            conversations: conversationsNext,
            unreadTotal: conversationsNext.reduce(
              (sum, c) => sum + (c.unreadForUser || 0),
              0
            ),
          };
        }
      );
    },
    [queryClient]
  );

  const appendMessage = useCallback((message: SupportMessage) => {
    setLocalMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      const withoutPending = prev.filter(
        (m) =>
          !(
            m.deliveryStatus === 'sending' &&
            m.text === message.text &&
            m.senderRole === message.senderRole
          )
      );
      return [...withoutPending, { ...message, deliveryStatus: 'sent' }];
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      try {
        const socket = await getSupportSocket();
        if (cancelled) return;
        setSocketReady(true);

        const onNewMessage = (payload: {
          message: SupportMessage;
          conversation: SupportConversation;
        }) => {
          if (payload.conversation) upsertConversation(payload.conversation);
          if (payload.message?.conversationId === (selectedId || conversationId)) {
            appendMessage(payload.message);
          }
        };

        const onConversationUpdated = (payload: {
          conversation: SupportConversation;
        }) => {
          if (payload.conversation) upsertConversation(payload.conversation);
        };

        const onTyping = (payload: {
          conversationId: string;
          role: string;
          typing: boolean;
        }) => {
          if (payload.conversationId !== (selectedId || conversationId)) return;
          if (payload.role === 'user') return;
          setPeerTyping(Boolean(payload.typing));
        };

        socket.on('support:newMessage', onNewMessage);
        socket.on('support:conversationUpdated', onConversationUpdated);
        socket.on('support:typing', onTyping);

        return () => {
          socket.off('support:newMessage', onNewMessage);
          socket.off('support:conversationUpdated', onConversationUpdated);
          socket.off('support:typing', onTyping);
        };
      } catch {
        if (!cancelled) setSocketReady(false);
      }
    };

    const cleanupPromise = setup();

    return () => {
      cancelled = true;
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [appendMessage, conversationId, selectedId, upsertConversation]);

  useEffect(() => {
    if (!conversationId || !socketReady) return;

    const join = async () => {
      if (joinedId.current && joinedId.current !== conversationId) {
        await emitWithAck('support:leaveConversation', {
          conversationId: joinedId.current,
        }).catch(() => undefined);
      }
      await emitWithAck('support:joinConversation', { conversationId });
      joinedId.current = conversationId;
      markReadMutation.mutate(conversationId);
    };

    join().catch(() => undefined);
  }, [conversationId, socketReady]);

  useEffect(() => {
    return () => {
      disconnectSupportSocket();
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, []);

  const handleStart = async () => {
    setStarting(true);
    try {
      const result = await createMutation.mutateAsync({
        subject: 'Support request',
      });
      setSelectedId(result.conversation.id);
      upsertConversation(result.conversation);
      if (result.created) {
        toastSuccess('Support chat started');
      }
    } catch (error) {
      toastError(parseSupportError(error));
    } finally {
      setStarting(false);
    }
  };

  const sendMessage = async (text: string, clientId: string) => {
    if (!conversationId) return;

    setLocalMessages((prev) => {
      const exists = prev.find((m) => m.clientId === clientId);
      if (exists) {
        return prev.map((m) =>
          m.clientId === clientId
            ? { ...m, deliveryStatus: 'sending', text }
            : m
        );
      }
      return [
        ...prev,
        {
          id: clientId,
          clientId,
          conversationId,
          senderId: 'me',
          senderRole: 'user',
          text,
          isRead: false,
          readAt: null,
          createdAt: new Date().toISOString(),
          deliveryStatus: 'sending',
        },
      ];
    });

    try {
      const response = await emitWithAck<AckResponse>('support:sendMessage', {
        conversationId,
        text,
      });

      if (!response?.ok || !response.message) {
        throw new Error(response?.error || 'Failed to send message');
      }

      setLocalMessages((prev) =>
        prev.map((m) =>
          m.clientId === clientId
            ? { ...response.message!, deliveryStatus: 'sent', clientId }
            : m
        )
      );
      if (response.conversation) upsertConversation(response.conversation);
    } catch (error) {
      setLocalMessages((prev) =>
        prev.map((m) =>
          m.clientId === clientId ? { ...m, deliveryStatus: 'failed' } : m
        )
      );
      toastError(parseSupportError(error));
    }
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !conversationId) return;
    setDraft('');
    const clientId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await sendMessage(text, clientId);
  };

  const handleRetry = async (clientId: string) => {
    const failed = localMessages.find((m) => m.clientId === clientId);
    if (!failed?.text) return;
    await sendMessage(failed.text, clientId);
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (!conversationId || !socketReady) return;
    getSupportSocket()
      .then((socket) => {
        socket.emit('support:typingStart', { conversationId });
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
          socket.emit('support:typingStop', { conversationId });
        }, 1200);
      })
      .catch(() => undefined);
  };

  const closed = selected?.status === 'closed';

  return (
    <div className="container mx-auto max-w-6xl px-4 pb-16 -mt-10 relative z-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Headphones size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Live Support</h2>
            <p className="text-sm text-gray-500">
              Chat directly with hospital admin for quick help
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          {socketReady ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 border border-emerald-100">
              <Wifi size={12} /> Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-amber-700 border border-amber-100">
              <WifiOff size={12} /> Connecting…
            </span>
          )}
          {selected && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 border border-blue-100">
              {statusLabel(selected.status)}
            </span>
          )}
        </div>
      </div>

      {!selected ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <MessageCircle size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="mb-2 font-semibold text-gray-800">No active support chat</p>
          <p className="mb-6 text-sm text-gray-500">
            Start a conversation and an admin will reply as soon as possible.
          </p>
          <button
            type="button"
            onClick={handleStart}
            disabled={starting || createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-100 hover:bg-blue-700 disabled:opacity-60"
          >
            {(starting || createMutation.isPending) && (
              <Loader2 size={16} className="animate-spin" />
            )}
            Start support chat
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-1">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Your conversations
              </p>
              <div className="space-y-2">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                      c.id === selected.id
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {c.subject}
                      </p>
                      {c.unreadForUser > 0 && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          {c.unreadForUser}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                      {c.lastMessagePreview || 'No messages yet'}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-400">
                      {statusLabel(c.status)}
                    </p>
                  </button>
                ))}
              </div>
              {!conversations.some((c) => c.status !== 'closed') && (
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={starting || createMutation.isPending}
                  className="mt-4 w-full rounded-xl border border-dashed border-blue-200 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-60"
                >
                  New conversation
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {messagesQuery.isLoading ? (
              <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
                <Loader2 className="animate-spin text-blue-600" size={28} />
              </div>
            ) : (
              <SupportChatThread
                messages={localMessages}
                currentRole="user"
                draft={draft}
                onDraftChange={handleDraftChange}
                onSend={handleSend}
                onRetry={handleRetry}
                disabled={closed}
                typingLabel={peerTyping ? 'Admin is typing…' : null}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportChatContent;
