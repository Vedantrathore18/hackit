import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';

export const CashFlowChart: React.FC = () => {
  const { cashFlow } = useStore();
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');
  const [hoveredDay, setHoveredDay] = useState<{ day: string; date: string; inflow: number; outflow: number; expectedInflow: number } | null>(null);

  const days = cashFlow.chartDays;
  const maxVal = Math.max(...days.map((d) => Math.max(d.inflow, d.outflow, d.expectedInflow, 60000)));

  return (
    <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#E8E3D8] shadow-xs space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#57534E]">
            Daily Cash Flow & Projections
          </h3>
          <p className="text-xs text-[#78716C] mt-0.5">
            Compare actual counter collections vs scheduled customer receivables
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
            <span className="text-[#57534E] font-medium">Inflow (Cash/UPI)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-600" />
            <span className="text-[#57534E] font-medium">Outflow (Supplier)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            <span className="text-[#57534E] font-medium">Expected Udhaar</span>
          </div>
        </div>
      </div>

      {/* Hover Info Tooltip */}
      <div className="h-6 flex items-center text-xs">
        {hoveredDay ? (
          <span className="font-semibold text-[#1C1917]">
            {hoveredDay.day} ({hoveredDay.date}): Inflow ₹{hoveredDay.inflow.toLocaleString('en-IN')} | Outflow ₹{hoveredDay.outflow.toLocaleString('en-IN')} | Expected Inflow ₹{hoveredDay.expectedInflow.toLocaleString('en-IN')}
          </span>
        ) : (
          <span className="text-[#A8A29E]">Hover over bars to inspect daily breakdown</span>
        )}
      </div>

      {/* SVG Bar Visualization */}
      <div className="pt-2">
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 sm:gap-2 items-end h-48 border-b border-[#E8E3D8] pb-2">
          {days.map((item, idx) => {
            const inHeight = (item.inflow / maxVal) * 100;
            const outHeight = (item.outflow / maxVal) * 100;
            const expHeight = (item.expectedInflow / maxVal) * 100;

            const isToday = item.day.includes('Today');

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredDay(item)}
                onMouseLeave={() => setHoveredDay(null)}
                className={`flex flex-col items-center justify-end h-full group cursor-pointer p-1 rounded-lg transition-colors ${
                  isToday ? 'bg-[#FAF8F5] border border-emerald-300' : 'hover:bg-[#FAF8F5]'
                }`}
              >
                {/* Triple bar column */}
                <div className="flex items-end gap-0.5 sm:gap-1 w-full justify-center h-full">
                  {/* Actual Inflow bar */}
                  {item.inflow > 0 && (
                    <div
                      style={{ height: `${Math.max(4, inHeight)}%` }}
                      className="w-1.5 sm:w-2.5 bg-emerald-600 rounded-t-sm transition-all group-hover:bg-emerald-700"
                    />
                  )}
                  {/* Outflow bar */}
                  {item.outflow > 0 && (
                    <div
                      style={{ height: `${Math.max(4, outHeight)}%` }}
                      className="w-1.5 sm:w-2.5 bg-rose-600 rounded-t-sm transition-all group-hover:bg-rose-700"
                    />
                  )}
                  {/* Expected Inflow bar */}
                  {item.expectedInflow > 0 && (
                    <div
                      style={{ height: `${Math.max(4, expHeight)}%` }}
                      className="w-1.5 sm:w-2.5 bg-amber-400 rounded-t-sm transition-all group-hover:bg-amber-500"
                    />
                  )}
                </div>

                {/* Day label */}
                <span
                  className={`text-[10px] mt-2 block truncate w-full text-center ${
                    isToday ? 'font-bold text-emerald-800' : 'text-[#78716C]'
                  }`}
                >
                  {item.day.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
