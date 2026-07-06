import type { StaticImageData } from 'next/image';
import ImageDoctor1 from '../../../public/images/doctors/image1.png';
import ImageDoctor2 from '../../../public/images/doctors/image2.png';
import ImageDoctor3 from '../../../public/images/doctors/image3.png';
import ImageDoctor4 from '../../../public/images/doctors/image4.png';

export type FeaturedDoctor = {
  name: string;
  department: string;
  image: StaticImageData;
};

export const FEATURED_DOCTORS: readonly FeaturedDoctor[] = [
  { name: 'Dr. chang ching', department: 'Oncology', image: ImageDoctor1 },
  { name: 'Dr. Sneha Reddy', department: 'Dermatology', image: ImageDoctor2 },
  { name: 'Dr. Amelia Harper', department: 'ENT', image: ImageDoctor3 },
  { name: 'Dr. Naveen Kumar', department: 'General', image: ImageDoctor4 },
] as const;

export const FEATURED_DOCTOR_COUNT = FEATURED_DOCTORS.length;
