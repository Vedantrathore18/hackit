import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { Sparkles, Mic, CalendarCheck, TrendingUp, Check, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { storeProfile, updateStoreProfile } = useStore();
  const [step, setStep] = useState(1);

  const [storeName, setStoreName] = useState(storeProfile.storeName || 'Rajesh Supermarket');
  const [ownerName, setOwnerName] = useState(storeProfile.ownerName || 'Rajesh Kumar');
  const [phone, setPhone] = useState(storeProfile.phone || '+91 98765 43210');
  const [language, setLanguage] = useState(storeProfile.preferredLanguage || 'hinglish');

  if (!isOpen) return null;

  const handleFinishSetup = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreProfile({
      storeName,
      ownerName,
      phone,
      preferredLanguage: language as any,
      isOnboarded: true,
    });
    onComplete();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} maxWidth="md">
      <div className="py-2">
        {/* Step 1: Meet Expenso */}
        {step === 1 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#1C1917] text-[#F8F6F0] flex items-center justify-center font-black text-2xl mx-auto shadow-md">
              E
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                VyaparPulse Smart Supermarket Ledger
              </span>
              <h2 className="text-2xl font-extrabold text-[#1C1917] mt-2">Meet Expenso</h2>
              <p className="text-sm text-[#57534E] max-w-xs mx-auto mt-1">
                Your store's smart digital munim. Turn messy notebooks, WhatsApp receipts, and voice notes into an automatic financial copilot.
              </p>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 px-6 bg-[#1C1917] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#292524] transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Just Speak */}
        {step === 2 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#ECFDF5] text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
              <Mic className="w-8 h-8 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#1C1917]">Just speak.</h2>
              <p className="text-sm text-[#57534E] max-w-xs mx-auto mt-1">
                Tell Expenso what happened in everyday Hindi, Hinglish, or English.
              </p>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8E3D8] text-xs text-[#57534E] italic max-w-xs mx-auto">
              "Sharma ji ne 2400 rupaye ka saman liya hai, 7 din baad denge"
            </div>

            <div className="pt-4 flex items-center gap-2">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 bg-[#F2EFE8] text-[#1C1917] rounded-xl font-semibold text-xs"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 px-6 bg-[#1C1917] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#292524] transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Know what's coming */}
        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
              <CalendarCheck className="w-8 h-8 text-amber-700" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#1C1917]">Know what's coming.</h2>
              <p className="text-sm text-[#57534E] max-w-xs mx-auto mt-1">
                Never wonder who owes you money or when you'll receive it. Instant 7-day collections schedule & polite 1-click WhatsApp reminders.
              </p>
            </div>

            <div className="pt-4 flex items-center gap-2">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-4 bg-[#F2EFE8] text-[#1C1917] rounded-xl font-semibold text-xs"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-3 px-6 bg-[#1C1917] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#292524] transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Quick Store Setup */}
        {step === 4 && (
          <form onSubmit={handleFinishSetup} className="space-y-4 text-left">
            <div className="text-center pb-2">
              <h2 className="text-xl font-extrabold text-[#1C1917]">Set up your store</h2>
              <p className="text-xs text-[#78716C]">Customize your store copilot in 10 seconds</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CEC1] rounded-xl text-sm font-semibold text-[#1C1917] focus:bg-white focus:border-[#1C1917] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Owner Name</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CEC1] rounded-xl text-sm font-semibold text-[#1C1917] focus:bg-white focus:border-[#1C1917] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Preferred Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CEC1] rounded-xl text-sm font-semibold text-[#1C1917] focus:bg-white focus:border-[#1C1917] outline-none"
              >
                <option value="hinglish">Hinglish</option>
                <option value="hindi">Hindi (हिंदी)</option>
                <option value="english">English</option>
              </select>
            </div>

            <div className="pt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-3 px-4 bg-[#F2EFE8] text-[#1C1917] rounded-xl font-semibold text-xs"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-6 bg-[#1C1917] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#292524] shadow-sm transition-all"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Launch Expenso</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
