import React from 'react';
import { useStore, ActiveTab } from '../../context/StoreContext';
import {
  Home,
  Users,
  CalendarCheck,
  Bell,
  TrendingUp,
  Sparkles,
  History,
  Settings,
  Plus,
  Wifi,
  WifiOff,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, openAddTxModal, storeProfile } = useStore();

  const menuItems: Array<{ tab: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }> = [
    { tab: 'home', label: 'Command Center', icon: Home },
    { tab: 'ledger', label: 'Customer Ledger', icon: Users },
    { tab: 'receivables', label: 'Money Expected', icon: CalendarCheck, badge: '₹38.5k' },
    { tab: 'reminders', label: 'Follow-ups', icon: Bell, badge: '5' },
    { tab: 'cashflow', label: 'Cash Flow', icon: TrendingUp },
    { tab: 'insights', label: 'Expenso Insights', icon: Sparkles, badge: 'AI' },
    { tab: 'activity', label: 'Activity Feed', icon: History },
    { tab: 'settings', label: 'Store Profile', icon: Settings },
  ];

  return (
    <aside className="hidden sm:flex flex-col w-64 bg-[#F2EFE8] border-r border-[#E2DDD2] h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1C1917] flex items-center justify-center text-[#F8F6F0] font-bold text-lg tracking-wider shadow-sm">
            E
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#1C1917] tracking-tight leading-tight">EXPENSO</h1>
            <p className="text-[11px] font-medium text-[#78716C] leading-none">Your Store's Copilot</p>
          </div>
        </div>

        {/* Sync status tag */}
        <div className="mt-4 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/70 border border-[#E5E0D4] text-[11px] text-[#57534E]">
          {storeProfile.isLiveWebhookEnabled && storeProfile.viasocketWebhookUrl ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-medium text-emerald-800 truncate">ViaSocket Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="font-medium text-amber-800">Demo Munim Mode</span>
            </>
          )}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="px-4 mb-3">
        <button
          onClick={openAddTxModal}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1C1917] text-[#F8F6F0] font-semibold text-sm hover:bg-[#292524] active:scale-[0.98] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.tab;
          const Icon = item.icon;

          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white text-[#1C1917] shadow-xs font-semibold border border-[#E5E0D4]'
                  : 'text-[#57534E] hover:bg-[#EAE6DD] hover:text-[#1C1917]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#15803D]' : 'text-[#78716C]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                    isActive
                      ? 'bg-[#ECFDF5] text-[#15803D]'
                      : 'bg-[#E5E0D4] text-[#57534E]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Store Footer */}
      <div className="p-4 border-t border-[#E2DDD2] bg-white/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#15803D]/15 text-[#15803D] font-bold text-xs flex items-center justify-center shrink-0">
            {storeProfile.ownerName.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-[#1C1917] truncate">{storeProfile.storeName}</p>
            <p className="text-[11px] text-[#78716C] truncate">{storeProfile.ownerName}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
