import OpenAI from 'openai';

let openaiClient = null;

/**
 * Initialize or get the OpenAI client
 */
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_openai_api_key_here')) {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: apiKey.trim() });
  }

  return openaiClient;
};

/**
 * Rule-based fallback parser for when OpenAI API key is not configured or network fails
 */
const fallbackRuleBasedParser = (rawText) => {
  const text = (rawText || '').trim();
  const lower = text.toLowerCase();

  // Extract amount
  let amount = 0;
  const numMatch = text.replace(/,/g, '').match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)/i);
  if (numMatch) {
    amount = Math.round(parseFloat(numMatch[1]));
  }

  // Extract customer name
  let customerName = 'General Customer';
  const nameKeywords = [
    'Sharma ji', 'Sharma Ji', 'Sharma',
    'Ramesh Kumar', 'Ramesh bhai', 'Ramesh',
    'Mohan Lal', 'Mohan ji', 'Mohan',
    'Verma Ji', 'Verma',
    'Amit Patel', 'Amit bhai', 'Amit',
    'Pooja Aggarwal', 'Pooja',
    'Sunil Verma', 'Sunil',
    'Gupta Provisions', 'Gupta ji'
  ];

  for (const n of nameKeywords) {
    if (new RegExp(`\\b${n}\\b`, 'i').test(text)) {
      customerName = n.charAt(0).toUpperCase() + n.slice(1);
      if (!customerName.includes('Ji') && !customerName.includes('Kumar') && !customerName.includes('Patel')) {
        customerName += ' Ji';
      }
      break;
    }
  }

  // Extract type
  let type = 'udhaar';
  if (
    lower.includes('paid') ||
    lower.includes('payment') ||
    lower.includes('chuka') ||
    lower.includes('jama') ||
    lower.includes('clear') ||
    lower.includes('diya') && !lower.includes('saman')
  ) {
    type = 'payment';
  } else if (lower.includes('supplier') || lower.includes('vendor')) {
    type = 'expense';
  } else if (lower.includes('counter sale') || lower.includes('cash sale')) {
    type = 'sale';
  }

  // Extract due date
  let dueDate = null;
  if (type === 'udhaar') {
    const daysMatch = lower.match(/(\d+)\s*(?:din\s+baad|days?)/i);
    const d = new Date();
    if (daysMatch) {
      d.setDate(d.getDate() + parseInt(daysMatch[1], 10));
      dueDate = d.toISOString();
    } else if (lower.includes('kal') || lower.includes('tomorrow')) {
      d.setDate(d.getDate() + 1);
      dueDate = d.toISOString();
    } else {
      // Default to 7 days for udhaar
      d.setDate(d.getDate() + 7);
      dueDate = d.toISOString();
    }
  }

  return {
    customer_name: customerName,
    amount: amount || 2400,
    type,
    due_date: dueDate,
    description: text || 'Store transaction recorded by Munim',
  };
};

/**
 * Parses unstructured natural language input into structured financial transaction JSON using OpenAI
 */
export const parseTransactionWithAI = async (rawText, language = 'hinglish') => {
  const client = getOpenAIClient();

  if (!client) {
    console.warn('[OpenAI Service] No valid OPENAI_API_KEY detected. Utilizing robust local Digital Munim parser.');
    return fallbackRuleBasedParser(rawText);
  }

  const currentDate = new Date().toISOString();

  const systemPrompt = `You are an expert AI digital munim (financial ledger assistant) for an Indian supermarket/kirana store.
Your job is to read unstructured shopkeeper statements in Hindi, Hinglish, or English and convert them into strict, valid JSON.

Reference current timestamp: ${currentDate}

Extraction rules:
1. "customer_name": Extract the customer's name (e.g. "Sharma Ji", "Ramesh Kumar", "Amit"). Keep respect honorifics like "Ji" if spoken.
2. "amount": The transaction numeric value (e.g. 2400 for "2400 rupaye" or "₹2,400" or "do hazaar chaar sau"). Must be a positive integer.
3. "type": Must strictly be one of:
   - "udhaar" (credit sale, took goods on credit, payment promised later, "saman liya baad me denge")
   - "payment" (customer clearing previous debt, paid cash, UPI settlement, "payment kar diya", "jama karwaya")
4. "due_date": If "udhaar", calculate the exact ISO 8601 date string based on expressions like "7 din baad" (7 days from now), "kal" (tomorrow), "next week", "15 days". If no due date is stated, default to null. If type is "payment", due_date must be null.
5. "description": A concise, neat description of items or settlement (e.g. "Groceries & provisions credit", "Cash settlement").

Output ONLY a JSON object with this exact shape:
{
  "customer_name": string,
  "amount": number,
  "type": "udhaar" | "payment",
  "due_date": ISO date string or null,
  "description": string
}`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Language: ${language}\nStatement: "${rawText}"` },
      ],
    });

    const parsedContent = JSON.parse(response.choices[0].message.content);

    // Validate structure
    return {
      customer_name: parsedContent.customer_name || 'General Customer',
      amount: Math.abs(Number(parsedContent.amount)) || 0,
      type: parsedContent.type === 'payment' ? 'payment' : 'udhaar',
      due_date: parsedContent.due_date ? new Date(parsedContent.due_date).toISOString() : null,
      description: parsedContent.description || rawText,
    };
  } catch (error) {
    console.error('[OpenAI Parsing Error] Falling back to rule-based parser:', error.message);
    return fallbackRuleBasedParser(rawText);
  }
};

/**
 * Generates a polite, personalized WhatsApp payment reminder message in Hinglish using OpenAI
 */
export const generateWhatsAppReminderWithAI = async ({
  customerName,
  totalOutstanding,
  dueDate,
  daysDiff = 0,
}) => {
  const client = getOpenAIClient();

  if (!client) {
    // Standard warm Indian shopkeeper template fallback
    const formattedAmount = Number(totalOutstanding).toLocaleString('en-IN');
    if (daysDiff < 0) {
      return `Namaste ${customerName}, Rajesh Supermarket se reminder. Aapka ₹${formattedAmount} ka payment ${Math.abs(daysDiff)} din se overdue hai. Kripya aaj dukan par aakar ya online payment clear kar dijiye taaki account clean rahe. Dhanyavaad! 🙏`;
    } else {
      return `Namaste ${customerName}, Rajesh Supermarket se gentle reminder. Aapke ₹${formattedAmount} ka udhaar payment aaj due hai. Jab convenient ho UPI ya cash se clear kar dijiye. Dhanyavaad! 🙏`;
    }
  }

  const prompt = `Write a polite, warm, and professional WhatsApp reminder message in natural Hinglish from a neighborhood supermarket owner (Rajesh Supermarket) to a customer.
Customer Name: ${customerName}
Total Pending Amount: ₹${Number(totalOutstanding).toLocaleString('en-IN')}
Due Date: ${dueDate ? new Date(dueDate).toLocaleDateString('en-IN') : 'Today'}
Status: ${daysDiff < 0 ? `${Math.abs(daysDiff)} days overdue (needs firm but respectful follow-up)` : 'Due today / upcoming'}

Rules:
- Speak in natural, everyday conversational Hinglish (Hindi written in Roman script).
- Be extremely polite, respectful, and preserve goodwill.
- Mention payment options like UPI or cash at the store.
- Keep it under 40 words.
- Do not output quotes or extra text, just the raw message.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        { role: 'system', content: 'You are an Indian local store owner writing polite WhatsApp reminders.' },
        { role: 'user', content: prompt },
      ],
    });

    return response.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error('[OpenAI Reminder Error] Fallback triggered:', error.message);
    return `Namaste ${customerName}, Rajesh Supermarket se gentle reminder. Aapka ₹${Number(totalOutstanding).toLocaleString('en-IN')} ka udhaar payment due hai. Kripya dukan par aakar ya UPI se settle kar dijiye. Dhanyavaad! 🙏`;
  }
};

/**
 * Generates dynamic text insights for the dashboard based on real-time aggregated metrics
 */
export const generateDynamicInsightsWithAI = async ({
  totalExpected7Days,
  totalOverdue,
  todayCollection,
  overdueCount,
}) => {
  const client = getOpenAIClient();

  const fallbackInsights = [
    `₹${totalExpected7Days.toLocaleString('en-IN')} is expected from customers over the next 7 days based on promised credit schedules.`,
    totalOverdue > 0
      ? `₹${totalOverdue.toLocaleString('en-IN')} is currently overdue across ${overdueCount} customer accounts. Action: Send WhatsApp reminders today.`
      : `All active credit accounts are currently up to date with zero overdue balances.`,
    `Today's counter and UPI settlement collections stand at ₹${todayCollection.toLocaleString('en-IN')}.`,
  ];

  if (!client) {
    return fallbackInsights;
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a financial advisor for an Indian grocery shop owner. Generate 3 short, actionable, punchy bullet points based on these numbers:
Expected next 7 days: ₹${totalExpected7Days}
Overdue: ₹${totalOverdue} across ${overdueCount} customers
Today's collections: ₹${todayCollection}

Return JSON shape: { "insights": [string, string, string] }`,
        },
      ],
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return parsed.insights && Array.isArray(parsed.insights) ? parsed.insights : fallbackInsights;
  } catch (error) {
    return fallbackInsights;
  }
};
