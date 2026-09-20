import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const getSeedData = () => {
  const now = Date.now();
  return {
    store: {
      name: "MoneyView Supermarket & Daily Needs",
      owner: "Ramesh Gupta",
      phone: "+91 98765 00000",
      upiId: "moneyview@icici",
      location: "Shop #12, Central Market, Sector 14",
      gstin: "07AAAAA0000A1Z5",
      cashInHand: 14250
    },
    customers: [
      {
        id: "cust-1",
        name: "Sharma ji",
        phone: "9876543210",
        balance: 2400,
        dueDays: 7,
        dueDate: new Date(now + 7 * 86400000).toISOString().split('T')[0],
        category: "Groceries",
        trustScore: 92,
        behavior: "Prompt Payer",
        status: "pending",
        notes: "Clears on weekends regularly",
        transactionsCount: 14
      },
      {
        id: "cust-2",
        name: "Verma ji",
        phone: "9811122334",
        balance: 8000,
        dueDays: -4,
        dueDate: new Date(now - 4 * 86400000).toISOString().split('T')[0],
        category: "Bulk Staples & Grains",
        trustScore: 68,
        behavior: "Usually 5 days late",
        status: "overdue",
        notes: "Needs WhatsApp reminder call",
        transactionsCount: 8
      },
      {
        id: "cust-3",
        name: "Ramesh Kumar",
        phone: "9899955443",
        balance: 3500,
        dueDays: 1,
        dueDate: new Date(now + 1 * 86400000).toISOString().split('T')[0],
        category: "Daily Essentials",
        trustScore: 84,
        behavior: "Regular Customer",
        status: "pending",
        notes: "Salary credit on 1st of month",
        transactionsCount: 11
      },
      {
        id: "cust-4",
        name: "Pooja Verma",
        phone: "9712345678",
        balance: 1800,
        dueDays: 3,
        dueDate: new Date(now + 3 * 86400000).toISOString().split('T')[0],
        category: "Dairy & Packaged Foods",
        trustScore: 96,
        behavior: "Pays via UPI promptly",
        status: "pending",
        notes: "Online UPI preferred",
        transactionsCount: 22
      },
      {
        id: "cust-5",
        name: "Chaudhary Saab",
        phone: "9988776655",
        balance: 10200,
        dueDays: 5,
        dueDate: new Date(now + 5 * 86400000).toISOString().split('T')[0],
        category: "Edible Oils & Bulk Sugar",
        trustScore: 89,
        behavior: "Clears on 5th of month",
        status: "pending",
        notes: "Local landlord & bulk buyer",
        transactionsCount: 19
      },
      {
        id: "cust-6",
        name: "Sunil Sethi",
        phone: "9822334455",
        balance: 4100,
        dueDays: -7,
        dueDate: new Date(now - 7 * 86400000).toISOString().split('T')[0],
        category: "Dry Fruits & Ghee",
        trustScore: 62,
        behavior: "Needs 2nd reminder",
        status: "overdue",
        notes: "Late payment pattern detected",
        transactionsCount: 5
      },
      {
        id: "cust-7",
        name: "Anita Devi",
        phone: "9877112233",
        balance: 8500,
        dueDays: 2,
        dueDate: new Date(now + 2 * 86400000).toISOString().split('T')[0],
        category: "Spices, Pulses & Atta",
        trustScore: 91,
        behavior: "Clears in 2-3 days",
        status: "pending",
        notes: "Near street #4",
        transactionsCount: 16
      }
    ],
    suppliers: [
      {
        id: "sup-1",
        name: "Amul Dairy Distributor",
        contact: "+91 98100 11223",
        amountDue: 14500,
        dueDate: new Date(now + 4 * 86400000).toISOString().split('T')[0],
        items: "Milk crates, Curd, Butter, Paneer",
        urgency: "high",
        bankName: "HDFC Bank"
      },
      {
        id: "sup-2",
        name: "ITC FMCG Supply",
        contact: "+91 98200 22334",
        amountDue: 18000,
        dueDate: new Date(now + 5 * 86400000).toISOString().split('T')[0],
        items: "Aashirvaad Atta, Sunfeast, Sunsilk, Soap",
        urgency: "critical",
        bankName: "ICICI Bank"
      },
      {
        id: "sup-3",
        name: "Subzi Mandi Wholesaler",
        contact: "+91 98300 33445",
        amountDue: 5200,
        dueDate: new Date(now + 1 * 86400000).toISOString().split('T')[0],
        items: "Potatoes, Onions, Tomatoes, Fresh Herbs",
        urgency: "medium",
        bankName: "State Bank of India"
      },
      {
        id: "sup-4",
        name: "Britannia & Parle Depot",
        contact: "+91 98400 44556",
        amountDue: 7800,
        dueDate: new Date(now + 9 * 86400000).toISOString().split('T')[0],
        items: "Biscuits, Bread, Rusks, Cakes",
        urgency: "low",
        bankName: "Punjab National Bank"
      }
    ],
    transactions: [
      {
        id: "tx-101",
        timestamp: new Date(now - 3600000 * 3).toISOString(),
        type: "credit_sale",
        customerName: "Sharma ji",
        amount: 2400,
        description: "Groceries on 7 days credit",
        channel: "Voice Entry",
        status: "recorded"
      },
      {
        id: "tx-102",
        timestamp: new Date(now - 3600000 * 5).toISOString(),
        type: "cash_sale",
        customerName: "Walk-in Customer",
        amount: 1250,
        description: "Dairy, Eggs & Bread bill",
        channel: "Quick POS",
        status: "recorded"
      },
      {
        id: "tx-103",
        timestamp: new Date(now - 3600000 * 8).toISOString(),
        type: "payment_received",
        customerName: "Pooja Verma",
        amount: 1500,
        description: "Udhaar repayment via UPI",
        channel: "UPI / WhatsApp",
        status: "recorded"
      },
      {
        id: "tx-104",
        timestamp: new Date(now - 3600000 * 12).toISOString(),
        type: "expense",
        customerName: "Store Operations",
        amount: 450,
        description: "Packaging poly bags & tape",
        channel: "Munimji AI",
        status: "synced"
      },
      {
        id: "tx-105",
        timestamp: new Date(now - 3600000 * 20).toISOString(),
        type: "supplier_payment",
        customerName: "Amul Dairy Distributor",
        amount: 8000,
        description: "Weekly milk payment part 1",
        channel: "Net Banking",
        status: "recorded"
      }
    ]
  };
};

export const initDb = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const seed = getSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    console.log('[DB] Initialized database file at:', DB_FILE);
  }
};

export const readDb = () => {
  initDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Read error, resetting to seed:', err);
    const seed = getSeedData();
    writeDb(seed);
    return seed;
  }
};

export const writeDb = (data) => {
  initDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[DB] Write error:', err);
    return false;
  }
};

export const resetDb = () => {
  const seed = getSeedData();
  writeDb(seed);
  return seed;
};
