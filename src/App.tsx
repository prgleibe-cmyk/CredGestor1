/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useStorage } from './hooks/useStorage';
import { Loan, View, Customer } from './types';
import { auth, signInWithGoogle, logout, onAuthStateChanged } from './firebase';
import { User } from 'firebase/auth';
import { motion } from 'motion/react';

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
    <div className="min-h-screen flex items-center justify-center bg-bg-main p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background blobs for modern look */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-200/30 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass p-10 rounded-[2.5rem] neo-shadow-lg max-w-md w-full text-center relative z-10"
      >
        <div className="relative inline-block mb-10">
          <div className="absolute -inset-4 bg-brand-500/20 rounded-full blur-xl animate-pulse"></div>
          <img src="/logo.png" alt="CredGestor" className="h-24 mx-auto relative dark:brightness-110" referrerPolicy="no-referrer" />
        </div>
        
        <h2 className="text-3xl font-display font-extrabold text-text-main mb-3 tracking-tight">
          Bem-vindo ao <span className="text-brand-600">CredGestor</span>
        </h2>
        <p className="text-text-muted mb-10 font-medium leading-relaxed">
          Gerencie seus empréstimos com a plataforma mais moderna e segura do mercado.
        </p>
        
        <button 
          onClick={signInWithGoogle}
          className="group w-full flex items-center justify-center gap-4 bg-bg-card border border-border-main py-4 px-6 rounded-2xl hover:border-brand-500 hover:bg-brand-50/50 transition-all duration-300 font-bold text-text-main shadow-sm hover:shadow-brand-100"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[15px]">Entrar com Google</span>
        </button>
        
        <div className="mt-10 pt-8 border-t border-border-main">
          <p className="text-xs text-text-muted font-semibold uppercase tracking-widest">
            Tecnologia de Ponta para sua Gestão
          </p>
        </div>
      </motion.div>
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

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    if (settings.accentColor) {
      document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    }
  }, [settings.darkMode, settings.accentColor]);

  const handleOpenPayment = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsPaymentModalOpen(true);
  };

  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main transition-colors duration-300">
        <div className="flex flex-col items-center gap-6">
          <img src="/logo.png" alt="CredGestor" className="h-24 w-auto object-contain animate-pulse dark:brightness-110" referrerPolicy="no-referrer" />
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-text-muted font-bold uppercase tracking-widest text-sm">CredGestor</p>
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
          try {
            console.log('onSave paymentData:', paymentData, 'sendWhatsApp:', sendWhatsApp);
            
            // 1. Prepare WhatsApp URL if needed
            let whatsappUrl = '';
            if (sendWhatsApp && selectedLoan) {
              const customer = customers.find(c => c.id === selectedLoan.customerId);
              if (customer?.phone) {
                const phone = formatPhoneForWhatsApp(customer.phone);
                const message = encodeURIComponent(
                  `*Comprovante de Pagamento - ${settings.companyName}*\n\n` +
                  `Olá, *${customer.name}*!\n` +
                  `Recebemos seu pagamento no valor de *${formatCurrency(paymentData.amount)}*.\n\n` +
                  `*Detalhes:*\n` +
                  `Data: ${new Date(paymentData.date).toLocaleDateString('pt-BR')}\n` +
                  `Saldo Restante: ${formatCurrency(Math.max(0, selectedLoan.remainingAmount - paymentData.amount))}\n\n` +
                  `Obrigado!`
                );
                whatsappUrl = `https://wa.me/${phone}?text=${message}`;
                console.log('Prepared WhatsApp URL:', whatsappUrl);
              }
            }

            // 2. Open WhatsApp window IMMEDIATELY if needed (before any await)
            // This ensures the browser treats it as a direct user action
            let whatsappWindow: Window | null = null;
            if (whatsappUrl) {
              console.log('Opening WhatsApp window...');
              whatsappWindow = window.open(whatsappUrl, '_blank');
              if (!whatsappWindow) {
                console.warn('WhatsApp popup blocked');
                alert('O WhatsApp foi bloqueado pelo navegador. Por favor, permita pop-ups para este site para enviar o comprovante automaticamente.');
              }
            }

            // 3. Save the payment
            console.log('Calling addPayment...');
            const result = await addPayment(paymentData);
            console.log('addPayment result:', result);
            
            if (result) {
              // 4. Close the modal only on success
              console.log('Closing payment modal');
              setIsPaymentModalOpen(false);
              setSelectedLoan(null);
            } else {
              console.warn('addPayment returned null, modal not closing');
            }
          } catch (error) {
            console.error('Error in onSave payment in App.tsx:', error);
            throw error; // Re-throw to be caught by PaymentModal
          }
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
