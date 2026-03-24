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
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-text-main/40 backdrop-blur-xl overflow-hidden"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%", opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: "100%", opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-xl rounded-t-[4rem] md:rounded-[4rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] flex flex-col h-[85vh] md:h-auto md:max-h-[90vh] border-t md:border border-border-main relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-border-main to-transparent"></div>
        
        <div className="p-8 md:p-10 border-b border-border-main flex justify-between items-center gap-6 shrink-0 rounded-t-[4rem] md:rounded-t-[4rem] bg-text-main/5 relative z-10">
          <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-text-main/10 rounded-full shadow-inner" />
          <h3 className="text-3xl font-display font-black text-text-main truncate flex-1 tracking-tighter">
            {customer ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-4 btn-gradient-slate text-white rounded-2xl transition-all hover:scale-110 active:scale-90 shrink-0 border border-border-main shadow-inner"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>
 
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8 overflow-y-auto relative z-10 custom-scrollbar">
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-[0.3em] ml-2">Nome Completo *</label>
            <input 
              type="text" 
              required
              placeholder="Ex: João Silva"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full p-5 bg-text-main/5 border border-border-main rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-base font-black text-text-main transition-all placeholder:text-text-muted/40 shadow-inner"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-[0.3em] ml-2">CPF *</label>
            <input 
              type="text" 
              required
              placeholder="000.000.000-00"
              value={formData.document}
              onChange={e => setFormData({...formData, document: e.target.value})}
              className="w-full p-5 bg-text-main/5 border border-border-main rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-base font-mono font-black text-text-main transition-all placeholder:text-text-muted/40 shadow-inner"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-[0.3em] ml-2">Telefone (Opcional)</label>
            <input 
              type="tel" 
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full p-5 bg-text-main/5 border border-border-main rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-base font-black text-text-main transition-all placeholder:text-text-muted/40 shadow-inner"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-[0.3em] ml-2">Endereço (Opcional)</label>
            <textarea 
              placeholder="Rua, Número, Bairro, Cidade"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full p-5 bg-text-main/5 border border-border-main rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 h-32 resize-none text-base font-black text-text-main transition-all placeholder:text-text-muted/40 shadow-inner"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="relative overflow-hidden w-full py-6 btn-gradient text-white text-[12px] font-black uppercase tracking-[0.3em] rounded-[1.5rem] active:scale-[0.98] group/btn"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
              <span className="relative z-10">{customer ? 'Salvar Alterações' : 'Cadastrar Cliente'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
