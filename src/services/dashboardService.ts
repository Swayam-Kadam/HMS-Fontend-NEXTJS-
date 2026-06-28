import { axiosReact } from '@/services/api';
import { DASHBOARD_STATS } from '@/services/url';

export interface DashboardCards {
  totalPatients: number;
  activeDoctors: number;
  todayAppointments: number;
  todayPending: number;
  monthlyRevenue: number;
}

export interface AppointmentStatusCounts {
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
  completed: number;
}

export interface DepartmentPatientCount {
  department: string;
  count: number;
}

export interface DepartmentLoad {
  department: string;
  percentage: number;
}

export interface TodaySummary {
  completed: number;
  inProgress: number;
  cancelled: number;
  rejected: number;
  pending: number;
}

export interface AppointmentsOverviewPoint {
  month: string;
  appointments: number;
  newPatients: number;
}

export interface RevenueTrendPoint {
  month: string;
  revenue: number;
}

export interface DashboardStats {
  cards: DashboardCards;
  appointmentStatus: AppointmentStatusCounts;
  patientsByDepartment: DepartmentPatientCount[];
  departmentLoad: DepartmentLoad[];
  todaySummary: TodaySummary;
  appointmentsOverview: AppointmentsOverviewPoint[];
  revenueTrend: RevenueTrendPoint[];
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await axiosReact.get<DashboardStats>(DASHBOARD_STATS);
  return data;
};

export const parseDashboardError = (error: unknown): string => {
  const apiError = (
    error as { response?: { data?: { error?: unknown; message?: unknown } } }
  )?.response?.data;

  if (typeof apiError?.error === 'string') return apiError.error;
  if (typeof apiError?.message === 'string') return apiError.message;

  return 'Unable to load dashboard stats. Please try again.';
};
