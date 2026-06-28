'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import {
  Star,
  Search,
  MessageSquare,
  Reply,
  Clock,
  CheckCircle2,
  User,
  Mail,
  Loader2,
  RotateCw,
} from 'lucide-react';
import AdminModal from './AdminModal';
import Pagination from '@/components/common/Pagination';
import {
  AdminMessage,
  MESSAGE_TAGS,
  MessageReplyStatusFilter,
  MessageTagFilter,
  fetchAdminMessages,
  replyToMessage,
  parseMessageError,
  type MessageListStats,
} from '@/services/messageService';

const PAGE_SIZE = 10;

const replyStatusOptions: { value: MessageReplyStatusFilter; label: string }[] = [
  { value: 'all', label: 'All Replies' },
  { value: 'pending', label: 'Pending Reply' },
  { value: 'replied', label: 'Replied' },
];

const tagBadgeStyles: Record<string, string> = {
  General: 'bg-gray-100 text-gray-600 border-gray-200',
  Appointment: 'bg-blue-50 text-blue-700 border-blue-200',
  Billing: 'bg-purple-50 text-purple-700 border-purple-200',
  Feedback: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Complaint: 'bg-red-50 text-red-700 border-red-200',
  Emergency: 'bg-orange-50 text-orange-700 border-orange-200',
  Support: 'bg-cyan-50 text-cyan-700 border-cyan-200',
};

const StarRating = ({ value }: { value: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < value ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-100'}
      />
    ))}
  </div>
);

const UserMessagesContent = () => {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tag, setTag] = useState<MessageTagFilter>('all');
  const [replyStatus, setReplyStatus] = useState<MessageReplyStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<AdminMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [stats, setStats] = useState<MessageListStats | null>(null);
  // Debounce the search input (400ms) + trim leading/trailing spaces.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(handle);
  }, [search]);

  const loadMessages = async (
    targetPage: number,
    tagFilter: MessageTagFilter,
    statusFilter: MessageReplyStatusFilter,
    searchTerm: string
  ) => {
    setLoading(true);
    try {
      const data = await fetchAdminMessages(
        targetPage,
        PAGE_SIZE,
        tagFilter,
        statusFilter,
        searchTerm
      );
      setMessages(data.messages);
      setTotal(data.total);
      setTotalPages(Math.max(1, data.totalPages));
      setStats(data.stats);
      if (data.currentPage !== targetPage) {
        setPage(data.currentPage);
      }
    } catch (error) {
      toast.error(parseMessageError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages(page, tag, replyStatus, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tag, replyStatus, debouncedSearch]);

  const statsData = useMemo(
    () => ({
      total: total || 0,
      pending: stats?.pending || 0,
      replied: stats?.replied || 0,
    }),
    [stats, total]
  );

  const openReplyModal = (message: AdminMessage) => {
    setSelected(message);
    setReplyText(message.reply || '');
  };

  const handleSubmitReply = async () => {
    if (!selected || !replyText.trim()) {
      toast.error('Please write a reply before submitting');
      return;
    }
    if (!selected.id) {
      toast.error('Cannot reply: this message has no id from the server.');
      return;
    }

    setSubmittingReply(true);
    try {
      await replyToMessage(selected.id, replyText.trim());
      toast.success('Reply sent successfully!');
      setSelected(null);
      setReplyText('');
      loadMessages(page, tag, replyStatus, debouncedSearch);
    } catch (error) {
      toast.error(parseMessageError(error));
    } finally {
      setSubmittingReply(false);
    }
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Messages', value: statsData.total, icon: MessageSquare, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Pending Reply', value: statsData.pending, icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
          { label: 'Replied', value: statsData.replied, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
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
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Star size={20} className="text-amber-500 fill-amber-500" />
              User Messages
            </h2>
            <p className="text-sm text-gray-500 mt-1">Messages submitted by patients — reply from here</p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadMessages(page, tag, replyStatus, debouncedSearch)}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-60"
            >
              <RotateCw size={15} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <select
              value={tag}
              onChange={(e) => {
                setTag(e.target.value as MessageTagFilter);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tags</option>
              {MESSAGE_TAGS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={replyStatus}
              onChange={(e) => {
                setReplyStatus(e.target.value as MessageReplyStatusFilter);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {replyStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search title or message..."
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
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Title</th>
                <th className="px-5 py-3.5 hidden sm:table-cell">Tag</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Rating</th>
                <th className="px-5 py-3.5 hidden lg:table-cell">Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 hidden xl:table-cell">Reply</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Loading messages...
                    </span>
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No messages found.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg.id || `${msg.userEmail}-${msg.title}`} className="border-t border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900 text-sm">{msg.userName}</p>
                      <p className="text-xs text-gray-400">{msg.userEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-800">{msg.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-[200px]">{msg.message}</p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${tagBadgeStyles[msg.tag] || tagBadgeStyles.General}`}>
                        {msg.tag}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <StarRating value={msg.rating} />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 hidden lg:table-cell">{msg.date}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          msg.replied
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {msg.replied ? 'Replied' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden xl:table-cell">
                      <p className="text-xs text-gray-500 line-clamp-2 max-w-[180px]">
                        {msg.reply || '—'}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openReplyModal(msg)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                      >
                        <Reply size={14} />
                        {msg.replied ? 'Edit' : 'Reply'}
                      </button>
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

      {/* Reply Modal */}
      <AdminModal
        open={!!selected}
        onClose={() => { setSelected(null); setReplyText(''); }}
        title="Reply to Message"
        subtitle={selected ? `Message by ${selected.userName}` : undefined}
        footer={
          <>
            <button
              type="button"
              onClick={() => { setSelected(null); setReplyText(''); }}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitReply}
              disabled={submittingReply}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-60"
            >
              {submittingReply ? <Loader2 size={14} className="animate-spin" /> : <Reply size={14} />}
              {submittingReply ? 'Sending...' : 'Send Reply'}
            </button>
          </>
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <User size={16} className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-400">Patient</p>
                  <p className="text-sm font-semibold">{selected.userName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail size={16} className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-semibold truncate">{selected.userEmail}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Message Title</p>
                <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${tagBadgeStyles[selected.tag] || tagBadgeStyles.General}`}>
                  {selected.tag}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900">{selected.title}</p>
              {selected.rating > 0 && (
                <div className="mt-2">
                  <StarRating value={selected.rating} />
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Patient Message</p>
              <blockquote className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 border-l-4 border-blue-200">
                {selected.message}
              </blockquote>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
                Your Reply <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply to the patient..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {selected.replied && selected.reply && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <p className="text-xs font-semibold text-emerald-800 mb-1">Current Reply</p>
                <p className="text-sm text-emerald-700">{selected.reply}</p>
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </>
  );
};

export default UserMessagesContent;
