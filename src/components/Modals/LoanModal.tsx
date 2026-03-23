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
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-900/40 backdrop-blur-xl overflow-hidden"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%", opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: "100%", opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-2xl rounded-t-[4rem] md:rounded-[4rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] flex flex-col h-[94vh] md:h-auto md:max-h-[92vh] border-t md:border border-slate-200 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        
        <div className="p-8 md:p-10 border-b border-slate-200 flex justify-between items-center gap-6 shrink-0 rounded-t-[4rem] md:rounded-t-[4rem] bg-slate-900/5 relative z-10">
          <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-slate-900/10 rounded-full shadow-inner" />
          <h3 className="text-3xl font-display font-black text-slate-900 truncate flex-1 tracking-tighter">Novo Empréstimo</h3>
          <button 
            onClick={onClose} 
            className="p-4 btn-gradient-slate text-white rounded-2xl transition-all hover:scale-110 active:scale-90 shrink-0 border border-slate-200 shadow-inner"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8 overflow-y-auto relative z-10 custom-scrollbar">
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Cliente</label>
            <div className="relative">
              <select 
                required
                value={formData.customerId}
                onChange={e => setFormData({...formData, customerId: e.target.value})}
                className="w-full p-5 bg-white/60 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-base font-black text-slate-900 transition-all appearance-none shadow-inner"
              >
                <option value="" className="bg-white">Selecione um cliente</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id} className="bg-white">{c.name}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Valor (R$)</label>
              <input 
                type="number" 
                required
                min="1"
                value={formData.amount || ''}
                onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                className="w-full p-5 bg-white/60 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-base font-black text-slate-900 transition-all placeholder:text-slate-400 shadow-inner"
                placeholder="0,00"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Juros (%)</label>
              <input 
                type="number" 
                required
                min="0"
                step="0.01"
                value={formData.interestRate}
                onChange={e => setFormData({...formData, interestRate: Number(e.target.value)})}
                className="w-full p-5 bg-white/60 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-base font-black text-slate-900 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Tipo de Juros</label>
            <div className="flex p-2 bg-slate-900/5 border border-slate-200 rounded-[2rem] w-full gap-2 shadow-inner">
              <button
                type="button"
                onClick={() => setFormData({...formData, interestType: 'simple'})}
                className={`flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden group/btn ${
                  formData.interestType === 'simple' ? 'text-white shadow-2xl shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {formData.interestType === 'simple' && (
                  <motion.div layoutId="interestType" className="absolute inset-0 btn-gradient rounded-[1.5rem] -z-10" />
                )}
                <span className="relative z-10">Fixo (Simples)</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, interestType: 'compound'})}
                className={`flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden group/btn ${
                  formData.interestType === 'compound' ? 'text-white shadow-2xl shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {formData.interestType === 'compound' && (
                  <motion.div layoutId="interestType" className="absolute inset-0 btn-gradient rounded-[1.5rem] -z-10" />
                )}
                <span className="relative z-10">Composto</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Parcelas</label>
              <input 
                type="number" 
                required
                min="1"
                value={formData.installmentsCount}
                onChange={e => setFormData({...formData, installmentsCount: Number(e.target.value)})}
                className="w-full p-5 bg-white/60 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-base font-black text-slate-900 transition-all shadow-inner"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Frequência</label>
              <div className="relative">
                <select 
                  value={formData.frequency}
                  onChange={e => setFormData({...formData, frequency: e.target.value as Frequency})}
                  className="w-full p-5 bg-white/60 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-base font-black text-slate-900 transition-all appearance-none shadow-inner"
                >
                  <option value="daily" className="bg-white">Diário</option>
                  <option value="weekly" className="bg-white">Semanal</option>
                  <option value="monthly" className="bg-white">Mensal</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Data de Início</label>
            <input 
              type="date" 
              required
              value={formData.startDate}
              onChange={e => setFormData({...formData, startDate: e.target.value})}
              className="w-full p-5 bg-white/60 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-base font-black text-slate-900 transition-all shadow-inner"
            />
          </div>

          <div className="p-8 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 mt-4 relative overflow-hidden group shadow-inner">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="flex justify-between items-center relative z-10">
              <span className="text-emerald-600 font-black text-[11px] uppercase tracking-[0.3em]">Total a Receber:</span>
              <span className="text-3xl font-display font-black text-slate-900">{formatCurrency(totalToPay)}</span>
            </div>
            <div className="h-px bg-slate-900/10 my-5 relative z-10" />
            <p className="text-[11px] text-slate-500 uppercase font-black tracking-[0.3em] relative z-10">
              {formData.installmentsCount}x de <span className="text-slate-900">{formatCurrency(totalToPay / formData.installmentsCount)}</span>
            </p>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="relative overflow-hidden w-full py-6 btn-gradient text-white text-[12px] font-black uppercase tracking-[0.3em] rounded-[1.5rem] active:scale-[0.98] group/btn"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
              <span className="relative z-10">Criar Empréstimo</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
