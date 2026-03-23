import React from 'react';
import { TrendingUp, HandCoins, DollarSign, CheckCircle2, BarChart3, Activity } from 'lucide-react';
import { Loan, Customer, Payment } from '../types';
import { formatCurrency } from '../utils/formatters';
import { StatCard } from '../components/Common/StatCard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { subDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardViewProps {
  loans: Loan[];
  customers: Customer[];
  payments: Payment[];
}

export function DashboardView({ loans, customers, payments }: DashboardViewProps) {
  const totalLent = loans.reduce((acc, l) => acc + l.amount, 0);
  const totalToReceive = loans.reduce((acc, l) => acc + l.remainingAmount, 0);
  const totalReceived = payments.reduce((acc, p) => acc + p.amount, 0);
  const activeCount = loans.filter(l => l.status === 'active').length;

  const stats = [
    { label: 'Total Emprestado', value: formatCurrency(totalLent), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { label: 'A Receber', value: formatCurrency(totalToReceive), icon: HandCoins, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { label: 'Total Recebido', value: formatCurrency(totalReceived), icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { label: 'Empréstimos Ativos', value: activeCount.toString(), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  ];

  // Process data for charts
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const dayLoans = loans
      .filter(l => format(parseISO(l.createdAt), 'yyyy-MM-dd') === dateStr)
      .reduce((acc, l) => acc + l.amount, 0);
      
    const dayPayments = payments
      .filter(p => format(parseISO(p.date), 'yyyy-MM-dd') === dateStr)
      .reduce((acc, p) => acc + p.amount, 0);
      
    return {
      name: format(date, 'EEE', { locale: ptBR }),
      loans: dayLoans,
      payments: dayPayments,
      fullDate: format(date, 'dd/MM'),
    };
  }).reverse();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-slate-200">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3 mb-1 last:mb-0">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <p className="text-xs font-bold text-slate-900">
                {entry.name === 'loans' ? 'Empréstimos' : 'Pagamentos'}: {formatCurrency(entry.value)}
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-200 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-24 -mt-24 blur-3xl transition-all duration-700 group-hover:bg-emerald-500/20"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 shadow-inner">
                <Activity size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Fluxo de Caixa</h3>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Análise dos últimos 7 dias</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-900/5 p-2 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pagamentos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"></div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Empréstimos</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorPayments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: '900' }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: '900' }}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 2 }} />
                <Area 
                  type="monotone" 
                  dataKey="payments" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorPayments)" 
                  animationDuration={2000}
                />
                <Area 
                  type="monotone" 
                  dataKey="loans" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorLoans)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 shadow-xl flex flex-col relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full -ml-16 -mb-16 blur-3xl transition-all duration-700 group-hover:bg-blue-500/20"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Resumo</h3>
            <span className="px-3 py-1 bg-slate-900/5 border border-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] rounded-full">Geral</span>
          </div>
          
          <div className="space-y-4 relative z-10 flex-1">
            <div className="p-5 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl flex items-center justify-between border border-blue-500/10 group/item hover:scale-[1.02] transition-all duration-500 shadow-lg">
              <div>
                <span className="text-blue-600 font-black text-[9px] uppercase tracking-[0.3em]">Clientes</span>
                <p className="text-slate-500 text-[10px] font-black mt-0.5 uppercase tracking-widest">Base total</p>
              </div>
              <span className="text-3xl font-display font-black text-slate-900 group-hover/item:text-blue-600 transition-colors">{customers.length}</span>
            </div>
            
            <div className="p-5 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-2xl flex items-center justify-between border border-emerald-500/10 group/item hover:scale-[1.02] transition-all duration-500 shadow-lg">
              <div>
                <span className="text-emerald-600 font-black text-[9px] uppercase tracking-[0.3em]">Pagamentos</span>
                <p className="text-slate-500 text-[10px] font-black mt-0.5 uppercase tracking-widest">Transações</p>
              </div>
              <span className="text-3xl font-display font-black text-slate-900 group-hover/item:text-emerald-600 transition-colors">{payments.length}</span>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-emerald-600 rounded-2xl text-white relative overflow-hidden group/tip shadow-xl shadow-emerald-900/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover/tip:bg-white/20 transition-all duration-700"></div>
            <div className="relative z-10">
              <p className="text-emerald-200 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Dica de Gestão</p>
              <p className="text-xs font-black leading-relaxed tracking-tight">
                Mantenha seus registros atualizados diariamente para garantir a saúde financeira do seu negócio.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Loans */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-200 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Últimos Empréstimos</h3>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Atividades recentes</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full">Recentes</span>
          </div>
          
          <div className="space-y-4">
            {loans.slice(-5).reverse().map(loan => (
              <div key={loan.id} className="flex items-center justify-between p-4 bg-slate-900/5 hover:bg-slate-900/10 rounded-xl transition-all duration-500 border border-transparent hover:border-slate-200 group shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900/5 text-emerald-600 rounded-xl flex items-center justify-center font-black text-base shadow-inner group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all duration-500">
                    {loan.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-base tracking-tight">{loan.customerName}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                      {new Date(loan.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-600 text-lg tracking-tighter">{formatCurrency(loan.amount)}</p>
                  <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.2em] mt-0.5">Valor Principal</p>
                </div>
              </div>
            ))}
            {loans.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-900/5 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <HandCoins className="text-slate-400" size={32} />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Nenhum empréstimo registrado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full -ml-24 -mt-24 blur-3xl transition-all duration-700 group-hover:bg-emerald-500/20"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex flex-col">
              <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Distribuição</h3>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Visão comparativa</p>
            </div>
            <div className="p-2.5 bg-slate-900/5 rounded-xl text-slate-500 border border-slate-200">
              <BarChart3 size={18} strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Emprestado', value: totalLent, color: '#3b82f6' },
                { name: 'Recebido', value: totalReceived, color: '#10b981' },
                { name: 'A Receber', value: totalToReceive, color: '#f59e0b' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: '900' }}
                  dy={15}
                />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 15 }} content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[15, 15, 0, 0]} barSize={50} animationDuration={2000}>
                  {[
                    { name: 'Emprestado', color: '#3b82f6' },
                    { name: 'Recebido', color: '#10b981' },
                    { name: 'A Receber', color: '#f59e0b' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
