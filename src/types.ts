export type Frequency = 'daily' | 'weekly' | 'monthly';
export type LoanStatus = 'active' | 'paid' | 'overdue';
export type InterestType = 'simple' | 'compound';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  document: string;
  createdAt: string;
  createdBy: string;
}

export interface Loan {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  interestRate: number;
  interestType: InterestType;
  totalToPay: number;
  remainingAmount: number;
  installmentsCount: number;
  frequency: Frequency;
  startDate: string;
  status: LoanStatus;
  createdAt: string;
  createdBy: string;
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  notes: string;
  createdBy: string;
}

export interface DashboardStats {
  totalLent: number;
  totalToReceive: number;
  totalReceived: number;
  activeLoans: number;
  overdueLoans: number;
}

export interface Settings {
  companyName: string;
  defaultInterestRate: number;
  document?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
}

export type View = 'dashboard' | 'customers' | 'loans' | 'history' | 'settings' | 'reports';
