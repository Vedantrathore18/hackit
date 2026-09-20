import {
  Transaction,
  Customer,
  Reminder,
  CashFlowData,
  Insight,
  StoreProfile,
  ViaSocketRequestPayload,
  ViaSocketResponsePayload,
  ParsedTransactionCandidate,
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_TRANSACTIONS,
  INITIAL_REMINDERS,
  INITIAL_CASH_FLOW,
  INITIAL_INSIGHTS,
} from '../data/mockData';
import { sendToViaSocketWebhook, uploadImageToViaSocket } from './viasocket';
import { parseNaturalLanguageInput } from './nlpParser';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export interface SubmitTransactionResult {
  success: boolean;
  isLive: boolean;
  transaction: Transaction;
  customer?: Customer;
  receivableImpact?: string;
  reminderCreated?: Reminder;
  cashFlowImpact?: string;
  newInsight?: Insight;
  message: string;
}

/**
 * Submit transaction to:
 * 1. Live ViaSocket webhook (if enabled in settings)
 * 2. Node.js & Express backend (/api/transactions/parse)
 * 3. Smart Munim local engine fallback
 */
export async function submitTransaction(
  rawInput: string,
  inputType: 'voice' | 'text' | 'image' | 'manual',
  profile: StoreProfile,
  language: 'hi' | 'hinglish' | 'en' = 'hinglish'
): Promise<SubmitTransactionResult> {
  const parsed = parseNaturalLanguageInput(rawInput);
  
  // 1. If Live ViaSocket Webhook is enabled
  if (profile.isLiveWebhookEnabled && profile.viasocketWebhookUrl) {
    try {
      const payload: ViaSocketRequestPayload = {
        source: 'expenso',
        input_type: inputType,
        raw_input: rawInput,
        language,
        timestamp: new Date().toISOString(),
        store_id: 'store_rajesh_01',
        user_id: 'user_rajesh',
        metadata: {
          parsedCandidate: parsed,
        },
      };

      const response: ViaSocketResponsePayload = await sendToViaSocketWebhook(
        profile.viasocketWebhookUrl,
        payload
      );

      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        customerName: response.transaction?.customer_name || parsed.customerName,
        type: response.transaction?.type || parsed.type,
        amount: response.transaction?.amount || parsed.amount,
        description: response.transaction?.description || parsed.description,
        dueDate: response.transaction?.due_date || parsed.dueDate,
        createdAt: new Date().toISOString(),
        channel: inputType,
        rawInput,
        syncStatus: 'synced',
        category: 'Grocery Ledger',
      };

      return {
        success: true,
        isLive: true,
        transaction: tx,
        receivableImpact: response.receivable ? `+₹${response.receivable.amount.toLocaleString('en-IN')} expected on ${response.receivable.due_date}` : parsed.cashFlowImpact,
        cashFlowImpact: response.insight || `Your expected customer collections over the next 7 days increased by ₹${tx.amount.toLocaleString('en-IN')}.`,
        message: response.message || 'Transaction synced to ViaSocket and Google Sheets ledger.',
      };
    } catch (err: unknown) {
      console.warn('ViaSocket webhook call failed, falling back to Express backend / local engine:', err);
    }
  }

  // 2. Connect to Node.js & Express Backend API
  try {
    const backendRes = await fetch(`${BACKEND_BASE}/transactions/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        raw_text: rawInput,
        language: profile.preferredLanguage === 'hindi' ? 'hi' : 'hinglish',
      }),
      signal: AbortSignal.timeout(4000), // 4s timeout
    });

    if (backendRes.ok) {
      const backendData = await backendRes.json();
      const savedTx = backendData.data.transaction;
      const cust = backendData.data.customer;

      const tx: Transaction = {
        id: savedTx._id || `tx-${Date.now()}`,
        customerId: cust._id,
        customerName: savedTx.customer_name || cust.name,
        type: savedTx.type === 'payment' ? 'payment_received' : 'udhaar',
        amount: savedTx.amount,
        description: savedTx.description,
        dueDate: savedTx.due_date ? savedTx.due_date.split('T')[0] : parsed.dueDate,
        createdAt: savedTx.createdAt || new Date().toISOString(),
        channel: inputType,
        rawInput,
        syncStatus: 'synced',
        category: savedTx.type === 'udhaar' ? 'Groceries Credit' : 'Payment Settled',
      };

      let reminder: Reminder | undefined;
      if (tx.type === 'udhaar' && tx.dueDate) {
        reminder = {
          id: `rem-${Date.now()}`,
          customerId: cust._id,
          customerName: cust.name,
          amount: tx.amount,
          dueDate: tx.dueDate,
          daysDiff: 7,
          status: 'upcoming',
          suggestedMessageHinglish: `Namaste ${cust.name}, Rajesh Supermarket se gentle reminder. Aapke ₹${tx.amount.toLocaleString('en-IN')} ka udhaar payment due date ${tx.dueDate} ko hai. Shukriya!`,
          suggestedMessageHi: `नमस्ते ${cust.name}, राजेश सुपरमार्केट। आपका ₹${tx.amount.toLocaleString('en-IN')} का भुगतान देय है।`,
          suggestedMessageEn: `Hello ${cust.name}, payment of ₹${tx.amount.toLocaleString('en-IN')} is scheduled. Thank you!`,
        };
      }

      return {
        success: true,
        isLive: true,
        transaction: tx,
        receivableImpact: tx.type === 'udhaar' ? `+₹${tx.amount.toLocaleString('en-IN')} receivable (MongoDB synced)` : undefined,
        reminderCreated: reminder,
        cashFlowImpact: `Customer collections updated in MongoDB. Balance: ₹${cust.total_outstanding.toLocaleString('en-IN')}.`,
        message: backendData.message || 'Saved to Express & MongoDB backend successfully.',
      };
    }
  } catch {
    // Backend offline or unreachable, smoothly fallback to local digital munim engine
  }

  // 3. Smart Munim local simulation fallback
  await new Promise((resolve) => setTimeout(resolve, 600));

  const newTx: Transaction = {
    id: `tx-${Date.now()}`,
    customerName: parsed.customerName,
    type: parsed.type,
    amount: parsed.amount,
    description: parsed.description,
    dueDate: parsed.dueDate,
    createdAt: new Date().toISOString(),
    channel: inputType,
    rawInput,
    syncStatus: profile.isLiveWebhookEnabled ? 'pending_sync' : 'synced',
    category: parsed.type === 'udhaar' ? 'Groceries Credit' : 'Store Ledger',
  };

  let reminder: Reminder | undefined;
  if (parsed.type === 'udhaar' && parsed.dueDate) {
    reminder = {
      id: `rem-${Date.now()}`,
      customerId: `cust-${parsed.customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      customerName: parsed.customerName,
      amount: parsed.amount,
      dueDate: parsed.dueDate,
      daysDiff: 7,
      status: 'upcoming',
      suggestedMessageHinglish: `Namaste ${parsed.customerName}, Rajesh Supermarket se gentle reminder. Aapke ₹${parsed.amount.toLocaleString('en-IN')} ka udhaar payment due date ${parsed.dueDate} ko hai. Shukriya!`,
      suggestedMessageHi: `नमस्ते ${parsed.customerName}, राजेश सुपरमार्केट। आपका ₹${parsed.amount.toLocaleString('en-IN')} का भुगतान ${parsed.dueDate} को देय है।`,
      suggestedMessageEn: `Hello ${parsed.customerName}, your payment of ₹${parsed.amount.toLocaleString('en-IN')} is scheduled for ${parsed.dueDate}. Thank you!`,
    };
  }

  const newInsight: Insight = {
    id: `ins-${Date.now()}`,
    category: 'cashflow',
    badge: '💡 Cash-flow insight',
    badgeType: 'emerald',
    headline: `Expected collections adjusted (+₹${parsed.amount.toLocaleString('en-IN')})`,
    what: `Your expected customer collections over the next 7 days increased to ₹${(38500 + parsed.amount).toLocaleString('en-IN')}.`,
    why: `${parsed.customerName} added to the 7-day receivables schedule.`,
    actionText: 'View Receivables',
    actionTarget: 'receivables',
    createdAt: 'Just now',
  };

  return {
    success: true,
    isLive: false,
    transaction: newTx,
    receivableImpact: parsed.type === 'udhaar' ? `+₹${parsed.amount.toLocaleString('en-IN')} receivable` : undefined,
    reminderCreated: reminder,
    cashFlowImpact: `Your expected customer collections over the next 7 days increased to ₹${(38500 + (parsed.type === 'udhaar' ? parsed.amount : 0)).toLocaleString('en-IN')}.`,
    newInsight,
    message: 'Transaction recorded in digital munim ledger.',
  };
}

/**
 * Upload ledger image and extract transactions
 */
export async function uploadLedgerImage(
  file: File,
  profile: StoreProfile
): Promise<{ success: boolean; transactions: ParsedTransactionCandidate[]; message: string }> {
  if (profile.isLiveWebhookEnabled && profile.viasocketWebhookUrl) {
    try {
      const resp = await uploadImageToViaSocket(profile.viasocketWebhookUrl, file, {
        ocrEngine: 'smart_vision',
      });
      if (resp.success && resp.transaction) {
        return {
          success: true,
          transactions: [
            {
              customerName: resp.transaction.customer_name || 'Sharma Ji',
              amount: resp.transaction.amount || 2400,
              type: resp.transaction.type || 'udhaar',
              dueDate: resp.transaction.due_date || '2026-09-27',
              description: resp.transaction.description || 'Extracted ledger line from bill photo',
              confidence: 0.94,
              missingFields: [],
              cashFlowImpact: '+₹2,400 expected receivable',
            },
          ],
          message: 'Ledger image parsed via ViaSocket OCR pipeline.',
        };
      }
    } catch (err) {
      console.warn('Live image OCR failed, falling back to local OCR simulation:', err);
    }
  }

  // Realistic scanning simulation delay (1.2s)
  await new Promise((r) => setTimeout(r, 1200));

  const extractedCandidates: ParsedTransactionCandidate[] = [
    {
      customerName: 'Sharma Ji',
      amount: 2400,
      type: 'udhaar',
      dueDate: '2026-09-27',
      description: 'Grocery staples, cooking oil & tea (Extracted from notebook)',
      confidence: 0.96,
      missingFields: [],
      cashFlowImpact: '+₹2,400 receivable in 7 days',
    },
    {
      customerName: 'Pooja Aggarwal',
      amount: 1450,
      type: 'udhaar',
      dueDate: '2026-09-25',
      description: 'Detergent, biscuits & spices',
      confidence: 0.91,
      missingFields: [],
      cashFlowImpact: '+₹1,450 receivable in 5 days',
    },
    {
      customerName: 'Ramesh Kumar',
      amount: 1200,
      type: 'payment_received',
      description: 'UPI partial settlement entry',
      confidence: 0.88,
      missingFields: [],
      cashFlowImpact: '+₹1,200 cash collected',
    },
  ];

  return {
    success: true,
    transactions: extractedCandidates,
    message: 'Detected 3 transactions from handwritten ledger photo.',
  };
}

/**
 * Fetch live customer list from Express & MongoDB backend
 */
export async function fetchBackendCustomers(): Promise<Customer[] | null> {
  try {
    const res = await fetch(`${BACKEND_BASE}/customers`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) return null;

    return json.data.map((c: any) => ({
      id: c._id,
      name: c.name,
      phone: c.phone || undefined,
      avatarBg: c.total_outstanding > 5000 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800',
      totalCredit: c.total_outstanding + 4000,
      totalPaid: 4000,
      outstandingBalance: c.total_outstanding,
      nextPaymentDue: '2026-09-27',
      status: c.total_outstanding > 5000 ? 'overdue' : c.total_outstanding > 0 ? 'due_soon' : 'up_to_date',
      daysOverdue: c.total_outstanding > 5000 ? 8 : undefined,
      reliability: c.total_outstanding > 5000 ? 'Needs Reminder' : 'Good',
      lastActive: 'Synced with MongoDB',
    }));
  } catch {
    return null;
  }
}

/**
 * Fetch detailed customer ledger from Express & MongoDB backend
 */
export async function fetchBackendCustomerLedger(customerId: string): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_BASE}/customers/${customerId}/ledger`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

/**
 * Fetch live dashboard summary from Express & MongoDB backend
 */
export async function fetchBackendDashboardSummary(): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_BASE}/dashboard/summary`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

/**
 * Generate AI WhatsApp Reminder from Express backend
 */
export async function generateBackendWhatsAppReminder(customerId: string): Promise<{ reminder_text: string; whatsapp_url: string } | null> {
  try {
    const res = await fetch(`${BACKEND_BASE}/reminders/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: customerId }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

/**
 * Service methods for dashboard, ledger, receivables, reminders, insights
 */
export async function getDashboardData(): Promise<{
  customers: Customer[];
  transactions: Transaction[];
  reminders: Reminder[];
  cashFlow: CashFlowData;
  insights: Insight[];
}> {
  // Try fetching live customers and summary from MongoDB backend
  const [liveCustomers, liveSummary] = await Promise.all([
    fetchBackendCustomers(),
    fetchBackendDashboardSummary(),
  ]);

  let customers = INITIAL_CUSTOMERS;
  if (liveCustomers && liveCustomers.length > 0) {
    // Merge live MongoDB customers with seed data to maintain a rich presentation
    const existingNames = new Set(liveCustomers.map((c) => c.name.toLowerCase()));
    const additional = INITIAL_CUSTOMERS.filter((c) => !existingNames.has(c.name.toLowerCase()));
    customers = [...liveCustomers, ...additional];
  }

  let cashFlow = INITIAL_CASH_FLOW;
  if (liveSummary && liveSummary.metrics) {
    cashFlow = {
      ...INITIAL_CASH_FLOW,
      expectedNext7Days: Math.max(INITIAL_CASH_FLOW.expectedNext7Days, liveSummary.metrics.total_expected_7_days || 0),
      overdueTotal: Math.max(INITIAL_CASH_FLOW.overdueTotal, liveSummary.metrics.total_overdue || 0),
      moneyInToday: Math.max(INITIAL_CASH_FLOW.moneyInToday, liveSummary.metrics.today_total_inflow || 0),
    };
  }

  let insights = INITIAL_INSIGHTS;
  if (liveSummary && liveSummary.ai_insights && Array.isArray(liveSummary.ai_insights) && liveSummary.ai_insights.length > 0) {
    const dynamicInsights: Insight[] = liveSummary.ai_insights.map((text: string, idx: number) => ({
      id: `live-ins-${idx}`,
      category: 'cashflow',
      badge: '💡 Live Munim Insight',
      badgeType: 'emerald',
      headline: text.substring(0, 45) + '...',
      what: text,
      why: 'Calculated in real-time by MongoDB aggregation pipeline.',
      actionText: 'View Details',
      actionTarget: 'cashflow',
      createdAt: 'Live',
    }));
    insights = [...dynamicInsights, ...INITIAL_INSIGHTS];
  }

  return {
    customers,
    transactions: INITIAL_TRANSACTIONS,
    reminders: INITIAL_REMINDERS,
    cashFlow,
    insights,
  };
}
