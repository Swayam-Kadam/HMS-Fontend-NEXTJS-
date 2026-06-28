'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Droplets,
  Heart,
  Search,
  Mail,
  Calendar,
  User,
  Users,
  Shield,
  Phone,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { fetchDonors, type Donor, type DonorType } from '@/services/donationService';

type TabId = DonorType;

const bloodGroupColors: Record<string, string> = {
  'A+': 'bg-red-100 text-red-700 border-red-200',
  'A-': 'bg-red-50 text-red-600 border-red-100',
  'B+': 'bg-blue-100 text-blue-700 border-blue-200',
  'B-': 'bg-blue-50 text-blue-600 border-blue-100',
  'O+': 'bg-orange-100 text-orange-700 border-orange-200',
  'O-': 'bg-orange-50 text-orange-600 border-orange-100',
  'AB+': 'bg-purple-100 text-purple-700 border-purple-200',
  'AB-': 'bg-purple-50 text-purple-600 border-purple-100',
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const formatDate = (dob: string) => {
  if (!dob) return '—';
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const DonorCard = ({ donor, accent }: { donor: Donor; accent: 'blood' | 'heart' }) => {
  const badgeClass = bloodGroupColors[donor.bloodGroup] || 'bg-gray-100 text-gray-700 border-gray-200';
  const accentBg = accent === 'blood' ? 'from-red-500 to-rose-600' : 'from-pink-500 to-red-600';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
      <div className={`h-1.5 bg-gradient-to-r ${accentBg}`} />
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accentBg} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md`}>
            {getInitials(donor.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 capitalize truncate">{donor.name}</h4>
            <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeClass}`}>
              {donor.bloodGroup}
            </span>
          </div>
        </div>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2.5 text-gray-600">
            <Calendar size={14} className="text-gray-400 shrink-0" />
            <span>{formatDate(donor.dob)}</span>
          </div>
          <div className="flex items-center gap-2.5 text-gray-600">
            <User size={14} className="text-gray-400 shrink-0" />
            <span>{donor.gender}</span>
          </div>
          <div className="flex items-center gap-2.5 text-gray-600">
            <Mail size={14} className="text-gray-400 shrink-0" />
            <span className="truncate">{donor.contact}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const DonationContent = () => {
  const [activeTab, setActiveTab] = useState<TabId>('blood');
  const [search, setSearch] = useState('');
  const [bloodDonors, setBloodDonors] = useState<Donor[]>([]);
  const [heartDonors, setHeartDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [blood, heart] = await Promise.all([
          fetchDonors('blood'),
          fetchDonors('heart'),
        ]);
        if (!active) return;
        setBloodDonors(blood);
        setHeartDonors(heart);
      } catch {
        if (!active) return;
        setError('Unable to load donors. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const currentDonors = activeTab === 'blood' ? bloodDonors : heartDonors;

  const filteredDonors = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return currentDonors;
    return currentDonors.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.bloodGroup.toLowerCase().includes(query) ||
        d.contact.toLowerCase().includes(query) ||
        d.gender.toLowerCase().includes(query)
    );
  }, [currentDonors, search]);

  return (
    <div className="container mx-auto px-4 max-w-7xl -mt-12 sm:-mt-16 relative z-10 pb-16">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Blood Donors', value: bloodDonors.length, icon: Droplets, iconBg: 'bg-red-50', iconColor: 'text-red-600' },
          { label: 'Heart Donors', value: heartDonors.length, icon: Heart, iconBg: 'bg-pink-50', iconColor: 'text-pink-600' },
          { label: 'Total Registered', value: bloodDonors.length + heartDonors.length, icon: Users, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
          { label: 'Lives Impacted', value: '500+', icon: Shield, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.iconBg}`}>
              <stat.icon size={20} className={stat.iconColor} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-xl shadow-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-2">Save Lives Today</p>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Become a Donor at Apollo Hospital</h2>
          <p className="text-blue-100 text-sm max-w-xl">
            Register as a blood or organ donor and help patients in critical need. One donation can save multiple lives.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition text-sm"
          >
            Register Now
            <ArrowRight size={16} />
          </Link>
          <a
            href="tel:+1234567890"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 font-semibold rounded-xl transition text-sm"
          >
            <Phone size={16} />
            Call Us
          </a>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs + Search */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-gray-50 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => { setActiveTab('blood'); setSearch(''); }}
              className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'blood'
                  ? 'bg-red-600 text-white shadow-md shadow-red-200'
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Droplets size={16} />
              Blood Donators
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('heart'); setSearch(''); }}
              className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'heart'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-200'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              <Heart size={16} />
              Heart Donators
            </button>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, blood group, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Section Title */}
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {activeTab === 'blood' ? (
              <>
                <Droplets size={20} className="text-red-600" />
                Blood Donators
              </>
            ) : (
              <>
                <Heart size={20} className="text-pink-600" />
                Heart Donators
              </>
            )}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {loading
              ? 'Loading donors…'
              : `${filteredDonors.length} donor${filteredDonors.length !== 1 ? 's' : ''} registered`}
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block px-6 pb-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs font-bold uppercase tracking-wider text-white ${
                activeTab === 'blood' ? 'bg-red-600' : 'bg-pink-600'
              }`}>
                <th className="px-5 py-3.5 rounded-tl-xl">Name</th>
                <th className="px-5 py-3.5">DOB</th>
                <th className="px-5 py-3.5">Gender</th>
                <th className="px-5 py-3.5">Blood Group</th>
                <th className="px-5 py-3.5 rounded-tr-xl">Contact</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Loading donors…
                    </span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="inline-flex flex-col items-center gap-3 text-gray-500">
                      <span className="inline-flex items-center gap-2 text-red-600 text-sm font-medium">
                        <AlertCircle size={16} />
                        {error}
                      </span>
                      <button
                        type="button"
                        onClick={() => setReloadKey((k) => k + 1)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition"
                      >
                        <RefreshCw size={14} />
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredDonors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No donors found matching your search.
                  </td>
                </tr>
              ) : (
                filteredDonors.map((donor, index) => {
                  const badgeClass = bloodGroupColors[donor.bloodGroup] || 'bg-gray-100 text-gray-700 border-gray-200';
                  return (
                    <tr
                      key={donor.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/80 transition ${
                        index === filteredDonors.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                            activeTab === 'blood' ? 'bg-red-500' : 'bg-pink-500'
                          }`}>
                            {getInitials(donor.name)}
                          </div>
                          <span className="font-semibold text-gray-900 capitalize">{donor.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{formatDate(donor.dob)}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{donor.gender}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeClass}`}>
                          {donor.bloodGroup}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <a href={`mailto:${donor.contact}`} className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                          {donor.contact}
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden px-4 pb-6 grid gap-4">
          {loading ? (
            <p className="flex items-center justify-center gap-2 text-gray-400 text-sm py-8">
              <Loader2 size={16} className="animate-spin" />
              Loading donors…
            </p>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <span className="inline-flex items-center gap-2 text-red-600 text-sm font-medium">
                <AlertCircle size={16} />
                {error}
              </span>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          ) : filteredDonors.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No donors found matching your search.</p>
          ) : (
            filteredDonors.map((donor) => (
              <DonorCard key={donor.id} donor={donor} accent={activeTab} />
            ))
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
            <Droplets size={24} className="text-red-600" />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Blood Donation</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            A single blood donation can save up to three lives. Donors must be 18–65 years old, weigh at least 50 kg, and be in good health. Donate every 3 months to help patients in need.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center mb-4">
            <Heart size={24} className="text-pink-600" />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Organ Donation</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            Registering as an organ donor gives hope to patients awaiting transplants. Heart, kidney, liver, and other organs can save lives even after we are gone. Talk to our team to pledge today.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonationContent;
