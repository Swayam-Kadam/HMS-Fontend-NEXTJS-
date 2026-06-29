'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Mail,
  MapPin,
  User,
  Heart,
  Droplets,
  Stethoscope,
  Star,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Pencil,
  Shield,
  Activity,
  Ban,
} from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import EditProfileModal from './EditProfileModal';
import EditAppointmentModal from './EditAppointmentModal';
import { fetchUser, updateUser, type UserProfile } from '@/services/profileService';
import {
  AppointmentListStats,
  cancelAppointment,
  fetchUserAppointments,
  mapApiAppointmentToProfile,
  normalizeAppointmentStatus,
  parseAppointmentError,
  type ApiAppointment,
  type AppointmentStatusFilter,
  type ProfileAppointment,
} from '@/services/appointmentService';
import {
  MESSAGE_TAGS,
  fetchUserMessages,
  sendMessage,
  type MessageTagFilter,
  type UserMessage,
} from '@/services/messageService';
import { toast, ToastContainer } from 'react-toastify';
import { useAuthenticatedEffect } from '@/hooks/useAuthenticatedEffect';
import Swal from '@/lib/swal';
import { toastError, toastSuccess } from '@/lib/swal';

import PatientImage from '../../../public/images/about/patient.jpg';
import HospitalImage from '../../../public/images/Apollo-Hospital.webp';

interface Appointment extends ProfileAppointment {}

type TabId = 'overview' | 'appointments' | 'messages';

const APPOINTMENTS_PER_PAGE = 6;
const MESSAGES_PER_PAGE = 10;

const emptyProfile: UserProfile = {
  id: '',
  name: '',
  email: '',
  address: '',
  dateOfBirth: '',
  gender: '',
  bloodDonation: false,
  heartDonation: false,
  bloodGroup: '',
  memberSince: '',
  userImage: '',
};

const tagBadgeColors: Record<string, string> = {
  General: 'bg-gray-100 text-gray-700 border-gray-200',
  Appointment: 'bg-blue-50 text-blue-700 border-blue-200',
  Billing: 'bg-purple-50 text-purple-700 border-purple-200',
  Feedback: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Complaint: 'bg-red-50 text-red-700 border-red-200',
  Emergency: 'bg-orange-50 text-orange-700 border-orange-200',
  Support: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <User size={16} /> },
  { id: 'appointments', label: 'Appointments', icon: <Calendar size={16} /> },
  { id: 'messages', label: 'Messages', icon: <MessageSquare size={16} /> },
];

const statusConfig = {
  accepted: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  rejected: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  cancelled: { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Ban },
  completed: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2 },
};

const statusFilters: { id: AppointmentStatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'rejected', label: 'Rejected' },
];

const StarRating = ({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={readonly}
        onClick={() => onChange?.(star)}
        className={`transition-transform ${readonly ? 'cursor-default' : 'hover:scale-110 cursor-pointer'}`}
      >
        <Star
          size={readonly ? 14 : 22}
          className={
            star <= value
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-300 fill-gray-100'
          }
        />
      </button>
    ))}
  </div>
);

const ProfileContent = () => {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentTotal, setAppointmentTotal] = useState(0);
  const [appointmentTotalPages, setAppointmentTotalPages] = useState(1);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [actionAppointmentId, setActionAppointmentId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatusFilter>('all');
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageTotal, setMessageTotal] = useState(0);
  const [messageTotalPages, setMessageTotalPages] = useState(1);
  const [messagePage, setMessagePage] = useState(1);
  const [messageTagFilter, setMessageTagFilter] = useState<MessageTagFilter>('all');
  const [messageSubmitting, setMessageSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [messageForm, setMessageForm] = useState({
    title: '',
    message: '',
    tag: 'General' as (typeof MESSAGE_TAGS)[number],
    rating: 0,
  });
  const [appointmentStats, setAppointmentStats] = useState<AppointmentListStats | null>(null);

  useAuthenticatedEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const user = await fetchUser();
        if (!cancelled) {
          setProfile(user);
        }
      } catch {
        if (!cancelled) {
          toast.error('Failed to load profile');
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  });

  useAuthenticatedEffect(() => {
    let cancelled = false;

    const loadAppointments = async () => {
      setAppointmentsLoading(true);
      try {
        const data = await fetchUserAppointments(
          appointmentPage,
          APPOINTMENTS_PER_PAGE,
          statusFilter
        );
        if (!cancelled) {
          setAppointments(data.appointments);
          setAppointmentTotal(data.total);
          setAppointmentTotalPages(data.totalPages);
          setAppointmentStats(data.stats);
        }
      } catch {
        if (!cancelled) {
          toast.error('Failed to load appointments');
        }
      } finally {
        if (!cancelled) {
          setAppointmentsLoading(false);
        }
      }
    };

    loadAppointments();

    return () => {
      cancelled = true;
    };
  }, [appointmentPage, statusFilter]);

  useAuthenticatedEffect(() => {
    let cancelled = false;

    fetchUserMessages(1, 1, 'all')
      .then((data) => {
        if (!cancelled) setMessageTotal(data.total);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  });

  useAuthenticatedEffect(() => {
    if (activeTab !== 'messages') return;

    let cancelled = false;

    const loadMessages = async () => {
      setMessagesLoading(true);
      try {
        const data = await fetchUserMessages(
          messagePage,
          MESSAGES_PER_PAGE,
          messageTagFilter
        );
        if (!cancelled) {
          setMessages(data.messages);
          setMessageTotal(data.total);
          setMessageTotalPages(data.totalPages);
        }
      } catch {
        if (!cancelled) {
          toast.error('Failed to load messages');
        }
      } finally {
        if (!cancelled) {
          setMessagesLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [activeTab, messagePage, messageTagFilter]);

  const stats = useMemo(
    () => ({
      total: appointmentTotal,
      rejected: appointmentStats?.rejected ?? 0,
      pending: appointmentStats?.pending ?? 0,
      accepted: appointmentStats?.accepted ?? 0,
      messages: messageTotal,
    }),
    [appointments, appointmentTotal, messageTotal, appointmentStats]
  );


  const handleProfileSave = async (formData: FormData) => {
    setProfileSaving(true);
    try {
      const saved = await updateUser(profile.id, formData);
      setProfile(saved);
      toast.success('Profile updated successfully');
      setEditModalOpen(false);
    } catch (error) {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to update profile';
      toast.error(message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleStatusFilterChange = (status: AppointmentStatusFilter) => {
    if (status === statusFilter) return;
    setStatusFilter(status);
    setAppointmentPage(1);
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    const result = await Swal.fire({
      title: 'Cancel appointment?',
      text: 'This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it',
      cancelButtonText: 'Keep it',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });

    if (!result.isConfirmed) return;

    setActionAppointmentId(appointment.id);
    try {
      const updated = await cancelAppointment(appointment.id);
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === appointment.id
            ? { ...item, status: normalizeAppointmentStatus(updated.status) }
            : item
        )
      );
      toastSuccess('Appointment cancelled successfully');
    } catch (error) {
      const { message, isAuthError } = parseAppointmentError(error);
      toastError(message);
      if (isAuthError) {
        window.location.href = '/login';
      }
    } finally {
      setActionAppointmentId(null);
    }
  };

  const handleAppointmentUpdated = (updated: ApiAppointment) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === updated._id ? mapApiAppointmentToProfile(updated) : item
      )
    );
  };

  const handleMessageTagFilterChange = (tag: MessageTagFilter) => {
    if (tag === messageTagFilter) return;
    setMessageTagFilter(tag);
    setMessagePage(1);
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const title = messageForm.title.trim();
    const body = messageForm.message.trim();
    if (!title || !body) {
      toast.error('Title and message are required');
      return;
    }
    if (messageForm.rating !== 0 && (messageForm.rating < 1 || messageForm.rating > 5)) {
      toast.error('Rating must be between 1 and 5');
      return;
    }

    setMessageSubmitting(true);
    try {
      await sendMessage({
        title,
        message: body,
        tag: messageForm.tag,
        ...(messageForm.rating > 0 ? { rating: messageForm.rating } : {}),
      });
      toastSuccess('Message sent successfully');
      setMessageForm({ title: '', message: '', tag: 'General', rating: 0 });
      setMessagePage(1);
      setMessageTagFilter('all');

      const data = await fetchUserMessages(1, MESSAGES_PER_PAGE, 'all');
      setMessages(data.messages);
      setMessageTotal(data.total);
      setMessageTotalPages(data.totalPages);
    } catch (error) {
      const errData = (error as { response?: { data?: unknown } })?.response?.data;
      const message =
        (typeof errData === 'string' ? errData : null) ||
        (errData as { error?: string })?.error ||
        'Failed to send message';
      toastError(message);
    } finally {
      setMessageSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl -mt-16 sm:-mt-20 relative z-10 pb-16">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {profileLoading ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading profile...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
        <div className="h-24 sm:h-28 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 relative">
          <div className="absolute inset-0 opacity-20">
            <Image src={HospitalImage} alt="" fill className="object-cover" />
          </div>
        </div>

        <div className="px-6 sm:px-10 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6 -mt-14 sm:-mt-16">
            {/* Avatar */}
            <div className="relative shrink-0 mx-auto lg:mx-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl">
                {profile.userImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.userImage}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image src={PatientImage} alt={profile.name} className="w-full h-full object-cover" />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                <Shield size={14} className="text-white" />
              </span>
            </div>

            {/* Name & meta */}
            <div className="flex-1 text-center lg:text-left pt-2 lg:pb-1">
              <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mb-2 pt-15">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{profile.name}</h2>
                <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100 w-fit mx-auto lg:mx-0">
                  <Activity size={12} />
                  Active Patient
                </span>
              </div>
              <p className="text-gray-500 text-sm sm:text-base">{profile.email}</p>
              <p className="text-gray-400 text-sm mt-1">Member since {profile.memberSince}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                disabled={profileLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition disabled:opacity-60"
              >
                <Pencil size={15} />
                Edit Profile
              </button>
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

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Appointments', value: stats.total, icon: Calendar, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
          { label: 'Accepted', value: stats.accepted, icon: CheckCircle2, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
          { label: 'Pending', value: stats.pending, icon: Clock, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, iconBg: 'bg-red-50', iconColor: 'text-red-600' },
          { label: 'Messages Sent', value: stats.messages, icon: Star, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.iconBg}`}>
              <stat.icon size={20} className={stat.iconColor} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 mb-8 flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Personal Info */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Personal Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { icon: Mail, label: 'Email Address', value: profile.email },
                { icon: MapPin, label: 'Address', value: profile.address },
                { icon: Calendar, label: 'Date of Birth', value: profile.dateOfBirth },
                { icon: User, label: 'Gender', value: profile.gender },
                { icon: Droplets, label: 'Blood Group', value: profile.bloodGroup },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Donation & Health */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Heart size={20} className="text-red-500" />
                Organ Donation
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Blood Donation', checked: profile.bloodDonation, icon: Droplets, desc: 'Registered blood donor' },
                  { label: 'Heart Donation', checked: profile.heartDonation, icon: Heart, desc: 'Heart organ donor pledge' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition ${
                      item.checked
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.checked ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                      <item.icon size={18} className={item.checked ? 'text-emerald-600' : 'text-gray-400'} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        item.checked ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {item.checked ? 'Yes' : 'No'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming appointment preview */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-3">Next Appointment</p>
              {appointments.filter((a) => a.status === 'accepted' || a.status === 'pending')[0] ? (
                (() => {
                  const next = appointments.find((a) => a.status === 'accepted' || a.status === 'pending')!;
                  return (
                    <>
                      <p className="font-bold text-lg mb-1">{next.doctor}</p>
                      <p className="text-blue-100 text-sm mb-3">{next.department}</p>
                      <div className="flex items-center gap-4 text-sm text-blue-100">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {next.date}</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {next.time}</span>
                      </div>
                    </>
                  );
                })()
              ) : (
                <p className="text-blue-100">No upcoming appointments</p>
              )}
              <Link
                href="/appointment"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg transition"
              >
                View All <Calendar size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Your Appointments</h3>
              <p className="text-gray-500 text-sm mt-1">Track and manage all your hospital visits</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => handleStatusFilterChange(filter.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      statusFilter === filter.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-white hover:text-blue-600'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <Link
                href="/appointment"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition w-fit shrink-0"
              >
                <Calendar size={16} />
                New Appointment
              </Link>
            </div>
          </div>

          {appointmentsLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium">Loading appointments...</p>
              </div>
            </div>
          ) : appointmentTotal === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <Calendar size={40} className="mx-auto text-gray-300 mb-4" />
              {statusFilter === 'all' ? (
                <>
                  <p className="text-gray-600 font-medium mb-2">No appointments yet</p>
                  <p className="text-gray-400 text-sm mb-6">Book your first visit with our specialists</p>
                  <Link
                    href="/appointment"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
                  >
                    <Calendar size={16} />
                    Book Appointment
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-gray-600 font-medium mb-2">
                    No {statusFilter} appointments
                  </p>
                  <p className="text-gray-400 text-sm mb-6">
                    Try a different status filter to see more.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleStatusFilterChange('all')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
                  >
                    View all appointments
                  </button>
                </>
              )}
            </div>
          ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {appointments.map((appointment) => {
              const config = statusConfig[appointment.status];
              const StatusIcon = config.icon;
              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group"
                >
                  <div className="relative h-32 overflow-hidden">
                    <Image
                      src={appointment.doctorImage}
                      alt={appointment.doctor}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${config.color}`}>
                      <StatusIcon size={12} />
                      {appointment.status}
                    </span>
                    {(appointment.status === 'pending' || appointment.status === 'accepted') && (
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        {appointment.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => setEditingAppointment(appointment)}
                            disabled={actionAppointmentId === appointment.id}
                            title="Edit appointment"
                            aria-label="Edit appointment"
                            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-blue-600 flex items-center justify-center shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCancelAppointment(appointment)}
                          disabled={actionAppointmentId === appointment.id}
                          title="Cancel appointment"
                          aria-label="Cancel appointment"
                          className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-red-600 flex items-center justify-center shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-4 text-white">
                      <p className="font-bold text-sm">{appointment.doctor}</p>
                      <p className="text-white/80 text-xs">{appointment.department}</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Calendar size={15} className="text-blue-500 shrink-0" />
                      <span>{appointment.date}</span>
                      <Clock size={15} className="text-blue-500 shrink-0 ml-auto" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-100 space-y-1.5">
                      <p className="text-xs text-gray-400">Patient</p>
                      <p className="text-sm font-medium text-gray-800">{appointment.name}</p>
                      <p className="text-xs text-gray-500">{appointment.email}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}

          {!appointmentsLoading && appointmentTotal > 0 && (
          <Pagination
            currentPage={appointmentPage}
            totalPages={appointmentTotalPages}
            onPageChange={setAppointmentPage}
          />
          )}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Send Message Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
              <div className="relative h-36">
                <Image src={HospitalImage} alt="Hospital" fill className="object-cover" />
                <div className="absolute inset-0 bg-blue-900/70" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <MessageSquare size={28} className="mx-auto mb-2 opacity-80" />
                    <p className="font-bold text-lg">Send a Message</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleMessageSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Great service"
                    value={messageForm.title}
                    onChange={(e) => setMessageForm((p) => ({ ...p, title: e.target.value }))}
                    className="mt-1.5 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Message *</label>
                  <textarea
                    rows={4}
                    placeholder="Write your message..."
                    value={messageForm.message}
                    onChange={(e) => setMessageForm((p) => ({ ...p, message: e.target.value }))}
                    className="mt-1.5 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tag</label>
                  <select
                    value={messageForm.tag}
                    onChange={(e) =>
                      setMessageForm((p) => ({
                        ...p,
                        tag: e.target.value as (typeof MESSAGE_TAGS)[number],
                      }))
                    }
                    className="mt-1.5 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {MESSAGE_TAGS.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    Rating <span className="text-gray-400 font-normal normal-case">(optional)</span>
                  </label>
                  <StarRating
                    value={messageForm.rating}
                    onChange={(rating) => setMessageForm((p) => ({ ...p, rating }))}
                  />
                </div>
                <button
                  type="submit"
                  disabled={
                    messageSubmitting ||
                    !messageForm.title.trim() ||
                    !messageForm.message.trim()
                  }
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-100"
                >
                  <Send size={16} />
                  {messageSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* Message List */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">Your Messages</h3>
              <p className="text-gray-500 text-sm mt-1">Messages you&apos;ve sent to Apollo Hospital</p>
            </div>

            {/* Tag filter bar */}
            <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => handleMessageTagFilterChange('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  messageTagFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-white hover:text-blue-600'
                }`}
              >
                All
              </button>
              {MESSAGE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleMessageTagFilterChange(tag)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    messageTagFilter === tag
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-white hover:text-blue-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {messagesLoading ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium">Loading messages...</p>
                </div>
              </div>
            ) : messageTotal === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <MessageSquare size={40} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium mb-2">No messages found</p>
                <p className="text-gray-400 text-sm">
                  {messageTagFilter === 'all'
                    ? 'Send your first message using the form.'
                    : `No ${messageTagFilter} messages. Try a different filter.`}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900">{msg.title}</h4>
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                tagBadgeColors[msg.tag] || tagBadgeColors.General
                              }`}
                            >
                              {msg.tag}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{msg.date}</p>
                        </div>
                        {msg.rating > 0 && <StarRating value={msg.rating} readonly />}
                      </div>

                      <blockquote className="text-gray-600 text-sm leading-relaxed border-l-4 border-blue-200 pl-4 mb-5">
                        {msg.message}
                      </blockquote>

                      {msg.replay && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                              <Stethoscope size={14} className="text-white" />
                            </div>
                            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                              Admin Reply
                            </p>
                          </div>
                          <p className="text-sm text-emerald-700 leading-relaxed">{msg.replay}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {messageTotalPages > 1 && (
                  <Pagination
                    currentPage={messagePage}
                    totalPages={messageTotalPages}
                    onPageChange={setMessagePage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}

      <EditProfileModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        profile={profile}
        onSave={handleProfileSave}
        saving={profileSaving}
      />

      {editingAppointment && (
        <EditAppointmentModal
          open={!!editingAppointment}
          onClose={() => setEditingAppointment(null)}
          appointmentId={editingAppointment.id}
          initialValues={editingAppointment.editable}
          onSaved={handleAppointmentUpdated}
        />
      )}
        </>
      )}
    </div>
  );
};

export default ProfileContent;
