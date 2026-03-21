import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  HandCoins, 
  History, 
  Settings, 
  Menu, 
  X,
  LogOut
} from 'lucide-react';
import { View } from '../../types';
import { motion } from 'motion/react';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView, 
  isSidebarOpen, 
  setIsSidebarOpen 
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'loans', label: 'Empréstimos', icon: HandCoins },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside 
      className={`${
        isSidebarOpen ? 'w-64' : 'w-20'
      } bg-white border-r border-neutral-200 transition-all duration-300 flex flex-col sticky top-0 h-screen z-20`}
    >
      <div className="p-6 flex items-center justify-between">
        {isSidebarOpen && (
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-emerald-600 tracking-tight"
          >
            CrediFlow
          </motion.h1>
        )}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center p-3 rounded-xl transition-all ${
              activeView === item.id 
                ? 'bg-emerald-50 text-emerald-700 font-medium' 
                : 'text-neutral-500 hover:bg-neutral-100'
            }`}
          >
            <item.icon size={20} className={activeView === item.id ? 'text-emerald-600' : ''} />
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-3"
              >
                {item.label}
              </motion.span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-100">
        <button className="w-full flex items-center p-3 text-neutral-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
          <LogOut size={20} />
          {isSidebarOpen && <span className="ml-3">Sair</span>}
        </button>
      </div>
    </aside>
  );
};
