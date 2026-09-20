import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Clock, AlertTriangle, ChevronRight, CheckCircle2 } from 'lucide-react';

export const ReceivablesBreakdown: React.FC = () => {
  const { cashFlow, customers, setSelectedCustomerId, setActiveTab } = useStore();
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'month'>('7d');

  // Customer lists by timeline
  const overdueCustomers = customers.filter(
    (c) => c.status === 'overdue' || (c.daysOverdue && c.daysOverdue > 0)
  );

  const dueSoonCustomers = customers.filter(
    (c) => c.outstandingBalance > 0 && (!c.daysOverdue || c.daysOverdue <= 0)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Expected Money */}
      <div className="p-6 bg-white rounded-3xl border border-[#D5CEC1] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                Money Expected from Customers
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-mono-num text-[#1C1917] mt-1.5">
              ₹{cashFlow.expectedNext7Days.toLocaleString('en-IN')}
            </h1>
            <p className="text-xs text-[#57534E] mt-1">
              Based on credit sales & promised customer due dates
            </p>
          </div>

          {/* Timeframe Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F2EFE8] rounded-xl self-start sm:self-center">
            <button
              onClick={() => setTimeFilter('7d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeFilter === '7d'
                  ? 'bg-white text-[#1C1917] shadow-2xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeFilter('30d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeFilter === '30d'
                  ? 'bg-white text-[#1C1917] shadow-2xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeFilter === 'month'
                  ? 'bg-white text-[#1C1917] shadow-2xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* 4 Key Milestone Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#E8E3D8]">
          <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8E3D8]">
            <span className="text-[11px] font-bold text-[#78716C] uppercase">Due Today</span>
            <p className="text-lg sm:text-xl font-extrabold font-mono-num text-[#1C1917] mt-0.5">
              ₹4,500
            </p>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">2 follow-ups</p>
          </div>

          <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8E3D8]">
            <span className="text-[11px] font-bold text-[#78716C] uppercase">Due in 3 Days</span>
            <p className="text-lg sm:text-xl font-extrabold font-mono-num text-[#1C1917] mt-0.5">
              ₹8,200
            </p>
            <p className="text-[11px] text-[#57534E] font-medium mt-0.5">3 customers</p>
          </div>

          <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8E3D8]">
            <span className="text-[11px] font-bold text-[#78716C] uppercase">Due this Week</span>
            <p className="text-lg sm:text-xl font-extrabold font-mono-num text-emerald-800 mt-0.5">
              ₹25,800
            </p>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">7 customers</p>
          </div>

          <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200">
            <span className="text-[11px] font-bold text-rose-800 uppercase">Overdue (Stuck)</span>
            <p className="text-lg sm:text-xl font-extrabold font-mono-num text-rose-800 mt-0.5">
              ₹{cashFlow.overdueTotal.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-rose-700 font-semibold mt-0.5">
              {overdueCustomers.length} accounts late
            </p>
          </div>
        </div>
      </div>

      {/* Overdue Alert Callout */}
      {cashFlow.overdueTotal > 0 && (
        <div className="p-4 bg-[#FFF1F2] rounded-2xl border border-[#FECDD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-950">
                ₹{cashFlow.overdueTotal.toLocaleString('en-IN')} is stuck in overdue udhaar
              </h4>
              <p className="text-xs text-rose-800 mt-0.5">
                Ramesh, Mohan, and Verma have unpaid balances. Sending a polite WhatsApp reminder recovers 80%+ within 24h.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('reminders')}
            className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs transition-colors"
          >
            Send WhatsApp Reminders
          </button>
        </div>
      )}

      {/* Expected Inflow Timeline List */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#57534E]">
            Receivables Schedule
          </h3>
          <span className="text-xs text-[#78716C]">Sorted by payment due date</span>
        </div>

        <div className="space-y-2">
          {dueSoonCustomers.map((cust) => (
            <div
              key={cust.id}
              onClick={() => {
                setSelectedCustomerId(cust.id);
              }}
              className="p-4 bg-white hover:bg-[#FAF8F5] rounded-2xl border border-[#E8E3D8] hover:border-[#D5CEC1] flex items-center justify-between transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                  {cust.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1C1917] group-hover:text-emerald-900">
                    {cust.name}
                  </h4>
                  <p className="text-xs text-[#78716C] flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3 text-[#A8A29E]" />
                    <span>Due: {cust.nextPaymentDue || 'Within 7 days'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-base font-extrabold font-mono-num text-[#1C1917]">
                    ₹{cust.outstandingBalance.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[11px] font-semibold text-emerald-700">Expected</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#C4BDAF] group-hover:text-[#1C1917] transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))}

          {/* Overdue section */}
          {overdueCustomers.map((cust) => (
            <div
              key={cust.id}
              onClick={() => {
                setSelectedCustomerId(cust.id);
              }}
              className="p-4 bg-white hover:bg-rose-50/40 rounded-2xl border border-rose-200 flex items-center justify-between transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0">
                  {cust.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1C1917]">{cust.name}</h4>
                  <p className="text-xs text-rose-700 font-semibold flex items-center gap-1.5 mt-0.5">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{cust.daysOverdue || 12} days overdue</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-base font-extrabold font-mono-num text-rose-700">
                    ₹{cust.outstandingBalance.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[11px] font-bold text-rose-600">Late Payment</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#C4BDAF] group-hover:text-[#1C1917] transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
