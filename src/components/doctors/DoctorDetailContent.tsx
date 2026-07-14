import Link from 'next/link';
import {
  Stethoscope,
  Mail,
  Calendar,
  BookUser,
  VenusAndMars,
  Phone,
  ArrowLeft,
  UserRound,
} from 'lucide-react';
import { buildDoctorImageUrl, type Doctor } from '@/services/doctorService';

const formatDate = (dob: string) => {
  if (!dob) return '—';
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getInitials = (name: string) =>
  name
    .replace(/^dr\.?\s*/i, '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const resolveImageUrl = (imageUrl: string) => {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return buildDoctorImageUrl(imageUrl);
};

const DoctorDetailContent = ({ doctor }: { doctor: Doctor }) => {
  const imageSrc = resolveImageUrl(doctor.imageUrl);

  const details = [
    { label: 'Email', value: doctor.email, icon: Mail, href: doctor.email ? `mailto:${doctor.email}` : undefined },
    { label: 'Phone', value: doctor.phone || '—', icon: Phone, href: doctor.phone ? `tel:${doctor.phone}` : undefined },
    { label: 'Date of Birth', value: formatDate(doctor.dob), icon: Calendar },
    { label: 'NIC', value: doctor.nic || '—', icon: BookUser },
    { label: 'Gender', value: doctor.gender, icon: VenusAndMars },
    { label: 'Department', value: doctor.department, icon: Stethoscope },
  ];

  return (
    <div className="container mx-auto px-4 max-w-7xl -mt-12 sm:-mt-16 relative z-10 pb-16">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
        <div className="h-24 sm:h-28 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900" />

        <div className="px-6 sm:px-10 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6 -mt-14 sm:-mt-16">
            <div className="relative shrink-0 mx-auto lg:mx-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center">
                {imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageSrc}
                    alt={doctor.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {getInitials(doctor.fullName) || <UserRound size={36} />}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left pt-2 lg:pb-1">
              <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 ">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 capitalize">
                  {doctor.fullName}
                </h2>
                <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100 w-fit mx-auto lg:mx-0">
                  <Stethoscope size={12} />
                  {doctor.department}
                </span>
              </div>
              <p className="text-gray-500 text-sm sm:text-base">{doctor.email}</p>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-end gap-3 shrink-0">
              <Link
                href="/doctors"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition"
              >
                <ArrowLeft size={15} />
                Back to Doctors
              </Link>
              <Link
                href="/appointment"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200"
              >
                <Calendar size={15} />
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope size={20} className="text-blue-600" />
            Doctor Details
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Contact information and profile details
          </p>
        </div>

        <div className="px-4 sm:px-6 pb-6 pt-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {details.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-4"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <item.icon size={18} className="text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {item.label}
                  </p>
                  {item.href && item.value !== '—' ? (
                    <a
                      href={item.href}
                      className="text-sm font-semibold text-gray-900 mt-0.5 block truncate hover:text-blue-600 hover:underline"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 mt-0.5 capitalize truncate">
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailContent;
