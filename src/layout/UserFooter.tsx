import {
  Calendar,
  ChevronRight,
  Clock,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '../../public/images/logo.svg';

const quickLinks = [
  { label: 'About Us', href: '/details' },
  { label: 'Our Doctors', href: '/doctors' },
  { label: 'Book Appointment', href: '/appointment' },
  { label: 'Support Chat', href: '/support' },
  { label: 'Contact', href: '/contact-us' },
];

const services = [
  'Emergency Care',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Diagnostics',
];

const UserFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-8 isolate overflow-hidden text-white">
      {/* Soft wave transition into footer */}
      <div className="relative -mb-px h-16 sm:h-20 w-full text-slate-950" aria-hidden>
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <path
            fill="currentColor"
            d="M0,48 C240,80 480,0 720,24 C960,48 1200,80 1440,32 L1440,80 L0,80 Z"
          />
        </svg>
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full opacity-40 text-blue-800"
        >
          <path
            fill="currentColor"
            d="M0,56 C320,16 640,72 960,40 C1120,24 1280,8 1440,36 L1440,80 L0,80 Z"
          />
        </svg>
      </div>

      <div className="relative bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        {/* Background atmosphere: glow + lines + dots */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage:
              'linear-gradient(rgba(59,130,246,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.12) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage:
              'radial-gradient(ellipse at center, black 20%, transparent 75%)',
          }}
        />
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"
          aria-hidden
        />

        <div className="relative container mx-auto px-4 pt-6 pb-10 sm:pt-8 sm:pb-12">
          {/* Top highlight strip */}
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/90 shadow-lg shadow-blue-900/40">
                <HeartPulse size={20} className="text-white" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  24/7 Emergency & Patient Care
                </p>
                <p className="text-xs text-blue-100/70">
                  Compassionate care with advanced medical technology
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-blue-100/80">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <Clock size={12} className="text-blue-300" />
                Open round the clock
              </span>
              <Link
                href="/appointment"
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 font-semibold text-white transition hover:bg-blue-500"
              >
                <Calendar size={12} />
                Book now
                <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:pr-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-white/95 p-1.5 shadow-lg shadow-blue-950/30">
                  <Image
                    src={Logo}
                    alt="Apollo Hospital logo"
                    width={56}
                    height={56}
                    className="h-12 w-auto"
                  />
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight text-white">
                    Apollo Hospital
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-blue-300/80">
                    Care you can trust
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-300/90">
                Providing compassionate healthcare with advanced medical
                technology, expert doctors, and patient-first service.
              </p>
              <div className="mt-5 h-px w-16 bg-gradient-to-r from-blue-400 to-transparent" />
            </div>

            {/* Quick links */}
            <div>
              <h4 className="mb-1 text-sm font-bold uppercase tracking-[0.18em] text-white">
                Quick Links
              </h4>
              <div className="mb-4 h-0.5 w-10 rounded-full bg-blue-500" />
              <ul className="space-y-2.5">
                {quickLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
                    >
                      <ChevronRight
                        size={14}
                        className="text-blue-500 transition group-hover:translate-x-0.5 group-hover:text-blue-300"
                      />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="mb-1 text-sm font-bold uppercase tracking-[0.18em] text-white">
                Services
              </h4>
              <div className="mb-4 h-0.5 w-10 rounded-full bg-blue-500" />
              <ul className="space-y-2.5">
                {services.map((service) => (
                  <li
                    key={service}
                    className="flex items-center gap-2 text-sm text-slate-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400/80" />
                    {service}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-1 text-sm font-bold uppercase tracking-[0.18em] text-white">
                Contact Info
              </h4>
              <div className="mb-4 h-0.5 w-10 rounded-full bg-blue-500" />
              <ul className="space-y-3">
                <li className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm text-slate-300">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-300">
                    <MapPin size={15} />
                  </span>
                  <span>123 Medical Center Drive</span>
                </li>
                <li>
                  <a
                    href="tel:+1234567890"
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm text-slate-300 transition hover:border-blue-400/30 hover:bg-white/[0.06] hover:text-white"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-300">
                      <Phone size={15} />
                    </span>
                    +1 234 567 890
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@apollohospital.com"
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm text-slate-300 transition hover:border-blue-400/30 hover:bg-white/[0.06] hover:text-white"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-300">
                      <Mail size={15} />
                    </span>
                    info@apollohospital.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-slate-400">
              &copy; {year} Apollo Hospital. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400">
              <Link href="/terms" className="transition hover:text-blue-300">
                Terms
              </Link>
              <span className="hidden h-3 w-px bg-white/15 sm:block" />
              <Link href="/privacy" className="transition hover:text-blue-300">
                Privacy
              </Link>
              <span className="hidden h-3 w-px bg-white/15 sm:block" />
              <Link href="/contact-us" className="transition hover:text-blue-300">
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UserFooter;
