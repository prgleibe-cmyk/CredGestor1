import React, { useState } from 'react';
import { Search, UserPlus, History, Eye } from 'lucide-react';
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

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.document.includes(searchTerm)
  );

  return (
    <div className="glass-card rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden mb-12">
      <div className="p-8 md:p-10 border-b border-slate-200 flex flex-col lg:flex-row justify-between lg:items-center gap-8 bg-slate-900/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl transition-all duration-700 group-hover:bg-emerald-500/20"></div>
        
        <div className="relative z-10">
          <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight">Lista de Clientes</h3>
          <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2">Gerencie sua base de contatos e contratos</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto relative z-10">
          <div className="relative w-full sm:w-96 group/search">
            <input 
              type="text" 
              placeholder="Buscar por nome, CPF ou telefone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 pr-6 py-4 bg-white/60 border border-slate-200 rounded-[1.5rem] text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 w-full transition-all duration-500 shadow-inner text-slate-900 placeholder:text-slate-400 font-black tracking-tight"
            />
            <Search className="absolute left-5 top-4 text-slate-400 group-focus-within/search:text-emerald-500 transition-colors duration-500" size={22} strokeWidth={2.5} />
          </div>
          <button 
            onClick={onAdd}
            className="w-full sm:w-auto p-4 btn-gradient text-white rounded-[1.5rem] transition-all duration-500 active:scale-95 group/btn flex items-center justify-center gap-3"
            title="Adicionar Cliente"
          >
            <UserPlus size={22} className="group-hover/btn:scale-110 transition-transform duration-500" strokeWidth={2.5} />
            <span className="sm:hidden font-black uppercase tracking-widest text-[10px]">Novo Cliente</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/5 text-slate-500 text-[11px] font-black uppercase tracking-[0.3em]">
              <th className="px-10 py-6">Cliente</th>
              <th className="px-8 py-6">Documento</th>
              <th className="px-8 py-6">Contato</th>
              <th className="px-8 py-6">Contratos</th>
              <th className="px-8 py-6">Situação</th>
              <th className="px-10 py-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredCustomers.map(customer => {
              const customerLoans = loans.filter(l => l.customerId === customer.id);
              const activeLoans = customerLoans.filter(l => l.status === 'active').length;
              const hasOverdue = customerLoans.some(l => l.status === 'overdue');
 
              return (
                <tr 
                  key={customer.id} 
                  className="hover:bg-slate-900/5 transition-all duration-500 cursor-pointer group/row"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-900/5 text-emerald-600 rounded-[1.2rem] flex items-center justify-center text-xl font-black group-hover/row:bg-emerald-600 group-hover/row:text-white transition-all duration-500 shadow-inner group-hover/row:scale-110 group-hover/row:rotate-3">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-black text-slate-900 text-[16px] block group-hover/row:text-emerald-600 transition-colors tracking-tight">{customer.name}</span>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">ID: {customer.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-slate-500 text-xs font-mono bg-slate-900/5 px-3 py-1.5 rounded-xl border border-slate-200 group-hover/row:border-emerald-500/30 transition-colors">{customer.document}</span>
                  </td>
                  <td className="px-8 py-6 text-slate-500 text-sm font-black tracking-tight group-hover/row:text-slate-900 transition-colors">{customer.phone || '-'}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75"></span>
                        <span className="relative block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      </div>
                      <span className="text-slate-500 text-sm font-black uppercase tracking-widest">{activeLoans} Ativos</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {hasOverdue ? (
                      <span className="inline-flex items-center px-4 py-2 bg-red-500/10 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-500/20 shadow-lg shadow-red-500/5">
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2 shadow-[0_0_8px_rgba(239,68,68,0.3)]"></span>
                        Em atraso
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-4 py-2 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></span>
                        Em dia
                      </span>
                    )}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all duration-500 translate-x-4 group-hover/row:translate-x-0">
                      <button 
                        className="p-3 btn-gradient-slate text-white rounded-2xl transition-all duration-300 shadow-xl border border-slate-200"
                        title="Ver Detalhes"
                      >
                        <Eye size={20} strokeWidth={2.5} />
                      </button>
                      <button 
                        className="p-3 btn-gradient-slate text-white rounded-2xl transition-all duration-300 shadow-xl border border-slate-200"
                        title="Histórico"
                      >
                        <History size={20} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-10 py-24 text-center">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-24 h-24 bg-slate-900/5 rounded-[2rem] flex items-center justify-center shadow-inner relative group">
                      <div className="absolute inset-0 bg-emerald-500/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <Search className="text-slate-300 relative z-10" size={48} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-slate-900 font-black text-2xl tracking-tight">Nenhum cliente encontrado</p>
                      <p className="text-slate-500 text-sm font-black uppercase tracking-widest">Tente buscar por outro termo ou adicione um novo cliente.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CustomerDetailsModal 
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
        loans={loans}
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
    </div>
  );
}
