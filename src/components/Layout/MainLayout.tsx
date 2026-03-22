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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-neutral-50 flex text-neutral-900 font-sans">
      <div className="no-print">
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

      <main className="flex-1 overflow-auto">
        <div className="no-print">
          <Header title={title} onNewLoan={onNewLoan} />
        </div>
        
        <div className="p-8 print:p-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
