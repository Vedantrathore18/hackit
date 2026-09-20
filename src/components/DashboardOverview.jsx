import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function DashboardOverview({
  metrics,
  transactions = [],
  onNavigateTab,
  onOpenCustomerReminder
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* 4 Core Financial Metrics - Responsive Grid */}
      <div className="metrics-grid-responsive" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px'
      }}>
        {/* Cash in Hand */}
        <div className="fintech-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Galla Cash
            </span>
            <span className="status-pill success" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
              <span className="status-dot green"></span> Liquid
            </span>
          </div>
          <div className="num-mono" style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            ₹{cashInHand.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
            Counter balance
          </span>
        </div>

        {/* Market Udhaar */}
        <div className="fintech-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Udhaar
            </span>
            <span className="status-pill warning" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
              <span className="status-dot amber"></span> Pending
            </span>
          </div>
          <div className="num-mono" style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--amber-text)' }}>
            ₹{totalReceivables.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: '2px', display: 'block' }}>
            {dueWithin7DaysCount + overdueCustomersCount} accounts
          </span>
        </div>

        {/* 7-Day Expected Inflow */}
        <div className="fintech-card" style={{ padding: '12px', borderLeft: '3px solid var(--emerald-main)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Expected Inflow
            </span>
            <span className="status-pill success" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
              <span className="status-dot green"></span> 7 Days
            </span>
          </div>
          <div className="num-mono" style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--emerald-text)' }}>
            ₹{dueWithin7Days.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: '2px', display: 'block' }}>
            From {dueWithin7DaysCount} accounts
          </span>
        </div>

        {/* Committed Supplier Outflow */}
        <div className="fintech-card" style={{ padding: '12px', borderLeft: '3px solid var(--rose-main)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Supplier Dues
            </span>
            <span className="status-pill danger" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
              <span className="status-dot red"></span> 7 Days
            </span>
          </div>
          <div className="num-mono" style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--rose-text)' }}>
            ₹{supplierDues7Days.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: '2px', display: 'block' }}>
            Amul, ITC & Mandi
          </span>
        </div>
      </div>

      {/* Actionable Working Capital Decision Card */}
      <div className="fintech-card" style={{
        backgroundColor: isCashDeficit ? 'rgba(220, 38, 38, 0.05)' : 'rgba(22, 163, 74, 0.05)',
        border: isCashDeficit ? '1px solid rgba(220, 38, 38, 0.25)' : '1px solid rgba(22, 163, 74, 0.25)',
        padding: '14px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className={`status-pill ${isCashDeficit ? 'danger' : 'success'}`}>
                {isCashDeficit ? `Shortfall: ₹${cashShortfall.toLocaleString('en-IN')}` : `Buffer: +₹${netProjectedBalance.toLocaleString('en-IN')}`}
              </span>
              <h4 style={{ fontSize: '0.92rem', margin: 0, fontWeight: '700' }}>
                {isCashDeficit ? "Working Capital Shortfall Forecast" : "Liquidity Cushion Validated"}
              </h4>
            </div>

            {isCashDeficit && (
              <button
                onClick={() => onNavigateTab('khata')}
                className="btn-primary"
                style={{ backgroundColor: 'var(--rose-main)', padding: '6px 12px', fontSize: '0.76rem', width: '100%', maxWidth: '240px' }}
              >
                Collect Overdue Accounts <ArrowRight size={13} />
              </button>
            )}
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            {actionableInsights[0]?.summary}
          </p>

          <div style={{
            padding: '8px 10px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.76rem'
          }}>
            <strong style={{ color: isCashDeficit ? 'var(--rose-text)' : 'var(--emerald-text)', marginRight: '6px' }}>
              Recommendation:
            </strong>
            <span style={{ color: 'var(--text-primary)' }}>
              {actionableInsights[0]?.actionPrompt}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: 7-Day Forecast Curve + Recent Entries */}
      <div className="forecast-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr', gap: '14px' }}>
        {/* Chart */}
        <div className="fintech-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <h4 style={{ fontSize: '0.88rem', margin: 0 }}>7-Day Liquidity Outlook</h4>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                Scheduled Collections vs Supplier Obligations
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.68rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                <span className="status-dot green"></span> Inflow
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                <span className="status-dot red"></span> Outflow
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#181a1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.74rem' }}
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="inflow" stroke="#22c55e" strokeWidth={1.5} fillOpacity={1} fill="url(#inflowGrad)" />
                <Area type="monotone" dataKey="outflow" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#outflowGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="fintech-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '0.88rem', margin: 0 }}>Recent Activity</h4>
            <button
              onClick={() => onNavigateTab('transactions')}
              style={{ background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.72rem' }}
            >
              View All →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
            {transactions.slice(0, 5).map(tx => {
              const isCredit = tx.type === 'credit_sale';
              const isRepayment = tx.type === 'payment_received';

              return (
                <div
                  key={tx.id}
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '8px 10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ overflow: 'hidden', marginRight: '8px' }}>
                    <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx.description}
                    </strong>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                      {new Date(tx.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {tx.channel}
                    </span>
                  </div>

                  <strong className="num-mono" style={{
                    fontSize: '0.85rem',
                    color: isRepayment ? 'var(--emerald-text)' : (isCredit ? 'var(--amber-text)' : 'var(--rose-text)'),
                    whiteSpace: 'nowrap'
                  }}>
                    {isRepayment ? `+₹${tx.amount.toLocaleString('en-IN')}` : (isCredit ? `₹${tx.amount.toLocaleString('en-IN')}` : `-₹${tx.amount.toLocaleString('en-IN')}`)}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
