import ContactForm from '@/components/contact/ContactForm';
import Link from 'next/link';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Ambulance,
  Calendar,
  MessageCircle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import ContactImage from '../../../public/images/Apollo-Hospital.webp';

const ContactUsContent = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-blue-900 py-20">
      <Image
          src={ContactImage}
          alt="Apollo Hospital"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/90 via-blue-950/85 to-blue-900/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            We're here to help you 24/7. Reach out to us anytime for appointments, emergencies, or inquiries
          </p>
          <div className="flex items-center justify-center gap-2 mt-8 text-blue-200">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-white">Contact Us</span>
          </div>
        </div>
      </section>

      {/* Emergency Contact Banner */}
      <section className="bg-red-600 py-4 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-white">
            <div className="flex items-center gap-3 mb-2 md:mb-0">
              <Ambulance size={28} className="animate-pulse" />
              <span className="font-bold text-lg">24/7 EMERGENCY SERVICES AVAILABLE</span>
            </div>
            <div className="flex items-center gap-4">
              <Phone size={20} />
              <span className="text-xl font-bold">+1-234-567-890</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="py-16 mt-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 -mt-24 relative z-10">
            {[
              {
                icon: <Phone className="w-8 h-8" />,
                title: "Call Us",
                info: "+1 234 567 890",
                subInfo: "+1 234 567 891",
                bg: "bg-blue-600",
                action: "Call Now"
              },
              {
                icon: <Mail className="w-8 h-8" />,
                title: "Email Us",
                info: "info@apollohospital.com",
                subInfo: "support@apollohospital.com",
                bg: "bg-green-600",
                action: "Send Email"
              },
              {
                icon: <MapPin className="w-8 h-8" />,
                title: "Visit Us",
                info: "123 Medical Center Dr",
                subInfo: "New York, NY 10001",
                bg: "bg-purple-600",
                action: "Get Directions"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Working Hours",
                info: "24/7 Emergency",
                subInfo: "OPD: 9AM - 8PM",
                bg: "bg-orange-600",
                action: "Check Schedule"
              }
            ].map((card, index) => (
              <div 
                key={index} 
                className={`${card.bg} text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1`}
              >
                <div className="bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-white/90 mb-1">{card.info}</p>
                <p className="text-white/80 text-sm mb-4">{card.subInfo}</p>
                <button className="flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all">
                  {card.action} <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Get In Touch</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2 mb-6">
                Send Us a Message
              </h2>
              <p className="text-gray-600 mb-8">
                Have questions? We're here to help. Fill out the form below and we'll get back to you within 24 hours.
              </p>
              
              <ContactForm />
            </div>

            {/* Map & Additional Info */}
            <div>
              {/* Map */}
              <div className="bg-gray-200 h-80 rounded-2xl overflow-hidden mb-8">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1644262073400!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  className="grayscale hover:grayscale-0 transition"
                ></iframe>
              </div>

              {/* Department Contacts */}
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Department Contacts</h3>
                <div className="space-y-4">
                  {[
                    { dept: "Emergency", phone: "+1 234 567 890", email: "emergency@apollohospital.com" },
                    { dept: "Appointments", phone: "+1 234 567 891", email: "appointments@apollohospital.com" },
                    { dept: "Billing", phone: "+1 234 567 892", email: "billing@apollohospital.com" },
                    { dept: "HR Department", phone: "+1 234 567 893", email: "hr@apollohospital.com" }
                  ].map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-800">{dept.dept}</h4>
                        <p className="text-sm text-gray-600">{dept.phone}</p>
                      </div>
                      <a href={`mailto:${dept.email}`} className="text-blue-600 hover:text-blue-700">
                        <Mail size={18} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Quick answers to common questions. Can't find what you're looking for? Contact us directly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: "How do I book an appointment?",
                a: "You can book an appointment through our online form, call our appointment desk, or visit us in person."
              },
              {
                q: "What are your visiting hours?",
                a: "General visiting hours are 10 AM to 8 PM. ICU visitors are allowed from 4 PM to 6 PM."
              },
              {
                q: "Do you accept insurance?",
                a: "Yes, we accept most major insurance plans. Please contact our billing department for verification."
              },
              {
                q: "Is there parking available?",
                a: "Yes, we have a multi-level parking facility available for patients and visitors."
              },
              {
                q: "What should I bring for my appointment?",
                a: "Please bring your ID, insurance card, previous medical records, and list of current medications."
              },
              {
                q: "Do you have emergency services?",
                a: "Yes, we have 24/7 emergency services with trauma center and ambulance availability."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
                <h3 className="font-bold text-gray-800 mb-2 flex items-start gap-2">
                  <HelpCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="text-gray-600 ml-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect With Us */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Connect With Us</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Follow us on social media for health tips, hospital news, and community updates
          </p>
          <div className="flex justify-center gap-4">
            {[
              { icon: <Facebook size={24} />, href: "#", color: "bg-blue-600" },
              { icon: <Twitter size={24} />, href: "#", color: "bg-sky-500" },
              { icon: <Instagram size={24} />, href: "#", color: "bg-pink-600" },
              { icon: <Linkedin size={24} />, href: "#", color: "bg-blue-700" },
              { icon: <Youtube size={24} />, href: "#", color: "bg-red-600" }
            ].map((social, index) => (
              <a
                key={index}
                href={social.href}
                className={`${social.color} text-white w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition transform`}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-blue-100 mb-6">
              Get health tips, hospital updates, and wellness information delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg focus:outline-none border border-white text-white"
              />
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition cursor-pointer">
                Subscribe
              </button>
            </div>
            <p className="text-blue-200 text-sm mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-gray-50 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Business Hours</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <h4 className="font-semibold text-gray-800 mb-2">Emergency</h4>
                <p className="text-blue-600 font-bold">24/7 Available</p>
                <p className="text-sm text-gray-600 mt-1">Always open for emergencies</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-800 mb-2">OPD Services</h4>
                <p className="text-blue-600 font-bold">9:00 AM - 8:00 PM</p>
                <p className="text-sm text-gray-600 mt-1">Monday - Saturday</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-800 mb-2">Visiting Hours</h4>
                <p className="text-blue-600 font-bold">10:00 AM - 8:00 PM</p>
                <p className="text-sm text-gray-600 mt-1">ICU: 4:00 PM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUsContent;