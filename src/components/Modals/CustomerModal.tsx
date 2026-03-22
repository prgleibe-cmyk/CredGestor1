import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { Customer } from '../../types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id' | 'createdAt' | 'createdBy'>) => void;
  customer?: Customer | null;
}

export function CustomerModal({ isOpen, onClose, onSave, customer }: CustomerModalProps) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    document: customer?.document || ''
  });

  React.useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        document: customer.document
      });
    } else {
      setFormData({ name: '', phone: '', address: '', document: '' });
    }
  }, [customer]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    if (!customer) setFormData({ name: '', phone: '', address: '', document: '' });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-md overflow-hidden"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-t-[3rem] md:rounded-[3rem] shadow-2xl flex flex-col h-[80vh] md:h-auto md:max-h-[90vh] border-t md:border border-slate-200/60 relative"
      >
        <div className="p-6 md:p-8 border-b border-border-main flex justify-between items-center gap-4 shrink-0 rounded-t-[3rem] md:rounded-t-[3rem] bg-bg-main/50">
          <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-border-main rounded-full" />
          <h3 className="text-2xl font-display font-black text-text-main truncate flex-1 tracking-tight">
            {customer ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-3 bg-bg-main hover:bg-border-main rounded-2xl transition-all text-text-muted hover:scale-110 active:scale-90 shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Nome Completo *</label>
            <input 
              type="text" 
              required
              placeholder="Ex: João Silva"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full p-4 bg-bg-main border border-border-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-sm font-bold text-text-main transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">CPF *</label>
            <input 
              type="text" 
              required
              placeholder="000.000.000-00"
              value={formData.document}
              onChange={e => setFormData({...formData, document: e.target.value})}
              className="w-full p-4 bg-bg-main border border-border-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-sm font-mono font-bold text-text-main transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Telefone (Opcional)</label>
            <input 
              type="tel" 
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full p-4 bg-bg-main border border-border-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-sm font-bold text-text-main transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Endereço (Opcional)</label>
            <textarea 
              placeholder="Rua, Número, Bairro, Cidade"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full p-4 bg-bg-main border border-border-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 h-24 resize-none text-sm font-bold text-text-main transition-all"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full py-5 bg-brand-600 text-white font-black rounded-[2rem] hover:bg-brand-700 transition-all shadow-xl shadow-brand-100 active:scale-[0.98] text-lg tracking-tight"
            >
              {customer ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
