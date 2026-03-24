import { useState, useEffect } from 'react';
import { Customer, Loan, Payment, Settings, UserProfile, SystemConfig } from '../types';
import { supabase } from '../supabase';

const ADMIN_EMAIL = 'identificapix@gmail.com';

export function useStorage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settings, setSettings] = useState<Settings>({
    companyName: 'CredGestor',
    defaultInterestRate: 10,
    darkMode: false,
    accentColor: '#16a34a'
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    defaultMonthlyFee: 50,
    defaultTrialDays: 7,
    maintenanceMode: false
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(currentUser?.email === ADMIN_EMAIL);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(currentUser?.email === ADMIN_EMAIL);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Upsert profile for the current user
    const upsertProfile = async () => {
      try {
        // First check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!existingProfile) {
          // Fetch system config for default trial days
          const { data: configData } = await supabase
            .from('system_config')
            .select('default_trial_days, default_monthly_fee')
            .single();

          const trialDays = configData?.default_trial_days || 7;
          const monthlyFee = configData?.default_monthly_fee || 50;
          const trialEndsAt = new Date();
          trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

          const { error } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email.split('@')[0],
              role: user.email === ADMIN_EMAIL ? 'admin' : 'user',
              subscription_status: 'active',
              monthly_fee: monthlyFee,
              trial_ends_at: trialEndsAt.toISOString(),
              updated_at: new Date().toISOString()
            });
          if (error) console.error('Error creating profile:', error);
        } else {
          // Update existing profile basic info
          const { error } = await supabase
            .from('profiles')
            .update({
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email.split('@')[0],
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
          if (error) console.error('Error updating profile:', error);
        }
      } catch (err) {
        console.error('Error in upsertProfile:', err);
      }
    };

    upsertProfile();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setCustomers([]);
      setLoans([]);
      setPayments([]);
      setAllUsers([]);
      setLoading(false);
      return;
    }

    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCustomers((data || []).map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        address: c.address,
        document: c.document,
        createdAt: c.created_at,
        createdBy: c.user_id
      })));
    };

    const fetchLoans = async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLoans((data || []).map(l => ({
        id: l.id,
        customerId: l.customer_id,
        customerName: l.customer_name || '',
        amount: Number(l.amount),
        interestRate: Number(l.interest_rate),
        interestType: l.interest_type as any,
        totalToPay: Number(l.total_to_pay),
        remainingAmount: Number(l.remaining_amount),
        installmentsCount: l.installments,
        frequency: l.frequency as any,
        startDate: l.start_date,
        status: l.status as any,
        createdAt: l.created_at,
        createdBy: l.user_id
      })));
    };

    const fetchPayments = async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      setPayments((data || []).map(p => ({
        id: p.id,
        loanId: p.loan_id,
        amount: Number(p.amount),
        date: p.date,
        notes: p.notes || '',
        createdBy: p.user_id
      })));
    };

    const fetchSettings = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle to avoid errors if not found
        
        if (error) throw error;
        if (data) {
          setSettings({
            companyName: data.company_name,
            defaultInterestRate: Number(data.default_interest_rate || 10),
            document: data.document,
            address: data.address,
            phone: data.phone,
            logoUrl: data.logo_url,
            darkMode: data.theme === 'dark',
            accentColor: data.accent_color || '#16a34a'
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };

    const fetchAdminData = async () => {
      if (user?.email !== ADMIN_EMAIL) return;
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!profilesError) {
        setAllUsers((profilesData || []).map(p => ({
          id: p.id,
          email: p.email,
          fullName: p.full_name,
          role: p.role,
          subscriptionStatus: p.subscription_status,
          monthlyFee: Number(p.monthly_fee || 0),
          trialEndsAt: p.trial_ends_at,
          createdAt: p.created_at
        })));
      }

      const { data: configData, error: configError } = await supabase
        .from('system_config')
        .select('*')
        .single();
      
      if (!configError && configData) {
        setSystemConfig({
          defaultMonthlyFee: Number(configData.default_monthly_fee || 50),
          defaultTrialDays: Number(configData.default_trial_days || 7),
          maintenanceMode: configData.maintenance_mode || false
        });
      }
    };

    const fetchData = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        await Promise.all([
          fetchCustomers(),
          fetchLoans(),
          fetchPayments(),
          fetchSettings(),
          fetchAdminData()
        ]);
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    fetchData(true);

    // Set up real-time subscriptions with filters where possible
    const customersSubscription = supabase
      .channel(`public:customers:${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'customers',
        filter: `user_id=eq.${user.id}`
      }, fetchCustomers)
      .subscribe();

    const loansSubscription = supabase
      .channel(`public:loans:${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'loans',
        filter: `user_id=eq.${user.id}`
      }, fetchLoans)
      .subscribe();

    const paymentsSubscription = supabase
      .channel(`public:payments:${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'payments',
        filter: `user_id=eq.${user.id}`
      }, fetchPayments)
      .subscribe();

    const settingsSubscription = supabase
      .channel(`public:settings:${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'settings',
        filter: `user_id=eq.${user.id}` 
      }, fetchSettings)
      .subscribe();

    const profilesSubscription = user.email === ADMIN_EMAIL ? supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchAdminData)
      .subscribe() : null;

    return () => {
      customersSubscription.unsubscribe();
      loansSubscription.unsubscribe();
      paymentsSubscription.unsubscribe();
      settingsSubscription.unsubscribe();
      profilesSubscription?.unsubscribe();
    };
  }, [user]);

  const updateProfile = async (id: string, profileData: Partial<UserProfile>) => {
    if (!isAdmin) return false;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: profileData.subscriptionStatus,
          monthly_fee: profileData.monthlyFee,
          role: profileData.role
        })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const updateSystemConfig = async (config: Partial<SystemConfig>) => {
    if (!isAdmin) return false;
    try {
      const { error } = await supabase
        .from('system_config')
        .upsert({
          id: 1, // Single config record
          default_monthly_fee: config.defaultMonthlyFee,
          default_trial_days: config.defaultTrialDays,
          maintenance_mode: config.maintenanceMode,
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating system config:', error);
      return false;
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!user) return null;
    
    // Optimistic update
    const tempId = Math.random().toString(36).substring(7);
    const newCustomer: Customer = {
      ...customer,
      id: tempId,
      createdAt: new Date().toISOString(),
      createdBy: user.id
    };
    
    setCustomers(prev => [...prev, newCustomer]);

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{ 
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          document: customer.document,
          user_id: user.id 
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update with real data
      setCustomers(prev => prev.map(c => c.id === tempId ? {
        ...data,
        createdAt: data.created_at,
        createdBy: data.user_id
      } : c));

      return {
        ...data,
        createdAt: data.created_at,
        createdBy: data.user_id
      };
    } catch (error) {
      console.error('Error adding customer:', error);
      // Rollback
      setCustomers(prev => prev.filter(c => c.id !== tempId));
      return null;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    // Optimistic update
    const originalCustomers = [...customers];
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customerData } : c));

    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: customerData.name,
          phone: customerData.phone,
          address: customerData.address,
          document: customerData.document
        })
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating customer:', error);
      // Rollback
      setCustomers(originalCustomers);
      return false;
    }
  };

  const deleteCustomer = async (id: string) => {
    // Optimistic update
    const originalCustomers = [...customers];
    setCustomers(prev => prev.filter(c => c.id !== id));

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      // Rollback
      setCustomers(originalCustomers);
      return false;
    }
  };

  const addLoan = async (loan: Omit<Loan, 'id' | 'createdAt' | 'createdBy' | 'status' | 'remainingAmount'>) => {
    if (!user) return null;

    // Optimistic update
    const tempId = Math.random().toString(36).substring(7);
    const newLoan: Loan = {
      ...loan,
      id: tempId,
      status: 'active',
      remainingAmount: loan.totalToPay,
      createdAt: new Date().toISOString(),
      createdBy: user.id
    };

    setLoans(prev => [newLoan, ...prev]);

    try {
      const { data, error } = await supabase
        .from('loans')
        .insert([{ 
          customer_id: loan.customerId,
          customer_name: loan.customerName,
          amount: loan.amount,
          interest_rate: loan.interestRate,
          interest_type: loan.interestType,
          total_to_pay: loan.totalToPay,
          remaining_amount: loan.totalToPay,
          installments: loan.installmentsCount,
          frequency: loan.frequency,
          start_date: loan.startDate,
          status: 'active',
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;

      // Update with real data
      setLoans(prev => prev.map(l => l.id === tempId ? {
        ...data,
        customerId: data.customer_id,
        customerName: data.customer_name,
        totalToPay: data.total_to_pay,
        remainingAmount: data.remaining_amount,
        installmentsCount: data.installments,
        createdAt: data.created_at,
        createdBy: data.user_id
      } : l));

      return {
        ...data,
        customerId: data.customer_id,
        customerName: data.customer_name,
        totalToPay: data.total_to_pay,
        remainingAmount: data.remaining_amount,
        installmentsCount: data.installments,
        createdAt: data.created_at,
        createdBy: data.user_id
      };
    } catch (error) {
      console.error('Error adding loan:', error);
      // Rollback
      setLoans(prev => prev.filter(l => l.id !== tempId));
      return null;
    }
  };

  const updateLoan = async (id: string, loanData: Partial<Loan>) => {
    try {
      const updateData: any = {};
      if (loanData.status) updateData.status = loanData.status;
      if (loanData.remainingAmount !== undefined) updateData.remaining_amount = loanData.remainingAmount;

      const { error } = await supabase
        .from('loans')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating loan:', error);
      return false;
    }
  };

  const deleteLoan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting loan:', error);
      return false;
    }
  };

  const addPayment = async (paymentData: Omit<Payment, 'id' | 'createdBy'>) => {
    if (!user) return null;

    // Optimistic update
    const tempId = Math.random().toString(36).substring(7);
    const newPayment: Payment = {
      ...paymentData,
      id: tempId,
      createdBy: user.id
    };

    const originalPayments = [...payments];
    const originalLoans = [...loans];

    setPayments(prev => [newPayment, ...prev]);
    setLoans(prev => prev.map(l => {
      if (l.id === paymentData.loanId) {
        const newRemaining = Math.max(0, l.remainingAmount - paymentData.amount);
        return {
          ...l,
          remainingAmount: newRemaining,
          status: newRemaining <= 0 ? 'paid' : l.status
        };
      }
      return l;
    }));

    try {
      // 1. Add payment
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert([{ 
          loan_id: paymentData.loanId,
          amount: paymentData.amount,
          date: paymentData.date,
          notes: paymentData.notes,
          user_id: user.id 
        }])
        .select()
        .single();
      
      if (paymentError) throw paymentError;

      // 2. Update loan remaining amount
      const { data: loan, error: loanFetchError } = await supabase
        .from('loans')
        .select('remaining_amount, status')
        .eq('id', paymentData.loanId)
        .single();
      
      if (loanFetchError) throw loanFetchError;

      const newRemaining = Math.max(0, Number(loan.remaining_amount) - paymentData.amount);
      const newStatus = newRemaining <= 0 ? 'paid' : loan.status;

      const { error: loanUpdateError } = await supabase
        .from('loans')
        .update({ 
          remaining_amount: newRemaining,
          status: newStatus
        })
        .eq('id', paymentData.loanId);
      
      if (loanUpdateError) throw loanUpdateError;

      // Update with real data
      setPayments(prev => prev.map(p => p.id === tempId ? {
        ...payment,
        loanId: payment.loan_id,
        createdBy: payment.user_id
      } : p));

      return {
        ...payment,
        loanId: payment.loan_id,
        createdBy: payment.user_id
      };
    } catch (error) {
      console.error('Error adding payment:', error);
      // Rollback
      setPayments(originalPayments);
      setLoans(originalLoans);
      return null;
    }
  };

  const clearAllData = async () => {
    if (!user) return;
    try {
      await supabase.from('payments').delete().eq('user_id', user.id);
      await supabase.from('loans').delete().eq('user_id', user.id);
      await supabase.from('customers').delete().eq('user_id', user.id);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          user_id: user.id,
          company_name: newSettings.companyName,
          default_interest_rate: newSettings.defaultInterestRate,
          document: newSettings.document,
          address: newSettings.address,
          phone: newSettings.phone,
          logo_url: newSettings.logoUrl,
          theme: newSettings.darkMode ? 'dark' : 'light',
          accent_color: newSettings.accentColor
        }, {
          onConflict: 'user_id'
        });
      
      if (error) throw error;
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  };

  return {
    customers,
    loans,
    payments,
    settings,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addLoan,
    updateLoan,
    deleteLoan,
    addPayment,
    clearAllData,
    saveSettings,
    isAdmin,
    allUsers,
    systemConfig,
    updateProfile,
    updateSystemConfig
  };
}
