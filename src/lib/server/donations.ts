import { serverGet } from '@/lib/server/fetch';
import {
  mapApiDonor,
  type ApiDonor,
  type Donor,
  type DonorType,
} from '@/services/donationService';

interface ApiDonatorsResponse {
  donators?: ApiDonor[];
}

async function fetchDonorsByType(type: DonorType): Promise<Donor[]> {
  const data = await serverGet<ApiDonatorsResponse>('/donation/donators', {
    [type]: 'true',
  });
  const list = data?.donators ?? [];
  return list.map((donor, index) => mapApiDonor(donor, type, index));
}

/** Fetches blood and heart donors on the server for the public donation page. */
export async function fetchDonorsServer(): Promise<{
  blood: Donor[];
  heart: Donor[];
}> {
  const [blood, heart] = await Promise.all([
    fetchDonorsByType('blood'),
    fetchDonorsByType('heart'),
  ]);
  return { blood, heart };
}
