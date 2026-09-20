import React from 'react';
import { Mic, ArrowRight, FileText, BookOpen, TrendingUp, Sparkles, CheckCircle2, Zap, X } from 'lucide-react';

export default function LiveDemoVerificationBanner({
  activeStep = 5,
  lastAction = null,
  onRunPresetScenario,
  scenarios = [],
  isProcessing = false,
  isOpen = true,
  onToggle
}) {
  const steps = [
    { id: 1, label: 'Voice Ingestion', icon: Mic },
    { id: 2, label: 'NLP Parser', icon: FileText },
    { id: 3, label: 'Khata Ledger', icon: BookOpen },
    { id: 4, label: 'Receivables Recalc', icon: TrendingUp },
    { id: 5, label: 'Cash Flow Action', icon: Sparkles }
  ];

  if (!isOpen) return null;

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-lg)',
      padding: '12px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="status-dot green"></span>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
            Live Verification Pipeline
          </span>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>
            (5-Step Continuous Verification Audit)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '0.72rem',
            color: activeStep === 5 ? 'var(--emerald-text)' : 'var(--amber-text)',
            fontFamily: 'var(--font-mono)',
            fontWeight: '600'
          }}>
            {activeStep === 5 ? 'Status: 5/5 Validated' : `Executing Step ${activeStep}/5...`}
          </span>
          <button
            onClick={onToggle}
            style={{ background: 'transparent', color: 'var(--text-tertiary)', padding: '2px' }}
            title="Close banner"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 5-step track */}
      <div className="verification-steps-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '6px',
        backgroundColor: 'var(--bg-app)',
        padding: '8px 12px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        {steps.map((step) => {
          const isDone = activeStep >= step.id;
          const isCurrent = activeStep === step.id;

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 6px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: isCurrent ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: isDone ? 'var(--emerald-main)' : 'var(--bg-card)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.62rem',
                fontWeight: '800',
                flexShrink: 0
              }}>
                {isDone ? '✓' : step.id}
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: isDone ? '600' : '400',
                color: isDone ? 'var(--text-primary)' : 'var(--text-tertiary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Preset demo triggers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>Last Event: </span>
          <span className="num-mono" style={{ color: 'var(--text-primary)' }}>{lastAction || 'Idle'}</span>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Test Scenarios:</span>
          {scenarios.slice(0, 3).map(sc => (
            <button
              key={sc.id}
              onClick={() => onRunPresetScenario(sc)}
              disabled={isProcessing}
              style={{
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-secondary)',
                fontSize: '0.7rem',
                padding: '3px 8px',
                borderRadius: 'var(--radius-xs)'
              }}
            >
              {sc.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
