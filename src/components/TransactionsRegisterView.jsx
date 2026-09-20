import React, { useState } from 'react';
import { Search, Download, Filter, ArrowUpRight, ArrowDownRight, Receipt } from 'lucide-react';

export default function TransactionsRegisterView({
  transactions = []
}) {
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState("");

  const filtered = transactions.filter(t => {
    const matchesSearch = 
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const exportCSV = () => {
    const headers = ["Timestamp", "Transaction ID", "Party / Customer", "Type", "Amount (INR)", "Channel", "Description"];
    const rows = transactions.map(t => [
      `"${t.timestamp}"`,
      `"${t.id}"`,
      `"${t.customerName}"`,
      `"${t.type}"`,
      t.amount,
      `"${t.channel}"`,
      `"${t.description}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Store_Transactions_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'all', label: `All Transactions (${transactions.length})` },
            { id: 'credit_sale', label: 'Udhaar Sales' },
            { id: 'payment_received', label: 'Repayments' },
            { id: 'cash_sale', label: 'Cash Counter' },
            { id: 'supplier_payment', label: 'Supplier Payouts' },
            { id: 'expense', label: 'Expenses' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: '600',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: filterType === tab.id ? 'var(--bg-surface-elevated)' : 'transparent',
                color: filterType === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                border: filterType === tab.id ? '1px solid var(--border-medium)' : '1px solid transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button onClick={exportCSV} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
          <Download size={14} /> Export Register CSV
        </button>
      </div>

      {/* Table */}
      <div className="fintech-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="fintech-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Party / Customer</th>
              <th>Description</th>
              <th>Source / Channel</th>
              <th>Type</th>
              <th style={{ textAlign: 'right' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => {
              const isCredit = tx.type === 'credit_sale';
              const isRepayment = tx.type === 'payment_received' || tx.type === 'cash_sale';

              return (
                <tr key={tx.id}>
                  <td style={{ color: 'var(--text-dark)', fontSize: '0.75rem' }}>
                    {new Date(tx.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <strong style={{ color: 'var(--text-main)' }}>{tx.customerName}</strong>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {tx.description}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: tx.channel?.includes('Telegram') ? 'var(--info)' : 'var(--text-dark)' }}>
                      {tx.channel}
                    </span>
                  </td>
                  <td>
                    <span className={`chip ${isRepayment ? 'chip-success' : (isCredit ? 'chip-warning' : 'chip-danger')}`}>
                      {tx.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong className="num-tabular" style={{
                      fontSize: '0.98rem',
                      color: isRepayment ? 'var(--primary)' : (isCredit ? 'var(--warning)' : 'var(--danger)')
                    }}>
                      {isRepayment ? `+₹${tx.amount.toLocaleString('en-IN')}` : (isCredit ? `₹${tx.amount.toLocaleString('en-IN')}` : `-₹${tx.amount.toLocaleString('en-IN')}`)}
                    </strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
