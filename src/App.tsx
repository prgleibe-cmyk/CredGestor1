/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useStorage } from './hooks/useStorage';
import { Loan, View, Customer } from './types';
import { supabase, signInWithGoogle, logout, signInWithEmail, signUpWithEmail } from './supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

// Layout Components
import { MainLayout } from './components/Layout/MainLayout';

// Views
import { DashboardView } from './views/DashboardView';
import { CustomersView } from './views/CustomersView';
import { LoansView } from './views/LoansView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';
import { ReportsView } from './views/ReportsView';
import { AdminView } from './views/AdminView';

// Modals
import { LoanModal } from './components/Modals/LoanModal';
import { CustomerModal } from './components/Modals/CustomerModal';
import { PaymentModal } from './components/Modals/PaymentModal';
import { formatPhoneForWhatsApp, formatCurrency } from './utils/formatters';

import { ErrorBoundary } from './components/ErrorBoundary';
import { InstallPrompt } from './components/InstallPrompt';

// Memoized Views
const MemoizedDashboardView = React.memo(DashboardView);
const MemoizedCustomersView = React.memo(CustomersView);
const MemoizedLoansView = React.memo(LoansView);
const MemoizedHistoryView = React.memo(HistoryView);
const MemoizedSettingsView = React.memo(SettingsView);
const MemoizedReportsView = React.memo(ReportsView);
const MemoizedAdminView = React.memo(AdminView);

// Memoized Modals
const MemoizedLoanModal = React.memo(LoanModal);
const MemoizedCustomerModal = React.memo(CustomerModal);
const MemoizedPaymentModal = React.memo(PaymentModal);

function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, fullName);
      }
    } catch (err: any) {
      console.error('Erro na autenticação:', err);
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  return (
    <div className="h-screen bg-bg-main flex flex-col md:flex-row relative overflow-hidden font-sans text-text-main transition-colors duration-300">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }}></div>
        
        {/* Floating Glass Elements */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[15%] w-64 h-64 bg-bg-card/40 backdrop-blur-3xl rounded-[3rem] border border-border-main/20 shadow-2xl hidden lg:block"
        />
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[10%] left-[5%] w-48 h-48 bg-bg-card/40 backdrop-blur-2xl rounded-[2.5rem] border border-border-main/20 shadow-2xl hidden lg:block"
        />

        <div className="absolute inset-0 bg-[radial-gradient(var(--color-text-main)_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.05]"></div>
        
        {/* Crumpled Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-multiply" 
             style={{ 
               backgroundImage: `url("https://www.transparenttextures.com/patterns/crumpled-paper.png")`,
               backgroundSize: '500px'
             }}>
        </div>
      </div>

      {/* Left Side: Branding & Info */}
      <div className="flex-1 flex flex-col justify-center p-6 md:p-12 lg:p-20 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-xl relative"
        >
          {/* Subtle glass backdrop for text */}
          <div className="absolute -inset-8 bg-bg-card/40 backdrop-blur-sm rounded-[3rem] -z-10 border border-border-main/20 hidden lg:block shadow-xl"></div>

          {/* Logo & Header */}
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-6 md:mb-8">
            <div className="relative group">
              <div className="absolute -inset-3 bg-brand-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <img src="/logo.png" alt="CredGestor" className="h-16 md:h-20 w-auto object-contain relative drop-shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:brightness-110" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-black text-text-main tracking-tight leading-none">CredGestor</h1>
              <p className="text-[9px] font-bold text-brand-600 uppercase tracking-[0.4em] mt-1.5">Enterprise System</p>
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2.5 bg-bg-card/60 border border-border-main/40 px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm shadow-sm">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Tecnologia Certificada</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl lg:text-6xl font-display font-black text-text-main leading-[1.1] mb-5 tracking-tighter">
            Gestão com <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-600 animate-gradient-x">Precisão Absoluta.</span>
          </motion.h2>

          {/* Subtext */}
          <motion.div variants={itemVariants} className="flex gap-6 mb-8">
            <div className="w-1.5 bg-gradient-to-b from-brand-500 to-emerald-500 rounded-full"></div>
            <p className="text-text-muted text-base md:text-lg font-medium leading-relaxed max-w-md">
              A plataforma definitiva para gestão de empréstimos. 
              Segurança, velocidade e controle total em um só lugar.
            </p>
          </motion.div>

          {/* Social Proof */}
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-10 h-10 rounded-full border-4 border-bg-card bg-gradient-to-br shadow-xl ${
                  i === 1 ? 'from-brand-500 to-emerald-500' : 
                  i === 2 ? 'from-blue-500 to-indigo-500' : 
                  i === 3 ? 'from-emerald-500 to-brand-500' : 
                  'from-text-muted/20 to-text-muted/40'
                }`}></div>
              ))}
            </div>
            <div>
              <p className="text-text-main font-black text-sm tracking-tight">Confiança Total</p>
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-[0.2em]">Líderes de todo o Brasil</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side: Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-6 relative z-10 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any, delay: 0.4 }}
          className="bg-bg-card w-full max-w-[420px] rounded-[2.5rem] p-6 md:p-10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] border border-border-main/50 relative overflow-hidden my-auto transition-colors duration-300"
        >
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-500/5 rounded-bl-[2.5rem] -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="text-center mb-6 relative">
            <h3 className="text-xl md:text-2xl font-display font-black text-text-main mb-1 tracking-tight">Bem-vindo</h3>
            <p className="text-text-muted text-[11px] font-semibold">Faça login para acessar sua conta.</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-500/10 text-red-600 text-xs rounded-[1.5rem] font-bold border border-red-500/20 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-2"
                >
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Nome Completo</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-brand-500 transition-colors">
                      <UserIcon size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full pl-12 pr-5 py-3.5 bg-text-main/5 border-2 border-transparent rounded-2xl focus:bg-bg-card focus:border-brand-500/20 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all font-bold text-text-main placeholder:text-text-muted/40 text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Email Corporativo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-brand-500 transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-5 py-3.5 bg-text-main/5 border-2 border-transparent rounded-2xl focus:bg-bg-card focus:border-brand-500/20 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all font-bold text-text-main placeholder:text-text-muted/40 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Senha de Acesso</label>
                <button type="button" className="text-[9px] font-bold text-brand-600 hover:text-brand-700 tracking-wider">ESQUECEU?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-brand-500 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-text-main/5 border-2 border-transparent rounded-2xl focus:bg-bg-card focus:border-brand-500/20 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all font-bold text-text-main placeholder:text-text-muted/40 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-brand-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gradient text-white py-3.5 rounded-2xl font-black transition-all flex items-center justify-center gap-2.5 group disabled:opacity-70 active:scale-[0.98] relative overflow-hidden"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <span className="uppercase tracking-[0.2em] text-[9px]">{isLogin ? 'Entrar na Plataforma' : 'Finalizar Cadastro'}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] font-bold text-text-muted">
              {isLogin ? 'NOVO POR AQUI?' : 'JÁ TEM CONTA?'} {' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-text-main underline underline-offset-8 decoration-2 decoration-brand-500/30 hover:decoration-brand-500 transition-all ml-2"
              >
                {isLogin ? 'CRIAR MINHA CONTA' : 'ENTRAR AGORA'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function AppContent() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Modal States
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
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
    saveSettings,
    isAdmin,
    allUsers,
    systemConfig,
    updateProfile,
    updateSystemConfig
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
    settings: 'Configurações',
    admin: 'Admin'
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
        isAdmin={isAdmin}
      >
        {activeView === 'dashboard' && <MemoizedDashboardView loans={loans} customers={customers} payments={payments} />}
        {activeView === 'customers' && (
          <MemoizedCustomersView 
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
        {activeView === 'loans' && <MemoizedLoansView loans={loans} onPayment={handleOpenPayment} />}
        {activeView === 'history' && <MemoizedHistoryView payments={payments} loans={loans} />}
        {activeView === 'reports' && <MemoizedReportsView loans={loans} customers={customers} payments={payments} />}
        {activeView === 'settings' && (
          <MemoizedSettingsView 
            onClearData={clearAllData} 
            customers={customers} 
            loans={loans} 
            payments={payments} 
            settings={settings}
            onSaveSettings={saveSettings}
          />
        )}
        {activeView === 'admin' && isAdmin && (
          <MemoizedAdminView 
            users={allUsers}
            config={systemConfig}
            onUpdateProfile={updateProfile}
            onUpdateConfig={updateSystemConfig}
          />
        )}
      </MainLayout>

      {/* Modals */}
      <MemoizedLoanModal 
        isOpen={isLoanModalOpen} 
        onClose={() => setIsLoanModalOpen(false)} 
        customers={customers}
        settings={settings}
        onSave={async (loan) => {
          await addLoan(loan);
          setIsLoanModalOpen(false);
        }}
      />
      <MemoizedCustomerModal
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
      <MemoizedPaymentModal
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
      <InstallPrompt />
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
