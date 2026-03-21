/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStorage } from './hooks/useStorage';
import { Loan, View } from './types';

// Layout Components
import { MainLayout } from './components/Layout/MainLayout';

// Views
import { DashboardView } from './views/DashboardView';
import { CustomersView } from './views/CustomersView';
import { LoansView } from './views/LoansView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';

// Modals
import { LoanModal } from './components/Modals/LoanModal';
import { CustomerModal } from './components/Modals/CustomerModal';
import { PaymentModal } from './components/Modals/PaymentModal';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  
  // Modal States
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // Data Logic
  const { 
    customers, 
    loans, 
    payments, 
    loading,
    addCustomer, 
    addLoan, 
    addPayment, 
    clearAllData 
  } = useStorage();

  const handleOpenPayment = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsPaymentModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neutral-500 font-medium">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const views = {
    dashboard: {
      label: 'Dashboard',
      component: <DashboardView loans={loans} customers={customers} payments={payments} />
    },
    customers: {
      label: 'Clientes',
      component: <CustomersView customers={customers} loans={loans} onAdd={() => setIsCustomerModalOpen(true)} />
    },
    loans: {
      label: 'Empréstimos',
      component: <LoansView loans={loans} onPayment={handleOpenPayment} />
    },
    history: {
      label: 'Histórico',
      component: <HistoryView payments={payments} loans={loans} />
    },
    settings: {
      label: 'Configurações',
      component: <SettingsView onClearData={clearAllData} />
    }
  };

  return (
    <>
      <MainLayout
        activeView={activeView}
        setActiveView={setActiveView}
        title={views[activeView].label}
        onNewLoan={() => setIsLoanModalOpen(true)}
      >
        {views[activeView].component}
      </MainLayout>

      {/* Modals */}
      <LoanModal 
        isOpen={isLoanModalOpen} 
        onClose={() => setIsLoanModalOpen(false)} 
        customers={customers}
        onSave={async (loan) => {
          await addLoan(loan);
          setIsLoanModalOpen(false);
        }}
      />
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={async (customer) => {
          await addCustomer(customer);
          setIsCustomerModalOpen(false);
        }}
      />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        loan={selectedLoan}
        onSave={async (payment) => {
          await addPayment(payment);
          setIsPaymentModalOpen(false);
        }}
      />
    </>
  );
}
