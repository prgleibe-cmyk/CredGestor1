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
  const [selectedInstallmentNumber, setSelectedInstallmentNumber] = useState<number | null>(null);
  
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

  const selectedInstallment = useMemo(() => {
    if (selectedInstallmentNumber === null) return null;
    return installments.find(i => i.number === selectedInstallmentNumber);
  }, [selectedInstallmentNumber, installments]);

  if (!isOpen || !customer) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-md overflow-hidden"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-t-[3rem] md:rounded-[3rem] shadow-2xl flex flex-col h-[94vh] md:h-auto md:max-h-[92vh] border-t md:border border-slate-200/60 relative"
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col gap-6 shrink-0 bg-slate-50/50 rounded-t-[3rem] md:rounded-t-[3rem]">
          <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mb-2 md:hidden" />
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="relative group shrink-0">
                <div className="absolute -inset-1 bg-brand-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative w-12 h-12 md:w-16 md:h-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center text-xl md:text-2xl font-black shadow-lg shadow-brand-100">
                  {customer.name.charAt(0)}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl md:text-2xl font-display font-extrabold text-slate-900 leading-tight truncate tracking-tight">{customer.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/50">{customer.document}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Cliente Ativo</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => onDelete(customer.id)}
                className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all hover:scale-110 active:scale-90"
                title="Excluir Cliente"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={() => onEdit(customer)}
                className="p-3 text-blue-500 hover:bg-blue-50 rounded-2xl transition-all hover:scale-110 active:scale-90"
                title="Editar Cliente"
              >
                <Edit2 size={20} />
              </button>
              <button 
                onClick={onClose} 
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all text-slate-500 hover:scale-110 active:scale-90"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex p-1.5 bg-slate-100 rounded-[1.5rem] gap-1">
            <button 
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 px-4 rounded-[1.25rem] text-sm font-bold transition-all flex items-center justify-center gap-2.5 ${
                activeTab === 'details' 
                  ? 'bg-white text-brand-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Eye size={16} strokeWidth={2.5} />
              <span>Visão Geral</span>
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 px-4 rounded-[1.25rem] text-sm font-bold transition-all flex items-center justify-center gap-2.5 ${
                activeTab === 'history' 
                  ? 'bg-white text-brand-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <HistoryIcon size={16} strokeWidth={2.5} />
              <span>Histórico</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'details' ? (
              <motion.div 
                key="details"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {lastLoan ? (
                  <>
                    {selectedInstallment ? (
                      <motion.div 
                        key="installment-detail"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-50/50 rounded-[2.5rem] border border-slate-200/60 p-8 space-y-6 neo-shadow"
                      >
                        <div className="flex justify-between items-center">
                          <button 
                            onClick={() => setSelectedInstallmentNumber(null)}
                            className="group flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100"
                          >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Voltar ao Cronograma
                          </button>
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                            selectedInstallment.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            selectedInstallment.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-100' :
                            selectedInstallment.status === 'upcoming' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            Parcela #{selectedInstallment.number} • {
                              selectedInstallment.status === 'paid' ? 'Pago' :
                              selectedInstallment.status === 'overdue' ? 'Atrasado' :
                              selectedInstallment.status === 'upcoming' ? 'Próximo' : 'Pendente'
                            }
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Data de Vencimento</p>
                            <p className="text-2xl font-display font-black text-slate-900">{formatDate(selectedInstallment.date.toISOString())}</p>
                          </div>
                          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Valor da Parcela</p>
                            <p className="text-2xl font-display font-black text-brand-600">{formatCurrency(selectedInstallment.amount)}</p>
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">Status Detalhado</p>
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                              selectedInstallment.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                              selectedInstallment.status === 'overdue' ? 'bg-red-50 text-red-600' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                              {selectedInstallment.status === 'paid' ? <CheckCircle2 size={24} /> :
                               selectedInstallment.status === 'overdue' ? <AlertCircle size={24} /> :
                               <Clock size={24} />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-base">
                                {selectedInstallment.status === 'paid' ? 'Pagamento Confirmado' :
                                 selectedInstallment.status === 'overdue' ? 'Pagamento em Atraso' :
                                 'Aguardando Pagamento'}
                              </p>
                              <p className="text-sm text-slate-500 font-medium mt-1">
                                {selectedInstallment.status === 'paid' ? 'Esta parcela foi quitada e processada no sistema.' :
                                 selectedInstallment.status === 'overdue' ? `Esta parcela está vencida há ${differenceInDays(new Date(), selectedInstallment.date)} dias.` :
                                 `O vencimento está programado para ${formatDate(selectedInstallment.date.toISOString())}.`}
                              </p>
                            </div>
                          </div>
                        </div>

                        {selectedInstallment.status !== 'paid' && (
                          <button 
                            onClick={() => {
                              onRegisterPayment(lastLoan);
                              setSelectedInstallmentNumber(null);
                            }}
                            className="w-full py-5 bg-brand-600 text-white font-black rounded-[2rem] hover:bg-brand-700 transition-all shadow-xl shadow-brand-100 flex items-center justify-center gap-3 group active:scale-[0.98]"
                          >
                            <DollarSign size={20} className="group-hover:scale-110 transition-transform" />
                            <span>Registrar Pagamento Agora</span>
                          </button>
                        )}
                      </motion.div>
                    ) : (
                      <>
                        {/* Loan Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { label: 'Total', value: formatCurrency(lastLoan.totalToPay), bg: 'bg-brand-50', text: 'text-brand-700', border: 'border-brand-100' },
                            { label: 'Pago', value: formatCurrency(lastLoan.totalToPay - lastLoan.remainingAmount), bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
                            { label: 'Saldo', value: formatCurrency(lastLoan.remainingAmount), bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
                            { label: 'Parcelas', value: `${lastLoan.installmentsCount}x`, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' }
                          ].map((item, i) => (
                            <div key={i} className={`${item.bg} p-4 rounded-[1.75rem] border ${item.border} neo-shadow-sm`}>
                              <p className={`text-[10px] uppercase font-black ${item.text} tracking-widest mb-1 opacity-70`}>{item.label}</p>
                              <p className={`text-lg font-display font-black ${item.text}`}>{item.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Installments Grid */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-display font-extrabold text-slate-900 flex items-center gap-3 text-lg tracking-tight">
                              <Calendar size={20} className="text-brand-600" />
                              Cronograma de Pagamentos
                            </h4>
                            <div className="flex gap-3 text-[10px] font-black uppercase tracking-tighter">
                              <span className="flex items-center gap-1.5 text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" /> Pago</span>
                              <span className="flex items-center gap-1.5 text-red-600"><div className="w-2 h-2 rounded-full bg-red-500 shadow-sm animate-pulse" /> Atrasado</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {installments.map((inst) => (
                              <button 
                                key={inst.number}
                                onClick={() => setSelectedInstallmentNumber(inst.number)}
                                className={`relative p-4 rounded-[2rem] border-2 transition-all text-left group overflow-hidden ${
                                  inst.status === 'paid' ? 'bg-emerald-50 border-emerald-200' :
                                  inst.status === 'overdue' ? 'bg-red-50 border-red-200' :
                                  inst.status === 'upcoming' ? 'bg-blue-50 border-blue-200 ring-4 ring-blue-50' :
                                  'bg-slate-50 border-slate-100'
                                } hover:scale-[1.05] active:scale-95 shadow-sm hover:shadow-md`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                                    inst.status === 'paid' ? 'bg-emerald-200 text-emerald-800' :
                                    inst.status === 'overdue' ? 'bg-red-200 text-red-800' :
                                    inst.status === 'upcoming' ? 'bg-blue-200 text-blue-800' :
                                    'bg-slate-200 text-slate-600'
                                  }`}>
                                    #{inst.number}
                                  </span>
                                  <div className="transition-transform group-hover:scale-125 duration-300">
                                    {inst.status === 'paid' && <CheckCircle2 size={16} className="text-emerald-600" />}
                                    {inst.status === 'overdue' && <AlertCircle size={16} className="text-red-600" />}
                                    {inst.status === 'upcoming' && <Clock size={16} className="text-blue-600" />}
                                  </div>
                                </div>
                                <p className="text-[11px] font-bold text-slate-800">{formatDate(inst.date.toISOString())}</p>
                                <p className="text-sm font-black text-slate-900 mt-1">{formatCurrency(inst.amount)}</p>
                                
                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="pt-4 space-y-4">
                          <button 
                            onClick={() => onRegisterPayment(lastLoan)}
                            className="w-full py-5 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-brand-600 transition-all duration-500 shadow-xl shadow-slate-200 hover:shadow-brand-200 flex items-center justify-center gap-4 group active:scale-[0.98]"
                          >
                            <div className="bg-white/10 p-2 rounded-2xl group-hover:scale-110 transition-transform">
                              <DollarSign size={20} />
                            </div>
                            <div className="text-left">
                              <p className="text-[10px] opacity-60 uppercase font-black tracking-widest leading-none mb-1">Ação Rápida</p>
                              <p className="text-lg font-display leading-none">Registrar Recebimento</p>
                            </div>
                            <ArrowRight size={20} className="ml-auto opacity-40 group-hover:translate-x-2 transition-transform" />
                          </button>
                          
                          <button 
                            onClick={onClose}
                            className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-[2rem] hover:bg-slate-200 transition-all flex items-center justify-center gap-3 group"
                          >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Fechar Detalhes</span>
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <Calendar size={48} className="opacity-20" />
                    </div>
                    <p className="font-bold text-xl text-slate-500 mb-8">Nenhum empréstimo ativo</p>
                    <button 
                      onClick={onClose}
                      className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-[2rem] hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                    >
                      <ArrowLeft size={20} />
                      <span>Voltar à Lista</span>
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-display font-extrabold text-slate-900 flex items-center gap-3 text-lg tracking-tight">
                    <HistoryIcon size={20} className="text-brand-600" />
                    Extrato de Pagamentos
                  </h4>
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-full tracking-widest">
                    {enrichedPayments.length} Registros
                  </span>
                </div>
                
                {enrichedPayments.length > 0 ? (
                  <div className="space-y-3">
                    {enrichedPayments.map((payment) => (
                      <div 
                        key={payment.id}
                        className={`p-5 rounded-[2rem] border transition-all flex justify-between items-center group hover:neo-shadow-sm ${
                          payment.isLate 
                            ? 'bg-red-50/50 border-red-100' 
                            : 'bg-white border-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                            payment.isLate ? 'bg-red-100 text-red-600' : 'bg-brand-50 text-brand-600'
                          }`}>
                            <DollarSign size={20} strokeWidth={2.5} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-base">{formatCurrency(payment.amount)}</p>
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{formatDate(payment.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {payment.isLate ? (
                            <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-full border border-red-200">
                              <AlertCircle size={10} className="mr-1.5" />
                              Atrasado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full border border-emerald-200">
                              <CheckCircle2 size={10} className="mr-1.5" />
                              No Prazo
                            </span>
                          )}
                          {payment.notes && (
                            <p className="text-[11px] text-slate-400 mt-1.5 italic max-w-[150px] truncate font-medium">"{payment.notes}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={onClose}
                      className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-[2rem] hover:bg-slate-200 transition-all flex items-center justify-center gap-3 mt-8"
                    >
                      <ArrowLeft size={20} />
                      <span>Fechar Histórico</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <HistoryIcon size={48} className="opacity-20" />
                    </div>
                    <p className="font-bold text-xl text-slate-500 mb-8">Nenhum pagamento registrado</p>
                    <button 
                      onClick={onClose}
                      className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-[2rem] hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                    >
                      <ArrowLeft size={20} />
                      <span>Voltar</span>
                    </button>
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
