import Customer from '../models/Customer.js';
import Transaction from '../models/Transaction.js';
import { generateWhatsAppReminderWithAI } from '../services/openaiService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Generate a polite WhatsApp reminder message in Hinglish using OpenAI
 * @route   POST /api/reminders/generate
 * @access  Public
 */
export const generateReminderMessage = asyncHandler(async (req, res) => {
  const { customer_id } = req.body;

  if (!customer_id) {
    res.status(400);
    throw new Error('customer_id is required');
  }

  const customer = await Customer.findById(customer_id);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  if (customer.total_outstanding <= 0) {
    return res.json({
      success: true,
      message: `${customer.name} has no outstanding balance. No reminder needed!`,
      data: {
        customer_id: customer._id,
        customer_name: customer.name,
        total_outstanding: 0,
        reminder_text: `Namaste ${customer.name} ji, aapka Rajesh Supermarket me koi udhaar baki nahi hai. Dhanyavaad!`,
      },
    });
  }

  // Fetch pending udhaar transactions
  const pendingTxs = await Transaction.find({
    customer_id: customer._id,
    type: 'udhaar',
    status: { $in: ['pending', 'overdue'] },
  }).sort({ due_date: 1 });

  const earliestDue = pendingTxs[0]?.due_date;
  let daysDiff = 0;
  if (earliestDue) {
    const diffTime = new Date(earliestDue).getTime() - Date.now();
    daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Generate the message via OpenAI
  const reminderText = await generateWhatsAppReminderWithAI({
    customerName: customer.name,
    totalOutstanding: customer.total_outstanding,
    dueDate: earliestDue,
    daysDiff,
  });

  // Generate WhatsApp web/mobile click-to-chat URL
  const cleanPhone = customer.phone ? customer.phone.replace(/[^0-9]/g, '') : '';
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(reminderText)}`
    : `https://wa.me/?text=${encodeURIComponent(reminderText)}`;

  res.json({
    success: true,
    data: {
      customer_id: customer._id,
      customer_name: customer.name,
      phone: customer.phone,
      total_outstanding: customer.total_outstanding,
      earliest_due_date: earliestDue,
      days_difference: daysDiff,
      status: daysDiff < 0 ? 'overdue' : daysDiff === 0 ? 'due_today' : 'upcoming',
      reminder_text: reminderText,
      whatsapp_url: whatsappUrl,
    },
  });
});

/**
 * @desc    Get all pending reminder items across customers
 * @route   GET /api/reminders
 * @access  Public
 */
export const getPendingReminders = asyncHandler(async (req, res) => {
  const customersWithDues = await Customer.find({ total_outstanding: { $gt: 0 } })
    .sort({ total_outstanding: -1 })
    .lean();

  const now = new Date();

  const reminders = await Promise.all(
    customersWithDues.map(async (cust) => {
      const earliestTx = await Transaction.findOne({
        customer_id: cust._id,
        type: 'udhaar',
        status: { $in: ['pending', 'overdue'] },
      }).sort({ due_date: 1 });

      const dueDate = earliestTx?.due_date || null;
      let daysDiff = 0;
      let status = 'upcoming';

      if (dueDate) {
        const diff = new Date(dueDate).getTime() - now.getTime();
        daysDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (daysDiff < 0) status = 'overdue';
        else if (daysDiff === 0) status = 'due_today';
      }

      return {
        customer_id: cust._id,
        customer_name: cust.name,
        phone: cust.phone,
        total_outstanding: cust.total_outstanding,
        due_date: dueDate,
        days_difference: daysDiff,
        status,
      };
    })
  );

  res.json({
    success: true,
    count: reminders.length,
    data: reminders,
  });
});
