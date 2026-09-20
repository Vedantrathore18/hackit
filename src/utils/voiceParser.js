// Smart NLP Parser for Voice & Quick Text Entry (Hindi / Hinglish / English)

export function parseVoiceTransaction(transcript, existingCustomers = []) {
  if (!transcript || typeof transcript !== 'string') {
    return null;
  }

  const text = transcript.trim();
  const lower = text.toLowerCase();

  // 1. Extract Amount
  // Matches ₹2,400, 2400, 2,400, 2400rs, rs 2400, 2400 rupaye, 2.5k
  let amount = 0;
  const kMatch = lower.match(/(\d+(\.\d+)?)\s*k\b/i);
  if (kMatch) {
    amount = parseFloat(kMatch[1]) * 1000;
  } else {
    // Look for numbers following or preceding currency indicators
    const numRegex = /(?:₹|rs\.?|inr|rupees?|rupaye?|\b)?\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)(?:\s*(?:₹|rs\.?|inr|rupees?|rupaye?|\/-))?/gi;
    let match;
    const candidates = [];
    while ((match = numRegex.exec(text)) !== null) {
      const valStr = match[1].replace(/,/g, '');
      const num = parseInt(valStr, 10);
      if (!isNaN(num) && num > 0) {
        candidates.push(num);
      }
    }
    // Pick the most likely candidate (usually the largest number, excluding phone or days)
    if (candidates.length > 0) {
      // filter out small numbers that might be days (e.g., 7 days)
      const nonDayCandidates = candidates.filter(c => c > 31 || (!lower.includes(c + ' day') && !lower.includes(c + ' din')));
      amount = nonDayCandidates.length > 0 ? nonDayCandidates[0] : candidates[0];
    }
  }

  // 2. Extract Duration / Credit Due Days
  let dueDays = 7; // Default 7 days for udhaar
  const dayMatch = lower.match(/(\d+)\s*(?:days?|din|dino|hafta|hafte|week|weeks)/i);
  if (dayMatch) {
    const num = parseInt(dayMatch[1], 10);
    if (lower.includes('hafta') || lower.includes('hafte') || lower.includes('week')) {
      dueDays = num * 7;
    } else {
      dueDays = num;
    }
  } else if (lower.includes('agle hafte') || lower.includes('next week')) {
    dueDays = 7;
  } else if (lower.includes('kal') || lower.includes('tomorrow')) {
    dueDays = 1;
  } else if (lower.includes('mahine') || lower.includes('month')) {
    dueDays = 30;
  }

  // 3. Determine Transaction Type
  let type = "credit_sale"; // default assumption if credit/udhaar mentioned
  if (
    lower.includes("supplier") ||
    lower.includes("distributor") ||
    lower.includes("amul") ||
    lower.includes("itc") ||
    lower.includes("wholesaler") ||
    lower.includes("vendor") ||
    lower.includes("dealer")
  ) {
    type = "supplier_payment";
  } else if (
    lower.includes("jama") ||
    lower.includes("paid") ||
    lower.includes("repayment") ||
    lower.includes("de diye") ||
    lower.includes("wapas") ||
    lower.includes("lautaya") ||
    lower.includes("clear")
  ) {
    type = "payment_received";
  } else if (
    lower.includes("kharcha") ||
    lower.includes("expense") ||
    lower.includes("chai") ||
    lower.includes("auto") ||
    lower.includes("rent") ||
    lower.includes("bijli") ||
    lower.includes("helper")
  ) {
    type = "expense";
  } else if (
    lower.includes("cash sale") ||
    lower.includes("bikri") ||
    lower.includes("nagad") ||
    lower.includes("counter sale")
  ) {
    type = "cash_sale";
  } else if (
    lower.includes("credit") ||
    lower.includes("udhaar") ||
    lower.includes("udhar") ||
    lower.includes("baaki") ||
    lower.includes("khata") ||
    lower.includes("took") ||
    lower.includes("liya")
  ) {
    type = "credit_sale";
  }

  // 4. Extract Entity / Customer Name
  let customerName = "";
  
  // First, check if any existing customer name is mentioned in text
  for (const c of existingCustomers) {
    const cNameLower = c.name.toLowerCase();
    const firstName = cNameLower.split(" ")[0];
    if (lower.includes(cNameLower) || lower.includes(firstName)) {
      customerName = c.name;
      break;
    }
  }

  // If not matched directly, extract using Hindi/English pattern matching
  if (!customerName) {
    // Examples: "Sharma ji took...", "Sharma ji ne...", "Gupta ji ko...", "Ramesh ne..."
    const nameMatch = text.match(/([A-Z][a-z]+(?:\s+(?:ji|kumar|singh|verma|sharma|gupta|devi|bhai|saab))?)/i);
    if (nameMatch) {
      customerName = nameMatch[1].trim();
      // capitalize nicely
      customerName = customerName.charAt(0).toUpperCase() + customerName.slice(1);
    } else {
      customerName = type === "supplier_payment" ? "Supplier Partner" : (type === "expense" ? "Store Expense" : "Customer");
    }
  }

  // 5. Category & Description
  let category = "Groceries";
  if (lower.includes("milk") || lower.includes("doodh") || lower.includes("dairy") || lower.includes("paneer")) {
    category = "Dairy & Milk";
  } else if (lower.includes("atta") || lower.includes("chawal") || lower.includes("rice") || lower.includes("dal")) {
    category = "Grains & Staples";
  } else if (lower.includes("oil") || lower.includes("tel") || lower.includes("ghee") || lower.includes("sugar")) {
    category = "Edibles & Oils";
  } else if (lower.includes("snack") || lower.includes("biscuit") || lower.includes("chips") || lower.includes("maggi")) {
    category = "Snacks & FMCG";
  } else if (lower.includes("soap") || lower.includes("surf") || lower.includes("detergent") || lower.includes("cleaning")) {
    category = "Household Cleaning";
  }

  const dueDate = new Date(Date.now() + dueDays * 86400000).toISOString().split('T')[0];

  return {
    rawTranscript: text,
    customerName,
    amount: amount || 1000,
    type,
    dueDays,
    dueDate,
    category,
    description: text,
    confidence: 0.96,
  };
}

// Preset realistic voice scenarios for the Hackathon Live Demo loop!
export const DEMO_SCENARIOS = [
  {
    id: "scenario-1",
    label: "Sharma ji Udhaar (Track 2 Prompt)",
    phrase: "Sharma ji took ₹2,400 worth of groceries on 7 days credit.",
    hint: "Live demo required loop trigger"
  },
  {
    id: "scenario-2",
    label: "Verma ji Repayment (Hindi)",
    phrase: "Verma ji ne ₹3,000 udhaar jama kar diya cash me.",
    hint: "Udhaar repayment & ledger update"
  },
  {
    id: "scenario-3",
    label: "Amul Supplier Payment",
    phrase: "Paid ₹14,500 to Amul dairy distributor for weekly milk crates.",
    hint: "Supplier outflow recording"
  },
  {
    id: "scenario-4",
    label: "Daily Evening Cash Sale",
    phrase: "Cash sale of ₹3,850 on grocery counter today.",
    hint: "Galla balance increment"
  },
  {
    id: "scenario-5",
    label: "Chaudhary Saab Bulk Credit",
    phrase: "Chaudhary Saab took ₹6,500 mustard oil and sugar on 10 days credit.",
    hint: "High-value Kirana credit sale"
  }
];
