import { axiosReact } from '@/services/api';
import { CHATBOT_MESSAGE } from '@/services/url';

export type ChatbotRole = 'user' | 'model';

export interface ChatbotMessage {
  role: ChatbotRole;
  text: string;
}

export interface ChatbotReply {
  reply: string;
  handoff: boolean;
  emergency: boolean;
}

export const sendChatbotMessage = async (
  messages: ChatbotMessage[]
): Promise<ChatbotReply> => {
  const { data } = await axiosReact.post<ChatbotReply>(CHATBOT_MESSAGE, {
    messages,
  });
  return {
    reply: data?.reply ?? '',
    handoff: Boolean(data?.handoff),
    emergency: Boolean(data?.emergency),
  };
};

export const parseChatbotError = (error: unknown): string => {
  const apiError = (
    error as { response?: { data?: { error?: unknown } } }
  )?.response?.data?.error;
  if (typeof apiError === 'string') return apiError;
  return 'The assistant is unavailable right now. Please try again shortly.';
};
