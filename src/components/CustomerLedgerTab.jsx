import React, { useState } from 'react';
import { 
  Search, 
  User, 
  Phone, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  MessageSquare, 
  Plus, 
  Minus, 
  History, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Download,
  UserPlus
} from 'lucide-react';
import { generateWhatsAppReminder } from '../utils/whatsappHelper';
import AddCustomerModal from './AddCustomerModal';

export default function CustomerLedgerTab({
  customers = [],
  transactions = [],
  onAddCredit,
  onRecordPayment,
  onAddCustomer,
  storeProfile
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, overdue, pending, high-value
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState(null);
  const [activeWhatsAppModal, setActiveWhatsAppModal] = useState(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [settleModalCust, setSettleModalCust] = useState(null);
  const [settleAmount, setSettleAmount] = useState("");
  const [addCreditCust, setAddCreditCust] = useState(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");

  // Filter customers
  const filteredCustomers = customers.filter(cust => {
    const matchesSearch = 
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cust.phone && cust.phone.includes(searchQuery));

    if (!matchesSearch) return false;

    if (filterType === "overdue") return cust.status === "overdue";
    if (filterType === "pending") return cust.status === "pending" || cust.balance > 0;
    if (filterType === "high-value") return cust.balance >= 5000;
    return true;
  });

  const handleWhatsAppClick = (customer) => {
    const reminder = generateWhatsAppReminder({
      customerName: customer.name,
      phone: customer.phone,
      amount: customer.balance,
      dueDate: customer.dueDate,
      isOverdue: customer.status === "overdue",
      storeName: storeProfile?.name || "MoneyView Supermarket",
      upiId: storeProfile?.upiId || "moneyview@icici",
      language: "hinglish"
    });

    setActiveWhatsAppModal({ customer, reminder });
  };

  const executeSendWhatsApp = (waUrl) => {
    window.open(waUrl, '_blank');
    setActiveWhatsAppModal(null);
  };

  // Real CSV Export
  const handleExportCSV = () => {
    const headers = ["Customer Name", "Phone", "Pending Udhaar (INR)", "Due Date", "Status", "Trust Score", "Pattern"];
    const rows = customers.map(c => [
      `"${c.name}"`,
      `"${c.phone}"`,
      c.balance,
      `"${c.dueDate}"`,
      `"${c.status}"`,
      `${c.trustScore}%`,
      `"${c.behavior || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MoneyView_Khata_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submitSettlement = (e) => {
    e.preventDefault();
    if (!settleModalCust || !settleAmount) return;
    onRecordPayment(settleModalCust, parseFloat(settleAmount));
    setSettleModalCust(null);
    setSettleAmount("");
  };

  const submitAddCredit = (e) => {
    e.preventDefault();
    if (!addCreditCust || !creditAmount) return;
    onAddCredit(addCreditCust, parseFloat(creditAmount), creditReason || "Grocery purchase on credit");
    setAddCreditCust(null);
    setCreditAmount("");
    setCreditReason("");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Search, Action & Filter Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search customer name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '10px 14px 10px 38px',
                color: '#f8fafc',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="btn-primary"
            style={{ padding: '10px 16px', fontSize: '0.85rem' }}
          >
            <UserPlus size={16} /> + New Customer Khata
          </button>

          <button
            onClick={handleExportCSV}
            className="btn-secondary"
            style={{ padding: '10px 14px', fontSize: '0.82rem' }}
            title="Download CSV Ledger"
          >
            <Download size={15} /> Export CSV
          </button>
        </div>

        {/* Filter Badges */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'all', label: `All Accounts (${customers.length})` },
            { id: 'overdue', label: `🚨 Overdue (${customers.filter(c => c.status === 'overdue').length})` },
            { id: 'pending', label: `⏳ Active Udhaar (${customers.filter(c => c.balance > 0).length})` },
            { id: 'high-value', label: `💎 High Value (>₹5k)` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`nav-tab-btn ${filterType === tab.id ? 'active' : ''}`}
              style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', padding: '6px 14px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Ledger Grid (Adaptive 1 col on mobile, 2 cols on wide desktop) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '14px'
      }}>
        {filteredCustomers.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', gridColumn: '1 / -1' }}>
            No customer accounts found matching criteria. Click "+ New Customer Khata" to add one!
          </div>
        ) : (
          filteredCustomers.map(cust => {
            const isOverdue = cust.status === 'overdue';

            return (
              <div
                key={cust.id}
                className="glass-panel"
                style={{
                  padding: '16px',
                  borderLeft: isOverdue ? '4px solid #ef4444' : (cust.balance > 0 ? '4px solid #10b981' : '4px solid #64748b'),
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Top Row: Name + Balance */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f8fafc' }}>
                        {cust.name}
                      </h4>
                      <span className={`badge ${isOverdue ? 'badge-rose' : (cust.balance > 0 ? 'badge-emerald' : 'badge-blue')}`} style={{ fontSize: '0.65rem' }}>
                        {isOverdue ? 'Overdue' : (cust.balance > 0 ? 'Active' : 'Cleared')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '0.78rem', color: '#94a3b8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={13} /> {cust.phone}
                      </span>
                      <span>•</span>
                      <span style={{ color: isOverdue ? '#f87171' : '#f59e0b' }}>
                        📅 Due: {cust.dueDate}
                      </span>
                    </div>
                  </div>

                  {/* Balance Display */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: isOverdue ? '#f43f5e' : (cust.balance > 0 ? '#34d399' : '#94a3b8') }}>
                      ₹{cust.balance.toLocaleString('en-IN')}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {cust.balance > 0 ? 'Pending Udhaar' : 'Nil Balance'}
                    </span>
                  </div>
                </div>

                {/* Behavioral / Trust Score Banner */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} color="#f59e0b" />
                    <span style={{ color: '#94a3b8' }}>Pattern:</span>
                    <strong style={{ color: isOverdue ? '#fca5a5' : '#86efac' }}>{cust.behavior || 'Regular'}</strong>
                  </div>
                  <span style={{ color: '#64748b' }}>
                    Trust Score: <strong style={{ color: (cust.trustScore || 85) > 80 ? '#34d399' : '#f59e0b' }}>{cust.trustScore || 85}%</strong>
                  </span>
                </div>

                {/* Actions Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <button
                    onClick={() => setSelectedCustomerForHistory(cust)}
                    style={{
                      background: 'transparent',
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 6px'
                    }}
                  >
                    <History size={14} /> Full Khata ({cust.transactionsCount || 1})
                  </button>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {cust.balance > 0 && (
                      <button
                        onClick={() => handleWhatsAppClick(cust)}
                        className="btn-whatsapp"
                      >
                        <MessageSquare size={13} /> WhatsApp
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setAddCreditCust(cust);
                        setCreditAmount("");
                      }}
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '6px 10px', color: '#f59e0b' }}
                      title="Give Credit (Udhaar Diya)"
                    >
                      + Udhaar
                    </button>

                    {cust.balance > 0 && (
                      <button
                        onClick={() => {
                          setSettleModalCust(cust);
                          setSettleAmount(cust.balance.toString());
                        }}
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '6px 10px', color: '#34d399' }}
                        title="Collect Money (Payment Received)"
                      >
                        Collect ₹
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onAddCustomer={onAddCustomer}
      />

      {/* Settle / Collect Money Modal */}
      {settleModalCust && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: '#0d1322',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '420px',
            padding: '24px'
          }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f8fafc', marginBottom: '8px' }}>
              Receive Payment from {settleModalCust.name}
            </h4>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '16px' }}>
              Current Udhaar Balance: <strong style={{ color: '#f43f5e' }}>₹{settleModalCust.balance}</strong>
            </span>

            <form onSubmit={submitSettlement} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Repayment Amount (₹)
                </label>
                <input
                  type="number"
                  value={settleAmount}
                  onChange={e => setSettleAmount(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#34d399', fontSize: '1.2rem', fontWeight: '800' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSettleAmount(settleModalCust.balance.toString())}
                  style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.72rem', color: '#34d399' }}
                >
                  Full Settle (₹{settleModalCust.balance})
                </button>
                <button
                  type="button"
                  onClick={() => setSettleAmount((Math.round(settleModalCust.balance / 2)).toString())}
                  style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.72rem', color: '#e5e7eb' }}
                >
                  50% Partial
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                  Confirm Repayment
                </button>
                <button type="button" onClick={() => setSettleModalCust(null)} className="btn-secondary" style={{ padding: '12px 18px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Give Udhaar Modal */}
      {addCreditCust && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: '#0d1322',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '420px',
            padding: '24px'
          }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f8fafc', marginBottom: '8px' }}>
              Add Udhaar to {addCreditCust.name}
            </h4>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '16px' }}>
              Current Balance: ₹{addCreditCust.balance}
            </span>

            <form onSubmit={submitAddCredit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Credit Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={creditAmount}
                  onChange={e => setCreditAmount(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#fbbf24', fontSize: '1.2rem', fontWeight: '800' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Items / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2 bags Rice, 1 can Oil"
                  value={creditReason}
                  onChange={e => setCreditReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#f8fafc', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  Add to Khata
                </button>
                <button type="button" onClick={() => setAddCreditCust(null)} className="btn-secondary" style={{ padding: '12px 18px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {activeWhatsAppModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: '#0d1322',
            border: '1px solid rgba(37, 211, 102, 0.4)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '460px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#25D366', padding: '6px', borderRadius: '50%', color: '#ffffff' }}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f8fafc' }}>
                    WhatsApp Payment Reminder
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Recipient: {activeWhatsAppModal.customer.name} ({activeWhatsAppModal.customer.phone})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveWhatsAppModal(null)}
                style={{ background: 'transparent', color: '#94a3b8', fontSize: '1.3rem' }}
              >
                ✕
              </button>
            </div>

            {/* Pre-filled Message Bubble */}
            <div style={{
              background: '#064e3b',
              color: '#ffffff',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
              marginBottom: '14px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {activeWhatsAppModal.reminder.message}
            </div>

            {/* UPI Direct Link Preview */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '10px 14px',
              borderRadius: '10px',
              marginBottom: '16px',
              fontSize: '0.78rem',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>🔗 UPI Receiver: <strong>{storeProfile?.upiId}</strong></span>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Auto-Attached</span>
            </div>

            {/* Send CTA */}
            <button
              onClick={() => executeSendWhatsApp(activeWhatsAppModal.reminder.waUrl)}
              className="btn-whatsapp"
              style={{ width: '100%', padding: '14px', justifyContent: 'center', fontSize: '0.95rem' }}
            >
              Launch WhatsApp & Dispatch <ExternalLink size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Customer Full Ledger History Modal */}
      {selectedCustomerForHistory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: '#0d1322',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            maxHeight: '88vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc' }}>
                  {selectedCustomerForHistory.name} — Full Khata History
                </h4>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Mobile: {selectedCustomerForHistory.phone} • Added on system
                </span>
              </div>
              <button
                onClick={() => setSelectedCustomerForHistory(null)}
                style={{ background: 'transparent', color: '#94a3b8', fontSize: '1.3rem' }}
              >
                ✕
              </button>
            </div>

            {/* Balance Summary Header */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '14px',
              padding: '14px',
              marginBottom: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Net Outstanding Udhaar</span>
                <strong style={{ fontSize: '1.4rem', color: '#34d399' }}>
                  ₹{selectedCustomerForHistory.balance.toLocaleString('en-IN')}
                </strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Payment Term</span>
                <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: '700' }}>
                  Due: {selectedCustomerForHistory.dueDate}
                </span>
              </div>
            </div>

            {/* Transactions Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', marginBottom: '4px' }}>
                Recorded Transactions ({transactions.filter(t => t.customerName.toLowerCase().includes(selectedCustomerForHistory.name.toLowerCase().split(' ')[0])).length}):
              </span>
              {transactions
                .filter(t => t.customerName.toLowerCase().includes(selectedCustomerForHistory.name.toLowerCase().split(' ')[0]))
                .map(tx => (
                  <div
                    key={tx.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#f8fafc', display: 'block' }}>
                        {tx.description}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {new Date(tx.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • Via {tx.channel}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{
                        fontSize: '1rem',
                        color: tx.type === 'payment_received' ? '#34d399' : '#f43f5e'
                      }}>
                        {tx.type === 'payment_received' ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                      </strong>
                      <span className={`badge ${tx.type === 'payment_received' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.62rem', display: 'block', marginTop: '2px' }}>
                        {tx.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
