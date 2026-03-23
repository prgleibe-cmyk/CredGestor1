import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { motion } from 'motion/react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success';
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  variant = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-md rounded-[3.5rem] p-10 md:p-12 shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-slate-200 relative overflow-hidden text-center"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        
        <div className={`w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center mb-8 border shadow-inner relative group ${
          variant === 'danger' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
        }`}>
          <div className={`absolute inset-0 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 ${
            variant === 'danger' ? 'bg-red-500/20' : 'bg-emerald-500/20'
          }`}></div>
          <AlertCircle size={48} strokeWidth={2.5} className="relative z-10" />
        </div>

        <h3 className="text-3xl md:text-4xl font-display font-black text-slate-900 mb-4 tracking-tighter leading-tight">
          {title}
        </h3>
        
        <p className="text-slate-500 text-lg font-bold leading-relaxed mb-10 px-4">
          {message}
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`relative overflow-hidden w-full py-6 rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-3 group/btn active:scale-[0.98] ${
              variant === 'danger' 
                ? 'btn-gradient-red text-white' 
                : 'btn-gradient text-white'
            }`}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
            <span className="relative z-10">{confirmText}</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-5 btn-gradient-slate text-white font-black uppercase text-[11px] tracking-[0.3em] rounded-[1.5rem] transition-all border border-slate-200 shadow-inner active:scale-95"
          >
            {cancelText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
