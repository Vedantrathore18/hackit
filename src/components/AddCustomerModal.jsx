import React, { useState } from 'react';
import { UserPlus, X, Check, Phone, DollarSign, Calendar, Shield } from 'lucide-react';

export default function AddCustomerModal({
  isOpen,
  onClose,
  onAddCustomer
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [dueDays, setDueDays] = useState(7);
  const [category, setCategory] = useState("Groceries");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const balanceNum = parseFloat(initialBalance) || 0;

    const newCust = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim() || "98000 00000",
      balance: balanceNum,
      dueDays: dueDays,
      dueDate: new Date(Date.now() + dueDays * 86400000).toISOString().split('T')[0],
      category: category,
      trustScore: 90,
      behavior: "New Customer",
      status: balanceNum > 0 ? "pending" : "cleared",
      notes: notes || "Added manually",
      transactionsCount: balanceNum > 0 ? 1 : 0
    };

    onAddCustomer(newCust);
    onClose();
    setName("");
    setPhone("");
    setInitialBalance("");
    setNotes("");
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div className="modal-sheet-content" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '460px',
        padding: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} color="var(--emerald-text)" /> Add New Customer Khata
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Create a digital credit ledger for this customer</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)', fontSize: '1.2rem', padding: '4px' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
              Customer Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Rajesh Gupta / Sharma ji"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', color: '#f8fafc', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
              Mobile Phone Number (for WhatsApp Reminders) *
            </label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', color: '#f8fafc', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Initial Udhaar (₹)
              </label>
              <input
                type="number"
                placeholder="0"
                value={initialBalance}
                onChange={e => setInitialBalance(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', color: '#34d399', fontSize: '1rem', fontWeight: '700' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Credit Cycle
              </label>
              <select
                value={dueDays}
                onChange={e => setDueDays(parseInt(e.target.value))}
                style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', color: '#f8fafc', fontSize: '0.85rem' }}
              >
                <option value={3}>3 Days</option>
                <option value={7}>7 Days (Weekly)</option>
                <option value={15}>15 Days (Fortnightly)</option>
                <option value={30}>30 Days (Monthly)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
              Customer Notes / Address
            </label>
            <input
              type="text"
              placeholder="e.g. Street #4 resident, clears via UPI"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', color: '#f8fafc', fontSize: '0.85rem' }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.92rem', marginTop: '10px' }}
          >
            <Check size={18} /> Create Customer Khata
          </button>
        </form>
      </div>
    </div>
  );
}
