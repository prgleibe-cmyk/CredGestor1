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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-hidden">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center shrink-0">
          <h3 className="text-xl font-bold">{customer ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nome Completo *</label>
            <input 
              type="text" 
              required
              placeholder="Ex: João Silva"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">CPF *</label>
            <input 
              type="text" 
              required
              placeholder="000.000.000-00"
              value={formData.document}
              onChange={e => setFormData({...formData, document: e.target.value})}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Telefone (Opcional)</label>
            <input 
              type="tel" 
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Endereço (Opcional)</label>
            <textarea 
              placeholder="Rua, Número, Bairro, Cidade"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-20 resize-none"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
            >
              {customer ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
