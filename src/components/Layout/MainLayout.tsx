import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AnimatePresence, motion } from 'motion/react';
import { View, Settings } from '../../types';
import { User } from 'firebase/auth';

interface MainLayoutProps {
  children: React.ReactNode;
  activeView: View;
  setActiveView: (view: View) => void;
  title: string;
  onNewLoan: () => void;
  user: User;
  onLogout: () => void;
  settings: Settings;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  activeView, 
  setActiveView, 
  title, 
  onNewLoan,
  user,
  onLogout,
  settings
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-main flex text-text-main font-sans relative overflow-hidden transition-colors duration-300">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-200/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-200/5 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none"></div>

      <div className="no-print relative z-20">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          user={user}
          onLogout={onLogout}
          settings={settings}
        />
      </div>

      <main className="flex-1 overflow-x-hidden relative z-10 flex flex-col">
        <div className="no-print">
          <Header 
            title={title} 
            onNewLoan={onNewLoan} 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          />
        </div>
        
        <div className="p-6 md:p-10 print:p-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
