'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelAppointment,
  fetchAdminAppointments,
  fetchStatusChangeEmailSetting,
  fetchUserAppointments,
  updateAppointmentStatusAdmin,
  updateStatusChangeEmailSetting,
  type AppointmentStatusFilter,
  type ProfileAppointmentStatus,
} from '@/services/appointmentService';
import { fetchDashboardStats } from '@/services/dashboardService';
import {
  fetchAdminContacts,
  updateContactReadStatus,
  type ContactReadFilter,
  type ContactSubjectFilter,
} from '@/services/contactService';
import {
  deleteDoctor,
  fetchDoctors,
  updateDoctor,
  type UpdateDoctorPayload,
} from '@/services/doctorService';
import {
  fetchAdminMessages,
  fetchUserMessages,
  replyToMessage,
  sendMessage,
  type MessageReplyStatusFilter,
  type MessageTagFilter,
} from '@/services/messageService';
import {
  assignSupportConversation,
  createSupportConversation,
  fetchAdminSupportConversations,
  fetchMySupportConversations,
  fetchSupportMessages,
  markSupportConversationRead,
  updateSupportConversationStatus,
  type AdminSupportStatusFilter,
  type SupportConversationStatus,
} from '@/services/supportChatService';
import {
  deleteUser,
  fetchAllUsers,
  fetchUser,
  updateUser,
} from '@/services/profileService';
import { queryKeys } from '@/lib/query-keys';
import { useAuthQueryEnabled } from '@/hooks/useAuthQueryEnabled';

export function useProfileQuery() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchUser,
    enabled,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateUser(id, formData),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile, data);
    },
  });
}

export function useUserAppointmentsQuery(
  page: number,
  limit: number,
  status: AppointmentStatusFilter
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.appointments(page, limit, status),
    queryFn: () => fetchUserAppointments(page, limit, status),
    enabled,
  });
}

export function useMessageCountQuery() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.messageCount,
    queryFn: () => fetchUserMessages(1, 1, 'all'),
    enabled,
    select: (data) => data.total,
  });
}

export function useUserMessagesQuery(
  page: number,
  limit: number,
  tag: MessageTagFilter,
  active: boolean
) {
  const enabled = useAuthQueryEnabled() && active;
  return useQuery({
    queryKey: queryKeys.messages(page, limit, tag),
    queryFn: () => fetchUserMessages(page, limit, tag),
    enabled,
  });
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.messageCount });
    },
  });
}

export function useCancelAppointmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useDoctorsQuery(search = '', enabled = true) {
  return useQuery({
    queryKey: queryKeys.doctors(search),
    queryFn: () => fetchDoctors(search),
    enabled,
  });
}

export function useDashboardStatsQuery() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: fetchDashboardStats,
    enabled,
  });
}

export function useAdminDoctorsQuery(search: string) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.doctors(search),
    queryFn: () => fetchDoctors(search),
    enabled,
  });
}

export function useUpdateDoctorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDoctorPayload }) =>
      updateDoctor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
}

export function useDeleteDoctorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
}

export function useAdminUsersQuery(
  page: number,
  limit: number,
  bloodGroup: string,
  search: string
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.adminUsers(page, limit, bloodGroup, search),
    queryFn: () =>
      fetchAllUsers({
        page,
        limit,
        bloodGroup: bloodGroup === 'all' ? undefined : bloodGroup,
        search,
      }),
    enabled,
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useAdminAppointmentsQuery(
  page: number,
  limit: number,
  status: 'all' | ProfileAppointmentStatus,
  search: string
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.adminAppointments(page, limit, status, search),
    queryFn: () => fetchAdminAppointments(page, limit, status, search),
    enabled,
  });
}

export function useAdminMessagesQuery(
  page: number,
  limit: number,
  tag: MessageTagFilter,
  replyStatus: MessageReplyStatusFilter,
  search: string
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.adminMessages(page, limit, tag, replyStatus, search),
    queryFn: () => fetchAdminMessages(page, limit, tag, replyStatus, search),
    enabled,
  });
}

export function useAdminContactsQuery(
  page: number,
  limit: number,
  subject: ContactSubjectFilter,
  readStatus: ContactReadFilter,
  search: string
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.adminContacts(page, limit, subject, readStatus, search),
    queryFn: () => fetchAdminContacts(page, limit, subject, readStatus, search),
    enabled,
  });
}

export function useStatusChangeEmailQuery() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.statusChangeEmail,
    queryFn: fetchStatusChangeEmailSetting,
    enabled,
  });
}

export function useUpdateStatusChangeEmailMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStatusChangeEmailSetting,
    onSuccess: (data) => {
      queryClient.setQueryData(
        queryKeys.statusChangeEmail,
        data.statusChangeEmailEnabled
      );
    },
  });
}

export function useUpdateAppointmentStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: ProfileAppointmentStatus;
    }) => updateAppointmentStatusAdmin(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
    },
  });
}

export function useUpdateContactReadStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) =>
      updateContactReadStatus(id, read),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
    },
  });
}

export function useReplyToMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) =>
      replyToMessage(id, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
    },
  });
}

export function useMySupportConversationsQuery(active = true) {
  const enabled = useAuthQueryEnabled() && active;
  return useQuery({
    queryKey: queryKeys.supportConversationsMe,
    queryFn: fetchMySupportConversations,
    enabled,
  });
}

export function useSupportMessagesQuery(
  conversationId: string | null,
  active = true
) {
  const enabled = useAuthQueryEnabled() && active && Boolean(conversationId);
  return useQuery({
    queryKey: queryKeys.supportMessages(conversationId || 'none'),
    queryFn: () => fetchSupportMessages(conversationId!),
    enabled,
  });
}

export function useCreateSupportConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupportConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.supportConversationsMe,
      });
    },
  });
}

export function useMarkSupportReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markSupportConversationRead,
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.supportConversationsMe,
      });
      queryClient.invalidateQueries({
        queryKey: ['admin-support-conversations'],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.supportMessages(conversation.id),
      });
    },
  });
}

export function useAdminSupportConversationsQuery(
  page: number,
  limit: number,
  status: AdminSupportStatusFilter,
  search: string,
  unreadOnly: boolean
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.adminSupportConversations(
      page,
      limit,
      status,
      search,
      unreadOnly
    ),
    queryFn: () =>
      fetchAdminSupportConversations(page, limit, status, search, unreadOnly),
    enabled,
  });
}

export function useAssignSupportConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignSupportConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-support-conversations'],
      });
    },
  });
}

export function useUpdateSupportStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: SupportConversationStatus;
    }) => updateSupportConversationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-support-conversations'],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.supportConversationsMe,
      });
    },
  });
}
