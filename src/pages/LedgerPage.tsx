import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CustomerCard } from '../components/ledger/CustomerCard';
import { Search, Plus, Filter, Users, CheckCircle2 } from 'lucide-react';

export const LedgerPage: React.FC = () => {
  const { customers, setSelectedCustomerId, openAddTxModal } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'owes' | 'paid' | 'overdue'>('all');

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery));

    if (!matchesSearch) return false;

    if (filter === 'owes') return c.outstandingBalance > 0;
    if (filter === 'paid') return c.outstandingBalance === 0;
    if (filter === 'overdue') return c.status === 'overdue' || (c.daysOverdue && c.daysOverdue > 0);

    return true;
  });

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);

  return (
    <div className="space-y-5 pb-20 sm:pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-800" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] tracking-tight">
              Customer Ledger & Khata
            </h1>
          </div>
          <p className="text-xs text-[#78716C] mt-0.5">
            Total outstanding across all store accounts:{' '}
            <strong className="text-[#1C1917] font-mono-num font-bold">
              ₹{totalOutstanding.toLocaleString('en-IN')}
            </strong>
          </p>
        </div>

        <button
          onClick={openAddTxModal}
          className="self-start sm:self-auto py-2.5 px-4 bg-[#1C1917] hover:bg-[#292524] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>+ Add Customer / Udhaar</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers (e.g. Sharma ji, Ramesh)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5CEC1] rounded-xl text-sm text-[#1C1917] placeholder:text-[#8F887F] focus:border-[#1C1917] outline-none shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#F2EFE8] p-1 rounded-xl shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-white text-[#1C1917] shadow-2xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setFilter('owes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'owes'
                ? 'bg-white text-[#1C1917] shadow-2xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Owes Me
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'overdue'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'text-rose-700 hover:text-rose-900'
            }`}
          >
            Overdue
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'paid'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Paid
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-2.5">
        {filteredCustomers.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-[#E8E3D8] text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] flex items-center justify-center mx-auto text-[#78716C]">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="text-base font-bold text-[#1C1917]">No customers found</h4>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto">
              {filter === 'overdue'
                ? 'No overdue payments! All accounts are currently up to date.'
                : 'Try adjusting your search or add a new transaction.'}
            </p>
          </div>
        ) : (
          filteredCustomers.map((c) => (
            <CustomerCard
              key={c.id}
              customer={c}
              onClick={() => setSelectedCustomerId(c.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
