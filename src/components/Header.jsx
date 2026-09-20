import React from 'react';
import { 
  Store, 
  Mic, 
  ShoppingBag, 
  Camera, 
  Languages, 
  Radio,
  Sparkles,
  Activity,
  BookOpen,
  Truck,
  Bot,
  RotateCcw,
  PlusCircle
} from 'lucide-react';

export default function Header({
  storeProfile,
  language,
  activeTab,
  onTabChange,
  onToggleLanguage,
  onOpenVoiceModal,
  onOpenQuickPOS,
  onOpenOCR,
  onResetData,
  overdueCount = 0
}) {
  const navTabs = [
    { id: 'pulse', label: 'Financial Pulse', icon: Activity },
    { id: 'khata', label: 'Customer Khata', icon: BookOpen, badge: overdueCount > 0 ? overdueCount : null },
    { id: 'suppliers', label: 'Supplier Payables', icon: Truck },
    { id: 'ai-ledger', label: 'Munimji AI & Sheet', icon: Sparkles },
  ];

  return (
    <header style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(12, 17, 29, 0.95)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px'
    }}>
      {/* Brand & Store Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.45)'
        }}>
          <Store size={24} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.03em' }}>
              MoneyView
            </h1>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.68rem',
              fontWeight: '800',
              letterSpacing: '0.04em'
            }}>
              SUPERMARKET LEDGER
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
            {storeProfile?.name || 'Gupta Supermarket'} • Sector 14
          </span>
        </div>
      </div>

      {/* Desktop Main Navigation Tabs */}
      <nav style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              style={{ position: 'relative' }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: '800',
                  borderRadius: '50%',
                  padding: '1px 5px',
                  marginLeft: '2px'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right side controls: Language toggle + Quick Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Reset Demo Data */}
        <button
          onClick={onResetData}
          className="btn-secondary"
          style={{ padding: '8px 12px', fontSize: '0.75rem' }}
          title="Reset to Fresh Store Data"
        >
          <RotateCcw size={13} /> Reset Data
        </button>

        {/* OCR Camera Scanner */}
        <button
          onClick={onOpenOCR}
          className="btn-secondary"
          style={{ padding: '8px 12px', fontSize: '0.78rem', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}
          title="Live Camera & Paper Receipt OCR"
        >
          <Camera size={15} /> <span>Receipt OCR</span>
        </button>

        {/* Quick POS Billing */}
        <button
          onClick={onOpenQuickPOS}
          className="btn-secondary"
          style={{ padding: '8px 12px', fontSize: '0.78rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}
          title="Fast 1-Tap Counter Billing"
        >
          <PlusCircle size={15} /> <span>POS Bill</span>
        </button>

        {/* Live Voice Mic */}
        <button
          onClick={onOpenVoiceModal}
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          title="Speak Hindi / Hinglish Voice Transaction"
        >
          <Mic size={15} />
          <span>Live Voice</span>
        </button>
      </div>
    </header>
  );
}
