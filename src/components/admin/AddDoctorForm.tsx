'use client';

import { useRef, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { toast, ToastContainer } from 'react-toastify';
import {
  User,
  Mail,
  Phone,
  BookUser,
  Calendar,
  Lock,
  Stethoscope,
  VenusAndMars,
  Upload,
  ImageIcon,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import { addDoctorSchema } from '@/utils/validation';
import FormInput from '@/components/ui/FormInput';
import { createDoctor, parseDoctorError } from '@/services/doctorService';

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
]

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  nic: '',
  dob: '',
  gender: '',
  password: '',
  department: '',
};

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml',
];
const MAX_SIZE_MB = 5;

const selectClass =
  'w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-gray-800';

const AddDoctorForm = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);

    if (!file) {
      setPreview(null);
      setImageFile(null);
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImageError('Please select a valid image (JPG, PNG, WEBP, AVIF, or SVG)');
      setPreview(null);
      setImageFile(null);
      e.target.value = '';
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setImageError(`Image must be smaller than ${MAX_SIZE_MB}MB`);
      setPreview(null);
      setImageFile(null);
      e.target.value = '';
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting, resetForm }: { setSubmitting: (v: boolean) => void; resetForm: () => void }
  ) => {
    if (!imageFile) {
      setImageError('Doctor profile photo is required');
      setSubmitting(false);
      return;
    }

    try {
      const doctor = await createDoctor({ ...values, image: imageFile });
      toast.success(`Dr. ${doctor.f_name} ${doctor.l_name} registered successfully!`);
      resetForm();
      setPreview(null);
      setImageFile(null);
      setImageError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error(parseDoctorError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="max-w-6xl mx-auto">
        {/* Page intro */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <UserPlus size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Register New Doctor</h2>
              <p className="text-sm text-gray-500">Add a new doctor to the Apollo Hospital system</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Formik
            initialValues={initialValues}
            validationSchema={addDoctorSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="grid lg:grid-cols-5 gap-0">
                  {/* Left — Image Upload */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 p-6 sm:p-8 flex flex-col">
                    <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-4">
                      Profile Photo
                    </p>

                    {/* Preview */}
                    <div
                      className={`relative aspect-square max-w-xs mx-auto w-full rounded-2xl overflow-hidden border-2 transition-all ${
                        imageError
                          ? 'border-red-400'
                          : preview
                          ? 'border-emerald-400'
                          : 'border-slate-600'
                      }`}
                    >
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="Doctor preview" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/80 text-slate-400 gap-3 p-6 text-center">
                          <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center">
                            <ImageIcon size={32} className="text-slate-500" />
                          </div>
                          {imageError ? (
                            <>
                              <AlertCircle size={20} className="text-red-400" />
                              <p className="text-red-400 text-sm font-medium">{imageError}</p>
                            </>
                          ) : (
                            <>
                              <p className="text-slate-300 text-sm font-medium">No photo selected</p>
                              <p className="text-slate-500 text-xs">Upload a JPG, PNG, WEBP, AVIF or SVG image</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* File Input */}
                    <div className="mt-6">
                      <label
                        htmlFor="doctor-image"
                        className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-600 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-slate-800/50 transition-all group"
                      >
                        <Upload size={22} className="text-slate-400 group-hover:text-blue-400 transition mb-2" />
                        <span className="text-sm text-slate-300 group-hover:text-white transition">
                          {imageFile ? imageFile.name : 'Choose file to upload'}
                        </span>
                        <span className="text-xs text-slate-500 mt-1">Max {MAX_SIZE_MB}MB</span>
                        <input
                          id="doctor-image"
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/avif,image/svg+xml"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      {imageError && !preview && (
                        <p className="text-red-400 text-xs mt-2 text-center">{imageError}</p>
                      )}
                    </div>

                    {/* Tips */}
                    <div className="mt-auto pt-8 hidden lg:block">
                      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                        <p className="text-slate-300 text-xs font-semibold mb-2">Photo Guidelines</p>
                        <ul className="text-slate-400 text-xs space-y-1.5">
                          <li>• Use a clear, professional headshot</li>
                          <li>• Plain background preferred</li>
                          <li>• Face should be clearly visible</li>
                          <li>• Minimum 300×300 pixels</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Right — Form Fields */}
                  <div className="lg:col-span-3 p-6 sm:p-8">
                    <div className="space-y-5">
                      {/* Name row */}
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-[22px] -translate-y-1/2 text-gray-400 z-10" size={18} />
                            <div className="[&_input]:pl-10 [&_input]:rounded-xl [&_input]:border-gray-200">
                              <FormInput name="firstName" type="text" placeholder="Enter First Name" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-[22px] -translate-y-1/2 text-gray-400 z-10" size={18} />
                            <div className="[&_input]:pl-10 [&_input]:rounded-xl [&_input]:border-gray-200">
                              <FormInput name="lastName" type="text" placeholder="Enter Last Name" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-[22px] -translate-y-1/2 text-gray-400 z-10" size={18} />
                          <div className="[&_input]:pl-10 [&_input]:rounded-xl [&_input]:border-gray-200">
                            <FormInput name="email" type="email" placeholder="Enter Email" />
                          </div>
                        </div>
                      </div>

                      {/* Phone & NIC */}
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-[22px] -translate-y-1/2 text-gray-400 z-10" size={18} />
                            <div className="[&_input]:pl-10 [&_input]:rounded-xl [&_input]:border-gray-200">
                              <FormInput name="phone" type="tel" placeholder="Enter Phone Number" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            NIC <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <BookUser className="absolute left-3 top-[22px] -translate-y-1/2 text-gray-400 z-10" size={18} />
                            <div className="[&_input]:pl-10 [&_input]:rounded-xl [&_input]:border-gray-200">
                              <FormInput name="nic" type="text" placeholder="Enter NIC Number" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* DOB & Gender */}
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Date of Birth <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                            <Field
                              name="dob"
                              type="date"
                              className={`${selectClass} pl-10`}
                            />
                            <p className="text-red-500 text-sm mt-1 h-3">
                              <ErrorMessage name="dob" />
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Gender <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <VenusAndMars className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                            <Field name="gender" as="select" className={`${selectClass} pl-10`}>
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </Field>
                            <p className="text-red-500 text-sm mt-1 h-3">
                              <ErrorMessage name="gender" />
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Password & Department */}
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-[22px] -translate-y-1/2 text-gray-400 z-10" size={18} />
                            <div className="[&_input]:pl-10 [&_input]:rounded-xl [&_input]:border-gray-200">
                              <FormInput name="password" type="password" placeholder="Enter Password" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Department <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                            <Field name="department" as="select" className={`${selectClass} pl-10`}>
                              <option value="">Select Department</option>
                              {departments.map((dept) => (
                                <option key={dept} value={dept}>{dept}</option>
                              ))}
                            </Field>
                            <p className="text-red-500 text-sm mt-1 h-3">
                              <ErrorMessage name="department" />
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                          <span className="text-red-500">*</span> Required fields
                        </p>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                          <UserPlus size={18} />
                          {isSubmitting ? 'Registering...' : 'Register New Doctor'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default AddDoctorForm;
