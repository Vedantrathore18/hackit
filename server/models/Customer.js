import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    total_outstanding: {
      type: Number,
      default: 0,
      min: [0, 'Total outstanding balance cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index on name for rapid search
customerSchema.index({ name: 1 });

// Virtual to populate all transactions for this customer
customerSchema.virtual('transactions', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'customer_id',
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
