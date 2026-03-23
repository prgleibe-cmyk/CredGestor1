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
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-900/40 backdrop-blur-xl overflow-hidden"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%", opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: "100%", opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-3xl rounded-t-[4rem] md:rounded-[4rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] flex flex-col h-[94vh] md:h-auto md:max-h-[92vh] border-t md:border border-slate-200 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        
        {/* Header */}
        <div className="p-8 md:p-10 border-b border-slate-200 flex flex-col gap-8 shrink-0 bg-slate-900/5 rounded-t-[4rem] md:rounded-t-[4rem] relative z-10">
          <div className="w-20 h-1.5 bg-slate-900/10 rounded-full mx-auto mb-2 md:hidden shadow-inner" />
          <div className="flex justify-between items-center gap-6">
            <div className="flex items-center gap-6 min-w-0 flex-1">
              <div className="relative group shrink-0">
                <div className="absolute -inset-2 bg-emerald-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative w-16 h-16 md:w-20 md:h-20 bg-emerald-600 text-white rounded-3xl flex items-center justify-center text-2xl md:text-3xl font-black shadow-2xl shadow-emerald-500/30 border border-slate-200">
                  {customer.name.charAt(0)}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-2xl md:text-4xl font-display font-black text-slate-900 leading-tight truncate tracking-tighter">{customer.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-slate-500 font-mono bg-slate-900/5 px-3 py-1 rounded-xl border border-slate-200 shadow-inner">{customer.document}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                  <span className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em]">Cliente Ativo</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => onDelete(customer.id)}
                className="p-4 btn-gradient-red text-white rounded-2xl transition-all hover:scale-110 active:scale-90 border border-slate-200 shadow-inner"
                title="Excluir Cliente"
              >
                <Trash2 size={24} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => onEdit(customer)}
                className="p-4 btn-gradient text-white rounded-2xl transition-all hover:scale-110 active:scale-90 border border-slate-200 shadow-inner"
                title="Editar Cliente"
              >
                <Edit2 size={24} strokeWidth={2.5} />
              </button>
              <button 
                onClick={onClose} 
                className="p-4 btn-gradient-slate text-white rounded-2xl transition-all hover:scale-110 active:scale-90 border border-slate-200 shadow-inner"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>
          </div>
 
          {/* Tab Navigation */}
          <div className="flex p-2 bg-slate-900/5 rounded-[2rem] gap-2 border border-slate-200 shadow-inner relative overflow-hidden">
            <button 
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-4 px-6 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden group ${
                activeTab === 'details' 
                  ? 'text-white shadow-2xl shadow-emerald-500/20' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {activeTab === 'details' && (
                <motion.div layoutId="modalTab" className="absolute inset-0 btn-gradient rounded-[1.5rem] -z-10" />
              )}
              <Eye size={18} strokeWidth={3} />
              <span>Visão Geral</span>
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-6 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden group ${
                activeTab === 'history' 
                  ? 'text-white shadow-2xl shadow-emerald-500/20' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {activeTab === 'history' && (
                <motion.div layoutId="modalTab" className="absolute inset-0 btn-gradient rounded-[1.5rem] -z-10" />
              )}
              <HistoryIcon size={18} strokeWidth={3} />
              <span>Histórico</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 relative z-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'details' ? (
              <motion.div 
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-10"
              >
                {lastLoan ? (
                  <>
                    {selectedInstallment ? (
                      <motion.div 
                        key="installment-detail"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900/5 rounded-[3rem] border border-slate-200 p-10 space-y-8 shadow-2xl relative overflow-hidden group shadow-inner"
                      >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
                        
                        <div className="flex justify-between items-center relative z-10">
                          <button 
                            onClick={() => setSelectedInstallmentNumber(null)}
                            className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all btn-gradient-slate px-6 py-3 rounded-2xl shadow-inner border border-slate-200 active:scale-95"
                          >
                            <ArrowLeft size={18} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
                            Voltar ao Cronograma
                          </button>
                          <span className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border shadow-inner ${
                            selectedInstallment.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                            selectedInstallment.status === 'overdue' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                            selectedInstallment.status === 'upcoming' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                            'bg-slate-900/5 text-slate-500 border-slate-200'
                          }`}>
                            Parcela #{selectedInstallment.number} • {
                              selectedInstallment.status === 'paid' ? 'Pago' :
                              selectedInstallment.status === 'overdue' ? 'Atrasado' :
                              selectedInstallment.status === 'upcoming' ? 'Próximo' : 'Pendente'
                            }
                          </span>
                        </div>
 
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                          <div className="bg-slate-900/5 p-8 rounded-[2rem] border border-slate-200 shadow-inner group/card hover:bg-slate-900/10 transition-all">
                            <p className="text-[11px] uppercase font-black text-slate-500 tracking-[0.3em] mb-2 group-hover/card:text-emerald-600 transition-colors">Data de Vencimento</p>
                            <p className="text-3xl font-display font-black text-slate-900">{formatDate(selectedInstallment.date.toISOString())}</p>
                          </div>
                          <div className="bg-slate-900/5 p-8 rounded-[2rem] border border-slate-200 shadow-inner group/card hover:bg-slate-900/10 transition-all">
                            <p className="text-[11px] uppercase font-black text-slate-500 tracking-[0.3em] mb-2 group-hover/card:text-emerald-600 transition-colors">Valor da Parcela</p>
                            <p className="text-3xl font-display font-black text-emerald-600">{formatCurrency(selectedInstallment.amount)}</p>
                          </div>
                        </div>
 
                        <div className="bg-slate-900/5 p-8 rounded-[2rem] border border-slate-200 shadow-inner relative z-10">
                          <p className="text-[11px] uppercase font-black text-slate-500 tracking-[0.3em] mb-6">Status Detalhado</p>
                          <div className="flex items-start gap-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
                              selectedInstallment.status === 'paid' ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/20' :
                              selectedInstallment.status === 'overdue' ? 'bg-red-500/20 text-red-600 border-red-500/20' :
                              'bg-blue-500/20 text-blue-600 border-blue-500/20'
                            }`}>
                              {selectedInstallment.status === 'paid' ? <CheckCircle2 size={32} strokeWidth={2.5} /> :
                               selectedInstallment.status === 'overdue' ? <AlertCircle size={32} strokeWidth={2.5} /> :
                               <Clock size={32} strokeWidth={2.5} />}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-xl tracking-tight">
                                {selectedInstallment.status === 'paid' ? 'Pagamento Confirmado' :
                                 selectedInstallment.status === 'overdue' ? 'Pagamento em Atraso' :
                                 'Aguardando Pagamento'}
                              </p>
                              <p className="text-base text-slate-500 font-bold mt-2 leading-relaxed">
                                {selectedInstallment.status === 'paid' ? 'Esta parcela foi quitada e processada no sistema.' :
                                 selectedInstallment.status === 'overdue' ? `Esta parcela está vencida há ${differenceInDays(new Date(), selectedInstallment.date)} dias.` :
                                 `O vencimento está programado para ${formatDate(selectedInstallment.date.toISOString())}.`}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {selectedInstallment.status !== 'paid' && (
                          <div className="relative z-10">
                            <button 
                              onClick={() => {
                                onRegisterPayment(lastLoan);
                                setSelectedInstallmentNumber(null);
                              }}
                              className="relative overflow-hidden w-full py-6 btn-gradient text-white text-[12px] font-black uppercase tracking-[0.3em] rounded-[1.5rem] flex items-center justify-center gap-4 group/btn active:scale-[0.98]"
                            >
                              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
                              <DollarSign size={24} strokeWidth={2.5} className="relative z-10 group-hover/btn:scale-110 transition-transform" />
                              <span className="relative z-10">Registrar Pagamento Agora</span>
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <div className="space-y-10">
                        {/* Loan Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {[
                            { label: 'Total', value: formatCurrency(lastLoan.totalToPay), bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' },
                            { label: 'Pago', value: formatCurrency(lastLoan.totalToPay - lastLoan.remainingAmount), bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
                            { label: 'Saldo', value: formatCurrency(lastLoan.remainingAmount), bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
                            { label: 'Parcelas', value: `${lastLoan.installmentsCount}x`, bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20' }
                          ].map((item, i) => (
                            <div key={i} className={`${item.bg} p-6 rounded-[2rem] border ${item.border} shadow-inner group hover:scale-105 transition-transform duration-500`}>
                              <p className={`text-[11px] uppercase font-black ${item.text} tracking-[0.3em] mb-2 opacity-70`}>{item.label}</p>
                              <p className={`text-xl font-display font-black ${item.text}`}>{item.value}</p>
                            </div>
                          ))}
                        </div>
 
                        {/* Installments Grid */}
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h4 className="font-display font-black text-slate-900 flex items-center gap-4 text-xl tracking-tighter">
                              <Calendar size={24} strokeWidth={2.5} className="text-emerald-500" />
                              Cronograma de Pagamentos
                            </h4>
                            <div className="flex gap-4 text-[10px] font-black uppercase tracking-[0.2em]">
                              <span className="flex items-center gap-2 text-emerald-600"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" /> Pago</span>
                              <span className="flex items-center gap-2 text-red-600"><div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse" /> Atrasado</span>
                            </div>
                          </div>
 
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {installments.map((inst) => (
                              <button 
                                key={inst.number}
                                onClick={() => setSelectedInstallmentNumber(inst.number)}
                                className={`relative p-6 rounded-[2.5rem] border-2 transition-all text-left group overflow-hidden shadow-inner ${
                                  inst.status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/20' :
                                  inst.status === 'overdue' ? 'bg-red-500/10 border-red-500/20' :
                                  inst.status === 'upcoming' ? 'bg-blue-500/10 border-blue-500/20 ring-8 ring-blue-500/5' :
                                  'bg-slate-900/5 border-slate-200'
                                } hover:scale-[1.05] active:scale-95`}
                              >
                                <div className="flex justify-between items-start mb-3 relative z-10">
                                  <span className={`text-[10px] font-black px-3 py-1 rounded-xl shadow-inner ${
                                    inst.status === 'paid' ? 'bg-emerald-500/20 text-emerald-600' :
                                    inst.status === 'overdue' ? 'bg-red-500/20 text-red-600' :
                                    inst.status === 'upcoming' ? 'bg-blue-500/20 text-blue-600' :
                                    'bg-slate-900/10 text-slate-500'
                                  }`}>
                                    #{inst.number}
                                  </span>
                                  <div className="transition-transform group-hover:scale-125 duration-500">
                                    {inst.status === 'paid' && <CheckCircle2 size={20} strokeWidth={2.5} className="text-emerald-600" />}
                                    {inst.status === 'overdue' && <AlertCircle size={20} strokeWidth={2.5} className="text-red-600" />}
                                    {inst.status === 'upcoming' && <Clock size={20} strokeWidth={2.5} className="text-blue-600" />}
                                  </div>
                                </div>
                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest relative z-10">{formatDate(inst.date.toISOString())}</p>
                                <p className="text-lg font-display font-black text-slate-900 mt-1 relative z-10">{formatCurrency(inst.amount)}</p>
                                
                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors" />
                              </button>
                            ))}
                          </div>
                        </div>
 
                        {/* Quick Actions */}
                        <div className="pt-6 space-y-5">
                          <button 
                            onClick={() => onRegisterPayment(lastLoan)}
                            className="relative overflow-hidden w-full py-6 btn-gradient text-white font-black rounded-[2rem] flex items-center justify-center gap-6 group active:scale-[0.98]"
                          >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                            <div className="bg-white/10 p-3 rounded-2xl group-hover:scale-110 transition-transform relative z-10 shadow-inner">
                              <DollarSign size={24} strokeWidth={2.5} />
                            </div>
                            <div className="text-left relative z-10">
                              <p className="text-[11px] opacity-60 uppercase font-black tracking-[0.3em] leading-none mb-2">Ação Rápida</p>
                              <p className="text-2xl font-display font-black leading-none tracking-tighter">Registrar Recebimento</p>
                            </div>
                            <ArrowRight size={24} strokeWidth={2.5} className="ml-auto opacity-40 group-hover:translate-x-3 transition-transform relative z-10" />
                          </button>
                          
                          <button 
                            onClick={onClose}
                            className="w-full py-5 btn-gradient-slate text-white font-black uppercase text-[11px] tracking-[0.3em] rounded-[2rem] transition-all flex items-center justify-center gap-4 group border border-slate-200 shadow-inner active:scale-95"
                          >
                            <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-2 transition-transform" />
                            <span>Fechar Detalhes</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                    <div className="w-32 h-32 bg-slate-900/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-200 shadow-inner">
                      <Calendar size={64} strokeWidth={1} className="opacity-20" />
                    </div>
                    <p className="font-black text-2xl text-slate-400 mb-10 uppercase tracking-[0.3em]">Nenhum empréstimo ativo</p>
                    <button 
                      onClick={onClose}
                      className="w-full max-w-xs py-5 btn-gradient-slate text-white font-black uppercase text-[11px] tracking-[0.3em] rounded-[2rem] transition-all flex items-center justify-center gap-4 border border-slate-200 shadow-inner active:scale-95"
                    >
                      <ArrowLeft size={20} strokeWidth={2.5} />
                      <span>Voltar à Lista</span>
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-display font-black text-slate-900 flex items-center gap-4 text-xl tracking-tighter accent-glow">
                    <HistoryIcon size={24} strokeWidth={2.5} className="text-emerald-500" />
                    Extrato de Pagamentos
                  </h4>
                  <span className="px-5 py-2 bg-slate-900/5 text-slate-500 text-[11px] font-black uppercase rounded-full tracking-[0.2em] border border-slate-200 shadow-inner">
                    {enrichedPayments.length} Registros
                  </span>
                </div>
                
                {enrichedPayments.length > 0 ? (
                  <div className="space-y-4">
                    {enrichedPayments.map((payment) => (
                      <div 
                        key={payment.id}
                        className={`p-6 rounded-[2.5rem] border transition-all flex justify-between items-center group hover:bg-slate-900/5 shadow-inner ${
                          payment.isLate 
                            ? 'bg-red-500/10 border-red-500/20' 
                            : 'bg-slate-900/5 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 border shadow-inner ${
                            payment.isLate ? 'bg-red-500/20 text-red-600 border-red-500/20' : 'bg-emerald-500/20 text-emerald-600 border-emerald-500/20'
                          }`}>
                            <DollarSign size={24} strokeWidth={2.5} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-xl tracking-tight">{formatCurrency(payment.amount)}</p>
                            <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">{formatDate(payment.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {payment.isLate ? (
                            <span className="inline-flex items-center px-4 py-1.5 bg-red-500/20 text-red-600 text-[10px] font-black uppercase rounded-full border border-red-500/20 shadow-inner">
                              <AlertCircle size={12} strokeWidth={3} className="mr-2" />
                              Atrasado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-4 py-1.5 bg-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-500/20 shadow-inner">
                              <CheckCircle2 size={12} strokeWidth={3} className="mr-2" />
                              No Prazo
                            </span>
                          )}
                          {payment.notes && (
                            <p className="text-[11px] text-slate-500 mt-2 italic max-w-[200px] truncate font-medium">"{payment.notes}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={onClose}
                      className="w-full py-5 bg-slate-900/5 text-slate-500 font-black uppercase text-[11px] tracking-[0.3em] rounded-[2rem] hover:bg-slate-900/10 transition-all flex items-center justify-center gap-4 mt-10 border border-slate-200 shadow-inner active:scale-95"
                    >
                      <ArrowLeft size={20} strokeWidth={2.5} />
                      <span>Fechar Histórico</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                    <div className="w-32 h-32 bg-slate-900/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-200 shadow-inner">
                      <HistoryIcon size={64} strokeWidth={1} className="opacity-20" />
                    </div>
                    <p className="font-black text-2xl text-slate-400 mb-10 uppercase tracking-[0.3em]">Nenhum pagamento registrado</p>
                    <button 
                      onClick={onClose}
                      className="w-full max-w-xs py-5 btn-gradient-slate text-white font-black uppercase text-[11px] tracking-[0.3em] rounded-[2rem] transition-all flex items-center justify-center gap-4 border border-slate-200 shadow-inner active:scale-95"
                    >
                      <ArrowLeft size={20} strokeWidth={2.5} />
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
