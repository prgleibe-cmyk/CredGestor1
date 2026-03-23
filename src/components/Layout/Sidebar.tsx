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
  FileText,
  Shield
} from 'lucide-react';
import { View, Settings } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  user: any;
  onLogout: () => void;
  settings: Settings;
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView, 
  isSidebarOpen, 
  setIsSidebarOpen,
  user,
  onLogout,
  settings,
  isAdmin = false
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'loans', label: 'Empréstimos', icon: HandCoins },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: Shield });
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside 
        className={`
          fixed md:sticky top-0 h-screen z-50 md:z-20
          glass transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col border-r border-slate-200
          ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 w-72 md:w-24'}
        `}
      >
        <div className="p-6 flex flex-col items-center gap-6">
          <div className="w-full flex items-center justify-between">
            <AnimatePresence mode="wait">
              {isSidebarOpen ? (
                <motion.div 
                  key="full-logo"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-3 overflow-hidden"
                >
                  <div className="relative group">
                    <div className="absolute -inset-1.5 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition duration-500"></div>
                    <img 
                      src={settings.logoUrl || "/logo.png"} 
                      alt="Logo" 
                      className="relative h-12 w-12 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-display font-black text-slate-900 tracking-tight leading-none whitespace-nowrap">
                      {settings.companyName}
                    </span>
                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.3em] mt-1">Enterprise</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="mini-logo"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mx-auto relative group"
                >
                  <div className="absolute -inset-1.5 bg-emerald-500/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <img 
                    src={settings.logoUrl || "/logo.png"} 
                    alt="Logo" 
                    className="relative w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(0,0,0,0.1)]" 
                    referrerPolicy="no-referrer" 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as View);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-500 group relative overflow-hidden ${
                  isActive 
                    ? 'btn-gradient text-white' 
                    : 'text-slate-500 hover:bg-slate-900/5 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-bg"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 -z-10"
                  />
                )}
                
                <div className={`transition-all duration-500 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'group-hover:scale-110 group-hover:text-white'}`}>
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`ml-3 text-[12px] font-black uppercase tracking-widest whitespace-nowrap ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'}`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute right-0 w-1.5 h-6 bg-white rounded-l-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className={`p-3 rounded-2xl transition-all duration-500 ${isSidebarOpen ? 'bg-slate-900/5 border border-slate-200 shadow-inner' : 'bg-transparent'}`}>
            {isSidebarOpen && (
              <div className="flex items-center gap-3 mb-4 px-1">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-emerald-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <img 
                    src={user.user_metadata?.avatar_url || user.photoURL || `https://ui-avatars.com/api/?name=${user.user_metadata?.full_name || user.displayName}`} 
                    alt={user.user_metadata?.full_name || user.displayName || ''} 
                    className="relative w-10 h-10 rounded-xl border-2 border-white shadow-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-lg"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate font-display tracking-tight">{user.user_metadata?.full_name || user.displayName}</p>
                  <p className="text-[9px] text-slate-500 truncate font-black uppercase tracking-widest mt-0.5">{user.email?.split('@')[0]}</p>
                </div>
              </div>
            )}
            <button 
              onClick={onLogout}
              className={`w-full flex items-center justify-center p-3 btn-gradient-red text-white rounded-xl transition-all text-[9px] font-black uppercase tracking-[0.2em] group ${!isSidebarOpen && 'hover:bg-red-500/10'}`}
            >
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
              {isSidebarOpen && <span className="ml-2">Encerrar Sessão</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
