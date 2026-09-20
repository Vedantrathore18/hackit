import React from 'react';
import { useStore } from '../../context/StoreContext';
import { BottomSheet } from '../common/BottomSheet';
import { Phone, Calendar, Clock, Plus, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';
import { addDays } from '../../services/nlpParser';

export const CustomerDetailDrawer: React.FC = () => {
  const {
    selectedCustomerId,
    setSelectedCustomerId,
    customers,
    transactions,
    setCandidateForConfirmation,
    showToast,
  } = useStore();

  if (!selectedCustomerId) return null;

  const customer = customers.find((c) => c.id === selectedCustomerId);
  if (!customer) return null;

  // Filter transactions for this customer
  const customerTxs = transactions.filter(
    (t) =>
      t.customerId === customer.id ||
      t.customerName.toLowerCase().includes(customer.name.toLowerCase()) ||
      customer.name.toLowerCase().includes(t.customerName.toLowerCase())
  );

  const isOverdue = customer.status === 'overdue' || (customer.daysOverdue && customer.daysOverdue > 0);

  const handleOpenWhatsApp = () => {
    const text = `Namaste ${customer.name}, Rajesh Supermarket se payment reminder. Aapke account me ₹${customer.outstandingBalance.toLocaleString('en-IN')} ka udhaar payment due hai. Kripya dukan par aakar ya online payment kar dijiye. Dhanyavaad!`;
    const cleanPhone = customer.phone ? customer.phone.replace(/[^0-9]/g, '') : '';
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyReminder = () => {
    const text = `Namaste ${customer.name}, Rajesh Supermarket se payment reminder. Aapke account me ₹${customer.outstandingBalance.toLocaleString('en-IN')} ka udhaar payment due hai. Kripya dukan par aakar ya online payment kar dijiye. Dhanyavaad!`;
    navigator.clipboard.writeText(text);
    showToast('Reminder message copied to clipboard!', 'success');
  };

  const handleQuickAddUdhaar = () => {
    setCandidateForConfirmation({
      customerName: customer.name,
      amount: 1500,
      type: 'udhaar',
      dueDate: addDays(7),
      description: 'Groceries on credit',
      confidence: 1.0,
      missingFields: [],
      cashFlowImpact: `+₹1,500 receivable in 7 days`,
    }, 'manual', `Added ₹1,500 udhaar for ${customer.name}`);
  };

  const handleQuickRecordPayment = () => {
    setCandidateForConfirmation({
      customerName: customer.name,
      amount: customer.outstandingBalance || 1000,
      type: 'payment_received',
      description: 'Account settlement payment',
      confidence: 1.0,
      missingFields: [],
      cashFlowImpact: `₹${(customer.outstandingBalance || 1000).toLocaleString('en-IN')} cash collected`,
    }, 'manual', `Received payment from ${customer.name}`);
  };

  return (
    <BottomSheet
      isOpen={!!selectedCustomerId}
      onClose={() => setSelectedCustomerId(null)}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1C1917] text-[#F8F6F0] flex items-center justify-center font-bold text-xs">
            {customer.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1C1917]">{customer.name}</h3>
            <p className="text-xs text-[#78716C]">Customer Ledger & History</p>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Outstanding Balance Hero Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#D5CEC1]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                Current Outstanding (Udhaar)
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-mono-num text-[#1C1917] mt-1">
                ₹{customer.outstandingBalance.toLocaleString('en-IN')}
              </h2>
            </div>
            <div className="text-right">
              {isOverdue ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {customer.daysOverdue || 12} days overdue
                </span>
              ) : customer.outstandingBalance === 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5" />
                  All Cleared
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Clock className="w-3.5 h-3.5" />
                  Due: {customer.nextPaymentDue || '27 Sep'}
                </span>
              )}
            </div>
          </div>

          {/* Metric Stats Strip */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#E8E3D8] text-center">
            <div>
              <p className="text-[11px] text-[#78716C]">All-time Credit</p>
              <p className="text-xs font-bold font-mono-num text-[#1C1917] mt-0.5">
                ₹{customer.totalCredit.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#78716C]">All-time Paid</p>
              <p className="text-xs font-bold font-mono-num text-emerald-700 mt-0.5">
                ₹{customer.totalPaid.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#78716C]">Reliability</p>
              <p className="text-xs font-bold text-[#57534E] mt-0.5">
                {customer.reliability}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Details & Contact */}
        <div className="flex items-center justify-between text-xs px-2 text-[#57534E]">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#78716C]" />
            <span>{customer.phone || 'No phone on file'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#78716C]" />
            <span>Last active: {customer.lastActive}</span>
          </div>
        </div>

        {customer.notes && (
          <p className="text-xs text-[#78716C] bg-white p-3 rounded-xl border border-[#E8E3D8] italic">
            Note: "{customer.notes}"
          </p>
        )}

        {/* Quick Ledger Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleQuickAddUdhaar}
            className="py-2.5 px-3 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+ Add Udhaar</span>
          </button>
          <button
            onClick={handleQuickRecordPayment}
            className="py-2.5 px-3 rounded-xl bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#15803D] border border-[#A7F3D0] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>

        {/* WhatsApp Follow-up */}
        {customer.outstandingBalance > 0 && (
          <div className="p-3 bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                WhatsApp Payment Reminder
              </span>
              <button
                onClick={handleCopyReminder}
                className="text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                Copy Text
              </button>
            </div>
            <p className="text-xs text-[#57534E] bg-white p-2.5 rounded-xl border border-[#DCFCE7] italic">
              "Namaste {customer.name}, Rajesh Supermarket se reminder. Aapke account me ₹
              {customer.outstandingBalance.toLocaleString('en-IN')} ka payment due hai..."
            </p>
            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-2 px-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>Open in WhatsApp</span>
            </button>
          </div>
        )}

        {/* Transaction History Timeline */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2 px-1">
            Transaction Timeline ({customerTxs.length})
          </h4>
          <div className="space-y-2">
            {customerTxs.length === 0 ? (
              <p className="text-xs text-[#A8A29E] text-center py-4 bg-[#FAF8F5] rounded-xl border border-[#E8E3D8]">
                No recent transactions recorded for this customer.
              </p>
            ) : (
              customerTxs.map((tx) => {
                const isCredit = tx.type === 'udhaar';
                return (
                  <div
                    key={tx.id}
                    className="p-3 bg-white rounded-xl border border-[#E8E3D8] flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#1C1917]">{tx.description}</p>
                      <p className="text-[11px] text-[#78716C] mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        •{' '}
                        <span
                          className={`font-semibold ${
                            isCredit ? 'text-amber-800' : 'text-emerald-800'
                          }`}
                        >
                          {isCredit ? 'Udhaar Added' : 'Payment Cleared'}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-extrabold font-mono-num ${
                          isCredit ? 'text-[#1C1917]' : 'text-emerald-700'
                        }`}
                      >
                        {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </p>
                      {tx.dueDate && (
                        <p className="text-[10px] text-[#78716C]">Due: {tx.dueDate}</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
