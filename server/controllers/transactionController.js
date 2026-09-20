import Transaction from '../models/Transaction.js';
import Customer from '../models/Customer.js';
import { parseTransactionWithAI } from '../services/openaiService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Parse natural language text with AI, create/update customer & ledger entry
 * @route   POST /api/transactions/parse
 * @access  Public
 */
export const parseAndCreateTransaction = asyncHandler(async (req, res) => {
  const { raw_text, language = 'hinglish' } = req.body;

  if (!raw_text || typeof raw_text !== 'string' || !raw_text.trim()) {
    res.status(400);
    throw new Error('raw_text is required to parse a transaction');
  }

  // 1. Extract structured financial data using OpenAI
  const parsed = await parseTransactionWithAI(raw_text.trim(), language);

  const { customer_name, amount, type, due_date, description } = parsed;

  if (!customer_name || !amount || amount <= 0) {
    res.status(422);
    throw new Error('Could not extract valid customer name or transaction amount from input');
  }

  // 2. Look up customer (case-insensitive regex) or create new
  const escapedName = customer_name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  let customer = await Customer.findOne({
    name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
  });

  if (!customer) {
    customer = await Customer.create({
      name: customer_name,
      total_outstanding: 0,
    });
    console.log(`[Customer Created] New account registered: ${customer.name} (ID: ${customer._id})`);
  }

  // Determine initial status based on due date and type
  let initialStatus = 'pending';
  if (type === 'payment' || type === 'sale') {
    initialStatus = 'paid';
  } else if (due_date && new Date(due_date) < new Date()) {
    initialStatus = 'overdue';
  }

  // 3. Create the Transaction document
  const transaction = await Transaction.create({
    customer_id: customer._id,
    type,
    amount,
    description: description || raw_text,
    due_date: due_date ? new Date(due_date) : null,
    status: initialStatus,
    raw_text: raw_text.trim(),
  });

  // 4. Update Customer's total_outstanding balance
  if (type === 'udhaar') {
    customer.total_outstanding += amount;
  } else if (type === 'payment') {
    customer.total_outstanding = Math.max(0, customer.total_outstanding - amount);
  }
  await customer.save();

  // 5. Return standardized response
  res.status(201).json({
    success: true,
    message: `Recorded ${type === 'udhaar' ? 'Udhaar' : 'Payment'} of ₹${amount.toLocaleString('en-IN')} for ${customer.name}`,
    data: {
      transaction: {
        _id: transaction._id,
        customer_id: transaction.customer_id,
        customer_name: customer.name,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        due_date: transaction.due_date,
        status: transaction.status,
        raw_text: transaction.raw_text,
        createdAt: transaction.createdAt,
      },
      customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        total_outstanding: customer.total_outstanding,
      },
      ledger_impact: {
        type,
        amount,
        updated_outstanding: customer.total_outstanding,
        due_date: transaction.due_date,
      },
    },
  });
});

/**
 * @desc    Get recent transactions with optional filters and populated customer
 * @route   GET /api/transactions
 * @access  Public
 */
export const getTransactions = asyncHandler(async (req, res) => {
  const { type, status, limit = 50, page = 1, customer_id } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (customer_id) filter.customer_id = customer_id;

  const take = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (Math.max(1, parseInt(page, 10)) - 1) * take;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate('customer_id', 'name phone total_outstanding')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take),
    Transaction.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: transactions.length,
    total,
    page: parseInt(page, 10),
    data: transactions,
  });
});

/**
 * @desc    Create manual transaction directly
 * @route   POST /api/transactions
 * @access  Public
 */
export const createManualTransaction = asyncHandler(async (req, res) => {
  const { customer_id, customer_name, type, amount, description, due_date } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Valid transaction amount is required');
  }

  let customer;
  if (customer_id) {
    customer = await Customer.findById(customer_id);
  } else if (customer_name) {
    customer = await Customer.findOne({
      name: { $regex: new RegExp(`^${customer_name.trim()}$`, 'i') },
    });
    if (!customer) {
      customer = await Customer.create({ name: customer_name.trim(), total_outstanding: 0 });
    }
  }

  if (!customer) {
    res.status(404);
    throw new Error('Customer could not be identified or created');
  }

  const transaction = await Transaction.create({
    customer_id: customer._id,
    type: type || 'udhaar',
    amount: Number(amount),
    description: description || 'Manual entry',
    due_date: due_date ? new Date(due_date) : null,
    status: type === 'payment' ? 'paid' : 'pending',
  });

  if (type === 'udhaar') {
    customer.total_outstanding += Number(amount);
  } else if (type === 'payment') {
    customer.total_outstanding = Math.max(0, customer.total_outstanding - Number(amount));
  }
  await customer.save();

  res.status(201).json({
    success: true,
    data: transaction,
    customer,
  });
});
