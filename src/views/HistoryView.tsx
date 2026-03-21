import React from 'react';
import { Payment, Loan } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';

interface HistoryViewProps {
  payments: Payment[];
  loans: Loan[];
}

export function HistoryView({ payments, loans }: HistoryViewProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-neutral-100">
        <h3 className="font-semibold">Histórico de Pagamentos</h3>
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
            {payments.slice().reverse().map(payment => {
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
            {payments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-neutral-400">Nenhum pagamento registrado ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
