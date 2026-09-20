import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Mic, Camera, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { parseNaturalLanguageInput } from '../../services/nlpParser';

export const HeroInput: React.FC = () => {
  const {
    openVoiceModal,
    openImageUpload,
    openAddTxModal,
    setCandidateForConfirmation,
    setActiveTab,
  } = useStore();

  const [inputVal, setInputVal] = useState('');

  const suggestions = [
    { text: 'Sharma ji took ₹2,400 groceries on 7 days credit', type: 'udhaar' },
    { text: 'Sharma ji paid ₹1,200', type: 'payment' },
    { text: 'Added ₹3,500 udhaar to Ramesh', type: 'udhaar' },
    { text: 'Paid supplier Gupta provisions ₹12,000', type: 'supplier' },
    { text: "Show today's cash flow", type: 'nav', tab: 'cashflow' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    if (inputVal.toLowerCase().includes('cash flow')) {
      setActiveTab('cashflow');
      setInputVal('');
      return;
    }

    const candidate = parseNaturalLanguageInput(inputVal);
    setCandidateForConfirmation(candidate, 'text', inputVal);
    setInputVal('');
  };

  const handleApplySuggestion = (s: typeof suggestions[0]) => {
    if (s.tab) {
      setActiveTab(s.tab as any);
      return;
    }
    const candidate = parseNaturalLanguageInput(s.text);
    setCandidateForConfirmation(candidate, 'text', s.text);
  };

  return (
    <div className="w-full">
      {/* Title / Prompt */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#57534E]">
            Smart Digital Munim
          </span>
        </div>
        <span className="text-[11px] text-[#78716C]">Hindi • Hinglish • English</span>
      </div>

      {/* Main Hero Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl sm:rounded-3xl border-2 border-[#D5CEC1] hover:border-[#1C1917] focus-within:border-[#1C1917] shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all overflow-hidden p-2 sm:p-2.5 flex flex-col gap-2"
      >
        <div className="flex items-center gap-2 px-2">
          {/* Quick Manual Add Plus */}
          <button
            type="button"
            onClick={openAddTxModal}
            className="w-8 h-8 rounded-xl bg-[#F2EFE8] hover:bg-[#E5E0D4] text-[#1C1917] flex items-center justify-center shrink-0 transition-colors"
            title="Manual transaction form"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Text input */}
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="e.g. Sharma ji ne ₹2,400 ka saman liya, 7 din baad denge..."
            className="w-full py-2.5 text-sm sm:text-base text-[#1C1917] placeholder:text-[#A8A29E] bg-transparent outline-none"
          />

          {/* Action buttons inside bar */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* If user typed something, show submit arrow */}
            {inputVal.trim() ? (
              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-[#1C1917] text-[#F8F6F0] flex items-center justify-center hover:bg-[#292524] transition-all shadow-sm"
                title="Process transaction"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={openVoiceModal}
                  className="px-3 py-2 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-white flex items-center gap-1.5 transition-all shadow-xs group"
                  title="Speak transaction"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
                  <Mic className="w-4 h-4 text-white" />
                  <span className="text-xs font-semibold hidden sm:inline">Mic</span>
                </button>

                {/* Photo / Ledger Upload Button */}
                <button
                  type="button"
                  onClick={openImageUpload}
                  className="p-2.5 rounded-xl bg-[#F2EFE8] hover:bg-[#E5E0D4] text-[#1C1917] transition-all"
                  title="Upload ledger photo or bill"
                >
                  <Camera className="w-4 h-4 text-[#57534E]" />
                </button>
              </>
            )}
          </div>
        </div>
      </form>

      {/* Suggested Quick Chips */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-[#78716C] font-medium shrink-0 text-[11px]">Try saying:</span>
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => handleApplySuggestion(s)}
            className="px-2.5 py-1 rounded-lg bg-white border border-[#E2DDD2] hover:border-[#BDB5A4] hover:bg-[#FAF8F5] text-[#57534E] text-[11px] whitespace-nowrap transition-colors"
          >
            "{s.text}"
          </button>
        ))}
      </div>
    </div>
  );
};
