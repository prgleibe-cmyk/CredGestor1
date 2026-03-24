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
    <div className="glass-card p-4 rounded-xl border border-border-main shadow-sm hover:bg-text-main/5 transition-all duration-500 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-text-main/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 bg-emerald-500/5 rounded-full -ml-6 -mb-6 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-500 relative border border-border-main shadow-sm`}>
          <div className={`absolute inset-0 ${bg} opacity-20 rounded-lg`}></div>
          <Icon className={`${color} drop-shadow-[0_0_4px_rgba(0,0,0,0.1)]`} size={16} strokeWidth={2.5} />
        </div>
        <div className="flex gap-1">
          <div className="h-0.5 w-0.5 rounded-full bg-text-main/10 group-hover:bg-emerald-600 transition-all duration-500"></div>
          <div className="h-0.5 w-0.5 rounded-full bg-text-main/5 group-hover:bg-emerald-600/50 transition-all duration-700"></div>
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-text-muted text-[8px] font-black uppercase tracking-[0.3em] mb-0.5 group-hover:text-text-main transition-colors">{label}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-xl font-display font-black text-text-main tracking-tighter group-hover:scale-[1.02] transition-transform duration-500 origin-left">{value}</h3>
        </div>
      </div>
    </div>
  );
};
