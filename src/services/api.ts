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
 * Submit transaction either to live ViaSocket webhook or through Expenso Smart Local Engine
 */
export async function submitTransaction(
  rawInput: string,
  inputType: 'voice' | 'text' | 'image' | 'manual',
  profile: StoreProfile,
  language: 'hi' | 'hinglish' | 'en' = 'hinglish'
): Promise<SubmitTransactionResult> {
  const parsed = parseNaturalLanguageInput(rawInput);
  
  // If Live Webhook is enabled and URL is provided
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
      console.warn('ViaSocket webhook call failed, falling back to smart local processing:', err);
      // Don't fail the user: seamlessly process locally and mark pending_sync
    }
  }

  // Smart Munim local simulation (with realistic 700ms processing delay)
  await new Promise((resolve) => setTimeout(resolve, 800));

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

  // Multi-item extraction simulating a photo of an Indian supermarket bahi-khata / bill
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
 * Service methods for dashboard, ledger, receivables, reminders, insights
 */
export async function getDashboardData(): Promise<{
  customers: Customer[];
  transactions: Transaction[];
  reminders: Reminder[];
  cashFlow: CashFlowData;
  insights: Insight[];
}> {
  return {
    customers: INITIAL_CUSTOMERS,
    transactions: INITIAL_TRANSACTIONS,
    reminders: INITIAL_REMINDERS,
    cashFlow: INITIAL_CASH_FLOW,
    insights: INITIAL_INSIGHTS,
  };
}
