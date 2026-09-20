import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Zap, 
  Send,
  HelpCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function CashflowPulseCard({
  metrics,
  onOpenCustomerReminder,
  language = "en"
}) {
  const {
    cashInHand,
    totalReceivables,
    overdueAmount,
    overdueCustomersCount,
    dueWithin7Days,
    dueWithin7DaysCount,
    totalSupplierDues,
    supplierDues7Days,
    netProjectedBalance,
    isCashDeficit,
    cashShortfall,
    actionableInsights = [],
    chartData = []
  } = metrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 4 Core Financial Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px'
      }}>
        {/* Cash in Hand (Galla) */}
        <div className="glass-panel" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: '600' }}>
              💵 Cash in Register (Galla)
            </span>
            <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>Ready</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f9fafb' }}>
            ₹{cashInHand.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.68rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
            <ArrowUpRight size={12} /> Today's Net Counter
          </span>
        </div>

        {/* Total Udhaar (Receivables) */}
        <div className="glass-panel" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: '600' }}>
              👥 Market Udhaar (Receivable)
            </span>
            <span className="badge badge-amber" style={{ fontSize: '0.62rem' }}>Total</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f59e0b' }}>
            ₹{totalReceivables.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '2px', display: 'block' }}>
            Across {dueWithin7DaysCount + overdueCustomersCount} customers
          </span>
        </div>

        {/* Expected in 7 Days */}
        <div className="glass-panel" style={{ padding: '14px', borderLeft: '3px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: '600' }}>
              📥 7-Day Inflow Expected
            </span>
            <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>Inflow</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#34d399' }}>
            ₹{dueWithin7Days.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '2px', display: 'block' }}>
            Due from {dueWithin7DaysCount} customers
          </span>
        </div>

        {/* Committed Supplier Outflow */}
        <div className="glass-panel" style={{ padding: '14px', borderLeft: '3px solid #f43f5e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: '600' }}>
              🚚 7-Day Supplier Dues
            </span>
            <span className="badge badge-rose" style={{ fontSize: '0.62rem' }}>Outflow</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f43f5e' }}>
            ₹{supplierDues7Days.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '2px', display: 'block' }}>
            Amul, ITC & Mandi
          </span>
        </div>
      </div>

      {/* KEY JUDGING HIGHLIGHT: Actionable Financial Decision Engine Card */}
      <div style={{
        background: isCashDeficit 
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(17, 24, 39, 0.95) 100%)' 
          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(17, 24, 39, 0.95) 100%)',
        border: isCashDeficit ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '18px',
        padding: '16px',
        boxShadow: isCashDeficit ? '0 8px 25px rgba(239, 68, 68, 0.15)' : '0 8px 25px rgba(16, 185, 129, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isCashDeficit ? (
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '6px', borderRadius: '8px', color: '#f87171' }}>
                <AlertTriangle size={18} />
              </div>
            ) : (
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '6px', borderRadius: '8px', color: '#34d399' }}>
                <ShieldCheck size={18} />
              </div>
            )}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f9fafb' }}>
                {isCashDeficit ? "Decision Alert: Prevent Cash Shortage" : "Liquidity Insight: Safe Cash Flow"}
              </h4>
              <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                AI Analysis of Next 7 Days Supermarket Solvency
              </span>
            </div>
          </div>
          <span className={`badge ${isCashDeficit ? 'badge-rose' : 'badge-emerald'}`}>
            {isCashDeficit ? `Shortfall: ₹${cashShortfall.toLocaleString('en-IN')}` : `Buffer: +₹${netProjectedBalance.toLocaleString('en-IN')}`}
          </span>
        </div>

        {/* Detailed Decision Insight Narrative */}
        {actionableInsights.length > 0 && (
          <div style={{ fontSize: '0.82rem', color: '#e5e7eb', marginTop: '10px', lineHeight: 1.5 }}>
            <p style={{ marginBottom: '8px' }}>
              {actionableInsights[0].summary}
            </p>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '10px 12px',
              borderRadius: '10px',
              borderLeft: isCashDeficit ? '3px solid #ef4444' : '3px solid #10b981'
            }}>
              <strong style={{ color: isCashDeficit ? '#fca5a5' : '#86efac', display: 'block', fontSize: '0.78rem', marginBottom: '2px' }}>
                💡 Actionable Recommendation for Store Owner:
              </strong>
              <span style={{ fontSize: '0.8rem', color: '#d1fae5' }}>
                {actionableInsights[0].actionPrompt}
              </span>
            </div>
          </div>
        )}

        {/* Action Button if Deficit */}
        {isCashDeficit && (
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onOpenCustomerReminder && onOpenCustomerReminder(metrics.overdueList[0])}
              className="btn-primary"
              style={{
                fontSize: '0.78rem',
                padding: '8px 14px',
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              <Send size={13} /> Settle Overdue Accounts Now
            </button>
          </div>
        )}
      </div>

      {/* 7-Day Visual Cashflow Forecast Chart */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#f9fafb' }}>
              7-Day Cash Liquidity Forecast
            </h4>
            <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
              Daily Inflow (Udhaar Collections) vs Supplier Bills
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Inflow
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f43f5e' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }}></span> Outflow
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height: '140px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#6b7280" fontSize={10} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip 
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '0.75rem' }}
                formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, '']}
              />
              <Area type="monotone" dataKey="inflow" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#inflowGrad)" />
              <Area type="monotone" dataKey="outflow" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#outflowGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
