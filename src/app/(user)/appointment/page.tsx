// app/appointment/page.tsx
import React from 'react';
import Link from 'next/link';
import { 
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  FileText,
  MessageCircle,
  CreditCard,
  Shield,
  Users,
  Video,
  Home,
  Ambulance
} from 'lucide-react';
import AppointmentForm from '@/components/appointmentForm/AppointmentForm'
import Image from 'next/image';
import ImageAppointment from '../../../../public/images/about/appointment.jpg'

const page = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-blue-900 py-20">
      <Image
          src={ImageAppointment}
          alt="Apollo Hospital"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/85 to-cyan-900/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Book an Appointment</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Schedule your visit with our expert doctors. Quick, easy, and convenient online booking
          </p>
          <div className="flex items-center justify-center gap-2 mt-8 text-blue-200">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-white">Appointment</span>
          </div>
        </div>
      </section>

      {/* Quick Booking Options */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 -mt-24 relative z-10">
            {[
              {
                icon: <Video className="w-8 h-8" />,
                title: "Video Consultation",
                desc: "Consult doctors from home",
                time: "Within 30 mins",
                color: "bg-green-600",
                popular: false
              },
              {
                icon: <Home className="w-8 h-8" />,
                title: "Clinic Visit",
                desc: "In-person appointment",
                time: "Choose your time",
                color: "bg-blue-600",
                popular: true
              },
              {
                icon: <Ambulance className="w-8 h-8" />,
                title: "Emergency",
                desc: "24/7 immediate care",
                time: "Instant",
                color: "bg-red-600",
                popular: false
              }
            ].map((option, index) => (
              <div 
                key={index} 
                className={`${option.color} text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 relative overflow-hidden`}
              >
                {option.popular && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  {option.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{option.title}</h3>
                <p className="text-white/90 mb-2">{option.desc}</p>
                <p className="text-white/80 text-sm mb-4">Available: {option.time}</p>
                <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition text-sm">
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Appointment Form */}
      <section className="py-20">
        {/* <AppointmentForm/> */}
        <div className="container mx-auto px-4">
                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Booking Form */}
                    <AppointmentForm/>
        
                    {/* Sidebar Information */}
                    <div className="lg:col-span-1 space-y-6">
                      {/* Quick Info */}
                      <div className="bg-blue-50 p-6 rounded-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Information</h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Clock className="text-blue-600 flex-shrink-0 mt-1" size={18} />
                            <div>
                              <p className="font-medium text-gray-800">Clinic Hours</p>
                              <p className="text-sm text-gray-600">Mon - Sat: 9:00 AM - 8:00 PM</p>
                              <p className="text-sm text-gray-600">Sunday: 10:00 AM - 2:00 PM</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Phone className="text-blue-600 flex-shrink-0 mt-1" size={18} />
                            <div>
                              <p className="font-medium text-gray-800">Emergency Contact</p>
                              <p className="text-sm text-gray-600">+1 234 567 890 (24/7)</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPin className="text-blue-600 flex-shrink-0 mt-1" size={18} />
                            <div>
                              <p className="font-medium text-gray-800">Location</p>
                              <p className="text-sm text-gray-600">123 Medical Center Dr, NY</p>
                            </div>
                          </div>
                        </div>
                      </div>
        
                      {/* Insurance Info */}
                      <div className="bg-green-50 p-6 rounded-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Shield className="text-green-600" size={20} />
                          Insurance Accepted
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          We accept most major insurance plans
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {["Aetna", "Blue Cross", "Cigna", "UnitedHealth", "Medicare", "Medicaid"].map((ins, idx) => (
                            <span key={idx} className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                              {ins}
                            </span>
                          ))}
                        </div>
                      </div>
        
                      {/* What to Bring */}
                      <div className="bg-purple-50 p-6 rounded-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <FileText className="text-purple-600" size={20} />
                          What to Bring
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          {[
                            "Valid ID proof",
                            "Insurance card",
                            "Previous medical records",
                            "List of current medications",
                            "Test reports (if any)"
                          ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
        
                      {/* Cancellation Policy */}
                      <div className="bg-orange-50 p-6 rounded-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <AlertCircle className="text-orange-600" size={20} />
                          Cancellation Policy
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          • Cancel at least 2 hours before appointment
                        </p>
                        <p className="text-sm text-gray-600">
                          • Late cancellations may incur a fee
                        </p>
                      </div>
        
                      {/* Payment Methods */}
                      <div className="bg-gray-50 p-6 rounded-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <CreditCard className="text-gray-600" size={20} />
                          Payment Methods
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {["Visa", "Mastercard", "Amex", "Cash", "Insurance"].map((method, idx) => (
                            <span key={idx} className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                              {method}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
      </section>

      {/* Available Doctors */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Available Doctors</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our team of experienced specialists
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                name: "Dr. Sarah Johnson",
                specialty: "Cardiologist",
                experience: "15 years",
                availability: "Mon, Wed, Fri",
                image: "/api/placeholder/300/300",
                color: "bg-pink-100"
              },
              {
                name: "Dr. James Wilson",
                specialty: "Neurologist",
                experience: "12 years",
                availability: "Tue, Thu, Sat",
                image: "/api/placeholder/300/300",
                color: "bg-blue-100"
              },
              {
                name: "Dr. Emily Chen",
                specialty: "Pediatrician",
                experience: "10 years",
                availability: "Mon - Fri",
                image: "/api/placeholder/300/300",
                color: "bg-green-100"
              },
              {
                name: "Dr. Michael Brown",
                specialty: "Orthopedic",
                experience: "18 years",
                availability: "Mon, Tue, Thu",
                image: "/api/placeholder/300/300",
                color: "bg-purple-100"
              }
            ].map((doctor, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="h-48 overflow-hidden">
                  <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{doctor.name}</h3>
                  <p className={`${doctor.color} inline-block px-3 py-1 rounded-full text-sm font-medium text-gray-800 mb-3`}>
                    {doctor.specialty}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">Experience: {doctor.experience}</p>
                  <p className="text-sm text-gray-600 mb-4">Available: {doctor.availability}</p>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment Tips */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-blue-600 rounded-3xl p-8 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Tips for Your Appointment</h3>
                <ul className="space-y-3">
                  {[
                    "Arrive 15 minutes before your appointment",
                    "Bring your ID and insurance card",
                    "List your symptoms and questions",
                    "Bring previous medical reports",
                    "Arrive with a list of current medications"
                  ].map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle size={18} className="text-yellow-300 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-2xl p-6">
                  <h4 className="text-xl font-bold mb-2">Need Immediate Help?</h4>
                  <p className="text-blue-100 mb-4">Call our 24/7 helpline</p>
                  <p className="text-3xl font-bold">+1 234 567 890</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default page;