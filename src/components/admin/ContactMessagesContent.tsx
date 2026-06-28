'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import {
  Mail,
  Search,
  Eye,
  Inbox,
  CheckCircle2,
  MessageCircle,
  Phone,
  User,
  Loader2,
  RotateCw,
  MailOpen,
} from 'lucide-react';
import AdminModal from './AdminModal';
import Pagination from '@/components/common/Pagination';
import {
  AdminContact,
  CONTACT_SUBJECTS,
  ContactReadFilter,
  ContactSubjectFilter,
  fetchAdminContacts,
  updateContactReadStatus,
  parseContactError,
  ContactListStats,
  type AdminContactsPage,
} from '@/services/contactService';

const PAGE_SIZE = 10;

const readFilterOptions: { value: ContactReadFilter; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
];

const ContactMessagesContent = () => {
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [subject, setSubject] = useState<ContactSubjectFilter>('all');
  const [readStatus, setReadStatus] = useState<ContactReadFilter>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<AdminContact | null>(null);
  const [stats, setStats] = useState<ContactListStats | null>(null);
  // Debounce the search input (400ms) + trim leading/trailing spaces.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(handle);
  }, [search]);

  const loadContacts = async (
    targetPage: number,
    subjectFilter: ContactSubjectFilter,
    readFilter: ContactReadFilter,
    searchTerm: string
  ) => {
    setLoading(true);
    try {
      const data: AdminContactsPage = await fetchAdminContacts(
        targetPage,
        PAGE_SIZE,
        subjectFilter,
        readFilter,
        searchTerm);
      setContacts(data.contacts);
      setTotal(data.total);
      setTotalPages(Math.max(1, data.totalPages));
      setStats(data.stats);
      if (data.currentPage !== targetPage) {
        setPage(data.currentPage);
      }
    } catch (error) {
      toast.error(parseContactError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts(page, subject, readStatus, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, subject, readStatus, debouncedSearch]);

  const statsData = useMemo(
    () => ({
      total: total || 0,
      unread: stats?.unread || 0,
      read: stats?.read || 0,
    }),
    [stats, total]
  );

  // Persist a read-status change and reflect it locally without a full reload.
  // Returns true on success so callers can decide whether to show a toast.
  const setContactRead = async (
    contact: AdminContact,
    read: boolean
  ): Promise<boolean> => {
    if (!contact.id) {
      toast.error('Cannot update: this message has no id from the server.');
      return false;
    }
    setUpdatingId(contact.id);
    try {
      await updateContactReadStatus(contact.id, read);
      setContacts((prev) =>
        prev.map((c) => (c.id === contact.id ? { ...c, read } : c))
      );
      setSelected((prev) =>
        prev && prev.id === contact.id ? { ...prev, read } : prev
      );
      return true;
    } catch (error) {
      toast.error(parseContactError(error));
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  const openMessage = (contact: AdminContact) => {
    setSelected(contact);
    // Auto-mark unread messages as read when opened.
    if (!contact.read) {
      setContactRead(contact, true);
    }
  };

  const markRowUnread = async (contact: AdminContact) => {
    const ok = await setContactRead(contact, false);
    if (ok) toast.success('Marked as unread');
  };

  const toggleSelectedRead = async () => {
    if (!selected) return;
    const wasRead = selected.read;
    const ok = await setContactRead(selected, !wasRead);
    if (ok) toast.success(wasRead ? 'Marked as unread' : 'Marked as read');
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Messages', value: statsData.total, icon: Inbox, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Unread', value: statsData.unread, icon: Mail, bg: 'bg-indigo-50', color: 'text-indigo-600' },
          { label: 'Read', value: statsData.read, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
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
              <MessageCircle size={20} className="text-blue-600" />
              Contact Requests
            </h2>
            <p className="text-sm text-gray-500 mt-1">Messages submitted from the Contact Us page</p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadContacts(page, subject, readStatus, debouncedSearch)}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-60"
            >
              <RotateCw size={15} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <select
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value as ContactSubjectFilter);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Subjects</option>
              {CONTACT_SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={readStatus}
              onChange={(e) => {
                setReadStatus(e.target.value as ContactReadFilter);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {readFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email, message..."
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
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Phone</th>
                <th className="px-5 py-3.5">Message</th>
                <th className="px-5 py-3.5 hidden lg:table-cell">Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Loading messages...
                    </span>
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No contact messages found.
                  </td>
                </tr>
              ) : (
                contacts.map((msg) => (
                  <tr
                    key={msg.id || `${msg.email}-${msg.date}`}
                    className={`border-t border-gray-50 hover:bg-gray-50/50 transition ${
                      msg.read ? '' : 'bg-blue-50/30'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className={`text-sm ${msg.read ? 'font-medium text-gray-800' : 'font-bold text-gray-900'}`}>
                        {msg.name}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{msg.email}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden md:table-cell">{msg.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-600 line-clamp-1 max-w-[240px]">{msg.message}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 hidden lg:table-cell">{msg.date}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        msg.read
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {msg.read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => openMessage(msg)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => markRowUnread(msg)}
                          disabled={updatingId === msg.id || !msg.read}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingId === msg.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Mail size={14} />
                          )}
                          Mark Unread
                        </button>
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
              Showing {rangeStart}&ndash;{rangeEnd} of {total} message
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

      {/* View Modal */}
      <AdminModal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Contact Message"
        subtitle={selected ? `Received on ${selected.date}` : undefined}
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
              <button
                type="button"
                onClick={toggleSelectedRead}
                disabled={updatingId === selected.id}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-60"
              >
                {updatingId === selected.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : selected.read ? (
                  <Mail size={14} />
                ) : (
                  <MailOpen size={14} />
                )}
                {selected.read ? 'Mark as Unread' : 'Mark as Read'}
              </button>
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <User size={18} className="text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="text-sm font-semibold text-gray-900">{selected.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail size={18} className="text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-semibold text-gray-900">{selected.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone size={18} className="text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{selected.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <MessageCircle size={18} className="text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Subject</p>
                  <p className="text-sm font-semibold text-gray-900">{selected.subject || '—'}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Message</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                {selected.message}
              </p>
            </div>
            <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              selected.read
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {selected.read ? 'Read' : 'Unread'}
            </span>
          </div>
        )}
      </AdminModal>
    </>
  );
};

export default ContactMessagesContent;
