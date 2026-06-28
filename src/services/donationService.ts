import { axiosReact } from '@/services/api';
import { DONATION_DONATORS } from '@/services/url';

export type DonorType = 'blood' | 'heart';

export interface ApiDonor {
  name: string;
  email: string;
  DOB?: string;
  gender?: string;
  bloodGroup: string;
}

interface ApiDonatorsResponse {
  total: number;
  donators: ApiDonor[];
}

export interface Donor {
  id: string;
  name: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  contact: string;
}

export const mapApiDonor = (donor: ApiDonor, type: DonorType, index: number): Donor => ({
  id: `${type}-${donor.email || index}`,
  name: donor.name,
  dob: donor.DOB || '',
  gender: donor.gender?.trim() || '—',
  bloodGroup: donor.bloodGroup,
  contact: donor.email,
});

export const fetchDonors = async (type: DonorType): Promise<Donor[]> => {
  const { data } = await axiosReact.get<ApiDonatorsResponse>(DONATION_DONATORS, {
    params: { [type]: true },
  });

  const list = Array.isArray(data?.donators) ? data.donators : [];
  return list.map((donor, index) => mapApiDonor(donor, type, index));
};
