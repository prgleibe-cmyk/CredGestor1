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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {loans.map(loan => {
        const progress = ((loan.totalToPay - loan.remainingAmount) / loan.totalToPay) * 100;
        return (
          <div key={loan.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200/60 neo-shadow hover:neo-shadow-lg transition-all duration-300 group flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-extrabold text-slate-900 text-lg leading-tight truncate group-hover:text-brand-600 transition-colors">{loan.customerName}</h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-slate-200/50">
                    {loan.frequency}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                    {loan.installmentsCount} parcelas • {loan.interestType === 'simple' ? 'Fixo' : 'Composto'}
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                loan.status === 'active' ? 'bg-brand-50 text-brand-600 border-brand-100' : 
                loan.status === 'paid' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {loan.status === 'active' ? 'Ativo' : loan.status === 'paid' ? 'Pago' : 'Atrasado'}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Original</p>
                <p className="font-bold text-slate-700 text-xs truncate">{formatCurrency(loan.amount)}</p>
              </div>
              <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total</p>
                <p className="font-bold text-slate-700 text-xs truncate">{formatCurrency(loan.totalToPay)}</p>
              </div>
              <div className="bg-brand-50/30 p-3 rounded-2xl border border-brand-100/30">
                <p className="text-[9px] text-brand-500 font-bold uppercase tracking-widest mb-1">Restante</p>
                <p className="font-black text-brand-600 text-xs truncate">{formatCurrency(loan.remainingAmount)}</p>
              </div>
            </div>

            <div className="mt-auto">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Progresso de Quitação</span>
                <span className="text-xs font-black text-brand-600">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-6 border border-slate-200/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-brand-400 to-brand-600 h-full rounded-full shadow-sm"
                />
              </div>

              {loan.status !== 'paid' && (
                <button 
                  onClick={() => onPayment(loan)}
                  className="w-full py-3.5 bg-slate-900 hover:bg-brand-600 text-white text-sm font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg shadow-slate-200 hover:shadow-brand-200 active:scale-[0.98] group"
                >
                  <DollarSign size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Registrar Pagamento</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
      {loans.length === 0 && (
        <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
            <HandCoins className="text-slate-300" size={40} />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-xl">Nenhum empréstimo ativo</p>
            <p className="text-slate-400 text-sm mt-1">Clique em "Novo Empréstimo" para começar.</p>
          </div>
        </div>
      )}
    </div>
  );
}
