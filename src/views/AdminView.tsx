import React, { useState } from 'react';
import { Users, Settings as SettingsIcon, Shield, CreditCard, CheckCircle, XCircle, Clock, Save, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, SystemConfig } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AdminViewProps {
  users: UserProfile[];
  config: SystemConfig;
  onUpdateProfile: (id: string, data: Partial<UserProfile>) => Promise<boolean>;
  onUpdateConfig: (data: Partial<SystemConfig>) => Promise<boolean>;
}

export function AdminView({ users, config, onUpdateProfile, onUpdateConfig }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'system'>('users');
  const [editingConfig, setEditingConfig] = useState<SystemConfig>(config);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    const success = await onUpdateConfig(editingConfig);
    if (success) {
      alert('Configurações salvas com sucesso!');
    } else {
      alert('Erro ao salvar configurações.');
    }
    setIsSavingConfig(false);
  };

  const handleUpdateUserStatus = async (user: UserProfile, status: UserProfile['subscriptionStatus']) => {
    const success = await onUpdateProfile(user.id, { subscriptionStatus: status });
    if (!success) alert('Erro ao atualizar status do usuário.');
  };

  const handleUpdateUserFee = async (user: UserProfile, fee: number) => {
    const success = await onUpdateProfile(user.id, { monthlyFee: fee });
    if (!success) alert('Erro ao atualizar mensalidade do usuário.');
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-text-main tracking-tight">Painel Administrativo</h2>
          <p className="text-text-muted font-bold mt-0.5 uppercase tracking-[0.2em] text-[8px]">Gerenciamento do Sistema e Usuários</p>
        </div>

        <div className="flex p-1 bg-text-main/5 border border-border-main rounded-xl shadow-inner">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden group ${
              activeTab === 'users' ? 'text-white shadow-lg shadow-brand-500/10' : 'text-text-muted hover:text-text-main'
            }`}
          >
            {activeTab === 'users' && (
              <motion.div layoutId="adminTab" className="absolute inset-0 btn-gradient rounded-lg -z-10" />
            )}
            <div className="flex items-center gap-2 relative z-10">
              <Users size={12} strokeWidth={3} />
              <span>Usuários</span>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`px-5 py-2 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden group ${
              activeTab === 'system' ? 'text-white shadow-lg shadow-brand-500/10' : 'text-text-muted hover:text-text-main'
            }`}
          >
            {activeTab === 'system' && (
              <motion.div layoutId="adminTab" className="absolute inset-0 btn-gradient rounded-lg -z-10" />
            )}
            <div className="flex items-center gap-2 relative z-10">
              <SettingsIcon size={12} strokeWidth={3} />
              <span>Sistema</span>
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="glass-card rounded-xl border border-border-main shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-text-main/5 border-b border-border-main">
                  <th className="px-4 py-3 text-[8px] font-black text-text-muted uppercase tracking-[0.3em]">Usuário</th>
                  <th className="px-4 py-3 text-[8px] font-black text-text-muted uppercase tracking-[0.3em]">Status</th>
                  <th className="px-4 py-3 text-[8px] font-black text-text-muted uppercase tracking-[0.3em]">Fim do Teste</th>
                  <th className="px-4 py-3 text-[8px] font-black text-text-muted uppercase tracking-[0.3em]">Mensalidade</th>
                  <th className="px-4 py-3 text-[8px] font-black text-text-muted uppercase tracking-[0.3em]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {users.map((user) => (
                  <tr key={user.id} className="group/row hover:bg-text-main/5 transition-all duration-500">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-text-main/5 rounded-lg flex items-center justify-center font-black text-sm text-brand-600 shadow-inner group-hover/row:scale-110 transition-all duration-500">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-text-main text-xs tracking-tight">{user.fullName}</p>
                          <p className="text-[9px] font-bold text-text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {user.subscriptionStatus === 'active' ? (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-500/10 text-brand-600 rounded-full border border-brand-500/20">
                            <CheckCircle size={10} strokeWidth={3} />
                            <span className="text-[7px] font-black uppercase tracking-widest">Ativo</span>
                          </div>
                        ) : user.subscriptionStatus === 'pending' ? (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-500/10 text-brand-600 rounded-full border border-brand-500/20 opacity-70">
                            <Clock size={10} strokeWidth={3} />
                            <span className="text-[7px] font-black uppercase tracking-widest">Pendente</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-text-main/10 text-text-muted rounded-full border border-border-main">
                            <XCircle size={10} strokeWidth={3} />
                            <span className="text-[7px] font-black uppercase tracking-widest">Inativo</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Clock size={10} className="text-text-muted" />
                        <span className="text-[9px] font-bold text-text-main">
                          {user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString('pt-BR') : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CreditCard size={12} className="text-text-muted" />
                        <input 
                          type="number"
                          value={user.monthlyFee}
                          onChange={(e) => handleUpdateUserFee(user, Number(e.target.value))}
                          className="w-16 p-1 bg-text-main/5 border border-border-main rounded-lg text-[9px] font-black text-text-main focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleUpdateUserStatus(user, 'active')}
                          className="p-1.5 btn-gradient text-white rounded-lg transition-all hover:scale-110 active:scale-90 shadow-md"
                          title="Ativar"
                        >
                          <CheckCircle size={12} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => handleUpdateUserStatus(user, 'inactive')}
                          className="p-1.5 btn-gradient-red text-white rounded-lg transition-all hover:scale-110 active:scale-90 shadow-md"
                          title="Desativar"
                        >
                          <XCircle size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-4 rounded-xl border border-border-main shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-brand-500/10 rounded-lg text-brand-600 shadow-inner">
                <SettingsIcon size={16} strokeWidth={2.5} />
              </div>
              <h3 className="text-base font-display font-black text-text-main tracking-tight">Configurações Globais</h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[8px] font-black text-text-muted uppercase tracking-[0.3em] ml-2">Mensalidade Padrão (R$)</label>
                <input 
                  type="number"
                  value={editingConfig.defaultMonthlyFee}
                  onChange={(e) => setEditingConfig({ ...editingConfig, defaultMonthlyFee: Number(e.target.value) })}
                  className="w-full p-2 bg-text-main/5 border border-border-main rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs font-black text-text-main transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] font-black text-text-muted uppercase tracking-[0.3em] ml-2">Dias de Teste Grátis</label>
                <input 
                  type="number"
                  value={editingConfig.defaultTrialDays}
                  onChange={(e) => setEditingConfig({ ...editingConfig, defaultTrialDays: Number(e.target.value) })}
                  className="w-full p-2 bg-text-main/5 border border-border-main rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs font-black text-text-main transition-all shadow-inner"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-text-main/5 rounded-xl border border-border-main shadow-inner">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border border-border-main shadow-inner ${editingConfig.maintenanceMode ? 'bg-brand-500/20 text-brand-600' : 'bg-text-main/5 text-text-muted'}`}>
                    <AlertTriangle size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-[0.1em] text-text-main">Modo Manutenção</span>
                    <span className="text-[7px] text-text-muted font-black uppercase tracking-[0.2em]">Bloqueia acesso de usuários</span>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingConfig({ ...editingConfig, maintenanceMode: !editingConfig.maintenanceMode })}
                  className={`w-10 h-5 rounded-full transition-all relative ${editingConfig.maintenanceMode ? 'bg-brand-600' : 'bg-text-main/10 shadow-inner'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-lg transition-all ${editingConfig.maintenanceMode ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            <button 
              onClick={handleSaveConfig}
              disabled={isSavingConfig}
              className="w-full py-3 btn-gradient text-white font-black uppercase text-[8px] tracking-[0.3em] rounded-lg transition-all flex items-center justify-center gap-2 group border border-border-main shadow-inner active:scale-95 disabled:opacity-50"
            >
              <Save size={14} strokeWidth={2.5} />
              <span>{isSavingConfig ? 'Salvando...' : 'Salvar Configurações'}</span>
            </button>
          </div>

          <div className="glass-card p-4 rounded-xl border border-border-main shadow-sm flex flex-col justify-center items-center text-center space-y-3">
            <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-600 shadow-inner">
              <Shield size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-base font-display font-black text-text-main tracking-tight">Segurança do Sistema</h3>
              <p className="text-text-muted font-bold mt-0.5 leading-relaxed text-[10px]">
                Como administrador, você tem controle total sobre o acesso dos usuários e as taxas do sistema.
                Certifique-se de validar as alterações antes de salvar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
