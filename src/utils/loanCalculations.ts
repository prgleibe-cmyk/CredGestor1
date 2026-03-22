import { Loan, Payment, Frequency } from '../types';
import { addDays, addWeeks, addMonths, isAfter, differenceInDays } from 'date-fns';

export function calculateNextDueDate(loan: Loan, payments: Payment[]): Date {
  const installmentsPaid = payments.filter(p => p.loanId === loan.id).length;
  const startDate = new Date(loan.startDate);
  
  switch (loan.frequency) {
    case 'daily':
      return addDays(startDate, installmentsPaid);
    case 'weekly':
      return addWeeks(startDate, installmentsPaid);
    case 'monthly':
      return addMonths(startDate, installmentsPaid);
    default:
      return startDate;
  }
}

export function calculateCorrectedValue(loan: Loan, payments: Payment[]): { normal: number; corrected: number; delayDays: number } {
  const normalValue = loan.totalToPay / loan.installmentsCount;
  const nextDueDate = calculateNextDueDate(loan, payments);
  const today = new Date();
  
  if (isAfter(today, nextDueDate)) {
    const delayDays = differenceInDays(today, nextDueDate);
    // Simple penalty calculation: 2% fixed penalty + 0.1% per day of delay
    const penalty = normalValue * 0.02;
    const dailyInterest = normalValue * 0.001 * delayDays;
    const correctedValue = normalValue + penalty + dailyInterest;
    
    return {
      normal: normalValue,
      corrected: correctedValue,
      delayDays
    };
  }
  
  return {
    normal: normalValue,
    corrected: normalValue,
    delayDays: 0
  };
}
