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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pb-12">
      {loans.map(loan => {
        const progress = ((loan.totalToPay - loan.remainingAmount) / loan.totalToPay) * 100;
        return (
          <div key={loan.id} className="glass-card p-8 rounded-[3rem] border border-slate-200 shadow-2xl hover:border-emerald-500/30 transition-all duration-700 group flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all duration-700 group-hover:bg-emerald-500/20"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-black text-slate-900 text-xl leading-tight truncate group-hover:text-emerald-600 transition-colors tracking-tight">{loan.customerName}</h4>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-3 py-1 bg-slate-900/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-slate-200">
                    {loan.frequency}
                  </span>
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    {loan.installmentsCount} parcelas • {loan.interestType === 'simple' ? 'Fixo' : 'Composto'}
                  </span>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg ${
                loan.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/5' : 
                loan.status === 'paid' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-blue-500/5' : 'bg-red-500/10 text-red-600 border-red-500/20 shadow-red-500/5'
              }`}>
                {loan.status === 'active' ? 'Ativo' : loan.status === 'paid' ? 'Pago' : 'Atrasado'}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
              <div className="bg-slate-900/5 p-4 rounded-[1.5rem] border border-slate-200 shadow-inner group-hover:bg-slate-900/10 transition-colors duration-500">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Original</p>
                <p className="font-black text-slate-700 text-sm truncate tracking-tighter">{formatCurrency(loan.amount)}</p>
              </div>
              <div className="bg-slate-900/5 p-4 rounded-[1.5rem] border border-slate-200 shadow-inner group-hover:bg-slate-900/10 transition-colors duration-500">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Total</p>
                <p className="font-black text-slate-700 text-sm truncate tracking-tighter">{formatCurrency(loan.totalToPay)}</p>
              </div>
              <div className="bg-emerald-500/10 p-4 rounded-[1.5rem] border border-emerald-500/20 shadow-inner group-hover:bg-emerald-500/20 transition-colors duration-500">
                <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.2em] mb-2">Restante</p>
                <p className="font-black text-emerald-600 text-sm truncate tracking-tighter">{formatCurrency(loan.remainingAmount)}</p>
              </div>
            </div>

            <div className="mt-auto relative z-10">
              <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Progresso de Quitação</span>
                <span className="text-sm font-black text-emerald-600 tracking-tighter">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-900/5 h-3.5 rounded-full overflow-hidden mb-8 border border-slate-200 shadow-inner p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                />
              </div>

              {loan.status !== 'paid' && (
                <button 
                  onClick={() => onPayment(loan)}
                  className="relative overflow-hidden w-full py-5 btn-gradient text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-[1.5rem] transition-all duration-500 flex items-center justify-center gap-3 active:scale-[0.98] group/btn"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
                  <DollarSign size={20} className="group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-all duration-500 relative z-10" strokeWidth={2.5} />
                  <span className="relative z-10">Registrar Pagamento</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
      {loans.length === 0 && (
        <div className="col-span-full py-24 text-center glass-card rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-6 group">
          <div className="w-24 h-24 bg-slate-900/5 rounded-[2rem] flex items-center justify-center shadow-inner relative">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <HandCoins className="text-slate-300 relative z-10" size={48} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <p className="text-slate-900 font-black text-2xl tracking-tight">Nenhum empréstimo ativo</p>
            <p className="text-slate-500 text-sm font-black uppercase tracking-widest">Clique em "Novo Empréstimo" para começar.</p>
          </div>
        </div>
      )}
    </div>
  );
}
