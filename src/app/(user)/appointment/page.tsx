import AppointmentContent from '@/components/appointment/AppointmentContent';
import { buildPageMetadata } from '@/lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Book Appointment',
  description:
    'Schedule your visit with Apollo Hospital expert doctors. Quick and convenient online appointment booking.',
  path: '/appointment',
  image: '/images/about/appointment.jpg',
});

export default function AppointmentPage() {
  return <AppointmentContent />;
}
