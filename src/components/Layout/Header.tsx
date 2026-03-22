import React from 'react';
import { Plus, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  onNewLoan: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onNewLoan, onToggleSidebar }) => {
  return (
    <header className="glass border-b border-border-main p-4 md:p-6 flex justify-between items-center sticky top-0 z-30 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2.5 bg-bg-main hover:bg-border-main rounded-xl transition-all text-text-muted border border-border-main"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-xl md:text-2xl font-display font-extrabold text-text-main capitalize truncate max-w-[180px] md:max-w-none tracking-tight">
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onNewLoan}
          className="bg-brand-600 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-2xl flex items-center gap-2.5 hover:bg-brand-700 transition-all duration-300 shadow-lg shadow-brand-200 font-bold text-sm md:text-[15px] group active:scale-95"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden sm:inline">Novo Empréstimo</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>
    </header>
  );
};
