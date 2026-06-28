// app/about/page.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Heart, 
  Users, 
  Award, 
  Shield, 
  Stethoscope,
  Ambulance,
  Microscope,
  Clock,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import ImageHospital from '../../../public/images/Apollo-Hospital.webp'
import ImageOperation from '../../../public/images/about/operation.webp'
import ImageDoctors from '../../../public/images/about/doctors.webp'
import ImagePatient from '../../../public/images/about/patient.jpg'
import ImageHead from '../../../public/images/about/head.webp'
import ImageFounder from '../../../public/images/about/founder.jpg'
import ImageSurgent from '../../../public/images/about/surgen.webp'

const DetailsContent = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-blue-900 py-20">
      <Image
          src={ImagePatient}
          alt="Apollo Hospital"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/85 to-cyan-900/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Apollo Hospital</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Providing exceptional healthcare with compassion, innovation, and excellence since 1995
          </p>
          <div className="flex items-center justify-center gap-2 mt-8 text-blue-200">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-white">About Us</span>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2 mb-6">
                Over 25 Years of Dedicated Healthcare Service
              </h2>
              <p className="text-gray-600 mb-4">
                Founded in 1995 by Dr. Sarah Mitchell, Apollo Hospital began as a small community clinic with a vision to provide accessible, high-quality healthcare to everyone. Today, we have grown into a multi-specialty hospital with state-of-the-art facilities and a team of over 200 dedicated healthcare professionals.
              </p>
              <p className="text-gray-600 mb-6">
                Our journey has been marked by continuous innovation, compassionate care, and an unwavering commitment to patient well-being. We've touched the lives of over 100,000 patients and their families, earning their trust through our dedication to excellence.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-blue-600" size={20} />
                  <span className="text-gray-700">25+ Years Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-blue-600" size={20} />
                  <span className="text-gray-700">50+ Expert Doctors</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-blue-600" size={20} />
                  <span className="text-gray-700">10k+ Happy Patients</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gray-200 h-48 rounded-2xl overflow-hidden">
                  <Image src={ImageHospital} alt="Hospital Building" className="w-full h-full object-cover" />
                </div>
                <div className="bg-gray-200 h-64 rounded-2xl overflow-hidden">
                  <Image src={ImageOperation} alt="Operation Theatre" className="w-full h-full object-cover" 
                  />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-gray-200 h-64 rounded-2xl overflow-hidden">
                  <Image src={ImageDoctors} alt="Doctors" className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-gray-200 h-48 rounded-2xl overflow-hidden">
                  <Image src={ImagePatient} alt="Patient Care" className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Mission & Vision</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Guided by our core values, we strive to make a difference in healthcare
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Heart className="text-blue-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To provide compassionate, accessible, and high-quality healthcare services to our community, 
                treating every patient with dignity and respect while maintaining the highest standards of 
                medical excellence.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Award className="text-blue-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To be the leading healthcare institution recognized for excellence in patient care, 
                medical innovation, and community service, setting new standards in healthcare delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: <Heart className="text-blue-600" size={32} />,
                title: "Compassion",
                desc: "Treating every patient with empathy and kindness"
              },
              {
                icon: <Shield className="text-blue-600" size={32} />,
                title: "Excellence",
                desc: "Striving for the highest quality in everything we do"
              },
              {
                icon: <Users className="text-blue-600" size={32} />,
                title: "Integrity",
                desc: "Acting with honesty and ethical principles"
              },
              {
                icon: <Stethoscope className="text-blue-600" size={32} />,
                title: "Innovation",
                desc: "Embracing new technologies and treatments"
              }
            ].map((value, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-blue-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "25+", label: "Years of Experience", icon: <Clock className="text-white" size={32} /> },
              { number: "50+", label: "Expert Doctors", icon: <Users className="text-white" size={32} /> },
              { number: "10k+", label: "Happy Patients", icon: <Heart className="text-white" size={32} /> },
              { number: "100+", label: "Medical Staff", icon: <Award className="text-white" size={32} /> }
            ].map((stat, index) => (
              <div key={index} className="text-white">
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Leadership Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experienced professionals dedicated to excellence in healthcare
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Sarah Mitchell",
                role: "Founder & Chief Medical Officer",
                desc: "25+ years experience in internal medicine",
                image: ImageFounder
              },
              {
                name: "Dr. James Wilson",
                role: "Director of Surgery",
                desc: "Leading surgeon with specialization in cardiothoracic surgery",
                image: ImageSurgent
              },
              {
                name: "Dr. Emily Chen",
                role: "Head of Pediatrics",
                desc: "Dedicated to children's healthcare for over 15 years",
                image: ImageHead
              }
            ].map((leader, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="h-64 overflow-hidden">
                  <Image src={leader.image} alt={leader.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{leader.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{leader.role}</p>
                  <p className="text-gray-600 text-sm">{leader.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Facilities</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              State-of-the-art infrastructure for comprehensive healthcare
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: <Microscope />, name: "Advanced Lab" },
              { icon: <Ambulance />, name: "Emergency 24/7" },
              { icon: <Heart />, name: "Cardiology Unit" },
              { icon: <Stethoscope />, name: "ICU" },
              { icon: <Shield />, name: "Operation Theaters" },
              { icon: <Award />, name: "Pharmacy" },
              { icon: <Users />, name: "Private Rooms" },
              { icon: <Calendar />, name: "OPD Services" }
            ].map((facility, index) => (
              <div key={index} className="bg-white p-6 rounded-xl text-center hover:shadow-lg transition">
                <div className="text-blue-600 flex justify-center mb-3">{facility.icon}</div>
                <span className="text-gray-700 font-medium">{facility.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Why Choose Apollo Hospital?
              </h2>
              <div className="space-y-4">
                {[
                  "24/7 emergency services with rapid response team",
                  "Internationally trained doctors and specialists",
                  "Advanced medical technology and equipment",
                  "Comfortable patient rooms with modern amenities",
                  "Affordable treatment options and insurance support",
                  "Holistic approach to healthcare"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <Link 
                href="/appointment" 
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition mt-8"
              >
                Book Appointment <Calendar size={20} />
              </Link>
            </div>
            <div className="bg-blue-50 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Accreditations & Awards</h3>
              <div className="space-y-4">
                {[
                  "NABH Accredited Hospital",
                  "Best Multi-Specialty Hospital Award 2023",
                  "Excellence in Patient Care Award",
                  "ISO 9001:2015 Certified",
                  "Top Healthcare Provider of the Year"
                ].map((award, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Award className="text-blue-600" size={20} />
                    <span className="text-gray-700">{award}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Have Questions? We're Here to Help</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Our team is available 24/7 to answer your questions and provide assistance
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/contact-us" 
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center gap-2"
            >
              Contact Us <Mail size={20} />
            </Link>
            <Link 
              href="/appointment" 
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition inline-flex items-center gap-2"
            >
              Make Appointment <Calendar size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DetailsContent;