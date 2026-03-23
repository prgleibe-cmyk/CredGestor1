import React from 'react';
import { Plus, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  onNewLoan: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onNewLoan, onToggleSidebar }) => {
  return (
    <header className="glass border-b border-slate-200 p-4 md:p-5 flex justify-between items-center sticky top-0 z-30 transition-all duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2.5 btn-gradient-slate text-white rounded-xl transition-all active:scale-90"
        >
          <Menu size={18} />
        </button>
        <div className="flex flex-col">
          <h2 className="text-xl md:text-2xl font-display font-black text-slate-900 capitalize truncate max-w-[200px] md:max-w-none tracking-tighter">
            {title}
          </h2>
          <div className="h-0.5 w-8 bg-emerald-500 rounded-full mt-0.5 hidden md:block"></div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onNewLoan}
          className="relative group overflow-hidden btn-gradient text-white px-5 py-3 md:px-6 md:py-3 rounded-xl flex items-center gap-2.5 transition-all duration-500 font-black text-xs md:text-[11px] active:scale-95 uppercase tracking-[0.2em]"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
          <Plus size={18} className="group-hover:rotate-180 transition-transform duration-700 relative z-10" />
          <span className="hidden sm:inline relative z-10">Novo Empréstimo</span>
          <span className="sm:hidden relative z-10">Novo</span>
        </button>
      </div>
    </header>
  );
};
