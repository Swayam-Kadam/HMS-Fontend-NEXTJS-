'use client';

import Image from 'next/image';
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  Stethoscope,
  User,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import type { ProfileAppointment } from '@/services/appointmentService';

interface ViewAppointmentDetailModalProps {
  open: boolean;
  onClose: () => void;
  appointment: ProfileAppointment | null;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
};

const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
      <Icon size={16} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-gray-800 break-words">
        {value || '—'}
      </p>
    </div>
  </div>
);

const ViewAppointmentDetailModal = ({
  open,
  onClose,
  appointment,
}: ViewAppointmentDetailModalProps) => {
  if (!appointment) return null;

  const { editable } = appointment;
  const statusClass =
    statusStyles[appointment.status] || statusStyles.pending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Appointment Details"
      subtitle={`${appointment.doctor} · ${appointment.department}`}
      maxWidth="xl"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Close
        </button>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-24 w-full overflow-hidden rounded-xl sm:h-28 sm:w-36 shrink-0">
            <Image
              src={appointment.doctorImage}
              alt={appointment.doctor}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h4 className="text-lg font-bold text-gray-900">
                {appointment.doctor}
              </h4>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${statusClass}`}
              >
                <BadgeCheck size={12} />
                {appointment.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">{appointment.department}</p>
            <p className="mt-1 text-sm text-gray-600">
              {appointment.appointmentType || 'Clinic Visit'}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <DetailRow icon={Calendar} label="Date" value={appointment.date} />
          <DetailRow icon={Clock} label="Time" value={appointment.time} />
          <DetailRow icon={User} label="Patient" value={appointment.name} />
          <DetailRow icon={Mail} label="Email" value={appointment.email} />
          <DetailRow icon={Phone} label="Phone" value={editable.phone} />
          <DetailRow icon={User} label="Gender" value={editable.gender} />
          <DetailRow icon={Calendar} label="Date of Birth" value={editable.dob} />
          <DetailRow icon={FileText} label="NIC" value={editable.nic} />
          <DetailRow
            icon={Stethoscope}
            label="Appointment Type"
            value={editable.appointmentType || appointment.appointmentType}
          />
          <DetailRow
            icon={Stethoscope}
            label="Doctor"
            value={editable.doctor || appointment.doctor}
          />
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Reason for visit
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-800">
            {editable.reason || '—'}
          </p>
        </div>

        {editable.notes?.trim() && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-400">
              Notes
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-blue-900">
              {editable.notes}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ViewAppointmentDetailModal;
