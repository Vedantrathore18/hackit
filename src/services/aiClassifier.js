// Real AI Classifier using OpenRouter API with Local NLP Fallback

const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct";
const DEFAULT_KEY = "";

export const getStoredApiKey = () => {
  return localStorage.getItem('moneyview_openrouter_key') || import.meta.env.VITE_OPENROUTER_API_KEY || DEFAULT_KEY;
};

export const setStoredApiKey = (key) => {
  if (key) {
    localStorage.setItem('moneyview_openrouter_key', key.trim());
  } else {
    localStorage.removeItem('moneyview_openrouter_key');
  }
};

export const getStoredModel = () => {
  return localStorage.getItem('moneyview_ai_model') || DEFAULT_MODEL;
};

export const setStoredModel = (model) => {
  localStorage.setItem('moneyview_ai_model', model);
};

// Fallback rule-based classifier (guarantees zero crashes & 0 fake transactions on greetings)
export const localFallbackClassifier = (text, customers = []) => {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. GREETINGS & SMALL TALK (Strictly 0 ledger changes)
  const greetingWords = ['hi', 'hello', 'hey', 'hlo', 'helo', 'namaste', 'namaskar', 'pranam', 'ram ram', 'kaise ho', 'kya haal hai', 'kya haal', 'good morning', 'good evening', 'help', 'madad', 'shuru', 'start', 'who are you', 'kaun ho', 'kya kar sakte ho', 'test'];
  const isGreeting = greetingWords.includes(lower) || 
                     /^(hi|hello|hey|hlo|helo|namaste|namaskar|pranam|help|kaise ho)\b/i.test(lower);

  if (isGreeting && !lower.match(/\d+/)) {
    return {
      intent: 'greeting',
      amount: 0,
      customer: null,
      replyText: "Namaste Gupta ji! 🙏 Main aapka MoneyView Munimji AI Assistant hoon.\n\nAap bol kar ya likh kar store ki transactions enter kar sakte hain ya accounts check kar sakte hain:\n• 'Sharma ji ko 1500 udhaar diya'\n• 'Verma ji se 2000 cash receive hua'\n• 'Paid 450 auto fare for mandi'\n• 'Kitna udhaar baaki hai?'",
      replyDetails: "Boliye, kya entry karni hai ya kaunsa hisab dekhna hai?"
    };
  }

  // 2. QUERY & FINANCIAL INSIGHTS
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
    return {
      intent: 'query',
      amount: 0,
      customer: null
    };
  }

  // Extract amount
  let amount = 0;
  const amtMatch = lower.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)?)/);
  if (amtMatch) {
    amount = parseInt(amtMatch[1].replace(/,/g, ''), 10);
  }

  // Match customer
  let matchedCustomer = null;
  for (const cust of customers) {
    const nameLower = cust.name.toLowerCase();
    const firstName = nameLower.split(' ')[0];
    if (lower.includes(nameLower) || (firstName.length > 2 && lower.includes(firstName))) {
      matchedCustomer = cust;
      break;
    }
  }

  // 3. UDHAAR / CREDIT
  const hasUdhaarKeyword = lower.includes("udhaar") || lower.includes("credit") || lower.includes("khata") || lower.includes("udhar") || lower.includes("le gaya");
  if (hasUdhaarKeyword || (matchedCustomer && (lower.includes("diya") || lower.includes("likh lo")))) {
    if (!amount || amount <= 0) {
      return {
        intent: 'missing_amount',
        context: 'udhaar',
        customer: matchedCustomer,
        replyText: "⚠️ **Kripya Amount (₹) Batayein:**\nKitne rupaye ka udhaar diya hai wo batayein (Jaise: 'Sharma ji ko 1500 udhaar').",
        replyDetails: "Bina amount ke koi transaction record nahi hui hai."
      };
    }
    return {
      intent: 'credit_given',
      amount: amount,
      customer: matchedCustomer || { name: "Customer Khata", id: `cust-${Date.now()}` },
      category: "Groceries on Udhaar",
      replyText: `✓ **Udhaar Record Ho Gaya:** ₹${amount.toLocaleString('en-IN')} ${(matchedCustomer?.name || 'Customer')} ke khate me add kar diya hai.`,
      replyDetails: "Customer Udhaar balance updated • New due date scheduled (7 days)"
    };
  }

  // 4. PAYMENT RECEIVED
  const hasRepaymentKeyword = lower.includes("diye") || lower.includes("wapas") || lower.includes("aaye") || lower.includes("jama") || lower.includes("payment") || lower.includes("collected") || lower.includes("settled") || lower.includes("received") || lower.includes("mil gaye");
  if (hasRepaymentKeyword) {
    if (!amount || amount <= 0) {
      return {
        intent: 'missing_amount',
        context: 'payment',
        customer: matchedCustomer,
        replyText: "⚠️ **Kripya Amount (₹) Batayein:**\nKitne rupaye jama hue hain wo batayein (Jaise: 'Verma ji se 2000 aaye').",
        replyDetails: "Bina amount ke koi transaction record nahi hui hai."
      };
    }
    return {
      intent: 'payment_received',
      amount: amount,
      customer: matchedCustomer || { name: "Store Customer" },
      category: "Customer Udhaar Collection",
      replyText: `✓ **Payment Received:** ₹${amount.toLocaleString('en-IN')} cash/UPI ${(matchedCustomer?.name || 'Customer')} se receive hua.`,
      replyDetails: "Counter Cash Galla increased • Customer balance cleared in ledger!"
    };
  }

  // 5. EXPENSES
  const expenseKeywords = [
    'auto', 'tempo', 'petrol', 'diesel', 'fare', 'bhada', 'delivery', 'transport', 'mandi',
    'packaging', 'bag', 'panni', 'poly', 'tape', 'box', 'dabba',
    'helper', 'labor', 'chai', 'nasta', 'lunch', 'salary', 'wage', 'dehari', 'staff',
    'light', 'bijli', 'electricity', 'meter', 'repair', 'safai', 'cleaning', 'maintenance', 'kharcha', 'expense'
  ];
  const isExpense = expenseKeywords.some(kw => lower.includes(kw));

  if (isExpense) {
    if (!amount || amount <= 0) {
      return {
        intent: 'missing_amount',
        context: 'expense',
        replyText: "⚠️ **Kripya Amount (₹) Batayein:**\nKitna kharcha hua wo batayein (Jaise: 'Paid 450 auto fare for mandi').",
        replyDetails: "Bina amount ke koi transaction record nahi hui hai."
      };
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
      category: expenseCategory,
      replyText: `✓ **Expense Record Ho Gaya:** -₹${amount.toLocaleString('en-IN')} (${expenseCategory})`,
      replyDetails: "Counter cash me se deduct kiya gaya • Digital Vyapar Sheet me row append ho gayi!"
    };
  }

  // 6. Direct amount + customer
  if (amount > 0 && matchedCustomer) {
    return {
      intent: 'credit_given',
      amount: amount,
      customer: matchedCustomer,
      category: "Groceries on Udhaar",
      replyText: `✓ **Udhaar Record Ho Gaya:** ₹${amount.toLocaleString('en-IN')} ${matchedCustomer.name} ke khate me add kar diya hai.`,
      replyDetails: "Customer Udhaar balance updated"
    };
  }

  // 7. Unknown
  return {
    intent: 'unknown',
    amount: 0,
    customer: null,
    replyText: "Mujhe ye samajh nahi aaya. Kripya transaction amount (₹) aur customer ya kharche ka naam saaf batayein.\n\nJaise:\n• 'Sharma ji ko 1500 udhaar'\n• 'Verma ji se 2000 aaye'\n• 'Paid 450 auto bhada'",
    replyDetails: "Koi entry record nahi hui hai."
  };
};

// Main AI Classifier: Calls OpenRouter if API key exists, otherwise uses local fallback
export const classifyTransactionWithAI = async ({
  text,
  customers = [],
  metrics = {},
  apiKey = null,
  model = null
}) => {
  const activeKey = apiKey || getStoredApiKey();
  const activeModel = model || getStoredModel();

  // If no API key is provided, use the strict local classifier immediately
  if (!activeKey || !activeKey.trim()) {
    return {
      ...localFallbackClassifier(text, customers),
      source: 'local_engine'
    };
  }

  // Build Customer Names list for context
  const customerNames = customers.map(c => c.name).join(", ");

  const systemPrompt = `You are Munimji AI, an expert, razor-sharp Indian Kirana / Supermarket Accountant AI.
You convert everyday natural language statements (in Hindi, Hinglish, or English) into structured financial transactions for the supermarket ledger.

Known Store Customers: [${customerNames || "Sharma ji, Verma ji, Anita Patel, Rajesh Kumar, Sunita Mehra, Vikram Singh"}]

CRITICAL RULES:
1. Greetings / Small talk ("hi", "hello", "namaste", "kaise ho", "kya haal", "good morning", "shuru", "test", etc.) MUST ALWAYS return intent="greeting", amount=0, customerName=null. NEVER invent or record a transaction on a greeting!
2. If the user mentions giving udhaar, credit, or goods taken on account, set intent="credit_given". If amount is missing, set intent="missing_amount".
3. If the user mentions money received, repayment, collection, settlement, or "wapas diye", set intent="payment_received".
4. If the user mentions store operational expenses (auto, tempo, mandi transport, chai, packaging bags, panni, electricity, helper wage, repair), set intent="expense".
5. If the user asks questions about total udhaar, balance, overdue accounts, cash flow, or shortfall, set intent="query".
6. If the input is gibberish or unclear without any amount, set intent="unknown".

You MUST respond ONLY with a single valid raw JSON object (NO markdown, NO \`\`\`json fences, NO surrounding text):
{
  "intent": "greeting" | "query" | "credit_given" | "payment_received" | "expense" | "missing_amount" | "unknown",
  "amount": number,
  "customerName": string or null,
  "category": string,
  "replyText": string,
  "replyDetails": string
}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${activeKey.trim()}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin || "http://localhost:5173",
        "X-Title": "MoneyView Supermarket Ledger"
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: 0.1,
        max_tokens: 300
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn("OpenRouter API returned error status:", response.status);
      const fallback = localFallbackClassifier(text, customers);
      return { ...fallback, source: 'local_fallback_api_error' };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "";

    // Clean JSON markdown fences if LLM included them
    const cleanJson = content.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleanJson);

    // Match customer object if customerName was returned
    let matchedCustomer = null;
    if (parsed.customerName) {
      const pNameLower = parsed.customerName.toLowerCase();
      matchedCustomer = customers.find(c => {
        const cLower = c.name.toLowerCase();
        return cLower.includes(pNameLower) || pNameLower.includes(cLower.split(' ')[0]);
      });
      if (!matchedCustomer) {
        matchedCustomer = {
          name: parsed.customerName,
          id: `cust-${Date.now()}`
        };
      }
    }

    return {
      intent: parsed.intent || 'unknown',
      amount: typeof parsed.amount === 'number' ? parsed.amount : (parseInt(parsed.amount, 10) || 0),
      customer: matchedCustomer,
      category: parsed.category || 'Store Operations',
      replyText: parsed.replyText || "Transaction processed.",
      replyDetails: parsed.replyDetails || "Processed via OpenRouter AI",
      source: 'openrouter_ai',
      modelUsed: activeModel
    };

  } catch (err) {
    console.warn("OpenRouter AI fetch failed, falling back to local NLP:", err.message);
    const fallback = localFallbackClassifier(text, customers);
    return { ...fallback, source: 'local_fallback_network_error' };
  }
};
