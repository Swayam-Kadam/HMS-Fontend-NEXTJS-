'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Stethoscope,
  Search,
  Mail,
  Calendar,
  BookUser,
  VenusAndMars,
  Users,
  Building2,
  Loader2,
  AlertCircle,
  RefreshCw,
  UserRound,
} from 'lucide-react';
import {
  fetchDoctors,
  getDepartments,
  type Doctor,
} from '@/services/doctorService';

const ALL_DEPARTMENTS = 'all';

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

const DoctorAvatar = ({ doctor }: { doctor: Doctor }) => {
  const [errored, setErrored] = useState(false);
  const showImage = doctor.imageUrl && !errored;

  return (
    <div className="relative h-44 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center overflow-hidden">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={doctor.imageUrl}
          alt={doctor.fullName}
          onError={() => setErrored(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-white font-bold text-2xl">
          {getInitials(doctor.fullName) || <UserRound size={32} />}
        </div>
      )}
      <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-blue-700 text-xs font-semibold shadow-sm">
        <Stethoscope size={12} />
        {doctor.department}
      </span>
    </div>
  );
};

const DoctorCard = ({ doctor }: { doctor: Doctor }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
    <DoctorAvatar doctor={doctor} />
    <div className="p-5">
      <h4 className="font-bold text-gray-900 capitalize truncate text-lg">{doctor.fullName}</h4>
      <p className="text-blue-600 text-sm font-medium mb-4">{doctor.department}</p>

      <div className="space-y-2.5 text-sm">
        <div className="flex items-center gap-2.5 text-gray-600">
          <Mail size={14} className="text-gray-400 shrink-0" />
          <a href={`mailto:${doctor.email}`} className="truncate hover:text-blue-600 hover:underline">
            {doctor.email}
          </a>
        </div>
        <div className="flex items-center gap-2.5 text-gray-600">
          <Calendar size={14} className="text-gray-400 shrink-0" />
          <span>{formatDate(doctor.dob)}</span>
        </div>
        <div className="flex items-center gap-2.5 text-gray-600">
          <BookUser size={14} className="text-gray-400 shrink-0" />
          <span className="truncate">NIC: {doctor.nic || '—'}</span>
        </div>
        <div className="flex items-center gap-2.5 text-gray-600">
          <VenusAndMars size={14} className="text-gray-400 shrink-0" />
          <span>{doctor.gender}</span>
        </div>
      </div>
    </div>
  </div>
);

const DoctorsContent = ({ initialDoctors }: { initialDoctors?: Doctor[] }) => {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors ?? []);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState<string>(ALL_DEPARTMENTS);
  const [loading, setLoading] = useState(!initialDoctors);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Skip client fetch when doctors were server-rendered (unless user hits Retry).
    if (initialDoctors && reloadKey === 0) return;

    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDoctors();
        if (!active) return;
        setDoctors(data);
      } catch {
        if (!active) return;
        setError('Unable to load doctors. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [reloadKey, initialDoctors]);

  const departments = useMemo(() => getDepartments(doctors), [doctors]);

  const filteredDoctors = useMemo(() => {
    const query = search.toLowerCase().trim();
    return doctors.filter((d) => {
      const matchesDept =
        department === ALL_DEPARTMENTS ||
        d.department.trim().toLowerCase() === department.trim().toLowerCase();
      if (!matchesDept) return false;
      if (!query) return true;
      return (
        d.fullName.toLowerCase().includes(query) ||
        d.department.toLowerCase().includes(query) ||
        d.email.toLowerCase().includes(query)
      );
    });
  }, [doctors, search, department]);

  return (
    <div className="container mx-auto px-4 max-w-7xl -mt-12 sm:-mt-16 relative z-10 pb-16">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Doctors', value: doctors.length, icon: Users, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
          { label: 'Departments', value: departments.length, icon: Building2, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
          { label: 'Showing', value: filteredDoctors.length, icon: Stethoscope, iconBg: 'bg-cyan-50', iconColor: 'text-cyan-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.iconBg}`}>
              <stat.icon size={20} className={stat.iconColor} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setDepartment(ALL_DEPARTMENTS)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                department === ALL_DEPARTMENTS
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-gray-50 text-gray-600 hover:text-blue-600'
              }`}
            >
              All Departments
            </button>
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setDepartment(dept)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap capitalize ${
                  department.toLowerCase() === dept.toLowerCase()
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-gray-50 text-gray-600 hover:text-blue-600'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="relative shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, department, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Section Title */}
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope size={20} className="text-blue-600" />
            Our Doctors
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {loading
              ? 'Loading doctors…'
              : `${filteredDoctors.length} doctor${filteredDoctors.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 pb-6 pt-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm py-16">
              <Loader2 size={18} className="animate-spin" />
              Loading doctors…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <span className="inline-flex items-center gap-2 text-red-600 text-sm font-medium">
                <AlertCircle size={16} />
                {error}
              </span>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-16">No doctors found matching your filters.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorsContent;
