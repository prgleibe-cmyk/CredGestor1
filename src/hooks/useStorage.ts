import { useState, useEffect } from 'react';
import { Customer, Loan, Payment, Settings } from '../types';
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  getDocFromServer,
  setDoc,
  Timestamp,
  orderBy
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useStorage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settings, setSettings] = useState<Settings>({
    companyName: 'CredGestor',
    defaultInterestRate: 10
  });
  const [loading, setLoading] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const isLoading = loading || !settingsLoaded || !dataLoaded;

  // Test connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const userId = auth.currentUser.uid;
    
    const customersQuery = query(
      collection(db, 'customers'), 
      where('createdBy', '==', userId)
    );
    const customersUnsubscribe = onSnapshot(customersQuery, (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(customersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'customers');
    });

    const loansQuery = query(
      collection(db, 'loans'), 
      where('createdBy', '==', userId)
    );
    const loansUnsubscribe = onSnapshot(loansQuery, (snapshot) => {
      const loansData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Loan));
      setLoans(loansData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'loans');
    });

    const paymentsQuery = query(
      collection(db, 'payments'), 
      where('createdBy', '==', userId)
    );
    const paymentsUnsubscribe = onSnapshot(paymentsQuery, (snapshot) => {
      const paymentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
      setPayments(paymentsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'payments');
    });

    const settingsDoc = doc(db, 'settings', userId);
    const settingsUnsubscribe = onSnapshot(settingsDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Settings;
        setSettings(data);
      } else {
        // If doc doesn't exist, we keep the default state but mark as loaded
        setSettings({
          companyName: 'CredGestor',
          defaultInterestRate: 10
        });
      }
      setSettingsLoaded(true);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings');
      setSettingsLoaded(true);
    });

    return () => {
      customersUnsubscribe();
      loansUnsubscribe();
      paymentsUnsubscribe();
      settingsUnsubscribe();
    };
  }, [auth.currentUser]);

  // Combined loading state
  const isDataLoading = loading || !settingsLoaded;

  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'createdBy'>) => {
    const newCustomer = {
      ...customer,
      createdAt: new Date().toISOString(),
      createdBy: auth.currentUser?.uid || 'admin',
    };

    try {
      const docRef = await addDoc(collection(db, 'customers'), newCustomer);
      return { id: docRef.id, ...newCustomer };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'customers');
      return null;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const docRef = doc(db, 'customers', id);
      await updateDoc(docRef, customerData);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'customers');
      return false;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const batch = writeBatch(db);
      
      // Delete customer
      batch.delete(doc(db, 'customers', id));
      
      // Delete associated loans and payments
      const loansSnap = await getDocs(query(collection(db, 'loans'), where('customerId', '==', id)));
      for (const loanDoc of loansSnap.docs) {
        batch.delete(loanDoc.ref);
        const paymentsSnap = await getDocs(query(collection(db, 'payments'), where('loanId', '==', loanDoc.id)));
        paymentsSnap.forEach(p => batch.delete(p.ref));
      }
      
      await batch.commit();
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'customers');
      return false;
    }
  };

  const addLoan = async (loanData: Omit<Loan, 'id' | 'createdAt' | 'createdBy' | 'status' | 'remainingAmount'>) => {
    const newLoan = {
      ...loanData,
      status: 'active',
      remainingAmount: loanData.totalToPay,
      createdAt: new Date().toISOString(),
      createdBy: auth.currentUser?.uid || 'admin',
    };

    try {
      const docRef = await addDoc(collection(db, 'loans'), newLoan);
      return { id: docRef.id, ...newLoan };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'loans');
      return null;
    }
  };

  const updateLoan = async (id: string, loanData: Partial<Loan>) => {
    try {
      const docRef = doc(db, 'loans', id);
      await updateDoc(docRef, loanData);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'loans');
      return false;
    }
  };

  const deleteLoan = async (id: string) => {
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'loans', id));
      
      const paymentsSnap = await getDocs(query(collection(db, 'payments'), where('loanId', '==', id)));
      paymentsSnap.forEach(p => batch.delete(p.ref));
      
      await batch.commit();
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'loans');
      return false;
    }
  };

  const addPayment = async (paymentData: Omit<Payment, 'id' | 'createdBy'>) => {
    const newPayment = {
      ...paymentData,
      createdBy: auth.currentUser?.uid || 'admin',
    };
    
    try {
      const batch = writeBatch(db);
      const paymentRef = doc(collection(db, 'payments'));
      batch.set(paymentRef, newPayment);

      const loanRef = doc(db, 'loans', paymentData.loanId);
      const loan = loans.find(l => l.id === paymentData.loanId);
      
      if (loan) {
        const remaining = loan.remainingAmount - paymentData.amount;
        const status = remaining <= 0 ? 'paid' : loan.status;
        batch.update(loanRef, { 
          remainingAmount: Math.max(0, remaining), 
          status 
        });
      }

      await batch.commit();
      return { id: paymentRef.id, ...newPayment };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'payments/loans');
      return null;
    }
  };

  const clearAllData = async () => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;

    try {
      const batch = writeBatch(db);
      
      const paymentsSnap = await getDocs(query(collection(db, 'payments'), where('createdBy', '==', userId)));
      paymentsSnap.forEach(d => batch.delete(d.ref));

      const loansSnap = await getDocs(query(collection(db, 'loans'), where('createdBy', '==', userId)));
      loansSnap.forEach(d => batch.delete(d.ref));

      const customersSnap = await getDocs(query(collection(db, 'customers'), where('createdBy', '==', userId)));
      customersSnap.forEach(d => batch.delete(d.ref));

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'all');
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    if (!auth.currentUser) return false;
    try {
      const settingsDoc = doc(db, 'settings', auth.currentUser.uid);
      await setDoc(settingsDoc, newSettings);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings');
      return false;
    }
  };

  return {
    customers,
    loans,
    payments,
    settings,
    loading: isDataLoading,
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
