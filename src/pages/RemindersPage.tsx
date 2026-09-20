import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ReminderCard } from '../components/reminders/ReminderCard';
import { Bell, CheckCircle2, MessageSquare } from 'lucide-react';

export const RemindersPage: React.FC = () => {
  const { reminders } = useStore();
  const [activeFilter, setActiveFilter] = useState<'all' | 'due_today' | 'overdue' | 'upcoming'>('all');

  const filteredReminders = reminders.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'overdue') return r.status === 'overdue' || r.daysDiff < 0;
    if (activeFilter === 'due_today') return r.status === 'due_today' || r.daysDiff === 0;
    if (activeFilter === 'upcoming') return r.daysDiff > 0;
    return true;
  });

  const overdueCount = reminders.filter((r) => r.status === 'overdue' || r.daysDiff < 0).length;
  const dueTodayCount = reminders.filter((r) => r.status === 'due_today' || r.daysDiff === 0).length;

  return (
    <div className="space-y-5 pb-20 sm:pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-700" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] tracking-tight">
            Today's Follow-ups & Reminders
          </h1>
        </div>
        <p className="text-xs text-[#78716C] mt-0.5">
          Friendly digital munim WhatsApp reminders tailored for Indian neighborhood stores
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-[#F2EFE8] p-1 rounded-xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeFilter === 'all'
              ? 'bg-white text-[#1C1917] shadow-2xs'
              : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          All ({reminders.length})
        </button>
        <button
          onClick={() => setActiveFilter('overdue')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeFilter === 'overdue'
              ? 'bg-rose-700 text-white shadow-2xs'
              : 'text-rose-700 hover:text-rose-900'
          }`}
        >
          Overdue ({overdueCount})
        </button>
        <button
          onClick={() => setActiveFilter('due_today')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeFilter === 'due_today'
              ? 'bg-amber-700 text-white shadow-2xs'
              : 'text-amber-800 hover:text-amber-900'
          }`}
        >
          Due Today ({dueTodayCount})
        </button>
        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeFilter === 'upcoming'
              ? 'bg-white text-emerald-800 shadow-2xs'
              : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          Upcoming
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-[#E8E3D8] text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] flex items-center justify-center mx-auto text-[#78716C]">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="text-base font-bold text-[#1C1917]">No pending follow-ups 🎉</h4>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto">
              All selected customer accounts are settled or not yet due for reminders.
            </p>
          </div>
        ) : (
          filteredReminders.map((r) => <ReminderCard key={r.id} reminder={r} />)
        )}
      </div>
    </div>
  );
};
