import { axiosReact } from '@/services/api';
import { VIDEO_END, VIDEO_STATUS, VIDEO_TOKEN } from '@/services/url';

export interface VideoJoinWindow {
  canJoin: boolean;
  reason: string | null;
  startsAt: string | null;
  endsAt: string | null;
}

export interface VideoStatusResponse {
  appointmentId: string;
  appointmentType: string;
  status: string;
  callStatus: string;
  doctor: string;
  department: string;
  preferredDate: string;
  preferredTime: string;
  videoRoomReady: boolean;
  canJoin: boolean;
  joinMessage: string | null;
  joinWindow: VideoJoinWindow;
  dailyConfigured: boolean;
}

export interface VideoTokenResponse {
  roomUrl: string;
  token: string;
  roomName: string;
  callStatus: string;
}

export async function fetchVideoStatus(appointmentId: string) {
  const { data } = await axiosReact.get<VideoStatusResponse>(VIDEO_STATUS(appointmentId));
  return data;
}

export async function fetchVideoToken(appointmentId: string) {
  const { data } = await axiosReact.get<VideoTokenResponse>(VIDEO_TOKEN(appointmentId));
  return data;
}

export async function endVideoCall(appointmentId: string) {
  const { data } = await axiosReact.post(VIDEO_END(appointmentId));
  return data;
}
