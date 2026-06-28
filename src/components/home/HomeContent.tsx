import React from 'react';
import Link from 'next/link';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Activity,
  Heart,
  Users,
  Clock,
  ChevronRight,
  Star,
  Shield,
  Award
} from 'lucide-react';
import ImageHospital from '../../../public/images/Apollo-Hospital.webp'
import Image from 'next/image';
import Button from '@/components/ui/Button';
import ImageDoctor1 from '../../../public/images/doctors/image1.png';
import ImageDoctor2 from '../../../public/images/doctors/image2.png';
import ImageDoctor3 from '../../../public/images/doctors/image3.png';
import ImageDoctor4 from '../../../public/images/doctors/image4.png';


import type { Doctor } from '@/services/doctorService';

interface HomeContentProps {
  featuredDoctors: Doctor[];
  doctorCount: number;
}

const HomeContent = ({ featuredDoctors, doctorCount }: HomeContentProps) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[100vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image 
            src={ImageHospital} 
            alt="Hospital" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent"></div>
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <p className="text-blue-200 font-semibold mb-4">WELCOME TO CITY HOSPITAL</p>
            <h1 className="text-xl sm:text-5xl font-bold mb-6">Exceptional Healthcare for You & Your Family</h1>
            <p className="text-md sm:text-xl mb-8 text-gray-100">Providing compassionate, advanced medical care with state-of-the-art facilities and expert doctors available 24/7.</p>
            <div className="flex flex-wrap gap-4">
              <Button 
              style="bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition flex items-center gap-2 cursor-pointer"
              navigate="/appointment"
              text="Book Appointment"
              icon
              />
              <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition flex items-center gap-2 cursor-pointer">
                Our Services <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex gap-8 mt-12">
              <div>
                <p className="text-3xl font-bold">25+</p>
                <p className="text-blue-200">Years Experience</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{doctorCount > 0 ? `${doctorCount}+` : '50+'}</p>
                <p className="text-blue-200">Expert Doctors</p>
              </div>
              <div>
                <p className="text-3xl font-bold">10k+</p>
                <p className="text-blue-200">Happy Patients</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Apollo Hospital?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We provide comprehensive healthcare with compassion and cutting-edge technology</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-12 h-12 text-blue-900" />,
                title: "Expert Doctors",
                desc: "Board-certified specialists with years of experience"
              },
              {
                icon: <Activity className="w-12 h-12 text-blue-900" />,
                title: "Modern Technology",
                desc: "Latest medical equipment and treatment methods"
              },
              {
                icon: <Heart className="w-12 h-12 text-blue-900" />,
                title: "Compassionate Care",
                desc: "Patient-first approach with personalized attention"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Medical Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Comprehensive healthcare services tailored to your needs</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Emergency Care", icon: <Clock />, bg: "bg-red-100", color: "text-red-600" },
              { name: "Cardiology", icon: <Heart />, bg: "bg-pink-100", color: "text-pink-600" },
              { name: "Neurology", icon: <Activity />, bg: "bg-purple-100", color: "text-purple-600" },
              { name: "Pediatrics", icon: <Users />, bg: "bg-green-100", color: "text-green-600" },
              { name: "Surgery", icon: <Award />, bg: "bg-blue-100", color: "text-blue-600" },
              { name: "Dental Care", icon: <Star />, bg: "bg-yellow-100", color: "text-yellow-600" },
              { name: "Laboratory", icon: <Activity />, bg: "bg-indigo-100", color: "text-indigo-600" },
              { name: "Pharmacy", icon: <Heart />, bg: "bg-orange-100", color: "text-orange-600" }
            ].map((service, index) => (
              <div key={index} className="group cursor-pointer">
                <div className={`${service.bg} p-6 rounded-xl text-center hover:shadow-lg transition`}>
                  <div className={`${service.color} flex justify-center mb-3`}>
                    {service.icon}
                  </div>
                  <h3 className="font-semibold text-gray-800">{service.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Expert Doctors</h2>
            <p className="text-gray-600">Meet our team of experienced healthcare professionals</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {(featuredDoctors.length > 0
              ? featuredDoctors.slice(0, 4).map((doctor) => ({
                  name: doctor.fullName,
                  specialty: doctor.department,
                  experience: doctor.department,
                  img: doctor.imageUrl,
                  isRemote: true,
                }))
              : [
                  {
                    name: 'Dr. chang ching',
                    specialty: 'Oncology',
                    experience: '15+ years experience',
                    img: ImageDoctor1,
                    isRemote: false,
                  },
                  {
                    name: 'Dr. Sneha Reddy',
                    specialty: 'Dermatology',
                    experience: '12+ years experience',
                    img: ImageDoctor2,
                    isRemote: false,
                  },
                  {
                    name: 'Dr. Amelia Harper',
                    specialty: 'ENT',
                    experience: '10+ years experience',
                    img: ImageDoctor3,
                    isRemote: false,
                  },
                  {
                    name: 'Dr. Naveen Kumar',
                    specialty: 'General',
                    experience: '18+ years experience',
                    img: ImageDoctor4,
                    isRemote: false,
                  },
                ]
            ).map((doctor) => (
              <div key={doctor.name} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
                <div className="relative w-full h-64 bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900">
                  {doctor.isRemote ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={doctor.img as string}
                      alt={doctor.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <Image src={doctor.img as typeof ImageDoctor1} alt={doctor.name} fill className="object-cover" />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
                  <p className="text-blue-600 mb-2">{doctor.specialty}</p>
                  <p className="text-gray-600 text-sm capitalize">{doctor.experience}</p>
                  <div className="flex gap-2 mt-4">
                    <Button 
                    style="flex-1 bg-blue-900 text-white py-2 rounded-lg text-sm hover:bg-blue-800 cursor-pointer"
                    navigate="/appointment"
                    text="Book Appointment"
                   />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Patient Testimonials</h2>
            <p className="text-gray-600">What our patients say about us</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "John Smith",
                role: "Cardiac Patient",
                rating: 5,
                comment:
                  "The cardiology team saved my life. From diagnosis to surgery, every step was handled with incredible expertise and genuine compassion. I can't thank them enough.",
                img: "https://randomuser.me/api/portraits/men/52.jpg",
              },
              {
                name: "Priya Sharma",
                role: "New Mother",
                rating: 5,
                comment:
                  "The maternity ward was amazing during the birth of my daughter. The nurses were so supportive and the doctors made me feel safe throughout the entire journey.",
                img: "https://randomuser.me/api/portraits/women/65.jpg",
              },
              {
                name: "Robert Williams",
                role: "Orthopedic Patient",
                rating: 4,
                comment:
                  "After my knee replacement, the physiotherapy and follow-up care were exceptional. I'm back on my feet faster than I ever expected. Truly professional staff.",
                img: "https://randomuser.me/api/portraits/men/41.jpg",
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
                <div className="flex text-yellow-400 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      fill={star <= testimonial.rating ? "currentColor" : "none"}
                      className={star <= testimonial.rating ? "text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">&ldquo;{testimonial.comment}&rdquo;</p>
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={testimonial.img}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment CTA */}
      <section className="bg-blue-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Need Medical Assistance?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">Our team is available 24/7 to provide you with the care you need. Book an appointment today.</p>
              <Button 
              style="bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-300 transition inline-flex items-center gap-2 cursor-pointer"
              navigate="/appointment"
              text="Make an Appointment"
              icon
              />
        </div>
      </section>

    </div>
  );
};

export default HomeContent;