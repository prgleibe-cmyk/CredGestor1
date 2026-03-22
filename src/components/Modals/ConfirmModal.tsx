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
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-md overflow-hidden"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-t-[3rem] md:rounded-[3rem] shadow-2xl flex flex-col h-auto max-h-[90vh] border-t md:border border-slate-200/60 relative"
      >
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center gap-4 shrink-0 rounded-t-[3rem] md:rounded-t-[3rem] bg-slate-50/50">
          <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-slate-200 rounded-full" />
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className={`p-3 rounded-2xl shrink-0 ${variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-brand-100 text-brand-600'}`}>
              <AlertCircle size={24} />
            </div>
            <h3 className="text-2xl font-display font-black text-slate-900 truncate tracking-tight">{title}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all text-slate-500 hover:scale-110 active:scale-90 shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto">
          <p className="text-lg text-slate-600 leading-relaxed font-medium">
            {message}
          </p>
        </div>

        <div className="p-6 md:p-8 bg-slate-50/50 flex gap-4 shrink-0 rounded-b-[3rem] md:rounded-b-[3rem] border-t border-slate-100">
          <button 
            onClick={onClose}
            className="flex-1 py-5 bg-white border border-slate-200 text-slate-600 text-base font-black rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-5 text-white text-base font-black rounded-2xl transition-all shadow-xl active:scale-95 ${
              variant === 'danger' 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-100' 
                : 'bg-brand-600 hover:bg-brand-700 shadow-brand-100'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
