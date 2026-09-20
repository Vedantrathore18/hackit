import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { InsightCard } from '../components/insights/InsightCard';
import { Sparkles, Filter } from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const { insights } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredInsights = insights.filter((ins) => {
    if (selectedCategory === 'all') return true;
    return ins.category === selectedCategory;
  });

  return (
    <div className="space-y-5 pb-20 sm:pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-800" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] tracking-tight">
            Expenso AI Insights
          </h1>
        </div>
        <p className="text-xs text-[#78716C] mt-0.5">
          Actionable store intelligence synthesized from your daily sales, credit patterns, and supplier terms
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 bg-[#F2EFE8] p-1 rounded-xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            selectedCategory === 'all'
              ? 'bg-white text-[#1C1917] shadow-2xs'
              : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          All Recommendations ({insights.length})
        </button>
        <button
          onClick={() => setSelectedCategory('collection')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            selectedCategory === 'collection'
              ? 'bg-rose-700 text-white shadow-2xs'
              : 'text-rose-700 hover:text-rose-900'
          }`}
        >
          Collections
        </button>
        <button
          onClick={() => setSelectedCategory('cashflow')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            selectedCategory === 'cashflow'
              ? 'bg-white text-emerald-800 shadow-2xs'
              : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          Cash Flow
        </button>
        <button
          onClick={() => setSelectedCategory('attention')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            selectedCategory === 'attention'
              ? 'bg-amber-700 text-white shadow-2xs'
              : 'text-amber-800 hover:text-amber-900'
          }`}
        >
          Attention
        </button>
        <button
          onClick={() => setSelectedCategory('business_pattern')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            selectedCategory === 'business_pattern'
              ? 'bg-white text-[#1C1917] shadow-2xs'
              : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          Patterns
        </button>
      </div>

      {/* Insight List */}
      <div className="space-y-3.5">
        {filteredInsights.map((item) => (
          <InsightCard key={item.id} insight={item} />
        ))}
      </div>
    </div>
  );
};
