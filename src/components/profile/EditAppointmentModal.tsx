'use client';

import { useEffect, useMemo, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Modal from '@/components/ui/Modal';
import {
  APPOINTMENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  parseAppointmentError,
  updateAppointment,
  type ApiAppointment,
  type AppointmentEditable,
} from '@/services/appointmentService';
import {
  fetchDoctors,
  getDepartments,
  getDoctorsByDepartment,
  type Doctor,
} from '@/services/doctorService';
import { getTodayInputValue, isPastTimeSlot } from '@/lib/dateTime';
import {
  preferredDateField,
  preferredTimeField,
  getAvailableTimeSlots,
} from '@/utils/appointmentValidation';
import { toastError, toastInfo, toastSuccess } from '@/lib/swal';

interface EditAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  appointmentId: string;
  initialValues: AppointmentEditable;
  onSaved: (updated: ApiAppointment) => void;
}

const inputClass =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed';

const labelClass =
  'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5';

const errorClass = 'text-red-500 text-xs mt-1 h-4 block';

const editAppointmentSchema = Yup.object({
  appointmentType: Yup.string().required('Please select an appointment type'),
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  phone: Yup.string()
    .matches(/^\+?[0-9\s\-()]{7,15}$/, 'Enter a valid phone number')
    .required('Phone number is required'),
  nic: Yup.string()
    .matches(/^[0-9]{9}[vVxX]$|^[0-9]{12}$/, 'Enter a valid NIC number')
    .required('NIC number is required'),
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email is required'),
  dob: Yup.string().required('Please select a date of birth'),
  department: Yup.string().required('Please select a department'),
  doctor: Yup.string().required('Please select a doctor'),
  preferredDate: preferredDateField,
  preferredTime: preferredTimeField,
  gender: Yup.string().required('Please select a gender'),
  reason: Yup.string()
    .min(10, 'Please provide at least 10 characters')
    .required('Reason for visit is required'),
  notes: Yup.string(),
});

const EditAppointmentModal = ({
  open,
  onClose,
  appointmentId,
  initialValues,
  onSaved,
}: EditAppointmentModalProps) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const loadDoctors = async () => {
      setDoctorsLoading(true);
      try {
        const data = await fetchDoctors();
        if (!cancelled) setDoctors(data);
      } catch {
        if (!cancelled) toastError('Failed to load doctors. Please try again.');
      } finally {
        if (!cancelled) setDoctorsLoading(false);
      }
    };

    loadDoctors();

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Keep the appointment's current department selectable even if no doctor
  // currently maps to it in the fetched list.
  const departments = useMemo(() => {
    const list = getDepartments(doctors);
    if (initialValues.department && !list.includes(initialValues.department)) {
      return [initialValues.department, ...list];
    }
    return list;
  }, [doctors, initialValues.department]);

  const formInitialValues = useMemo(() => {
    const values = { ...initialValues };
    if (
      values.preferredDate &&
      values.preferredTime &&
      isPastTimeSlot(values.preferredTime, values.preferredDate)
    ) {
      values.preferredTime = '';
    }
    return values;
  }, [initialValues]);

  return (
    <Formik<AppointmentEditable>
      initialValues={formInitialValues}
      validationSchema={editAppointmentSchema}
      enableReinitialize
      onSubmit={async (values, { setSubmitting }) => {
        const changed: Partial<AppointmentEditable> = {};
        (Object.keys(values) as (keyof AppointmentEditable)[]).forEach((key) => {
          if (values[key] !== initialValues[key]) {
            changed[key] = values[key];
          }
        });

        if (Object.keys(changed).length === 0) {
          toastInfo('No changes to save');
          setSubmitting(false);
          return;
        }

        try {
          const updated = await updateAppointment(appointmentId, changed);
          toastSuccess('Appointment updated successfully');
          onSaved(updated);
          onClose();
        } catch (error) {
          const { message, isAuthError } = parseAppointmentError(error);
          toastError(message);
          if (isAuthError) {
            window.location.href = '/login';
          }
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, isSubmitting, setFieldValue }) => {
        const doctorOptions = getDoctorsByDepartment(doctors, values.department);
        const doctorNames = doctorOptions.map((doc) => doc.fullName);
        const includeCurrentDoctor =
          values.department === initialValues.department &&
          !!initialValues.doctor &&
          !doctorNames.includes(initialValues.doctor);

        return (
          <Modal
            open={open}
            onClose={() => {
              if (!isSubmitting) onClose();
            }}
            title="Edit Appointment"
            subtitle="Update the details below. Only pending appointments can be edited."
            maxWidth="xl"
            footer={
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="edit-appointment-form"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-100 disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            }
          >
            <Form id="edit-appointment-form" className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <Field name="firstName" type="text" className={inputClass} />
                  <ErrorMessage name="firstName" component="span" className={errorClass} />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <Field name="lastName" type="text" className={inputClass} />
                  <ErrorMessage name="lastName" component="span" className={errorClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <Field name="email" type="email" className={inputClass} />
                  <ErrorMessage name="email" component="span" className={errorClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <Field name="phone" type="tel" className={inputClass} />
                  <ErrorMessage name="phone" component="span" className={errorClass} />
                </div>
                <div>
                  <label className={labelClass}>NIC</label>
                  <Field name="nic" type="text" className={inputClass} />
                  <ErrorMessage name="nic" component="span" className={errorClass} />
                </div>
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <Field name="dob" type="date" className={inputClass} />
                  <ErrorMessage name="dob" component="span" className={errorClass} />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <Field as="select" name="gender" className={inputClass}>
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="gender" component="span" className={errorClass} />
                </div>
                <div>
                  <label className={labelClass}>Appointment Type</label>
                  <Field as="select" name="appointmentType" className={inputClass}>
                    <option value="">Select type</option>
                    {APPOINTMENT_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="appointmentType" component="span" className={errorClass} />
                </div>
                <div>
                  <label className={labelClass}>Department</label>
                  <Field
                    as="select"
                    name="department"
                    disabled={doctorsLoading}
                    className={inputClass}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setFieldValue('department', e.target.value);
                      setFieldValue('doctor', '');
                    }}
                  >
                    <option value="">
                      {doctorsLoading ? 'Loading departments...' : 'Choose department'}
                    </option>
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="department" component="span" className={errorClass} />
                </div>
                <div>
                  <label className={labelClass}>Doctor</label>
                  <Field
                    as="select"
                    name="doctor"
                    disabled={doctorsLoading || !values.department}
                    className={inputClass}
                  >
                    <option value="">
                      {!values.department ? 'Select a department first' : 'Choose doctor'}
                    </option>
                    {includeCurrentDoctor && (
                      <option value={initialValues.doctor}>{initialValues.doctor}</option>
                    )}
                    {doctorOptions.map((doc) => (
                      <option key={doc.id} value={doc.fullName}>
                        {doc.fullName}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="doctor" component="span" className={errorClass} />
                </div>
                <div>
                  <label className={labelClass}>Preferred Date</label>
                  <Field
                    name="preferredDate"
                    type="date"
                    min={getTodayInputValue()}
                    className={inputClass}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('preferredDate', e.target.value);
                      if (
                        values.preferredTime &&
                        isPastTimeSlot(values.preferredTime, e.target.value)
                      ) {
                        setFieldValue('preferredTime', '');
                      }
                    }}
                  />
                  <ErrorMessage name="preferredDate" component="span" className={errorClass} />
                </div>
                <div>
                  <label className={labelClass}>Preferred Time</label>
                  <Field as="select" name="preferredTime" className={inputClass}>
                    <option value="">Select time</option>
                    {getAvailableTimeSlots(values.preferredDate).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="preferredTime" component="span" className={errorClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Reason for Visit</label>
                <Field
                  as="textarea"
                  name="reason"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
                <ErrorMessage name="reason" component="span" className={errorClass} />
              </div>

              <div>
                <label className={labelClass}>Additional Notes</label>
                <Field
                  as="textarea"
                  name="notes"
                  rows={2}
                  placeholder="Optional"
                  className={`${inputClass} resize-none`}
                />
              </div>
            </Form>
          </Modal>
        );
      }}
    </Formik>
  );
};

export default EditAppointmentModal;
