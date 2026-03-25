import React, { useState, memo } from 'react';
import { X, UserPlus, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer } from '../../types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id' | 'createdAt' | 'createdBy'>) => void;
  customer?: Customer | null;
}

export const CustomerModal = memo(({ isOpen, onClose, onSave, customer }: CustomerModalProps) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    if (!customer) setFormData({ name: '', phone: '', address: '', document: '' });
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-bg-main/95 backdrop-blur-md overflow-hidden"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%", opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: "100%", opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-card w-full h-full md:max-w-[98vw] md:h-[98vh] md:rounded-[2.5rem] flex flex-col relative overflow-hidden border border-border-main shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-border-main to-transparent"></div>
        
        <div className="p-6 md:p-8 border-b border-border-main flex justify-between items-center gap-6 shrink-0 rounded-t-[2.5rem] md:rounded-t-[3rem] bg-text-main/5 relative z-10">
          <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-text-main/10 rounded-full shadow-inner" />
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-600 border border-brand-500/20 shadow-inner">
              {customer ? <UserCircle size={24} strokeWidth={2.5} /> : <UserPlus size={24} strokeWidth={2.5} />}
            </div>
            <h3 className="text-2xl font-display font-black text-text-main truncate tracking-tighter">
              {customer ? 'Editar Cliente' : 'Novo Cliente'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 btn-gradient-slate text-white rounded-2xl transition-all hover:scale-110 active:scale-90 shrink-0 border border-border-main shadow-inner"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>
 
        <form onSubmit={handleSubmit} className="flex-1 p-6 md:p-12 space-y-8 overflow-y-auto relative z-10 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-[7px] font-black text-text-muted uppercase tracking-[0.3em] ml-2">Nome Completo *</label>
              <input 
                type="text" 
                required
                placeholder="Ex: João Silva"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-5 bg-text-main/5 border border-border-main rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-lg font-black text-text-main transition-all placeholder:text-text-muted/40 shadow-inner"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[7px] font-black text-text-muted uppercase tracking-[0.3em] ml-2">CPF / Documento *</label>
              <input 
                type="text" 
                required
                placeholder="000.000.000-00"
                value={formData.document}
                onChange={e => setFormData({...formData, document: e.target.value})}
                className="w-full p-5 bg-text-main/5 border border-border-main rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-lg font-mono font-black text-text-main transition-all placeholder:text-text-muted/40 shadow-inner"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[7px] font-black text-text-muted uppercase tracking-[0.3em] ml-2">Telefone (Opcional)</label>
              <input 
                type="tel" 
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full p-5 bg-text-main/5 border border-border-main rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-lg font-black text-text-main transition-all placeholder:text-text-muted/40 shadow-inner"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[7px] font-black text-text-muted uppercase tracking-[0.3em] ml-2">Endereço (Opcional)</label>
              <textarea 
                placeholder="Rua, Número, Bairro, Cidade"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full p-5 bg-text-main/5 border border-border-main rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 h-32 resize-none text-lg font-black text-text-main transition-all placeholder:text-text-muted/40 shadow-inner"
              />
            </div>
          </div>

          <div className="pt-8 max-w-md mx-auto">
            <button 
              type="submit"
              className="relative overflow-hidden w-full py-5 btn-gradient text-white text-[12px] font-black uppercase tracking-[0.3em] rounded-[1.25rem] active:scale-[0.98] group/btn shadow-xl shadow-brand-500/20"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
              <span className="relative z-10">{customer ? 'Salvar Alterações' : 'Cadastrar Cliente'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
});

CustomerModal.displayName = 'CustomerModal';
