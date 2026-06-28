'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, UserRound, Loader2 } from 'lucide-react';
import AdminModal from './AdminModal';
import type { UserProfile } from '@/services/profileService';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
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

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSave: (id: string, formData: FormData) => Promise<void>;
  saving?: boolean;
}

const EditUserModal = ({
  open,
  onClose,
  user,
  onSave,
  saving = false,
}: EditUserModalProps) => {
  const [form, setForm] = useState<UserProfile | null>(user);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && user) {
      setForm(user);
      setImageFile(null);
      setPreviewUrl(null);
      setImageError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [open, user]);

  // Revoke the object URL whenever it changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (field: keyof UserProfile, value: string | boolean) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Only JPG, PNG, or WEBP images are allowed.');
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
    if (!form || !user) return;

    const formData = new FormData();
    if (form.name !== user.name) formData.append('name', form.name);
    if (form.address !== user.address) formData.append('address', form.address);
    if (form.gender !== user.gender) formData.append('gender', form.gender);
    if (form.bloodGroup !== user.bloodGroup) {
      formData.append('bloodGroup', form.bloodGroup);
    }
    if (toDateInputValue(form.dateOfBirth) !== toDateInputValue(user.dateOfBirth)) {
      formData.append('DOB', toDateInputValue(form.dateOfBirth));
    }
    if (form.bloodDonation !== user.bloodDonation) {
      formData.append('donation[blood]', String(form.bloodDonation));
    }
    if (form.heartDonation !== user.heartDonation) {
      formData.append('donation[heart]', String(form.heartDonation));
    }
    if (imageFile) formData.append('userImage', imageFile);

    await onSave(user.id, formData);
  };

  const currentImage = previewUrl || user?.userImage || '';

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Edit User"
      subtitle="Update this user's account details"
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
            form="edit-user-form"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-100 disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      }
    >
      {form && (
        <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Image */}
          <div className="flex flex-col items-center gap-3 pb-2">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-gray-100 bg-gray-100 flex items-center justify-center">
                {currentImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentImage}
                    alt="User preview"
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
                aria-label="Change user photo"
              >
                <Camera size={15} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
            <p className="text-xs text-gray-400">JPG, PNG, or WEBP · max 5MB</p>
            {imageError && <p className="text-xs text-red-500">{imageError}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                value={form.email}
                className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}
                readOnly
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                value={toDateInputValue(form.dateOfBirth)}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
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
              <label className={labelClass}>Blood Group</label>
              <select
                value={form.bloodGroup}
                onChange={(e) => handleChange('bloodGroup', e.target.value)}
                className={inputClass}
              >
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className={labelClass}>Organ Donation</p>
            <div className="space-y-3 mt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  checked={form.bloodDonation}
                  onChange={(e) => handleChange('bloodDonation', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Registered blood donor
                </span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  checked={form.heartDonation}
                  onChange={(e) => handleChange('heartDonation', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Heart organ donor pledge
                </span>
              </label>
            </div>
          </div>
        </form>
      )}
    </AdminModal>
  );
};

export default EditUserModal;
