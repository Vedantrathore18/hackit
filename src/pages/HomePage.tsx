import React from 'react';
import { useStore } from '../context/StoreContext';
import { HeroInput } from '../components/ai-input/HeroInput';
import { CustomerCard } from '../components/ledger/CustomerCard';
import { InsightCard } from '../components/insights/InsightCard';
import {
  TrendingUp,
  AlertTriangle,
  CalendarCheck,
  Building2,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { parseNaturalLanguageInput } from '../services/nlpParser';

export const HomePage: React.FC = () => {
  const {
    customers,
    transactions,
    cashFlow,
    insights,
    setActiveTab,
    setSelectedCustomerId,
    openAddTxModal,
    openVoiceModal,
    openImageUpload,
    setCandidateForConfirmation,
  } = useStore();

  // Attention customers: due today or overdue
  const attentionCustomers = customers.filter(
    (c) => c.status === 'overdue' || c.nextPaymentDue === '2026-09-20' || (c.daysOverdue && c.daysOverdue > 0)
  ).slice(0, 3);

  const recentTxs = transactions.slice(0, 5);
  const featuredInsight = insights[1] || insights[0]; // Overdue recovery opportunity

  // Quick action helpers
  const handleQuickAction = (action: string) => {
    if (action === 'sale') {
      const cand = parseNaturalLanguageInput('Counter cash sale of ₹1500');
      setCandidateForConfirmation(cand, 'manual', 'Counter cash sale ₹1500');
    } else if (action === 'udhaar') {
      openAddTxModal();
    } else if (action === 'payment') {
      const cand = parseNaturalLanguageInput('Sharma ji paid ₹1200 payment');
      setCandidateForConfirmation(cand, 'manual', 'Payment received ₹1200');
    } else if (action === 'supplier') {
      const cand = parseNaturalLanguageInput('Paid supplier Gupta provisions ₹8000');
      setCandidateForConfirmation(cand, 'manual', 'Supplier payment ₹8000');
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* 1. STORE PULSE STATUS CARD */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#D5CEC1] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
              Today's Store Collection Pulse
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-mono-num text-[#1C1917]">
              ₹{cashFlow.moneyInToday.toLocaleString('en-IN')}
            </h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +8.4% vs yesterday
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#57534E]">
          <span className="px-2.5 py-1 bg-[#FAF8F5] border border-[#E8E3D8] rounded-xl font-medium">
            Cash: ₹28,000
          </span>
          <span className="px-2.5 py-1 bg-[#FAF8F5] border border-[#E8E3D8] rounded-xl font-medium">
            UPI: ₹24,500
          </span>
        </div>
      </div>

      {/* 2. HERO AI INPUT */}
      <HeroInput />

      {/* 3. QUICK ACTIONS */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
            Quick Munim Actions
          </span>
          <span className="text-[11px] text-[#78716C]">1-tap fast record</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <button
            onClick={() => handleQuickAction('sale')}
            className="p-3 sm:p-3.5 bg-white hover:bg-[#FAF8F5] border border-[#E8E3D8] hover:border-[#D5CEC1] rounded-2xl text-left transition-all shadow-2xs active:scale-[0.98] group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs mb-2">
              <Plus className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#1C1917]">Add Sale</p>
            <p className="text-[11px] text-[#78716C]">Cash / QR billing</p>
          </button>

          <button
            onClick={() => handleQuickAction('udhaar')}
            className="p-3 sm:p-3.5 bg-white hover:bg-[#FAF8F5] border border-[#E8E3D8] hover:border-[#D5CEC1] rounded-2xl text-left transition-all shadow-2xs active:scale-[0.98] group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-xs mb-2">
              <Plus className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#1C1917]">Add Udhaar</p>
            <p className="text-[11px] text-[#78716C]">Credit to customer</p>
          </button>

          <button
            onClick={() => handleQuickAction('payment')}
            className="p-3 sm:p-3.5 bg-white hover:bg-[#FAF8F5] border border-[#E8E3D8] hover:border-[#D5CEC1] rounded-2xl text-left transition-all shadow-2xs active:scale-[0.98] group"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center font-bold text-xs mb-2">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#1C1917]">Record Payment</p>
            <p className="text-[11px] text-[#78716C]">Customer cleared bill</p>
          </button>

          <button
            onClick={() => handleQuickAction('supplier')}
            className="p-3 sm:p-3.5 bg-white hover:bg-[#FAF8F5] border border-[#E8E3D8] hover:border-[#D5CEC1] rounded-2xl text-left transition-all shadow-2xs active:scale-[0.98] group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold text-xs mb-2">
              <Building2 className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#1C1917]">Supplier Payment</p>
            <p className="text-[11px] text-[#78716C]">Wholesale stock pay</p>
          </button>
        </div>
      </div>

      {/* 4. MONEY SNAPSHOT TILES */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
            Store Money Snapshot
          </span>
          <button
            onClick={() => setActiveTab('cashflow')}
            className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-0.5"
          >
            <span>Cash Flow</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            onClick={() => setActiveTab('receivables')}
            className="p-4 bg-white hover:bg-[#FAF8F5] border border-[#E8E3D8] rounded-2xl transition-all cursor-pointer shadow-2xs"
          >
            <span className="text-[11px] font-bold text-[#78716C] uppercase">
              Expected This Week
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold font-mono-num text-[#1C1917] mt-1">
              ₹{cashFlow.expectedNext7Days.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">From 7 accounts</p>
          </div>

          <div
            onClick={() => setActiveTab('reminders')}
            className="p-4 bg-rose-50/50 hover:bg-rose-50 border border-rose-200 rounded-2xl transition-all cursor-pointer shadow-2xs"
          >
            <span className="text-[11px] font-bold text-rose-800 uppercase">
              Overdue (Stuck)
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold font-mono-num text-rose-800 mt-1">
              ₹{cashFlow.overdueTotal.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-rose-700 font-semibold mt-0.5">3 customers late</p>
          </div>

          <div className="p-4 bg-white border border-[#E8E3D8] rounded-2xl shadow-2xs">
            <span className="text-[11px] font-bold text-[#78716C] uppercase">
              Supplier Outflow
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold font-mono-num text-[#1C1917] mt-1">
              ₹{cashFlow.supplierPaymentsWeek.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-[#78716C] mt-0.5">Due this week</p>
          </div>

          <div className="p-4 bg-white border border-[#E8E3D8] rounded-2xl shadow-2xs">
            <span className="text-[11px] font-bold text-[#78716C] uppercase">
              Net Cash Flow
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold font-mono-num text-emerald-800 mt-1">
              +₹{cashFlow.netCashToday.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Today's surplus</p>
          </div>
        </div>
      </div>

      {/* 5. TODAY'S ATTENTION (Sharma Ji, Ramesh) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
              Today's Attention
            </span>
          </div>
          <button
            onClick={() => setActiveTab('reminders')}
            className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-0.5"
          >
            <span>All Reminders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {attentionCustomers.map((cust) => (
            <CustomerCard
              key={cust.id}
              customer={cust}
              onClick={() => setSelectedCustomerId(cust.id)}
            />
          ))}
        </div>
      </div>

      {/* 6. AI MUNIM ACTIONABLE INSIGHT HIGHLIGHT */}
      {featuredInsight && (
        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
                Expenso Munim Recommendation
              </span>
            </div>
            <button
              onClick={() => setActiveTab('insights')}
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              All Insights
            </button>
          </div>
          <InsightCard insight={featuredInsight} />
        </div>
      )}

      {/* 7. RECENT ACTIVITY FEED */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
            Recent Store Activity
          </span>
          <button
            onClick={() => setActiveTab('activity')}
            className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-0.5"
          >
            <span>View Full Ledger</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E3D8] divide-y divide-[#F2EFE8] overflow-hidden">
          {recentTxs.map((tx) => {
            const isUdhaar = tx.type === 'udhaar';
            const isPayment = tx.type === 'payment_received';
            const isSupplier = tx.type === 'supplier_payment';

            return (
              <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isUdhaar
                        ? 'bg-amber-50 text-amber-800'
                        : isPayment
                        ? 'bg-emerald-50 text-emerald-800'
                        : isSupplier
                        ? 'bg-purple-50 text-purple-800'
                        : 'bg-[#F2EFE8] text-[#57534E]'
                    }`}
                  >
                    {isUdhaar ? (
                      <Plus className="w-4 h-4" />
                    ) : isPayment ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#1C1917]">{tx.customerName}</p>
                    <p className="text-xs text-[#78716C]">
                      {tx.category || 'Store Entry'} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-sm font-extrabold font-mono-num ${
                      isPayment ? 'text-emerald-700' : 'text-[#1C1917]'
                    }`}
                  >
                    {isPayment ? '+' : ''}₹{tx.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] font-semibold text-[#78716C] capitalize">
                    {tx.type.replace('_', ' ')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
