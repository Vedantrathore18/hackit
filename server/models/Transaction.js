import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required for ledger tracking'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['udhaar', 'payment', 'expense', 'sale'],
        message: '{VALUE} is not a supported transaction type',
      },
      required: [true, 'Transaction type is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [1, 'Transaction amount must be greater than zero'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    due_date: {
      type: Date,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending',
      index: true,
    },
    raw_text: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for dashboard aggregation performance
transactionSchema.index({ type: 1, status: 1, due_date: 1 });
transactionSchema.index({ type: 1, createdAt: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
