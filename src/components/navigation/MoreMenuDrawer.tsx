import React from 'react';
import { useStore, ActiveTab } from '../../context/StoreContext';
import { BottomSheet } from '../common/BottomSheet';
import {
  CalendarCheck,
  Bell,
  TrendingUp,
  History,
  Settings,
  HelpCircle,
  ChevronRight,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface MoreMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOnboarding: () => void;
}

export const MoreMenuDrawer: React.FC<MoreMenuDrawerProps> = ({
  isOpen,
  onClose,
  onOpenOnboarding,
}) => {
  const { setActiveTab, storeProfile } = useStore();

  const handleNavigate = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  const moreItems: Array<{ tab: ActiveTab; label: string; desc: string; icon: React.ComponentType<{ className?: string }>; badge?: string }> = [
    {
      tab: 'receivables',
      label: 'Money Expected',
      desc: '7-day collection schedule & overdue recovery',
      icon: CalendarCheck,
      badge: '₹38.5k',
    },
    {
      tab: 'reminders',
      label: 'Today’s Follow-ups',
      desc: 'WhatsApp payment reminders in Hinglish',
      icon: Bell,
      badge: '5 Dues',
    },
    {
      tab: 'cashflow',
      label: 'Cash Flow & Forecast',
      desc: 'Daily counter inflow vs wholesaler supplier dues',
      icon: TrendingUp,
    },
    {
      tab: 'activity',
      label: 'Activity Feed',
      desc: 'Full chronological ledger of voice, scans & edits',
      icon: History,
    },
    {
      tab: 'settings',
      label: 'Store Profile & ViaSocket',
      desc: 'Store info, reminder language, webhook endpoint',
      icon: Settings,
    },
  ];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#1C1917] text-white flex items-center justify-center font-bold text-xs">
            E
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1C1917]">{storeProfile.storeName}</h3>
            <p className="text-xs text-[#78716C]">More Store Tools</p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Status tag */}
        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E3D8] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            {storeProfile.isLiveWebhookEnabled && storeProfile.viasocketWebhookUrl ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-emerald-800">ViaSocket Webhook Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-amber-800">Smart Digital Munim (Demo Mode)</span>
              </>
            )}
          </div>
          <button
            onClick={() => handleNavigate('settings')}
            className="text-[11px] font-bold text-[#1C1917] underline"
          >
            Configure
          </button>
        </div>

        {/* Menu Items */}
        <div className="space-y-1.5">
          {moreItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.tab}
                onClick={() => handleNavigate(item.tab)}
                className="w-full text-left p-3 rounded-2xl hover:bg-[#FAF8F5] border border-transparent hover:border-[#E8E3D8] flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F2EFE8] group-hover:bg-white flex items-center justify-center text-[#1C1917] shrink-0">
                    <Icon className="w-5 h-5 text-[#57534E]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#1C1917]">{item.label}</p>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#ECFDF5] text-[#15803D]">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#78716C]">{item.desc}</p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#C4BDAF] group-hover:text-[#1C1917] transition-transform group-hover:translate-x-0.5" />
              </button>
            );
          })}
        </div>

        {/* Tour restart */}
        <div className="pt-2 border-t border-[#F2EFE8]">
          <button
            onClick={() => {
              onClose();
              onOpenOnboarding();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] text-[#57534E] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#F2EFE8] transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Show Product Tour / Onboarding</span>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};
