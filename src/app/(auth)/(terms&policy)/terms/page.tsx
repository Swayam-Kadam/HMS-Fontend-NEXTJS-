import Link from 'next/link';
import { buildPageMetadata } from '@/lib/metadata';
import LegalDocument from '@/components/legal/LegalDocument';

export const metadata = buildPageMetadata({
  title: 'Terms of Service',
  description:
    'Read the Terms of Service for Apollo Hospital online accounts, appointments, and portal use.',
  path: '/terms',
});

const LAST_UPDATED = '15 July 2026';

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      lastUpdated={LAST_UPDATED}
      alternateHref="/privacy"
      alternateLabel="View Privacy Policy"
      sections={[
        {
          title: '1. Acceptance of Terms',
          body: (
            <p>
              By creating an account or using the Apollo Hospital Management System
              website and patient portal (the &quot;Service&quot;), you agree to these
              Terms of Service. If you do not agree, please do not use the Service.
            </p>
          ),
        },
        {
          title: '2. Accounts',
          body: (
            <>
              <p>
                You must provide accurate registration information and keep your
                login credentials confidential. You are responsible for activity
                that occurs under your account. Notify us promptly if you suspect
                unauthorized access.
              </p>
              <p>
                We may suspend or terminate accounts that violate these terms or
                pose a security risk to patients, staff, or hospital systems.
              </p>
            </>
          ),
        },
        {
          title: '3. Appointments and Services',
          body: (
            <>
              <p>
                Online appointment requests are subject to confirmation by Apollo
                Hospital staff. Availability, specialty assignment, and visit times
                may change based on clinical need and operational capacity.
              </p>
              <p>
                Scheduling online does not guarantee emergency care. For
                life-threatening situations, call emergency services or go to the
                nearest emergency department immediately.
              </p>
            </>
          ),
        },
        {
          title: '4. Acceptable Use',
          body: (
            <p>
              You agree not to misuse the Service, including attempting to access
              another person&apos;s records, transmitting malware, scraping data
              without permission, or using the portal for unlawful, abusive, or
              fraudulent purposes.
            </p>
          ),
        },
        {
          title: '5. Medical Disclaimer',
          body: (
            <p>
              Content on this website and information exchanged through the portal
              are for general healthcare coordination and do not replace
              professional medical advice, diagnosis, or treatment. Always seek the
              guidance of qualified clinicians for personal medical decisions.
            </p>
          ),
        },
        {
          title: '6. Limitation of Liability',
          body: (
            <p>
              To the fullest extent permitted by law, Apollo Hospital and its
              affiliates are not liable for indirect, incidental, or consequential
              damages arising from use of the Service, including delays in
              appointment confirmation, temporary outages, or reliance on general
              website content.
            </p>
          ),
        },
        {
          title: '7. Changes to These Terms',
          body: (
            <p>
              We may update these Terms of Service from time to time. Continued use
              of the Service after changes are posted constitutes acceptance of the
              revised terms. The &quot;Last updated&quot; date at the top of this page
              reflects the latest revision.
            </p>
          ),
        },
        {
          title: '8. Contact',
          body: (
            <p>
              Questions about these terms may be sent to{' '}
              <a
                href="mailto:info@apollohospital.com"
                className="text-blue-600 hover:underline"
              >
                info@apollohospital.com
              </a>{' '}
              or through our{' '}
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
