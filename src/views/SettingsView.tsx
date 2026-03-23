import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trash2, Download, Database, CheckCircle2, FileSpreadsheet, FileText as FilePdf } from 'lucide-react';
import { ConfirmModal } from '../components/Modals/ConfirmModal';
import { Settings } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SettingsViewProps {
  onClearData: () => void;
  customers: any[];
  loans: any[];
  payments: any[];
  settings: Settings;
  onSaveSettings: (settings: Settings) => Promise<boolean>;
}

export function SettingsView({ onClearData, customers, loans, payments, settings, onSaveSettings }: SettingsViewProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<Settings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onSaveSettings(formData);
    setIsSaving(false);
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleExport = () => {
    const data = {
      customers,
      loans,
      payments,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credgestor_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Relatório Geral de Dados - CredGestor\n\n";
    
    csvContent += "CLIENTES\n";
    csvContent += "Nome,Documento,Telefone,Endereco,Data Cadastro\n";
    customers.forEach(c => {
      csvContent += `${c.name},${c.document},${c.phone || ''},${c.address || ''},${formatDateTime(c.createdAt)}\n`;
    });
    
    csvContent += "\nEMPRESTIMOS\n";
    csvContent += "Cliente,Valor,Juros(%),Tipo,Total a Pagar,Restante,Parcelas,Frequencia,Status,Data\n";
    loans.forEach(l => {
      csvContent += `${l.customerName},${l.amount},${l.interestRate},${l.interestType},${l.totalToPay},${l.remainingAmount},${l.installmentsCount},${l.frequency},${l.status},${formatDateTime(l.createdAt)}\n`;
    });

    csvContent += "\nPAGAMENTOS\n";
    csvContent += "Data,Cliente,Valor\n";
    payments.forEach(p => {
      const loan = loans.find(l => l.id === p.loanId);
      csvContent += `${formatDateTime(p.date)},${loan?.customerName || 'N/A'},${p.amount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `credgestor_export_geral_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPdf = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Relatório Geral de Dados - CredGestor", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);

      // Customers Table
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Clientes", 14, 45);
      
      autoTable(doc, {
        startY: 50,
        head: [['Nome', 'Documento', 'Telefone']],
        body: customers.map(c => [c.name, c.document, c.phone || '']),
      });

      // Loans Table
      const loansY = (doc as any).lastAutoTable.finalY + 15;
      doc.text("Empréstimos Ativos/Geral", 14, loansY);
      
      autoTable(doc, {
        startY: loansY + 5,
        head: [['Cliente', 'Valor', 'Restante', 'Status']],
        body: loans.map(l => [l.customerName, formatCurrency(l.amount), formatCurrency(l.remainingAmount), l.status]),
      });

      // Payments Table
      const paymentsY = (doc as any).lastAutoTable.finalY + 15;
      doc.text("Últimos Pagamentos", 14, paymentsY);
      
      autoTable(doc, {
        startY: paymentsY + 5,
        head: [['Data', 'Cliente', 'Valor']],
        body: payments.slice(-20).reverse().map(p => {
          const loan = loans.find(l => l.id === p.loanId);
          return [formatDateTime(p.date), loan?.customerName || 'N/A', formatCurrency(p.amount)];
        }),
      });

      doc.save(`credgestor_export_geral_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente exportar em Excel.");
    }
  };

  return (
    <div className="w-full max-w-3xl bg-slate-900/5 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-2xl">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight">Configurações</h3>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20 shadow-sm"
          >
            <CheckCircle2 size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Salvo!</span>
          </motion.div>
        )}
      </div>
      
      <div className="space-y-10">
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-900/5 rounded-xl text-emerald-600 border border-slate-200">
              <Database size={18} />
            </div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Geral do Sistema</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome da Empresa / Pessoal</label>
              <input 
                type="text" 
                value={formData.companyName} 
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full p-4 bg-white/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold text-slate-900 transition-all placeholder:text-slate-400" 
                placeholder="Ex: CredGestor Soluções"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CPF ou CNPJ</label>
              <input 
                type="text" 
                value={formData.document || ''} 
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                className="w-full p-4 bg-white/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold text-slate-900 transition-all placeholder:text-slate-400" 
                placeholder="00.000.000/0001-00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Telefone de Contato</label>
              <input 
                type="text" 
                value={formData.phone || ''} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-4 bg-white/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold text-slate-900 transition-all placeholder:text-slate-400" 
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Taxa de Juros Padrão (%)</label>
              <input 
                type="number" 
                value={formData.defaultInterestRate} 
                onChange={(e) => setFormData({ ...formData, defaultInterestRate: Number(e.target.value) })}
                className="w-full p-4 bg-white/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold text-slate-900 transition-all" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Endereço Completo</label>
            <input 
              type="text" 
              value={formData.address || ''} 
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-4 bg-white/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold text-slate-900 transition-all placeholder:text-slate-400" 
              placeholder="Rua, Número, Bairro, Cidade - UF"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Logomarca da Empresa</label>
            <div className="flex items-center gap-6">
              {formData.logoUrl && (
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 p-3 bg-slate-900/5 rounded-[2rem] border border-slate-200 flex items-center justify-center overflow-hidden">
                    <img 
                      src={formData.logoUrl} 
                      alt="Logo Preview" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <button 
                    onClick={() => setFormData({ ...formData, logoUrl: '' })}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-90"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
              <label className={`flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all active:scale-[0.98] ${
                formData.logoUrl ? 'border-slate-200 hover:border-emerald-500/50' : 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10'
              }`}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="p-3 bg-slate-900/5 rounded-2xl shadow-sm mb-1 border border-slate-200">
                    <Download size={24} className="text-emerald-600" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-tight text-slate-900">
                    {formData.logoUrl ? 'Alterar Logomarca' : 'Carregar Logomarca'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">PNG ou JPG até 1MB</span>
                </div>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 1024 * 1024) {
                        alert('A imagem deve ter no máximo 1MB');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, logoUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </section>

        <section className="pt-10 border-t border-slate-200 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-900/5 rounded-xl text-blue-600 border border-slate-200">
              <CheckCircle2 size={18} />
            </div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Personalização Visual</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Modo de Exibição</label>
              <div className="flex p-1 bg-slate-900/5 border border-slate-200 rounded-2xl">
                <button 
                  onClick={() => setFormData({ ...formData, darkMode: false })}
                  className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!formData.darkMode ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Claro
                </button>
                <button 
                  onClick={() => setFormData({ ...formData, darkMode: true })}
                  className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.darkMode ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Escuro
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cor de Destaque</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Esmeralda', color: '#10b981' },
                  { name: 'Azul', color: '#3b82f6' },
                  { name: 'Violeta', color: '#8b5cf6' },
                  { name: 'Rosa', color: '#ec4899' },
                  { name: 'Laranja', color: '#f97316' },
                  { name: 'Slate', color: '#64748b' },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setFormData({ ...formData, accentColor: c.color })}
                    className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 active:scale-90 ${formData.accentColor === c.color ? 'border-white ring-2 ring-emerald-500 shadow-lg' : 'border-transparent'}`}
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  />
                ))}
                <div className="relative">
                  <input 
                    type="color" 
                    value={formData.accentColor || '#10b981'}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-full border-none p-0 cursor-pointer overflow-hidden opacity-0 absolute inset-0"
                  />
                  <div 
                    className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center bg-slate-900/5 text-slate-500 text-[10px] font-black"
                    style={{ borderStyle: 'dashed' }}
                  >
                    +
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-4">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full md:w-auto px-10 py-5 btn-gradient text-white font-black rounded-[2rem] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg tracking-tight active:scale-95"
          >
            {isSaving ? (
              <>
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>

        <section className="pt-10 border-t border-slate-200 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-900/5 rounded-xl text-slate-400 border border-slate-200">
              <Download size={18} />
            </div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Exportação & Backup</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={handleExportExcel}
              className="group flex flex-col items-center gap-4 p-6 btn-gradient-slate text-white rounded-[2.5rem] transition-all active:scale-95"
            >
              <div className="p-4 bg-slate-900/5 rounded-2xl border border-slate-200 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors">
                <FileSpreadsheet size={28} className="text-emerald-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Excel (CSV)</span>
            </button>

            <button 
              onClick={handleExportPdf}
              className="group flex flex-col items-center gap-4 p-6 btn-gradient-slate text-white rounded-[2.5rem] transition-all active:scale-95"
            >
              <div className="p-4 bg-slate-900/5 rounded-2xl border border-slate-200 group-hover:bg-red-500/10 group-hover:border-red-500/20 transition-colors">
                <FilePdf size={28} className="text-red-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">PDF Geral</span>
            </button>

            <button 
              onClick={handleExport}
              className="group flex flex-col items-center gap-4 p-6 btn-gradient-slate text-white rounded-[2.5rem] transition-all active:scale-95"
            >
              <div className="p-4 bg-slate-900/5 rounded-2xl border border-slate-200 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-colors">
                <Database size={28} className="text-blue-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Backup (JSON)</span>
            </button>
          </div>
          <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest text-center leading-relaxed max-w-md mx-auto">
            O arquivo JSON é o único que pode ser usado para restaurar dados no futuro. Excel e PDF são para conferência humana.
          </p>
        </section>

        <section className="pt-10 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/10 rounded-xl text-red-600 border border-red-500/20">
              <Trash2 size={18} />
            </div>
            <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">Zona de Perigo</h4>
          </div>
          
          <button 
            onClick={() => setIsConfirmOpen(true)}
            className="flex items-center gap-6 p-6 btn-gradient-red text-white rounded-[2.5rem] transition-all w-full group active:scale-[0.99]"
          >
            <div className="p-4 bg-slate-900/5 rounded-2xl border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-lg font-black text-slate-900 tracking-tight">Limpar Todos os Dados</span>
              <span className="text-[10px] text-red-600 font-black uppercase tracking-widest">Esta ação não pode ser desfeita</span>
            </div>
          </button>
        </section>
      </div>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          onClearData();
          window.location.reload();
        }}
        title="Apagar Tudo?"
        message="Tem certeza que deseja apagar TODOS os dados de clientes, empréstimos e pagamentos? Esta ação é definitiva e não pode ser desfeita."
        confirmText="Sim, Apagar Tudo"
        cancelText="Não, Cancelar"
      />
    </div>
  );
}
