import { serverGet } from '@/lib/server/fetch';
import {
  mapApiDoctor,
  type ApiDoctor,
  type Doctor,
} from '@/services/doctorService';

/** Fetches doctors on the server for public pages (SSR / RSC). */
export async function fetchDoctorsServer(search?: string): Promise<Doctor[]> {
  const params = search?.trim() ? { search: search.trim() } : undefined;
  const data = await serverGet<ApiDoctor[]>('/doctor', params);
  if (!data) return [];
  return data.map(mapApiDoctor);
}

/** Fetches a single doctor by Mongo `_id` for public detail pages. */
export async function fetchDoctorByIdServer(id: string): Promise<Doctor | null> {
  const data = await serverGet<ApiDoctor>(`/doctor/${id}`);
  if (!data) return null;
  return mapApiDoctor(data);
}
