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

export const Sidebar: React.FC<SidebarProps> = React.memo(({ 
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
          glass transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col border-r border-border-main
          ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 w-64 md:w-20'}
        `}
      >
        <div className="p-4 flex flex-col items-center gap-4">
          <div className="w-full flex items-center justify-between">
            <AnimatePresence mode="wait">
              {isSidebarOpen ? (
                <motion.div 
                  key="full-logo"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2.5 overflow-hidden"
                >
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-lg blur-md opacity-0 group-hover:opacity-40 transition duration-500"></div>
                    <img 
                      src={settings.logoUrl || "/logo.png"} 
                      alt="Logo" 
                      className="relative h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-display font-black text-text-main tracking-tight leading-none whitespace-nowrap">
                      {settings.companyName}
                    </span>
                    <span className="text-[7px] font-black text-brand-600 uppercase tracking-[0.3em] mt-0.5">Enterprise</span>
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
                  <div className="absolute -inset-1 bg-brand-500/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <img 
                    src={settings.logoUrl || "/logo.png"} 
                    alt="Logo" 
                    className="relative w-8 h-8 object-contain drop-shadow-[0_0_6px_rgba(0,0,0,0.1)]" 
                    referrerPolicy="no-referrer" 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as View);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center p-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? 'btn-gradient text-white' 
                    : 'text-text-muted hover:bg-text-main/5 hover:text-text-main'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-bg"
                    className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 -z-10"
                  />
                )}
                
                <div className={`transition-all duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                  <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`ml-2.5 text-[11px] font-black uppercase tracking-widest whitespace-nowrap ${isActive ? 'text-white' : 'text-text-muted group-hover:text-text-main'}`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute right-0 w-1 h-5 bg-white rounded-l-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 mt-auto">
          <div className={`p-2.5 rounded-xl transition-all duration-500 ${isSidebarOpen ? 'bg-text-main/5 border border-border-main' : 'bg-transparent'}`}>
            {isSidebarOpen && (
              <div className="flex items-center gap-2.5 mb-3 px-1">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-brand-500/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <img 
                    src={user.user_metadata?.avatar_url || user.photoURL || `https://ui-avatars.com/api/?name=${user.user_metadata?.full_name || user.displayName}`} 
                    alt={user.user_metadata?.full_name || user.displayName || ''} 
                    className="relative w-8 h-8 rounded-lg border border-bg-card shadow-md object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-brand-500 border-2 border-bg-card rounded-full shadow-sm"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-text-main truncate font-display tracking-tight">{user.user_metadata?.full_name || user.displayName}</p>
                  <p className="text-[8px] text-text-muted truncate font-black uppercase tracking-widest mt-0.5">{user.email?.split('@')[0]}</p>
                </div>
              </div>
            )}
            <button 
              onClick={onLogout}
              className={`w-full flex items-center justify-center p-2.5 btn-gradient-red text-white rounded-lg transition-all text-[8px] font-black uppercase tracking-[0.2em] group ${!isSidebarOpen && 'hover:bg-red-500/10'}`}
            >
              <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
              {isSidebarOpen && <span className="ml-2">Sair</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
});
