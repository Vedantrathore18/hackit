import React from 'react';
import { useStore, ActiveTab } from '../../context/StoreContext';
import { Home, Users, Plus, Sparkles, Menu } from 'lucide-react';

interface BottomNavProps {
  onOpenMoreMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMoreMenu }) => {
  const { activeTab, setActiveTab, openAddTxModal } = useStore();

  const navItems: Array<{ tab?: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; isAction?: boolean }> = [
    { tab: 'home', label: 'Home', icon: Home },
    { tab: 'ledger', label: 'Ledger', icon: Users },
    { isAction: true, label: 'Add', icon: Plus },
    { tab: 'insights', label: 'Insights', icon: Sparkles },
    { label: 'More', icon: Menu, isAction: false },
  ];

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#F8F6F0]/95 backdrop-blur-md border-t border-[#E8E3D8] px-3 py-1.5 sm:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item, idx) => {
          if (item.isAction) {
            return (
              <div key={idx} className="relative -top-3">
                <button
                  onClick={openAddTxModal}
                  aria-label="Record new transaction"
                  className="w-13 h-13 rounded-full bg-[#1C1917] text-[#F8F6F0] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all border-2 border-[#F8F6F0]"
                >
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>
            );
          }

          if (item.label === 'More') {
            const isMoreTab = ['receivables', 'reminders', 'cashflow', 'activity', 'settings'].includes(activeTab);
            return (
              <button
                key={idx}
                onClick={onOpenMoreMenu}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
                  isMoreTab ? 'text-[#15803D]' : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <item.icon className="w-5 h-5 stroke-[2]" />
                <span className="text-[10px] font-semibold mt-1">More</span>
              </button>
            );
          }

          const isActive = activeTab === item.tab;
          const Icon = item.icon;

          return (
            <button
              key={idx}
              onClick={() => item.tab && setActiveTab(item.tab)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
                isActive ? 'text-[#15803D]' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2]" />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
