import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

const StatCard = ({ title, value, change, changeType, icon: Icon, iconBg, iconColor }: StatCardProps) => {
  const changeColor =
    changeType === 'up' ? 'text-emerald-600 bg-emerald-50' :
    changeType === 'down' ? 'text-red-600 bg-red-50' :
    'text-gray-600 bg-gray-100';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={22} className={iconColor} />
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${changeColor}`}>
          {change}
        </span>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
  );
};

export default StatCard;
