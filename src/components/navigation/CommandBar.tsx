import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, Sparkles, ArrowRight, X, Users, AlertTriangle, TrendingUp, Mic } from 'lucide-react';
import { parseNaturalLanguageInput } from '../../services/nlpParser';

export const CommandBar: React.FC = () => {
  const {
    isCommandBarOpen,
    closeCommandBar,
    customers,
    cashFlow,
    setActiveTab,
    setSelectedCustomerId,
    setCandidateForConfirmation,
    openVoiceModal,
  } = useStore();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener: Cmd+K, Ctrl+K, or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isCommandBarOpen) closeCommandBar();
        else {
          setQuery('');
          // open
          // Since useStore is in context, we trigger via custom event or store method
        }
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandBarOpen, closeCommandBar]);

  if (!isCommandBarOpen) return null;

  const quickQuestions = [
    {
      q: 'Who owes me the most?',
      desc: 'Ramesh Kumar owes ₹5,800 (12 days overdue)',
      action: () => {
        setActiveTab('ledger');
        setSelectedCustomerId('cust-ramesh');
        closeCommandBar();
      },
      icon: Users,
    },
    {
      q: 'How much should I collect this week?',
      desc: `₹${cashFlow.expectedNext7Days.toLocaleString('en-IN')} expected from customers`,
      action: () => {
        setActiveTab('receivables');
        closeCommandBar();
      },
      icon: TrendingUp,
    },
    {
      q: 'Show overdue customers',
      desc: `₹${cashFlow.overdueTotal.toLocaleString('en-IN')} stuck across 3 accounts`,
      action: () => {
        setActiveTab('reminders');
        closeCommandBar();
      },
      icon: AlertTriangle,
    },
    {
      q: 'Record transaction with voice',
      desc: 'Speak naturally in Hindi, Hinglish, or English',
      action: () => {
        closeCommandBar();
        openVoiceModal();
      },
      icon: Mic,
    },
  ];

  // Filtered customers matching query
  const matchingCustomers = query.trim()
    ? customers.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleExecuteNaturalLanguage = () => {
    if (!query.trim()) return;
    const candidate = parseNaturalLanguageInput(query);
    setCandidateForConfirmation(candidate, 'text', query);
    closeCommandBar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1C1917]/50 backdrop-blur-xs transition-opacity"
        onClick={closeCommandBar}
      />

      {/* Command Box */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-[#D5CEC1] shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E8E3D8]">
          <Search className="w-5 h-5 text-[#78716C] mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleExecuteNaturalLanguage();
            }}
            autoFocus
            placeholder="Ask Expenso anything or record transaction... (e.g. Sharma ji gave ₹1,200)"
            className="w-full text-sm sm:text-base text-[#1C1917] placeholder:text-[#8F887F] outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#78716C] hover:text-[#1C1917] mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#F2EFE8] text-[#78716C] rounded border border-[#D5CEC1]">
            ESC
          </kbd>
        </div>

        {/* Dynamic content */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-3">
          {/* If user typed something, show Parse Action */}
          {query.trim().length > 3 && (
            <div className="p-2.5 rounded-xl bg-[#F8F6F0] border border-[#E5E0D4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-medium text-[#1C1917]">
                  Parse as transaction: <strong className="font-semibold">"{query}"</strong>
                </span>
              </div>
              <button
                onClick={handleExecuteNaturalLanguage}
                className="text-xs font-bold px-3 py-1 bg-[#1C1917] text-white rounded-lg hover:bg-[#292524] flex items-center gap-1"
              >
                <span>Record</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Matching Customers */}
          {matchingCustomers.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider px-2 mb-1.5">
                Customers Found
              </p>
              <div className="space-y-1">
                {matchingCustomers.map((cust) => (
                  <button
                    key={cust.id}
                    onClick={() => {
                      setActiveTab('ledger');
                      setSelectedCustomerId(cust.id);
                      closeCommandBar();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F2EFE8] flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#1C1917]">{cust.name}</p>
                      <p className="text-xs text-[#78716C]">{cust.phone || 'Local account'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold font-mono-num text-[#1C1917]">
                        ₹{cust.outstandingBalance.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[11px] text-[#78716C]">
                        {cust.outstandingBalance > 0 ? 'Udhaar' : 'Cleared'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Questions */}
          <div>
            <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider px-2 mb-1.5">
              Quick Inquiries
            </p>
            <div className="space-y-1">
              {quickQuestions.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#F2EFE8] flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#EFECE4] group-hover:bg-white flex items-center justify-center text-[#57534E] shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-[#1C1917] group-hover:text-emerald-800">
                          {item.q}
                        </p>
                        <p className="text-[11px] text-[#78716C]">{item.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#1C1917] transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
