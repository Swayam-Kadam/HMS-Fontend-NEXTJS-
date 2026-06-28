'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, UserRound, Loader2 } from 'lucide-react';
import AdminModal from './AdminModal';
import type { Doctor, UpdateDoctorPayload } from '@/services/doctorService';

const departments = [
  'Cardiology',
  'Dermatology',
  'ENT',
  'General',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Physical Therapy',
];

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml',
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const inputClass =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm';
const labelClass =
  'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5';

const toDateInputValue = (value: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().split('T')[0];
};

const splitName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts.shift() ?? '';
  const lastName = parts.join(' ');
  return { firstName, lastName };
};

interface EditDoctorForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nic: string;
  dob: string;
  gender: string;
  department: string;
}

interface EditDoctorModalProps {
  open: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  onSave: (id: string, payload: UpdateDoctorPayload) => Promise<void>;
  saving?: boolean;
}

const EditDoctorModal = ({
  open,
  onClose,
  doctor,
  onSave,
  saving = false,
}: EditDoctorModalProps) => {
  const [form, setForm] = useState<EditDoctorForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nic: '',
    dob: '',
    gender: '',
    department: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && doctor) {
      const { firstName, lastName } = splitName(doctor.fullName);
      setForm({
        firstName,
        lastName,
        email: doctor.email,
        phone: doctor.phone,
        nic: doctor.nic,
        dob: toDateInputValue(doctor.dob),
        gender: doctor.gender === '—' ? '' : doctor.gender,
        department: doctor.department,
      });
      setImageFile(null);
      setPreviewUrl(null);
      setImageError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [open, doctor]);

  // Revoke the object URL whenever it changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (field: keyof EditDoctorForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Only JPG, PNG, WEBP, AVIF, or SVG images are allowed.');
      setImageFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Image must be 5MB or smaller.');
      setImageFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      e.target.value = '';
      return;
    }

    setImageError(null);
    setImageFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;

    const { firstName, lastName } = splitName(doctor.fullName);
    const payload: UpdateDoctorPayload = {};

    if (form.firstName !== firstName) payload.firstName = form.firstName;
    if (form.lastName !== lastName) payload.lastName = form.lastName;
    if (form.email !== doctor.email) payload.email = form.email;
    if (form.phone !== doctor.phone) payload.phone = form.phone;
    if (form.nic !== doctor.nic) payload.nic = form.nic;
    if (form.dob !== toDateInputValue(doctor.dob)) payload.dob = form.dob;
    if (form.gender !== (doctor.gender === '—' ? '' : doctor.gender)) {
      payload.gender = form.gender;
    }
    if (form.department !== doctor.department) payload.department = form.department;
    if (imageFile) payload.image = imageFile;

    await onSave(doctor.id, payload);
  };

  const currentImage = previewUrl || doctor?.imageUrl || '';

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Edit Doctor"
      subtitle="Update doctor details and profile photo"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-doctor-form"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-100 disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      }
    >
      <form id="edit-doctor-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Profile Image */}
        <div className="flex flex-col items-center gap-3 pb-2">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-gray-100 bg-gray-100 flex items-center justify-center">
              {currentImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentImage}
                  alt="Doctor preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserRound size={36} className="text-gray-300" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition"
              aria-label="Change doctor photo"
            >
              <Camera size={15} />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/avif,image/svg+xml"
            onChange={handleImageSelect}
            className="hidden"
          />
          <p className="text-xs text-gray-400">JPG, PNG, WEBP, AVIF or SVG · max 5MB</p>
          {imageError && <p className="text-xs text-red-500">{imageError}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>NIC</label>
            <input
              type="text"
              value={form.nic}
              onChange={(e) => handleChange('nic', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Date of Birth</label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => handleChange('dob', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <select
              value={form.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className={inputClass}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Department</label>
            <select
              value={form.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
              {/* Preserve any custom department not in the preset list */}
              {form.department &&
                !departments.includes(form.department) && (
                  <option value={form.department}>{form.department}</option>
                )}
            </select>
          </div>
        </div>
      </form>
    </AdminModal>
  );
};

export default EditDoctorModal;
