import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  ChevronRight, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { generateWhatsAppReminder } from '../utils/whatsappHelper';

export default function DueDatesTab({
  customers = [],
  storeProfile
}) {
  const [selectedCustomerForWhatsApp, setSelectedCustomerForWhatsApp] = useState(null);

  const now = new Date();
  
  // Categorize
  const overdueCustomers = customers.filter(c => c.status === 'overdue' || new Date(c.dueDate) < now);
  const dueSoonCustomers = customers.filter(c => {
    const diff = (new Date(c.dueDate) - now) / 86400000;
    return diff >= 0 && diff <= 3 && c.status !== 'overdue';
  });
  const upcomingCustomers = customers.filter(c => {
    const diff = (new Date(c.dueDate) - now) / 86400000;
    return diff > 3 && c.status !== 'overdue';
  });

  const totalOverdue = overdueCustomers.reduce((sum, c) => sum + c.balance, 0);
  const totalDueSoon = dueSoonCustomers.reduce((sum, c) => sum + c.balance, 0);
  const totalUpcoming = upcomingCustomers.reduce((sum, c) => sum + c.balance, 0);

  const triggerWhatsApp = (cust) => {
    const reminder = generateWhatsAppReminder({
      customerName: cust.name,
      phone: cust.phone,
      amount: cust.balance,
      dueDate: cust.dueDate,
      isOverdue: cust.status === 'overdue',
      storeName: storeProfile?.name || "MoneyView Supermarket",
      upiId: storeProfile?.upiId || "moneyview@icici",
      language: "hinglish"
    });
    window.open(reminder.waUrl, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div className="glass-panel" style={{ padding: '10px', borderTop: '3px solid #ef4444', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: '700' }}>OVERDUE</span>
          <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f9fafb', marginTop: '2px' }}>
            ₹{totalOverdue.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>{overdueCustomers.length} accounts</span>
        </div>

        <div className="glass-panel" style={{ padding: '10px', borderTop: '3px solid #f59e0b', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: '700' }}>DUE IN 3 DAYS</span>
          <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f9fafb', marginTop: '2px' }}>
            ₹{totalDueSoon.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>{dueSoonCustomers.length} accounts</span>
        </div>

        <div className="glass-panel" style={{ padding: '10px', borderTop: '3px solid #10b981', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: '700' }}>THIS WEEK</span>
          <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f9fafb', marginTop: '2px' }}>
            ₹{totalUpcoming.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>{upcomingCustomers.length} accounts</span>
        </div>
      </div>

      {/* SECTION 1: Overdue Immediate Action Needed */}
      {overdueCustomers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={15} color="#ef4444" />
            <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#f87171' }}>
              Overdue Accounts (Immediate Recovery Needed)
            </h4>
          </div>

          {overdueCustomers.map(cust => (
            <div
              key={cust.id}
              className="glass-panel"
              style={{
                padding: '12px 14px',
                borderLeft: '4px solid #ef4444',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong style={{ fontSize: '0.92rem', color: '#f9fafb', display: 'block' }}>
                  {cust.name}
                </strong>
                <span style={{ fontSize: '0.72rem', color: '#f87171' }}>
                  ⚠️ Due Date: {cust.dueDate} ({cust.behavior})
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <strong style={{ fontSize: '1.05rem', color: '#f43f5e' }}>
                  ₹{cust.balance.toLocaleString('en-IN')}
                </strong>
                <button
                  onClick={() => triggerWhatsApp(cust)}
                  className="btn-whatsapp"
                  style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                >
                  <MessageSquare size={13} /> Remind
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 2: Due Soon (Next 3 Days) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={15} color="#f59e0b" />
          <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fbbf24' }}>
            Upcoming Collections (Next 72 Hours)
          </h4>
        </div>

        {dueSoonCustomers.map(cust => (
          <div
            key={cust.id}
            className="glass-panel"
            style={{
              padding: '12px 14px',
              borderLeft: '4px solid #f59e0b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <strong style={{ fontSize: '0.92rem', color: '#f9fafb', display: 'block' }}>
                {cust.name}
              </strong>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                📅 Scheduled: {cust.dueDate} • Trust: {cust.trustScore}%
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <strong style={{ fontSize: '1.05rem', color: '#f59e0b' }}>
                ₹{cust.balance.toLocaleString('en-IN')}
              </strong>
              <button
                onClick={() => triggerWhatsApp(cust)}
                className="btn-whatsapp"
                style={{ padding: '6px 10px', fontSize: '0.75rem' }}
              >
                <MessageSquare size={13} /> Remind
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 3: Later this Week */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={15} color="#10b981" />
          <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#34d399' }}>
            Later This Week
          </h4>
        </div>

        {upcomingCustomers.map(cust => (
          <div
            key={cust.id}
            className="glass-panel"
            style={{
              padding: '12px 14px',
              borderLeft: '4px solid #10b981',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <strong style={{ fontSize: '0.92rem', color: '#f9fafb', display: 'block' }}>
                {cust.name}
              </strong>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                Due on {cust.dueDate}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <strong style={{ fontSize: '1.05rem', color: '#34d399' }}>
                ₹{cust.balance.toLocaleString('en-IN')}
              </strong>
              <button
                onClick={() => triggerWhatsApp(cust)}
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.72rem' }}
              >
                Schedule WhatsApp
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
