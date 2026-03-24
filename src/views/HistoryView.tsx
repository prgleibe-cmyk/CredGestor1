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
    <div className="space-y-4 pb-4">
      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 rounded-xl border border-border-main shadow-sm flex items-center gap-3 group hover:border-emerald-500/30 transition-all duration-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-500/5 rounded-full -mr-10 -mt-10 blur-2xl transition-all duration-700 group-hover:bg-brand-500/10"></div>
          <div className="p-2.5 bg-brand-600 rounded-lg text-white shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform duration-500 relative z-10">
            <TrendingUp size={18} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <p className="text-[7px] font-black text-text-muted uppercase tracking-[0.3em] mb-0.5">Total no Período</p>
            <h3 className="text-lg font-display font-black text-text-main leading-none tracking-tighter accent-glow">{formatCurrency(totalInPeriod)}</h3>
          </div>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-1.5 rounded-xl border border-border-main shadow-sm flex flex-wrap items-center gap-3"
      >
        <div className="flex items-center gap-1.5 text-text-muted ml-1.5">
          <Filter size={14} className="text-brand-500/50" />
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">Filtrar por:</span>
        </div>
        <div className="flex p-0.5 bg-text-main/5 rounded-lg border border-border-main shadow-inner">
          {(['today', 'week', 'month', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500 active:scale-95 relative overflow-hidden group ${
                period === p 
                  ? 'text-white shadow-lg shadow-brand-500/10' 
                  : 'text-text-muted hover:text-text-main hover:bg-text-main/5'
              }`}
            >
              {period === p && (
                <motion.div 
                  layoutId="activePeriod"
                  className="absolute inset-0 btn-gradient rounded-md -z-10"
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
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl border border-border-main shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-border-main flex items-center justify-between bg-text-main/5">
          <h3 className="text-base font-display font-black flex items-center gap-2.5 text-text-main tracking-tight">
            <div className="p-1.5 bg-brand-500/10 rounded-lg">
              <Calendar size={16} className="text-brand-600" />
            </div>
            Histórico de Pagamentos
          </h3>
          <span className="px-2 py-0.5 bg-text-main/5 rounded-full text-[7px] font-black text-text-muted uppercase tracking-[0.2em] border border-border-main shadow-inner">
            {filteredPayments.length} registros
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-text-main/5 text-text-muted text-[8px] font-black uppercase tracking-[0.3em] border-b border-border-main">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main">
              {filteredPayments.map(payment => {
                const loan = loans.find(l => l.id === payment.loanId);
                return (
                  <tr key={payment.id} className="group hover:bg-text-main/5 transition-all duration-500">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-text-muted tracking-tight">{formatDateTime(payment.date).split(' ')[0]}</span>
                        <span className="text-[7px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{formatDateTime(payment.date).split(' ')[1]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-display font-black text-text-main text-xs tracking-tight group-hover:text-brand-600 transition-colors duration-500">
                        {loan?.customerName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-display font-black text-brand-600 text-sm tracking-tighter group-hover:scale-110 inline-block transition-transform duration-500">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[9px] font-bold text-text-muted max-w-[150px] truncate italic bg-text-main/5 px-2 py-1 rounded-lg border border-border-main group-hover:border-text-main/30 transition-colors duration-500">
                        {payment.notes || '-'}
                      </p>
                    </td>
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30 group">
                      <div className="p-3 bg-text-main/5 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-700">
                        <Calendar size={32} className="text-text-muted" strokeWidth={1.5} />
                      </div>
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-text-muted">Nenhum pagamento encontrado</p>
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
