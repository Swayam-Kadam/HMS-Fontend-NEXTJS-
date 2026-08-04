'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Headphones,
  Loader2,
  Search,
  UserCheck,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import SupportChatThread from '@/components/support/SupportChatThread';
import {
  useAdminSupportConversationsQuery,
  useAssignSupportConversationMutation,
  useMarkSupportReadMutation,
  useSupportMessagesQuery,
  useUpdateSupportStatusMutation,
} from '@/hooks/queries';
import { queryKeys } from '@/lib/query-keys';
import {
  disconnectSupportSocket,
  emitWithAck,
  getSupportSocket,
} from '@/lib/socket';
import {
  parseSupportError,
  type AdminSupportStatusFilter,
  type SupportConversation,
  type SupportMessage,
} from '@/services/supportChatService';
import { toastError, toastSuccess } from '@/lib/swal';

const PAGE_SIZE = 15;

type AckResponse = {
  ok: boolean;
  error?: string;
  message?: SupportMessage;
  conversation?: SupportConversation;
};

const statusFilters: { id: AdminSupportStatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'waiting_for_admin', label: 'Waiting' },
  { id: 'open', label: 'Open' },
  { id: 'waiting_for_user', label: 'Awaiting user' },
  { id: 'closed', label: 'Closed' },
];

const AdminSupportInboxContent = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<AdminSupportStatusFilter>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [socketReady, setSocketReady] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinedId = useRef<string | null>(null);

  const listQuery = useAdminSupportConversationsQuery(
    page,
    PAGE_SIZE,
    status,
    search,
    unreadOnly
  );
  const conversations = listQuery.data?.conversations ?? [];
  const selected =
    conversations.find((c) => c.id === selectedId) || conversations[0] || null;
  const conversationId = selected?.id || null;

  const messagesQuery = useSupportMessagesQuery(
    conversationId,
    Boolean(conversationId)
  );
  const assignMutation = useAssignSupportConversationMutation();
  const statusMutation = useUpdateSupportStatusMutation();
  const markReadMutation = useMarkSupportReadMutation();

  useEffect(() => {
    if (messagesQuery.data?.messages) {
      setLocalMessages(messagesQuery.data.messages);
    }
  }, [messagesQuery.data?.messages, conversationId]);

  useEffect(() => {
    if (!selectedId && conversations[0]?.id) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  const refreshLists = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['admin-support-conversations'],
    });
  }, [queryClient]);

  const upsertInCache = useCallback(
    (conversation: SupportConversation) => {
      queryClient.setQueriesData(
        { queryKey: ['admin-support-conversations'] },
        (
          prev:
            | {
                conversations: SupportConversation[];
                total: number;
                currentPage: number;
                totalPages: number;
                limit: number;
                stats: { open: number; waiting: number; closed: number };
              }
            | undefined
        ) => {
          if (!prev) return prev;
          const exists = prev.conversations.some((c) => c.id === conversation.id);
          const conversationsNext = exists
            ? prev.conversations.map((c) =>
                c.id === conversation.id ? conversation : c
              )
            : [conversation, ...prev.conversations];
          return {
            ...prev,
            conversations: conversationsNext.sort(
              (a, b) =>
                new Date(b.lastMessageAt).getTime() -
                new Date(a.lastMessageAt).getTime()
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
          if (payload.conversation) upsertInCache(payload.conversation);
          if (payload.message?.conversationId === conversationId) {
            appendMessage(payload.message);
          }
        };

        const onConversationUpdated = (payload: {
          conversation: SupportConversation;
        }) => {
          if (payload.conversation) upsertInCache(payload.conversation);
        };

        const onTyping = (payload: {
          conversationId: string;
          role: string;
          typing: boolean;
        }) => {
          if (payload.conversationId !== conversationId) return;
          if (payload.role === 'admin') return;
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
  }, [appendMessage, conversationId, upsertInCache]);

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
          senderRole: 'admin',
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
      if (response.conversation) upsertInCache(response.conversation);
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

  const handleAssign = async () => {
    if (!conversationId) return;
    try {
      const conversation = await assignMutation.mutateAsync(conversationId);
      upsertInCache(conversation);
      toastSuccess('Conversation assigned to you');
    } catch (error) {
      toastError(parseSupportError(error));
    }
  };

  const handleClose = async () => {
    if (!conversationId) return;
    try {
      const conversation = await statusMutation.mutateAsync({
        id: conversationId,
        status: 'closed',
      });
      upsertInCache(conversation);
      toastSuccess('Conversation closed');
    } catch (error) {
      toastError(parseSupportError(error));
    }
  };

  const handleReopen = async () => {
    if (!conversationId) return;
    try {
      const conversation = await statusMutation.mutateAsync({
        id: conversationId,
        status: 'open',
      });
      upsertInCache(conversation);
      toastSuccess('Conversation reopened');
    } catch (error) {
      toastError(parseSupportError(error));
    }
  };

  const stats = listQuery.data?.stats;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Headphones className="text-blue-600" size={24} />
            Support Inbox
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Live chat with patients — reply in realtime
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          {socketReady ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-700">
              <Wifi size={12} /> Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-amber-700">
              <WifiOff size={12} /> Offline
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: 'Open', value: stats?.open ?? 0 },
          { label: 'Waiting', value: stats?.waiting ?? 0 },
          { label: 'Closed', value: stats?.closed ?? 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearch(searchInput.trim());
                setPage(1);
              }
            }}
            placeholder="Search subject or preview…"
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setSearch(searchInput.trim());
            setPage(1);
            refreshLists();
          }}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Search
        </button>
        <label className="inline-flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => {
              setUnreadOnly(e.target.checked);
              setPage(1);
            }}
            className="rounded border-gray-300"
          />
          Unread only
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5 rounded-xl bg-gray-100 p-1.5">
        {statusFilters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => {
              setStatus(filter.id);
              setPage(1);
            }}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              status === filter.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-white hover:text-blue-600'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2 space-y-3">
          {listQuery.isLoading ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-gray-100 bg-white">
              <Loader2 className="animate-spin text-blue-600" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">
              No support conversations found.
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selected?.id === c.id
                    ? 'border-blue-200 bg-blue-50 shadow-sm'
                    : 'border-gray-100 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {c.userName || 'Patient'}
                    </p>
                    <p className="text-xs text-gray-400">{c.userEmail}</p>
                  </div>
                  {c.unreadForAdmin > 0 && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      {c.unreadForAdmin}
                    </span>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {c.lastMessagePreview || c.subject}
                </p>
                <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  {c.status.replaceAll('_', ' ')}
                </p>
              </button>
            ))
          )}

          {(listQuery.data?.totalPages || 0) > 1 && (
            <Pagination
              currentPage={page}
              totalPages={listQuery.data?.totalPages || 1}
              onPageChange={setPage}
            />
          )}
        </div>

        <div className="xl:col-span-3">
          {!selected ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-gray-100 bg-white text-sm text-gray-400">
              Select a conversation to reply
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div>
                  <p className="font-bold text-gray-900">{selected.userName}</p>
                  <p className="text-xs text-gray-500">{selected.userEmail}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Assigned:{' '}
                    {selected.assignedAdminName || 'Unassigned'} ·{' '}
                    {selected.status.replaceAll('_', ' ')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleAssign}
                    disabled={assignMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <UserCheck size={14} /> Assign me
                  </button>
                  {selected.status === 'closed' ? (
                    <button
                      type="button"
                      onClick={handleReopen}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      <CheckCircle2 size={14} /> Reopen
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleClose}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      <XCircle size={14} /> Close
                    </button>
                  )}
                </div>
              </div>

              {messagesQuery.isLoading ? (
                <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-gray-100 bg-white">
                  <Loader2 className="animate-spin text-blue-600" />
                </div>
              ) : (
                <SupportChatThread
                  messages={localMessages}
                  currentRole="admin"
                  draft={draft}
                  onDraftChange={handleDraftChange}
                  onSend={handleSend}
                  onRetry={handleRetry}
                  disabled={selected.status === 'closed'}
                  typingLabel={peerTyping ? 'Patient is typing…' : null}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportInboxContent;
