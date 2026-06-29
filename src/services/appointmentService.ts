import { axiosReact } from '@/services/api';
import {
  APPOINTMENT,
  APPOINTMENT_CANCEL,
  APPOINTMENT_CHECKOUT,
  APPOINTMENT_EDIT,
  APPOINTMENT_UPDATE_STATUS,
  APPOINTMENT_USER,
} from '@/services/url';
import type { StaticImageData } from 'next/image';
import CardiologyImage from '../../public/images/department/cardiology.jpg';
import DermatologyImage from '../../public/images/department/dermatology.jpg';
import ENTImage from '../../public/images/department/ent.jpg';
import GeneralImage from '../../public/images/department/general.jpg';
import NeurologyImage from '../../public/images/department/neurology.jpg';
import OncologyImage from '../../public/images/department/oncology.jpg';
import OrthopedicsImage from '../../public/images/department/orthopedics.jpg';
import PediatricsImage from '../../public/images/department/pediatrics.jpg';
import PhysicalTherapyImage from '../../public/images/department/physical-therapy.jpg';

export type ProfileAppointmentStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export interface ApiAppointment {
  _id: string;
  firstName?: string;
  lastName?: string;
  f_name?: string;
  l_name?: string;
  email: string;
  phone?: string;
  nic?: string;
  dob?: string;
  gender?: string;
  appointmentType?: string;
  department: string;
  doctor: string;
  status: string;
  preferredDate?: string;
  preferredTime?: string;
  reason?: string;
  notes?: string;
  ADOB?: string;
  createdAt?: string;
}

export interface AppointmentListStats {
  pending?: number;
  accepted?: number;
  rejected?: number;
  cancelled?: number;
  completed?: number;
}

export const GENDER_OPTIONS = ['Male', 'Female'] as const;

export const APPOINTMENT_TYPE_OPTIONS = [
  'Clinic Visit',
  'Video Consult',
  'Emergency',
] as const;

export const DEPARTMENT_OPTIONS = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Ophthalmology',
  'Dentistry',
  'Oncology',
] as const;

export const PREFERRED_TIME_OPTIONS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
] as const;

export interface AppointmentEditable {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nic: string;
  dob: string;
  gender: string;
  appointmentType: string;
  department: string;
  doctor: string;
  preferredDate: string;
  preferredTime: string;
  reason: string;
  notes: string;
}

export interface ProfileAppointment {
  id: string;
  name: string;
  email: string;
  department: string;
  doctor: string;
  status: ProfileAppointmentStatus;
  date: string;
  time: string;
  doctorImage: StaticImageData;
  editable: AppointmentEditable;
}

export interface CreateAppointmentPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nic: string;
  dob: string;
  gender: string;
  appointmentType: string;
  department: string;
  doctor: string;
  preferredDate: string;
  preferredTime: string;
  reason: string;
  notes?: string;
  status?: string;
}

const departmentImages: Record<string, StaticImageData> = {
  cardiology: CardiologyImage,
  dermatology: DermatologyImage,
  ent: ENTImage,
  general: GeneralImage,
  neurology: NeurologyImage,
  oncology: OncologyImage,
  orthopedics: OrthopedicsImage,
  pediatrics: PediatricsImage,
  'physical therapy': PhysicalTherapyImage,
};

export const getDepartmentImage = (department?: string): StaticImageData => {
  const key = (department || '').trim().toLowerCase();
  return departmentImages[key] || GeneralImage;
};

const formatDisplayDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const toDateInputValue = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().split('T')[0];
};

export const normalizeAppointmentStatus = (
  status: string
): ProfileAppointmentStatus => {
  const lower = (status || '').toLowerCase();
  if (lower === 'accepted' || lower === 'confirmed' || lower === 'approved') {
    return 'accepted';
  }
  if (lower === 'rejected') {
    return 'rejected';
  }
  if (lower === 'cancelled' || lower === 'canceled') {
    return 'cancelled';
  }
  if (lower === 'completed') {
    return 'completed';
  }
  return 'pending';
};

export const mapApiAppointmentToProfile = (
  appointment: ApiAppointment,
  index = 0
): ProfileAppointment => {
  const firstName = appointment.firstName || appointment.f_name || '';
  const lastName = appointment.lastName || appointment.l_name || '';
  const dateSource = appointment.preferredDate || appointment.ADOB || appointment.createdAt || '';

  return {
    id: appointment._id,
    name: `${firstName} ${lastName}`.trim() || 'Patient',
    email: appointment.email,
    department: appointment.department,
    doctor: appointment.doctor,
    status: normalizeAppointmentStatus(appointment.status),
    date: dateSource ? formatDisplayDate(dateSource) : '—',
    time: appointment.preferredTime || '—',
    doctorImage: getDepartmentImage(appointment.department),
    editable: {
      firstName,
      lastName,
      email: appointment.email || '',
      phone: appointment.phone || '',
      nic: appointment.nic || '',
      dob: toDateInputValue(appointment.dob || appointment.ADOB),
      gender: appointment.gender || '',
      appointmentType: appointment.appointmentType || '',
      department: appointment.department || '',
      doctor: appointment.doctor || '',
      preferredDate: toDateInputValue(appointment.preferredDate),
      preferredTime: appointment.preferredTime || '',
      reason: appointment.reason || '',
      notes: appointment.notes || '',
    },
  };
};

export interface PaginatedAppointments {
  appointments: ProfileAppointment[];
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  stats: AppointmentListStats | null;
}

interface ApiPaginatedResponse {
  total: number;
  currentPage: number;
  limit: number;
  totalPages: number;
  appointment: ApiAppointment[];
  stats: AppointmentListStats | null;
}

export type AppointmentStatusFilter =
  | 'all'
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export const fetchUserAppointments = async (
  page = 1,
  limit = 6,
  status: AppointmentStatusFilter = 'all'
): Promise<PaginatedAppointments> => {
  const params: Record<string, string | number> = { page, limit };
  if (status && status !== 'all') {
    params.status = status;
  }

  const { data } = await axiosReact.get<ApiPaginatedResponse>(APPOINTMENT_USER, {
    params,
  });

  const list = Array.isArray(data?.appointment) ? data.appointment : [];

  return {
    appointments: list.map((item, index) => mapApiAppointmentToProfile(item, index)),
    stats: data?.stats ?? {
      pending: 0,
      accepted: 0,
      rejected: 0,
    },
    total: data?.total ?? list.length,
    currentPage: data?.currentPage ?? page,
    totalPages: data?.totalPages ?? 1,
    limit: data?.limit ?? limit,
  };
};

export const createAppointment = async (
  payload: CreateAppointmentPayload
): Promise<ApiAppointment> => {
  const { data } = await axiosReact.post<{ appointment: ApiAppointment }>(
    APPOINTMENT,
    payload
  );
  return data.appointment;
};

export const createCheckoutSession = async (
  appointment: CreateAppointmentPayload[]
): Promise<{ id: string; url?: string }> => {
  const { data } = await axiosReact.post<{ id: string; url?: string }>(
    APPOINTMENT_CHECKOUT,
    { appointment }
  );
  return data;
};

export const cancelAppointment = async (
  id: string
): Promise<ApiAppointment> => {
  const { data } = await axiosReact.patch<{ message: string; appointment: ApiAppointment }>(
    APPOINTMENT_CANCEL(id)
  );
  return data.appointment;
};

export const updateAppointment = async (
  id: string,
  changedFields: Partial<AppointmentEditable>
): Promise<ApiAppointment> => {
  const { data } = await axiosReact.put<{ message: string; appointment: ApiAppointment }>(
    APPOINTMENT_EDIT(id),
    changedFields
  );
  return data.appointment;
};

export interface AdminAppointment {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  nic: string;
  gender: string;
  appointmentType: string;
  department: string;
  doctor: string;
  preferredDate: string;
  preferredTime: string;
  reason: string;
  notes: string;
  status: ProfileAppointmentStatus;
  bookedOn: string;
}

export const mapApiAppointmentToAdmin = (
  appointment: ApiAppointment
): AdminAppointment => {
  const firstName = appointment.firstName || appointment.f_name || '';
  const lastName = appointment.lastName || appointment.l_name || '';

  return {
    id: appointment._id,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim() || 'Patient',
    email: appointment.email || '',
    phone: appointment.phone || '',
    nic: appointment.nic || '',
    gender: appointment.gender || '',
    appointmentType: appointment.appointmentType || '',
    department: appointment.department || '',
    doctor: appointment.doctor || '',
    preferredDate: appointment.preferredDate
      ? formatDisplayDate(appointment.preferredDate)
      : '—',
    preferredTime: appointment.preferredTime || '—',
    reason: appointment.reason || '',
    notes: appointment.notes || '',
    status: normalizeAppointmentStatus(appointment.status),
    bookedOn: appointment.createdAt
      ? formatDisplayDate(appointment.createdAt)
      : '—',
  };
};

export interface AdminAppointmentsPage {
  appointments: AdminAppointment[];
  stats: AppointmentListStats | null;
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

// Server-side paginated fetch from GET /appointment/appo with optional status +
// search filters. The API applies them to countDocuments, so total/totalPages
// stay accurate. `status` is only sent when it is a concrete allowed value, and
// `search` is trimmed and only sent when non-empty.
export const fetchAdminAppointments = async (
  page = 1,
  limit = 10,
  status?: string,
  search?: string
): Promise<AdminAppointmentsPage> => {
  const params: Record<string, string | number> = { page, limit };

  if (status && status !== 'all') {
    params.status = status;
  }

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    params.search = trimmedSearch;
  }

  const { data } = await axiosReact.get<ApiPaginatedResponse>(APPOINTMENT, {
    params,
  });

  const list = Array.isArray(data?.appointment) ? data.appointment : [];

  return {
    appointments: list.map(mapApiAppointmentToAdmin),
    stats: data?.stats ?? {
      pending: 0,
      accepted: 0,
      rejected: 0,
      cancelled: 0,
      completed: 0,
    },
    total: data?.total ?? list.length,
    currentPage: data?.currentPage ?? page,
    totalPages: data?.totalPages ?? 1,
    limit: data?.limit ?? limit,
  };
};

export const updateAppointmentStatusAdmin = async (
  id: string,
  status: ProfileAppointmentStatus
): Promise<ApiAppointment> => {
  const { data } = await axiosReact.patch<{
    message: string;
    updatedAppointment: ApiAppointment;
  }>(APPOINTMENT_UPDATE_STATUS(id), { status });
  return data.updatedAppointment;
};

export interface AppointmentActionError {
  status?: number;
  message: string;
  isAuthError: boolean;
}

export const parseAppointmentError = (
  error: unknown
): AppointmentActionError => {
  const response = (error as {
    response?: { status?: number; data?: { error?: string } };
  })?.response;
  const status = response?.status;
  const apiMessage = response?.data?.error;

  if (status === 401) {
    return {
      status,
      message: 'Session expired, please log in again',
      isAuthError: true,
    };
  }
  if (status === 403) {
    return {
      status,
      message: 'You are not allowed to modify this appointment.',
      isAuthError: false,
    };
  }
  if (status === 404) {
    return { status, message: 'Appointment not found.', isAuthError: false };
  }
  if (status === 400) {
    return {
      status,
      message: apiMessage || 'Invalid request.',
      isAuthError: false,
    };
  }

  return {
    status,
    message: apiMessage || 'Something went wrong. Please try again.',
    isAuthError: false,
  };
};
