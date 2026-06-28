import { axiosReact } from '@/services/api';
import {
  FETCH_USER,
  FETCH_ALL_USERS,
  UPDATE_USER,
  DELETE_USER,
} from '@/services/url';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  bloodDonation: boolean;
  heartDonation: boolean;
  bloodGroup: string;
  memberSince: string;
  userImage: string;
}

interface ApiUser {
  _id: string;
  name?: string;
  email?: string;
  address?: string;
  DOB?: string;
  gender?: string;
  donation?: { blood?: boolean; heart?: boolean };
  bloodGroup?: string;
  userImage?: string;
  date?: string;
}

interface UpdateUserResponse {
  message: string;
  response: ApiUser;
}

const formatDateDisplay = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatMemberSince = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

export const mapApiUserToProfile = (user: ApiUser): UserProfile => ({
  id: user._id,
  name: user.name ?? '',
  email: user.email ?? '',
  address: user.address ?? '',
  dateOfBirth: user.DOB ? formatDateDisplay(user.DOB) : '',
  gender: user.gender ?? '',
  bloodDonation: user.donation?.blood ?? false,
  heartDonation: user.donation?.heart ?? false,
  bloodGroup: user.bloodGroup ?? '',
  memberSince: user.date ? formatMemberSince(user.date) : '',
  userImage: user.userImage ?? '',
});

export const fetchUser = async (): Promise<UserProfile> => {
  const { data } = await axiosReact.get<ApiUser>(FETCH_USER);
  return mapApiUserToProfile(data);
};

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  bloodGroup?: string;
  search?: string;
}

export interface UserListStats {
  totalUsers?: number;
  bloodDonar?: number;
  heartDonor?: number;
  male?: number;
  female?: number;
}

export interface PaginatedUsers {
  users: UserProfile[];
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  stats: UserListStats | null;
}

interface ApiUsersResponse {
  total?: number;
  currentPage?: number;
  limit?: number;
  totalPages?: number;
  users?: ApiUser[];
  stats?: UserListStats;
}

/**
 * Fetches users for the admin Manage Users page via GET /api/auth/all with
 * server-side pagination, blood-group filtering, and search. Axios encodes the
 * params, so `bloodGroup=O+` is sent correctly as `O%2B`.
 */
export const fetchAllUsers = async (
  params: FetchUsersParams = {}
): Promise<PaginatedUsers> => {
  const query: Record<string, string | number> = {};
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  if (params.bloodGroup) query.bloodGroup = params.bloodGroup;
  if (params.search?.trim()) query.search = params.search.trim();

  const { data } = await axiosReact.get<ApiUsersResponse>(FETCH_ALL_USERS, {
    params: query,
  });

  return {
    users: (data.users ?? []).map(mapApiUserToProfile),
    total: data.total ?? 0,
    currentPage: data.currentPage ?? params.page ?? 1,
    totalPages: Math.max(1, data.totalPages ?? 1),
    limit: data.limit ?? params.limit ?? 10,
    stats: data.stats ?? null,
  };
};

/**
 * Deletes a user via DELETE /api/auth/delete/:id.
 * NOTE: the backend route is not implemented yet, so this will fail until it is.
 */
export const deleteUser = async (id: string): Promise<void> => {
  await axiosReact.delete(DELETE_USER(id));
};

/** Normalizes a user API error into a single human-readable message. */
export const parseUserError = (error: unknown): string => {
  const apiError = (
    error as { response?: { data?: { error?: unknown; message?: unknown } } }
  )?.response?.data;

  if (Array.isArray(apiError?.error)) {
    const messages = apiError.error
      .map((item) => (item as { msg?: string })?.msg)
      .filter(Boolean);
    if (messages.length) return messages.join(', ');
  }

  if (typeof apiError?.error === 'string') return apiError.error;
  if (typeof apiError?.message === 'string') return apiError.message;

  return 'Something went wrong. Please try again.';
};

/**
 * Updates the user via multipart/form-data (multer + Cloudinary on the backend).
 * Only the fields present in `formData` are sent, so callers should append
 * just the changed fields and the `userImage` file only when a new one is picked.
 * The Content-Type header is intentionally left unset so the browser adds the
 * correct multipart boundary automatically.
 */
export const updateUser = async (
  id: string,
  formData: FormData
): Promise<UserProfile> => {
  const { data } = await axiosReact.patch<UpdateUserResponse>(
    UPDATE_USER(id),
    formData
  );
  return mapApiUserToProfile(data.response);
};
