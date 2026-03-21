import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AnimatePresence, motion } from 'motion/react';
import { View } from '../../types';

interface MainLayoutProps {
  children: React.ReactNode;
  activeView: View;
  setActiveView: (view: View) => void;
  title: string;
  onNewLoan: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  activeView, 
  setActiveView, 
  title, 
  onNewLoan 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-neutral-50 flex text-neutral-900 font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />

      <main className="flex-1 overflow-auto">
        <Header title={title} onNewLoan={onNewLoan} />
        
        <div className="p-8">
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
