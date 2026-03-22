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
    { label: 'Total Emprestado', value: formatCurrency(totalLent), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'A Receber', value: formatCurrency(totalToReceive), icon: HandCoins, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Total Recebido', value: formatCurrency(totalReceived), icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Empréstimos Ativos', value: activeCount.toString(), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
        <div className="glass p-4 rounded-2xl neo-shadow-lg border border-white/40">
          <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3 mb-1 last:mb-0">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <p className="text-sm font-bold text-text-main">
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-bg-card p-8 rounded-[2.5rem] border border-border-main/60 neo-shadow">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-100 rounded-xl text-brand-600">
                <Activity size={18} />
              </div>
              <h3 className="text-xl font-display font-extrabold text-text-main tracking-tight">Fluxo de Caixa (7 dias)</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-500"></div>
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Pagamentos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Empréstimos</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorPayments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-500)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="payments" 
                  stroke="var(--brand-500)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPayments)" 
                  animationDuration={1500}
                />
                <Area 
                  type="monotone" 
                  dataKey="loans" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorLoans)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-bg-card p-8 rounded-[2.5rem] border border-border-main/60 neo-shadow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-display font-extrabold text-text-main tracking-tight">Resumo de Atividade</h3>
            <span className="px-3 py-1 bg-bg-main text-text-muted text-[11px] font-bold uppercase tracking-wider rounded-full">Geral</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl flex items-center justify-between border border-blue-100/50 dark:border-blue-800/30 group hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300">
              <div>
                <span className="text-blue-700 dark:text-blue-400 font-bold text-sm uppercase tracking-wider">Clientes</span>
                <p className="text-blue-900/60 dark:text-blue-300/60 text-xs font-medium mt-0.5">Base total</p>
              </div>
              <span className="text-4xl font-display font-black text-blue-800 dark:text-blue-300 group-hover:scale-110 transition-transform">{customers.length}</span>
            </div>
            <div className="p-6 bg-gradient-to-br from-brand-50 to-emerald-50 dark:from-brand-900/20 dark:to-emerald-900/20 rounded-3xl flex items-center justify-between border border-brand-100/50 dark:border-brand-800/30 group hover:shadow-lg hover:shadow-brand-100/50 transition-all duration-300">
              <div>
                <span className="text-brand-700 dark:text-brand-400 font-bold text-sm uppercase tracking-wider">Pagamentos</span>
                <p className="text-brand-900/60 dark:text-brand-300/60 text-xs font-medium mt-0.5">Transações</p>
              </div>
              <span className="text-4xl font-display font-black text-brand-800 dark:text-brand-300 group-hover:scale-110 transition-transform">{payments.length}</span>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-slate-900 dark:bg-brand-900 rounded-3xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors"></div>
            <div className="relative z-10">
              <p className="text-slate-400 dark:text-brand-300 text-xs font-bold uppercase tracking-[0.2em] mb-2">Dica de Gestão</p>
              <p className="text-sm font-medium leading-relaxed">
                Mantenha seus registros atualizados diariamente para garantir a saúde financeira do seu negócio.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Loans */}
        <div className="lg:col-span-2 bg-bg-card p-8 rounded-[2.5rem] border border-border-main/60 neo-shadow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-display font-extrabold text-text-main tracking-tight">Últimos Empréstimos</h3>
            <span className="px-3 py-1 bg-brand-50 text-brand-700 text-[11px] font-bold uppercase tracking-wider rounded-full">Recentes</span>
          </div>
          <div className="space-y-4">
            {loans.slice(-5).reverse().map(loan => (
              <div key={loan.id} className="flex items-center justify-between p-4 bg-bg-main/50 hover:bg-bg-main rounded-2xl transition-colors border border-transparent hover:border-border-main group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-bg-card text-brand-600 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-110 transition-transform">
                    {loan.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-text-main">{loan.customerName}</p>
                    <p className="text-xs text-text-muted font-medium">{new Date(loan.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-brand-600 text-lg">{formatCurrency(loan.amount)}</p>
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-tighter">Valor Principal</p>
                </div>
              </div>
            ))}
            {loans.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-4">
                  <HandCoins className="text-text-muted opacity-30" size={32} />
                </div>
                <p className="text-text-muted font-medium">Nenhum empréstimo registrado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-bg-card p-8 rounded-[2.5rem] border border-border-main/60 neo-shadow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-display font-extrabold text-text-main tracking-tight">Distribuição</h3>
            <BarChart3 size={18} className="text-text-muted" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Emprestado', value: totalLent, color: '#3b82f6' },
                { name: 'Recebido', value: totalReceived, color: 'var(--brand-500)' },
                { name: 'A Receber', value: totalToReceive, color: '#f59e0b' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                  {[
                    { name: 'Emprestado', color: '#3b82f6' },
                    { name: 'Recebido', color: 'var(--brand-500)' },
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
