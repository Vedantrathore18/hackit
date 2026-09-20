import React from 'react';
import { 
  Search, 
  Mic, 
  Camera, 
  Plus, 
  UserPlus, 
  RotateCcw, 
  Languages,
  CheckCircle2
} from 'lucide-react';

export default function TopNavbar({
  searchQuery,
  onSearchChange,
  onOpenVoiceModal,
  onOpenOCR,
  onOpenQuickPOS,
  onOpenAddCustomer,
  onResetData,
  language,
  onToggleLanguage,
  onToggleDemoBanner,
  isDemoBannerOpen,
  backendStatus = 'connecting'
}) {
  return (
    <header className="top-navbar">
      {/* 1. DESKTOP HEADER (≥ 769px) */}
      <div className="desktop-header-only" style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search customer, phone, bill..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="fintech-input"
            style={{ paddingLeft: '32px', height: '32px', fontSize: '0.8rem' }}
          />
        </div>

        {/* Action Buttons Cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Backend Status Live Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: backendStatus === 'connected' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(234, 179, 8, 0.12)',
              border: `1px solid ${backendStatus === 'connected' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
              fontSize: '0.74rem',
              fontWeight: '600',
              color: backendStatus === 'connected' ? '#4ade80' : '#facc15'
            }}
            title={backendStatus === 'connected' ? 'Backend Live on Port 5000 (Data persisted to disk)' : 'Offline mode (LocalStorage fallback active)'}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: backendStatus === 'connected' ? '#22c55e' : '#eab308',
                boxShadow: backendStatus === 'connected' ? '0 0 8px #22c55e' : 'none',
                display: 'inline-block'
              }}
            />
            <span>{backendStatus === 'connected' ? 'Backend Live :5000' : 'Offline Cache'}</span>
          </div>

          {/* Verification Loop Toggle Button */}
          <button
            onClick={onToggleDemoBanner}
            style={{
              backgroundColor: isDemoBannerOpen ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              border: '1px solid var(--border-medium)',
              color: isDemoBannerOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.74rem',
              fontWeight: '600',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            title="Toggle 5-Step Live Verification Pipeline"
          >
            <span className="status-dot green"></span>
            <span>Verification Loop</span>
          </button>

          {/* Language switch */}
          <button
            onClick={onToggleLanguage}
            className="btn-secondary"
            style={{ padding: '5px 8px', fontSize: '0.74rem' }}
            title="Switch Language"
          >
            <Languages size={12} />
            <span>{language === 'hi' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* OCR Camera */}
          <button
            onClick={onOpenOCR}
            className="btn-secondary"
            style={{ padding: '5px 10px', fontSize: '0.76rem' }}
            title="Scan Paper Grocery Bill via Camera or File"
          >
            <Camera size={13} />
            <span>Scan Bill OCR</span>
          </button>

          {/* Voice Bill */}
          <button
            onClick={onOpenVoiceModal}
            className="btn-secondary"
            style={{ padding: '5px 10px', fontSize: '0.76rem' }}
            title="Speak Hindi/English Voice Transaction"
          >
            <Mic size={13} />
            <span>Voice Bill</span>
          </button>

          {/* Add Customer */}
          <button
            onClick={onOpenAddCustomer}
            className="btn-secondary"
            style={{ padding: '5px 10px', fontSize: '0.76rem' }}
            title="Add Customer Khata"
          >
            <UserPlus size={13} />
            <span>+ Customer</span>
          </button>

          {/* Quick POS */}
          <button
            onClick={onOpenQuickPOS}
            className="btn-primary"
            style={{ padding: '5px 12px', fontSize: '0.76rem' }}
            title="Create New POS Bill"
          >
            <Plus size={14} />
            <span>+ New Bill</span>
          </button>

          {/* Reset Store Data */}
          <button
            onClick={onResetData}
            style={{
              background: 'transparent',
              color: 'var(--text-quaternary)',
              padding: '5px',
              borderRadius: 'var(--radius-sm)'
            }}
            title="Reset to Demo Defaults"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* 2. MOBILE HEADER (≤ 768px) */}
      <div className="mobile-header-only">
        {/* Top Row: Brand & Quick Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {/* Brand and Store Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'var(--emerald-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '0.85rem'
            }}>
              M
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  MoneyView
                </span>
                <span style={{
                  fontSize: '0.62rem',
                  padding: '2px 5px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: backendStatus === 'connected' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                  color: backendStatus === 'connected' ? '#4ade80' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: backendStatus === 'connected' ? '#22c55e' : '#eab308'
                  }} />
                  {backendStatus === 'connected' ? 'Live :5000' : 'Cache'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Touch Action Pills on Mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {/* Voice Mic shortcut */}
            <button
              onClick={onOpenVoiceModal}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'rgba(22, 163, 74, 0.15)',
                border: '1px solid rgba(22, 163, 74, 0.3)',
                color: 'var(--emerald-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Voice Bill (Speak Hindi/English)"
            >
              <Mic size={15} />
            </button>

            {/* OCR Camera shortcut */}
            <button
              onClick={onOpenOCR}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Scan Paper Bill OCR"
            >
              <Camera size={14} />
            </button>

            {/* Add Customer shortcut */}
            <button
              onClick={onOpenAddCustomer}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Add New Customer"
            >
              <UserPlus size={14} />
            </button>

            {/* Language Switch */}
            <button
              onClick={onToggleLanguage}
              style={{
                height: '32px',
                padding: '0 7px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-secondary)',
                fontSize: '0.72rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
              title="Switch Language"
            >
              <Languages size={11} />
              <span>{language === 'hi' ? 'हि' : 'EN'}</span>
            </button>

            {/* Toggle Audit Loop */}
            <button
              onClick={onToggleDemoBanner}
              style={{
                height: '32px',
                padding: '0 6px',
                borderRadius: '6px',
                backgroundColor: isDemoBannerOpen ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Toggle Verification Pipeline"
            >
              <span className="status-dot green"></span>
            </button>
          </div>
        </div>

        {/* Bottom Row on Mobile: Full-Width Search & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={13} color="var(--text-tertiary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search customer, phone, bill..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="fintech-input"
              style={{ paddingLeft: '30px', height: '34px', fontSize: '0.82rem', width: '100%' }}
            />
          </div>

          <button
            onClick={onResetData}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '6px',
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            title="Reset Store Data"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}
