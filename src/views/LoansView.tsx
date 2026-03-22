import React from 'react';
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
      {loans.map(loan => (
        <div key={loan.id} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold text-lg">{loan.customerName}</h4>
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
                {loan.frequency} • {loan.installmentsCount} parcelas • {loan.interestType === 'simple' ? 'Fixo' : 'Composto'}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
              loan.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 
              loan.status === 'paid' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
            }`}>
              {loan.status === 'active' ? 'Ativo' : loan.status === 'paid' ? 'Pago' : 'Atrasado'}
            </span>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Valor Original</span>
              <span className="font-semibold">{formatCurrency(loan.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Total com Juros</span>
              <span className="font-semibold">{formatCurrency(loan.totalToPay)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Saldo Restante</span>
              <span className="font-bold text-emerald-600">{formatCurrency(loan.remainingAmount)}</span>
            </div>
          </div>

          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden mb-6">
            <div 
              className="bg-emerald-500 h-full transition-all" 
              style={{ width: `${((loan.totalToPay - loan.remainingAmount) / loan.totalToPay) * 100}%` }}
            />
          </div>

          {loan.status !== 'paid' && (
            <button 
              onClick={() => onPayment(loan)}
              className="w-full py-2 bg-neutral-50 hover:bg-emerald-50 text-neutral-600 hover:text-emerald-700 font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-neutral-100"
            >
              <DollarSign size={16} />
              <span>Registrar Pagamento</span>
            </button>
          )}
        </div>
      ))}
      {loans.length === 0 && (
        <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-neutral-300">
          <HandCoins className="mx-auto text-neutral-300 mb-4" size={48} />
          <p className="text-neutral-500">Nenhum empréstimo ativo no momento.</p>
        </div>
      )}
    </div>
  );
}
