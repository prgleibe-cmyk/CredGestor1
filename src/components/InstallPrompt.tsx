import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
      >
        <div className="bg-bg-card border border-border-main p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-600">
              <Download size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-black text-text-main uppercase tracking-tight">Baixar Aplicativo</p>
              <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">Instale para acesso rápido e offline</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="px-4 py-2 btn-gradient text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
            >
              Instalar
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 text-text-muted hover:text-text-main transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
