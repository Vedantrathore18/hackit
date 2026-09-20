import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { addDays } from '../../services/nlpParser';
import { Check, Calendar, User, ArrowUpRight, HelpCircle, CheckCircle } from 'lucide-react';
import { TransactionType } from '../../types';

export const ConfirmationModal: React.FC = () => {
  const {
    candidateToConfirm,
    setCandidateForConfirmation,
    confirmAndRecordTransaction,
    isProcessingTx,
    processingStepText,
  } = useStore();

  const [customCustomer, setCustomCustomer] = useState('');
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [customType, setCustomType] = useState<TransactionType>('udhaar');
  const [customDueDate, setCustomDueDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  if (!candidateToConfirm) return null;

  const candidate = candidateToConfirm;
  const currentCustomer = customCustomer || candidate.customerName;
  const currentAmount = customAmount || candidate.amount;
  const currentType = customType || candidate.type;
  const currentDueDate = customDueDate || candidate.dueDate;

  // Due date option chips
  const dueDateOptions = [
    { label: 'Tomorrow', date: addDays(1) },
    { label: '7 Days', date: addDays(7) },
    { label: '15 Days', date: addDays(15) },
    { label: '30 Days', date: addDays(30) },
  ];

  const handleSelectDueDate = (dateStr: string) => {
    setCustomDueDate(dateStr);
  };

  const handleFinalSubmit = () => {
    confirmAndRecordTransaction({
      ...candidate,
      customerName: currentCustomer,
      amount: currentAmount,
      type: currentType,
      dueDate: currentDueDate,
    });
  };

  const isMissingDueDate = candidate.type === 'udhaar' && !currentDueDate;

  return (
    <Modal
      isOpen={!!candidateToConfirm}
      onClose={() => setCandidateForConfirmation(null)}
      title="Transaction Ready for Ledger"
      subtitle="Verify details before Expenso writes to your store records"
      maxWidth="md"
    >
      {/* Processing State Overlay */}
      {isProcessingTx ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[#E8E3D8] border-t-emerald-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600 animate-pulse" />
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-[#1C1917]">Recording Transaction</h4>
            <p className="text-sm font-semibold text-emerald-700 mt-1 animate-pulse">
              {processingStepText || 'Updating Munim ledger...'}
            </p>
          </div>

          <p className="text-xs text-[#78716C] max-w-xs">
            Syncing balance, scheduling reminders, and updating cash-flow forecast.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Missing Information Prompt Banner if ambiguous */}
          {isMissingDueDate && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1.5">
                <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>When should {currentCustomer}'s payment be due?</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {dueDateOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectDueDate(opt.date)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                      currentDueDate === opt.date
                        ? 'bg-[#1C1917] text-white shadow-2xs'
                        : 'bg-white text-[#57534E] border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Structured Confirmation Card */}
          <div className="p-4 sm:p-5 bg-[#FAF8F5] rounded-2xl border border-[#D5CEC1] space-y-4">
            {/* Top row: Customer & Amount */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E8E3D8]">
              <div>
                <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
                  Customer / Entity
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <User className="w-4 h-4 text-[#57534E]" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentCustomer}
                      onChange={(e) => setCustomCustomer(e.target.value)}
                      className="text-base font-bold text-[#1C1917] bg-white border border-[#D5CEC1] px-2 py-0.5 rounded-lg"
                    />
                  ) : (
                    <p className="text-base font-bold text-[#1C1917]">{currentCustomer}</p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
                  Amount
                </span>
                {isEditing ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="font-bold text-sm">₹</span>
                    <input
                      type="number"
                      value={currentAmount}
                      onChange={(e) => setCustomAmount(Number(e.target.value))}
                      className="w-24 text-base font-extrabold font-mono-num text-[#1C1917] bg-white border border-[#D5CEC1] px-2 py-0.5 rounded-lg"
                    />
                  </div>
                ) : (
                  <p className="text-xl font-extrabold font-mono-num text-[#1C1917]">
                    ₹{currentAmount.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </div>

            {/* Middle Row: Type & Due Date */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#78716C] font-semibold">Ledger Entry Type</span>
                {isEditing ? (
                  <select
                    value={currentType}
                    onChange={(e) => setCustomType(e.target.value as TransactionType)}
                    className="mt-1 block w-full bg-white border border-[#D5CEC1] rounded-lg p-1.5 font-bold"
                  >
                    <option value="udhaar">Udhaar (Credit Sale)</option>
                    <option value="payment_received">Payment Received</option>
                    <option value="cash_sale">Cash Sale</option>
                    <option value="supplier_payment">Supplier Payment</option>
                    <option value="expense">Store Expense</option>
                  </select>
                ) : (
                  <p className="text-sm font-bold capitalize text-[#1C1917] mt-0.5">
                    {currentType === 'udhaar' ? 'Udhaar / Credit Sale' : currentType.replace('_', ' ')}
                  </p>
                )}
              </div>

              <div>
                <span className="text-[#78716C] font-semibold">Due Date</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span className="text-sm font-bold text-amber-900">
                    {currentDueDate || 'Immediate'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick change due date chips if udhaar */}
            {currentType === 'udhaar' && (
              <div className="pt-2 border-t border-[#E8E3D8]">
                <p className="text-[11px] font-semibold text-[#78716C] mb-1.5">Change Due Timeline:</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {dueDateOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectDueDate(opt.date)}
                      className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                        currentDueDate === opt.date
                          ? 'bg-[#1C1917] text-white font-bold'
                          : 'bg-white border border-[#D5CEC1] text-[#57534E] hover:bg-[#F2EFE8]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description & Impact Preview */}
            <div className="p-3 bg-[#ECFDF5] rounded-xl border border-[#A7F3D0] space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#15803D]">
                <span>Financial Impact</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-emerald-900">
                {currentType === 'udhaar'
                  ? `+₹${currentAmount.toLocaleString('en-IN')} receivable scheduled for ${currentDueDate || '7 days'}. Digital reminder will be queued.`
                  : currentType === 'payment_received'
                  ? `₹${currentAmount.toLocaleString('en-IN')} cash collected. Customer outstanding cleared.`
                  : `Store books balanced immediately.`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleFinalSubmit}
              className="flex-1 py-3 px-4 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-[#F8F6F0] font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Confirm Transaction</span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="py-3 px-4 rounded-xl bg-[#F2EFE8] hover:bg-[#E5E0D4] text-[#1C1917] font-semibold text-xs transition-colors"
            >
              {isEditing ? 'Done Editing' : 'Edit Details'}
            </button>

            <button
              onClick={() => setCandidateForConfirmation(null)}
              className="py-3 px-3 rounded-xl text-[#78716C] hover:text-[#1C1917] text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
