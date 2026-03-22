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
  onSave: (payment: { loanId: string; amount: number; date: string; notes: string }, sendWhatsApp: boolean) => Promise<void> | void;
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
      console.log('Submitting payment for loan:', loan.id, formData);
      
      await onSave({
        loanId: loan.id,
        amount: formData.amount,
        date: new Date(formData.date).toISOString(),
        notes: formData.notes
      }, formData.sendWhatsApp);
      
      console.log('Payment saved successfully');
      setFormData({ amount: 0, date: new Date().toISOString().split('T')[0], notes: '', sendWhatsApp: true });
    } catch (err: any) {
      console.error('Error in PaymentModal handleSubmit:', err);
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
        className="bg-white w-full max-w-md rounded-t-[3rem] md:rounded-[3rem] shadow-2xl flex flex-col h-[85vh] md:h-auto md:max-h-[90vh] border-t md:border border-slate-200/60 relative"
      >
        <div className="p-6 md:p-8 border-b border-border-main flex justify-between items-center gap-4 shrink-0 rounded-t-[3rem] md:rounded-t-[3rem] bg-bg-main/50">
          <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-border-main rounded-full" />
          <h3 className="text-2xl font-display font-black text-text-main truncate flex-1 tracking-tight">
            Registrar Pagamento
          </h3>
          <button 
            onClick={onClose} 
            className="p-3 bg-bg-main hover:bg-border-main rounded-2xl transition-all text-text-muted hover:scale-110 active:scale-90 shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto">
          <div className="bg-brand-50/50 p-6 rounded-[2rem] border border-brand-100 neo-shadow-sm">
            <p className="text-[11px] text-brand-600 uppercase font-black tracking-widest mb-1">Cliente</p>
            <p className="font-display font-black text-2xl text-brand-900 leading-tight">{loan.customerName}</p>
            <div className="flex justify-between mt-4 p-3 bg-white/50 rounded-2xl border border-brand-100/50">
              <span className="text-sm font-bold text-brand-700">Saldo Restante:</span>
              <span className="font-black text-brand-600">{formatCurrency(loan.remainingAmount)}</span>
            </div>
          </div>

          {delayDays > 0 && (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-4 animate-pulse">
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-red-900 uppercase tracking-tight">Pagamento em Atraso</p>
                <p className="text-xs text-red-600 font-bold">Atraso de {delayDays} dias.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-bold text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, amount: Number(normal.toFixed(2)) })}
              className="p-4 bg-bg-main border border-border-main rounded-2xl hover:bg-border-main/50 transition-all text-left group active:scale-95"
            >
              <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-1 group-hover:text-brand-500 transition-colors">Normal</p>
              <p className="font-black text-lg text-text-main">{formatCurrency(normal)}</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, amount: Number(corrected.toFixed(2)) })}
              className={`p-4 border rounded-2xl transition-all text-left group active:scale-95 ${
                delayDays > 0 
                  ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                  : 'bg-bg-main border-border-main hover:bg-border-main/50'
              }`}
            >
              <p className={`text-[10px] uppercase font-black tracking-widest mb-1 transition-colors ${delayDays > 0 ? 'text-red-400 group-hover:text-red-600' : 'text-text-muted group-hover:text-brand-500'}`}>
                Corrigido
              </p>
              <p className={`font-black text-lg ${delayDays > 0 ? 'text-red-800' : 'text-text-main'}`}>{formatCurrency(corrected)}</p>
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Valor do Pagamento (R$)</label>
            <div className="relative">
              <input 
                type="number" 
                required
                min="0.01"
                max={Math.max(loan.remainingAmount, corrected)}
                step="0.01"
                value={formData.amount || ''}
                onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                className="w-full p-4 bg-bg-main border border-border-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-lg font-black text-text-main transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted opacity-30">
                <DollarSign size={24} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Data do Pagamento</label>
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full p-4 bg-bg-main border border-border-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-sm font-bold text-text-main transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Observações (Opcional)</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full p-4 bg-bg-main border border-border-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 h-24 resize-none text-sm font-bold text-text-main transition-all"
              placeholder="Ex: Pagamento com juros..."
            />
          </div>

          <div className="space-y-4">
            <div 
              className={`flex items-center gap-4 p-5 rounded-[2rem] border transition-all cursor-pointer active:scale-[0.98] ${
                formData.sendWhatsApp 
                  ? 'bg-brand-50 border-brand-200' 
                  : 'bg-bg-main border-border-main'
              }`} 
              onClick={() => setFormData({...formData, sendWhatsApp: !formData.sendWhatsApp})}
            >
              <div className={`w-12 h-7 rounded-full transition-all relative ${formData.sendWhatsApp ? 'bg-brand-600' : 'bg-border-main'}`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${formData.sendWhatsApp ? 'left-6' : 'left-1'}`} />
              </div>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${formData.sendWhatsApp ? 'bg-brand-100 text-brand-600' : 'bg-bg-main text-text-muted'}`}>
                  <MessageCircle size={20} />
                </div>
                <div>
                  <span className={`block text-sm font-black uppercase tracking-tight ${formData.sendWhatsApp ? 'text-brand-900' : 'text-text-muted'}`}>
                    Enviar via WhatsApp
                  </span>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Confirmação automática</span>
                </div>
              </div>
            </div>

            {formData.sendWhatsApp && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 bg-[#e5ddd5] dark:bg-slate-800 rounded-[2.5rem] border border-border-main/50 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] opacity-10 pointer-events-none"></div>
                <div className="relative z-10">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4 text-center">Prévia da Mensagem</p>
                  <div className="bg-[#dcf8c6] dark:bg-emerald-900/40 p-4 rounded-2xl rounded-tl-none neo-shadow-sm max-w-[90%] ml-0 relative">
                    <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-[#dcf8c6] dark:border-t-emerald-900/40 border-l-[10px] border-l-transparent"></div>
                    <p className="text-xs font-bold text-slate-800 dark:text-emerald-50 leading-relaxed whitespace-pre-wrap">
                      {`*Comprovante de Pagamento - ${settings.companyName}*\n\n` +
                      `Olá, *${loan.customerName}*!\n` +
                      `Recebemos seu pagamento no valor de *${formatCurrency(formData.amount || 0)}*.\n\n` +
                      `*Detalhes:*\n` +
                      `Data: ${new Date(formData.date).toLocaleDateString('pt-BR')}\n` +
                      `Saldo Restante: ${formatCurrency(Math.max(0, loan.remainingAmount - formData.amount))}\n\n` +
                      `Obrigado!`}
                    </p>
                    <div className="flex justify-end mt-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-5 bg-brand-600 text-white font-black rounded-[2rem] transition-all shadow-xl shadow-brand-100 flex items-center justify-center gap-3 text-lg tracking-tight ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-700 active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <DollarSign size={24} />
              )}
              <span>{isSubmitting ? 'Processando...' : 'Confirmar Pagamento'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
