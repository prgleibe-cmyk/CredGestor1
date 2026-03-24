import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AnimatePresence, motion } from 'motion/react';
import { View, Settings } from '../../types';

interface MainLayoutProps {
  children: React.ReactNode;
  activeView: View;
  setActiveView: (view: View) => void;
  title: string;
  onNewLoan: () => void;
  user: any;
  onLogout: () => void;
  settings: Settings;
  isAdmin?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  activeView, 
  setActiveView, 
  title, 
  onNewLoan,
  user,
  onLogout,
  settings,
  isAdmin = false
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Open sidebar by default on desktop
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-bg-main flex text-text-main font-sans relative overflow-hidden transition-colors duration-300">
      {/* Decorative background elements - matching LoginScreen */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }}></div>
        
        {/* Floating Glass Elements */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[15%] w-64 h-64 bg-bg-card/40 backdrop-blur-3xl rounded-[3rem] border border-border-main/20 shadow-2xl hidden lg:block"
        />
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[10%] left-[5%] w-48 h-48 bg-bg-card/40 backdrop-blur-2xl rounded-[2.5rem] border border-border-main/20 shadow-2xl hidden lg:block"
        />

        <div className="absolute inset-0 bg-[radial-gradient(var(--color-text-main)_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.05]"></div>
        
        {/* Crumpled Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-multiply" 
             style={{ 
               backgroundImage: `url("https://www.transparenttextures.com/patterns/crumpled-paper.png")`,
               backgroundSize: '500px'
             }}>
        </div>
      </div>

      <div className="no-print relative z-20">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          user={user}
          onLogout={onLogout}
          settings={settings}
          isAdmin={isAdmin}
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
        
        <div className="p-4 md:p-6 print:p-0 flex-1">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
