import React, { useMemo, useState } from 'react';
import { X, Calendar, CheckCircle2, Clock, AlertCircle, DollarSign, ArrowRight, Trash2, Edit2, History as HistoryIcon, ArrowLeft, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer, Loan, Payment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { addDays, addWeeks, addMonths, isBefore, isSameDay, startOfDay, differenceInDays } from 'date-fns';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  loans: Loan[];
  payments: Payment[];
  onRegisterPayment: (loan: Loan) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
}

type ModalView = 'details' | 'history';

export function CustomerDetailsModal({ 
  isOpen, 
  onClose, 
  customer, 
  loans, 
  payments,
  onRegisterPayment,
  onEdit,
  onDelete
}: CustomerDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<ModalView>('details');
  
  const customerLoans = useMemo(() => {
    if (!customer) return [];
    return loans.filter(l => l.customerId === customer.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [customer, loans]);

  const lastLoan = customerLoans[0];

  const customerPayments = useMemo(() => {
    if (!customer) return [];
    const loanIds = customerLoans.map(l => l.id);
    return payments.filter(p => loanIds.includes(p.loanId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [customer, customerLoans, payments]);

  // Logic to determine if a payment was late
  const enrichedPayments = useMemo(() => {
    return customerPayments.map(payment => {
      const loan = loans.find(l => l.id === payment.loanId);
      if (!loan) return { ...payment, isLate: false };

      // Find which installment this payment belongs to
      // This is an approximation: find all payments for this loan before this one
      const previousPayments = payments
        .filter(p => p.loanId === payment.loanId && new Date(p.date).getTime() < new Date(payment.date).getTime())
        .reduce((sum, p) => sum + p.amount, 0);
      
      const installmentValue = loan.totalToPay / loan.installmentsCount;
      const installmentIndex = Math.floor(previousPayments / installmentValue);
      
      let expectedDate = new Date(loan.startDate);
      if (loan.frequency === 'daily') expectedDate = addDays(expectedDate, installmentIndex);
      else if (loan.frequency === 'weekly') expectedDate = addWeeks(expectedDate, installmentIndex);
      else if (loan.frequency === 'monthly') expectedDate = addMonths(expectedDate, installmentIndex);

      const isLate = isBefore(startOfDay(expectedDate), startOfDay(new Date(payment.date))) && !isSameDay(expectedDate, new Date(payment.date));
      
      return { ...payment, isLate };
    });
  }, [customerPayments, loans, payments]);

  const installments = useMemo(() => {
    if (!lastLoan) return [];
    
    const list = [];
    const installmentValue = lastLoan.totalToPay / lastLoan.installmentsCount;
    const loanPayments = payments.filter(p => p.loanId === lastLoan.id);
    const totalPaid = loanPayments.reduce((sum, p) => sum + p.amount, 0);
    
    let currentPaidAmount = totalPaid;
    let currentDate = new Date(lastLoan.startDate);

    for (let i = 1; i <= lastLoan.installmentsCount; i++) {
      const isPaid = currentPaidAmount >= installmentValue - 0.01; // Tolerance for floats
      const isOverdue = !isPaid && isBefore(currentDate, startOfDay(new Date())) && !isSameDay(currentDate, new Date());
      const isUpcoming = !isPaid && !isOverdue && isBefore(currentDate, addDays(new Date(), 7));
      
      list.push({
        number: i,
        date: new Date(currentDate),
        amount: installmentValue,
        status: isPaid ? 'paid' : isOverdue ? 'overdue' : isUpcoming ? 'upcoming' : 'pending'
      });

      if (isPaid) currentPaidAmount -= installmentValue;
      
      // Advance date based on frequency
      if (lastLoan.frequency === 'daily') currentDate = addDays(currentDate, 1);
      else if (lastLoan.frequency === 'weekly') currentDate = addWeeks(currentDate, 1);
      else if (lastLoan.frequency === 'monthly') currentDate = addMonths(currentDate, 1);
    }

    return list;
  }, [lastLoan, payments]);

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-hidden">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex flex-col gap-4 shrink-0 bg-neutral-50/50">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-100">
                {customer.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-800">{customer.name}</h3>
                <p className="text-sm text-neutral-500 font-mono">{customer.document}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onDelete(customer.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Excluir Cliente"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={() => onEdit(customer)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                title="Editar Cliente"
              >
                <Edit2 size={20} />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Sub-header Actions */}
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'details' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-white text-neutral-500 border border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <Eye size={16} />
              Detalhes
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'history' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-white text-neutral-500 border border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <HistoryIcon size={16} />
              Histórico
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'details' ? (
              <motion.div 
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {lastLoan ? (
                  <>
                    {/* Loan Summary Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider mb-1">Total do Empréstimo</p>
                        <p className="text-xl font-black text-emerald-800">{formatCurrency(lastLoan.totalToPay)}</p>
                      </div>
                      <div className="bg-emerald-100 p-4 rounded-2xl border border-emerald-200">
                        <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider mb-1">Total Pago</p>
                        <p className="text-xl font-black text-emerald-900">{formatCurrency(lastLoan.totalToPay - lastLoan.remainingAmount)}</p>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                        <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider mb-1">Saldo Devedor</p>
                        <p className="text-xl font-black text-amber-800">{formatCurrency(lastLoan.remainingAmount)}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider mb-1">Parcelas</p>
                        <p className="text-xl font-black text-blue-800">{lastLoan.installmentsCount}x</p>
                      </div>
                    </div>

                    {/* Installments Interactive Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-neutral-700 flex items-center gap-2">
                          <Calendar size={18} className="text-emerald-600" />
                          Cronograma de Pagamentos
                        </h4>
                        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-tighter">
                          <span className="flex items-center gap-1 text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Pago</span>
                          <span className="flex items-center gap-1 text-red-600"><div className="w-2 h-2 rounded-full bg-red-500" /> Atrasado</span>
                          <span className="flex items-center gap-1 text-blue-600"><div className="w-2 h-2 rounded-full bg-blue-500" /> Próximo</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {installments.map((inst) => (
                          <div 
                            key={inst.number}
                            className={`relative p-3 rounded-2xl border-2 transition-all ${
                              inst.status === 'paid' ? 'bg-emerald-50 border-emerald-200' :
                              inst.status === 'overdue' ? 'bg-red-50 border-red-200 animate-pulse' :
                              inst.status === 'upcoming' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' :
                              'bg-neutral-50 border-neutral-100'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                inst.status === 'paid' ? 'bg-emerald-200 text-emerald-800' :
                                inst.status === 'overdue' ? 'bg-red-200 text-red-800' :
                                inst.status === 'upcoming' ? 'bg-blue-200 text-blue-800' :
                                'bg-neutral-200 text-neutral-600'
                              }`}>
                                #{inst.number}
                              </span>
                              {inst.status === 'paid' && <CheckCircle2 size={14} className="text-emerald-600" />}
                              {inst.status === 'overdue' && <AlertCircle size={14} className="text-red-600" />}
                              {inst.status === 'upcoming' && <Clock size={14} className="text-blue-600" />}
                            </div>
                            <p className="text-xs font-bold text-neutral-800">{formatDate(inst.date.toISOString())}</p>
                            <p className="text-sm font-black text-neutral-900 mt-1">{formatCurrency(inst.amount)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Action */}
                    <div className="pt-4">
                      <button 
                        onClick={() => onRegisterPayment(lastLoan)}
                        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 group"
                      >
                        <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                          <DollarSign size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs opacity-80 uppercase tracking-widest">Ação Rápida</p>
                          <p className="text-lg">Registrar Recebimento</p>
                        </div>
                        <ArrowRight size={20} className="ml-auto opacity-50 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                      <Calendar size={40} />
                    </div>
                    <p className="font-medium">Nenhum empréstimo ativo encontrado.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h4 className="font-bold text-neutral-700 flex items-center gap-2 mb-4">
                  <HistoryIcon size={18} className="text-emerald-600" />
                  Extrato de Pagamentos
                </h4>
                
                {enrichedPayments.length > 0 ? (
                  <div className="space-y-3">
                    {enrichedPayments.map((payment) => (
                      <div 
                        key={payment.id}
                        className={`p-4 rounded-2xl border transition-all flex justify-between items-center ${
                          payment.isLate 
                            ? 'bg-red-50 border-red-100 ring-1 ring-red-200' 
                            : 'bg-white border-neutral-100'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            payment.isLate ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            <DollarSign size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-neutral-800">{formatCurrency(payment.amount)}</p>
                            <p className="text-xs text-neutral-500">{formatDate(payment.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {payment.isLate ? (
                            <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 px-2 py-1 rounded-md">
                              Pago com Atraso
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">
                              No Prazo
                            </span>
                          )}
                          {payment.notes && (
                            <p className="text-[10px] text-neutral-400 mt-1 italic max-w-[150px] truncate">{payment.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                    <HistoryIcon size={40} className="mb-4 opacity-20" />
                    <p className="font-medium">Nenhum pagamento registrado.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
