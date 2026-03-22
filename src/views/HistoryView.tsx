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
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-[2.5rem] neo-shadow flex items-center gap-5 border border-white/40"
        >
          <div className="p-4 bg-brand-500 rounded-2xl text-white shadow-lg shadow-brand-200">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Total no Período</p>
            <h3 className="text-3xl font-display font-black text-slate-900 leading-none tracking-tight">{formatCurrency(totalInPeriod)}</h3>
          </div>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-4 rounded-[2rem] neo-shadow flex flex-wrap items-center gap-4 border border-white/40"
      >
        <div className="flex items-center gap-3 text-slate-400 ml-2">
          <Filter size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Filtrar por:</span>
        </div>
        <div className="flex p-1.5 bg-slate-100/50 rounded-2xl backdrop-blur-sm border border-slate-200/50">
          {(['today', 'week', 'month', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                period === p 
                  ? 'bg-white text-brand-600 shadow-md shadow-brand-100/50 ring-1 ring-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              {p === 'today' ? 'Hoje' : p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Tudo'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-[2.5rem] neo-shadow overflow-hidden border border-white/40"
      >
        <div className="p-6 md:p-8 border-b border-slate-100/50 flex items-center justify-between bg-white/30">
          <h3 className="text-xl font-display font-black flex items-center gap-3 text-slate-900 tracking-tight">
            <Calendar size={22} className="text-brand-500" />
            Histórico de Pagamentos
          </h3>
          <span className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {filteredPayments.length} registros
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b border-slate-100/50">
                <th className="px-8 py-5">Data</th>
                <th className="px-8 py-5">Cliente</th>
                <th className="px-8 py-5">Valor</th>
                <th className="px-8 py-5">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredPayments.map(payment => {
                const loan = loans.find(l => l.id === payment.loanId);
                return (
                  <tr key={payment.id} className="group hover:bg-brand-50/30 transition-all">
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">
                      {formatDateTime(payment.date)}
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-display font-black text-slate-800 text-base tracking-tight group-hover:text-brand-600 transition-colors">
                        {loan?.customerName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-display font-black text-brand-600 text-lg tracking-tight">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-500 max-w-[250px] truncate italic bg-slate-50/50 px-3 py-1.5 rounded-lg border border-slate-100/50">
                        {payment.notes || '-'}
                      </p>
                    </td>
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <Calendar size={48} className="text-slate-400" />
                      <p className="text-sm font-black uppercase tracking-widest text-slate-500">Nenhum pagamento encontrado</p>
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
