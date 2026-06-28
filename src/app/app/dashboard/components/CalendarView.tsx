'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to generate the grid days
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay();
    // Adjust to Monday-start week (0 = Monday, 6 = Sunday)
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const startingDay = getFirstDayOfMonth(year, month);

  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  // We need 6 rows of 7 days to always cover the grid uniformly
  const totalCells = 42;
  const daysArray = Array.from({ length: totalCells }, (_, i) => {
    const dayNumber = i - startingDay + 1;
    if (dayNumber <= 0 || dayNumber > daysInMonth) return null;
    return dayNumber;
  });

  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-12 w-full max-w-4xl mx-auto mt-4 pb-2">
      {/* Left Side: Calendar */}
      <div className="w-full md:w-1/2 max-w-[320px] mx-auto md:mx-0 border border-gray-200 rounded-2xl px-5 pt-5 pb-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="text-sm font-semibold text-gray-900">
            {monthNames[month]} {year}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handlePrevMonth} className="p-1 -m-1 group">
              <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors" />
            </button>
            <button onClick={handleNextMonth} className="p-1 -m-1 group">
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors" />
            </button>
          </div>
        </div>

        {/* Grid Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-[10px] font-medium text-gray-400 uppercase tracking-wide text-center">
              {day}
            </div>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-y-2 gap-x-1">
          {daysArray.map((day, idx) => {
            if (day === null) {
              return <div key={idx} className="h-7 w-full" />;
            }

            const isToday = isCurrentMonth && day === today.getDate();
            const isTomorrow = isCurrentMonth && day === today.getDate() + 1;
            const isIn3Days = isCurrentMonth && day === today.getDate() + 3;

            const isPast = isCurrentMonth && day < today.getDate() ||
              year < today.getFullYear() ||
              (year === today.getFullYear() && month < today.getMonth());

            let textClass = 'text-gray-400';
            if (isToday) {
              textClass = 'bg-gray-900 text-white rounded-full w-6 h-6 flex items-center justify-center font-medium mx-auto text-xs';
            } else if (isPast) {
              textClass = 'text-gray-300 mx-auto text-xs h-6 w-6 flex items-center justify-center';
            } else {
              textClass = 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer rounded-full w-6 h-6 flex items-center justify-center transition-colors mx-auto text-xs';
            }

            return (
              <div key={idx} className="h-8 w-full flex flex-col items-center justify-start">
                <div className={textClass}>
                  {day}
                </div>
                <div className="flex gap-0.5 mt-0.5 h-1 items-center justify-center">
                  {isToday && <div className="w-1 h-1 rounded-full bg-emerald-500" />}
                  {isTomorrow && <div className="w-1 h-1 rounded-full bg-amber-500" />}
                  {isIn3Days && <div className="w-1 h-1 rounded-full bg-rose-500" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Side: Agenda */}
      <div className="w-full md:w-1/2 flex flex-col pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-10">
        <h3 className="text-sm font-semibold text-gray-900 mb-5">Upcoming this week</h3>

        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between group cursor-pointer">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Two Sum</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Array • Due today</span>
            </div>
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Easy</span>
          </div>

          <div className="flex items-start justify-between group cursor-pointer">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">LRU Cache</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Linked List • Due tomorrow</span>
            </div>
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/50">Medium</span>
          </div>

          <div className="flex items-start justify-between group cursor-pointer">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Merge K Sorted Lists</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Divide & Conquer • Due in 3 days</span>
            </div>
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">Hard</span>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <button className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
            View full queue &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
