import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Table, 
  Download, 
  Plus, 
  Check, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  RotateCcw,
  Key,
  Cpu,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { 
  classifyTransactionWithAI, 
  getStoredApiKey, 
  setStoredApiKey, 
  getStoredModel, 
  setStoredModel 
} from '../services/aiClassifier';

export default function SmartAssistantAndSheet({
  transactions = [],
  customers = [],
  suppliers = [],
  storeProfile,
  metrics,
  onAddTransaction,
  onAddCredit,
  onRecordPayment,
  onRecordSupplierPayment
}) {
  const [activeView, setActiveView] = useState('assistant'); // 'assistant' or 'sheet' or 'split'
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchSheet, setSearchSheet] = useState("");
  const [sheetFilter, setSheetFilter] = useState("all"); // 'all', 'inflow', 'outflow', 'credit'
  const [showAddRowModal, setShowAddRowModal] = useState(false);

  // OpenRouter Real AI Integration State
  const [openRouterKey, setOpenRouterKey] = useState(getStoredApiKey());
  const [selectedModel, setSelectedModel] = useState(getStoredModel());
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(getStoredApiKey());
  const [testStatus, setTestStatus] = useState('idle'); // 'idle', 'testing', 'success', 'error'
  const [testMessage, setTestMessage] = useState('');

  // Sync temp key if stored changes
  useEffect(() => {
    setTempApiKey(openRouterKey);
  }, [openRouterKey]);

  // New row form state
  const [newRowDesc, setNewRowDesc] = useState("");
  const [newRowAmount, setNewRowAmount] = useState("");
  const [newRowType, setNewRowType] = useState("expense"); // expense, sale, payment_received, credit_sale
  const [newRowCategory, setNewRowCategory] = useState("Store Operations");

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initial Chat Messages
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'bot',
      time: 'Just now',
      text: "Namaste Gupta ji! 🙏 Main aapka MoneyView Smart Assistant (Munimji AI) hoon.",
      details: "Aap mujhse Hindi, Hinglish ya English me bol kar ya likh kar kuch bhi enter kar sakte hain — bina kisi third-party software ke!",
      suggestions: [
        "Sharma ji ko 1500 udhaar diya",
        "Paid 450 auto fare for mandi",
        "Verma ji ne 2000 wapas diye",
        "Kitna udhaar baaki hai?"
      ]
    }
  ]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Web Speech API for chat input
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  // Advanced In-House Natural Language Parser (Strict & Realistic)
  const parseUserInput = (text) => {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();
    
    // 1. GREETINGS & SMALL TALK (Never record an expense on greetings!)
    const greetingWords = ['hi', 'hello', 'hey', 'hlo', 'helo', 'namaste', 'namaskar', 'pranam', 'ram ram', 'kaise ho', 'kya haal hai', 'kya haal', 'good morning', 'good evening', 'help', 'madad', 'shuru', 'start', 'who are you', 'kaun ho', 'kya kar sakte ho', 'test'];
    const isGreeting = greetingWords.includes(lower) || 
                       /^(hi|hello|hey|hlo|helo|namaste|namaskar|pranam|help|kaise ho)\b/i.test(lower);
    
    if (isGreeting && !lower.match(/\d+/)) {
      return { intent: 'greeting' };
    }

    // 2. QUERY & FINANCIAL INSIGHT INTENTS (No ledger modification)
    if (
      lower.includes("kitna") || 
      lower.includes("baaki") || 
      lower.includes("shortfall") || 
      lower.includes("balance") || 
      lower.includes("summary") || 
      lower.includes("report") || 
      lower.includes("overdue") ||
      lower.includes("hisab") ||
      lower.includes("kiska paisa") ||
      lower.includes("kis kis se") ||
      lower.includes("paisa aayega") ||
      lower.includes("shortage") ||
      lower.includes("galla")
    ) {
      return { intent: 'query' };
    }

    // Extract numerical amount if present
    let amount = 0;
    const amtMatch = lower.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)?)/);
    if (amtMatch) {
      amount = parseInt(amtMatch[1].replace(/,/g, ''), 10);
    }

    // Match customer name from actual store customers list
    let matchedCustomer = null;
    for (const cust of customers) {
      const nameLower = cust.name.toLowerCase();
      const firstName = nameLower.split(' ')[0];
      if (lower.includes(nameLower) || (firstName.length > 2 && lower.includes(firstName))) {
        matchedCustomer = cust;
        break;
      }
    }

    // 3. UDHAAR / CREDIT GIVEN
    const hasUdhaarKeyword = lower.includes("udhaar") || lower.includes("credit") || lower.includes("khata") || lower.includes("udhar") || lower.includes("le gaya");
    if (hasUdhaarKeyword || (matchedCustomer && (lower.includes("diya") || lower.includes("likh lo")))) {
      if (!amount || amount <= 0) {
        return { intent: 'missing_amount', context: 'udhaar', customer: matchedCustomer };
      }
      return {
        intent: 'credit_given',
        amount: amount,
        customer: matchedCustomer || { name: "Customer Khata", id: `cust-${Date.now()}` },
        category: "Groceries on Udhaar"
      };
    }

    // 4. PAYMENT RECEIVED / REPAYMENT
    const hasRepaymentKeyword = lower.includes("diye") || lower.includes("wapas") || lower.includes("aaye") || lower.includes("jama") || lower.includes("payment") || lower.includes("collected") || lower.includes("settled") || lower.includes("received") || lower.includes("mil gaye");
    if (hasRepaymentKeyword) {
      if (!amount || amount <= 0) {
        return { intent: 'missing_amount', context: 'payment', customer: matchedCustomer };
      }
      return {
        intent: 'payment_received',
        amount: amount,
        customer: matchedCustomer || { name: "Store Customer" },
        category: "Customer Udhaar Collection"
      };
    }

    // 5. STORE OPERATIONAL EXPENSES (Requires explicit expense keywords AND amount)
    const expenseKeywords = [
      'auto', 'tempo', 'petrol', 'diesel', 'fare', 'bhada', 'delivery', 'transport', 'mandi',
      'packaging', 'bag', 'panni', 'poly', 'tape', 'box', 'dabba',
      'helper', 'labor', 'chai', 'nasta', 'lunch', 'salary', 'wage', 'dehari', 'staff',
      'light', 'bijli', 'electricity', 'meter', 'repair', 'safai', 'cleaning', 'maintenance', 'kharcha', 'expense'
    ];
    const isExpense = expenseKeywords.some(kw => lower.includes(kw));

    if (isExpense) {
      if (!amount || amount <= 0) {
        return { intent: 'missing_amount', context: 'expense' };
      }

      let expenseCategory = "Store Operations";
      if (lower.includes("auto") || lower.includes("tempo") || lower.includes("fare") || lower.includes("petrol") || lower.includes("transport") || lower.includes("mandi") || lower.includes("delivery") || lower.includes("bhada")) {
        expenseCategory = "Logistics / Mandi Transport";
      } else if (lower.includes("packaging") || lower.includes("bag") || lower.includes("panni") || lower.includes("tape") || lower.includes("poly") || lower.includes("box")) {
        expenseCategory = "Packaging & Store Bags";
      } else if (lower.includes("helper") || lower.includes("labor") || lower.includes("chai") || lower.includes("nasta") || lower.includes("lunch") || lower.includes("salary") || lower.includes("wage") || lower.includes("staff")) {
        expenseCategory = "Staff Wages & Refreshments";
      } else if (lower.includes("light") || lower.includes("bijli") || lower.includes("bill") || lower.includes("meter") || lower.includes("electricity")) {
        expenseCategory = "Store Utilities & Power";
      } else if (lower.includes("repair") || lower.includes("paint") || lower.includes("cleaning") || lower.includes("safai")) {
        expenseCategory = "Store Maintenance";
      }

      return {
        intent: 'expense',
        amount: amount,
        category: expenseCategory
      };
    }

    // 6. Direct amount + customer match (e.g. "Sharma ji 500")
    if (amount > 0 && matchedCustomer) {
      return {
        intent: 'credit_given',
        amount: amount,
        customer: matchedCustomer,
        category: "Groceries on Udhaar"
      };
    }

    // 7. UNKNOWN / CONVERSATIONAL - DO NOT FABRICATE A FAKE TRANSACTION!
    return { intent: 'unknown' };
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      // Call AI Classifier (uses OpenRouter if key is present, otherwise strict local NLP)
      const parsed = await classifyTransactionWithAI({
        text: query,
        customers,
        metrics,
        apiKey: openRouterKey,
        model: selectedModel
      });

      let replyText = parsed.replyText || "";
      let replyDetails = parsed.replyDetails || "";
      let actionBadge = null;

      if (parsed.intent === 'greeting') {
        replyText = parsed.replyText || "Namaste Gupta ji! 🙏 Main aapka MoneyView Munimji AI Assistant hoon.\n\nAap bol kar ya likh kar store ki transactions enter kar sakte hain ya accounts check kar sakte hain:\n• 'Sharma ji ko 1500 udhaar diya'\n• 'Verma ji se 2000 cash receive hua'\n• 'Paid 450 auto fare for mandi'\n• 'Kitna udhaar baaki hai?'";
        replyDetails = parsed.replyDetails || "Boliye, kya entry karni hai ya kaunsa hisab dekhna hai?";
        actionBadge = null; // Strictly zero ledger modifications on greetings!
      } else if (parsed.intent === 'missing_amount') {
        replyText = parsed.replyText || "⚠️ **Kripya Amount (₹) Batayein:**\nTransaction amount batayein taaki main ledger me sahi entry kar sakoon.\n\nUdaharan: '₹450 auto fare' ya 'Sharma ji ko 1500 udhaar'.";
        replyDetails = parsed.replyDetails || "Bina amount ke koi transaction record nahi hui hai.";
        actionBadge = null;
      } else if (parsed.intent === 'unknown') {
        replyText = parsed.replyText || "Mujhe ye samajh nahi aaya. Kripya transaction amount (₹) aur customer ya kharche ka naam saaf batayein.\n\nJaise:\n• 'Sharma ji ko 1500 udhaar'\n• 'Verma ji se 2000 aaye'\n• 'Paid 450 auto bhada'";
        replyDetails = parsed.replyDetails || "Koi entry record nahi hui hai.";
        actionBadge = null;
      } else if (parsed.intent === 'query') {
        const totalUdhaar = metrics?.totalReceivables || 40900;
        const overdueAmt = metrics?.overdueAmount || 13800;
        const overdueCount = metrics?.overdueCustomersCount || 3;
        const expected7Days = metrics?.dueWithin7Days || 27100;
        const supplierDues = metrics?.supplierDues7Days || 37700;
        const deficit = metrics?.cashShortfall || 4900;

        replyText = `📊 **Current Store Financial Summary:**\n• Total Market Udhaar: ₹${totalUdhaar.toLocaleString('en-IN')}\n• Overdue Dues: ₹${overdueAmt.toLocaleString('en-IN')} (${overdueCount} accounts)\n• Next 7-Day Inflow: ₹${expected7Days.toLocaleString('en-IN')}\n• Supplier Payout Due: ₹${supplierDues.toLocaleString('en-IN')}`;
        replyDetails = deficit > 0 ? `⚠️ Working Capital Alert: Agli hafte ₹${deficit.toLocaleString('en-IN')} ka shortfall expected hai. Overdue accounts se collection karne ki zaroorat hai.` : `✅ Liquidity Status: Cash flow positive hai!`;
        actionBadge = "Store Analytics";
      } else if (parsed.intent === 'credit_given') {
        const custName = parsed.customer?.name || "Customer";
        onAddCredit(parsed.customer, parsed.amount, `${query} (via Munimji AI)`);

        replyText = parsed.replyText || `✓ **Udhaar Record Ho Gaya:** ₹${parsed.amount.toLocaleString('en-IN')} ${custName} ke khate me add kar diya hai.`;
        replyDetails = parsed.replyDetails || `Customer Udhaar balance updated • New due date scheduled (7 days)`;
        actionBadge = parsed.source === 'openrouter_ai' ? "⚡ Real AI: Udhaar Given" : "+ Udhaar Given";
      } else if (parsed.intent === 'payment_received') {
        const custName = parsed.customer?.name || "Customer";
        onRecordPayment(parsed.customer, parsed.amount);

        replyText = parsed.replyText || `✓ **Payment Received:** ₹${parsed.amount.toLocaleString('en-IN')} cash/UPI ${custName} se receive hua.`;
        replyDetails = parsed.replyDetails || `Counter Cash Galla increased by +₹${parsed.amount.toLocaleString('en-IN')} • Customer balance cleared in ledger!`;
        actionBadge = parsed.source === 'openrouter_ai' ? "⚡ Real AI: Payment Collected" : "Payment Collected";
      } else if (parsed.intent === 'expense') {
        const newTx = {
          id: `tx-ai-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: "expense",
          customerName: "Store Operational Expense",
          amount: parsed.amount,
          description: query,
          channel: "Munimji AI Ledger",
          status: "synced",
          category: parsed.category || "Store Operations"
        };

        onAddTransaction(newTx);

        replyText = parsed.replyText || `✓ **Expense Record Ho Gaya:** -₹${parsed.amount.toLocaleString('en-IN')} (${parsed.category})`;
        replyDetails = parsed.replyDetails || `Counter cash me se deduct kiya gaya • Digital Vyapar Sheet me row append ho gayi!`;
        actionBadge = parsed.source === 'openrouter_ai' ? "⚡ Real AI: Store Expense" : "Store Expense";
      }

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        text: replyText,
        details: replyDetails,
        badge: actionBadge,
        aiEngine: parsed.source === 'openrouter_ai' ? (parsed.modelUsed?.split('/')[1] || 'OpenRouter LLM') : 'Local Engine'
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Assistant error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  // OpenRouter Key Management Handlers
  const handleSaveApiKey = () => {
    setStoredApiKey(tempApiKey);
    setOpenRouterKey(tempApiKey);
    setStoredModel(selectedModel);
    setShowKeyModal(false);
    setTestStatus('idle');
  };

  const handleClearApiKey = () => {
    setStoredApiKey('');
    setOpenRouterKey('');
    setTempApiKey('');
    setTestStatus('idle');
    setTestMessage('');
  };

  const handleTestApiKey = async () => {
    if (!tempApiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter an API key first.');
      return;
    }
    setTestStatus('testing');
    setTestMessage('Testing with OpenRouter model...');

    try {
      const res = await classifyTransactionWithAI({
        text: 'Sharma ji ko 1500 udhaar diya',
        customers,
        metrics,
        apiKey: tempApiKey,
        model: selectedModel
      });

      if (res.source === 'openrouter_ai') {
        setTestStatus('success');
        setTestMessage(`✓ Model responded successfully! (Customer: ${res.customer?.name || 'Sharma ji'}, Amount: ₹${res.amount})`);
      } else {
        setTestStatus('error');
        setTestMessage(`Fallback triggered (${res.source}). Check key validity or account balance.`);
      }
    } catch (err) {
      setTestStatus('error');
      setTestMessage(`Error: ${err.message}`);
    }
  };

  // Add Direct Row to Digital Sheet
  const handleAddDirectRow = (e) => {
    e.preventDefault();
    if (!newRowAmount || !newRowDesc) return;

    const amt = parseFloat(newRowAmount);
    const newTx = {
      id: `tx-sheet-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: newRowType,
      customerName: newRowDesc,
      amount: amt,
      description: newRowDesc,
      category: newRowCategory,
      channel: "Vyapar Digital Sheet",
      status: "synced"
    };

    onAddTransaction(newTx);
    setShowAddRowModal(false);
    setNewRowDesc("");
    setNewRowAmount("");
  };

  // Filtered Sheet Transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchSheet.toLowerCase()) ||
                          t.customerName?.toLowerCase().includes(searchSheet.toLowerCase()) ||
                          t.channel?.toLowerCase().includes(searchSheet.toLowerCase());
    if (!matchesSearch) return false;

    if (sheetFilter === 'inflow') return t.type === 'sale' || t.type === 'cash_sale' || t.type === 'upi_sale' || t.type === 'payment_received';
    if (sheetFilter === 'outflow') return t.type === 'expense' || t.type === 'supplier_payment';
    if (sheetFilter === 'credit') return t.type === 'credit_sale';
    return true;
  });

  // Financial Summaries for Digital Spreadsheet
  const totalInflow = transactions
    .filter(t => t.type === 'sale' || t.type === 'cash_sale' || t.type === 'upi_sale' || t.type === 'payment_received')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalOutflow = transactions
    .filter(t => t.type === 'expense' || t.type === 'supplier_payment')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalCreditGiven = transactions
    .filter(t => t.type === 'credit_sale')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Real CSV / Excel Exporter
  const handleExportCSV = () => {
    const headers = ["Transaction ID", "Date Time", "Description", "Category / Type", "Channel", "Amount (INR)", "Status"];
    const rows = filteredTransactions.map(t => [
      t.id,
      new Date(t.timestamp).toLocaleString('en-IN'),
      `"${(t.description || t.customerName).replace(/"/g, '""')}"`,
      t.type,
      t.channel || "Counter",
      t.amount,
      t.status || "settled"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `moneyview_vyapar_sheet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Controller Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        backgroundColor: 'var(--bg-card)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            backgroundColor: 'rgba(22, 163, 74, 0.15)',
            color: 'var(--emerald-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: '700' }}>
                Munimji AI & Vyapar Sheet
              </h3>
              <button
                type="button"
                onClick={() => setShowKeyModal(true)}
                style={{
                  background: openRouterKey ? 'rgba(22, 163, 74, 0.15)' : 'rgba(245, 158, 11, 0.12)',
                  border: openRouterKey ? '1px solid rgba(22, 163, 74, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)',
                  color: openRouterKey ? 'var(--emerald-text)' : '#f59e0b',
                  borderRadius: '12px',
                  padding: '3px 9px',
                  fontSize: '0.65rem',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
                title="Configure Real OpenRouter AI Engine"
              >
                <Cpu size={11} />
                {openRouterKey ? `AI Active (${selectedModel.split('/')[1] || 'OpenRouter'})` : '⚡ Connect OpenRouter Key'}
              </button>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Conversational Kirana Assistant + Real-time Interactive Digital Spreadsheet
            </span>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-app)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveView('assistant')}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: activeView === 'assistant' ? '700' : '500',
              backgroundColor: activeView === 'assistant' ? 'var(--bg-card)' : 'transparent',
              color: activeView === 'assistant' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: activeView === 'assistant' ? '1px solid var(--border-medium)' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Bot size={14} /> Munimji AI
          </button>
          <button
            onClick={() => setActiveView('sheet')}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: activeView === 'sheet' ? '700' : '500',
              backgroundColor: activeView === 'sheet' ? 'var(--bg-card)' : 'transparent',
              color: activeView === 'sheet' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: activeView === 'sheet' ? '1px solid var(--border-medium)' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Table size={14} /> Vyapar Sheet
          </button>
        </div>
      </div>

      {/* VIEW 1: MUNIMJI AI CONVERSATIONAL ASSISTANT */}
      {activeView === 'assistant' && (
        <div className="fintech-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '620px', overflow: 'hidden' }}>
          {/* Chat Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-card-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: openRouterKey ? 'var(--emerald-text)' : '#f59e0b' }}></div>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Munimji AI Assistant ({openRouterKey ? (selectedModel.split('/')[1] || 'LLM') : 'Local NLP'})
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowKeyModal(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: openRouterKey ? 'var(--emerald-text)' : 'var(--text-secondary)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="AI Settings"
              >
                <Key size={11} /> {openRouterKey ? 'Model Config' : 'Add Key'}
              </button>
              <button
                onClick={() => setMessages([{
                  id: 'msg-1',
                  sender: 'bot',
                  time: 'Just now',
                  text: "Namaste Gupta ji! 🙏 Main aapka MoneyView Smart Assistant (Munimji AI) hoon.",
                  details: "Aap mujhse Hindi, Hinglish ya English me bol kar ya likh kar kuch bhi enter kar sakte hain — bina kisi third-party software ke!",
                  suggestions: [
                    "Sharma ji ko 1500 udhaar diya",
                    "Paid 450 auto fare for mandi",
                    "Verma ji ne 2000 wapas diye",
                    "Kitna udhaar baaki hai?"
                  ]
                }])}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-tertiary)',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Clear conversation history"
              >
                <RotateCcw size={11} /> Clear
              </button>
            </div>
          </div>

          {/* Chat Messages Feed */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  backgroundColor: msg.sender === 'user' ? 'var(--emerald-main)' : 'var(--bg-card-subtle)',
                  color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                  {msg.details && (
                    <div style={{
                      marginTop: '6px',
                      paddingTop: '6px',
                      borderTop: msg.sender === 'user' ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border-subtle)',
                      fontSize: '0.74rem',
                      color: msg.sender === 'user' ? '#e2e8f0' : 'var(--text-secondary)'
                    }}>
                      {msg.details}
                    </div>
                  )}
                  {(msg.badge || msg.aiEngine) && (
                    <div style={{ marginTop: '6px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {msg.badge && (
                        <span className="status-pill success" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                          ✓ {msg.badge}
                        </span>
                      )}
                      {msg.aiEngine && (
                        <span style={{ 
                          fontSize: '0.62rem', 
                          padding: '1px 6px', 
                          borderRadius: '4px',
                          backgroundColor: msg.aiEngine.includes('Local') ? 'rgba(255,255,255,0.06)' : 'rgba(59, 130, 246, 0.18)',
                          color: msg.aiEngine.includes('Local') ? 'var(--text-tertiary)' : '#60a5fa',
                          border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                          ⚡ {msg.aiEngine}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '3px', padding: '0 4px' }}>
                  {msg.time}
                </span>

                {/* Quick suggestions on welcome message */}
                {msg.suggestions && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug)}
                        style={{
                          backgroundColor: 'var(--bg-app)',
                          border: '1px solid var(--border-medium)',
                          color: 'var(--text-secondary)',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          cursor: 'pointer'
                        }}
                      >
                        + "{sug}"
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '12px' }}>
                <span className="status-dot green"></span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Munimji AI analyzing and updating ledger...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Chips Bar */}
          <div style={{
            padding: '6px 12px',
            backgroundColor: 'var(--bg-app)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            {[
              "₹450 auto delivery",
              "Sharma ji ko 1500 udhaar",
              "Verma ji se 2000 aaye",
              "1200 packaging poly bags",
              "Kitna udhaar baaki hai?"
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem'
                }}
              >
                + {chip}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {/* Mic Speech Button */}
            <button
              type="button"
              onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: isListening ? 'var(--rose-main)' : 'rgba(22, 163, 74, 0.15)',
                border: isListening ? 'none' : '1px solid rgba(22, 163, 74, 0.3)',
                color: isListening ? '#ffffff' : 'var(--emerald-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                cursor: 'pointer'
              }}
              title={isListening ? "Stop Listening" : "Speak (Hindi / English)"}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              placeholder={isListening ? "Listening... bolte rahiye..." : "Bol kar ya likh kar transaction enter karein (e.g. Raju ko 500 udhaar, 450 auto bhada)..."}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="fintech-input"
              style={{ flex: 1, height: '38px', fontSize: '0.82rem' }}
            />

            <button
              type="submit"
              className="btn-primary"
              style={{ height: '38px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={14} /> <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* VIEW 2: VYAPAR SHEET (BUILT-IN INTERACTIVE DIGITAL SPREADSHEET) */}
      {activeView === 'sheet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Digital Sheet KPI Ribbon */}
          <div className="metrics-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <div className="fintech-card" style={{ padding: '12px' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase' }}>
                Total Sheet Entries
              </span>
              <div className="num-mono" style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                {transactions.length} Records
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                Real-time synchronized
              </span>
            </div>

            <div className="fintech-card" style={{ padding: '12px', borderLeft: '3px solid var(--emerald-main)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase' }}>
                Total Inflows
              </span>
              <div className="num-mono" style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--emerald-text)', marginTop: '2px' }}>
                +₹{totalInflow.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                Sales & Repayments
              </span>
            </div>

            <div className="fintech-card" style={{ padding: '12px', borderLeft: '3px solid var(--rose-main)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase' }}>
                Total Outflows
              </span>
              <div className="num-mono" style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--rose-text)', marginTop: '2px' }}>
                -₹{totalOutflow.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                Expenses & Suppliers
              </span>
            </div>

            <div className="fintech-card" style={{ padding: '12px', borderLeft: '3px solid var(--amber-main)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase' }}>
                Udhaar Extended
              </span>
              <div className="num-mono" style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--amber-text)', marginTop: '2px' }}>
                ₹{totalCreditGiven.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                Customer Receivables
              </span>
            </div>
          </div>

          {/* Spreadsheet Controls Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            backgroundColor: 'var(--bg-card)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', maxWidth: '100%' }}>
              {[
                { id: 'all', label: `All (${transactions.length})` },
                { id: 'inflow', label: 'Inflows (+)' },
                { id: 'outflow', label: 'Outflows (-)' },
                { id: 'credit', label: 'Udhaar Given' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSheetFilter(tab.id)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: sheetFilter === tab.id ? '600' : '500',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: sheetFilter === tab.id ? 'var(--bg-card-subtle)' : 'transparent',
                    color: sheetFilter === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: sheetFilter === tab.id ? '1px solid var(--border-medium)' : '1px solid transparent',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Actions: Search, Direct Add Row, CSV Download */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ position: 'relative', width: '180px' }}>
                <Search size={13} color="var(--text-tertiary)" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search sheet..."
                  value={searchSheet}
                  onChange={e => setSearchSheet(e.target.value)}
                  className="fintech-input"
                  style={{ paddingLeft: '26px', height: '30px', fontSize: '0.76rem' }}
                />
              </div>

              <button
                onClick={() => setShowAddRowModal(true)}
                className="btn-secondary"
                style={{ padding: '5px 10px', fontSize: '0.74rem', color: 'var(--emerald-text)' }}
                title="Add Direct Entry Row into Spreadsheet"
              >
                <Plus size={13} /> Direct Row
              </button>

              <button
                onClick={handleExportCSV}
                className="btn-primary"
                style={{ padding: '5px 12px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                title="Download as Excel / CSV Spreadsheet"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          {/* Interactive Digital Spreadsheet Grid (Desktop Table + Mobile Cards) */}
          <div className="desktop-only-table fintech-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="fintech-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Date & Time</th>
                    <th>Description & Customer</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-tertiary)' }}>
                        No records match current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx, idx) => {
                      const isInflow = tx.type === 'sale' || tx.type === 'cash_sale' || tx.type === 'upi_sale' || tx.type === 'payment_received';
                      const isUdhaar = tx.type === 'credit_sale';
                      const isOutflow = tx.type === 'expense' || tx.type === 'supplier_payment';

                      return (
                        <tr key={tx.id}>
                          <td style={{ color: 'var(--text-quaternary)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                            {idx + 1}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                              {new Date(tx.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.82rem' }}>
                              {tx.description || tx.customerName}
                            </strong>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                              Channel: {tx.channel || 'Register Counter'}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-xs)',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              color: 'var(--text-secondary)'
                            }}>
                              {tx.category || (isUdhaar ? 'Grocery Credit' : isInflow ? 'Retail Sales' : 'Operations')}
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill ${isInflow ? 'success' : isUdhaar ? 'warning' : 'danger'}`} style={{ fontSize: '0.65rem' }}>
                              <span className={`status-dot ${isInflow ? 'green' : isUdhaar ? 'amber' : 'red'}`}></span>
                              {isUdhaar ? 'Udhaar' : isInflow ? 'Inflow' : 'Outflow'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <strong className="num-mono" style={{
                              fontSize: '0.94rem',
                              color: isInflow ? 'var(--emerald-text)' : isUdhaar ? 'var(--amber-text)' : 'var(--rose-text)'
                            }}>
                              {isInflow ? `+₹${tx.amount.toLocaleString('en-IN')}` : isUdhaar ? `₹${tx.amount.toLocaleString('en-IN')}` : `-₹${tx.amount.toLocaleString('en-IN')}`}
                            </strong>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="status-pill success" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                              Recorded
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards for Spreadsheet */}
          <div className="mobile-only-cards">
            {filteredTransactions.map((tx, idx) => {
              const isInflow = tx.type === 'sale' || tx.type === 'cash_sale' || tx.type === 'upi_sale' || tx.type === 'payment_received';
              const isUdhaar = tx.type === 'credit_sale';

              return (
                <div
                  key={tx.id}
                  className="fintech-card"
                  style={{
                    padding: '12px',
                    borderLeft: isInflow ? '3px solid var(--emerald-main)' : isUdhaar ? '3px solid var(--amber-main)' : '3px solid var(--rose-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)', display: 'block' }}>
                        {tx.description || tx.customerName}
                      </strong>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                        {new Date(tx.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • {tx.channel || 'Counter'}
                      </span>
                    </div>

                    <div className="num-mono" style={{
                      fontSize: '1rem',
                      fontWeight: '800',
                      color: isInflow ? 'var(--emerald-text)' : isUdhaar ? 'var(--amber-text)' : 'var(--rose-text)'
                    }}>
                      {isInflow ? `+₹${tx.amount.toLocaleString('en-IN')}` : isUdhaar ? `₹${tx.amount.toLocaleString('en-IN')}` : `-₹${tx.amount.toLocaleString('en-IN')}`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      📂 {tx.category || (isUdhaar ? 'Udhaar' : isInflow ? 'Sales' : 'Operations')}
                    </span>
                    <span className={`status-pill ${isInflow ? 'success' : isUdhaar ? 'warning' : 'danger'}`} style={{ fontSize: '0.62rem' }}>
                      {isUdhaar ? 'Udhaar' : isInflow ? 'Inflow' : 'Expense'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Direct Row Modal */}
      {showAddRowModal && (
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
          <div className="modal-sheet-content fintech-card" style={{ width: '100%', maxWidth: '420px', padding: '20px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Add Direct Spreadsheet Row</h4>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '14px' }}>
              Manually insert an entry into your digital Vyapar Sheet
            </span>

            <form onSubmit={handleAddDirectRow} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Transaction Type *</label>
                <select
                  value={newRowType}
                  onChange={e => setNewRowType(e.target.value)}
                  className="fintech-input"
                  style={{ width: '100%', height: '36px' }}
                >
                  <option value="expense">Store Expense (- Outflow)</option>
                  <option value="sale">Cash / Counter Sale (+ Inflow)</option>
                  <option value="payment_received">Udhaar Repayment Collected (+ Inflow)</option>
                  <option value="credit_sale">Customer Udhaar Given (Pending Balance)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Description / Note *</label>
                <input
                  type="text"
                  placeholder="e.g. 50kg Atta purchased, Auto fare to Mandi..."
                  value={newRowDesc}
                  onChange={e => setNewRowDesc(e.target.value)}
                  required
                  className="fintech-input"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Amount (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 850"
                  value={newRowAmount}
                  onChange={e => setNewRowAmount(e.target.value)}
                  required
                  className="fintech-input num-mono"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Category</label>
                <input
                  type="text"
                  placeholder="e.g. Transport, Packaging, Inventory"
                  value={newRowCategory}
                  onChange={e => setNewRowCategory(e.target.value)}
                  className="fintech-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px' }}>
                  Append to Sheet
                </button>
                <button type="button" onClick={() => setShowAddRowModal(false)} className="btn-secondary" style={{ padding: '10px 14px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OpenRouter AI Model Configuration Modal */}
      {showKeyModal && (
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
          <div className="modal-sheet-content fintech-card" style={{ width: '100%', maxWidth: '460px', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Cpu size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', margin: 0, fontWeight: '700' }}>OpenRouter AI Intelligence</h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                  Connect LLM for natural Hindi/Hinglish Kirana understanding
                </span>
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              margin: '12px 0'
            }}>
              💡 <strong>Accurate Natural Classification:</strong> Powers Munimji AI with real LLMs to easily understand greetings (without logging fake expenses), customer udhaar, cash repayments, and store transport costs.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>OpenRouter API Key (sk-or-v1-...)</span>
                  {openRouterKey && <span style={{ color: 'var(--emerald-text)', fontWeight: '600' }}>✓ Key Active</span>}
                </label>
                <input
                  type="password"
                  placeholder="sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxx"
                  value={tempApiKey}
                  onChange={e => setTempApiKey(e.target.value)}
                  className="fintech-input num-mono"
                  style={{ width: '100%', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Select AI Model
                </label>
                <select
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className="fintech-input"
                  style={{ width: '100%', height: '38px', fontSize: '0.8rem' }}
                >
                  <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B Instruct (Recommended - Highest Accuracy)</option>
                  <option value="google/gemini-2.0-flash-001">Google Gemini 2.0 Flash (Fastest)</option>
                  <option value="meta-llama/llama-3.1-8b-instruct:free">Llama 3.1 8B Instruct (Free Tier)</option>
                  <option value="openai/gpt-4o-mini">OpenAI GPT-4o-mini (Balanced)</option>
                </select>
              </div>

              {testMessage && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  backgroundColor: testStatus === 'success' ? 'rgba(22, 163, 74, 0.15)' : testStatus === 'testing' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: testStatus === 'success' ? 'var(--emerald-text)' : testStatus === 'testing' ? '#60a5fa' : 'var(--crimson-text)',
                  border: `1px solid ${testStatus === 'success' ? 'rgba(22, 163, 74, 0.3)' : testStatus === 'testing' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}>
                  {testMessage}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleTestApiKey}
                  disabled={testStatus === 'testing'}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '9px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Zap size={14} /> {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="btn-primary"
                  style={{ flex: 1.2, padding: '9px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <CheckCircle2 size={14} /> Save & Activate
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--crimson-text)',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  Clear Key (Use Local NLP)
                </button>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
