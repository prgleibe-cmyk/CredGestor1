import React from 'react';
import { Plus } from 'lucide-react';

interface HeaderProps {
  title: string;
  onNewLoan: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onNewLoan }) => {
  return (
    <header className="bg-white border-b border-neutral-200 p-6 flex justify-between items-center sticky top-0 z-10">
      <h2 className="text-2xl font-semibold text-neutral-800 capitalize">
        {title}
      </h2>
      <div className="flex items-center gap-4">
        <button 
          onClick={onNewLoan}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Novo Empréstimo</span>
        </button>
      </div>
    </header>
  );
};
