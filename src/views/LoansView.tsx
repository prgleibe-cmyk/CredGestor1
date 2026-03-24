import React from 'react';
import { motion } from 'motion/react';
import { HandCoins, DollarSign } from 'lucide-react';
import { Loan } from '../types';
import { formatCurrency } from '../utils/formatters';

interface LoansViewProps {
  loans: Loan[];
  onPayment: (loan: Loan) => void;
}

export function LoansView({ loans, onPayment }: LoansViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
      {loans.map(loan => {
        const progress = ((loan.totalToPay - loan.remainingAmount) / loan.totalToPay) * 100;
        return (
          <div key={loan.id} className="glass-card p-4 rounded-xl border border-border-main shadow-sm hover:border-brand-500/30 transition-all duration-500 group flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-brand-500/10 rounded-full -mr-10 -mt-10 blur-3xl transition-all duration-700 group-hover:bg-brand-500/20"></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-black text-text-main text-base leading-tight truncate group-hover:text-brand-600 transition-colors tracking-tight">{loan.customerName}</h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="px-1.5 py-0.5 bg-text-main/5 text-text-muted text-[7px] font-black uppercase tracking-[0.2em] rounded-lg border border-border-main">
                    {loan.frequency}
                  </span>
                  <span className="text-[7px] text-text-muted font-black uppercase tracking-widest">
                    {loan.installmentsCount} parcelas • {loan.interestType === 'simple' ? 'Fixo' : 'Composto'}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border shadow-sm ${
                loan.status === 'active' ? 'bg-brand-500/10 text-brand-600 border-brand-500/20 shadow-brand-500/5' : 
                loan.status === 'paid' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-blue-500/5' : 'bg-red-500/10 text-red-600 border-red-500/20 shadow-red-500/5'
              }`}>
                {loan.status === 'active' ? 'Ativo' : loan.status === 'paid' ? 'Pago' : 'Atrasado'}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
              <div className="bg-text-main/5 p-2 rounded-xl border border-border-main shadow-inner group-hover:bg-text-main/10 transition-colors duration-500">
                <p className="text-[7px] text-text-muted font-black uppercase tracking-[0.2em] mb-1">Original</p>
                <p className="font-black text-text-main text-[10px] truncate tracking-tighter">{formatCurrency(loan.amount)}</p>
              </div>
              <div className="bg-text-main/5 p-2 rounded-xl border border-border-main shadow-inner group-hover:bg-text-main/10 transition-colors duration-500">
                <p className="text-[7px] text-text-muted font-black uppercase tracking-[0.2em] mb-1">Total</p>
                <p className="font-black text-text-main text-[10px] truncate tracking-tighter">{formatCurrency(loan.totalToPay)}</p>
              </div>
              <div className="bg-brand-500/10 p-2 rounded-xl border border-brand-500/20 shadow-inner group-hover:bg-brand-500/20 transition-colors duration-500">
                <p className="text-[7px] text-brand-600 font-black uppercase tracking-[0.2em] mb-1">Restante</p>
                <p className="font-black text-brand-600 text-[10px] truncate tracking-tighter">{formatCurrency(loan.remainingAmount)}</p>
              </div>
            </div>

            <div className="mt-auto relative z-10">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-[7px] text-text-muted font-black uppercase tracking-[0.2em]">Progresso de Quitação</span>
                <span className="text-[10px] font-black text-brand-600 tracking-tighter">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-text-main/5 h-2 rounded-full overflow-hidden mb-4 border border-border-main shadow-inner p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="bg-gradient-to-r from-brand-600 to-brand-400 h-full rounded-full shadow-[0_0_8px_rgba(var(--brand-500),0.3)]"
                />
              </div>

              {loan.status !== 'paid' && (
                <button 
                  onClick={() => onPayment(loan)}
                  className="relative overflow-hidden w-full py-2.5 btn-gradient text-white text-[8px] font-black uppercase tracking-[0.3em] rounded-lg transition-all duration-500 flex items-center justify-center gap-2 active:scale-[0.98] group/btn"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
                  <DollarSign size={14} className="group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-all duration-500 relative z-10" strokeWidth={2.5} />
                  <span className="relative z-10">Registrar Pagamento</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
      {loans.length === 0 && (
        <div className="col-span-full py-12 text-center glass-card rounded-xl border-2 border-dashed border-border-main flex flex-col items-center justify-center gap-3 group">
          <div className="w-12 h-12 bg-text-main/5 rounded-xl flex items-center justify-center shadow-inner relative">
            <div className="absolute inset-0 bg-brand-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <HandCoins className="text-text-muted/40 relative z-10" size={24} strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <p className="text-text-main font-black text-base tracking-tight">Nenhum empréstimo ativo</p>
            <p className="text-text-muted text-[8px] font-black uppercase tracking-widest">Clique em "Novo Empréstimo" para começar.</p>
          </div>
        </div>
      )}
    </div>
  );
}
