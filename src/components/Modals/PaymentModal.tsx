import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { Loan } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  onSave: (payment: { loanId: string; amount: number; date: string; notes: string }) => void;
}

export function PaymentModal({ isOpen, onClose, loan, onSave }: PaymentModalProps) {
  const [formData, setFormData] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  if (!isOpen || !loan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      loanId: loan.id,
      amount: formData.amount,
      date: new Date(formData.date).toISOString(),
      notes: formData.notes
    });
    setFormData({ amount: 0, date: new Date().toISOString().split('T')[0], notes: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
          <h3 className="text-xl font-bold">Registrar Pagamento</h3>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 mb-4">
            <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Cliente</p>
            <p className="font-bold text-lg">{loan.customerName}</p>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-neutral-500">Saldo Restante:</span>
              <span className="font-bold text-emerald-600">{formatCurrency(loan.remainingAmount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Valor do Pagamento (R$)</label>
            <input 
              type="number" 
              required
              min="0.01"
              max={loan.remainingAmount}
              step="0.01"
              value={formData.amount || ''}
              onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Data do Pagamento</label>
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Observações (Opcional)</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-20 resize-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 mt-4 flex items-center justify-center gap-2"
          >
            <DollarSign size={20} />
            <span>Confirmar Pagamento</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
