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

  if (!loan) return null;

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
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-text-main/40 backdrop-blur-xl overflow-hidden"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%", opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: "100%", opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] flex flex-col h-[92vh] md:h-auto md:max-h-[90vh] border-t md:border border-border-main relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-border-main to-transparent"></div>
        
        <div className="p-4 md:p-6 border-b border-border-main flex justify-between items-center gap-6 shrink-0 rounded-t-[2.5rem] md:rounded-t-[3rem] bg-text-main/5 relative z-10">
          <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-text-main/10 rounded-full shadow-inner" />
          <h3 className="text-xl md:text-2xl font-display font-black text-text-main truncate flex-1 tracking-tighter">
            Registrar Pagamento
          </h3>
          <button 
            onClick={onClose} 
            className="p-3 btn-gradient-slate text-white rounded-2xl transition-all hover:scale-110 active:scale-90 shrink-0 border border-border-main shadow-inner"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6 overflow-y-auto relative z-10 custom-scrollbar">
          <div className="bg-emerald-500/10 p-8 rounded-[2.5rem] border border-emerald-500/20 shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <p className="text-[11px] text-emerald-600 uppercase font-black tracking-[0.3em] mb-2 relative z-10">Cliente</p>
            <p className="font-display font-black text-3xl text-text-main leading-tight relative z-10">{loan.customerName}</p>
            <div className="flex justify-between mt-6 p-4 bg-text-main/5 rounded-2xl border border-border-main relative z-10 shadow-inner">
              <span className="text-sm font-bold text-text-muted">Saldo Restante:</span>
              <span className="font-black text-emerald-600">{formatCurrency(loan.remainingAmount)}</span>
            </div>
          </div>

          {delayDays > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-5 bg-red-500/10 rounded-[2rem] border border-red-500/20 flex items-center gap-5 shadow-inner"
            >
              <div className="p-3 bg-red-500/20 rounded-2xl border border-red-500/20 shadow-inner">
                <AlertCircle className="text-red-400" size={24} />
              </div>
              <div>
                <p className="text-[11px] font-black text-red-400 uppercase tracking-[0.2em]">Pagamento em Atraso</p>
                <p className="text-sm text-red-500/70 font-black">Atraso de {delayDays} dias.</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 bg-red-500/10 rounded-[2rem] border border-red-500/20 flex items-start gap-4 shadow-inner"
            >
              <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
              <p className="text-sm font-black text-red-200 leading-relaxed">{error}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, amount: Number(normal.toFixed(2)) })}
              className="p-6 bg-text-main/5 border border-border-main rounded-[2rem] hover:bg-text-main/10 transition-all text-left group active:scale-95 shadow-inner relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-[11px] text-text-muted uppercase font-black tracking-[0.3em] mb-2 group-hover:text-emerald-600 transition-colors relative z-10">Normal</p>
              <p className="font-black text-xl text-text-main relative z-10">{formatCurrency(normal)}</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, amount: Number(corrected.toFixed(2)) })}
              className={`p-6 border rounded-[2rem] transition-all text-left group active:scale-95 shadow-inner relative overflow-hidden ${
                delayDays > 0 
                  ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20' 
                  : 'bg-text-main/5 border-border-main hover:bg-text-main/10'
              }`}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${delayDays > 0 ? 'bg-red-500/5' : 'bg-emerald-500/5'}`}></div>
              <p className={`text-[11px] uppercase font-black tracking-[0.3em] mb-2 transition-colors relative z-10 ${delayDays > 0 ? 'text-red-600 group-hover:text-red-500' : 'text-text-muted group-hover:text-emerald-600'}`}>
                Corrigido
              </p>
              <p className={`font-black text-xl relative z-10 ${delayDays > 0 ? 'text-red-600' : 'text-text-main'}`}>{formatCurrency(corrected)}</p>
            </button>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-[0.3em] ml-2">Valor do Pagamento (R$)</label>
            <div className="relative">
              <input 
                type="number" 
                required
                min="0.01"
                max={Math.max(loan.remainingAmount, corrected)}
                step="0.01"
                value={formData.amount || ''}
                onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                className="w-full p-6 bg-text-main/5 border border-border-main rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-2xl font-black text-text-main transition-all placeholder:text-text-muted/40 shadow-inner"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted opacity-20">
                <DollarSign size={32} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-[0.3em] ml-2">Data do Pagamento</label>
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full p-5 bg-text-main/5 border border-border-main rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-base font-black text-text-main transition-all shadow-inner"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-[0.3em] ml-2">Observações (Opcional)</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full p-5 bg-text-main/5 border border-border-main rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 h-32 resize-none text-base font-black text-text-main transition-all placeholder:text-text-muted/40 shadow-inner"
              placeholder="Ex: Pagamento com juros..."
            />
          </div>

          <div className="space-y-6">
            <div 
              className={`flex items-center gap-5 p-6 rounded-[2.5rem] border transition-all cursor-pointer active:scale-[0.98] shadow-inner ${
                formData.sendWhatsApp 
                  ? 'bg-emerald-500/10 border-emerald-500/20' 
                  : 'bg-text-main/5 border-border-main'
              }`} 
              onClick={() => setFormData({...formData, sendWhatsApp: !formData.sendWhatsApp})}
            >
              <div className={`w-14 h-8 rounded-full transition-all relative ${formData.sendWhatsApp ? 'bg-emerald-600' : 'bg-text-main/10 shadow-inner'}`}>
                <div className={`absolute top-1 w-6 h-6 bg-bg-main rounded-full shadow-lg transition-all ${formData.sendWhatsApp ? 'left-7' : 'left-1'}`} />
              </div>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl border border-border-main shadow-inner ${formData.sendWhatsApp ? 'bg-emerald-500/20 text-emerald-600' : 'bg-text-main/5 text-text-muted'}`}>
                  <MessageCircle size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <span className={`block text-sm font-black uppercase tracking-[0.1em] ${formData.sendWhatsApp ? 'text-text-main' : 'text-text-muted'}`}>
                    Enviar via WhatsApp
                  </span>
                  <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em]">Confirmação automática</span>
                </div>
              </div>
            </div>

            {formData.sendWhatsApp && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="p-8 bg-text-main/5 rounded-[3rem] border border-border-main relative overflow-hidden shadow-inner"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] opacity-5 pointer-events-none"></div>
                <div className="relative z-10">
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] mb-6 text-center">Prévia da Mensagem</p>
                  <div className="bg-emerald-600/10 p-6 rounded-3xl rounded-tl-none border border-emerald-500/20 max-w-[95%] ml-0 relative shadow-2xl">
                    <div className="absolute top-0 -left-2 w-0 h-0 border-t-[12px] border-t-emerald-600/10 border-l-[12px] border-l-transparent"></div>
                    <p className="text-sm font-black text-emerald-900 leading-relaxed whitespace-pre-wrap">
                      {`*Comprovante de Pagamento - ${settings.companyName}*\n\n` +
                      `Olá, *${loan.customerName}*!\n` +
                      `Recebemos seu pagamento no valor de *${formatCurrency(formData.amount || 0)}*.\n\n` +
                      `*Detalhes:*\n` +
                      `Data: ${new Date(formData.date).toLocaleDateString('pt-BR')}\n` +
                      `Saldo Restante: ${formatCurrency(Math.max(0, loan.remainingAmount - formData.amount))}\n\n` +
                      `Obrigado!`}
                    </p>
                    <div className="flex justify-end mt-2">
                      <span className="text-[10px] text-emerald-600/50 font-black uppercase">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`relative overflow-hidden w-full py-6 btn-gradient text-white text-[12px] font-black uppercase tracking-[0.3em] rounded-[1.5rem] flex items-center justify-center gap-4 group/btn ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'
              }`}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
              {isSubmitting ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin relative z-10" />
              ) : (
                <DollarSign size={24} strokeWidth={2.5} className="relative z-10" />
              )}
              <span className="relative z-10">{isSubmitting ? 'Processando...' : 'Confirmar Pagamento'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
