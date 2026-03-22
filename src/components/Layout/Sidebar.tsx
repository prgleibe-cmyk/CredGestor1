import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  HandCoins, 
  History, 
  Settings as SettingsIcon, 
  Menu, 
  X,
  LogOut,
  FileText
} from 'lucide-react';
import { View, Settings } from '../../types';
import { motion } from 'motion/react';
import { User } from 'firebase/auth';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  user: User;
  onLogout: () => void;
  settings: Settings;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView, 
  isSidebarOpen, 
  setIsSidebarOpen,
  user,
  onLogout,
  settings
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'loans', label: 'Empréstimos', icon: HandCoins },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon },
  ];

  return (
    <aside 
      className={`${
        isSidebarOpen ? 'w-64' : 'w-20'
      } bg-white border-r border-neutral-200 transition-all duration-300 flex flex-col sticky top-0 h-screen z-20`}
    >
      <div className="p-4 flex flex-col items-center gap-6">
        <div className={`w-full flex ${isSidebarOpen ? 'flex-col items-center text-center gap-4' : 'flex-col items-center gap-4'} `}>
          {isSidebarOpen ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <img 
                src={settings.logoUrl || "/logo.png"} 
                alt="CredGestor Logo" 
                className="h-32 w-auto object-contain mb-2 drop-shadow-lg" 
                referrerPolicy="no-referrer" 
              />
              <span className="text-4xl font-black text-emerald-600 tracking-tighter uppercase">
                {settings.companyName}
              </span>
            </motion.div>
          ) : (
            <img 
              src={settings.logoUrl || "/logo.png"} 
              alt="Logo" 
              className="w-12 h-12 object-contain" 
              referrerPolicy="no-referrer" 
            />
          )}
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as View)}
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

      <div className="p-4 border-t border-neutral-100 space-y-4">
        {isSidebarOpen && (
          <div className="flex items-center gap-3 px-2">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
              alt={user.displayName || ''} 
              className="w-10 h-10 rounded-full border-2 border-emerald-100"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-neutral-800 truncate">{user.displayName}</p>
              <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button 
          onClick={onLogout}
          className="w-full flex items-center p-3 text-neutral-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
        >
          <LogOut size={20} />
          {isSidebarOpen && <span className="ml-3">Sair</span>}
        </button>
      </div>
    </aside>
  );
};
