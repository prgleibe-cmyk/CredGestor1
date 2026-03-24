import React, { useMemo } from 'react';
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
  // Memoize basic stats
  const stats = useMemo(() => {
    const totalLent = loans.reduce((acc, l) => acc + l.amount, 0);
    const totalToReceive = loans.reduce((acc, l) => acc + l.remainingAmount, 0);
    const totalReceived = payments.reduce((acc, p) => acc + p.amount, 0);
    const activeCount = loans.filter(l => l.status === 'active').length;

    return [
      { label: 'Total Emprestado', value: formatCurrency(totalLent), icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-500/10' },
      { label: 'A Receber', value: formatCurrency(totalToReceive), icon: HandCoins, color: 'text-brand-600', bg: 'bg-brand-500/10' },
      { label: 'Total Recebido', value: formatCurrency(totalReceived), icon: DollarSign, color: 'text-brand-600', bg: 'bg-brand-500/10' },
      { label: 'Empréstimos Ativos', value: activeCount.toString(), icon: CheckCircle2, color: 'text-brand-600', bg: 'bg-brand-500/10' },
    ];
  }, [loans, payments]);

  // Memoize chart data for the last 7 days
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
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
  }, [loans, payments]);

  // Memoize distribution data
  const distributionData = useMemo(() => {
    const totalLent = loans.reduce((acc, l) => acc + l.amount, 0);
    const totalToReceive = loans.reduce((acc, l) => acc + l.remainingAmount, 0);
    const totalReceived = payments.reduce((acc, p) => acc + p.amount, 0);

    return [
      { name: 'Emprestado', value: totalLent, color: 'var(--brand-400)' },
      { name: 'Recebido', value: totalReceived, color: 'var(--brand-600)' },
      { name: 'A Receber', value: totalToReceive, color: 'var(--brand-500)' }
    ];
  }, [loans, payments]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-card/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-border-main">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3 mb-1 last:mb-0">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <p className="text-xs font-bold text-text-main">
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
    <div className="space-y-4 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-4 rounded-xl border border-border-main shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all duration-700 group-hover:bg-brand-500/20"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-brand-500/10 rounded-lg text-brand-600 shadow-inner">
                <Activity size={14} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-base font-display font-black text-text-main tracking-tight">Fluxo de Caixa</h3>
                <p className="text-[7px] font-black text-text-muted uppercase tracking-[0.2em] mt-0.5">Análise dos últimos 7 dias</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-text-main/5 p-1 rounded-lg border border-border-main">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-brand-500 shadow-[0_0_4px_rgba(var(--brand-500),0.3)]"></div>
                <span className="text-[7px] font-black text-text-muted uppercase tracking-widest">Pagamentos</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-brand-400 shadow-[0_0_4px_rgba(var(--brand-400),0.3)]"></div>
                <span className="text-[7px] font-black text-text-muted uppercase tracking-widest">Empréstimos</span>
              </div>
            </div>
          </div>
          
          <div className="h-[220px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorPayments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-500)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-400)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--brand-400)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-main)" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: '900' }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: '900' }}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border-main)', strokeWidth: 2, opacity: 0.1 }} />
                <Area 
                  type="monotone" 
                  dataKey="payments" 
                  stroke="var(--brand-600)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorPayments)" 
                  animationDuration={2000}
                />
                <Area 
                  type="monotone" 
                  dataKey="loans" 
                  stroke="var(--brand-400)" 
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
        <div className="glass-card p-4 rounded-xl border border-border-main shadow-sm flex flex-col relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-500/10 rounded-full -ml-12 -mb-12 blur-3xl transition-all duration-700 group-hover:bg-brand-500/20"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-base font-display font-black text-text-main tracking-tight">Resumo</h3>
            <span className="px-2 py-0.5 bg-text-main/5 border border-border-main text-text-muted text-[7px] font-black uppercase tracking-[0.2em] rounded-full">Geral</span>
          </div>
          
          <div className="space-y-2 relative z-10 flex-1">
            <div className="p-3 bg-gradient-to-br from-brand-600/5 to-brand-500/5 rounded-lg flex items-center justify-between border border-brand-600/10 group/item hover:scale-[1.01] transition-all duration-500 shadow-sm">
              <div>
                <span className="text-brand-600 font-black text-[7px] uppercase tracking-[0.3em]">Clientes</span>
                <p className="text-text-muted text-[8px] font-black mt-0.5 uppercase tracking-widest">Base total</p>
              </div>
              <span className="text-xl font-display font-black text-text-main group-hover/item:text-brand-600 transition-colors">{customers.length}</span>
            </div>
            
            <div className="p-3 bg-gradient-to-br from-brand-500/5 to-teal-500/5 rounded-lg flex items-center justify-between border border-brand-500/10 group/item hover:scale-[1.01] transition-all duration-500 shadow-sm">
              <div>
                <span className="text-brand-600 font-black text-[7px] uppercase tracking-[0.3em]">Pagamentos</span>
                <p className="text-text-muted text-[8px] font-black mt-0.5 uppercase tracking-widest">Transações</p>
              </div>
              <span className="text-xl font-display font-black text-text-main group-hover/item:text-brand-600 transition-colors">{payments.length}</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-brand-600 rounded-lg text-white relative overflow-hidden group/tip shadow-md shadow-brand-900/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover/tip:bg-white/20 transition-all duration-700"></div>
            <div className="relative z-10">
              <p className="text-brand-200 text-[7px] font-black uppercase tracking-[0.3em] mb-1">Dica de Gestão</p>
              <p className="text-[10px] font-black leading-tight tracking-tight">
                Mantenha seus registros atualizados diariamente para garantir a saúde financeira.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Loans */}
        <div className="lg:col-span-2 glass-card p-4 rounded-xl border border-border-main shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <h3 className="text-base font-display font-black text-text-main tracking-tight">Últimos Empréstimos</h3>
              <p className="text-[7px] font-black text-text-muted uppercase tracking-[0.2em] mt-0.5">Atividades recentes</p>
            </div>
            <span className="px-2 py-0.5 bg-brand-500/10 border border-brand-500/20 text-brand-600 text-[7px] font-black uppercase tracking-[0.2em] rounded-full">Recentes</span>
          </div>
          
          <div className="space-y-2">
            {loans.slice(-5).reverse().map(loan => (
              <div key={loan.id} className="flex items-center justify-between p-2 bg-text-main/5 hover:bg-text-main/10 rounded-lg transition-all duration-500 border border-transparent hover:border-border-main group shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-text-main/5 text-brand-600 rounded-lg flex items-center justify-center font-black text-xs shadow-inner group-hover:scale-105 group-hover:bg-brand-500/10 transition-all duration-500">
                    {loan.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-text-main text-xs tracking-tight">{loan.customerName}</p>
                    <p className="text-[8px] text-text-muted font-black uppercase tracking-widest mt-0.5">
                      {new Date(loan.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-brand-600 text-sm tracking-tighter">{formatCurrency(loan.amount)}</p>
                  <p className="text-[6px] text-text-muted font-black uppercase tracking-[0.2em] mt-0.5">Valor Principal</p>
                </div>
              </div>
            ))}
            {loans.length === 0 && (
              <div className="text-center py-6">
                <div className="w-10 h-10 bg-text-main/5 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <HandCoins className="text-text-muted" size={20} />
                </div>
                <p className="text-text-muted font-black uppercase tracking-widest text-[8px]">Nenhum empréstimo registrado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="glass-card p-4 rounded-xl border border-border-main shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-brand-500/10 rounded-full -ml-16 -mt-16 blur-3xl transition-all duration-700 group-hover:bg-brand-500/20"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex flex-col">
              <h3 className="text-base font-display font-black text-text-main tracking-tight">Distribuição</h3>
              <p className="text-[7px] font-black text-text-muted uppercase tracking-[0.2em] mt-0.5">Visão comparativa</p>
            </div>
            <div className="p-1.5 bg-text-main/5 rounded-lg text-text-muted border border-border-main">
              <BarChart3 size={14} strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="h-[220px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-main)" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: '900' }}
                  dy={15}
                />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'var(--color-bg-card)', opacity: 0.1, radius: 15 }} content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[15, 15, 0, 0]} barSize={50} animationDuration={2000}>
                  {distributionData.map((entry, index) => (
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
