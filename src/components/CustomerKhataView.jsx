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
  ExternalLink,
  Download,
  UserPlus,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { generateWhatsAppReminder } from '../utils/whatsappHelper';

export default function CustomerKhataView({
  customers = [],
  transactions = [],
  onAddCredit,
  onRecordPayment,
  onOpenAddCustomer,
  storeProfile,
  searchQuery = ""
}) {
  const [filterTab, setFilterTab] = useState('all'); // all, overdue, due-soon, cleared
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState(null);
  const [activeWhatsAppModal, setActiveWhatsAppModal] = useState(null);
  const [settleModalCust, setSettleModalCust] = useState(null);
  const [settleAmount, setSettleAmount] = useState("");
  const [addCreditCust, setAddCreditCust] = useState(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");

  const now = new Date();

  // Filter logic
  const filteredCustomers = customers.filter(cust => {
    const matchesSearch = 
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cust.phone && cust.phone.includes(searchQuery));

    if (!matchesSearch) return false;

    if (filterTab === 'overdue') return cust.status === 'overdue' || new Date(cust.dueDate) < now;
    if (filterTab === 'due-soon') {
      const diffDays = (new Date(cust.dueDate) - now) / 86400000;
      return diffDays >= 0 && diffDays <= 7 && cust.balance > 0;
    }
    if (filterTab === 'cleared') return cust.balance === 0;
    return true;
  });

  const totalOutstanding = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
  const overdueCustomers = customers.filter(c => c.status === 'overdue' || new Date(c.dueDate) < now);
  const overdueAmount = overdueCustomers.reduce((sum, c) => sum + (c.balance || 0), 0);

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

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Customer Name", "Phone", "Outstanding Udhaar (INR)", "Due Date", "Status", "Trust Score", "Behavior Pattern"];
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
    link.setAttribute("download", `MoneyView_Customer_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
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
    onAddCredit(addCreditCust, parseFloat(creditAmount), creditReason || "Grocery items on credit");
    setAddCreditCust(null);
    setCreditAmount("");
    setCreditReason("");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* 4 Header Metric Cards - Responsive Grid */}
      <div className="metrics-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div className="fintech-card" style={{ padding: '12px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Udhaar
          </span>
          <div className="num-mono" style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--amber-text)', marginTop: '2px' }}>
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
            {customers.length} accounts
          </span>
        </div>

        <div className="fintech-card" style={{ padding: '12px', borderLeft: '3px solid var(--rose-main)' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Overdue Dues
          </span>
          <div className="num-mono" style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--rose-text)', marginTop: '2px' }}>
            ₹{overdueAmount.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--rose-text)' }}>
            {overdueCustomers.length} critical
          </span>
        </div>

        <div className="fintech-card" style={{ padding: '12px', borderLeft: '3px solid var(--emerald-main)' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            7-Day Expected
          </span>
          <div className="num-mono" style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--emerald-text)', marginTop: '2px' }}>
            ₹{(totalOutstanding - overdueAmount).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
            Scheduled
          </span>
        </div>

        <div className="fintech-card" style={{ padding: '12px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Recovery Rate
          </span>
          <div className="num-mono" style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
            88.5%
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            Store index
          </span>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '2px' }}>
          {[
            { id: 'all', label: `All (${customers.length})` },
            { id: 'overdue', label: `🚨 Overdue (${overdueCustomers.length})` },
            { id: 'due-soon', label: `Due 7d` },
            { id: 'cleared', label: `Settled` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              style={{
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: filterTab === tab.id ? '600' : '500',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: filterTab === tab.id ? 'var(--bg-card)' : 'transparent',
                color: filterTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: filterTab === tab.id ? '1px solid var(--border-medium)' : '1px solid transparent',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={handleExportCSV} className="btn-secondary" style={{ fontSize: '0.74rem', padding: '5px 10px' }}>
            <Download size={12} /> CSV
          </button>
          <button onClick={onOpenAddCustomer} className="btn-primary" style={{ fontSize: '0.74rem', padding: '5px 12px' }}>
            <UserPlus size={13} /> + Customer
          </button>
        </div>
      </div>

      {/* 1. DESKTOP VIEW: Structured Enterprise Table */}
      <div className="desktop-only-table fintech-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="fintech-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact</th>
                <th>Outstanding (₹)</th>
                <th>Due Date & Status</th>
                <th>Repayment Profile</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-tertiary)' }}>
                    No customer accounts found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(cust => {
                  const isOverdue = cust.status === 'overdue' || new Date(cust.dueDate) < now;
                  const initials = cust.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

                  return (
                    <tr key={cust.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-card-subtle)',
                            border: '1px solid var(--border-medium)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            color: 'var(--text-secondary)'
                          }}>
                            {initials}
                          </div>
                          <div>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.86rem', display: 'block' }}>
                              {cust.name}
                            </strong>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                              {cust.category || 'Groceries'} • {cust.transactionsCount || 1} transactions
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        <span className="num-mono">{cust.phone}</span>
                      </td>

                      <td>
                        <strong className="num-mono" style={{
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: isOverdue ? 'var(--rose-text)' : (cust.balance > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)')
                        }}>
                          ₹{cust.balance.toLocaleString('en-IN')}
                        </strong>
                      </td>

                      <td>
                        <div>
                          <span className="num-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>
                            {cust.dueDate}
                          </span>
                          <span className={`status-pill ${isOverdue ? 'danger' : (cust.balance > 0 ? 'warning' : 'success')}`} style={{ marginTop: '2px' }}>
                            <span className={`status-dot ${isOverdue ? 'red' : (cust.balance > 0 ? 'amber' : 'green')}`}></span>
                            {isOverdue ? 'Overdue' : (cust.balance > 0 ? 'Pending' : 'Cleared')}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', display: 'block' }}>
                            {cust.behavior || 'Regular'}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                            Trust: <span className="num-mono">{cust.trustScore || 85}%</span>
                          </span>
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '5px' }}>
                          {cust.balance > 0 && (
                            <button
                              onClick={() => handleWhatsAppClick(cust)}
                              className="btn-whatsapp"
                              title="Send WhatsApp Reminder"
                            >
                              <MessageSquare size={12} /> Remind
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setAddCreditCust(cust);
                              setCreditAmount("");
                            }}
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            title="Add Udhaar"
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
                              style={{ padding: '4px 8px', fontSize: '0.74rem', color: 'var(--emerald-text)' }}
                              title="Collect Payment"
                            >
                              Collect ₹
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedCustomerForHistory(cust)}
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            title="Statement History"
                          >
                            <History size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. MOBILE VIEW: Touch-Friendly Customer Cards */}
      <div className="mobile-only-cards">
        {filteredCustomers.length === 0 ? (
          <div className="fintech-card" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
            No accounts found.
          </div>
        ) : (
          filteredCustomers.map(cust => {
            const isOverdue = cust.status === 'overdue' || new Date(cust.dueDate) < now;
            const initials = cust.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

            return (
              <div
                key={cust.id}
                className="fintech-card"
                style={{
                  padding: '14px',
                  borderLeft: isOverdue ? '3px solid var(--rose-main)' : (cust.balance > 0 ? '3px solid var(--amber-main)' : '3px solid var(--border-subtle)'),
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-medium)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      color: 'var(--text-primary)'
                    }}>
                      {initials}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'block' }}>
                        {cust.name}
                      </strong>
                      <span className="num-mono" style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                        {cust.phone}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="num-mono" style={{
                      fontSize: '1.15rem',
                      fontWeight: '800',
                      color: isOverdue ? 'var(--rose-text)' : (cust.balance > 0 ? 'var(--amber-text)' : 'var(--text-tertiary)')
                    }}>
                      ₹{cust.balance.toLocaleString('en-IN')}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                      {cust.balance > 0 ? 'Balance Due' : 'Cleared'}
                    </span>
                  </div>
                </div>

                {/* Status & Behavior row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 8px',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.72rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`status-pill ${isOverdue ? 'danger' : (cust.balance > 0 ? 'warning' : 'success')}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                      <span className={`status-dot ${isOverdue ? 'red' : (cust.balance > 0 ? 'amber' : 'green')}`}></span>
                      {isOverdue ? 'Overdue' : (cust.balance > 0 ? `Due: ${cust.dueDate}` : 'Settled')}
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    {cust.behavior || 'Regular'} • <span className="num-mono">{cust.trustScore || 85}%</span>
                  </span>
                </div>

                {/* Full-width touch action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cust.balance > 0 && (
                    <button
                      onClick={() => handleWhatsAppClick(cust)}
                      className="btn-whatsapp"
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        justifyContent: 'center',
                        width: '100%'
                      }}
                    >
                      <MessageSquare size={14} /> Send WhatsApp Reminder (₹{cust.balance.toLocaleString('en-IN')})
                    </button>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: cust.balance > 0 ? '1fr 1fr 1fr' : '1fr 1fr', gap: '6px' }}>
                    <button
                      onClick={() => {
                        setAddCreditCust(cust);
                        setCreditAmount("");
                      }}
                      className="btn-secondary"
                      style={{
                        padding: '7px 8px',
                        fontSize: '0.75rem',
                        justifyContent: 'center',
                        color: 'var(--amber-text)',
                        borderColor: 'rgba(217, 119, 6, 0.3)'
                      }}
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
                        style={{
                          padding: '7px 8px',
                          fontSize: '0.75rem',
                          color: 'var(--emerald-text)',
                          borderColor: 'rgba(22, 163, 74, 0.3)',
                          justifyContent: 'center'
                        }}
                      >
                        Collect ₹
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedCustomerForHistory(cust)}
                      className="btn-secondary"
                      style={{ padding: '7px 8px', fontSize: '0.75rem', justifyContent: 'center', gap: '4px' }}
                      title="View Ledger Statement"
                    >
                      <History size={13} />
                      <span>Ledger</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Settle Modal */}
      {settleModalCust && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div className="modal-sheet-content fintech-card" style={{ width: '100%', maxWidth: '400px', padding: '20px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
              Collect Payment: {settleModalCust.name}
            </h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '14px' }}>
              Outstanding Balance: <span className="num-mono" style={{ color: 'var(--rose-text)', fontWeight: '700' }}>₹{settleModalCust.balance}</span>
            </span>

            <form onSubmit={submitSettlement} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>
                  Amount Collected (₹) *
                </label>
                <input
                  type="number"
                  value={settleAmount}
                  onChange={e => setSettleAmount(e.target.value)}
                  required
                  className="fintech-input num-mono"
                  style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--emerald-text)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSettleAmount(settleModalCust.balance.toString())}
                  style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}
                >
                  Full (₹{settleModalCust.balance})
                </button>
                <button
                  type="button"
                  onClick={() => setSettleAmount(Math.round(settleModalCust.balance / 2).toString())}
                  style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}
                >
                  50% Partial
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px' }}>
                  Record Payment Received
                </button>
                <button type="button" onClick={() => setSettleModalCust(null)} className="btn-secondary" style={{ padding: '10px 14px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Udhaar Modal */}
      {addCreditCust && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div className="modal-sheet-content fintech-card" style={{ width: '100%', maxWidth: '400px', padding: '20px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
              Add Udhaar: {addCreditCust.name}
            </h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '14px' }}>
              Current Balance: <span className="num-mono">₹{addCreditCust.balance}</span>
            </span>

            <form onSubmit={submitAddCredit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>
                  Credit Amount (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1200"
                  value={creditAmount}
                  onChange={e => setCreditAmount(e.target.value)}
                  required
                  className="fintech-input num-mono"
                  style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--amber-text)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>
                  Items / Purchase Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Atta 10kg, Mustard Oil 2L"
                  value={creditReason}
                  onChange={e => setCreditReason(e.target.value)}
                  className="fintech-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px', backgroundColor: 'var(--amber-main)' }}>
                  Add to Khata
                </button>
                <button type="button" onClick={() => setAddCreditCust(null)} className="btn-secondary" style={{ padding: '10px 14px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {activeWhatsAppModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div className="modal-sheet-content fintech-card" style={{ width: '100%', maxWidth: '440px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', margin: 0 }}>WhatsApp Payment Reminder</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {activeWhatsAppModal.customer.name} ({activeWhatsAppModal.customer.phone})
                </span>
              </div>
              <button onClick={() => setActiveWhatsAppModal(null)} style={{ background: 'transparent', color: 'var(--text-tertiary)' }}>✕</button>
            </div>

            <div style={{
              backgroundColor: '#16221c',
              color: '#f4f4f6',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
              marginBottom: '12px',
              border: '1px solid rgba(74, 222, 128, 0.2)'
            }}>
              {activeWhatsAppModal.reminder.message}
            </div>

            <div style={{
              backgroundColor: 'var(--bg-app)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '14px',
              fontSize: '0.75rem',
              color: 'var(--emerald-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Attached UPI VPA: <strong>{storeProfile?.upiId}</strong></span>
              <span className="status-pill success" style={{ fontSize: '0.62rem' }}>UPI Ready</span>
            </div>

            <button
              onClick={() => executeSendWhatsApp(activeWhatsAppModal.reminder.waUrl)}
              className="btn-whatsapp"
              style={{ width: '100%', padding: '10px', justifyContent: 'center', fontSize: '0.85rem' }}
            >
              Open WhatsApp & Dispatch <ExternalLink size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Statement History Modal */}
      {selectedCustomerForHistory && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div className="modal-sheet-content fintech-card" style={{ width: '100%', maxWidth: '480px', padding: '20px', maxHeight: '86vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{selectedCustomerForHistory.name}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Ledger Statement • Mobile: {selectedCustomerForHistory.phone}
                </span>
              </div>
              <button onClick={() => setSelectedCustomerForHistory(null)} style={{ background: 'transparent', color: 'var(--text-tertiary)' }}>✕</button>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              marginBottom: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block' }}>Net Balance</span>
                <strong className="num-mono" style={{ fontSize: '1.25rem', color: 'var(--emerald-text)' }}>
                  ₹{selectedCustomerForHistory.balance.toLocaleString('en-IN')}
                </strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block' }}>Payment Term</span>
                <span className="num-mono" style={{ fontSize: '0.8rem', color: 'var(--amber-text)', fontWeight: '600' }}>
                  {selectedCustomerForHistory.dueDate}
                </span>
              </div>
            </div>

            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px' }}>
              Transaction Log:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {transactions
                .filter(t => t.customerName.toLowerCase().includes(selectedCustomerForHistory.name.toLowerCase().split(' ')[0]))
                .map(tx => (
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
                    <div>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block' }}>
                        {tx.description}
                      </strong>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                        {new Date(tx.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {tx.channel}
                      </span>
                    </div>
                    <strong className="num-mono" style={{
                      fontSize: '0.88rem',
                      color: tx.type === 'payment_received' ? 'var(--emerald-text)' : 'var(--rose-text)'
                    }}>
                      {tx.type === 'payment_received' ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                    </strong>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
