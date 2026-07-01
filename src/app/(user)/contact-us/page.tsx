import ContactUsContent from '@/components/contact/ContactUsContent';
import { buildPageMetadata } from '@/lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Contact Us',
  description:
    'Contact Apollo Hospital for appointments, emergencies, or inquiries. We are available 24/7 to assist you.',
  path: '/contact-us',
});

export default function ContactUsPage() {
  return <ContactUsContent />;
}
