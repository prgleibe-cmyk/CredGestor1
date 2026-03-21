import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { Customer, Loan, Frequency } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onSave: (loan: Omit<Loan, 'id' | 'createdAt' | 'createdBy' | 'status' | 'remainingAmount'>) => void;
}

export function LoanModal({ isOpen, onClose, customers, onSave }: LoanModalProps) {
  const [formData, setFormData] = useState({
    customerId: '',
    amount: 0,
    interestRate: 10,
    installmentsCount: 1,
    frequency: 'monthly' as Frequency,
    startDate: new Date().toISOString().split('T')[0]
  });

  const totalToPay = useMemo(() => {
    return formData.amount + (formData.amount * (formData.interestRate / 100));
  }, [formData.amount, formData.interestRate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === formData.customerId);
    if (!customer) return;

    onSave({
      ...formData,
      customerName: customer.name,
      totalToPay
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
          <h3 className="text-xl font-bold">Novo Empréstimo</h3>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Cliente</label>
            <select 
              required
              value={formData.customerId}
              onChange={e => setFormData({...formData, customerId: e.target.value})}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Selecione um cliente</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Valor (R$)</label>
              <input 
                type="number" 
                required
                min="1"
                value={formData.amount || ''}
                onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Juros (%)</label>
              <input 
                type="number" 
                required
                min="0"
                value={formData.interestRate}
                onChange={e => setFormData({...formData, interestRate: Number(e.target.value)})}
                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Parcelas</label>
              <input 
                type="number" 
                required
                min="1"
                value={formData.installmentsCount}
                onChange={e => setFormData({...formData, installmentsCount: Number(e.target.value)})}
                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Frequência</label>
              <select 
                value={formData.frequency}
                onChange={e => setFormData({...formData, frequency: e.target.value as Frequency})}
                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Data de Início</label>
            <input 
              type="date" 
              required
              value={formData.startDate}
              onChange={e => setFormData({...formData, startDate: e.target.value})}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-emerald-700 font-medium">Total a Receber:</span>
              <span className="text-xl font-bold text-emerald-800">{formatCurrency(totalToPay)}</span>
            </div>
            <p className="text-[10px] text-emerald-600 mt-1 uppercase font-bold tracking-wider">
              {formData.installmentsCount}x de {formatCurrency(totalToPay / formData.installmentsCount)}
            </p>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 mt-4"
          >
            Criar Empréstimo
          </button>
        </form>
      </motion.div>
    </div>
  );
}
