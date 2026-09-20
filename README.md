# MoneyView — Smart Supermarket Financial Ledger & Retail OS

> **🏆 HACK IT BROS '26 — Track 2 — FinTech & Local Commerce**  
> **Challenge:** "VyaparPulse / MoneyView — Smart Supermarket Ledger"  
> **Target User:** Local Supermarket, Kirana & Neighborhood Grocery Store Owners  
> **Architecture:** 100% In-House, Zero Third-Party Webhook / Middleware Dependencies

---

## 📌 Executive Summary & Problem Solved

Small supermarkets and neighborhood grocery stores (*kiranas*) in India process hundreds of micro-transactions daily across counter cash, UPI, customer credit (*udhaar*), and FMCG distributor payouts. Store owners rely on handwritten notebooks, fragmented billing machines, or memory — leading to:
1. **Capital trapped in uncollected credit**: No automated aging or repayment tracking.
2. **Distributor default risks**: Surprise supplier invoices (Amul, ITC, Mandi) with zero forward visibility.
3. **Cash-flow blind spots**: Inability to answer: *"How much liquid cash will I have next week, and where will I face a deficit?"*

**MoneyView** transforms everyday supermarket transactions into a structured, real-time financial ledger with predictive working capital forecasting and an in-house conversational AI assistant.

---

## 🌟 Core System Architecture & Features

### 1. ⚡ Fast Omnichannel Invoice & Billing Engine
- **1-Tap Quick POS**: Fast cart checkout with top grocery inventory items (Atta, Oil, Dairy, Tea).
- **🎙️ Voice Billing Assistant**: Native Web Speech API with real-time Web Audio API waveform visualization. Accurately extracts Hindi/Hinglish speech (*"Sharma ji ko 2400 ka ration 7 din ke udhaar par diya"*).
- **📷 Live Camera & Receipt Scanner**: Camera snapshot capture (`getUserMedia`) and file uploader with smart OCR parser to digitize paper distributor bills.

### 2. 👥 Customer Khata & Udhaar Tracking
- Comprehensive customer ledger with **Behavioral Trust Scores (0–100%)**, transaction counts, and running balances.
- Categorized aging: `Overdue`, `Due in 7 Days`, and `Settled`.
- Dual layout: Structured enterprise table on desktop, touch-friendly cards on mobile.

### 3. 💬 1-Click Automated WhatsApp Payment Reminders
- One-click trigger that formats pre-filled Hinglish reminders:
  > *"Namaste Sharma ji, Gupta Kirana Store se aapka ₹2,400 ka grocery bill baaki hai. Due date: 24 Sep. Kripya is UPI link par pay karein: upi://pay?pa=guptakirana@okhdfcbank..."*
- Includes store UPI VPA link for instantaneous merchant settlement.

### 4. 📈 Working Capital Decision Engine & Shortfall Forecasting
- Answers the core judging criteria:
  > *"How much money am I likely to receive next week, and where could I face a cash shortage?"*
- Computes **7-Day Liquid Inflow** (₹27,100) vs **Committed Supplier Liabilities** (₹37,700).
- Automatically triggers a **Working Capital Shortfall Forecast** banner with an actionable 1-click prompt to collect overdue receivables from specific accounts.

### 5. 🤖 Munimji AI (Native Conversational Financial Assistant)
- **100% In-House NLP Engine**: No external webhooks or third-party middleware needed!
- Understands natural language Hindi, Hinglish, and English.
- **Strict Intent Classification**:
  - `Greetings & Small Talk` ("hi", "namaste", "help"): Responds warmly with zero false ledger impact.
  - `Udhaar Given`: Updates customer khata, schedules repayment date.
  - `Payments Collected`: Deducts customer balance, adds liquid cash to galla.
  - `Store Expenses`: Auto-categorizes into Logistics, Utilities, Staff Wages, Packaging.
  - `Financial Queries`: Answers live inquiries (*"Kitna udhaar baaki hai?"*, *"Shortfall alert"*).

### 6. 📊 Vyapar Sheet (Built-in Interactive Digital Spreadsheet)
- Live, in-browser digital spreadsheet functioning like Google Sheets / Excel.
- Real-time KPI summaries: Total Records, Total Inflows (+₹), Total Outflows (-₹), Udhaar Extended.
- Category filters, real-time search, and manual **Direct Row Entry**.
- **📥 1-Click CSV Export**: Instant download of `moneyview_vyapar_sheet.csv`.

### 7. 📱 Mobile-First Responsive Design
- Built following Linear, Stripe, and Mercury dark design standards (Zinc `#0e0f12`, `#181a1f`).
- Dedicated mobile header with quick voice, camera, and customer shortcuts.
- Fixed 5-tab native bottom navigation with real-time overdue badge.
- Touch-friendly bottom sheets for all modals.

### 8. 🔍 5-Step Continuous Live Verification Pipeline
Built-in audit trail validating the full 5-stage loop:
```
[1] Voice Ingestion ➔ [2] NLP Parser ➔ [3] Khata Ledger ➔ [4] Receivables Recalc ➔ [5] Cash Flow Action
```

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite 8
- **Icons**: Lucide React
- **Visuals & Charts**: Recharts (7-Day Area Charts), HTML5 Canvas Audio Waveforms
- **Celebration Feedback**: Canvas Confetti
- **Audio Feedback**: Web Audio API synthesized chimes
- **Persistence**: Browser LocalStorage with automatic schema recovery & reset capability

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd moneyview

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser at `http://localhost:5173/`.

### Production Build

```bash
npm run build
```

---

## 📜 Problem Statement Compliance Checklist

| Track 2 MVP Requirement | Implementation Details | Status |
|---|---|---|
| **1. Fast Transaction Creation** | Quick POS Cart, Voice Mic Parser, Camera OCR Scanner | ✅ Complete |
| **2. Customer Ledger** | Full Khata with trust score, transaction statements, credit limits | ✅ Complete |
| **3. Udhaar / Receivables Tracking** | Real-time status tags, aging buckets, settled accounts | ✅ Complete |
| **4. Due-Date Tracking** | Calendar aging breakdown, overdue alerts, status pills | ✅ Complete |
| **5. Payment Reminder Generation** | 1-Click WhatsApp reminder with pre-filled message & UPI link | ✅ Complete |
| **6. Basic Cash-Flow View** | Liquid counter cash, 7-day liquidity curve, recent register flows | ✅ Complete |
| **7. Actionable Financial Insight** | Working capital shortfall forecast alert + 1-click collection prompts | ✅ Complete |
| **8. Self-Contained Retail Engine** | Munimji AI Assistant + Live Vyapar Spreadsheet (Zero third-party setup) | ✅ Complete |

---

*Built with ❤️ for neighborhood Indian Kirana & Supermarket merchants for HACK IT BROS '26.*
