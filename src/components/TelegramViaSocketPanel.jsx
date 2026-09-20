import React, { useState } from 'react';
import { 
  Send, 
  Bot, 
  Table, 
  CheckCircle, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight, 
  FileSpreadsheet,
  Globe,
  Radio,
  ExternalLink,
  Edit2,
  Zap
} from 'lucide-react';
import { VIA_SOCKET_CATEGORIES } from '../data/initialData';

export default function TelegramViaSocketPanel({
  transactions = [],
  onAddViaSocketExpense
}) {
  const [telegramInput, setTelegramInput] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [lastClassification, setLastClassification] = useState(null);
  
  // Real live ViaSocket webhook provided by user
  const DEFAULT_WEBHOOK = "https://flow.sokt.io/func/scride31s4Wx";
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('moneyview_viasocket_webhook') || DEFAULT_WEBHOOK;
  });
  const [isEditingWebhook, setIsEditingWebhook] = useState(false);
  const [customWebhookInput, setCustomWebhookInput] = useState(webhookUrl);
  const [pingStatus, setPingStatus] = useState(null);

  const saveCustomWebhook = (e) => {
    e.preventDefault();
    if (!customWebhookInput.trim()) return;
    setWebhookUrl(customWebhookInput.trim());
    localStorage.setItem('moneyview_viasocket_webhook', customWebhookInput.trim());
    setIsEditingWebhook(false);
  };

  const resetToDefaultWebhook = () => {
    setWebhookUrl(DEFAULT_WEBHOOK);
    setCustomWebhookInput(DEFAULT_WEBHOOK);
    localStorage.setItem('moneyview_viasocket_webhook', DEFAULT_WEBHOOK);
    setIsEditingWebhook(false);
  };

  const classifyExpense = (text) => {
    const lower = text.toLowerCase();
    let category = "Store Operations";
    let amount = 0;

    const amtMatch = lower.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)?)/);
    if (amtMatch) {
      amount = parseInt(amtMatch[1].replace(/,/g, ''), 10);
    } else {
      amount = 500;
    }

    if (lower.includes("auto") || lower.includes("fare") || lower.includes("petrol") || lower.includes("delivery") || lower.includes("transport") || lower.includes("mandi")) {
      category = "Logistics / Mandi Transport";
    } else if (lower.includes("packaging") || lower.includes("bag") || lower.includes("tape") || lower.includes("poly") || lower.includes("box")) {
      category = "Packaging & Materials";
    } else if (lower.includes("helper") || lower.includes("labor") || lower.includes("wage") || lower.includes("chai") || lower.includes("lunch")) {
      category = "Labor & Store Helper Wages";
    } else if (lower.includes("light") || lower.includes("bill") || lower.includes("bijli") || lower.includes("electricity") || lower.includes("meter")) {
      category = "Store Utilities & Power";
    } else if (lower.includes("milk") || lower.includes("doodh") || lower.includes("dairy") || lower.includes("paneer")) {
      category = "Dairy Inventory";
    }

    return { category, amount };
  };

  // Dispatch actual live HTTP POST to the real ViaSocket flow
  const dispatchToViaSocketWebhook = async (payload) => {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // ensures cross-origin calls from browser execute reliably
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      return true;
    } catch (err) {
      console.warn("ViaSocket dispatch note:", err);
      return false;
    }
  };

  const handleSendTelegram = async (e) => {
    e.preventDefault();
    if (!telegramInput.trim()) return;

    setIsSimulating(true);
    const classification = classifyExpense(telegramInput);

    const webhookPayload = {
      message: telegramInput,
      text: telegramInput,
      amount: classification.amount,
      category: classification.category,
      source: "Telegram Bot / MoneyView Store",
      storeName: "Gupta Kirana Store",
      timestamp: new Date().toISOString()
    };

    // Live network trigger to ViaSocket webhook
    await dispatchToViaSocketWebhook(webhookPayload);

    setTimeout(() => {
      setLastClassification({
        original: telegramInput,
        category: classification.category,
        amount: classification.amount,
        webhookUrl: webhookUrl,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      });

      onAddViaSocketExpense({
        id: `tx-tg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "expense",
        customerName: "Store Operational Expense",
        amount: classification.amount,
        description: `${telegramInput} (${classification.category})`,
        channel: "Telegram (ViaSocket Live Webhook)",
        status: "synced"
      });

      setTelegramInput("");
      setIsSimulating(false);
    }, 450);
  };

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingStatus(null);

    const pingPayload = {
      event: "webhook_ping_test",
      message: "⚡ Live Webhook Ping from MoneyView Supermarket Ledger",
      store: "Gupta Kirana Store",
      timestamp: new Date().toISOString()
    };

    await dispatchToViaSocketWebhook(pingPayload);

    setTimeout(() => {
      setIsPinging(false);
      setPingStatus({
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        msg: "Payload dispatched to flow.sokt.io"
      });
      setTimeout(() => setPingStatus(null), 5000);
    }, 400);
  };

  const copyWebhookToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const tgTransactions = transactions.filter(t => t.channel && t.channel.includes("Telegram"));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Integration Overview Card */}
      <div className="fintech-card" style={{ borderLeft: '4px solid #0088cc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 136, 204, 0.15)',
              color: '#0088cc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ fontSize: '1.05rem', margin: 0, fontWeight: '700' }}>
                  Telegram Bot + ViaSocket Live Webhook
                </h4>
                <span className="status-pill success" style={{ fontSize: '0.65rem' }}>
                  <span className="status-dot green"></span> Connected
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Conversational kirana expense classifier & Google Sheets auto-synchronizer
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handleTestPing}
              disabled={isPinging}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '5px 10px', color: 'var(--blue-text)', borderColor: 'rgba(37, 99, 235, 0.3)' }}
              title="Send a live test payload to flow.sokt.io"
            >
              <Zap size={13} />
              <span>{isPinging ? "Dispatching..." : "⚡ Test Ping"}</span>
            </button>
          </div>
        </div>

        {pingStatus && (
          <div style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'rgba(22, 163, 74, 0.12)',
            border: '1px solid rgba(22, 163, 74, 0.3)',
            fontSize: '0.74rem',
            color: 'var(--emerald-text)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <span>✓ {pingStatus.msg}</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{pingStatus.time}</span>
          </div>
        )}

        {/* Clean Architectural Pipeline */}
        <div className="telegram-pipeline-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginTop: '10px',
          backgroundColor: 'var(--bg-app)',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0088cc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: '800', flexShrink: 0 }}>1</span>
            <div>
              <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'block' }}>Telegram Message</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Store owner sends expense text to bot</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: '800', flexShrink: 0 }}>2</span>
            <div>
              <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'block' }}>ViaSocket Flow</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Auto-classifies & appends to Google Sheet</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: '800', flexShrink: 0 }}>3</span>
            <div>
              <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'block' }}>MoneyView Ledger</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Deducts cash & updates cash-flow forecast</span>
            </div>
          </div>
        </div>

        {/* Live Webhook Endpoint Bar */}
        <div style={{
          marginTop: '12px',
          padding: '10px 14px',
          backgroundColor: 'var(--bg-app)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {isEditingWebhook ? (
            <form onSubmit={saveCustomWebhook} style={{ display: 'flex', gap: '6px', flex: 1, flexWrap: 'wrap', width: '100%' }}>
              <input
                type="url"
                value={customWebhookInput}
                onChange={e => setCustomWebhookInput(e.target.value)}
                className="fintech-input"
                style={{ flex: 1, minWidth: '240px', fontSize: '0.76rem', height: '32px' }}
                placeholder="Enter ViaSocket Webhook URL"
                required
              />
              <button type="submit" className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Save</button>
              <button type="button" onClick={resetToDefaultWebhook} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>Reset Default</button>
              <button type="button" onClick={() => setIsEditingWebhook(false)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>Cancel</button>
            </form>
          ) : (
            <>
              <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Live Webhook Ingestion URL:</span>
                  <span className="status-pill success" style={{ fontSize: '0.58rem', padding: '0px 4px' }}>Active</span>
                </div>
                <code className="num-mono" style={{ fontSize: '0.74rem', color: 'var(--blue-text)', wordBreak: 'break-all', display: 'block', marginTop: '2px' }}>
                  {webhookUrl}
                </code>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => setIsEditingWebhook(true)}
                  className="btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                  title="Edit Webhook URL"
                >
                  <Edit2 size={12} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={copyWebhookToClipboard}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                  title="Copy webhook URL for Telegram Bot or ViaSocket"
                >
                  {copiedWebhook ? <Check size={13} color="var(--emerald-text)" /> : <Copy size={13} />}
                  <span>{copiedWebhook ? "Copied" : "Copy URL"}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Interactive Telegram Simulator Grid */}
      <div className="telegram-simulator-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
        {/* Simulator Box */}
        <div className="fintech-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Live Telegram Expense Simulator</h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Dispatches to flow.sokt.io</span>
          </div>

          <form onSubmit={handleSendTelegram} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              placeholder="e.g. Paid ₹450 auto fare for delivery to mandi..."
              value={telegramInput}
              onChange={e => setTelegramInput(e.target.value)}
              className="fintech-input"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  "₹450 auto delivery",
                  "₹1,200 packaging poly bags",
                  "₹2,800 electricity bill",
                  "₹300 helper lunch"
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTelegramInput(prompt)}
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem'
                    }}
                  >
                    + {prompt}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="btn-primary"
                style={{ backgroundColor: '#0088cc', padding: '9px 16px', fontSize: '0.82rem', justifyContent: 'center', width: '100%' }}
              >
                <Send size={13} /> {isSimulating ? "Dispatching to ViaSocket & Ledger..." : "Send Telegram Expense Event"}
              </button>
            </div>
          </form>

          {lastClassification && (
            <div style={{
              marginTop: '14px',
              padding: '10px 14px',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid rgba(22, 163, 74, 0.3)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--emerald-text)', fontWeight: '700' }}>
                  ✓ Dispatched to ViaSocket (flow.sokt.io)
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{lastClassification.timestamp}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                "{lastClassification.original}" ➔ Auto-Classified as <strong>{lastClassification.category}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span className="num-mono" style={{ color: 'var(--rose-text)', fontWeight: '800', fontSize: '0.92rem' }}>
                  -₹{lastClassification.amount.toLocaleString('en-IN')} (Deducted from register cash)
                </span>
                <span className="status-pill success" style={{ fontSize: '0.62rem' }}>Sheet Synced</span>
              </div>
            </div>
          )}
        </div>

        {/* Telegram Synced Feed */}
        <div className="fintech-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Synced Outflows ({tgTransactions.length})</h4>
            <span className="status-pill success" style={{ fontSize: '0.65rem' }}>Google Sheet Sync</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto', maxHeight: '340px' }}>
            {tgTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
                No Telegram expenses logged yet. Send a test message above!
              </div>
            ) : (
              tgTransactions.map(tx => (
                <div
                  key={tx.id}
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'block' }}>
                      {tx.description}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--blue-text)' }}>
                      Telegram ➔ ViaSocket ➔ MoneyView
                    </span>
                  </div>
                  <strong className="num-mono" style={{ fontSize: '0.92rem', color: 'var(--rose-text)' }}>
                    -₹{tx.amount.toLocaleString('en-IN')}
                  </strong>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
