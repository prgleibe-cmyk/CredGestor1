import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, bg }) => {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 neo-shadow hover:neo-shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={color} size={24} strokeWidth={2.5} />
        </div>
        <div className="h-2 w-2 rounded-full bg-slate-200 group-hover:bg-brand-400 transition-colors"></div>
      </div>
      <p className="text-slate-500 text-[13px] font-semibold uppercase tracking-wider mb-1">{label}</p>
      <h3 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">{value}</h3>
    </div>
  );
};
