import React from 'react';
import { TrendingUp, HandCoins, DollarSign, CheckCircle2 } from 'lucide-react';
import { Loan, Customer, Payment } from '../types';
import { formatCurrency } from '../utils/formatters';
import { StatCard } from '../components/Common/StatCard';

interface DashboardViewProps {
  loans: Loan[];
  customers: Customer[];
  payments: Payment[];
}

export function DashboardView({ loans, customers, payments }: DashboardViewProps) {
  const totalLent = loans.reduce((acc, l) => acc + l.amount, 0);
  const totalToReceive = loans.reduce((acc, l) => acc + l.remainingAmount, 0);
  const totalReceived = payments.reduce((acc, p) => acc + p.amount, 0);
  const activeCount = loans.filter(l => l.status === 'active').length;

  const stats = [
    { label: 'Total Emprestado', value: formatCurrency(totalLent), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'A Receber', value: formatCurrency(totalToReceive), icon: HandCoins, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Recebido', value: formatCurrency(totalReceived), icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Empréstimos Ativos', value: activeCount.toString(), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Últimos Empréstimos</h3>
          <div className="space-y-4">
            {loans.slice(-5).reverse().map(loan => (
              <div key={loan.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                    {loan.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{loan.customerName}</p>
                    <p className="text-xs text-neutral-500">{new Date(loan.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="font-bold text-emerald-600">{formatCurrency(loan.amount)}</p>
              </div>
            ))}
            {loans.length === 0 && <p className="text-center text-neutral-400 py-4">Nenhum empréstimo registrado.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Resumo de Atividade</h3>
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-blue-50 rounded-xl flex items-center justify-between">
              <span className="text-blue-700 font-medium">Clientes Cadastrados</span>
              <span className="text-2xl font-bold text-blue-800">{customers.length}</span>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl flex items-center justify-between">
              <span className="text-emerald-700 font-medium">Pagamentos Realizados</span>
              <span className="text-2xl font-bold text-emerald-800">{payments.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
