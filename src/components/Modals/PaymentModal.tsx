import React, { useState, useMemo } from 'react';
import { X, DollarSign, AlertCircle, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Loan, Payment, Customer, Settings } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { calculateCorrectedValue } from '../../utils/loanCalculations';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  payments: Payment[];
  customers: Customer[];
  settings: Settings;
  onSave: (payment: { loanId: string; amount: number; date: string; notes: string }, sendWhatsApp: boolean) => void;
}

export function PaymentModal({ isOpen, onClose, loan, payments, customers, settings, onSave }: PaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    sendWhatsApp: true
  });

  const { normal, corrected, delayDays } = useMemo(() => {
    if (!loan) return { normal: 0, corrected: 0, delayDays: 0 };
    return calculateCorrectedValue(loan, payments);
  }, [loan, payments]);

  if (!isOpen || !loan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    try {
      setIsSubmitting(true);
      await onSave({
        loanId: loan.id,
        amount: formData.amount,
        date: new Date(formData.date).toISOString(),
        notes: formData.notes
      }, formData.sendWhatsApp);
      
      setFormData({ amount: 0, date: new Date().toISOString().split('T')[0], notes: '', sendWhatsApp: true });
    } catch (err: any) {
      console.error('Error saving payment:', err);
      let message = 'Ocorreu um erro ao salvar o pagamento.';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error.includes('permission-denied')) {
          message = 'Você não tem permissão para realizar esta operação.';
        } else {
          message = parsed.error;
        }
      } catch {
        message = err.message || message;
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-hidden">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center shrink-0">
          <h3 className="text-xl font-bold">Registrar Pagamento</h3>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 mb-4">
            <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Cliente</p>
            <p className="font-bold text-lg">{loan.customerName}</p>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-neutral-500">Saldo Restante:</span>
              <span className="font-bold text-emerald-600">{formatCurrency(loan.remainingAmount)}</span>
            </div>
          </div>

          {delayDays > 0 && (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-bold text-red-800">Pagamento em Atraso</p>
                <p className="text-xs text-red-600 font-medium">Esta parcela está atrasada há {delayDays} dias.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, amount: Number(normal.toFixed(2)) })}
              className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-all text-left"
            >
              <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Valor Normal</p>
              <p className="font-bold text-neutral-800">{formatCurrency(normal)}</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, amount: Number(corrected.toFixed(2)) })}
              className={`p-3 border rounded-xl transition-all text-left ${
                delayDays > 0 
                  ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                  : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <p className={`text-[10px] uppercase font-bold tracking-wider ${delayDays > 0 ? 'text-red-500' : 'text-neutral-500'}`}>
                Valor Corrigido
              </p>
              <p className={`font-bold ${delayDays > 0 ? 'text-red-800' : 'text-neutral-800'}`}>{formatCurrency(corrected)}</p>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Valor do Pagamento (R$)</label>
            <div className="relative">
              <input 
                type="number" 
                required
                min="0.01"
                max={Math.max(loan.remainingAmount, corrected)}
                step="0.01"
                value={formData.amount || ''}
                onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <DollarSign size={18} />
              </div>
            </div>
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
              placeholder="Ex: Pagamento com juros de atraso..."
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 cursor-pointer" onClick={() => setFormData({...formData, sendWhatsApp: !formData.sendWhatsApp})}>
            <div className={`w-10 h-6 rounded-full transition-colors relative ${formData.sendWhatsApp ? 'bg-emerald-600' : 'bg-neutral-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.sendWhatsApp ? 'left-5' : 'left-1'}`} />
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-emerald-600" />
              <span className="text-sm font-medium text-emerald-900">Enviar comprovante via WhatsApp</span>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-700'
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <DollarSign size={20} />
              )}
              <span>{isSubmitting ? 'Processando...' : 'Confirmar Pagamento'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
