'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import {
  CalendarCheck,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Stethoscope,
  User,
  Mail,
  Phone,
  Ban,
  BadgeCheck,
  Loader2,
  RotateCw,
} from 'lucide-react';
import AdminModal from './AdminModal';
import Pagination from '@/components/common/Pagination';
import {
  AdminAppointment,
  ProfileAppointmentStatus,
  fetchAdminAppointments,
  updateAppointmentStatusAdmin,
  parseAppointmentError,
  type AppointmentListStats,
} from '@/services/appointmentService';

const statusStyles: Record<ProfileAppointmentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
};

const statusLabels: Record<ProfileAppointmentStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

const statusOptions: ProfileAppointmentStatus[] = [
  'pending',
  'accepted',
  'rejected',
  'cancelled',
  'completed',
];

const PAGE_SIZE = 10;

const ManageAppointmentContent = () => {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | ProfileAppointmentStatus>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<AdminAppointment | null>(null);
  const [stats, setStats] = useState<AppointmentListStats | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce the raw search input (400ms) and trim leading/trailing spaces so a
  // request only fires once the user pauses typing.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(handle);
  }, [search]);

  // Fetch a single page (10 items) from the server, applying the status filter
  // and debounced search. The backend keeps total/totalPages accurate for them.
  const loadAppointments = async (
    targetPage: number,
    statusFilter: 'all' | ProfileAppointmentStatus,
    searchTerm: string
  ) => {
    setLoading(true);
    try {
      const data = await fetchAdminAppointments(
        targetPage,
        PAGE_SIZE,
        statusFilter,
        searchTerm
      );
      setAppointments(data.appointments);
      setTotal(data.total);
      setTotalPages(Math.max(1, data.totalPages));
      setStats(data.stats);
      // If the server reports fewer pages than the requested page (e.g. after
      // deletions or a narrower filter), snap back to the last valid page.
      if (data.currentPage !== targetPage) {
        setPage(data.currentPage);
      }
    } catch (error) {
      const parsed = parseAppointmentError(error);
      toast.error(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments(page, filter, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter, debouncedSearch]);

  const statsData = useMemo(
    () => ({
      total: total || 0,
        pending: stats?.pending || 0,
        accepted: stats?.accepted || 0,
        completed: stats?.completed || 0,
        rejected: stats?.rejected || 0,
        cancelled: stats?.cancelled || 0,
    }),
    [stats, total]
  );

  const handleStatusChange = async (
    id: string,
    status: ProfileAppointmentStatus
  ) => {
    const current = appointments.find((a) => a.id === id);
    if (!current || current.status === status) return;

    setUpdatingId(id);
    try {
      const updated = await updateAppointmentStatusAdmin(id, status);
      const nextStatus = (updated?.status as ProfileAppointmentStatus) || status;

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a))
      );
      setSelected((prev) =>
        prev && prev.id === id ? { ...prev, status: nextStatus } : prev
      );
      toast.success(`Appointment marked as ${statusLabels[nextStatus]}`);
    } catch (error) {
      const parsed = parseAppointmentError(error);
      toast.error(parsed.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const goToPage = (next: number) => {
    if (next < 1 || next > totalPages || next === page) return;
    setPage(next);
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Appointments', value: statsData.total, icon: CalendarCheck, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Pending', value: statsData.pending, icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
          { label: 'Accepted', value: statsData.accepted, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Completed', value: statsData.completed, icon: BadgeCheck, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Rejected', value: statsData.rejected, icon: XCircle, bg: 'bg-red-50', color: 'text-red-600' },
          { label: 'Cancelled', value: statsData.cancelled, icon: XCircle, bg: 'bg-gray-50', color: 'text-gray-600' },
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CalendarCheck size={20} className="text-blue-600" />
              All Appointments
            </h2>
            <p className="text-sm text-gray-500 mt-1">Manage and update appointment status</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => loadAppointments(page, filter, debouncedSearch)}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-60"
            >
              <RotateCw size={15} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as typeof filter);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {statusLabels[opt]}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email, phone, doctor..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/80">
                <th className="px-5 py-3.5">Patient</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Contact</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5 hidden lg:table-cell">Doctor</th>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Loading appointments...
                    </span>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900 text-sm">{appt.fullName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{appt.appointmentType}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-sm text-gray-600">{appt.email}</p>
                      <p className="text-xs text-gray-400">{appt.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-gray-800">{appt.department}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden lg:table-cell">{appt.doctor}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-800">{appt.preferredDate}</p>
                      <p className="text-xs text-gray-400">{appt.preferredTime}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusStyles[appt.status]}`}>
                        {statusLabels[appt.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setSelected(appt)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        >
                          <Eye size={13} />
                          View
                        </button>
                        <select
                          value={appt.status}
                          disabled={updatingId === appt.id}
                          onChange={(e) => handleStatusChange(appt.id, e.target.value as ProfileAppointmentStatus)}
                          className="text-xs font-semibold px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer disabled:opacity-60"
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt} value={opt}>{statusLabels[opt]}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && total > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400">
              Showing {rangeStart}&ndash;{rangeEnd} of {total} appointment
              {total === 1 ? '' : 's'} · Page {page} of {totalPages}
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </div>
        )}
      </div>

      {/* Quick action cards */}
      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        {[
          { label: 'Accept Pending', desc: 'Approve a pending appointment', icon: CheckCircle2, color: 'text-emerald-600', bg: 'hover:border-emerald-300' },
          { label: 'Mark Completed', desc: 'Close out a finished visit', icon: BadgeCheck, color: 'text-blue-600', bg: 'hover:border-blue-300' },
          { label: 'Reject / Cancel', desc: 'Reject or cancel an appointment', icon: Ban, color: 'text-red-600', bg: 'hover:border-red-300' },
        ].map((action) => (
          <div key={action.label} className={`bg-white rounded-xl border border-gray-100 p-4 ${action.bg} transition`}>
            <action.icon size={22} className={`${action.color} mb-2`} />
            <p className="font-semibold text-gray-900 text-sm">{action.label}</p>
            <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
          </div>
        ))}
      </div>

      {/* View Modal */}
      <AdminModal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Appointment Details"
        subtitle={selected ? `Booked on ${selected.bookedOn}` : undefined}
        footer={
          selected && (
            <>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
              >
                Close
              </button>
              <div className="flex gap-2 flex-wrap">
                {statusOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    disabled={updatingId === selected.id}
                    onClick={() => handleStatusChange(selected.id, opt)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border transition disabled:opacity-60 ${
                      selected.status === opt
                        ? statusStyles[opt]
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {statusLabels[opt]}
                  </button>
                ))}
              </div>
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusStyles[selected.status]}`}>
                {statusLabels[selected.status]}
              </span>
              <span className="text-xs text-gray-400">{selected.appointmentType}</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: User, label: 'Patient', value: selected.fullName },
                { icon: Mail, label: 'Email', value: selected.email },
                { icon: Phone, label: 'Phone', value: selected.phone },
                { icon: Stethoscope, label: 'Doctor', value: selected.doctor },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <item.icon size={16} className="text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400">Department</p>
                <p className="font-semibold text-gray-900">{selected.department}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400">Date & Time</p>
                <p className="font-semibold text-gray-900">
                  {selected.preferredDate} · {selected.preferredTime}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400">Gender</p>
                <p className="font-semibold text-gray-900">{selected.gender}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400">NIC</p>
                <p className="font-semibold text-gray-900">{selected.nic}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Reason for Visit</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 border border-gray-100">{selected.reason}</p>
            </div>

            {selected.notes && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes</p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">{selected.notes}</p>
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </>
  );
};

export default ManageAppointmentContent;
