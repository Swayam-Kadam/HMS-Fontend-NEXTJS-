import { axiosReact } from '@/services/api';
import {
  MESSAGE_FETCH,
  MESSAGE_REPLY,
  MESSAGE_SEND,
  MESSAGE_USER,
} from '@/services/url';

export const MESSAGE_TAGS = [
  'General',
  'Appointment',
  'Billing',
  'Feedback',
  'Complaint',
  'Emergency',
  'Support',
] as const;

export type MessageTag = (typeof MESSAGE_TAGS)[number];
export type MessageTagFilter = 'all' | MessageTag;

export interface ApiMessage {
  _id: string;
  title: string;
  message: string;
  tag: string;
  rating?: number;
  replay?: string;
  createdAt?: string;
}

export interface MessageListStats {
  pending?: number;
  replied?: number;
}

export interface UserMessage {
  id: string;
  title: string;
  message: string;
  tag: string;
  rating: number;
  replay: string;
  date: string;
}

export interface PaginatedMessages {
  messages: UserMessage[];
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  stats: MessageListStats | null;
}

interface ApiPaginatedMessages {
  total: number;
  currentPage: number;
  limit: number;
  totalPages: number;
  message: ApiMessage[];
  stats: MessageListStats | null;
}

export interface SendMessagePayload {
  title: string;
  message: string;
  tag: string;
  rating?: number;
}

const formatMessageDate = (msg: ApiMessage) => {
  if (msg.createdAt) {
    const date = new Date(msg.createdAt);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  }
  // Fallback: derive timestamp from MongoDB ObjectId
  if (msg._id?.length === 24) {
    const timestamp = parseInt(msg._id.substring(0, 8), 16) * 1000;
    const date = new Date(timestamp);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  }
  return '—';
};

export const mapApiMessageToUser = (msg: ApiMessage): UserMessage => ({
  id: msg._id,
  title: msg.title,
  message: msg.message,
  tag: msg.tag || 'General',
  rating: msg.rating ?? 0,
  replay: msg.replay || '',
  date: formatMessageDate(msg),
});

export const sendMessage = async (
  payload: SendMessagePayload
): Promise<ApiMessage> => {
  const body: SendMessagePayload = {
    title: payload.title,
    message: payload.message,
    tag: payload.tag,
  };
  if (payload.rating && payload.rating >= 1 && payload.rating <= 5) {
    body.rating = payload.rating;
  }

  const { data } = await axiosReact.post<{
    message: string;
    messages: ApiMessage;
  }>(MESSAGE_SEND, body);

  return data.messages;
};

export const fetchUserMessages = async (
  page = 1,
  limit = 5,
  tag: MessageTagFilter = 'all'
): Promise<PaginatedMessages> => {
  const params: Record<string, string | number> = { page, limit };
  if (tag && tag !== 'all') {
    params.tag = tag;
  }

  const { data } = await axiosReact.get<ApiPaginatedMessages>(MESSAGE_USER, {
    params,
  });

  const list = Array.isArray(data?.message) ? data.message : [];

  return {
    messages: list.map(mapApiMessageToUser),
    total: data?.total ?? list.length,
    currentPage: data?.currentPage ?? page,
    totalPages: data?.totalPages ?? 1,
    limit: data?.limit ?? limit,
    stats: data?.stats ?? {
      pending: 0,
      replied: 0,
    },
  };
};

// ── Admin: all user messages (GET /message/fetch) ──────────────────────────

export type MessageReplyStatusFilter = 'all' | 'pending' | 'replied';

export interface AdminMessage {
  id: string;
  title: string;
  message: string;
  tag: string;
  rating: number;
  reply: string;
  replied: boolean;
  date: string;
  userName: string;
  userEmail: string;
}

// The /message/fetch endpoint returns a flattened/joined shape (username,
// useremail, replay, date) rather than the raw Message document.
interface ApiAdminMessage {
  _id?: string;
  id?: string;
  title?: string;
  message: string;
  tag?: string;
  rating?: number;
  replay?: string;
  date?: string;
  user?: string | null;
  username?: string;
  useremail?: string;
}

interface ApiAdminPaginatedMessages {
  total: number;
  currentPage: number;
  limit: number;
  totalPages: number;
  message: ApiAdminMessage[];
  stats: MessageListStats | null;
}

export interface AdminMessagesPage {
  messages: AdminMessage[];
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  stats: MessageListStats | null;
}

const formatAdminMessageDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const mapApiAdminMessage = (msg: ApiAdminMessage): AdminMessage => {
  const reply = (msg.replay || '').trim();
  return {
    id: msg._id || msg.id || '',
    title: msg.title || '',
    message: msg.message || '',
    tag: msg.tag || 'General',
    rating: msg.rating ?? 0,
    reply,
    replied: reply.length > 0,
    date: formatAdminMessageDate(msg.date),
    userName: msg.username || 'Unknown',
    userEmail: msg.useremail || '',
  };
};

// Server-side filtered + paginated fetch. `tag` is validated against the 7
// allowed tags, `replyStatus` is pending/replied, and `search` is trimmed; the
// backend applies all of them to countDocuments so total/totalPages stay exact.
export const fetchAdminMessages = async (
  page = 1,
  limit = 10,
  tag: MessageTagFilter = 'all',
  replyStatus: MessageReplyStatusFilter = 'all',
  search?: string
): Promise<AdminMessagesPage> => {
  const params: Record<string, string | number> = { page, limit };

  if (tag && tag !== 'all') {
    params.tag = tag;
  }
  if (replyStatus && replyStatus !== 'all') {
    params.replyStatus = replyStatus;
  }
  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    params.search = trimmedSearch;
  }

  const { data } = await axiosReact.get<ApiAdminPaginatedMessages>(
    MESSAGE_FETCH,
    { params }
  );

  const list = Array.isArray(data?.message) ? data.message : [];

  return {
    messages: list.map(mapApiAdminMessage),
    total: data?.total ?? list.length,
    currentPage: data?.currentPage ?? page,
    totalPages: data?.totalPages ?? 1,
    limit: data?.limit ?? limit,
    stats: data?.stats ?? {
      pending: 0,
      replied: 0,
    },
  };
};

export const replyToMessage = async (
  id: string,
  replay: string
): Promise<void> => {
  await axiosReact.patch(MESSAGE_REPLY(id), { replay });
};

export const parseMessageError = (error: unknown): string => {
  const apiError = (
    error as { response?: { data?: { error?: unknown } } }
  )?.response?.data?.error;

  if (typeof apiError === 'string') {
    return apiError;
  }
  return 'Something went wrong. Please try again.';
};
