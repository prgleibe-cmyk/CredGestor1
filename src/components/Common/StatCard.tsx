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
    <div className="glass-card p-5 rounded-2xl border border-slate-200 shadow-xl hover:bg-slate-900/5 transition-all duration-700 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-900/5 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-500/5 rounded-full -ml-8 -mb-8 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 relative border border-slate-200 shadow-lg`}>
          <div className={`absolute inset-0 ${bg} opacity-20 rounded-xl`}></div>
          <Icon className={`${color} drop-shadow-[0_0_8px_rgba(0,0,0,0.1)]`} size={18} strokeWidth={2.5} />
        </div>
        <div className="flex gap-1">
          <div className="h-1 w-1 rounded-full bg-slate-900/10 group-hover:bg-emerald-600 transition-all duration-500"></div>
          <div className="h-1 w-1 rounded-full bg-slate-900/5 group-hover:bg-emerald-600/50 transition-all duration-700"></div>
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mb-1 group-hover:text-slate-900 transition-colors">{label}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-2xl font-display font-black text-slate-900 tracking-tighter group-hover:scale-[1.02] transition-transform duration-500 origin-left">{value}</h3>
        </div>
      </div>
    </div>
  );
};
