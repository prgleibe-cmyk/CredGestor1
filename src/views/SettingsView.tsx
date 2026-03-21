import React from 'react';
import { Trash2 } from 'lucide-react';

interface SettingsViewProps {
  onClearData: () => void;
}

export function SettingsView({ onClearData }: SettingsViewProps) {
  return (
    <div className="max-w-2xl bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
      <h3 className="text-xl font-bold mb-6">Configurações do Sistema</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Nome da Empresa</label>
          <input type="text" defaultValue="CrediFlow" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Taxa de Juros Padrão (%)</label>
          <input type="number" defaultValue="10" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
        </div>
        <div className="pt-4">
          <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors">
            Salvar Alterações
          </button>
        </div>
        <div className="pt-8 border-t border-neutral-100">
          <h4 className="text-red-600 font-bold mb-4">Zona de Perigo</h4>
          <button 
            onClick={() => {
              if(confirm('Tem certeza que deseja apagar TODOS os dados? Esta ação não pode ser desfeita.')) {
                onClearData();
                window.location.reload();
              }
            }}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 p-3 rounded-xl transition-all"
          >
            <Trash2 size={20} />
            <span>Limpar Todos os Dados</span>
          </button>
        </div>
      </div>
    </div>
  );
}
