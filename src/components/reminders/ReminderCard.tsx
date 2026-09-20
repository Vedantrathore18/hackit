import React, { useState } from 'react';
import { Reminder } from '../../types';
import { useStore } from '../../context/StoreContext';
import { MessageSquare, Copy, Check, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface ReminderCardProps {
  reminder: Reminder;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({ reminder }) => {
  const { markReminderPaid, showToast, storeProfile } = useStore();
  const [langTab, setLangTab] = useState<'hinglish' | 'hindi' | 'english'>(
    storeProfile.preferredLanguage || 'hinglish'
  );
  const [copied, setCopied] = useState(false);

  const isOverdue = reminder.status === 'overdue' || reminder.daysDiff < 0;
  const isDueToday = reminder.status === 'due_today' || reminder.daysDiff === 0;

  const currentMessage =
    langTab === 'hindi'
      ? reminder.suggestedMessageHi
      : langTab === 'english'
      ? reminder.suggestedMessageEn
      : reminder.suggestedMessageHinglish;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    showToast('Reminder copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = reminder.phone ? reminder.phone.replace(/[^0-9]/g, '') : '';
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(currentMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(currentMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E8E3D8] shadow-xs space-y-3.5">
      {/* Top Header: Customer & Amount */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#1C1917]">{reminder.customerName}</h3>
            {isOverdue ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                <AlertTriangle className="w-3 h-3" />
                {Math.abs(reminder.daysDiff)} days overdue
              </span>
            ) : isDueToday ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Clock className="w-3 h-3" />
                Due Today
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Clock className="w-3 h-3" />
                Due in {reminder.daysDiff} days
              </span>
            )}
          </div>
          <p className="text-xs text-[#78716C] mt-0.5">
            Due Date: {reminder.dueDate} • Phone: {reminder.phone || 'Local'}
          </p>
        </div>

        <div className="text-right">
          <p
            className={`text-lg sm:text-xl font-extrabold font-mono-num ${
              isOverdue ? 'text-rose-700' : 'text-[#1C1917]'
            }`}
          >
            ₹{reminder.amount.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#78716C]">Pending Udhaar</p>
        </div>
      </div>

      {/* WhatsApp Message Preview Box */}
      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E3D8] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#57534E]">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
            <span>Suggested Munim Message</span>
          </div>

          {/* Language selector chips */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLangTab('hinglish')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                langTab === 'hinglish' ? 'bg-[#1C1917] text-white' : 'bg-[#F2EFE8] text-[#78716C]'
              }`}
            >
              Hinglish
            </button>
            <button
              onClick={() => setLangTab('hindi')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                langTab === 'hindi' ? 'bg-[#1C1917] text-white' : 'bg-[#F2EFE8] text-[#78716C]'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLangTab('english')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                langTab === 'english' ? 'bg-[#1C1917] text-white' : 'bg-[#F2EFE8] text-[#78716C]'
              }`}
            >
              English
            </button>
          </div>
        </div>

        <p className="text-xs text-[#292524] bg-white p-2.5 rounded-lg border border-[#E8E3D8] italic leading-relaxed">
          "{currentMessage}"
        </p>
      </div>

      {/* Action Row */}
      <div className="flex items-center gap-2 pt-1 flex-wrap">
        {/* WhatsApp Direct */}
        <button
          onClick={handleOpenWhatsApp}
          className="flex-1 min-w-[140px] py-2.5 px-3 bg-[#15803D] hover:bg-[#166534] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Send via WhatsApp</span>
        </button>

        {/* Copy Message */}
        <button
          onClick={handleCopy}
          className="py-2.5 px-3 bg-[#F2EFE8] hover:bg-[#E5E0D4] text-[#1C1917] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          title="Copy message to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {/* Mark as Paid */}
        <button
          onClick={() => markReminderPaid(reminder.id)}
          className="py-2.5 px-3 bg-white border border-[#D5CEC1] hover:bg-[#FAF8F5] text-[#57534E] hover:text-[#1C1917] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Mark as Paid</span>
        </button>
      </div>
    </div>
  );
};
