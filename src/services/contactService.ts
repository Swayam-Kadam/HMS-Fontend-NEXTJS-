import { axiosReact } from '@/services/api';
import {
  CONTACT_GET,
  CONTACT_READ_STATUS,
  CONTACT_SEND,
} from '@/services/url';

export interface SendContactPayload {
  name: string;
  email: string;
  number: number;
  subject: string;
  message: string;
}

export interface ApiContact {
  _id: string;
  name: string;
  email: string;
  number: number;
  subject: string;
  message: string;
}

export interface ContactListStats {
  unread?: number;
  read?: number;
}

export const sendContactMessage = async (
  payload: SendContactPayload
): Promise<ApiContact> => {
  const { data } = await axiosReact.post<{ message: string; contact: ApiContact }>(
    CONTACT_SEND,
    payload
  );
  return data.contact;
};

// ── Admin: contact messages (GET /contact/get) ─────────────────────────────

export const CONTACT_SUBJECTS = [
  'General Inquiry',
  'Appointment',
  'Emergency',
  'Feedback',
  'Others',
] as const;

export type ContactSubjectFilter = 'all' | (typeof CONTACT_SUBJECTS)[number];
export type ContactReadFilter = 'all' | 'read' | 'unread';

export interface AdminContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  read: boolean;
  date: string;
}

interface ApiAdminContact {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  phone?: number | string;
  number?: number | string;
  subject?: string;
  message?: string;
  readStatus?: boolean;
  date?: string;
}

interface ApiAdminContactsResponse {
  total: number;
  currentPage: number;
  limit: number;
  totalPages: number;
  contact: ApiAdminContact[];
  stats: ContactListStats | null;
}

export interface AdminContactsPage {
  contacts: AdminContact[];
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  stats: ContactListStats | null;
}

const formatContactDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const mapApiAdminContact = (contact: ApiAdminContact): AdminContact => {
  const phone = contact.phone ?? contact.number;
  return {
    id: contact.id || contact._id || '',
    name: contact.name || 'Unknown',
    email: contact.email || '',
    phone: phone != null ? String(phone) : '',
    subject: contact.subject || '',
    message: contact.message || '',
    read: Boolean(contact.readStatus),
    date: formatContactDate(contact.date),
  };
};

// Server-side filtered + paginated fetch. `subject` is an exact match,
// `readStatus` maps read/unread to true/false, and `search` is trimmed; all
// filters apply to countDocuments so total/totalPages stay accurate.
export const fetchAdminContacts = async (
  page = 1,
  limit = 10,
  subject: ContactSubjectFilter = 'all',
  readStatus: ContactReadFilter = 'all',
  search?: string
): Promise<AdminContactsPage> => {
  const params: Record<string, string | number> = { page, limit };

  if (subject && subject !== 'all') {
    params.subject = subject;
  }
  if (readStatus === 'read') {
    params.readStatus = 'true';
  } else if (readStatus === 'unread') {
    params.readStatus = 'false';
  }
  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    params.search = trimmedSearch;
  }

  const { data } = await axiosReact.get<ApiAdminContactsResponse>(CONTACT_GET, {
    params,
  });

  const list = Array.isArray(data?.contact) ? data.contact : [];

  return {
    contacts: list.map(mapApiAdminContact),
    total: data?.total ?? list.length,
    currentPage: data?.currentPage ?? page,
    totalPages: data?.totalPages ?? 1,
    limit: data?.limit ?? limit,
    stats: data?.stats ?? {
      unread: 0,
      read: 0,
    },
  };
};

export const updateContactReadStatus = async (
  id: string,
  readStatus: boolean
): Promise<void> => {
  await axiosReact.patch(CONTACT_READ_STATUS(id), { readStatus });
};

export const parseContactError = (error: unknown): string => {
  const apiError = (
    error as { response?: { data?: { error?: unknown } } }
  )?.response?.data?.error;

  if (typeof apiError === 'string') {
    return apiError;
  }
  return 'Something went wrong. Please try again.';
};
