// Export all core types for EXPENSO

export type TransactionType = 
  | 'udhaar'              // Customer Credit / Saman Udhaar
  | 'payment_received'    // Customer Paid Cash / UPI
  | 'cash_sale'           // Instant Cash Sale
  | 'supplier_payment'    // Paid to Wholesaler / Distributor
  | 'expense';            // Electricity, Rent, Labour, etc.

export type TransactionChannel = 'voice' | 'text' | 'image' | 'manual';

export type SyncStatus = 'synced' | 'pending_sync' | 'syncing' | 'failed';

export interface Transaction {
  id: string;
  customerId?: string;
  customerName: string;
  type: TransactionType;
  amount: number;
  description: string;
  dueDate?: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  channel: TransactionChannel;
  rawInput?: string;
  syncStatus: SyncStatus;
  category?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  avatarBg?: string;
  totalCredit: number;       // All-time udhaar taken
  totalPaid: number;         // All-time paid
  outstandingBalance: number; // Current unpaid udhaar
  nextPaymentDue?: string;    // YYYY-MM-DD
  status: 'up_to_date' | 'due_soon' | 'overdue';
  daysOverdue?: number;
  reliability: 'Excellent' | 'Good' | 'Needs Reminder' | 'Frequent Late';
  notes?: string;
  lastActive: string;
}

export interface Reminder {
  id: string;
  customerId: string;
  customerName: string;
  phone?: string;
  amount: number;
  dueDate: string;
  daysDiff: number; // negative if overdue, 0 if today, positive if upcoming
  status: 'overdue' | 'due_today' | 'upcoming' | 'paid';
  suggestedMessageHi: string;
  suggestedMessageEn: string;
  suggestedMessageHinglish: string;
  lastSentAt?: string;
}

export interface CashFlowData {
  moneyInToday: number;
  moneyOutToday: number;
  netCashToday: number;
  expectedNext7Days: number;
  overdueTotal: number;
  supplierPaymentsWeek: number;
  chartDays: Array<{
    day: string;
    date: string;
    inflow: number;
    outflow: number;
    expectedInflow: number;
  }>;
}

export type InsightCategory = 'cashflow' | 'attention' | 'collection' | 'business_pattern';

export interface Insight {
  id: string;
  category: InsightCategory;
  badge: string;
  badgeType: 'emerald' | 'amber' | 'rose' | 'charcoal';
  headline: string;
  what: string;
  why: string;
  actionText: string;
  actionTarget: 'reminders' | 'receivables' | 'ledger' | 'cashflow' | 'ai-input';
  actionFilter?: string;
  createdAt: string;
}

export interface StoreProfile {
  storeName: string;
  ownerName: string;
  phone: string;
  preferredLanguage: 'hinglish' | 'hindi' | 'english';
  viasocketWebhookUrl: string;
  isLiveWebhookEnabled: boolean;
  isOnboarded: boolean;
}

export interface ViaSocketRequestPayload {
  source: 'expenso';
  input_type: 'voice' | 'text' | 'image' | 'manual';
  raw_input: string;
  language: 'hi' | 'hinglish' | 'en';
  timestamp: string;
  store_id: string;
  user_id: string;
  metadata?: Record<string, unknown>;
}

export interface ViaSocketResponsePayload {
  success: boolean;
  transaction?: {
    customer_name?: string;
    amount: number;
    type: TransactionType;
    due_date?: string;
    description?: string;
  };
  customer?: {
    name: string;
    outstanding: number;
  };
  ledger_updated: boolean;
  receivable?: {
    amount: number;
    due_date: string;
  };
  reminder?: {
    scheduled_for: string;
    message: string;
  };
  cash_flow?: {
    projected_inflow_7d: number;
    net_change: number;
  };
  insight?: string;
  message?: string;
}

export interface ParsedTransactionCandidate {
  customerName: string;
  amount: number;
  type: TransactionType;
  dueDate?: string;
  description: string;
  category?: string;
  confidence: number;
  missingFields: Array<'dueDate' | 'customerName' | 'amount'>;
  cashFlowImpact: string;
}
