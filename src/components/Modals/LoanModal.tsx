import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { Customer, Loan, Frequency, Settings, InterestType } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onSave: (loan: Omit<Loan, 'id' | 'createdAt' | 'createdBy' | 'status' | 'remainingAmount'>) => void;
  settings: Settings;
}

export function LoanModal({ isOpen, onClose, customers, onSave, settings }: LoanModalProps) {
  const [formData, setFormData] = useState({
    customerId: '',
    amount: 0,
    interestRate: settings.defaultInterestRate,
    interestType: 'simple' as InterestType,
    installmentsCount: 1,
    frequency: 'monthly' as Frequency,
    startDate: new Date().toISOString().split('T')[0]
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        interestRate: settings.defaultInterestRate
      }));
    }
  }, [isOpen, settings.defaultInterestRate]);

  const totalToPay = useMemo(() => {
    const { amount, interestRate, interestType, installmentsCount } = formData;
    if (!amount) return 0;
    
    if (interestType === 'simple') {
      // Simple Interest: Principal + (Principal * Rate * Time)
      return amount + (amount * (interestRate / 100) * installmentsCount);
    } else {
      // Compound Interest: Principal * (1 + Rate)^Time
      return amount * Math.pow(1 + (interestRate / 100), installmentsCount);
    }
  }, [formData.amount, formData.interestRate, formData.interestType, formData.installmentsCount]);

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
        className="bg-white w-full max-w-lg rounded-t-[3rem] md:rounded-[3rem] shadow-2xl flex flex-col h-[94vh] md:h-auto md:max-h-[92vh] border-t md:border border-slate-200/60 relative"
      >
        <div className="p-6 md:p-8 border-b border-border-main flex justify-between items-center gap-4 shrink-0 rounded-t-[3rem] md:rounded-t-[3rem] bg-bg-main/50">
          <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-border-main rounded-full" />
          <h3 className="text-2xl font-display font-black text-text-main truncate flex-1 tracking-tight">Novo Empréstimo</h3>
          <button 
            onClick={onClose} 
            className="p-3 bg-bg-main hover:bg-border-main rounded-2xl transition-all text-text-muted hover:scale-110 active:scale-90 shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Cliente</label>
            <select 
              required
              value={formData.customerId}
              onChange={e => setFormData({...formData, customerId: e.target.value})}
              className="w-full p-4 bg-bg-main border border-border-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-sm font-bold text-text-main transition-all"
            >
              <option value="">Selecione um cliente</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Valor (R$)</label>
              <input 
                type="number" 
                required
                min="1"
                value={formData.amount || ''}
                onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                className="w-full p-4 bg-bg-main border border-border-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-sm font-black text-text-main transition-all"
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Juros (%)</label>
              <input 
                type="number" 
                required
                min="0"
                step="0.01"
                value={formData.interestRate}
                onChange={e => setFormData({...formData, interestRate: Number(e.target.value)})}
                className="w-full p-4 bg-bg-main border border-border-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-sm font-black text-text-main transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Tipo de Juros</label>
            <div className="flex p-1.5 bg-bg-main border border-border-main rounded-2xl w-full gap-1">
              <button
                type="button"
                onClick={() => setFormData({...formData, interestType: 'simple'})}
                className={`flex-1 py-2.5 rounded-[1.125rem] text-xs font-black uppercase tracking-wider transition-all ${
                  formData.interestType === 'simple' ? 'bg-bg-card text-brand-700 shadow-sm' : 'text-text-muted hover:text-text-main'
                }`}
              >
                Fixo (Simples)
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, interestType: 'compound'})}
                className={`flex-1 py-2.5 rounded-[1.125rem] text-xs font-black uppercase tracking-wider transition-all ${
                  formData.interestType === 'compound' ? 'bg-bg-card text-brand-700 shadow-sm' : 'text-text-muted hover:text-text-main'
                }`}
              >
                Composto
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Parcelas</label>
              <input 
                type="number" 
                required
                min="1"
                value={formData.installmentsCount}
                onChange={e => setFormData({...formData, installmentsCount: Number(e.target.value)})}
                className="w-full p-4 bg-bg-main border border-border-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-sm font-black text-text-main transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Frequência</label>
              <select 
                value={formData.frequency}
                onChange={e => setFormData({...formData, frequency: e.target.value as Frequency})}
                className="w-full p-4 bg-bg-main border border-border-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-sm font-bold text-text-main transition-all"
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Data de Início</label>
            <input 
              type="date" 
              required
              value={formData.startDate}
              onChange={e => setFormData({...formData, startDate: e.target.value})}
              className="w-full p-4 bg-bg-main border border-border-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-sm font-bold text-text-main transition-all"
            />
          </div>

          <div className="p-6 bg-brand-50/50 rounded-[2rem] border border-brand-100 neo-shadow-sm mt-2">
            <div className="flex justify-between items-center">
              <span className="text-brand-700 font-bold text-sm uppercase tracking-widest">Total a Receber:</span>
              <span className="text-2xl font-display font-black text-brand-800">{formatCurrency(totalToPay)}</span>
            </div>
            <div className="h-px bg-brand-100 my-3" />
            <p className="text-[10px] text-brand-600 uppercase font-black tracking-[0.2em]">
              {formData.installmentsCount}x de {formatCurrency(totalToPay / formData.installmentsCount)}
            </p>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full py-5 bg-brand-600 text-white font-black rounded-[2rem] hover:bg-brand-700 transition-all shadow-xl shadow-brand-100 active:scale-[0.98] text-lg tracking-tight"
            >
              Criar Empréstimo
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
