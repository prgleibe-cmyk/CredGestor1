import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Loan, Customer, Payment } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { 
  isToday, 
  isThisWeek, 
  isThisMonth, 
  parseISO
} from 'date-fns';
import { TrendingUp, HandCoins, DollarSign, Users, Calendar, Filter, Download, Printer, FileSpreadsheet, FileText as FilePdf } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsViewProps {
  loans: Loan[];
  customers: Customer[];
  payments: Payment[];
}

type Period = 'today' | 'week' | 'month' | 'all';

export function ReportsView({ loans, customers, payments }: ReportsViewProps) {
  const [period, setPeriod] = useState<Period>('month');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const filteredData = useMemo(() => {
    const checkDate = (dateStr: string) => {
      const date = parseISO(dateStr);
      if (period === 'today') return isToday(date);
      if (period === 'week') return isThisWeek(date, { weekStartsOn: 0 });
      if (period === 'month') return isThisMonth(date);
      return true;
    };

    return {
      loans: loans.filter(l => checkDate(l.createdAt)),
      customers: customers.filter(c => checkDate(c.createdAt)),
      payments: payments.filter(p => checkDate(p.date)),
    };
  }, [loans, customers, payments, period]);

  const stats = useMemo(() => {
    const totalLent = filteredData.loans.reduce((acc, l) => acc + l.amount, 0);
    const totalReceived = filteredData.payments.reduce((acc, p) => acc + p.amount, 0);
    const newCustomers = filteredData.customers.length;
    const newLoansCount = filteredData.loans.length;

    return [
      { label: 'Total Emprestado', value: formatCurrency(totalLent), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-500/10' },
      { label: 'Total Recebido', value: formatCurrency(totalReceived), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
      { label: 'Novos Clientes', value: newCustomers.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-500/10' },
      { label: 'Novos Empréstimos', value: newLoansCount.toString(), icon: HandCoins, color: 'text-orange-600', bg: 'bg-orange-500/10' },
    ];
  }, [filteredData]);

  const handleExportExcel = () => {
    // Simple CSV export
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Relatório de Atividade - " + periodLabel + "\n\n";
    
    // Stats
    csvContent += "Resumo\n";
    stats.forEach(s => {
      csvContent += `${s.label},${s.value}\n`;
    });
    
    csvContent += "\nPagamentos no Período\n";
    csvContent += "Data,Cliente,Valor\n";
    filteredData.payments.forEach(p => {
      const loan = loans.find(l => l.id === p.loanId);
      csvContent += `${formatDateTime(p.date)},${loan?.customerName || 'N/A'},${p.amount}\n`;
    });

    csvContent += "\nNovos Empréstimos no Período\n";
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
      const title = `Relatório de Atividade - ${periodLabel}`;
      
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);

      // Stats
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Resumo", 14, 45);
      
      let y = 55;
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

  const periodLabel = {
    today: 'Hoje',
    week: 'Esta Semana',
    month: 'Este Mês',
    all: 'Todo o Período'
  }[period];

  return (
    <div className="space-y-10 pb-12" id="report-to-print">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 no-print">
        <div className="flex p-2 bg-slate-900/5 rounded-[1.5rem] border border-slate-200 shadow-inner w-fit">
          {(['today', 'week', 'month', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 active:scale-95 relative overflow-hidden group ${
                period === p 
                  ? 'text-white shadow-2xl shadow-emerald-500/20' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-900/5'
              }`}
            >
              {period === p && (
                <motion.div 
                  layoutId="activePeriodReport"
                  className="absolute inset-0 btn-gradient rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{p === 'today' ? 'Hoje' : p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Tudo'}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 relative">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-3 px-8 py-4 btn-gradient-slate text-white rounded-[1.5rem] transition-all text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 group"
          >
            <Printer size={20} className="text-slate-500 group-hover:text-emerald-600 transition-colors" />
            Imprimir
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-3 px-8 py-4 btn-gradient text-white rounded-[1.5rem] transition-all text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 group"
            >
              <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
              Exportar
            </button>
            
            {isExportMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 mt-4 w-64 glass-card backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-200 z-50 overflow-hidden no-print p-3"
              >
                <button 
                  onClick={handleExportExcel}
                  className="w-full flex items-center gap-5 px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 hover:bg-slate-900/5 rounded-2xl transition-all group"
                >
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                    <FileSpreadsheet size={20} className="text-emerald-600" />
                  </div>
                  Excel (CSV)
                </button>
                <button 
                  onClick={handleExportPdf}
                  className="w-full flex items-center gap-5 px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 hover:bg-slate-900/5 rounded-2xl transition-all group"
                >
                  <div className="p-2.5 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors">
                    <FilePdf size={20} className="text-red-600" />
                  </div>
                  PDF (Download)
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Print Header (Only visible when printing) */}
      <div className="hidden print:block print-header mb-10">
        <h1 className="text-4xl font-display font-black text-emerald-500 mb-3">Relatório de Atividade</h1>
        <p className="text-base text-slate-500 font-black uppercase tracking-[0.3em]">Período: {periodLabel}</p>
        <p className="text-xs text-slate-400 mt-3 font-bold">Gerado em: {new Date().toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 rounded-[3rem] border border-slate-200 shadow-2xl group hover:border-slate-300 transition-all duration-700 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-900/5 rounded-full -mr-12 -mt-12 blur-2xl transition-all duration-700 group-hover:bg-slate-900/10"></div>
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-[1.25rem] flex items-center justify-center mb-6 no-print shadow-inner relative z-10 group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon size={28} strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 relative z-10">{stat.label}</p>
            <h3 className="text-3xl font-display font-black text-slate-900 leading-none tracking-tighter relative z-10 accent-glow">{stat.value}</h3>
            <p className="text-[9px] text-slate-600 mt-4 font-black uppercase tracking-[0.2em] opacity-60 relative z-10">{periodLabel}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Payments in Period */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden"
        >
          <div className="p-8 md:p-10 border-b border-slate-200 bg-slate-900/5">
            <h3 className="text-2xl font-display font-black flex items-center gap-4 text-slate-900 tracking-tight">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                <DollarSign size={24} className="text-emerald-600" />
              </div>
              Pagamentos no Período
            </h3>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto print:max-h-none custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/5 text-slate-600 text-[11px] font-black uppercase tracking-[0.3em] border-b border-slate-200 sticky top-0 backdrop-blur-xl z-10 print:static">
                <tr>
                  <th className="px-10 py-6">Data</th>
                  <th className="px-10 py-6">Cliente</th>
                  <th className="px-10 py-6">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredData.payments.slice().reverse().map(payment => (
                  <tr key={payment.id} className="group hover:bg-slate-900/5 transition-all duration-500">
                    <td className="px-10 py-7 text-xs font-black text-slate-500 tracking-tight">{formatDateTime(payment.date)}</td>
                    <td className="px-10 py-7">
                      <span className="font-display font-black text-slate-900 text-lg tracking-tight group-hover:text-emerald-600 transition-colors duration-500">
                        {loans.find(l => l.id === payment.loanId)?.customerName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <span className="font-display font-black text-emerald-600 text-xl tracking-tighter group-hover:scale-110 inline-block transition-transform duration-500">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredData.payments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-10 py-24 text-center">
                      <div className="flex flex-col items-center gap-6 opacity-30 group">
                        <div className="p-6 bg-slate-900/5 rounded-[2rem] shadow-inner group-hover:scale-110 transition-transform duration-700">
                          <DollarSign size={56} className="text-slate-500" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-600">Nenhum pagamento</p>
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
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden"
        >
          <div className="p-8 md:p-10 border-b border-slate-200 bg-slate-900/5">
            <h3 className="text-2xl font-display font-black flex items-center gap-4 text-slate-900 tracking-tight">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                <HandCoins size={24} className="text-emerald-600" />
              </div>
              Novos Empréstimos
            </h3>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto print:max-h-none custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/5 text-slate-600 text-[11px] font-black uppercase tracking-[0.3em] border-b border-slate-200 sticky top-0 backdrop-blur-xl z-10 print:static">
                <tr>
                  <th className="px-10 py-6">Data</th>
                  <th className="px-10 py-6">Cliente</th>
                  <th className="px-10 py-6">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredData.loans.slice().reverse().map(loan => (
                  <tr key={loan.id} className="group hover:bg-slate-900/5 transition-all duration-500">
                    <td className="px-10 py-7 text-xs font-black text-slate-500 tracking-tight">{formatDateTime(loan.createdAt)}</td>
                    <td className="px-10 py-7">
                      <span className="font-display font-black text-slate-900 text-lg tracking-tight group-hover:text-emerald-600 transition-colors duration-500">
                        {loan.customerName}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <span className="font-display font-black text-emerald-600 text-xl tracking-tighter group-hover:scale-110 inline-block transition-transform duration-500">
                        {formatCurrency(loan.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredData.loans.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-10 py-24 text-center">
                      <div className="flex flex-col items-center gap-6 opacity-30 group">
                        <div className="p-6 bg-slate-900/5 rounded-[2rem] shadow-inner group-hover:scale-110 transition-transform duration-700">
                          <HandCoins size={56} className="text-slate-500" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-600">Nenhum empréstimo</p>
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
