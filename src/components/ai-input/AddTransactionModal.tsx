import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { addDays } from '../../services/nlpParser';
import { TransactionType } from '../../types';
import { Check, User, Calendar, FileText } from 'lucide-react';

interface AddTransactionModalProps {
  initialType?: TransactionType;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  initialType = 'udhaar',
}) => {
  const {
    isAddTxModalOpen,
    closeAddTxModal,
    confirmAndRecordTransaction,
    customers,
  } = useStore();

  const [customerName, setCustomerName] = useState('Sharma Ji');
  const [amount, setAmount] = useState<number>(2400);
  const [type, setType] = useState<TransactionType>(initialType);
  const [dueDate, setDueDate] = useState<string>(addDays(7));
  const [description, setDescription] = useState('Groceries & staples');

  if (!isAddTxModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    confirmAndRecordTransaction({
      customerName: customerName.trim() || 'General Customer',
      amount,
      type,
      dueDate: type === 'udhaar' ? dueDate : undefined,
      description: description.trim() || 'Store transaction',
      confidence: 1.0,
      missingFields: [],
      cashFlowImpact: type === 'udhaar' ? `+₹${amount} expected receivable` : 'Store ledger updated',
    });

    closeAddTxModal();
  };

  return (
    <Modal
      isOpen={isAddTxModalOpen}
      onClose={closeAddTxModal}
      title="Record Transaction"
      subtitle="Quick manual ledger entry"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#F2EFE8] rounded-xl">
          <button
            type="button"
            onClick={() => setType('udhaar')}
            className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors ${
              type === 'udhaar'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            Udhaar (Credit)
          </button>
          <button
            type="button"
            onClick={() => setType('payment_received')}
            className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors ${
              type === 'payment_received'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            Payment Received
          </button>
          <button
            type="button"
            onClick={() => setType('cash_sale')}
            className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors ${
              type === 'cash_sale'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            Cash Sale
          </button>
          <button
            type="button"
            onClick={() => setType('supplier_payment')}
            className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors ${
              type === 'supplier_payment'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            Supplier Payment
          </button>
        </div>

        {/* Customer / Supplier Name */}
        <div>
          <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider mb-1">
            {type === 'supplier_payment' ? 'Supplier / Wholesaler' : 'Customer Name'}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-[#78716C] absolute left-3 top-3" />
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Sharma Ji"
              className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#D5CEC1] rounded-xl text-sm font-semibold text-[#1C1917] focus:bg-white focus:border-[#1C1917] outline-none"
            />
          </div>

          {/* Quick existing customer chips */}
          <div className="mt-1.5 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {customers.slice(0, 4).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCustomerName(c.name)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[#F2EFE8] text-[#57534E] hover:bg-[#E5E0D4] shrink-0"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider mb-1">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-base font-bold text-[#78716C]">₹</span>
            <input
              type="number"
              required
              min={1}
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="2400"
              className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#D5CEC1] rounded-xl text-lg font-bold font-mono-num text-[#1C1917] focus:bg-white focus:border-[#1C1917] outline-none"
            />
          </div>
        </div>

        {/* Due Date (only for udhaar) */}
        {type === 'udhaar' && (
          <div>
            <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider mb-1">
              Payment Due Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#78716C] absolute left-3 top-3" />
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#D5CEC1] rounded-xl text-sm font-semibold text-[#1C1917] focus:bg-white focus:border-[#1C1917] outline-none"
              />
            </div>
            {/* Quick date chips */}
            <div className="mt-1.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDueDate(addDays(1))}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[#F2EFE8] text-[#57534E] hover:bg-[#E5E0D4]"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setDueDate(addDays(7))}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[#F2EFE8] text-[#57534E] hover:bg-[#E5E0D4]"
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setDueDate(addDays(15))}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[#F2EFE8] text-[#57534E] hover:bg-[#E5E0D4]"
              >
                15 Days
              </button>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider mb-1">
            Note / Items
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-[#78716C] absolute left-3 top-3" />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Groceries & ration items"
              className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#D5CEC1] rounded-xl text-sm font-medium text-[#1C1917] focus:bg-white focus:border-[#1C1917] outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-3">
          <button
            type="submit"
            className="flex-1 py-3 px-4 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-[#F8F6F0] font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Save to Ledger</span>
          </button>
          <button
            type="button"
            onClick={closeAddTxModal}
            className="py-3 px-4 rounded-xl text-[#78716C] hover:text-[#1C1917] text-xs font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};
