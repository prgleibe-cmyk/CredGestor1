import React, { useState } from 'react';
import { Search, UserPlus, History } from 'lucide-react';
import { Customer, Loan } from '../types';

interface CustomersViewProps {
  customers: Customer[];
  loans: Loan[];
  onAdd: () => void;
}

export function CustomersView({ customers, loans, onAdd }: CustomersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="font-semibold">Lista de Clientes</h3>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full sm:w-64"
            />
            <Search className="absolute left-3 top-2.5 text-neutral-400" size={16} />
          </div>
          <button 
            onClick={onAdd}
            className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <UserPlus size={20} />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Nome</th>
              <th className="px-6 py-4 font-medium">Telefone</th>
              <th className="px-6 py-4 font-medium">Empréstimos</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredCustomers.map(customer => {
              const customerLoans = loans.filter(l => l.customerId === customer.id);
              const activeLoans = customerLoans.filter(l => l.status === 'active').length;
              const hasOverdue = customerLoans.some(l => l.status === 'overdue');

              return (
                <tr key={customer.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="font-medium text-neutral-700">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-500 text-sm">{customer.phone}</td>
                  <td className="px-6 py-4 text-neutral-500 text-sm">{activeLoans} ativos</td>
                  <td className="px-6 py-4">
                    {hasOverdue ? (
                      <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-md">Em atraso</span>
                    ) : (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-md">Em dia</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-neutral-400 hover:text-emerald-600 transition-colors">
                      <History size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-neutral-400">Nenhum cliente encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
