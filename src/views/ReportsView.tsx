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
      { label: 'Total Emprestado', value: formatCurrency(totalLent), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Total Recebido', value: formatCurrency(totalReceived), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Novos Clientes', value: newCustomers.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Novos Empréstimos', value: newLoansCount.toString(), icon: HandCoins, color: 'text-orange-600', bg: 'bg-orange-50' },
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
    <div className="space-y-8" id="report-to-print">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div className="flex p-1.5 bg-slate-100/50 rounded-2xl backdrop-blur-sm border border-slate-200/50 w-fit">
          {(['today', 'week', 'month', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                period === p 
                  ? 'bg-white text-brand-600 shadow-md shadow-brand-100/50 ring-1 ring-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              {p === 'today' ? 'Hoje' : p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Tudo'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 relative">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all text-xs font-black uppercase tracking-widest shadow-sm active:scale-95"
          >
            <Printer size={18} className="text-slate-400" />
            Imprimir
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-3 px-5 py-3 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-100 active:scale-95"
            >
              <Download size={18} />
              Exportar
            </button>
            
            {isExportMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-50 overflow-hidden no-print p-2"
              >
                <button 
                  onClick={handleExportExcel}
                  className="w-full flex items-center gap-4 px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 rounded-2xl transition-all group"
                >
                  <div className="p-2 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                    <FileSpreadsheet size={18} className="text-emerald-600" />
                  </div>
                  Excel (CSV)
                </button>
                <button 
                  onClick={handleExportPdf}
                  className="w-full flex items-center gap-4 px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 rounded-2xl transition-all group"
                >
                  <div className="p-2 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                    <FilePdf size={18} className="text-red-600" />
                  </div>
                  PDF (Download)
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Print Header (Only visible when printing) */}
      <div className="hidden print:block print-header mb-8">
        <h1 className="text-3xl font-display font-black text-brand-600 mb-2">Relatório de Atividade</h1>
        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Período: {periodLabel}</p>
        <p className="text-[10px] text-slate-400 mt-2 font-medium">Gerado em: {new Date().toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-[2.5rem] neo-shadow border border-white/40"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 no-print shadow-sm`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-display font-black text-slate-900 leading-none tracking-tight">{stat.value}</h3>
            <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-widest opacity-60">{periodLabel}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payments in Period */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-[2.5rem] neo-shadow overflow-hidden border border-white/40"
        >
          <div className="p-6 md:p-8 border-b border-slate-100/50 bg-white/30">
            <h3 className="text-xl font-display font-black flex items-center gap-3 text-slate-900 tracking-tight">
              <DollarSign size={22} className="text-brand-500" />
              Pagamentos no Período
            </h3>
          </div>
          <div className="overflow-x-auto max-h-[450px] overflow-y-auto print:max-h-none">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b border-slate-100/50 sticky top-0 backdrop-blur-md z-10 print:static">
                <tr>
                  <th className="px-8 py-5">Data</th>
                  <th className="px-8 py-5">Cliente</th>
                  <th className="px-8 py-5">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filteredData.payments.slice().reverse().map(payment => (
                  <tr key={payment.id} className="group hover:bg-brand-50/30 transition-all">
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">{formatDateTime(payment.date)}</td>
                    <td className="px-8 py-5">
                      <span className="font-display font-black text-slate-800 text-base tracking-tight group-hover:text-brand-600 transition-colors">
                        {loans.find(l => l.id === payment.loanId)?.customerName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-display font-black text-brand-600 text-lg tracking-tight">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredData.payments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-30">
                        <DollarSign size={48} className="text-slate-400" />
                        <p className="text-sm font-black uppercase tracking-widest text-slate-500">Nenhum pagamento</p>
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
          className="glass rounded-[2.5rem] neo-shadow overflow-hidden border border-white/40"
        >
          <div className="p-6 md:p-8 border-b border-slate-100/50 bg-white/30">
            <h3 className="text-xl font-display font-black flex items-center gap-3 text-slate-900 tracking-tight">
              <HandCoins size={22} className="text-brand-500" />
              Novos Empréstimos
            </h3>
          </div>
          <div className="overflow-x-auto max-h-[450px] overflow-y-auto print:max-h-none">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b border-slate-100/50 sticky top-0 backdrop-blur-md z-10 print:static">
                <tr>
                  <th className="px-8 py-5">Data</th>
                  <th className="px-8 py-5">Cliente</th>
                  <th className="px-8 py-5">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filteredData.loans.slice().reverse().map(loan => (
                  <tr key={loan.id} className="group hover:bg-brand-50/30 transition-all">
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">{formatDateTime(loan.createdAt)}</td>
                    <td className="px-8 py-5">
                      <span className="font-display font-black text-slate-800 text-base tracking-tight group-hover:text-brand-600 transition-colors">
                        {loan.customerName}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-display font-black text-brand-600 text-lg tracking-tight">
                        {formatCurrency(loan.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredData.loans.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-30">
                        <HandCoins size={48} className="text-slate-400" />
                        <p className="text-sm font-black uppercase tracking-widest text-slate-500">Nenhum empréstimo</p>
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
