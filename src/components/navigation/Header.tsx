import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, Mic, Camera, RefreshCw } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    storeProfile,
    openCommandBar,
    openVoiceModal,
    openImageUpload,
    resetToDemoData,
  } = useStore();

  return (
    <header className="sticky top-0 z-30 bg-[#F8F6F0]/90 backdrop-blur-md border-b border-[#E8E3D8] px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* Greeting & Date */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-[#1C1917] tracking-tight">
            Good morning, {storeProfile.ownerName.split(' ')[0]} 👋
          </h2>
          <span className="hidden md:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0]">
            Store Open
          </span>
        </div>
        <p className="text-xs text-[#78716C]">
          Monday, 20 September • <span className="font-medium text-[#57534E]">{storeProfile.storeName}</span>
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Command Bar Button */}
        <button
          onClick={openCommandBar}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#DCD6C9] text-xs text-[#78716C] hover:text-[#1C1917] hover:border-[#BDB5A4] transition-all shadow-2xs"
          title="Search or Ask Expenso (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask Expenso...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#F2EFE8] text-[#78716C] rounded border border-[#D5CEC1]">
            ⌘K
          </kbd>
        </button>

        {/* Quick Voice Trigger */}
        <button
          onClick={openVoiceModal}
          aria-label="Voice input"
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#1C1917] text-[#F8F6F0] text-xs font-semibold hover:bg-[#292524] transition-all flex items-center gap-1.5 shadow-2xs"
          title="Speak transaction"
        >
          <Mic className="w-4 h-4 text-emerald-400" />
          <span className="hidden md:inline">Speak</span>
        </button>

        {/* Quick Ledger Photo Upload */}
        <button
          onClick={openImageUpload}
          aria-label="Upload ledger photo"
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-[#DCD6C9] text-xs font-semibold text-[#1C1917] hover:bg-[#F2EFE8] transition-all flex items-center gap-1.5 shadow-2xs"
          title="Scan ledger page or bill"
        >
          <Camera className="w-4 h-4 text-[#78716C]" />
          <span className="hidden md:inline">Scan Bill</span>
        </button>

        {/* Reset Demo Data button (for quick hackathon testing) */}
        <button
          onClick={resetToDemoData}
          className="p-2 rounded-xl text-[#78716C] hover:text-[#1C1917] hover:bg-[#EAE6DD] transition-all"
          title="Reset demo data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
