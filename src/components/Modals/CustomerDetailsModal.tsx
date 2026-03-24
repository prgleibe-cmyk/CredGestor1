import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  History as HistoryIcon,
  Eye,
  Trash2,
  Edit2
} from 'lucide-react';
import { Customer, Loan, Payment, Installment } from '../../types';
import { formatCurrency, calculateCorrectedValue, differenceInDays, formatDate } from '../../lib/utils';

interface CustomerDetailsModalProps {
  customer: Customer;
  loans: Loan[];
  payments: Payment[];
  onClose: () => void;
  onRegisterPayment: (loan: Loan) => void;
  onDelete: (id: string) => void;
  onEdit: (customer: Customer) => void;
}

export function CustomerDetailsModal({ 
  customer, 
  loans, 
  payments, 
  onClose, 
  onRegisterPayment,
  onDelete,
  onEdit
}: CustomerDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [selectedInstallmentNumber, setSelectedInstallmentNumber] = useState<number | null>(null);

  const lastLoan = loans[0];
  
  const installments: Installment[] = lastLoan ? Array.from({ length: lastLoan.installmentsCount }, (_, i) => {
    const number = i + 1;
    const dueDate = new Date(lastLoan.startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    const amountPerInstallment = lastLoan.totalToPay / lastLoan.installmentsCount;
    const paidAmount = lastLoan.totalToPay - lastLoan.remainingAmount;
    const installmentsPaid = Math.floor(paidAmount / amountPerInstallment);
    
    let status: Installment['status'] = 'pending';
    if (number <= installmentsPaid) status = 'paid';
    else if (dueDate < new Date()) status = 'overdue';
    else if (number === installmentsPaid + 1) status = 'upcoming';

    return {
      number,
      date: dueDate,
      amount: amountPerInstallment,
      status
    };
  }) : [];

  const selectedInstallment = selectedInstallmentNumber 
    ? installments.find(i => i.number === selectedInstallmentNumber)
    : null;

  const enrichedPayments = payments
    .filter(p => p.customerId === customer.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(p => {
      const loan = loans.find(l => l.id === p.loanId);
      return {
        ...p,
        isLate: loan ? new Date(p.date) > new Date(loan.startDate) : false
      };
    });

  return (
    <div 
      className="fixed inset-0 z-[100] bg-text-main/40 backdrop-blur-xl overflow-hidden"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full h-full flex flex-col relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-border-main to-transparent"></div>
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-border-main flex flex-col gap-4 shrink-0 bg-text-main/5 relative z-10">
          <div className="w-20 h-1.5 bg-text-main/10 rounded-full mx-auto mb-1 md:hidden shadow-inner" />
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="relative group shrink-0">
                <div className="absolute -inset-2 bg-brand-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative w-12 h-12 md:w-16 md:h-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center text-xl md:text-2xl font-black shadow-xl shadow-brand-500/30 border border-border-main">
                  {customer.name.charAt(0)}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl md:text-3xl font-display font-black text-text-main leading-tight truncate tracking-tighter">{customer.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-text-muted font-mono bg-text-main/5 px-2 py-0.5 rounded-lg border border-border-main shadow-inner">{customer.document}</span>
                  <span className="w-1 h-1 rounded-full bg-brand-500 shadow-[0_0_10px_var(--accent-color)]"></span>
                  <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em]">Cliente Ativo</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => onDelete(customer.id)}
                className="p-3 btn-gradient-red text-white rounded-xl transition-all hover:scale-110 active:scale-90 border border-border-main shadow-inner"
                title="Excluir Cliente"
              >
                <Trash2 size={20} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => onEdit(customer)}
                className="p-3 btn-gradient text-white rounded-xl transition-all hover:scale-110 active:scale-90 border border-border-main shadow-inner"
                title="Editar Cliente"
              >
                <Edit2 size={20} strokeWidth={2.5} />
              </button>
              <button 
                onClick={onClose} 
                className="p-3 btn-gradient-slate text-white rounded-xl transition-all hover:scale-110 active:scale-90 border border-border-main shadow-inner"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>
 
          {/* Tab Navigation */}
          <div className="flex p-1 bg-text-main/5 rounded-2xl gap-1 border border-border-main shadow-inner relative overflow-hidden">
            <button 
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-2 relative overflow-hidden group ${
                activeTab === 'details' 
                  ? 'text-white shadow-xl shadow-brand-500/20' 
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {activeTab === 'details' && (
                <motion.div layoutId="modalTab" className="absolute inset-0 btn-gradient rounded-xl -z-10" />
              )}
              <Eye size={16} strokeWidth={3} />
              <span>Visão Geral</span>
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-2 relative overflow-hidden group ${
                activeTab === 'history' 
                  ? 'text-white shadow-xl shadow-brand-500/20' 
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {activeTab === 'history' && (
                <motion.div layoutId="modalTab" className="absolute inset-0 btn-gradient rounded-xl -z-10" />
              )}
              <HistoryIcon size={16} strokeWidth={3} />
              <span>Histórico</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 custom-scrollbar">
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
                        className="bg-text-main/5 rounded-[2.5rem] border border-border-main p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden group shadow-inner"
                      >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
                        
                        <div className="flex justify-between items-center relative z-10">
                          <button 
                            onClick={() => setSelectedInstallmentNumber(null)}
                            className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all btn-gradient-slate px-6 py-3 rounded-2xl shadow-inner border border-border-main active:scale-95"
                          >
                            <ArrowLeft size={18} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
                            Voltar ao Cronograma
                          </button>
                          <span className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border shadow-inner ${
                            selectedInstallment.status === 'paid' ? 'bg-brand-500/10 text-brand-600 border-brand-500/20' :
                            selectedInstallment.status === 'overdue' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                            selectedInstallment.status === 'upcoming' ? 'bg-brand-500/10 text-brand-600 border-brand-500/20' :
                            'bg-text-main/5 text-text-muted border-border-main'
                          }`}>
                            Parcela #{selectedInstallment.number} • {
                              selectedInstallment.status === 'paid' ? 'Pago' :
                              selectedInstallment.status === 'overdue' ? 'Atrasado' :
                              selectedInstallment.status === 'upcoming' ? 'Próximo' : 'Pendente'
                            }
                          </span>
                        </div>
 
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                          <div className="bg-text-main/5 p-6 rounded-[1.5rem] border border-border-main shadow-inner group/card hover:bg-text-main/10 transition-all">
                            <p className="text-[11px] uppercase font-black text-text-muted tracking-[0.3em] mb-2 group-hover/card:text-brand-600 transition-colors">Data de Vencimento</p>
                            <p className="text-3xl font-display font-black text-text-main">{formatDate(selectedInstallment.date.toISOString())}</p>
                          </div>
                          <div className="bg-text-main/5 p-6 rounded-[1.5rem] border border-border-main shadow-inner group/card hover:bg-text-main/10 transition-all">
                            <p className="text-[11px] uppercase font-black text-text-muted tracking-[0.3em] mb-2 group-hover/card:text-brand-600 transition-colors">Valor da Parcela</p>
                            <p className="text-3xl font-display font-black text-brand-600">{formatCurrency(selectedInstallment.amount)}</p>
                          </div>
                        </div>
 
                        <div className="bg-text-main/5 p-6 rounded-[1.5rem] border border-border-main shadow-inner relative z-10">
                          <p className="text-[11px] uppercase font-black text-text-muted tracking-[0.3em] mb-6">Status Detalhado</p>
                          <div className="flex items-start gap-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
                              selectedInstallment.status === 'paid' ? 'bg-brand-500/20 text-brand-600 border-brand-500/20' :
                              selectedInstallment.status === 'overdue' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                              'bg-brand-500/20 text-brand-600 border-brand-500/20'
                            }`}>
                              {selectedInstallment.status === 'paid' ? <CheckCircle2 size={32} strokeWidth={2.5} /> :
                               selectedInstallment.status === 'overdue' ? <AlertCircle size={32} strokeWidth={2.5} /> :
                               <Clock size={32} strokeWidth={2.5} />}
                            </div>
                            <div>
                              <p className="font-black text-text-main text-xl tracking-tight">
                                {selectedInstallment.status === 'paid' ? 'Pagamento Confirmado' :
                                 selectedInstallment.status === 'overdue' ? 'Pagamento em Atraso' :
                                 'Aguardando Pagamento'}
                              </p>
                              <p className="text-base text-text-muted font-bold mt-2 leading-relaxed">
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
                      <div className="space-y-8">
                        {/* Loan Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { label: 'Total', value: formatCurrency(lastLoan.totalToPay), bg: 'bg-brand-500/10', text: 'text-brand-600', border: 'border-brand-500/20' },
                            { label: 'Pago', value: formatCurrency(lastLoan.totalToPay - lastLoan.remainingAmount), bg: 'bg-brand-500/10', text: 'text-brand-600', border: 'border-brand-500/20' },
                            { label: 'Saldo', value: formatCurrency(lastLoan.remainingAmount), bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
                            { label: 'Parcelas', value: `${lastLoan.installmentsCount}x`, bg: 'bg-brand-500/10', text: 'text-brand-600', border: 'border-brand-500/20' }
                          ].map((item, i) => (
                            <div key={i} className={`${item.bg} p-4 rounded-[1.25rem] border ${item.border} shadow-inner group hover:scale-105 transition-transform duration-500`}>
                              <p className={`text-[10px] uppercase font-black ${item.text} tracking-[0.3em] mb-1 opacity-70`}>{item.label}</p>
                              <p className={`text-lg font-display font-black ${item.text}`}>{item.value}</p>
                            </div>
                          ))}
                        </div>
 
                        {/* Installments Grid */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-display font-black text-text-main flex items-center gap-3 text-lg tracking-tighter">
                              <Calendar size={20} strokeWidth={2.5} className="text-brand-500" />
                              Cronograma de Pagamentos
                            </h4>
                            <div className="flex gap-3 text-[9px] font-black uppercase tracking-[0.2em]">
                              <span className="flex items-center gap-1.5 text-brand-600"><div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_var(--accent-color)]" /> Pago</span>
                              <span className="flex items-center gap-1.5 text-red-600"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse" /> Atrasado</span>
                            </div>
                          </div>
 
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
                            {installments.map((inst) => (
                              <button 
                                key={inst.number}
                                onClick={() => setSelectedInstallmentNumber(inst.number)}
                                className={`relative p-3 rounded-[1.25rem] border-2 transition-all text-left group overflow-hidden shadow-inner ${
                                  inst.status === 'paid' ? 'bg-brand-500/10 border-brand-500/20' :
                                  inst.status === 'overdue' ? 'bg-red-500/10 border-red-500/20' :
                                  inst.status === 'upcoming' ? 'bg-brand-500/10 border-brand-500/20 ring-4 ring-brand-500/5' :
                                  'bg-text-main/5 border-border-main'
                                } hover:scale-[1.05] active:scale-95`}
                              >
                                <div className="flex justify-between items-start mb-2 relative z-10">
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg shadow-inner ${
                                    inst.status === 'paid' ? 'bg-brand-500/20 text-brand-600' :
                                    inst.status === 'overdue' ? 'bg-red-500/20 text-red-600' :
                                    inst.status === 'upcoming' ? 'bg-brand-500/20 text-brand-600' :
                                    'bg-text-main/10 text-text-muted'
                                  }`}>
                                    #{inst.number}
                                  </span>
                                  <div className="transition-transform group-hover:scale-125 duration-500">
                                    {inst.status === 'paid' && <CheckCircle2 size={16} strokeWidth={2.5} className="text-brand-600" />}
                                    {inst.status === 'overdue' && <AlertCircle size={16} strokeWidth={2.5} className="text-red-600" />}
                                    {inst.status === 'upcoming' && <Clock size={16} strokeWidth={2.5} className="text-brand-600" />}
                                  </div>
                                </div>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest relative z-10">{formatDate(inst.date.toISOString())}</p>
                                <p className="text-base font-display font-black text-text-main mt-0.5 relative z-10">{formatCurrency(inst.amount)}</p>
                                
                                <div className="absolute inset-0 bg-text-main/0 group-hover:bg-text-main/5 transition-colors" />
                              </button>
                            ))}
                          </div>
                        </div>
 
                        {/* Quick Actions */}
                        <div className="pt-4 space-y-4">
                          <button 
                            onClick={() => onRegisterPayment(lastLoan)}
                            className="relative overflow-hidden w-full py-5 btn-gradient text-white font-black rounded-[1.5rem] flex items-center justify-center gap-5 group active:scale-[0.98]"
                          >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                            <div className="bg-white/10 p-2.5 rounded-xl group-hover:scale-110 transition-transform relative z-10 shadow-inner">
                              <DollarSign size={20} strokeWidth={2.5} />
                            </div>
                            <div className="text-left relative z-10">
                              <p className="text-[9px] opacity-60 uppercase font-black tracking-[0.3em] leading-none mb-1.5">Ação Rápida</p>
                              <p className="text-xl font-display font-black leading-none tracking-tighter">Registrar Recebimento</p>
                            </div>
                            <ArrowRight size={20} strokeWidth={2.5} className="ml-auto opacity-40 group-hover:translate-x-2 transition-transform relative z-10" />
                          </button>
                          
                          <button 
                            onClick={onClose}
                            className="w-full py-4 btn-gradient-slate text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-[1.5rem] transition-all flex items-center justify-center gap-3 group border border-border-main shadow-inner active:scale-95"
                          >
                            <ArrowLeft size={18} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Fechar Detalhes</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-text-muted">
                    <div className="w-32 h-32 bg-text-main/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-border-main shadow-inner">
                      <Calendar size={64} strokeWidth={1} className="opacity-20" />
                    </div>
                    <p className="font-black text-2xl text-text-muted/40 mb-10 uppercase tracking-[0.3em]">Nenhum empréstimo ativo</p>
                    <button 
                      onClick={onClose}
                      className="w-full max-w-xs py-5 btn-gradient-slate text-white font-black uppercase text-[11px] tracking-[0.3em] rounded-[2rem] transition-all flex items-center justify-center gap-4 border border-border-main shadow-inner active:scale-95"
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
                  <h4 className="font-display font-black text-text-main flex items-center gap-4 text-xl tracking-tighter accent-glow">
                    <HistoryIcon size={24} strokeWidth={2.5} className="text-brand-500" />
                    Extrato de Pagamentos
                  </h4>
                  <span className="px-5 py-2 bg-text-main/5 text-text-muted text-[11px] font-black uppercase rounded-full tracking-[0.2em] border border-border-main shadow-inner">
                    {enrichedPayments.length} Registros
                  </span>
                </div>
                
                {enrichedPayments.length > 0 ? (
                  <div className="space-y-4">
                    {enrichedPayments.map((payment) => (
                      <div 
                        key={payment.id}
                        className={`p-6 rounded-[2.5rem] border transition-all flex justify-between items-center group hover:bg-text-main/5 shadow-inner ${
                          payment.isLate 
                            ? 'bg-red-500/10 border-red-500/20' 
                            : 'bg-text-main/5 border-border-main'
                        }`}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 border shadow-inner ${
                            payment.isLate ? 'bg-red-500/20 text-red-600 border-red-500/20' : 'bg-brand-500/20 text-brand-600 border-brand-500/20'
                          }`}>
                            <DollarSign size={24} strokeWidth={2.5} />
                          </div>
                          <div>
                            <p className="font-black text-text-main text-xl tracking-tight">{formatCurrency(payment.amount)}</p>
                            <p className="text-[11px] text-text-muted font-black uppercase tracking-[0.3em] mt-1">{formatDate(payment.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {payment.isLate ? (
                            <span className="inline-flex items-center px-4 py-1.5 bg-red-500/20 text-red-600 text-[10px] font-black uppercase rounded-full border border-red-500/20 shadow-inner">
                              <AlertCircle size={12} strokeWidth={3} className="mr-2" />
                              Atrasado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-4 py-1.5 bg-brand-500/20 text-brand-600 text-[10px] font-black uppercase rounded-full border border-brand-500/20 shadow-inner">
                              <CheckCircle2 size={12} strokeWidth={3} className="mr-2" />
                              No Prazo
                            </span>
                          )}
                          {payment.notes && (
                            <p className="text-[11px] text-text-muted mt-2 italic max-w-[200px] truncate font-medium">"{payment.notes}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={onClose}
                      className="w-full py-5 bg-text-main/5 text-text-muted font-black uppercase text-[11px] tracking-[0.3em] rounded-[2rem] hover:bg-text-main/10 transition-all flex items-center justify-center gap-4 mt-10 border border-border-main shadow-inner active:scale-95"
                    >
                      <ArrowLeft size={20} strokeWidth={2.5} />
                      <span>Fechar Histórico</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-text-muted">
                    <div className="w-32 h-32 bg-text-main/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-border-main shadow-inner">
                      <HistoryIcon size={64} strokeWidth={1} className="opacity-20" />
                    </div>
                    <p className="font-black text-2xl text-text-muted/40 mb-10 uppercase tracking-[0.3em]">Nenhum pagamento registrado</p>
                    <button 
                      onClick={onClose}
                      className="w-full max-w-xs py-5 btn-gradient-slate text-white font-black uppercase text-[11px] tracking-[0.3em] rounded-[2rem] transition-all flex items-center justify-center gap-4 border border-border-main shadow-inner active:scale-95"
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
