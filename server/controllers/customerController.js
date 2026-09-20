import Customer from '../models/Customer.js';
import Transaction from '../models/Transaction.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Fetch all customers sorted by total_outstanding descending
 * @route   GET /api/customers
 * @access  Public
 */
export const getCustomers = asyncHandler(async (req, res) => {
  const { q, filter } = req.query;

  const query = {};

  // Search by name or phone
  if (q && q.trim()) {
    query.$or = [
      { name: { $regex: q.trim(), $options: 'i' } },
      { phone: { $regex: q.trim(), $options: 'i' } },
    ];
  }

  // Filter by status (owes vs paid)
  if (filter === 'owes') {
    query.total_outstanding = { $gt: 0 };
  } else if (filter === 'paid') {
    query.total_outstanding = 0;
  }

  const customers = await Customer.find(query)
    .sort({ total_outstanding: -1, updatedAt: -1 })
    .lean();

  res.json({
    success: true,
    count: customers.length,
    data: customers,
  });
});

/**
 * @desc    Fetch a specific customer profile with populated transaction history ledger
 * @route   GET /api/customers/:id/ledger
 * @access  Public
 */
export const getCustomerLedger = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const customer = await Customer.findById(id);

  if (!customer) {
    res.status(404);
    throw new Error(`Customer not found with ID ${id}`);
  }

  // Fetch chronological transaction history for this customer
  const transactions = await Transaction.find({ customer_id: customer._id })
    .sort({ createdAt: -1 })
    .lean();

  // Compute stats on the fly
  const totalCredit = transactions
    .filter((t) => t.type === 'udhaar')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalPaid = transactions
    .filter((t) => t.type === 'payment')
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingTransactions = transactions.filter((t) => t.status === 'pending');

  res.json({
    success: true,
    data: {
      customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        total_outstanding: customer.total_outstanding,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
      stats: {
        total_credit: totalCredit,
        total_paid: totalPaid,
        current_outstanding: customer.total_outstanding,
        transaction_count: transactions.length,
        pending_bills_count: pendingTransactions.length,
      },
      transactions,
    },
  });
});

/**
 * @desc    Create new customer manually
 * @route   POST /api/customers
 * @access  Public
 */
export const createCustomer = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('Customer name is required');
  }

  const customer = await Customer.create({
    name: name.trim(),
    phone: phone ? phone.trim() : null,
    total_outstanding: 0,
  });

  res.status(201).json({
    success: true,
    data: customer,
  });
});
