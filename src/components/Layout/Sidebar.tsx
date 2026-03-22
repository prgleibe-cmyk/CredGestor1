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
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  user: any;
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
          bg-bg-card/80 backdrop-blur-xl border-r border-border-main transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col
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
                    <div className="absolute -inset-1 bg-gradient-to-tr from-brand-600 to-emerald-400 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <img 
                      src={settings.logoUrl || "/logo.png"} 
                      alt="Logo" 
                      className="relative h-10 w-10 object-contain rounded-xl bg-white p-1 dark:brightness-110" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <span className="text-xl font-display font-extrabold text-text-main tracking-tight whitespace-nowrap">
                    {settings.companyName}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="mini-logo"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mx-auto"
                >
                  <img 
                    src={settings.logoUrl || "/logo.png"} 
                    alt="Logo" 
                    className="w-10 h-10 object-contain drop-shadow-sm dark:brightness-110" 
                    referrerPolicy="no-referrer" 
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-bg-main rounded-xl transition-all text-text-muted hover:text-text-main"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-bg-main hover:bg-border-main rounded-xl transition-all text-text-muted border border-border-main"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-2">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as View);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center p-3 rounded-2xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-200 font-semibold' 
                    : 'text-text-muted hover:bg-bg-main hover:text-text-main'
                }`}
              >
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="ml-4 text-[15px] font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className={`p-4 rounded-3xl transition-all duration-500 ${isSidebarOpen ? 'bg-bg-main border border-border-main' : 'bg-transparent'}`}>
            {isSidebarOpen && (
              <div className="flex items-center gap-3 mb-4 px-1">
                <div className="relative">
                  <img 
                    src={user.user_metadata?.avatar_url || user.photoURL || `https://ui-avatars.com/api/?name=${user.user_metadata?.full_name || user.displayName}`} 
                    alt={user.user_metadata?.full_name || user.displayName || ''} 
                    className="w-10 h-10 rounded-2xl border-2 border-bg-card shadow-sm object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-500 border-2 border-bg-card rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-main truncate font-display">{user.user_metadata?.full_name || user.displayName}</p>
                  <p className="text-[11px] text-text-muted truncate font-medium">{user.email}</p>
                </div>
              </div>
            )}
            <button 
              onClick={onLogout}
              className={`w-full flex items-center justify-center p-3 text-text-muted hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all text-sm font-semibold group ${!isSidebarOpen && 'hover:bg-red-50'}`}
            >
              <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              {isSidebarOpen && <span className="ml-3">Encerrar Sessão</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
