import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { History, Mic, Camera, FileText, CheckCircle2, ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react';

export const ActivityPage: React.FC = () => {
  const { transactions } = useStore();
  const [filter, setFilter] = useState<string>('all');

  const filtered = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'voice':
        return (
          <span title="Recorded via Voice">
            <Mic className="w-3.5 h-3.5 text-emerald-700" />
          </span>
        );
      case 'image':
        return (
          <span title="Scanned from Ledger Photo">
            <Camera className="w-3.5 h-3.5 text-purple-700" />
          </span>
        );
      default:
        return (
          <span title="Text / Manual entry">
            <FileText className="w-3.5 h-3.5 text-[#78716C]" />
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 pb-20 sm:pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-800" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] tracking-tight">
            Store Activity & Audit Feed
          </h1>
        </div>
        <p className="text-xs text-[#78716C] mt-0.5">
          Chronological record of voice inputs, bill scans, counter payments, and udhaar entries
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-[#F2EFE8] p-1 rounded-xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-white text-[#1C1917] shadow-2xs'
              : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          All Activity ({transactions.length})
        </button>
        <button
          onClick={() => setFilter('udhaar')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'udhaar'
              ? 'bg-amber-700 text-white shadow-2xs'
              : 'text-amber-800 hover:text-amber-900'
          }`}
        >
          Udhaar
        </button>
        <button
          onClick={() => setFilter('payment_received')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'payment_received'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'text-emerald-800 hover:text-emerald-900'
          }`}
        >
          Payments Received
        </button>
        <button
          onClick={() => setFilter('supplier_payment')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'supplier_payment'
              ? 'bg-[#1C1917] text-white shadow-2xs'
              : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          Supplier
        </button>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-3xl border border-[#E8E3D8] divide-y divide-[#F2EFE8] overflow-hidden shadow-2xs">
        {filtered.map((tx) => {
          const isUdhaar = tx.type === 'udhaar';
          const isPayment = tx.type === 'payment_received';
          const isSupplier = tx.type === 'supplier_payment';

          return (
            <div
              key={tx.id}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isUdhaar
                      ? 'bg-amber-50 text-amber-800'
                      : isPayment
                      ? 'bg-emerald-50 text-emerald-800'
                      : isSupplier
                      ? 'bg-purple-50 text-purple-800'
                      : 'bg-[#F2EFE8] text-[#57534E]'
                  }`}
                >
                  {isUdhaar ? (
                    <Plus className="w-4 h-4" />
                  ) : isPayment ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>

                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1C1917] truncate">{tx.customerName}</p>
                    <span className="p-1 rounded-md bg-[#F2EFE8]">
                      {getChannelIcon(tx.channel)}
                    </span>
                  </div>

                  <p className="text-xs text-[#57534E] truncate mt-0.5">{tx.description}</p>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[#78716C]">
                    <span>
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                      ,{' '}
                      {new Date(tx.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {tx.dueDate && (
                      <>
                        <span>•</span>
                        <span className="text-amber-800 font-medium">Due: {tx.dueDate}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 pl-3">
                <p
                  className={`text-base sm:text-lg font-extrabold font-mono-num ${
                    isPayment ? 'text-emerald-700' : 'text-[#1C1917]'
                  }`}
                >
                  {isPayment ? '+' : ''}₹{tx.amount.toLocaleString('en-IN')}
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span className="text-[10px] font-semibold text-emerald-700">
                    {tx.syncStatus === 'synced' ? 'Synced' : 'Queued'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
