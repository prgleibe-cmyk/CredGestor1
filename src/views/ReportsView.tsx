import React, { useState, useMemo } from 'react';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex p-1 bg-neutral-100 rounded-xl w-fit">
          <button
            onClick={() => setPeriod('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === 'today' ? 'bg-white text-emerald-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === 'week' ? 'bg-white text-emerald-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === 'month' ? 'bg-white text-emerald-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Mês
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === 'all' ? 'bg-white text-emerald-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Tudo
          </button>
        </div>

        <div className="flex items-center gap-3 relative">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-neutral-600 hover:bg-neutral-50 transition-all text-sm font-medium shadow-sm"
          >
            <Printer size={18} />
            Imprimir
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all text-sm font-medium shadow-sm"
            >
              <Download size={18} />
              Exportar
            </button>
            
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-100 z-50 overflow-hidden no-print">
                <button 
                  onClick={handleExportExcel}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  <FileSpreadsheet size={18} className="text-emerald-600" />
                  Excel (CSV)
                </button>
                <button 
                  onClick={handleExportPdf}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  <FilePdf size={18} className="text-red-600" />
                  PDF (Download)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Header (Only visible when printing) */}
      <div className="hidden print:block print-header">
        <h1 className="text-3xl font-bold text-emerald-600 mb-2">Relatório de Atividade</h1>
        <p className="text-neutral-500">Período: {periodLabel}</p>
        <p className="text-xs text-neutral-400 mt-2">Gerado em: {new Date().toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 no-print`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-neutral-800">{stat.value}</h3>
            <p className="text-xs text-neutral-400 mt-2">{periodLabel}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payments in Period */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign size={18} className="text-emerald-600" />
              Pagamentos no Período
            </h3>
          </div>
          <div className="max-h-[400px] overflow-y-auto print:max-h-none">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 text-neutral-500 text-[10px] uppercase tracking-wider sticky top-0 print:static">
                <tr>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredData.payments.slice().reverse().map(payment => (
                  <tr key={payment.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 text-xs text-neutral-500">{formatDateTime(payment.date)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-700">
                      {loans.find(l => l.id === payment.loanId)?.customerName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">{formatCurrency(payment.amount)}</td>
                  </tr>
                ))}
                {filteredData.payments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-400 text-sm">Nenhum pagamento neste período.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* New Loans in Period */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100">
            <h3 className="font-semibold flex items-center gap-2">
              <HandCoins size={18} className="text-blue-600" />
              Novos Empréstimos no Período
            </h3>
          </div>
          <div className="max-h-[400px] overflow-y-auto print:max-h-none">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 text-neutral-500 text-[10px] uppercase tracking-wider sticky top-0 print:static">
                <tr>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredData.loans.slice().reverse().map(loan => (
                  <tr key={loan.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 text-xs text-neutral-500">{formatDateTime(loan.createdAt)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-700">{loan.customerName}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600">{formatCurrency(loan.amount)}</td>
                  </tr>
                ))}
                {filteredData.loans.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-400 text-sm">Nenhum empréstimo neste período.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
