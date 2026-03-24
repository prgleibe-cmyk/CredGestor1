import React from 'react';
import { Plus, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  onNewLoan: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ title, onNewLoan, onToggleSidebar }) => {
  return (
    <header className="glass border-b border-border-main p-2 md:p-3 flex justify-between items-center sticky top-0 z-30 transition-all duration-500">
      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleSidebar}
          className="p-1.5 btn-gradient-slate text-white rounded-lg transition-all active:scale-90"
        >
          <Menu size={14} />
        </button>
        <div className="flex flex-col">
          <h2 className="text-base md:text-lg font-display font-black text-text-main capitalize truncate max-w-[150px] md:max-w-none tracking-tighter">
            {title}
          </h2>
          <div className="h-0.5 w-4 bg-brand-500 rounded-full mt-0.5 hidden md:block"></div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onNewLoan}
          className="relative group overflow-hidden btn-gradient text-white px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center gap-1.5 transition-all duration-500 font-black text-[9px] md:text-[10px] active:scale-95 uppercase tracking-[0.15em]"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
          <Plus size={14} className="group-hover:rotate-180 transition-transform duration-700 relative z-10" />
          <span className="hidden sm:inline relative z-10">Novo Empréstimo</span>
          <span className="sm:hidden relative z-10">Novo</span>
        </button>
      </div>
    </header>
  );
});
