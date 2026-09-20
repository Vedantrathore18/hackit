import React from 'react';
import { useStore } from '../context/StoreContext';
import { CashFlowChart } from '../components/cashflow/CashFlowChart';
import { TrendingUp, ArrowDownLeft, ArrowUpRight, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

export const CashFlowPage: React.FC = () => {
  const { cashFlow } = useStore();

  const isHealthy = cashFlow.expectedNext7Days >= cashFlow.supplierPaymentsWeek;

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-800" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] tracking-tight">
            Store Cash Flow & Working Capital
          </h1>
        </div>
        <p className="text-xs text-[#78716C] mt-0.5">
          Real-time visibility into counter sales, udhaar collections, and wholesaler supplier payouts
        </p>
      </div>

      {/* 4 Key Financial Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-[#E8E3D8] shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#78716C] uppercase">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>Money In (Today)</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold font-mono-num text-emerald-800 mt-1">
            ₹{cashFlow.moneyInToday.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#78716C] mt-0.5">Counter + UPI received</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E8E3D8] shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#78716C] uppercase">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
            <span>Money Out (Today)</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold font-mono-num text-rose-800 mt-1">
            ₹{cashFlow.moneyOutToday.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#78716C] mt-0.5">Supplier & store expenses</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E8E3D8] shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#78716C] uppercase">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Net Cash Today</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold font-mono-num text-[#1C1917] mt-1">
            +₹{cashFlow.netCashToday.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Positive balance</p>
        </div>

        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 uppercase">
            <span>Expected (7 Days)</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold font-mono-num text-emerald-900 mt-1">
            ₹{cashFlow.expectedNext7Days.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Upcoming collections</p>
        </div>
      </div>

      {/* Cash Flow Interactive Chart */}
      <CashFlowChart />

      {/* Working Capital Health Assessment */}
      <div className="p-5 bg-white rounded-3xl border border-[#E8E3D8] shadow-2xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#57534E]">
          Munim Cash-Flow Intelligence
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E3D8]">
            <p className="text-xs font-bold text-[#1C1917]">Customer Collections</p>
            <p className="text-lg font-extrabold font-mono-num text-emerald-800 mt-1">
              ₹{cashFlow.expectedNext7Days.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-[#78716C] mt-1">
              ₹38,500 expected from customers in the next 7 days based on payment promises.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E3D8]">
            <p className="text-xs font-bold text-[#1C1917]">Scheduled Supplier Dues</p>
            <p className="text-lg font-extrabold font-mono-num text-rose-800 mt-1">
              ₹{cashFlow.supplierPaymentsWeek.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-[#78716C] mt-1">
              ₹18,000 supplier payments may be due this week for wholesaler restock.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${isHealthy ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/60 border-amber-200'}`}>
            <div className="flex items-center gap-1.5">
              {isHealthy ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-700" />
              )}
              <p className="text-xs font-bold text-[#1C1917]">Inflow vs Outflow Ratio</p>
            </div>
            <p className="text-lg font-extrabold font-mono-num text-emerald-800 mt-1">
              +₹{(cashFlow.expectedNext7Days - cashFlow.supplierPaymentsWeek).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-[#57534E] mt-1">
              Your expected customer inflow is higher than scheduled wholesaler outflow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
