import { axiosReact } from '@/services/api';
import {
  SUPPORT_ADMIN_ASSIGN,
  SUPPORT_ADMIN_CONVERSATIONS,
  SUPPORT_ADMIN_STATUS,
  SUPPORT_CONVERSATION_MESSAGES,
  SUPPORT_CONVERSATION_READ,
  SUPPORT_CONVERSATIONS,
  SUPPORT_CONVERSATIONS_ME,
} from '@/services/url';

export type SupportConversationStatus =
  | 'open'
  | 'closed'
  | 'waiting_for_user'
  | 'waiting_for_admin';

export type SupportSenderRole = 'user' | 'admin';

export interface SupportConversation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  assignedAdminId: string | null;
  assignedAdminName: string;
  status: SupportConversationStatus;
  subject: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadForUser: number;
  unreadForAdmin: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupportMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: SupportSenderRole;
  text: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  /** Client-only delivery state for optimistic UI */
  deliveryStatus?: 'sending' | 'sent' | 'failed';
  clientId?: string;
}

export interface SupportMessagesPage {
  messages: SupportMessage[];
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface UserConversationsResponse {
  conversations: SupportConversation[];
  unreadTotal: number;
}

export interface AdminConversationsPage {
  conversations: SupportConversation[];
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  stats: {
    open: number;
    waiting: number;
    closed: number;
  };
}

export type AdminSupportStatusFilter = 'all' | SupportConversationStatus;

export const createSupportConversation = async (payload?: {
  subject?: string;
  message?: string;
}): Promise<{ conversation: SupportConversation; created: boolean }> => {
  const { data } = await axiosReact.post<{
    conversation: SupportConversation;
    created: boolean;
  }>(SUPPORT_CONVERSATIONS, payload || {});
  return data;
};

export const fetchMySupportConversations =
  async (): Promise<UserConversationsResponse> => {
    const { data } = await axiosReact.get<UserConversationsResponse>(
      SUPPORT_CONVERSATIONS_ME
    );
    return data;
  };

export const fetchSupportMessages = async (
  conversationId: string,
  page = 1,
  limit = 100
): Promise<SupportMessagesPage> => {
  const { data } = await axiosReact.get<SupportMessagesPage>(
    SUPPORT_CONVERSATION_MESSAGES(conversationId),
    { params: { page, limit } }
  );
  return {
    ...data,
    messages: (data.messages || []).map((m) => ({
      ...m,
      deliveryStatus: 'sent' as const,
    })),
  };
};

export const sendSupportMessageHttp = async (
  conversationId: string,
  text: string
): Promise<{ message: SupportMessage; conversation: SupportConversation }> => {
  const { data } = await axiosReact.post<{
    message: SupportMessage;
    conversation: SupportConversation;
  }>(SUPPORT_CONVERSATION_MESSAGES(conversationId), { text });
  return data;
};

export const markSupportConversationRead = async (
  conversationId: string
): Promise<SupportConversation> => {
  const { data } = await axiosReact.patch<{ conversation: SupportConversation }>(
    SUPPORT_CONVERSATION_READ(conversationId)
  );
  return data.conversation;
};

export const fetchAdminSupportConversations = async (
  page = 1,
  limit = 20,
  status: AdminSupportStatusFilter = 'all',
  search = '',
  unreadOnly = false
): Promise<AdminConversationsPage> => {
  const params: Record<string, string | number | boolean> = { page, limit };
  if (status !== 'all') params.status = status;
  if (search.trim()) params.search = search.trim();
  if (unreadOnly) params.unreadOnly = true;

  const { data } = await axiosReact.get<AdminConversationsPage>(
    SUPPORT_ADMIN_CONVERSATIONS,
    { params }
  );
  return data;
};

export const assignSupportConversation = async (
  conversationId: string
): Promise<SupportConversation> => {
  const { data } = await axiosReact.patch<{ conversation: SupportConversation }>(
    SUPPORT_ADMIN_ASSIGN(conversationId)
  );
  return data.conversation;
};

export const updateSupportConversationStatus = async (
  conversationId: string,
  status: SupportConversationStatus
): Promise<SupportConversation> => {
  const { data } = await axiosReact.patch<{ conversation: SupportConversation }>(
    SUPPORT_ADMIN_STATUS(conversationId),
    { status }
  );
  return data.conversation;
};

export const parseSupportError = (error: unknown): string => {
  const apiError = (
    error as { response?: { data?: { error?: unknown } } }
  )?.response?.data?.error;
  if (typeof apiError === 'string') return apiError;
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
};
