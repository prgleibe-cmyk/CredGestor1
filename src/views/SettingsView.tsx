import React, { useState, useEffect } from 'react';
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
    <div className="max-w-2xl bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Configurações do Sistema</h3>
        {showSuccess && (
          <div className="flex items-center gap-2 text-emerald-600 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={18} />
            <span className="text-sm font-bold">Salvo com sucesso!</span>
          </div>
        )}
      </div>
      
      <div className="space-y-8">
        <section>
          <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Geral</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Nome da Empresa / Pessoal</label>
                <input 
                  type="text" 
                  value={formData.companyName} 
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                  placeholder="Ex: CredGestor Soluções"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">CPF ou CNPJ</label>
                <input 
                  type="text" 
                  value={formData.document || ''} 
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                  placeholder="00.000.000/0001-00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Telefone de Contato</label>
                <input 
                  type="text" 
                  value={formData.phone || ''} 
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Taxa de Juros Padrão (%)</label>
                <input 
                  type="number" 
                  value={formData.defaultInterestRate} 
                  onChange={(e) => setFormData({ ...formData, defaultInterestRate: Number(e.target.value) })}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Endereço Completo</label>
              <input 
                type="text" 
                value={formData.address || ''} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                placeholder="Rua, Número, Bairro, Cidade - UF"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Logomarca da Empresa (PNG/JPG)</label>
              <div className="flex items-center gap-4">
                {formData.logoUrl && (
                  <div className="relative group">
                    <img 
                      src={formData.logoUrl} 
                      alt="Logo Preview" 
                      className="w-20 h-20 object-contain rounded-xl border border-neutral-200 bg-neutral-50"
                      referrerPolicy="no-referrer"
                    />
                    <button 
                      onClick={() => setFormData({ ...formData, logoUrl: '' })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
                <label className={`flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  formData.logoUrl ? 'border-neutral-200 hover:border-emerald-500' : 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50'
                }`}>
                  <div className="flex flex-col items-center gap-2">
                    <Download size={24} className="text-emerald-600" />
                    <span className="text-sm font-medium text-neutral-600">
                      {formData.logoUrl ? 'Alterar Logomarca' : 'Carregar Logomarca'}
                    </span>
                    <span className="text-[10px] text-neutral-400">PNG ou JPG até 1MB</span>
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
              <p className="text-[10px] text-neutral-400 mt-2">Esta imagem aparecerá na barra lateral e nos futuros comprovantes.</p>
            </div>

            <div className="pt-2">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </div>
        </section>

        <section className="pt-8 border-t border-neutral-100">
          <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Exportação de Dados</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={handleExportExcel}
              className="flex flex-col items-center gap-2 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl hover:bg-neutral-100 transition-all text-neutral-700 font-medium"
            >
              <div className="p-2 bg-white rounded-lg border border-neutral-200">
                <FileSpreadsheet size={24} className="text-emerald-600" />
              </div>
              <span className="text-sm">Excel (CSV)</span>
            </button>

            <button 
              onClick={handleExportPdf}
              className="flex flex-col items-center gap-2 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl hover:bg-neutral-100 transition-all text-neutral-700 font-medium"
            >
              <div className="p-2 bg-white rounded-lg border border-neutral-200">
                <FilePdf size={24} className="text-red-600" />
              </div>
              <span className="text-sm">PDF Geral</span>
            </button>

            <button 
              onClick={handleExport}
              className="flex flex-col items-center gap-2 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl hover:bg-neutral-100 transition-all text-neutral-700 font-medium"
            >
              <div className="p-2 bg-white rounded-lg border border-neutral-200">
                <Database size={24} className="text-blue-600" />
              </div>
              <span className="text-sm">Backup (JSON)</span>
            </button>
          </div>
          <p className="text-[10px] text-neutral-400 mt-4 text-center">
            O arquivo JSON é o único que pode ser usado para restaurar dados no futuro. Excel e PDF são para conferência humana.
          </p>
        </section>

        <section className="pt-8 border-t border-neutral-100">
          <h4 className="text-red-600 font-bold mb-4">Zona de Perigo</h4>
          <button 
            onClick={() => setIsConfirmOpen(true)}
            className="flex items-center gap-3 text-red-600 hover:bg-red-50 p-4 rounded-2xl transition-all w-full border border-transparent hover:border-red-100"
          >
            <div className="p-2 bg-white rounded-lg border border-red-100">
              <Trash2 size={20} />
            </div>
            <div className="flex flex-col items-start">
              <span>Limpar Todos os Dados</span>
              <span className="text-xs text-red-400">Esta ação não pode ser desfeita</span>
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
