import React from 'react';
import { Customer } from '../../types';
import { ChevronRight, Phone, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CustomerCardProps {
  customer: Customer;
  onClick: () => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick }) => {
  const isOverdue = customer.status === 'overdue' || (customer.daysOverdue && customer.daysOverdue > 0);
  const isPaid = customer.outstandingBalance === 0;

  return (
    <div
      onClick={onClick}
      className="p-4 bg-white hover:bg-[#FAF8F5] rounded-2xl border border-[#E8E3D8] hover:border-[#D5CEC1] shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99]"
    >
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
            customer.avatarBg || 'bg-[#F2EFE8] text-[#57534E]'
          }`}
        >
          {customer.name.charAt(0)}
        </div>

        <div className="overflow-hidden">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-[#1C1917] truncate group-hover:text-emerald-950">
              {customer.name}
            </h4>
            {customer.reliability && (
              <span className="hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#F2EFE8] text-[#78716C]">
                {customer.reliability}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#78716C]">
            {customer.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#A8A29E]" />
                <span className="hidden sm:inline">{customer.phone}</span>
              </span>
            )}

            {/* Status indicator */}
            {isOverdue ? (
              <span className="flex items-center gap-1 text-rose-700 font-semibold">
                <AlertTriangle className="w-3 h-3" />
                <span>{customer.daysOverdue || 5} days late</span>
              </span>
            ) : isPaid ? (
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Account Cleared</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <Clock className="w-3 h-3" />
                <span>Due in 7 days</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Balance & Chevron */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p
            className={`text-base font-extrabold font-mono-num ${
              isPaid
                ? 'text-emerald-700'
                : isOverdue
                ? 'text-rose-700'
                : 'text-[#1C1917]'
            }`}
          >
            ₹{customer.outstandingBalance.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] font-medium text-[#78716C]">
            {isPaid ? 'Paid' : 'Owes you'}
          </p>
        </div>

        <ChevronRight className="w-4 h-4 text-[#C4BDAF] group-hover:text-[#1C1917] group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};
