"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  ChevronRight,
  FileText,
  MessageCircle,
  Video,
  Home,
  Ambulance,
  BookUser,
  VenusAndMars,
} from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import FormInput from "../ui/FormInput";
import conf from "@/conf/conf";
import {
  createAppointment,
  createCheckoutSession,
} from "@/services/appointmentService";
import {
  fetchDoctors,
  getDepartments,
  getDoctorsByDepartment,
} from "@/services/doctorService";
import { getTodayInputValue, isPastTimeSlot } from "@/lib/dateTime";
import {
  preferredDateField,
  preferredTimeField,
  getAvailableTimeSlots,
} from "@/utils/appointmentValidation";

// ─── Yup Validation Schema ─────────────────────────────────────────────────
const appointmentSchema = Yup.object({
  appointmentType: Yup.string().required("Please select an appointment type"),

  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),

  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),

  phone: Yup.string()
    .matches(/^\+?[0-9\s\-()]{7,15}$/, "Enter a valid phone number")
    .required("Phone number is required"),

  nic: Yup.string()
    .matches(/^[0-9]{9}[vVxX]$|^[0-9]{12}$/, "Enter a valid NIC number")
    .required("NIC number is required"),

  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),

  dob: Yup.string().required("Please select a date of birth"),

  department: Yup.string().required("Please select a department"),

  doctor: Yup.string().required("Please select a doctor"),

  preferredDate: preferredDateField,

  preferredTime: preferredTimeField,

  gender: Yup.string().required("Please select a gender"),

  reason: Yup.string()
    .min(10, "Please provide at least 10 characters")
    .required("Reason for visit is required"),

  notes: Yup.string().optional(),
});

// ─── Initial Values ─────────────────────────────────────────────────────────
const initialValues = {
  appointmentType: "",
  firstName: "",
  lastName: "",
  phone: "",
  nic: "",
  email: "",
  dob: "",
  department: "",
  doctor: "",
  preferredDate: "",
  preferredTime: "",
  gender: "",
  reason: "",
  notes: "",
};

// ─── Component ───────────────────────────────────────────────────────────────
const AppointmentForm = () => {
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDoctors = async () => {
      try {
        const data = await fetchDoctors();
        if (!cancelled) {
          setDoctors(data);
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to load doctors. Please refresh the page.");
        }
      } finally {
        if (!cancelled) {
          setDoctorsLoading(false);
        }
      }
    };

    loadDoctors();

    return () => {
      cancelled = true;
    };
  }, []);

  const departments = useMemo(() => getDepartments(doctors), [doctors]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      nic: values.nic,
      dob: values.dob,
      gender: values.gender,
      appointmentType: values.appointmentType,
      department: values.department,
      doctor: values.doctor,
      preferredDate: values.preferredDate,
      preferredTime: values.preferredTime,
      reason: values.reason,
      notes: values.notes || "",
      status: "pending",
    };

    try {
      await createAppointment(payload);

      const stripeKey = conf.stripePublishableKey;
      if (!stripeKey || stripeKey === "undefined") {
        toast.error("Stripe publishable key is missing. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.");
        resetForm();
        return;
      }

      if (!stripeKey.startsWith("pk_")) {
        toast.error("Stripe publishable key is invalid. Use a pk_test or pk_live key.");
        resetForm();
        return;
      }

      const session = await createCheckoutSession([payload]);
      if (session?.url) {
        window.location.href = session.url;
        return;
      }

      const stripe = await loadStripe(stripeKey);

      if (!stripe) {
        toast.error("Payment gateway failed to load. Appointment was saved.");
        resetForm();
        return;
      }

      const { error } = await stripe.redirectToCheckout({ sessionId: session.id });

      if (error) {
        toast.error(error.message || "Payment redirect failed. Appointment was saved.");
      }
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.response?.data ||
        "Failed to book appointment. Please try again.";
      toast.error(typeof message === "string" ? message : "Failed to book appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="lg:col-span-2">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Book Your Appointment
        </h2>

        <Formik
          initialValues={initialValues}
          validationSchema={appointmentSchema}
          onSubmit={handleSubmit}
        >
          {({ values, isSubmitting, setFieldValue }) => (
            <Form className="space-y-6">

              {/* ── Appointment Type ── */}
              <div>
                <label className="block text-gray-700 font-medium mb-3">
                  Appointment Type *
                </label>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { type: "Clinic Visit", icon: <Home size={18} /> },
                    { type: "Video Consult", icon: <Video size={18} /> },
                    { type: "Emergency", icon: <Ambulance size={18} /> },
                  ].map((item) => (
                    <label
                      key={item.type}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition ${
                        values.appointmentType === item.type
                          ? "bg-blue-50 border-blue-400"
                          : "border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                      }`}
                    >
                      <Field
                        type="radio"
                        name="appointmentType"
                        value={item.type}
                        className="text-blue-600"
                      />
                      <span className="text-blue-600">{item.icon}</span>
                      <span className="text-gray-700">{item.type}</span>
                    </label>
                  ))}
                </div>
                <p className="text-red-500 text-sm mt-1 h-4">
                  <ErrorMessage name="appointmentType" />
                </p>
              </div>

              {/* ── First Name / Last Name ── */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-6 -translate-y-1/2 text-gray-400 z-10"
                      size={18}
                    />
                    <div className="[&_input]:pl-10">
                      <FormInput name="firstName" type="text" placeholder="John" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-6 -translate-y-1/2 text-gray-400 z-10"
                      size={18}
                    />
                    <div className="[&_input]:pl-10">
                      <FormInput name="lastName" type="text" placeholder="Doe" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Phone / NIC ── */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-6 -translate-y-1/2 text-gray-400 z-10"
                      size={18}
                    />
                    <div className="[&_input]:pl-10">
                      <FormInput name="phone" type="tel" placeholder="+1 234 567 890" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    NIC Number *
                  </label>
                  <div className="relative">
                    <BookUser
                      className="absolute left-3 top-6 -translate-y-1/2 text-gray-400 z-10"
                      size={18}
                    />
                    <div className="[&_input]:pl-10">
                      {/* text type so leading zeros & 'v/x' suffix are preserved */}
                      <FormInput name="nic" type="text" placeholder="123456789V" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Email / DOB ── */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-6 -translate-y-1/2 text-gray-400 z-10"
                      size={18}
                    />
                    <div className="[&_input]:pl-10">
                      <FormInput name="email" type="email" placeholder="john@example.com" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-6 -translate-y-1/2 text-gray-400 z-10"
                      size={18}
                    />
                    <div className="[&_input]:pl-10">
                      <FormInput name="dob" type="date" placeholder="" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Department / Doctor ── */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Select Department *
                  </label>
                  <Field
                    as="select"
                    name="department"
                    disabled={doctorsLoading}
                    onChange={(e) => {
                      setFieldValue("department", e.target.value);
                      setFieldValue("doctor", "");
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {doctorsLoading ? "Loading departments..." : "Choose Department"}
                    </option>
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </Field>
                  <p className="text-red-500 text-sm mt-1 h-4">
                    <ErrorMessage name="department" />
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Select Doctor *
                  </label>
                  <Field
                    as="select"
                    name="doctor"
                    disabled={doctorsLoading || !values.department}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!values.department
                        ? "Select a department first"
                        : "Choose Doctor"}
                    </option>
                    {getDoctorsByDepartment(doctors, values.department).map((doc) => (
                      <option key={doc.id} value={doc.fullName}>
                        {doc.fullName}
                      </option>
                    ))}
                  </Field>
                  <p className="text-red-500 text-sm mt-1 h-4">
                    <ErrorMessage name="doctor" />
                  </p>
                </div>
              </div>

              {/* ── Preferred Date / Time ── */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Preferred Date *
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-6 -translate-y-1/2 text-gray-400 z-10"
                      size={18}
                    />
                    <div className="[&_input]:pl-10">
                      <FormInput
                        name="preferredDate"
                        type="date"
                        placeholder=""
                        min={getTodayInputValue()}
                        onChange={(e) => {
                          if (
                            values.preferredTime &&
                            isPastTimeSlot(values.preferredTime, e.target.value)
                          ) {
                            setFieldValue("preferredTime", "");
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Preferred Time *
                  </label>
                  <div className="relative">
                    <Clock
                      className="absolute left-3 top-4 text-gray-400 z-10"
                      size={18}
                    />
                    <Field
                      as="select"
                      name="preferredTime"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    >
                      <option value="">Select Time</option>
                      {getAvailableTimeSlots(values.preferredDate).map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </Field>
                    <p className="text-red-500 text-sm mt-1 h-4">
                      <ErrorMessage name="preferredTime" />
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Gender ── */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Gender *
                  </label>
                  <div className="relative">
                    <VenusAndMars
                      className="absolute left-3 top-4 text-gray-400 z-10"
                      size={18}
                    />
                    <Field
                      as="select"
                      name="gender"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Field>
                    <p className="text-red-500 text-sm mt-1 h-4">
                      <ErrorMessage name="gender" />
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Reason for Visit ── */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Reason for Visit *
                </label>
                <div className="relative">
                  <FileText
                    className="absolute left-3 top-4 text-gray-400 z-10"
                    size={18}
                  />
                  <Field
                    as="textarea"
                    name="reason"
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="Please describe your symptoms or reason for appointment..."
                  />
                  <p className="text-red-500 text-sm mt-1 h-4">
                    <ErrorMessage name="reason" />
                  </p>
                </div>
              </div>

              {/* ── Additional Notes ── */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Additional Notes (Optional)
                </label>
                <div className="relative">
                  <MessageCircle
                    className="absolute left-3 top-4 text-gray-400 z-10"
                    size={18}
                  />
                  <Field
                    as="textarea"
                    name="notes"
                    rows={2}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="Any specific requirements or information..."
                  />
                </div>
              </div>

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition inline-flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? "Booking..." : "Book & Pay ₹500"}
                {!isSubmitting && (
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-1 transition"
                  />
                )}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AppointmentForm;