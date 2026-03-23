import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Payment, Loan } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { 
  isToday, 
  isThisWeek, 
  isThisMonth, 
  parseISO, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  isWithinInterval
} from 'date-fns';
import { Calendar, Filter, TrendingUp } from 'lucide-react';

interface HistoryViewProps {
  payments: Payment[];
  loans: Loan[];
}

type Period = 'today' | 'week' | 'month' | 'all';

export function HistoryView({ payments, loans }: HistoryViewProps) {
  const [period, setPeriod] = useState<Period>('all');

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const date = parseISO(payment.date);
      if (period === 'today') return isToday(date);
      if (period === 'week') return isThisWeek(date, { weekStartsOn: 0 }); // Sunday
      if (period === 'month') return isThisMonth(date);
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, period]);

  const totalInPeriod = useMemo(() => {
    return filteredPayments.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredPayments]);

  return (
    <div className="space-y-10 pb-12">
      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-[3rem] border border-slate-200 shadow-2xl flex items-center gap-6 group hover:border-emerald-500/30 transition-all duration-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all duration-700 group-hover:bg-emerald-500/10"></div>
          <div className="p-5 bg-emerald-600 rounded-[1.5rem] text-white shadow-2xl shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-500 relative z-10">
            <TrendingUp size={28} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Total no Período</p>
            <h3 className="text-4xl font-display font-black text-slate-900 leading-none tracking-tighter accent-glow">{formatCurrency(totalInPeriod)}</h3>
          </div>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5 rounded-[2.5rem] border border-slate-200 shadow-2xl flex flex-wrap items-center gap-6"
      >
        <div className="flex items-center gap-4 text-slate-500 ml-4">
          <Filter size={20} className="text-emerald-500/50" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Filtrar por:</span>
        </div>
        <div className="flex p-2 bg-slate-900/5 rounded-[1.5rem] border border-slate-200 shadow-inner">
          {(['today', 'week', 'month', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 active:scale-95 relative overflow-hidden group ${
                period === p 
                  ? 'text-white shadow-2xl shadow-emerald-500/20' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-900/5'
              }`}
            >
              {period === p && (
                <motion.div 
                  layoutId="activePeriod"
                  className="absolute inset-0 btn-gradient rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{p === 'today' ? 'Hoje' : p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Tudo'}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden"
      >
        <div className="p-8 md:p-10 border-b border-slate-200 flex items-center justify-between bg-slate-900/5">
          <h3 className="text-2xl font-display font-black flex items-center gap-4 text-slate-900 tracking-tight">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl">
              <Calendar size={24} className="text-emerald-600" />
            </div>
            Histórico de Pagamentos
          </h3>
          <span className="px-5 py-2 bg-slate-900/5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border border-slate-200 shadow-inner">
            {filteredPayments.length} registros
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/5 text-slate-600 text-[11px] font-black uppercase tracking-[0.3em] border-b border-slate-200">
                <th className="px-10 py-6">Data</th>
                <th className="px-10 py-6">Cliente</th>
                <th className="px-10 py-6">Valor</th>
                <th className="px-10 py-6">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPayments.map(payment => {
                const loan = loans.find(l => l.id === payment.loanId);
                return (
                  <tr key={payment.id} className="group hover:bg-slate-900/5 transition-all duration-500">
                    <td className="px-10 py-7">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-500 tracking-tight">{formatDateTime(payment.date).split(' ')[0]}</span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">{formatDateTime(payment.date).split(' ')[1]}</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className="font-display font-black text-slate-900 text-lg tracking-tight group-hover:text-emerald-600 transition-colors duration-500">
                        {loan?.customerName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <span className="font-display font-black text-emerald-600 text-xl tracking-tighter group-hover:scale-110 inline-block transition-transform duration-500">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <p className="text-xs font-bold text-slate-500 max-w-[300px] truncate italic bg-slate-900/5 px-4 py-2.5 rounded-xl border border-slate-200 group-hover:border-slate-300 transition-colors duration-500">
                        {payment.notes || '-'}
                      </p>
                    </td>
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-30 group">
                      <div className="p-6 bg-slate-900/5 rounded-[2rem] shadow-inner group-hover:scale-110 transition-transform duration-700">
                        <Calendar size={56} className="text-slate-500" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-600">Nenhum pagamento encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
