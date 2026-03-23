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
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-display font-black text-slate-900 tracking-tight">Painel Administrativo</h2>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-[0.2em] text-[11px]">Gerenciamento do Sistema e Usuários</p>
        </div>

        <div className="flex p-2 bg-slate-900/5 border border-slate-200 rounded-[2rem] shadow-inner">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden group ${
              activeTab === 'users' ? 'text-white shadow-2xl shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {activeTab === 'users' && (
              <motion.div layoutId="adminTab" className="absolute inset-0 btn-gradient rounded-2xl -z-10" />
            )}
            <div className="flex items-center gap-2 relative z-10">
              <Users size={16} strokeWidth={3} />
              <span>Usuários</span>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden group ${
              activeTab === 'system' ? 'text-white shadow-2xl shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {activeTab === 'system' && (
              <motion.div layoutId="adminTab" className="absolute inset-0 btn-gradient rounded-2xl -z-10" />
            )}
            <div className="flex items-center gap-2 relative z-10">
              <SettingsIcon size={16} strokeWidth={3} />
              <span>Sistema</span>
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="glass-card rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/5 border-b border-slate-200">
                  <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Usuário</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Status</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Fim do Teste</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Mensalidade</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="group/row hover:bg-slate-900/5 transition-all duration-500">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-900/5 rounded-2xl flex items-center justify-center font-black text-xl text-emerald-600 shadow-inner group-hover/row:scale-110 transition-all duration-500">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg tracking-tight">{user.fullName}</p>
                          <p className="text-xs font-bold text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        {user.subscriptionStatus === 'active' ? (
                          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
                            <CheckCircle size={14} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Ativo</span>
                          </div>
                        ) : user.subscriptionStatus === 'pending' ? (
                          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/20">
                            <Clock size={14} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Pendente</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 rounded-full border border-red-500/20">
                            <XCircle size={14} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Inativo</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">
                          {user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString('pt-BR') : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <CreditCard size={18} className="text-slate-400" />
                        <input 
                          type="number"
                          value={user.monthlyFee}
                          onChange={(e) => handleUpdateUserFee(user, Number(e.target.value))}
                          className="w-24 p-2 bg-slate-900/5 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleUpdateUserStatus(user, 'active')}
                          className="p-3 btn-gradient text-white rounded-xl transition-all hover:scale-110 active:scale-90 shadow-lg"
                          title="Ativar"
                        >
                          <CheckCircle size={18} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => handleUpdateUserStatus(user, 'inactive')}
                          className="p-3 btn-gradient-red text-white rounded-xl transition-all hover:scale-110 active:scale-90 shadow-lg"
                          title="Desativar"
                        >
                          <XCircle size={18} strokeWidth={2.5} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="glass-card p-10 rounded-[3rem] border border-slate-200 shadow-2xl space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 shadow-inner">
                <SettingsIcon size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight">Configurações Globais</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Mensalidade Padrão (R$)</label>
                <input 
                  type="number"
                  value={editingConfig.defaultMonthlyFee}
                  onChange={(e) => setEditingConfig({ ...editingConfig, defaultMonthlyFee: Number(e.target.value) })}
                  className="w-full p-5 bg-white/60 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-base font-black text-slate-900 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Dias de Teste Grátis</label>
                <input 
                  type="number"
                  value={editingConfig.defaultTrialDays}
                  onChange={(e) => setEditingConfig({ ...editingConfig, defaultTrialDays: Number(e.target.value) })}
                  className="w-full p-5 bg-white/60 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-base font-black text-slate-900 transition-all shadow-inner"
                />
              </div>

              <div className="flex items-center justify-between p-6 bg-slate-900/5 rounded-[2rem] border border-slate-200 shadow-inner">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl border border-slate-200 shadow-inner ${editingConfig.maintenanceMode ? 'bg-amber-500/20 text-amber-600' : 'bg-slate-900/5 text-slate-500'}`}>
                    <AlertTriangle size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="block text-sm font-black uppercase tracking-[0.1em] text-slate-900">Modo Manutenção</span>
                    <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">Bloqueia acesso de usuários</span>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingConfig({ ...editingConfig, maintenanceMode: !editingConfig.maintenanceMode })}
                  className={`w-14 h-8 rounded-full transition-all relative ${editingConfig.maintenanceMode ? 'bg-amber-600' : 'bg-slate-900/10 shadow-inner'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${editingConfig.maintenanceMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <button 
              onClick={handleSaveConfig}
              disabled={isSavingConfig}
              className="w-full py-5 btn-gradient text-white font-black uppercase text-[11px] tracking-[0.3em] rounded-[2rem] transition-all flex items-center justify-center gap-4 group border border-slate-200 shadow-inner active:scale-95 disabled:opacity-50"
            >
              <Save size={20} strokeWidth={2.5} />
              <span>{isSavingConfig ? 'Salvando...' : 'Salvar Configurações'}</span>
            </button>
          </div>

          <div className="glass-card p-10 rounded-[3rem] border border-slate-200 shadow-2xl flex flex-col justify-center items-center text-center space-y-6">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center text-emerald-600 shadow-inner">
              <Shield size={48} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight">Segurança do Sistema</h3>
              <p className="text-slate-500 font-bold mt-2 leading-relaxed">
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
