import { useState, useEffect } from 'react';
import { Customer, Loan, Payment } from '../types';
import { supabase } from '../lib/supabase';

export function useStorage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: customersData } = await supabase.from('customers').select('*');
      const { data: loansData } = await supabase.from('loans').select('*');
      const { data: paymentsData } = await supabase.from('payments').select('*');

      if (customersData) setCustomers(customersData);
      if (loansData) setLoans(loansData);
      if (paymentsData) setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'createdBy'>) => {
    const newCustomer = {
      ...customer,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
    };

    const { error } = await supabase.from('customers').insert([newCustomer]);
    if (error) {
      console.error('Error adding customer:', error);
      return null;
    }

    setCustomers(prev => [...prev, newCustomer as Customer]);
    return newCustomer;
  };

  const addLoan = async (loanData: Omit<Loan, 'id' | 'createdAt' | 'createdBy' | 'status' | 'remainingAmount'>) => {
    const newLoan = {
      ...loanData,
      id: crypto.randomUUID(),
      status: 'active',
      remainingAmount: loanData.totalToPay,
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
    };

    const { error } = await supabase.from('loans').insert([newLoan]);
    if (error) {
      console.error('Error adding loan:', error);
      return null;
    }

    setLoans(prev => [...prev, newLoan as Loan]);
    return newLoan;
  };

  const addPayment = async (paymentData: Omit<Payment, 'id' | 'createdBy'>) => {
    const newPayment = {
      ...paymentData,
      id: crypto.randomUUID(),
      createdBy: 'admin',
    };
    
    const { error: paymentError } = await supabase.from('payments').insert([newPayment]);
    if (paymentError) {
      console.error('Error adding payment:', paymentError);
      return null;
    }

    setPayments(prev => [...prev, newPayment as Payment]);
    
    // Update loan remaining amount
    const loan = loans.find(l => l.id === paymentData.loanId);
    if (loan) {
      const remaining = loan.remainingAmount - paymentData.amount;
      const status = remaining <= 0 ? 'paid' : loan.status;

      const { error: loanError } = await supabase
        .from('loans')
        .update({ remainingAmount: Math.max(0, remaining), status })
        .eq('id', loan.id);

      if (loanError) {
        console.error('Error updating loan:', loanError);
      } else {
        setLoans(prevLoans => prevLoans.map(l => {
          if (l.id === loan.id) {
            return {
              ...l,
              remainingAmount: Math.max(0, remaining),
              status
            };
          }
          return l;
        }));
      }
    }

    return newPayment;
  };

  const clearAllData = async () => {
    // In Supabase, we might not want to clear everything easily, 
    // but for the sake of the request:
    await supabase.from('payments').delete().neq('id', '0');
    await supabase.from('loans').delete().neq('id', '0');
    await supabase.from('customers').delete().neq('id', '0');
    
    setCustomers([]);
    setLoans([]);
    setPayments([]);
  };

  return {
    customers,
    loans,
    payments,
    loading,
    addCustomer,
    addLoan,
    addPayment,
    clearAllData
  };
}
