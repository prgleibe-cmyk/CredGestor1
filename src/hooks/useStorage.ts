import { useState, useEffect } from 'react';
import { Customer, Loan, Payment, Settings } from '../types';
import { supabase } from '../supabase';

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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setCustomers([]);
      setLoans([]);
      setPayments([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Customers
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('*')
          .order('name');
        
        if (customersError) throw customersError;
        setCustomers((customersData || []).map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          address: c.address,
          document: c.document,
          createdAt: c.created_at,
          createdBy: c.user_id
        })));

        // Fetch Loans
        const { data: loansData, error: loansError } = await supabase
          .from('loans')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (loansError) throw loansError;
        setLoans((loansData || []).map(l => ({
          id: l.id,
          customerId: l.customer_id,
          customerName: l.customer_name || '', // Assuming we might add this or join
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

        // Fetch Payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .order('date', { ascending: false });
        
        if (paymentsError) throw paymentsError;
        setPayments((paymentsData || []).map(p => ({
          id: p.id,
          loanId: p.loan_id,
          amount: Number(p.amount),
          date: p.date,
          notes: p.notes || '',
          createdBy: p.user_id
        })));

        // Fetch Settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
        if (settingsData) {
          setSettings({
            companyName: settingsData.company_name,
            defaultInterestRate: Number(settingsData.default_interest_rate || 10),
            document: settingsData.document,
            address: settingsData.address,
            phone: settingsData.phone,
            logoUrl: settingsData.logo_url,
            darkMode: settingsData.theme === 'dark',
            accentColor: settingsData.accent_color || '#16a34a'
          });
        }
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const customersSubscription = supabase
      .channel('public:customers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, fetchData)
      .subscribe();

    const loansSubscription = supabase
      .channel('public:loans')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, fetchData)
      .subscribe();

    const paymentsSubscription = supabase
      .channel('public:payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchData)
      .subscribe();

    const settingsSubscription = supabase
      .channel('public:settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, fetchData)
      .subscribe();

    return () => {
      customersSubscription.unsubscribe();
      loansSubscription.unsubscribe();
      paymentsSubscription.unsubscribe();
      settingsSubscription.unsubscribe();
    };
  }, [user]);

  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!user) return null;
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
      return {
        ...data,
        createdAt: data.created_at,
        createdBy: data.user_id
      };
    } catch (error) {
      console.error('Error adding customer:', error);
      return null;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
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
      return false;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      return false;
    }
  };

  const addLoan = async (loan: Omit<Loan, 'id' | 'createdAt' | 'createdBy' | 'status' | 'remainingAmount'>) => {
    if (!user) return null;
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

      return {
        ...payment,
        loanId: payment.loan_id,
        createdBy: payment.user_id
      };
    } catch (error) {
      console.error('Error adding payment:', error);
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
        });
      
      if (error) throw error;
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
    saveSettings
  };
}
