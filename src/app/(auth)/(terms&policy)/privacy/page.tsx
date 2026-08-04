import Link from 'next/link';
import { buildPageMetadata } from '@/lib/metadata';
import LegalDocument from '@/components/legal/LegalDocument';

export const metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description:
    'Learn how Apollo Hospital collects, uses, and protects your personal and health-related information.',
  path: '/privacy',
});

const LAST_UPDATED = '15 July 2026';

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      alternateHref="/terms"
      alternateLabel="View Terms of Service"
      sections={[
        {
          title: '1. Information We Collect',
          body: (
            <>
              <p>
                We may collect information you provide when registering, booking
                appointments, contacting us, or managing your profile, such as your
                name, email address, phone number, date of birth, and appointment
                details.
              </p>
              <p>
                Technical data such as browser type, device information, and basic
                usage logs may also be collected to operate and secure the Service.
              </p>
            </>
          ),
        },
        {
          title: '2. How We Use Your Information',
          body: (
            <p>
              We use your information to create and manage your account, schedule
              and communicate about appointments, respond to inquiries, improve the
              portal experience, and protect against fraud or misuse of hospital
              systems.
            </p>
          ),
        },
        {
          title: '3. Cookies and Session Data',
          body: (
            <p>
              Authentication uses secure httpOnly cookies to keep you signed in and
              protect session integrity. These cookies are required for core
              portal features (login, profile, appointments) and are not used for
              third-party advertising.
            </p>
          ),
        },
        {
          title: '4. Sharing of Information',
          body: (
            <p>
              We do not sell your personal information. Data may be shared with
              authorized Apollo Hospital staff and trusted service providers only as
              needed to operate the hospital management system, process payments
              where applicable, or comply with legal obligations.
            </p>
          ),
        },
        {
          title: '5. Security',
          body: (
            <p>
              We apply reasonable administrative and technical safeguards to protect
              account and appointment data. No online system is completely secure;
              please use a strong password and avoid sharing your credentials.
            </p>
          ),
        },
        {
          title: '6. Your Rights',
          body: (
            <p>
              Subject to applicable law and hospital policy, you may request access
              to or correction of certain personal information associated with your
              account by contacting us. Some records may be retained as required for
              clinical or legal purposes.
            </p>
          ),
        },
        {
          title: '7. Data Retention',
          body: (
            <p>
              We retain account and appointment-related information for as long as
              needed to provide the Service and meet operational, medical, or legal
              requirements. When data is no longer required, we take steps to delete
              or de-identify it where appropriate.
            </p>
          ),
        },
        {
          title: '8. Contact',
          body: (
            <p>
              Privacy questions may be sent to{' '}
              <a
                href="mailto:info@apollohospital.com"
                className="text-blue-600 hover:underline"
              >
                info@apollohospital.com
              </a>{' '}
              or via our{' '}
              <Link href="/contact-us" className="text-blue-600 hover:underline">
                Contact Us
              </Link>{' '}
              page.
            </p>
          ),
        },
      ]}
    />
  );
}
