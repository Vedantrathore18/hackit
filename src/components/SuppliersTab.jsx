import React, { useState } from 'react';
import { Truck, Plus, Check, Calendar, AlertCircle } from 'lucide-react';

export default function SuppliersTab({
  suppliers = [],
  onRecordSupplierPayment,
  onAddSupplier
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState("");
  const [urgency, setUrgency] = useState("medium");

  const totalCommitted = suppliers.reduce((sum, s) => sum + s.amountDue, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !amount) return;

    onAddSupplier({
      id: `sup-${Date.now()}`,
      name,
      amountDue: parseFloat(amount),
      dueDate: dueDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      items: items || "Supermarket inventory",
      urgency,
      contact: "+91 98000 00000",
      bankName: "HDFC Bank"
    });

    setName("");
    setAmount("");
    setDueDate("");
    setItems("");
    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* KPI Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
            Total Committed Supplier Payables
          </span>
          <div className="num-tabular" style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--danger)', marginTop: '2px' }}>
            ₹{totalCommitted.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dark)' }}>
            Across {suppliers.length} FMCG, Dairy and Mandi distributors
          </span>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: '8px 16px' }}>
          <Plus size={15} /> + Add Supplier Invoice
        </button>
      </div>

      {/* 1. DESKTOP VIEW: Structured Table (≥ 769px) */}
      <div className="desktop-only-table fintech-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="fintech-table">
          <thead>
            <tr>
              <th>Distributor / Supplier</th>
              <th>Supplied Inventory</th>
              <th>Scheduled Payment Date</th>
              <th>Priority</th>
              <th style={{ textAlign: 'right' }}>Amount Due (₹)</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(sup => {
              const isCritical = sup.urgency === 'critical' || sup.urgency === 'high';

              return (
                <tr key={sup.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-card-subtle)',
                        border: '1px solid var(--border-medium)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)'
                      }}>
                        <Truck size={15} />
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.86rem' }}>{sup.name}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{sup.bankName}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {sup.items}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{sup.dueDate}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${isCritical ? 'danger' : 'warning'}`}>
                      <span className={`status-dot ${isCritical ? 'red' : 'amber'}`}></span>
                      {sup.urgency}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong className="num-mono" style={{ fontSize: '1rem', color: 'var(--rose-text)', fontWeight: '700' }}>
                      ₹{sup.amountDue.toLocaleString('en-IN')}
                    </strong>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => onRecordSupplierPayment(sup)}
                      className="btn-secondary"
                      style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                    >
                      Pay Now
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 2. MOBILE VIEW: Touch Distributor Cards (≤ 768px) */}
      <div className="mobile-only-cards">
        {suppliers.map(sup => {
          const isCritical = sup.urgency === 'critical' || sup.urgency === 'high';

          return (
            <div
              key={sup.id}
              className="fintech-card"
              style={{
                padding: '14px',
                borderLeft: isCritical ? '3px solid var(--rose-main)' : '3px solid var(--amber-main)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {/* Header */}
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
                    color: 'var(--text-secondary)'
                  }}>
                    <Truck size={16} />
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'block' }}>
                      {sup.name}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                      {sup.bankName}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="num-mono" style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--rose-text)' }}>
                    ₹{sup.amountDue.toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                    Payable Due
                  </span>
                </div>
              </div>

              {/* Items & Due Date */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-app)',
                padding: '8px 10px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.72rem'
              }}>
                <span style={{ color: 'var(--text-secondary)', maxWidth: '65%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  📦 {sup.items}
                </span>
                <span className={`status-pill ${isCritical ? 'danger' : 'warning'}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  <span className={`status-dot ${isCritical ? 'red' : 'amber'}`}></span>
                  Due: {sup.dueDate}
                </span>
              </div>

              {/* Touch Pay Action */}
              <button
                onClick={() => onRecordSupplierPayment(sup)}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '9px',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}
              >
                Record Supplier Payment (₹{sup.amountDue.toLocaleString('en-IN')})
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div style={{
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
          <div className="fintech-card" style={{ width: '100%', maxWidth: '440px', padding: '24px' }}>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Add Supplier Invoice</h4>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Supplier Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Amul Milk Distributor"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="fintech-input"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Amount Due (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 14500"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  className="fintech-input num-tabular"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Payment Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="fintech-input"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Items Delivered</label>
                <input
                  type="text"
                  placeholder="e.g. Milk crates, Butter, Paneer"
                  value={items}
                  onChange={e => setItems(e.target.value)}
                  className="fintech-input"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px' }}>Save Payable</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
