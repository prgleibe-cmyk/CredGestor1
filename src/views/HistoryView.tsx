import React, { useState, useMemo } from 'react';
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
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Total no Período</p>
            <h3 className="text-2xl font-bold text-neutral-800">{formatCurrency(totalInPeriod)}</h3>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-neutral-500 mr-2">
          <Filter size={18} />
          <span className="text-sm font-medium">Filtrar por:</span>
        </div>
        <div className="flex p-1 bg-neutral-100 rounded-xl">
          <button
            onClick={() => setPeriod('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === 'today' ? 'bg-white text-emerald-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === 'week' ? 'bg-white text-emerald-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === 'month' ? 'bg-white text-emerald-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Este Mês
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === 'all' ? 'bg-white text-emerald-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Tudo
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar size={18} className="text-neutral-400" />
            Histórico de Pagamentos
          </h3>
          <span className="text-sm text-neutral-400">{filteredPayments.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Valor</th>
                <th className="px-6 py-4 font-medium">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredPayments.map(payment => {
                const loan = loans.find(l => l.id === payment.loanId);
                return (
                  <tr key={payment.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {formatDateTime(payment.date)}
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-700">{loan?.customerName || 'N/A'}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(payment.amount)}</td>
                    <td className="px-6 py-4 text-sm text-neutral-500">{payment.notes || '-'}</td>
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-400">Nenhum pagamento encontrado para este período.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
