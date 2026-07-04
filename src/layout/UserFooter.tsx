import { Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '../../public/images/logo.svg';

const UserFooter = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src={Logo} alt="Apollo Hospital logo" width={70} height={500} />
            </div>
            <p className="text-gray-400 text-sm">
              Providing compassionate healthcare with advanced medical technology.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/details">About Us</Link></li>
              <li><Link href="/doctors">Doctors</Link></li>
              <li><Link href="/contact-us">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Emergency Care</li>
              <li>Cardiology</li>
              <li>Neurology</li>
              <li>Pediatrics</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2"><MapPin size={16} /> 123 Medical Center Drive</li>
              <li className="flex items-center gap-2"><Phone size={16} /> +1 234 567 890</li>
              <li className="flex items-center gap-2"><Mail size={16} /> info@apollohospital.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Apollo Hospital. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default UserFooter;
