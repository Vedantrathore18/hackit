import React from 'react';
import { Insight } from '../../types';
import { useStore } from '../../context/StoreContext';
import { ArrowRight, Sparkles, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

interface InsightCardProps {
  insight: Insight;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const { setActiveTab } = useStore();

  const handleAction = () => {
    setActiveTab(insight.actionTarget as any);
  };

  const getIcon = () => {
    switch (insight.category) {
      case 'cashflow':
        return <DollarSign className="w-4 h-4 text-emerald-700" />;
      case 'collection':
        return <AlertTriangle className="w-4 h-4 text-rose-700" />;
      case 'attention':
        return <AlertTriangle className="w-4 h-4 text-amber-700" />;
      case 'business_pattern':
        return <TrendingUp className="w-4 h-4 text-purple-700" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-700" />;
    }
  };

  const getBorderColor = () => {
    switch (insight.badgeType) {
      case 'emerald':
        return 'border-[#A7F3D0] bg-[#F0FDF4]/60';
      case 'rose':
        return 'border-[#FECDD3] bg-[#FFF1F2]/60';
      case 'amber':
        return 'border-[#FDE68A] bg-[#FFFBEB]/60';
      default:
        return 'border-[#E8E3D8] bg-white';
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border ${getBorderColor()} shadow-xs space-y-3`}>
      {/* Top Tag & Time */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#1C1917]">
          {getIcon()}
          <span>{insight.badge}</span>
        </span>
        <span className="text-[11px] text-[#78716C]">{insight.createdAt}</span>
      </div>

      {/* Headline */}
      <h3 className="text-base font-bold text-[#1C1917]">{insight.headline}</h3>

      {/* WHAT / WHY / ACTION Structured Munim Format */}
      <div className="space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <span className="font-extrabold uppercase text-[#78716C] shrink-0 w-12">WHAT:</span>
          <p className="font-semibold text-[#1C1917]">{insight.what}</p>
        </div>

        <div className="flex items-start gap-2">
          <span className="font-extrabold uppercase text-[#78716C] shrink-0 w-12">WHY:</span>
          <p className="text-[#57534E]">{insight.why}</p>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 border-t border-black/5 flex justify-end">
        <button
          onClick={handleAction}
          className="py-2 px-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#F8F6F0] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs group"
        >
          <span>{insight.actionText}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
