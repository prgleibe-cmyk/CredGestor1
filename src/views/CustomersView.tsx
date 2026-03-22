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
    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 neo-shadow overflow-hidden">
      <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50/30">
        <div>
          <h3 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">Lista de Clientes</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Gerencie sua base de contatos e contratos</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input 
              type="text" 
              placeholder="Buscar por nome, CPF ou telefone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 w-full sm:w-80 transition-all shadow-sm"
            />
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          </div>
          <button 
            onClick={onAdd}
            className="p-3.5 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 active:scale-95 group"
            title="Adicionar Cliente"
          >
            <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-[0.1em]">
              <th className="px-8 py-5">Cliente</th>
              <th className="px-6 py-5">Documento</th>
              <th className="px-6 py-5">Contato</th>
              <th className="px-6 py-5">Contratos</th>
              <th className="px-6 py-5">Situação</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCustomers.map(customer => {
              const customerLoans = loans.filter(l => l.customerId === customer.id);
              const activeLoans = customerLoans.filter(l => l.status === 'active').length;
              const hasOverdue = customerLoans.some(l => l.status === 'overdue');

              return (
                <tr 
                  key={customer.id} 
                  className="hover:bg-slate-50/80 transition-all cursor-pointer group"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center text-sm font-black group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-[15px] block group-hover:text-brand-700 transition-colors">{customer.name}</span>
                        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-tighter">ID: {customer.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-slate-600 text-sm font-mono bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/50">{customer.document}</span>
                  </td>
                  <td className="px-6 py-5 text-slate-500 text-sm font-medium">{customer.phone || '-'}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                      <span className="text-slate-700 text-sm font-bold">{activeLoans} Ativos</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {hasOverdue ? (
                      <span className="inline-flex items-center px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-full border border-red-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2"></span>
                        Em atraso
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-2"></span>
                        Em dia
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        className="p-2.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Histórico"
                      >
                        <History size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                      <Search className="text-slate-300" size={32} />
                    </div>
                    <p className="text-slate-400 font-bold text-lg">Nenhum cliente encontrado</p>
                    <p className="text-slate-400 text-sm">Tente buscar por outro termo ou adicione um novo cliente.</p>
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
