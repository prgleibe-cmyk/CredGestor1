import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loan, Customer, Payment, LoanStatus } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { 
  isToday, 
  isThisWeek, 
  isThisMonth, 
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay
} from 'date-fns';
import { TrendingUp, HandCoins, DollarSign, Users, Calendar, Filter, Download, Printer, FileSpreadsheet, FileText as FilePdf, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsViewProps {
  loans: Loan[];
  customers: Customer[];
  payments: Payment[];
}

type Period = 'today' | 'week' | 'month' | 'all' | 'custom';

interface Filters {
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  customerName: string;
  status: LoanStatus | 'all';
}

export function ReportsView({ loans, customers, payments }: ReportsViewProps) {
  const [period, setPeriod] = useState<Period>('month');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    customerName: '',
    status: 'all'
  });
  const [appliedFilters, setAppliedFilters] = useState<Filters>(filters);

  const filteredData = useMemo(() => {
    const applyFilters = (dateStr: string, amount?: number, customerName?: string, status?: LoanStatus) => {
      const date = parseISO(dateStr);
      
      // 1. Date Filter
      let dateMatch = true;
      if (period === 'today') dateMatch = isToday(date);
      else if (period === 'week') dateMatch = isThisWeek(date, { weekStartsOn: 0 });
      else if (period === 'month') dateMatch = isThisMonth(date);
      else if (period === 'custom') {
        if (appliedFilters.startDate && appliedFilters.endDate) {
          dateMatch = isWithinInterval(date, {
            start: startOfDay(parseISO(appliedFilters.startDate)),
            end: endOfDay(parseISO(appliedFilters.endDate))
          });
        } else if (appliedFilters.startDate) {
          dateMatch = date >= startOfDay(parseISO(appliedFilters.startDate));
        } else if (appliedFilters.endDate) {
          dateMatch = date <= endOfDay(parseISO(appliedFilters.endDate));
        }
      }

      if (!dateMatch) return false;

      // 2. Amount Filter
      if (amount !== undefined) {
        if (appliedFilters.minAmount && amount < Number(appliedFilters.minAmount)) return false;
        if (appliedFilters.maxAmount && amount > Number(appliedFilters.maxAmount)) return false;
      }

      // 3. Customer Name Filter
      if (customerName && appliedFilters.customerName) {
        if (!customerName.toLowerCase().includes(appliedFilters.customerName.toLowerCase())) return false;
      }

      // 4. Status Filter
      if (status && appliedFilters.status !== 'all') {
        if (status !== appliedFilters.status) return false;
      }

      return true;
    };

    return {
      loans: loans.filter(l => applyFilters(l.createdAt, l.amount, l.customerName, l.status)),
      customers: customers.filter(c => applyFilters(c.createdAt, undefined, c.name)),
      payments: payments.filter(p => {
        const loan = loans.find(l => l.id === p.loanId);
        return applyFilters(p.date, p.amount, loan?.customerName);
      }),
    };
  }, [loans, customers, payments, period, appliedFilters]);

  const stats = useMemo(() => {
    const totalLent = filteredData.loans.reduce((acc, l) => acc + l.amount, 0);
    const totalReceived = filteredData.payments.reduce((acc, p) => acc + p.amount, 0);
    const newCustomers = filteredData.customers.length;
    const newLoansCount = filteredData.loans.length;

    return [
      { label: 'Total Emprestado', value: formatCurrency(totalLent), icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-500/10' },
      { label: 'Total Recebido', value: formatCurrency(totalReceived), icon: DollarSign, color: 'text-brand-600', bg: 'bg-brand-500/10' },
      { label: 'Novos Clientes', value: newCustomers.toString(), icon: Users, color: 'text-brand-600', bg: 'bg-brand-500/10' },
      { label: 'Novos Empréstimos', value: newLoansCount.toString(), icon: HandCoins, color: 'text-brand-600', bg: 'bg-brand-500/10' },
    ];
  }, [filteredData]);

  const handleExportExcel = () => {
    // Simple CSV export
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Relatorio de Atividade - " + periodLabel + "\n";
    if (filterSummary) csvContent += "Filtros: " + filterSummary + "\n";
    csvContent += "\n";
    
    // Stats
    csvContent += "Resumo\n";
    stats.forEach(s => {
      csvContent += `${s.label},${s.value}\n`;
    });
    
    csvContent += "\nPagamentos no Periodo\n";
    csvContent += "Data,Cliente,Valor\n";
    filteredData.payments.forEach(p => {
      const loan = loans.find(l => l.id === p.loanId);
      csvContent += `${formatDateTime(p.date)},${loan?.customerName || 'N/A'},${p.amount}\n`;
    });

    csvContent += "\nNovos Emprestimos no Periodo\n";
    csvContent += "Data,Cliente,Valor\n";
    filteredData.loans.forEach(l => {
      csvContent += `${formatDateTime(l.createdAt)},${l.customerName},${l.amount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportMenuOpen(false);
  };

  const handleExportPdf = () => {
    try {
      const doc = new jsPDF();
      const title = `Relatório de Atividade`;
      
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Período: ${periodLabel}`, 14, 30);
      if (filterSummary) {
        doc.text(`Filtros: ${filterSummary}`, 14, 36);
      }
      doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, filterSummary ? 42 : 36);

      // Stats
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Resumo", 14, filterSummary ? 55 : 50);
      
      let y = filterSummary ? 65 : 60;
      stats.forEach(s => {
        doc.setFontSize(11);
        doc.text(`${s.label}: ${s.value}`, 14, y);
        y += 7;
      });

      // Payments Table
      doc.setFontSize(14);
      doc.text("Pagamentos no Período", 14, y + 10);
      
      const paymentData = filteredData.payments.slice().reverse().map(p => {
        const loan = loans.find(l => l.id === p.loanId);
        return [formatDateTime(p.date), loan?.customerName || 'N/A', formatCurrency(p.amount)];
      });

      autoTable(doc, {
        startY: y + 15,
        head: [['Data', 'Cliente', 'Valor']],
        body: paymentData,
      });

      // New Loans Table
      const finalY = (doc as any).lastAutoTable.finalY || y + 50;
      doc.setFontSize(14);
      doc.text("Novos Empréstimos no Período", 14, finalY + 15);

      const loanData = filteredData.loans.slice().reverse().map(l => [
        formatDateTime(l.createdAt),
        l.customerName,
        formatCurrency(l.amount)
      ]);

      autoTable(doc, {
        startY: finalY + 20,
        head: [['Data', 'Cliente', 'Valor']],
        body: loanData,
      });

      doc.save(`relatorio_${period}_${new Date().toISOString().split('T')[0]}.pdf`);
      setIsExportMenuOpen(false);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      // Fallback to print if PDF generation fails
      handlePrint();
    }
  };

  const handlePrint = () => {
    setIsExportMenuOpen(false);
    try {
      window.print();
    } catch (e) {
      console.error("Erro ao imprimir:", e);
      alert("Não foi possível abrir o diálogo de impressão. Tente abrir o aplicativo em uma nova aba.");
    }
  };

  const periodLabel = useMemo(() => {
    if (period === 'today') return 'Hoje';
    if (period === 'week') return 'Esta Semana';
    if (period === 'month') return 'Este Mês';
    if (period === 'all') return 'Todo o Período';
    if (period === 'custom') {
      if (appliedFilters.startDate && appliedFilters.endDate) {
        return `De ${new Date(appliedFilters.startDate).toLocaleDateString()} até ${new Date(appliedFilters.endDate).toLocaleDateString()}`;
      }
      if (appliedFilters.startDate) return `Desde ${new Date(appliedFilters.startDate).toLocaleDateString()}`;
      if (appliedFilters.endDate) return `Até ${new Date(appliedFilters.endDate).toLocaleDateString()}`;
      return 'Personalizado';
    }
    return 'Relatório';
  }, [period, appliedFilters]);

  const filterSummary = useMemo(() => {
    const activeFilters = [];
    if (appliedFilters.minAmount) activeFilters.push(`Valor Mín: ${formatCurrency(Number(appliedFilters.minAmount))}`);
    if (appliedFilters.maxAmount) activeFilters.push(`Valor Máx: ${formatCurrency(Number(appliedFilters.maxAmount))}`);
    if (appliedFilters.customerName) activeFilters.push(`Cliente: ${appliedFilters.customerName}`);
    if (appliedFilters.status !== 'all') activeFilters.push(`Status: ${appliedFilters.status === 'active' ? 'Ativo' : appliedFilters.status === 'paid' ? 'Pago' : 'Atrasado'}`);
    return activeFilters.length > 0 ? activeFilters.join(' | ') : null;
  }, [appliedFilters]);

  const resetFilters = () => {
    const defaults: Filters = {
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      customerName: '',
      status: 'all'
    };
    setFilters(defaults);
    setAppliedFilters(defaults);
    setPeriod('month');
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setIsFiltersOpen(false);
  };

  return (
    <div className="space-y-4 pb-4" id="report-to-print">
      {/* Header & Filters */}
      <div className="flex flex-col gap-3 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap p-0.5 bg-text-main/5 rounded-xl border border-border-main shadow-inner w-fit">
            {(['today', 'week', 'month', 'all', 'custom'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-[0.2em] transition-all duration-500 active:scale-95 relative overflow-hidden group ${
                  period === p 
                    ? 'text-white shadow-lg shadow-brand-500/10' 
                    : 'text-text-muted hover:text-text-main hover:bg-text-main/5'
                }`}
              >
                {period === p && (
                  <motion.div 
                    layoutId="activePeriodReport"
                    className="absolute inset-0 btn-gradient rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">
                  {p === 'today' ? 'Hoje' : p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : p === 'all' ? 'Tudo' : 'Filtros'}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 relative">
            <button 
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-[7px] font-black uppercase tracking-[0.2em] active:scale-95 group ${
                isFiltersOpen ? 'bg-text-main text-bg-main' : 'bg-bg-card border border-border-main text-text-muted hover:border-text-main/30'
              }`}
            >
              <Filter size={12} className={isFiltersOpen ? 'text-brand-400' : 'text-text-muted group-hover:text-brand-500'} />
              {isFiltersOpen ? 'Fechar Filtros' : 'Mais Filtros'}
              {isFiltersOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>

            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-text-main/5 hover:bg-text-main/10 border border-border-main text-text-main rounded-lg transition-all text-[7px] font-black uppercase tracking-[0.2em] active:scale-95 group"
            >
              <Printer size={12} className="text-text-muted group-hover:text-brand-600 transition-colors" />
              Imprimir
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 btn-gradient text-white rounded-lg transition-all text-[7px] font-black uppercase tracking-[0.2em] active:scale-95 group"
              >
                <Download size={12} className="group-hover:translate-y-0.5 transition-transform" />
                Exportar
              </button>
              
              {isExportMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 mt-2 w-40 glass-card backdrop-blur-3xl rounded-xl shadow-xl border border-border-main z-50 overflow-hidden no-print p-1"
                >
                  <button 
                    onClick={handleExportExcel}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-[7px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-text-main hover:bg-text-main/5 rounded-lg transition-all group"
                  >
                    <div className="p-1 bg-brand-500/10 rounded-lg group-hover:bg-brand-500/20 transition-colors">
                      <FileSpreadsheet size={12} className="text-brand-600" />
                    </div>
                    Excel (CSV)
                  </button>
                  <button 
                    onClick={handleExportPdf}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-[7px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-text-main hover:bg-text-main/5 rounded-lg transition-all group"
                  >
                    <div className="p-1 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                      <FilePdf size={12} className="text-red-600" />
                    </div>
                    PDF (Download)
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {isFiltersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-card p-3 rounded-xl border border-border-main shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[7px] font-black uppercase tracking-[0.3em] text-text-main flex items-center gap-1.5">
                    <Filter size={10} className="text-brand-500" />
                    Configurar Relatório
                  </h4>
                  <button 
                    onClick={resetFilters}
                    className="text-[6px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <X size={8} />
                    Limpar Filtros
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Date Range */}
                  <div className="space-y-1">
                    <label className="text-[7px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Período Customizado</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="relative group">
                        <Calendar size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-500 transition-colors" />
                        <input 
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => {
                            setFilters({...filters, startDate: e.target.value});
                            setPeriod('custom');
                          }}
                          className="w-full pl-8 pr-1.5 py-1.5 bg-text-main/5 border border-transparent focus:border-brand-500/30 focus:bg-bg-card rounded-lg text-[8px] font-bold transition-all outline-none text-text-main"
                        />
                      </div>
                      <div className="relative group">
                        <Calendar size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-500 transition-colors" />
                        <input 
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => {
                            setFilters({...filters, endDate: e.target.value});
                            setPeriod('custom');
                          }}
                          className="w-full pl-8 pr-1.5 py-1.5 bg-text-main/5 border border-transparent focus:border-brand-500/30 focus:bg-bg-card rounded-lg text-[8px] font-bold transition-all outline-none text-text-main"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Value Range */}
                  <div className="space-y-1">
                    <label className="text-[7px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Faixa de Valor (R$)</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="relative group">
                        <DollarSign size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-500 transition-colors" />
                        <input 
                          type="number"
                          placeholder="Mín"
                          value={filters.minAmount}
                          onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                          className="w-full pl-8 pr-1.5 py-1.5 bg-text-main/5 border border-transparent focus:border-brand-500/30 focus:bg-bg-card rounded-lg text-[8px] font-bold transition-all outline-none text-text-main"
                        />
                      </div>
                      <div className="relative group">
                        <DollarSign size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-500 transition-colors" />
                        <input 
                          type="number"
                          placeholder="Máx"
                          value={filters.maxAmount}
                          onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                          className="w-full pl-8 pr-1.5 py-1.5 bg-text-main/5 border border-transparent focus:border-brand-500/30 focus:bg-bg-card rounded-lg text-[8px] font-bold transition-all outline-none text-text-main"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-1">
                    <label className="text-[7px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Nome do Cliente</label>
                    <div className="relative group">
                      <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-500 transition-colors" />
                      <input 
                        type="text"
                        placeholder="Buscar por nome..."
                        value={filters.customerName}
                        onChange={(e) => setFilters({...filters, customerName: e.target.value})}
                        className="w-full pl-8 pr-1.5 py-1.5 bg-text-main/5 border border-transparent focus:border-brand-500/30 focus:bg-bg-card rounded-lg text-[8px] font-bold transition-all outline-none text-text-main"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-[7px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Status do Empréstimo</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value as any})}
                      className="w-full px-2.5 py-1.5 bg-text-main/5 border border-transparent focus:border-brand-500/30 focus:bg-bg-card rounded-lg text-[8px] font-bold transition-all outline-none appearance-none cursor-pointer text-text-main"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="active">Ativo</option>
                      <option value="paid">Pago</option>
                      <option value="overdue">Atrasado</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-border-main">
                  <button 
                    onClick={handleApplyFilters}
                    className="flex items-center gap-1.5 px-4 py-1.5 btn-gradient text-white rounded-lg transition-all text-[8px] font-black uppercase tracking-[0.2em] active:scale-95 shadow-lg shadow-brand-500/10"
                  >
                    <TrendingUp size={12} />
                    Gerar Relatório
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Print Header (Only visible when printing) */}
      <div className="hidden print:block print-header mb-6">
        <h1 className="text-2xl font-display font-black text-brand-500 mb-1">Relatório de Atividade</h1>
        <p className="text-xs text-text-muted font-black uppercase tracking-[0.3em]">Período: {periodLabel}</p>
        {filterSummary && (
          <p className="text-[10px] text-text-muted/70 mt-1 font-bold italic">Filtros: {filterSummary}</p>
        )}
        <p className="text-[8px] text-text-muted/60 mt-1 font-bold">Gerado em: {new Date().toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4 rounded-xl border border-border-main shadow-sm group hover:border-text-main/30 transition-all duration-700 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-text-main/5 rounded-full -mr-8 -mt-8 blur-2xl transition-all duration-700 group-hover:bg-text-main/10"></div>
            <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-3 no-print shadow-inner relative z-10 group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon size={16} strokeWidth={2.5} />
            </div>
            <p className="text-[7px] font-black text-text-muted uppercase tracking-[0.3em] mb-1 relative z-10">{stat.label}</p>
            <h3 className="text-lg font-display font-black text-text-main leading-none tracking-tighter relative z-10 accent-glow">{stat.value}</h3>
            <p className="text-[7px] text-text-muted mt-2 font-black uppercase tracking-[0.2em] opacity-60 relative z-10">{periodLabel}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Payments in Period */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl border border-border-main shadow-sm overflow-hidden"
        >
          <div className="p-4 border-b border-border-main bg-text-main/5">
            <h3 className="text-base font-display font-black flex items-center gap-2 text-text-main tracking-tight">
              <div className="p-1.5 bg-brand-500/10 rounded-lg">
                <DollarSign size={16} className="text-brand-600" />
              </div>
              Pagamentos no Período
            </h3>
          </div>
          <div className="overflow-x-auto max-h-[350px] overflow-y-auto print:max-h-none custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-text-main/5 text-text-muted text-[8px] font-black uppercase tracking-[0.3em] border-b border-border-main sticky top-0 backdrop-blur-xl z-10 print:static">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {filteredData.payments.slice().reverse().map(payment => (
                  <tr key={payment.id} className="group hover:bg-text-main/5 transition-all duration-500">
                    <td className="px-4 py-3 text-[9px] font-black text-text-muted tracking-tight">{formatDateTime(payment.date)}</td>
                    <td className="px-4 py-3">
                      <span className="font-display font-black text-text-main text-xs tracking-tight group-hover:text-brand-600 transition-colors duration-500">
                        {loans.find(l => l.id === payment.loanId)?.customerName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-display font-black text-brand-600 text-sm tracking-tighter group-hover:scale-110 inline-block transition-transform duration-500">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredData.payments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-30 group">
                        <div className="p-3 bg-text-main/5 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-700">
                          <DollarSign size={32} className="text-text-muted" strokeWidth={1.5} />
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-text-muted">Nenhum pagamento</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* New Loans in Period */}
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl border border-border-main shadow-sm overflow-hidden"
        >
          <div className="p-4 border-b border-border-main bg-text-main/5">
            <h3 className="text-base font-display font-black flex items-center gap-2 text-text-main tracking-tight">
              <div className="p-1.5 bg-brand-500/10 rounded-lg">
                <HandCoins size={16} className="text-brand-600" />
              </div>
              Novos Empréstimos
            </h3>
          </div>
          <div className="overflow-x-auto max-h-[350px] overflow-y-auto print:max-h-none custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-text-main/5 text-text-muted text-[8px] font-black uppercase tracking-[0.3em] border-b border-border-main sticky top-0 backdrop-blur-xl z-10 print:static">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {filteredData.loans.slice().reverse().map(loan => (
                  <tr key={loan.id} className="group hover:bg-text-main/5 transition-all duration-500">
                    <td className="px-4 py-3 text-[9px] font-black text-text-muted tracking-tight">{formatDateTime(loan.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="font-display font-black text-text-main text-xs tracking-tight group-hover:text-brand-600 transition-colors duration-500">
                        {loan.customerName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-display font-black text-brand-600 text-sm tracking-tighter group-hover:scale-110 inline-block transition-transform duration-500">
                        {formatCurrency(loan.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredData.loans.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-30 group">
                        <div className="p-3 bg-text-main/5 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-700">
                          <HandCoins size={32} className="text-text-muted" strokeWidth={1.5} />
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-text-muted">Nenhum empréstimo</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
