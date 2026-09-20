import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Plus, 
  Truck, 
  Bot,
  Sparkles 
} from 'lucide-react';

export default function BottomNavBar({
  activeTab,
  onTabChange,
  onOpenQuickPOS,
  overdueCount = 0
}) {
  const tabs = [
    { id: 'pulse', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'khata', label: 'Khata', icon: Users, badge: overdueCount > 0 ? overdueCount : null },
    { id: 'pos', label: 'New Bill', icon: Plus, isCenter: true },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'ai-ledger', label: 'Munimji AI', icon: Sparkles }
  ];

  return (
    <nav className="mobile-bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        if (tab.isCenter) {
          return (
            <button
              key={tab.id}
              onClick={onOpenQuickPOS}
              className="mobile-nav-btn pos-center"
              title="Fast POS Billing"
            >
              <Icon size={24} />
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={19} color={isActive ? 'var(--emerald-text)' : 'var(--text-tertiary)'} />
              {tab.badge && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  backgroundColor: 'var(--rose-main)',
                  color: '#ffffff',
                  fontSize: '0.58rem',
                  fontWeight: '800',
                  borderRadius: '50%',
                  width: '14px',
                  height: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--bg-app)'
                }}>
                  {tab.badge}
                </span>
              )}
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
