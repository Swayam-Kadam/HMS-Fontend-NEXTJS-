'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Stethoscope,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  RotateCw,
} from 'lucide-react';
import StatCard from './StatCard';
import {
  fetchDashboardStats,
  parseDashboardError,
  type DashboardStats,
} from '@/services/dashboardService';

const STATUS_CONFIG: {
  key: keyof DashboardStats['appointmentStatus'];
  name: string;
  color: string;
}[] = [
  { key: 'pending', name: 'Pending', color: '#f59e0b' },
  { key: 'accepted', name: 'Accepted', color: '#2563eb' },
  { key: 'completed', name: 'Completed', color: '#10b981' },
  { key: 'rejected', name: 'Rejected', color: '#f97316' },
  { key: 'cancelled', name: 'Cancelled', color: '#ef4444' },
];

const LOAD_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-cyan-500'];

const formatNumber = (value: number) => value.toLocaleString('en-IN');

const formatRevenue = (value: number) =>
  `₹${value.toLocaleString('en-IN')}`;

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {entry.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

const buildStatusChartData = (status: DashboardStats['appointmentStatus']) => {
  const total = STATUS_CONFIG.reduce((sum, item) => sum + status[item.key], 0);
  if (total === 0) return [];

  return STATUS_CONFIG.map((item) => ({
    name: item.name,
    value: Math.round((status[item.key] / total) * 100),
    count: status[item.key],
    color: item.color,
  })).filter((item) => item.count > 0);
};

const DashboardContent = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      setError(parseDashboardError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const appointmentStatusData = useMemo(
    () => (stats ? buildStatusChartData(stats.appointmentStatus) : []),
    [stats]
  );

  const departmentBarData = useMemo(
    () =>
      stats?.patientsByDepartment.map((item) => ({
        department: item.department,
        patients: item.count,
      })) ?? [],
    [stats]
  );

  const appointmentsOverviewData = useMemo(
    () =>
      stats?.appointmentsOverview.map((item) => ({
        month: item.month,
        appointments: item.appointments,
        patients: item.newPatients,
      })) ?? [],
    [stats]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-gray-400">
        <Loader2 size={28} className="animate-spin text-blue-600" />
        <p className="text-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <span className="inline-flex items-center gap-2 text-red-600 text-sm font-medium">
          <AlertCircle size={18} />
          {error ?? 'Unable to load dashboard.'}
        </span>
        <button
          type="button"
          onClick={loadStats}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition"
        >
          <RotateCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  const { cards, departmentLoad, todaySummary, revenueTrend } = stats;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={formatNumber(cards.totalPatients)}
          change="Overall"
          changeType="neutral"
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Active Doctors"
          value={formatNumber(cards.activeDoctors)}
          change="Overall"
          changeType="neutral"
          icon={Stethoscope}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Today's Appointments"
          value={formatNumber(cards.todayAppointments)}
          change={`${cards.todayPending} pending`}
          changeType="neutral"
          icon={CalendarCheck}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatRevenue(cards.monthlyRevenue)}
          change="This month"
          changeType="neutral"
          icon={DollarSign}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-600" />
                Appointments Overview
              </h3>
              <p className="text-sm text-gray-500 mt-1">Monthly appointments vs new patients</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={appointmentsOverviewData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 16 }} />
              <Area type="monotone" dataKey="appointments" name="Appointments" stroke="#2563eb" strokeWidth={2} fill="url(#colorAppt)" />
              <Area type="monotone" dataKey="patients" name="New Patients" stroke="#10b981" strokeWidth={2} fill="url(#colorPatients)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h3 className="font-bold text-gray-900 mb-1">Appointment Status</h3>
          <p className="text-sm text-gray-500 mb-4">Overall distribution</p>
          {appointmentStatusData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-sm text-gray-400">
              No appointment data yet
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={appointmentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {appointmentStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, _name, item) => {
                      const count = (item?.payload as { count?: number })?.count ?? 0;
                      return [`${Number(value ?? 0)}% (${count})`, 'Share'];
                    }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {appointmentStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    {item.name} ({item.value}%)
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h3 className="font-bold text-gray-900 mb-1">Patients by Department</h3>
          <p className="text-sm text-gray-500 mb-6">Overall patient distribution</p>
          {departmentBarData.length === 0 ? (
            <div className="flex items-center justify-center h-[280px] text-sm text-gray-400">
              No department data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentBarData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="patients" name="Patients" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h3 className="font-bold text-gray-900 mb-1">Revenue Trend</h3>
          <p className="text-sm text-gray-500 mb-6">Monthly revenue (INR)</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueTrend} margin={{ top: 0, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip
                formatter={(value) => [formatRevenue(Number(value ?? 0)), 'Revenue']}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
              />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: '#7c3aed', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Today's Summary + Department Load */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-3">Today&apos;s Summary</p>
          <div className="space-y-4">
            {[
              { icon: CheckCircle2, label: 'Completed', value: todaySummary.completed },
              { icon: Clock, label: 'Accepted', value: todaySummary.inProgress },
              { icon: XCircle, label: 'Cancelled', value: todaySummary.cancelled },
              { icon: XCircle, label: 'Rejected', value: todaySummary.rejected },
              { icon: XCircle, label: 'Pending', value: todaySummary.pending },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <item.icon size={16} className="text-blue-200" />
                  <span className="text-sm text-blue-100">{item.label}</span>
                </div>
                <span className="font-bold text-lg">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h4 className="font-bold text-gray-900 mb-4 text-sm">Department Load</h4>
          {departmentLoad.length === 0 ? (
            <p className="text-sm text-gray-400">No department load data yet</p>
          ) : (
            <div className="space-y-3">
              {departmentLoad.map((item, index) => (
                <div key={item.department}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-600 font-medium">{item.department}</span>
                    <span className="text-gray-900 font-bold">{item.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${LOAD_COLORS[index % LOAD_COLORS.length]}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
