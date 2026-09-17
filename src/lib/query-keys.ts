export const queryKeys = {
  profile: ['profile'] as const,
  appointments: (page: number, limit: number, status: string) =>
    ['appointments', page, limit, status] as const,
  messageCount: ['message-count'] as const,
  messages: (page: number, limit: number, tag: string) =>
    ['messages', page, limit, tag] as const,
  doctors: (search?: string) => ['doctors', search ?? ''] as const,
  adminUsers: (page: number, limit: number, bloodGroup: string, search: string) =>
    ['admin-users', page, limit, bloodGroup, search] as const,
  adminAppointments: (page: number, limit: number, status: string, search: string) =>
    ['admin-appointments', page, limit, status, search] as const,
  adminMessages: (
    page: number,
    limit: number,
    tag: string,
    replyStatus: string,
    search: string
  ) => ['admin-messages', page, limit, tag, replyStatus, search] as const,
  adminContacts: (
    page: number,
    limit: number,
    subject: string,
    readStatus: string,
    search: string
  ) => ['admin-contacts', page, limit, subject, readStatus, search] as const,
  dashboardStats: ['dashboard-stats'] as const,
  statusChangeEmail: ['status-change-email'] as const,
  videoStatus: (appointmentId: string) => ['video-status', appointmentId] as const,
  supportConversationsMe: ['support-conversations-me'] as const,
  supportMessages: (conversationId: string) =>
    ['support-messages', conversationId] as const,
  adminSupportConversations: (
    page: number,
    limit: number,
    status: string,
    search: string,
    unreadOnly: boolean
  ) =>
    [
      'admin-support-conversations',
      page,
      limit,
      status,
      search,
      unreadOnly,
    ] as const,
};
