import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Customer,
  Transaction,
  Reminder,
  CashFlowData,
  Insight,
  StoreProfile,
  ParsedTransactionCandidate,
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_TRANSACTIONS,
  INITIAL_REMINDERS,
  INITIAL_CASH_FLOW,
  INITIAL_INSIGHTS,
  INITIAL_STORE_PROFILE,
} from '../data/mockData';
import { submitTransaction } from '../services/api';
import confetti from 'canvas-confetti';

export type ActiveTab =
  | 'home'
  | 'ledger'
  | 'receivables'
  | 'reminders'
  | 'cashflow'
  | 'insights'
  | 'activity'
  | 'settings';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface StoreContextType {
  // State
  customers: Customer[];
  transactions: Transaction[];
  reminders: Reminder[];
  cashFlow: CashFlowData;
  insights: Insight[];
  storeProfile: StoreProfile;
  activeTab: ActiveTab;
  selectedCustomerId: string | null;
  toasts: ToastInfo[];

  // Modal / UI states
  isVoiceModalOpen: boolean;
  isImageUploadOpen: boolean;
  isAddTxModalOpen: boolean;
  isCommandBarOpen: boolean;
  candidateToConfirm: ParsedTransactionCandidate | null;
  candidateSourceChannel: 'voice' | 'text' | 'image' | 'manual';
  candidateRawInput: string;
  isProcessingTx: boolean;
  processingStepText: string;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedCustomerId: (id: string | null) => void;
  openVoiceModal: () => void;
  closeVoiceModal: () => void;
  openImageUpload: () => void;
  closeImageUpload: () => void;
  openAddTxModal: () => void;
  closeAddTxModal: () => void;
  openCommandBar: () => void;
  closeCommandBar: () => void;

  setCandidateForConfirmation: (
    candidate: ParsedTransactionCandidate | null,
    channel?: 'voice' | 'text' | 'image' | 'manual',
    rawInput?: string
  ) => void;

  confirmAndRecordTransaction: (customCandidate?: ParsedTransactionCandidate) => Promise<void>;
  recordBatchTransactions: (candidates: ParsedTransactionCandidate[]) => void;
  markReminderPaid: (reminderId: string) => void;
  updateStoreProfile: (profile: Partial<StoreProfile>) => void;
  resetToDemoData: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'expenso_';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistent state loaders
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'reminders');
    return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
  });

  const [cashFlow, setCashFlow] = useState<CashFlowData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'cashflow');
    return saved ? JSON.parse(saved) : INITIAL_CASH_FLOW;
  });

  const [insights, setInsights] = useState<Insight[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'insights');
    return saved ? JSON.parse(saved) : INITIAL_INSIGHTS;
  });

  const [storeProfile, setStoreProfile] = useState<StoreProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'profile');
    return saved ? JSON.parse(saved) : INITIAL_STORE_PROFILE;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Confirmation Flow state
  const [candidateToConfirm, setCandidateToConfirm] = useState<ParsedTransactionCandidate | null>(null);
  const [candidateSourceChannel, setCandidateSourceChannel] = useState<'voice' | 'text' | 'image' | 'manual'>('text');
  const [candidateRawInput, setCandidateRawInput] = useState<string>('');
  const [isProcessingTx, setIsProcessingTx] = useState(false);
  const [processingStepText, setProcessingStepText] = useState('');

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'customers', JSON.stringify(customers));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'transactions', JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'reminders', JSON.stringify(reminders));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'cashflow', JSON.stringify(cashFlow));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'insights', JSON.stringify(insights));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'profile', JSON.stringify(storeProfile));
    } catch {
      // Storage quota exceeded or disabled
    }
  }, [customers, transactions, reminders, cashFlow, insights, storeProfile]);

  // Toast handlers
  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setCandidateForConfirmation = (
    candidate: ParsedTransactionCandidate | null,
    channel: 'voice' | 'text' | 'image' | 'manual' = 'text',
    rawInput: string = ''
  ) => {
    setCandidateToConfirm(candidate);
    setCandidateSourceChannel(channel);
    setCandidateRawInput(rawInput);
  };

  // Record Transaction
  const confirmAndRecordTransaction = async (customCandidate?: ParsedTransactionCandidate) => {
    const target = customCandidate || candidateToConfirm;
    if (!target) return;

    setIsProcessingTx(true);

    // Multi-step visual progress: Understanding -> Structuring -> Updating -> Calculating -> Done
    setProcessingStepText('Understanding transaction...');
    await new Promise((r) => setTimeout(r, 400));

    setProcessingStepText('Structuring ledger entry...');
    await new Promise((r) => setTimeout(r, 450));

    setProcessingStepText('Updating store records...');

    try {
      const result = await submitTransaction(
        candidateRawInput || `${target.customerName} - ₹${target.amount} (${target.type})`,
        candidateSourceChannel,
        storeProfile,
        storeProfile.preferredLanguage === 'hindi' ? 'hi' : 'hinglish'
      );

      setProcessingStepText('Calculating cash-flow impact...');
      await new Promise((r) => setTimeout(r, 400));

      const tx = result.transaction;

      // Update transactions list (prepend)
      setTransactions((prev) => [tx, ...prev]);

      // Update customer ledger
      setCustomers((prev) => {
        const existingIdx = prev.findIndex(
          (c) => c.name.toLowerCase() === tx.customerName.toLowerCase()
        );

        if (existingIdx >= 0) {
          const updated = [...prev];
          const curr = updated[existingIdx];

          if (tx.type === 'udhaar') {
            curr.totalCredit += tx.amount;
            curr.outstandingBalance += tx.amount;
            curr.nextPaymentDue = tx.dueDate || curr.nextPaymentDue;
            curr.status = 'due_soon';
          } else if (tx.type === 'payment_received') {
            curr.totalPaid += tx.amount;
            curr.outstandingBalance = Math.max(0, curr.outstandingBalance - tx.amount);
            if (curr.outstandingBalance === 0) {
              curr.status = 'up_to_date';
            }
          }
          curr.lastActive = 'Just now';
          return updated;
        } else {
          // Add new customer
          const newCust: Customer = {
            id: `cust-${Date.now()}`,
            name: tx.customerName,
            totalCredit: tx.type === 'udhaar' ? tx.amount : 0,
            totalPaid: tx.type === 'payment_received' ? tx.amount : 0,
            outstandingBalance: tx.type === 'udhaar' ? tx.amount : 0,
            nextPaymentDue: tx.dueDate,
            status: tx.type === 'udhaar' ? 'due_soon' : 'up_to_date',
            reliability: 'Good',
            lastActive: 'Just now',
          };
          return [newCust, ...prev];
        }
      });

      // Update Reminders if udhaar
      if (result.reminderCreated) {
        setReminders((prev) => [result.reminderCreated!, ...prev]);
      }

      // Update Cash Flow projections
      setCashFlow((prev) => {
        let expectedInflowDelta = 0;
        let moneyInDelta = 0;
        let moneyOutDelta = 0;

        if (tx.type === 'udhaar') {
          expectedInflowDelta = tx.amount;
        } else if (tx.type === 'payment_received' || tx.type === 'cash_sale') {
          moneyInDelta = tx.amount;
        } else if (tx.type === 'supplier_payment' || tx.type === 'expense') {
          moneyOutDelta = tx.amount;
        }

        return {
          ...prev,
          moneyInToday: prev.moneyInToday + moneyInDelta,
          moneyOutToday: prev.moneyOutToday + moneyOutDelta,
          netCashToday: prev.netCashToday + (moneyInDelta - moneyOutDelta),
          expectedNext7Days: prev.expectedNext7Days + expectedInflowDelta,
        };
      });

      // Add new Insight if generated
      if (result.newInsight) {
        setInsights((prev) => [result.newInsight!, ...prev.slice(0, 5)]);
      }

      // Trigger soft celebratory confetti
      try {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.75 },
          colors: ['#15803D', '#D97706', '#F8F6F0', '#1C1917'],
        });
      } catch {
        // Confetti non-fatal
      }

      setProcessingStepText('Done ✓');
      await new Promise((r) => setTimeout(r, 450));

      setCandidateToConfirm(null);
      showToast(`✓ Recorded: ₹${tx.amount.toLocaleString('en-IN')} for ${tx.customerName}`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error processing transaction';
      showToast(msg, 'error');
    } finally {
      setIsProcessingTx(false);
      setProcessingStepText('');
    }
  };

  // Batch record from Image OCR
  const recordBatchTransactions = (candidates: ParsedTransactionCandidate[]) => {
    candidates.forEach((cand) => {
      confirmAndRecordTransaction(cand);
    });
    showToast(`✓ Extracted and recorded ${candidates.length} transactions from ledger photo!`, 'success');
  };

  // Mark Reminder as Paid
  const markReminderPaid = (reminderId: string) => {
    const rem = reminders.find((r) => r.id === reminderId);
    if (!rem) return;

    // Create a payment_received transaction automatically
    const paymentTx: Transaction = {
      id: `tx-${Date.now()}`,
      customerId: rem.customerId,
      customerName: rem.customerName,
      type: 'payment_received',
      amount: rem.amount,
      description: `Payment settled for reminder (${rem.dueDate})`,
      createdAt: new Date().toISOString(),
      channel: 'manual',
      syncStatus: 'synced',
      category: 'Settlement',
    };

    setTransactions((prev) => [paymentTx, ...prev]);

    // Update customer outstanding
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.name.toLowerCase() === rem.customerName.toLowerCase()) {
          const newBal = Math.max(0, c.outstandingBalance - rem.amount);
          return {
            ...c,
            totalPaid: c.totalPaid + rem.amount,
            outstandingBalance: newBal,
            status: newBal === 0 ? 'up_to_date' : c.status,
            lastActive: 'Just now',
          };
        }
        return c;
      })
    );

    // Update reminders list
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));

    // Update cash flow
    setCashFlow((prev) => ({
      ...prev,
      moneyInToday: prev.moneyInToday + rem.amount,
      netCashToday: prev.netCashToday + rem.amount,
      expectedNext7Days: Math.max(0, prev.expectedNext7Days - rem.amount),
      overdueTotal: rem.status === 'overdue' ? Math.max(0, prev.overdueTotal - rem.amount) : prev.overdueTotal,
    }));

    showToast(`Payment of ₹${rem.amount.toLocaleString('en-IN')} marked as received from ${rem.customerName}`, 'success');
  };

  const updateStoreProfile = (profileUpdate: Partial<StoreProfile>) => {
    setStoreProfile((prev) => ({ ...prev, ...profileUpdate }));
    showToast('Store profile settings updated.', 'info');
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'customers');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'transactions');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'reminders');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'cashflow');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'insights');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'profile');

    setCustomers(INITIAL_CUSTOMERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setReminders(INITIAL_REMINDERS);
    setCashFlow(INITIAL_CASH_FLOW);
    setInsights(INITIAL_INSIGHTS);
    setStoreProfile(INITIAL_STORE_PROFILE);
    setCandidateToConfirm(null);

    showToast('Demo store data refreshed to default state.', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        customers,
        transactions,
        reminders,
        cashFlow,
        insights,
        storeProfile,
        activeTab,
        selectedCustomerId,
        toasts,
        isVoiceModalOpen,
        isImageUploadOpen,
        isAddTxModalOpen,
        isCommandBarOpen,
        candidateToConfirm,
        candidateSourceChannel,
        candidateRawInput,
        isProcessingTx,
        processingStepText,
        setActiveTab,
        setSelectedCustomerId,
        openVoiceModal: () => setIsVoiceModalOpen(true),
        closeVoiceModal: () => setIsVoiceModalOpen(false),
        openImageUpload: () => setIsImageUploadOpen(true),
        closeImageUpload: () => setIsImageUploadOpen(false),
        openAddTxModal: () => setIsAddTxModalOpen(true),
        closeAddTxModal: () => setIsAddTxModalOpen(false),
        openCommandBar: () => setIsCommandBarOpen(true),
        closeCommandBar: () => setIsCommandBarOpen(false),
        setCandidateForConfirmation,
        confirmAndRecordTransaction,
        recordBatchTransactions,
        markReminderPaid,
        updateStoreProfile,
        resetToDemoData,
        showToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
