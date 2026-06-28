'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import { Send } from 'lucide-react';
import FormInput from '@/components/ui/FormInput';
import { sendContactMessage } from '@/services/contactService';

const contactSchema = Yup.object({
  name: Yup.string().min(2, 'Name is required').required('Name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{7,15}$/, 'Enter a valid phone number (digits only)')
    .required('Phone number is required'),
  subject: Yup.string().required('Please select a subject'),
  message: Yup.string().min(10, 'Message must be at least 10 characters').required('Message is required'),
});

const initialValues = {
  name: '',
  email: '',
  phone: '',
  subject: 'General Inquiry',
  message: '',
};

const ContactForm = () => {
  const handleSubmit = async (
    values: typeof initialValues,
    { resetForm, setSubmitting }: { resetForm: () => void; setSubmitting: (v: boolean) => void }
  ) => {
    try {
      await sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        number: Number(values.phone.replace(/\D/g, '')),
        subject: values.subject,
        message: values.message.trim(),
      });
      toast.success('Message sent successfully! We will get back to you within 24 hours.');
      resetForm();
    } catch (error) {
      const errData = (error as { response?: { data?: unknown } })?.response?.data;
      const message =
        (typeof errData === 'string' ? errData : null) ||
        (errData as { error?: string })?.error ||
        'Failed to send message. Please try again.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <Formik initialValues={initialValues} validationSchema={contactSchema} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Your Name *</label>
                <FormInput name="name" type="text" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Your Email *</label>
                <FormInput name="email" type="email" placeholder="john@example.com" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone Number *</label>
                <FormInput name="phone" type="tel" placeholder="9998887776" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Subject *</label>
                <FieldSelect name="subject" />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Your Message *</label>
              <FieldTextarea name="message" placeholder="Write your message here..." />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition inline-flex items-center gap-2 group disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
              <Send size={18} className="group-hover:translate-x-1 transition" />
            </button>
          </Form>
        )}
      </Formik>
    </>
  );
};

const FieldSelect = ({ name }: { name: string }) => (
  <>
    <Field
      as="select"
      name={name}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
    >
      <option value="General Inquiry">General Inquiry</option>
      <option value="Appointment">Appointment</option>
      <option value="Emergency">Emergency</option>
      <option value="Feedback">Feedback</option>
      <option value="Others">Others</option>
    </Field>
    <p className="text-red-500 text-sm mt-1 h-3">
      <ErrorMessage name={name} />
    </p>
  </>
);

const FieldTextarea = ({ name, placeholder }: { name: string; placeholder: string }) => (
  <>
    <Field
      as="textarea"
      name={name}
      rows={5}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition resize-none"
    />
    <p className="text-red-500 text-sm mt-1 h-3">
      <ErrorMessage name={name} />
    </p>
  </>
);

export default ContactForm;
