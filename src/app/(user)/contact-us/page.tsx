import type { Metadata } from 'next';
import ContactUsContent from '@/components/contact/ContactUsContent';

export const metadata: Metadata = {
  title: 'Contact Us | Apollo Hospital',
  description:
    'Contact Apollo Hospital for appointments, emergencies, or inquiries. We are available 24/7 to assist you.',
};

export default function ContactUsPage() {
  return <ContactUsContent />;
}
