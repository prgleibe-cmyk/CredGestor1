import React, { useState, useMemo } from 'react';
import { Search, UserPlus, History, Eye } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Customer, Loan, Payment } from '../types';
import { CustomerDetailsModal } from '../components/Modals/CustomerDetailsModal';

interface CustomersViewProps {
  customers: Customer[];
  loans: Loan[];
  payments: Payment[];
  onAdd: () => void;
  onRegisterPayment: (loan: Loan) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
}

export function CustomersView({ customers, loans, payments, onAdd, onRegisterPayment, onEdit, onDelete }: CustomersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(searchTerm) ||
      c.document.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  // Pre-calculate stats for all customers to avoid re-calculating on every search keystroke
  const customerStats = useMemo(() => {
    const stats: Record<string, { activeLoans: number; hasOverdue: boolean }> = {};
    
    customers.forEach(customer => {
      const customerLoans = loans.filter(l => l.customerId === customer.id);
      stats[customer.id] = {
        activeLoans: customerLoans.filter(l => l.status === 'active').length,
        hasOverdue: customerLoans.some(l => l.status === 'overdue')
      };
    });
    
    return stats;
  }, [customers, loans]);

  return (
    <div className="glass-card rounded-xl border border-border-main shadow-sm overflow-hidden mb-4">
      <div className="p-3 md:p-4 border-b border-border-main flex flex-col lg:flex-row justify-between lg:items-center gap-3 bg-text-main/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/10 rounded-full -mr-20 -mt-20 blur-3xl transition-all duration-700 group-hover:bg-brand-500/20"></div>
        
        <div className="relative z-10">
          <h3 className="text-sm font-display font-black text-text-main tracking-tight">Lista de Clientes</h3>
          <p className="text-[6px] text-text-muted font-black uppercase tracking-[0.3em] mt-0.5">Gerencie sua base de contatos e contratos</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto relative z-10">
          <div className="relative w-full sm:w-56 group/search">
            <input 
              type="text" 
              placeholder="Buscar por nome, CPF ou telefone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-bg-card/60 border border-border-main rounded-lg text-[9px] focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 w-full transition-all duration-500 shadow-inner text-text-main placeholder:text-text-muted font-black tracking-tight"
            />
            <Search className="absolute left-2.5 top-1.5 text-text-muted group-focus-within/search:text-brand-500 transition-colors duration-500" size={12} strokeWidth={2.5} />
          </div>
          <button 
            onClick={onAdd}
            className="w-full sm:w-auto p-1.5 btn-gradient text-white rounded-lg transition-all duration-500 active:scale-95 group/btn flex items-center justify-center gap-2"
            title="Adicionar Cliente"
          >
            <UserPlus size={14} className="group-hover/btn:scale-110 transition-transform duration-500" strokeWidth={2.5} />
            <span className="sm:hidden font-black uppercase tracking-widest text-[8px]">Novo Cliente</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-text-main/5 text-text-muted text-[7px] font-black uppercase tracking-[0.3em]">
              <th className="px-4 py-2.5">Cliente</th>
              <th className="px-3 py-2.5">Documento</th>
              <th className="px-3 py-2.5">Contato</th>
              <th className="px-3 py-2.5">Contratos</th>
              <th className="px-3 py-2.5">Situação</th>
              <th className="px-4 py-2.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-main">
            {filteredCustomers.map(customer => {
              const { activeLoans, hasOverdue } = customerStats[customer.id] || { activeLoans: 0, hasOverdue: false };

              return (
                <tr 
                  key={customer.id} 
                  className="hover:bg-text-main/5 transition-all duration-500 cursor-pointer group/row"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-text-main/5 text-brand-600 rounded-lg flex items-center justify-center text-xs font-black group-hover/row:bg-brand-600 group-hover/row:text-white transition-all duration-500 shadow-inner group-hover/row:scale-110 group-hover/row:rotate-3">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-black text-text-main text-[11px] block group-hover/row:text-brand-600 transition-colors tracking-tight">{customer.name}</span>
                        <span className="text-[6px] text-text-muted font-black uppercase tracking-widest mt-0.5">ID: {customer.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-text-muted text-[8px] font-mono bg-text-main/5 px-1.5 py-0.5 rounded-lg border border-border-main group-hover/row:border-brand-500/30 transition-colors">{customer.document}</span>
                  </td>
                  <td className="px-3 py-2.5 text-text-muted text-[9px] font-black tracking-tight group-hover/row:text-text-main transition-colors">{customer.phone || '-'}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <span className="absolute inset-0 w-1 h-1 rounded-full bg-brand-500 animate-ping opacity-75"></span>
                        <span className="relative block w-1 h-1 rounded-full bg-brand-500"></span>
                      </div>
                      <span className="text-text-muted text-[7px] font-black uppercase tracking-widest">{activeLoans} Ativos</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    {hasOverdue ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-red-500/10 text-red-600 text-[6px] font-black uppercase tracking-widest rounded-full border border-red-500/20 shadow-sm">
                        <span className="w-1 h-1 rounded-full bg-red-500 mr-1 shadow-[0_0_4px_rgba(239,68,68,0.3)]"></span>
                        Em atraso
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-brand-500/10 text-brand-600 text-[6px] font-black uppercase tracking-widest rounded-full border border-brand-500/20 shadow-sm">
                        <span className="w-1 h-1 rounded-full bg-brand-500 mr-1 shadow-[0_0_4px_rgba(var(--brand-500),0.3)]"></span>
                        Em dia
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-all duration-500 translate-x-2 group-hover/row:translate-x-0">
                      <button 
                        className="p-1 btn-gradient-slate text-white rounded-lg transition-all duration-300 shadow-sm border border-border-main"
                        title="Ver Detalhes"
                      >
                        <Eye size={12} strokeWidth={2.5} />
                      </button>
                      <button 
                        className="p-1 btn-gradient-slate text-white rounded-lg transition-all duration-300 shadow-sm border border-border-main"
                        title="Histórico"
                      >
                        <History size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="w-10 h-10 bg-text-main/5 rounded-xl flex items-center justify-center shadow-inner relative group">
                      <div className="absolute inset-0 bg-brand-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <Search className="text-text-muted/40 relative z-10" size={20} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-text-main font-black text-sm tracking-tight">Nenhum cliente encontrado</p>
                      <p className="text-text-muted text-[7px] font-black uppercase tracking-widest">Tente buscar por outro termo ou adicione um novo cliente.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedCustomer && (
          <CustomerDetailsModal 
            isOpen={!!selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            customer={selectedCustomer}
            loans={loans.filter(l => l.customerId === selectedCustomer.id)}
            payments={payments}
            onRegisterPayment={(loan) => {
              setSelectedCustomer(null);
              onRegisterPayment(loan);
            }}
            onEdit={(customer) => {
              setSelectedCustomer(null);
              onEdit(customer);
            }}
            onDelete={(id) => {
              setSelectedCustomer(null);
              onDelete(id);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
