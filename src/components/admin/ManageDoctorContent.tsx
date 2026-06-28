'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import {
  Search,
  Stethoscope,
  Users,
  Building2,
  Loader2,
  RotateCw,
  AlertCircle,
  UserRound,
  Pencil,
  Trash,
} from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import EditDoctorModal from './EditDoctorModal';
import Swal from '@/lib/swal';
import {
  fetchDoctors,
  getDepartments,
  updateDoctor,
  deleteDoctor,
  parseDoctorError,
  type Doctor,
  type UpdateDoctorPayload,
} from '@/services/doctorService';

const ALL_DEPARTMENTS = 'all';
const PAGE_SIZE = 10;

const formatDate = (dob: string) => {
  if (!dob) return '—';
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
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

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={doctor.imageUrl}
        alt={doctor.fullName}
        onError={() => setErrored(true)}
        className="w-10 h-10 rounded-xl object-cover shrink-0"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
      {getInitials(doctor.fullName) || <UserRound size={18} />}
    </div>
  );
};

const ManageDoctorContent = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [department, setDepartment] = useState<string>(ALL_DEPARTMENTS);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Loads doctors, optionally with a server-side search term.
  const loadDoctors = async (searchTerm = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDoctors(searchTerm);
      setDoctors(data);
    } catch {
      setError('Unable to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Debounce the search input (400ms) + trim leading/trailing spaces.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(handle);
  }, [search]);

  // Fetch from the server whenever the debounced search term changes.
  useEffect(() => {
    loadDoctors(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Reset to first page whenever filters change.
  useEffect(() => {
    setPage(1);
  }, [department, debouncedSearch]);

  const departments = useMemo(() => getDepartments(doctors), [doctors]);

  // Search is handled server-side; only the department filter runs locally.
  const filteredDoctors = useMemo(() => {
    if (department === ALL_DEPARTMENTS) return doctors;
    const key = department.trim().toLowerCase();
    return doctors.filter((d) => d.department.trim().toLowerCase() === key);
  }, [doctors, department]);

  const handleSaveEdit = async (id: string, payload: UpdateDoctorPayload) => {
    setSaving(true);
    try {
      const updated = await updateDoctor(id, payload);
      setDoctors((prev) => prev.map((d) => (d.id === id ? updated : d)));
      toast.success('Doctor updated successfully');
      setEditing(null);
    } catch (err) {
      toast.error(parseDoctorError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (doctor: Doctor) => {
    const result = await Swal.fire({
      title: 'Delete doctor?',
      text: `${doctor.fullName} will be permanently removed. This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });

    if (!result.isConfirmed) return;

    setDeletingId(doctor.id);
    try {
      await deleteDoctor(doctor.id);
      setDoctors((prev) => prev.filter((d) => d.id !== doctor.id));
      toast.success('Doctor deleted successfully');
    } catch (err) {
      toast.error(parseDoctorError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const total = filteredDoctors.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageDoctors = useMemo(
    () =>
      filteredDoctors.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
      ),
    [filteredDoctors, currentPage]
  );

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Doctors', value: doctors.length, icon: Users, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Departments', value: departments.length, icon: Building2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Showing', value: total, icon: Stethoscope, bg: 'bg-cyan-50', color: 'text-cyan-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Stethoscope size={20} className="text-blue-600" />
              Doctors
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage all registered doctors across departments
            </p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadDoctors(debouncedSearch)}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-60"
            >
              <RotateCw size={15} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm capitalize focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={ALL_DEPARTMENTS}>All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept} className="capitalize">
                  {dept}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email, phone, NIC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/80">
                <th className="px-5 py-3.5">Doctor</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Phone</th>
                <th className="px-5 py-3.5 hidden lg:table-cell">NIC</th>
                <th className="px-5 py-3.5 hidden xl:table-cell">Date of Birth</th>
                <th className="px-5 py-3.5 hidden xl:table-cell">Gender</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Loading doctors...
                    </span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="inline-flex items-center gap-2 text-red-600 text-sm font-medium">
                        <AlertCircle size={16} />
                        {error}
                      </span>
                      <button
                        type="button"
                        onClick={() => loadDoctors(debouncedSearch)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition"
                      >
                        <RotateCw size={14} />
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : pageDoctors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No doctors found matching your filters.
                  </td>
                </tr>
              ) : (
                pageDoctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="border-t border-gray-50 hover:bg-gray-50/50 transition"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <DoctorAvatar doctor={doctor} />
                        <p className="text-sm font-semibold text-gray-900 capitalize">
                          {doctor.fullName}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                        <Stethoscope size={12} />
                        {doctor.department}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      <a
                        href={`mailto:${doctor.email}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {doctor.email}
                      </a>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden md:table-cell">
                      {doctor.phone || '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden lg:table-cell">
                      {doctor.nic || '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden xl:table-cell">
                      {formatDate(doctor.dob)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden xl:table-cell capitalize">
                      {doctor.gender}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(doctor)}
                          className="inline-flex items-center justify-center p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition cursor-pointer"
                          title="Edit Doctor"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(doctor)}
                          disabled={deletingId === doctor.id}
                          className="inline-flex items-center justify-center p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          title="Delete Doctor"
                        >
                          {deletingId === doctor.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && !error && total > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400">
              Showing {rangeStart}&ndash;{rangeEnd} of {total} doctor
              {total === 1 ? '' : 's'} · Page {currentPage} of {totalPages}
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(next) => {
                if (next >= 1 && next <= totalPages && next !== currentPage) {
                  setPage(next);
                }
              }}
            />
          </div>
        )}
      </div>

      <EditDoctorModal
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        doctor={editing}
        onSave={handleSaveEdit}
        saving={saving}
      />
    </>
  );
};

export default ManageDoctorContent;
