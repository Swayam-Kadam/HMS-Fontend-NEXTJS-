export const LOGIN = "/auth/login/";
export const SIGNUP = "/auth/createuser/";
export const FETCH_USER = "/auth/fetch/";
export const FETCH_ALL_USERS = "/auth/all";
export const UPDATE_USER = (id: string) => `/auth/update/${id}/`;
// NOTE: backend delete route is not implemented yet; this is the assumed path.
export const DELETE_USER = (id: string) => `/auth/delete/${id}`;
export const APPOINTMENT = "/appointment/appo";
export const APPOINTMENT_USER = "/appointment/appouser";
export const APPOINTMENT_CANCEL = (id: string) => `/appointment/cancel/${id}`;
export const APPOINTMENT_EDIT = (id: string) => `/appointment/appo/${id}`;
export const APPOINTMENT_UPDATE_STATUS = (id: string) =>
  `/appointment/update-status/${id}`;
export const APPOINTMENT_CHECKOUT = "/appointment/create-checkout-session";
export const APPOINTMENT_VERIFY_PAYMENT = "/appointment/verify-payment";
export const DOCTORS = "/doctor";
export const DOCTOR_BY_ID = (id: string) => `/doctor/${id}`;
export const MESSAGE_SEND = "/message/send";
export const MESSAGE_USER = "/message/specific-user";
export const MESSAGE_FETCH = "/message/fetch";
export const MESSAGE_REPLY = (id: string) => `/message/message-update/${id}`;
export const SUPPORT_CONVERSATIONS = "/support/conversations";
export const SUPPORT_CONVERSATIONS_ME = "/support/conversations/me";
export const SUPPORT_CONVERSATION_MESSAGES = (id: string) =>
  `/support/conversations/${id}/messages`;
export const SUPPORT_CONVERSATION_READ = (id: string) =>
  `/support/conversations/${id}/read`;
export const SUPPORT_ADMIN_CONVERSATIONS = "/support/admin/conversations";
export const SUPPORT_ADMIN_ASSIGN = (id: string) =>
  `/support/admin/conversations/${id}/assign`;
export const SUPPORT_ADMIN_STATUS = (id: string) =>
  `/support/admin/conversations/${id}/status`;
export const CHATBOT_MESSAGE = "/chatbot/message";
export const CONTACT_SEND = "/contact/send";
export const CONTACT_GET = "/contact/get";
export const CONTACT_READ_STATUS = (id: string) => `/contact/read-status/${id}`;
export const DONATION_DONATORS = "/donation/donators";
export const DASHBOARD_STATS = "/dashboard/stats";
export const STATUS_EMAIL_SETTING = "/settings/status-email";