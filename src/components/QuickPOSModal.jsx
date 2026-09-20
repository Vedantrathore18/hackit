import React, { useState } from 'react';
import { ShoppingBag, X, Plus, Check, User, CreditCard, DollarSign } from 'lucide-react';

const QUICK_ITEMS = [
  { id: 'item-1', name: 'Amul Milk 1L', price: 68, category: 'Dairy' },
  { id: 'item-2', name: 'Aashirvaad Atta 5kg', price: 245, category: 'Grains' },
  { id: 'item-3', name: 'Fortune Mustard Oil 1L', price: 165, category: 'Edibles' },
  { id: 'item-4', name: 'Tata Tea Gold 500g', price: 310, category: 'Beverages' },
  { id: 'item-5', name: 'Surf Excel 1kg', price: 140, category: 'Household' },
  { id: 'item-6', name: 'Parle-G & Biscuits', price: 80, category: 'Snacks' }
];

export default function QuickPOSModal({
  isOpen,
  onClose,
  onRecordSale,
  customers = []
}) {
  const [cart, setCart] = useState([]);
  const [paymentMode, setPaymentMode] = useState('credit'); // credit (udhaar), cash, upi
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || "");
  const [customAmount, setCustomAmount] = useState("");
  const [creditDueDays, setCreditDueDays] = useState(7);

  if (!isOpen) return null;

  const addItemToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const finalTotal = customAmount ? parseFloat(customAmount) : cartTotal;

  const handleCompleteSale = () => {
    if (finalTotal <= 0) {
      alert("Please add items or enter an invoice amount");
      return;
    }

    const selectedCust = customers.find(c => c.id === selectedCustomerId) || { name: "Counter Customer" };

    onRecordSale({
      customerName: selectedCust.name,
      amount: finalTotal,
      type: paymentMode === 'credit' ? 'credit_sale' : (paymentMode === 'cash' ? 'cash_sale' : 'upi_sale'),
      dueDays: paymentMode === 'credit' ? creditDueDays : 0,
      dueDate: new Date(Date.now() + creditDueDays * 86400000).toISOString().split('T')[0],
      description: cart.length > 0 ? cart.map(i => `${i.name} x${i.qty}`).join(', ') : `Supermarket sale bill`,
      channel: "Quick POS"
    });

    onClose();
    setCart([]);
    setCustomAmount("");
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
        padding: '20px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={18} color="var(--emerald-text)" /> Quick Store Billing & Invoice
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Fast 1-tap supermarket cart checkout</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)', fontSize: '1.2rem', padding: '4px' }}>✕</button>
        </div>

        {/* 1-Tap Fast Grocery Items */}
        <div style={{ marginBottom: '14px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>
            Tap to Add Popular Grocery Items:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {QUICK_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => addItemToCart(item)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '8px',
                  textAlign: 'left',
                  fontSize: '0.72rem',
                  color: '#e5e7eb'
                }}
              >
                <div style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </div>
                <div style={{ color: '#34d399', marginTop: '2px', fontWeight: '700' }}>
                  ₹{item.price}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Amount override */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
            Or Enter Direct Bill Total (₹):
          </label>
          <input
            type="number"
            placeholder={cartTotal > 0 ? `Current Cart: ₹${cartTotal}` : "e.g. 1850"}
            value={customAmount}
            onChange={e => setCustomAmount(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: '#f9fafb',
              fontSize: '1.1rem',
              fontWeight: '700'
            }}
          />
        </div>

        {/* Cart preview */}
        {cart.length > 0 && !customAmount && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '10px',
            padding: '8px 12px',
            marginBottom: '14px',
            maxHeight: '110px',
            overflowY: 'auto'
          }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', padding: '3px 0' }}>
                <span style={{ color: '#e5e7eb' }}>{item.name} x{item.qty}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: '#34d399' }}>₹{item.price * item.qty}</strong>
                  <button onClick={() => removeItem(item.id)} style={{ background: 'transparent', color: '#ef4444' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Method Selector */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>
            Payment Mode:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              onClick={() => setPaymentMode('credit')}
              style={{
                background: paymentMode === 'credit' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: paymentMode === 'credit' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '8px',
                color: paymentMode === 'credit' ? '#fbbf24' : '#9ca3af',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}
            >
              📖 Udhaar (Credit)
            </button>
            <button
              onClick={() => setPaymentMode('cash')}
              style={{
                background: paymentMode === 'cash' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: paymentMode === 'cash' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '8px',
                color: paymentMode === 'cash' ? '#34d399' : '#9ca3af',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}
            >
              💵 Cash (Galla)
            </button>
            <button
              onClick={() => setPaymentMode('upi')}
              style={{
                background: paymentMode === 'upi' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: paymentMode === 'upi' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '8px',
                color: paymentMode === 'upi' ? '#60a5fa' : '#9ca3af',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}
            >
              📲 Online UPI
            </button>
          </div>
        </div>

        {/* If Udhaar: Pick Customer & Credit Due Days */}
        {paymentMode === 'credit' && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Select Customer for Khata:
              </label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#f9fafb',
                  padding: '6px 8px',
                  fontSize: '0.8rem'
                }}
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Current: ₹{c.balance})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Credit Period (Days):
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[3, 7, 10, 15, 30].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setCreditDueDays(d)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      background: creditDueDays === d ? '#f59e0b' : 'rgba(255, 255, 255, 0.05)',
                      color: creditDueDays === d ? '#000000' : '#e5e7eb',
                      fontWeight: '700'
                    }}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Total & Checkout */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Grand Total:</span>
          <strong style={{ fontSize: '1.4rem', color: '#10b981' }}>
            ₹{finalTotal.toLocaleString('en-IN')}
          </strong>
        </div>

        <button
          onClick={handleCompleteSale}
          className="btn-primary"
          style={{ width: '100%', padding: '12px', fontSize: '0.92rem' }}
        >
          <Check size={18} /> Record Sale & Print Receipt
        </button>
      </div>
    </div>
  );
}
