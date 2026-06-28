'use client';

import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import {
  Search,
  Users,
  Layers,
  ListOrdered,
  Droplet,
  HeartPulse,
  Loader2,
  RotateCw,
  AlertCircle,
  UserRound,
  Pencil,
  Trash,
  User,
} from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import EditUserModal from './EditUserModal';
import Swal from '@/lib/swal';
import {
  fetchAllUsers,
  updateUser,
  deleteUser,
  parseUserError,
  type UserProfile,
  type UserListStats,
} from '@/services/profileService';

const ALL_GROUPS = 'all';
const PAGE_SIZE = 10;
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const formatDate = (value: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '—';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const UserAvatar = ({ user }: { user: UserProfile }) => {
  const [errored, setErrored] = useState(false);
  const showImage = user.userImage && !errored;

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.userImage}
        alt={user.name}
        onError={() => setErrored(true)}
        className="w-10 h-10 rounded-xl object-cover shrink-0"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
      {getInitials(user.name) || <UserRound size={18} />}
    </div>
  );
};

const ManageUserContent = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [bloodGroup, setBloodGroup] = useState<string>(ALL_GROUPS);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [editing, setEditing] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<UserListStats | null>(null);

  const loadUsers = async (
    targetPage: number,
    groupFilter: string,
    searchTerm: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllUsers({
        page: targetPage,
        limit: PAGE_SIZE,
        bloodGroup: groupFilter === ALL_GROUPS ? undefined : groupFilter,
        search: searchTerm,
      });
      setUsers(data.users);
      setTotal(data.total);
      setStatistics(data.stats);
      setTotalPages(data.totalPages);
      if (data.currentPage !== targetPage) {
        setPage(data.currentPage);
      }
    } catch {
      setError('Unable to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Debounce the search input (400ms) + trim leading/trailing spaces.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    loadUsers(page, bloodGroup, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, bloodGroup, debouncedSearch]);

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const handleSaveEdit = async (id: string, formData: FormData) => {
    setSaving(true);
    try {
      await updateUser(id, formData);
      toast.success('User updated successfully');
      setEditing(null);
      // Reload so server-side filters/search stay consistent with the edit.
      loadUsers(page, bloodGroup, debouncedSearch);
    } catch (err) {
      toast.error(parseUserError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: UserProfile) => {
    const result = await Swal.fire({
      title: 'Delete user?',
      text: `${user.name || user.email} will be permanently removed. This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });

    if (!result.isConfirmed) return;

    setDeletingId(user.id);
    try {
      await deleteUser(user.id);
      toast.success('User deleted successfully');
      // If the last row on a page was removed, step back a page.
      const nextPage = users.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        loadUsers(page, bloodGroup, debouncedSearch);
      }
    } catch (err) {
      toast.error(parseUserError(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Users', value: total, icon: Users, bg: 'bg-indigo-50', color: 'text-indigo-600' },
          { label: 'Total Male', value: statistics?.male || 0, icon: User, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Total Female', value: statistics?.female || 0, icon: User, bg: 'bg-pink-50', color: 'text-pink-600' },
          { label: 'Total Blood Donors', value: statistics?.bloodDonar || 0, icon: Droplet, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Total Heart Donors', value: statistics?.bloodDonar || 0, icon: HeartPulse, bg: 'bg-pink-50', color: 'text-pink-600' },
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
              <Users size={20} className="text-indigo-600" />
              Registered Users
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage all patient accounts on the platform
            </p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadUsers(page, bloodGroup, debouncedSearch)}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-60"
            >
              <RotateCw size={15} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <select
              value={bloodGroup}
              onChange={(e) => {
                setBloodGroup(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={ALL_GROUPS}>All Blood Groups</option>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email, address..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/80">
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Gender</th>
                <th className="px-5 py-3.5 hidden lg:table-cell">Blood Group</th>
                <th className="px-5 py-3.5 hidden xl:table-cell">Address</th>
                <th className="px-5 py-3.5 hidden xl:table-cell">Donation</th>
                <th className="px-5 py-3.5 hidden lg:table-cell">Member Since</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Loading users...
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
                        onClick={() => loadUsers(page, bloodGroup, debouncedSearch)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition"
                      >
                        <RotateCw size={14} />
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-gray-50 hover:bg-gray-50/50 transition"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <p className="text-sm font-semibold text-gray-900 capitalize">
                          {user.name || '—'}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      <a
                        href={`mailto:${user.email}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {user.email}
                      </a>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden md:table-cell capitalize">
                      {user.gender || '—'}
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      {user.bloodGroup ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                          <Droplet size={12} />
                          {user.bloodGroup}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden xl:table-cell max-w-[200px] truncate">
                      {user.address || '—'}
                    </td>
                    <td className="px-5 py-4 hidden xl:table-cell">
                      <div className="flex items-center gap-1.5">
                        {user.bloodDonation && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                            <Droplet size={11} />
                            Blood
                          </span>
                        )}
                        {user.heartDonation && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-200">
                            <HeartPulse size={11} />
                            Heart
                          </span>
                        )}
                        {!user.bloodDonation && !user.heartDonation && (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 hidden lg:table-cell">
                      {user.memberSince || formatDate(user.dateOfBirth)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(user)}
                          className="inline-flex items-center justify-center p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition cursor-pointer"
                          title="Edit User"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          disabled={deletingId === user.id}
                          className="inline-flex items-center justify-center p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          title="Delete User"
                        >
                          {deletingId === user.id ? (
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
              Showing {rangeStart}&ndash;{rangeEnd} of {total} user
              {total === 1 ? '' : 's'} · Page {page} of {totalPages}
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(next) => {
                if (next >= 1 && next <= totalPages && next !== page) {
                  setPage(next);
                }
              }}
            />
          </div>
        )}
      </div>

      <EditUserModal
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        user={editing}
        onSave={handleSaveEdit}
        saving={saving}
      />
    </>
  );
};

export default ManageUserContent;
