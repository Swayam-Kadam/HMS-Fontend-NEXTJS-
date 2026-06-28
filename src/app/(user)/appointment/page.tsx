import type { Metadata } from 'next';
import AppointmentContent from '@/components/appointment/AppointmentContent';

export const metadata: Metadata = {
  title: 'Book Appointment | Apollo Hospital',
  description:
    'Schedule your visit with Apollo Hospital expert doctors. Quick and convenient online appointment booking.',
};

export default function AppointmentPage() {
  return <AppointmentContent />;
}
