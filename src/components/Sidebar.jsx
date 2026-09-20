import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  ReceiptText, 
  Bot, 
  CalendarClock, 
  Store, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onTabChange,
  storeProfile,
  overdueCount = 0,
  cashInHand = 0,
  totalUdhaar = 0
}) {
  const menuItems = [
    { id: 'pulse', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'khata', label: 'Customer Udhaar', icon: Users, badge: overdueCount > 0 ? `${overdueCount} Overdue` : null, badgeType: 'danger' },
    { id: 'dues', label: 'Aging & Due Dates', icon: CalendarClock },
    { id: 'suppliers', label: 'Supplier Payables', icon: Truck },
    { id: 'transactions', label: 'Transactions Register', icon: ReceiptText },
    { id: 'ai-ledger', label: 'Munimji AI & Sheet', icon: Sparkles, badge: 'Smart AI', badgeType: 'success' },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '16px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: 'var(--emerald-main)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.82rem',
            fontWeight: '800'
          }}>
            M
          </div>
          <div>
            <span style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.2 }}>
              MoneyView
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
              Retail Ledger
            </span>
          </div>
        </div>

        {/* Store Switcher */}
        <div style={{
          marginTop: '12px',
          padding: '6px 8px',
          backgroundColor: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.74rem'
        }}>
          <div>
            <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.76rem' }}>
              {storeProfile?.name || 'Gupta Supermarket'}
            </strong>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>Sector 14 Complex</span>
          </div>
          <ChevronDown size={13} color="var(--text-tertiary)" />
        </div>
      </div>

      {/* Navigation List */}
      <div style={{ padding: '10px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: '600', color: 'var(--text-quaternary)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 8px' }}>
          Menu
        </span>

        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} color={isActive ? 'var(--text-primary)' : 'var(--text-tertiary)'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span className={`status-pill ${item.badgeType || 'neutral'}`} style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Summary Widget */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{
          backgroundColor: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Galla Cash</span>
            <strong className="num-mono" style={{ color: 'var(--text-primary)', fontSize: '0.82rem' }}>
              ₹{cashInHand.toLocaleString('en-IN')}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Udhaar Balance</span>
            <strong className="num-mono" style={{ color: 'var(--amber-text)', fontSize: '0.82rem' }}>
              ₹{totalUdhaar.toLocaleString('en-IN')}
            </strong>
          </div>
        </div>

        {/* User profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: '700',
            color: 'var(--text-secondary)'
          }}>
            RG
          </div>
          <div>
            <strong style={{ fontSize: '0.75rem', color: 'var(--text-primary)', display: 'block' }}>
              {storeProfile?.owner || 'Ramesh Gupta'}
            </strong>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Store Owner</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
