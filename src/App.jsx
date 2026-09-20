import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  STORE_PROFILE, 
  INITIAL_CUSTOMERS, 
  INITIAL_SUPPLIERS, 
  INITIAL_TRANSACTIONS 
} from './data/initialData';
import { parseVoiceTransaction, DEMO_SCENARIOS } from './utils/voiceParser';
import { computeCashflowMetrics } from './utils/cashflowEngine';
import { 
  fetchBootstrapData, 
  apiCreateTransaction, 
  apiSyncAll, 
  apiResetData 
} from './services/api';

import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import BottomNavBar from './components/BottomNavBar';
import LiveDemoVerificationBanner from './components/LiveDemoVerificationBanner';
import DashboardOverview from './components/DashboardOverview';
import CustomerKhataView from './components/CustomerKhataView';
import SuppliersTab from './components/SuppliersTab';
import SmartAssistantAndSheet from './components/SmartAssistantAndSheet';
import DueDatesTab from './components/DueDatesTab';
import TransactionsRegisterView from './components/TransactionsRegisterView';
import VoiceTransactionModal from './components/VoiceTransactionModal';
import QuickPOSModal from './components/QuickPOSModal';
import BillScannerModal from './components/BillScannerModal';
import AddCustomerModal from './components/AddCustomerModal';

export default function App() {
  // Store profile & Ledger States
  const [storeProfile, setStoreProfile] = useState(() => {
    const saved = localStorage.getItem('moneyview_store');
    return saved ? JSON.parse(saved) : STORE_PROFILE;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('moneyview_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('moneyview_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('moneyview_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Backend Connection Status: 'connecting' | 'connected' | 'offline'
  const [backendStatus, setBackendStatus] = useState('connecting');

  // UI state
  const [language, setLanguage] = useState('en'); // en or hi
  const [activeTab, setActiveTab] = useState('pulse'); // pulse, khata, dues, suppliers, transactions, viasocket
  const [searchQuery, setSearchQuery] = useState("");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isPOSModalOpen, setIsPOSModalOpen] = useState(false);
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isDemoBannerOpen, setIsDemoBannerOpen] = useState(false); // Minimized by default for clean look!

  // Live Demo Loop State (Steps 1 to 5)
  const [liveLoopStep, setLiveLoopStep] = useState(5);
  const [lastActionText, setLastActionText] = useState("Sharma ji took ₹2,400 groceries on 7 days credit");
  const [isProcessingLoop, setIsProcessingLoop] = useState(false);

  // 1. Initial Load: Fetch live backend database (with graceful fallback to LocalStorage)
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      try {
        const res = await fetchBootstrapData({
          store: storeProfile,
          customers,
          suppliers,
          transactions
        });
        if (!isMounted) return;
        if (res.online && res.store) {
          setStoreProfile(res.store);
          setCustomers(res.customers);
          setSuppliers(res.suppliers);
          setTransactions(res.transactions);
          setBackendStatus('connected');
        } else {
          setBackendStatus('offline');
        }
      } catch (e) {
        if (isMounted) setBackendStatus('offline');
      }
    };
    initData();
    return () => { isMounted = false; };
  }, []);

  // 2. Sync to LocalStorage (Always active for offline resilience)
  useEffect(() => {
    localStorage.setItem('moneyview_store', JSON.stringify(storeProfile));
  }, [storeProfile]);

  useEffect(() => {
    localStorage.setItem('moneyview_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('moneyview_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('moneyview_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // 3. Debounced Auto-sync to Node.js Backend Disk Database
  useEffect(() => {
    if (backendStatus === 'connected') {
      const timer = setTimeout(() => {
        apiSyncAll({
          store: storeProfile,
          customers,
          suppliers,
          transactions
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [storeProfile, customers, suppliers, transactions, backendStatus]);

  // Compute live financial metrics
  const cashflowMetrics = useMemo(() => {
    return computeCashflowMetrics(customers, suppliers, storeProfile.cashInHand);
  }, [customers, suppliers, storeProfile.cashInHand]);

  // Audio chime
  const playSoundChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {}
  };

  // Reset Data to Defaults (Backend + LocalStorage)
  const handleResetData = async () => {
    if (window.confirm("Reset all store ledger data back to defaults?")) {
      localStorage.removeItem('moneyview_store');
      localStorage.removeItem('moneyview_customers');
      localStorage.removeItem('moneyview_suppliers');
      localStorage.removeItem('moneyview_transactions');
      try {
        await apiResetData();
      } catch (e) {}
      setStoreProfile(STORE_PROFILE);
      setCustomers(INITIAL_CUSTOMERS);
      setSuppliers(INITIAL_SUPPLIERS);
      setTransactions(INITIAL_TRANSACTIONS);
      setLiveLoopStep(5);
      setLastActionText("Reset to fresh store ledger data");
    }
  };

  // Execute the exact 5-step Live Demo Required Verification Loop
  const executeLiveVerificationLoop = (parsedData) => {
    setIsDemoBannerOpen(true);
    setIsProcessingLoop(true);
    setLiveLoopStep(1);
    setLastActionText(`Step 1: Voice Statement ("${parsedData.rawTranscript || parsedData.description}")`);

    setTimeout(() => {
      setLiveLoopStep(2);
      setLastActionText(`Step 2: Structured (${parsedData.customerName}, ₹${parsedData.amount}, Due: ${parsedData.dueDate || 'Immediate'})`);

      setTimeout(() => {
        setLiveLoopStep(3);
        setLastActionText(`Step 3: Recorded in General & Udhaar Ledger`);
        
        commitTransactionToState(parsedData);
        playSoundChime();

        setTimeout(() => {
          setLiveLoopStep(4);
          setLastActionText(`Step 4: Live Receivables Recalculated (+₹${parsedData.amount})`);

          setTimeout(() => {
            setLiveLoopStep(5);
            setLastActionText(`Step 5: Actionable Cash-Flow Decision Generated!`);
            setIsProcessingLoop(false);

            try {
              confetti({
                particleCount: 65,
                spread: 55,
                origin: { y: 0.2 },
                colors: ['#16a34a', '#4ade80', '#60a5fa', '#f59e0b']
              });
            } catch (e) {}
          }, 350);
        }, 350);
      }, 350);
    }, 350);
  };

  // Commit transaction into real state
  const commitTransactionToState = (data) => {
    const newTx = {
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: data.type || 'credit_sale',
      customerName: data.customerName,
      amount: data.amount,
      description: data.description || `${data.customerName} - ₹${data.amount}`,
      channel: data.channel || 'Voice Entry',
      status: 'recorded'
    };

    setTransactions(prev => [newTx, ...prev]);
    // Immediately persist transaction to backend REST API
    apiCreateTransaction(newTx);

    if (data.type === 'credit_sale') {
      setCustomers(prev => {
        const existing = prev.find(c => c.name.toLowerCase() === data.customerName.toLowerCase());
        if (existing) {
          return prev.map(c => c.id === existing.id ? {
            ...c,
            balance: c.balance + data.amount,
            dueDate: data.dueDate || c.dueDate,
            transactionsCount: (c.transactionsCount || 0) + 1
          } : c);
        } else {
          const newCust = {
            id: `cust-${Date.now()}`,
            name: data.customerName,
            phone: "98000 00000",
            balance: data.amount,
            dueDays: data.dueDays || 7,
            dueDate: data.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            category: data.category || "Groceries",
            trustScore: 88,
            behavior: "New Customer",
            status: "pending",
            transactionsCount: 1
          };
          return [newCust, ...prev];
        }
      });
    } else if (data.type === 'payment_received') {
      setCustomers(prev => prev.map(c => {
        if (c.name.toLowerCase().includes(data.customerName.toLowerCase().split(' ')[0])) {
          const newBal = Math.max(0, c.balance - data.amount);
          return {
            ...c,
            balance: newBal,
            status: newBal === 0 ? 'cleared' : c.status,
            transactionsCount: (c.transactionsCount || 0) + 1
          };
        }
        return c;
      }));
      setStoreProfile(prev => ({ ...prev, cashInHand: prev.cashInHand + data.amount }));
    } else if (data.type === 'cash_sale' || data.type === 'upi_sale') {
      setStoreProfile(prev => ({ ...prev, cashInHand: prev.cashInHand + data.amount }));
    } else if (data.type === 'supplier_payment') {
      setSuppliers(prev => prev.map(s => {
        if (s.name.toLowerCase().includes(data.customerName.toLowerCase().split(' ')[0])) {
          return { ...s, amountDue: Math.max(0, s.amountDue - data.amount) };
        }
        return s;
      }));
      setStoreProfile(prev => ({ ...prev, cashInHand: Math.max(0, prev.cashInHand - data.amount) }));
    } else if (data.type === 'expense') {
      setStoreProfile(prev => ({ ...prev, cashInHand: Math.max(0, prev.cashInHand - data.amount) }));
    }
  };

  // Run 1-Click Preset Demo Scenarios
  const handleRunPresetScenario = (scenario) => {
    const parsed = parseVoiceTransaction(scenario.phrase, customers);
    executeLiveVerificationLoop(parsed);
  };

  // Real Add Customer
  const handleAddCustomer = (newCust) => {
    setCustomers(prev => [newCust, ...prev]);
    if (newCust.balance > 0) {
      commitTransactionToState({
        customerName: newCust.name,
        amount: newCust.balance,
        type: 'credit_sale',
        dueDays: newCust.dueDays,
        dueDate: newCust.dueDate,
        description: `Initial Udhaar Khata opened for ${newCust.name}`,
        channel: 'Manual Entry'
      });
    }
    playSoundChime();
  };

  // Real Add Udhaar (Credit) to Customer
  const handleAddCredit = (cust, amount, reason) => {
    const data = {
      customerName: cust.name,
      amount: amount,
      type: 'credit_sale',
      dueDays: cust.dueDays || 7,
      dueDate: cust.dueDate,
      description: `Udhaar: ${reason} (${cust.name})`,
      channel: 'Store Counter'
    };
    executeLiveVerificationLoop(data);
  };

  // Real Settle Customer Payment
  const handleRecordCustomerPayment = (cust, amount) => {
    const settleAmt = amount || cust.balance;
    const data = {
      customerName: cust.name,
      amount: settleAmt,
      type: 'payment_received',
      description: `Udhaar repayment received from ${cust.name}`,
      channel: 'UPI / Counter Cash'
    };
    executeLiveVerificationLoop(data);
  };

  // Real Supplier Payment
  const handleRecordSupplierPayment = (sup) => {
    const amountStr = prompt(`Enter payment amount to ${sup.name}:`, sup.amountDue);
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    const data = {
      customerName: sup.name,
      amount: amount,
      type: 'supplier_payment',
      description: `Payment settled for ${sup.name} (${sup.items})`,
      channel: 'Bank / Cash Outflow'
    };
    executeLiveVerificationLoop(data);
  };

  return (
    <div className="app-shell">
      {/* Left Sidebar Navigation (Desktop) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        storeProfile={storeProfile}
        overdueCount={cashflowMetrics.overdueCustomersCount}
        cashInHand={storeProfile.cashInHand}
        totalUdhaar={cashflowMetrics.totalReceivables}
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Navbar */}
        <TopNavbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenOCR={() => setIsOCRModalOpen(true)}
          onOpenQuickPOS={() => setIsPOSModalOpen(true)}
          onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
          onResetData={handleResetData}
          language={language}
          onToggleLanguage={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
          onToggleDemoBanner={() => setIsDemoBannerOpen(v => !v)}
          isDemoBannerOpen={isDemoBannerOpen}
          backendStatus={backendStatus}
        />

        {/* Content Body */}
        <main className="content-body">
          {/* Verification Pipeline Audit Dock (Collapsible) */}
          <LiveDemoVerificationBanner
            activeStep={liveLoopStep}
            lastAction={lastActionText}
            onRunPresetScenario={handleRunPresetScenario}
            scenarios={DEMO_SCENARIOS}
            isProcessing={isProcessingLoop}
            isOpen={isDemoBannerOpen}
            onToggle={() => setIsDemoBannerOpen(false)}
          />

          {/* TAB 1: Financial Pulse / Dashboard */}
          {activeTab === 'pulse' && (
            <DashboardOverview
              metrics={cashflowMetrics}
              transactions={transactions}
              onNavigateTab={setActiveTab}
              onOpenCustomerReminder={(cust) => setActiveTab('khata')}
            />
          )}

          {/* TAB 2: Customer Khata / Udhaar */}
          {activeTab === 'khata' && (
            <CustomerKhataView
              customers={customers}
              transactions={transactions}
              onAddCredit={handleAddCredit}
              onRecordPayment={handleRecordCustomerPayment}
              onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
              storeProfile={storeProfile}
              searchQuery={searchQuery}
            />
          )}

          {/* TAB 3: Due Dates & Aging */}
          {activeTab === 'dues' && (
            <DueDatesTab
              customers={customers}
              storeProfile={storeProfile}
            />
          )}

          {/* TAB 4: Supplier Payables */}
          {activeTab === 'suppliers' && (
            <SuppliersTab
              suppliers={suppliers}
              onRecordSupplierPayment={handleRecordSupplierPayment}
              onAddSupplier={(newSup) => setSuppliers(s => [newSup, ...s])}
            />
          )}

          {/* TAB 5: Transactions Register */}
          {activeTab === 'transactions' && (
            <TransactionsRegisterView
              transactions={transactions}
            />
          )}

          {/* TAB 6: Munimji AI Assistant & Live Digital Vyapar Sheet */}
          {(activeTab === 'ai-ledger' || activeTab === 'viasocket') && (
            <SmartAssistantAndSheet
              transactions={transactions}
              customers={customers}
              suppliers={suppliers}
              storeProfile={storeProfile}
              metrics={cashflowMetrics}
              onAddTransaction={(tx) => {
                commitTransactionToState(tx);
                playSoundChime();
                setLastActionText(`Munimji AI Ledger: ${tx.description} (₹${tx.amount})`);
              }}
              onAddCredit={handleAddCredit}
              onRecordPayment={handleRecordCustomerPayment}
              onRecordSupplierPayment={handleRecordSupplierPayment}
            />
          )}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickPOS={() => setIsPOSModalOpen(true)}
        overdueCount={cashflowMetrics.overdueCustomersCount}
      />

      {/* Real Modals */}
      <VoiceTransactionModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSaveTransaction={executeLiveVerificationLoop}
        customers={customers}
      />

      <QuickPOSModal
        isOpen={isPOSModalOpen}
        onClose={() => setIsPOSModalOpen(false)}
        onRecordSale={executeLiveVerificationLoop}
        customers={customers}
      />

      <BillScannerModal
        isOpen={isOCRModalOpen}
        onClose={() => setIsOCRModalOpen(false)}
        onRecordFromOCR={executeLiveVerificationLoop}
      />

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onAddCustomer={handleAddCustomer}
      />
    </div>
  );
}
