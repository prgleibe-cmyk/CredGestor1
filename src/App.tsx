/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useStorage } from './hooks/useStorage';
import { Loan, View, Customer } from './types';
import { auth, signInWithGoogle, logout, onAuthStateChanged } from './firebase';
import { User } from 'firebase/auth';

// Layout Components
import { MainLayout } from './components/Layout/MainLayout';

// Views
import { DashboardView } from './views/DashboardView';
import { CustomersView } from './views/CustomersView';
import { LoansView } from './views/LoansView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';
import { ReportsView } from './views/ReportsView';

// Modals
import { LoanModal } from './components/Modals/LoanModal';
import { CustomerModal } from './components/Modals/CustomerModal';
import { PaymentModal } from './components/Modals/PaymentModal';
import { formatPhoneForWhatsApp, formatCurrency } from './utils/formatters';

import { ErrorBoundary } from './components/ErrorBoundary';

function LoginScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-neutral-100">
        <img src="/logo.png" alt="CredGestor" className="h-20 mx-auto mb-8" referrerPolicy="no-referrer" />
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">Bem-vindo ao CredGestor</h2>
        <p className="text-neutral-500 mb-8">Gerencie seus empréstimos de forma profissional e segura.</p>
        <button 
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white border border-neutral-200 py-3 px-4 rounded-2xl hover:bg-neutral-50 transition-all font-medium text-neutral-700 shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Entrar com Google
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Modal States
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Data Logic
  const { 
    customers, 
    loans, 
    payments, 
    settings,
    loading: dataLoading,
    addCustomer, 
    updateCustomer,
    deleteCustomer,
    addLoan, 
    addPayment, 
    clearAllData,
    saveSettings
  } = useStorage();

  const handleOpenPayment = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsPaymentModalOpen(true);
  };

  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-6">
          <img src="/logo.png" alt="CredGestor" className="h-24 w-auto object-contain animate-pulse" referrerPolicy="no-referrer" />
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm">CredGestor</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const viewLabels: Record<View, string> = {
    dashboard: 'Dashboard',
    customers: 'Clientes',
    loans: 'Empréstimos',
    history: 'Histórico',
    reports: 'Relatórios',
    settings: 'Configurações'
  };

  return (
    <>
      <MainLayout
        activeView={activeView}
        setActiveView={setActiveView}
        title={viewLabels[activeView]}
        onNewLoan={() => setIsLoanModalOpen(true)}
        user={user}
        onLogout={logout}
        settings={settings}
      >
        {activeView === 'dashboard' && <DashboardView loans={loans} customers={customers} payments={payments} />}
        {activeView === 'customers' && (
          <CustomersView 
            customers={customers} 
            loans={loans} 
            payments={payments}
            onAdd={() => {
              setEditingCustomer(null);
              setIsCustomerModalOpen(true);
            }} 
            onEdit={(customer) => {
              setEditingCustomer(customer);
              setIsCustomerModalOpen(true);
            }}
            onDelete={async (id) => {
              await deleteCustomer(id);
            }}
            onRegisterPayment={(loan) => {
              setSelectedLoan(loan);
              setIsPaymentModalOpen(true);
            }}
          />
        )}
        {activeView === 'loans' && <LoansView loans={loans} onPayment={handleOpenPayment} />}
        {activeView === 'history' && <HistoryView payments={payments} loans={loans} />}
        {activeView === 'reports' && <ReportsView loans={loans} customers={customers} payments={payments} />}
        {activeView === 'settings' && (
          <SettingsView 
            onClearData={clearAllData} 
            customers={customers} 
            loans={loans} 
            payments={payments} 
            settings={settings}
            onSaveSettings={saveSettings}
          />
        )}
      </MainLayout>

      {/* Modals */}
      <LoanModal 
        isOpen={isLoanModalOpen} 
        onClose={() => setIsLoanModalOpen(false)} 
        customers={customers}
        settings={settings}
        onSave={async (loan) => {
          await addLoan(loan);
          setIsLoanModalOpen(false);
        }}
      />
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customer={editingCustomer}
        onSave={async (customerData) => {
          if (editingCustomer) {
            await updateCustomer(editingCustomer.id, customerData);
          } else {
            await addCustomer(customerData);
          }
          setIsCustomerModalOpen(false);
        }}
      />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        loan={selectedLoan}
        payments={payments}
        customers={customers}
        settings={settings}
        onSave={async (paymentData, sendWhatsApp) => {
          await addPayment(paymentData);
          
          if (sendWhatsApp && selectedLoan) {
            const customer = customers.find(c => c.id === selectedLoan.customerId);
            if (customer?.phone) {
              const phone = formatPhoneForWhatsApp(customer.phone);
              const message = encodeURIComponent(
                `*Comprovante de Pagamento - ${settings.companyName}*\n\n` +
                `Olá, *${customer.name}*!\n` +
                `Recebemos seu pagamento no valor de *${formatCurrency(paymentData.amount)}*.\n\n` +
                `*Detalhes:*\n` +
                `Data: ${new Date().toLocaleDateString('pt-BR')}\n` +
                `Saldo Restante: ${formatCurrency(selectedLoan.remainingAmount - paymentData.amount)}\n\n` +
                `Obrigado!`
              );
              const whatsappWindow = window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
              if (!whatsappWindow) {
                alert('O WhatsApp foi bloqueado pelo navegador. Por favor, permita pop-ups para este site.');
              }
            }
          }
          
          setIsPaymentModalOpen(false);
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
