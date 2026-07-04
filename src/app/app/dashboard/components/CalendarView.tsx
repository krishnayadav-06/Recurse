'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function CalendarView({ userProblems = [] }: { userProblems?: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
  today.setHours(0, 0, 0, 0);

  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  // We need 6 rows of 7 days to always cover the grid uniformly
  const totalCells = 42;
  const daysArray = Array.from({ length: totalCells }, (_, i) => {
    const dayNumber = i - startingDay + 1;
    if (dayNumber <= 0 || dayNumber > daysInMonth) return null;
    return dayNumber;
  });

  // Pre-calculate due dates map
  const dueMap: Record<string, any[]> = {};
  userProblems.forEach(up => {
    if (!up.due || up.is_mastered) return;
    const dueDate = new Date(up.due);
    dueDate.setHours(0, 0, 0, 0);
    // adjust to local date string YYYY-MM-DD
    const dateKey = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
    if (!dueMap[dateKey]) dueMap[dateKey] = [];
    dueMap[dateKey].push(up);
  });

  let displayProblems = [];
  let agendaTitle = 'Upcoming this week';

  if (selectedDate) {
    const selectedDateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    agendaTitle = `Reviews for ${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}`;
    const dueHere = dueMap[selectedDateKey] || [];
    
    displayProblems = dueHere.map(up => ({
      ...up,
      dueLabel: `Due ${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}`
    }));
  } else {
    // Calculate upcoming 7 days of problems for the agenda view
    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    userProblems.forEach(up => {
      if (!up.due || up.is_mastered) return;
      const dueDate = new Date(up.due);
      dueDate.setHours(0, 0, 0, 0);
      
      // Include overdue or due within 7 days
      if (dueDate <= next7Days) {
        const daysFromNow = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let dueLabel = 'Due today';
        if (daysFromNow < 0) dueLabel = `Overdue by ${Math.abs(daysFromNow)} days`;
        else if (daysFromNow === 1) dueLabel = 'Due tomorrow';
        else if (daysFromNow > 1) dueLabel = `Due in ${daysFromNow} days`;

        displayProblems.push({
          ...up,
          dueDate,
          daysFromNow,
          dueLabel
        });
      }
    });

    // Sort upcoming agenda by due date
    displayProblems.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    displayProblems = displayProblems.slice(0, 5);
  }

  return (
    <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12 w-full max-w-4xl mx-auto mt-4 pb-2">
      {/* Left Side: Calendar */}
      <div className="w-full md:w-1/2 max-w-[320px] mx-auto md:mx-0 border border-gray-200 rounded-2xl px-5 py-5">
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

            const cellDate = new Date(year, month, day);
            const dateKey = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
            const dueHere = dueMap[dateKey] || [];

            const isToday = isCurrentMonth && day === today.getDate();
            const isPast = cellDate < today;
            
            const isSelected = selectedDate && 
              selectedDate.getDate() === day && 
              selectedDate.getMonth() === month && 
              selectedDate.getFullYear() === year;

            let textClass = 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer rounded-full w-6 h-6 flex items-center justify-center transition-colors mx-auto text-xs';
            
            if (isSelected) {
              textClass = 'bg-[#E8490F] text-white rounded-full w-6 h-6 flex items-center justify-center font-medium mx-auto text-xs cursor-pointer shadow-sm';
            } else if (isToday) {
              textClass = 'bg-gray-900 text-white rounded-full w-6 h-6 flex items-center justify-center font-medium mx-auto text-xs cursor-pointer';
            } else if (isPast) {
              textClass = 'text-gray-300 mx-auto text-xs h-6 w-6 flex items-center justify-center hover:bg-gray-50 hover:text-gray-400 cursor-pointer rounded-full transition-colors';
            }

            // Show up to 3 dots
            const dots = Math.min(3, dueHere.length);

            return (
              <div 
                key={idx} 
                className="h-8 w-full flex flex-col items-center justify-start cursor-pointer"
                onClick={() => {
                  if (isSelected) {
                    setSelectedDate(null); // deselect
                  } else {
                    setSelectedDate(cellDate);
                  }
                }}
              >
                <div className={textClass}>
                  {day}
                </div>
                <div className="flex gap-0.5 mt-0.5 h-1 items-center justify-center">
                  {Array.from({ length: dots }).map((_, dIdx) => {
                    const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
                    return <div key={dIdx} className={`w-1 h-1 rounded-full ${colors[dIdx]}`} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Side: Agenda */}
      <div className="w-full md:w-1/2 flex flex-col pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-gray-900">{agendaTitle}</h3>
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate(null)}
              className="text-xs text-gray-400 hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto overflow-x-hidden max-h-[280px] pr-2 scrollbar-hide">
          {displayProblems.length === 0 ? (
            <div className="text-sm text-gray-500">
              {selectedDate ? 'No reviews scheduled for this date.' : 'No upcoming reviews scheduled.'}
            </div>
          ) : (
            displayProblems.map((item, idx) => {
              const p = Array.isArray(item.problems) ? item.problems[0] : item.problems;
              const title = p?.title || 'Unknown';
              const difficulty = p?.difficulty || 'Unknown';
              const firstPattern = (p?.patterns && Array.isArray(p.patterns) && p.patterns.length > 0) 
                ? p.patterns[0] 
                : 'No Pattern';

              const diffColor = difficulty === 'Easy' 
                ? 'bg-green-50 text-green-700'
                : difficulty === 'Medium'
                ? 'bg-yellow-50 text-yellow-700'
                : 'bg-red-50 text-red-700';

              return (
                <div key={idx} className="flex items-start justify-between group cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate max-w-[200px]">{title}</span>
                    <span className="text-[11px] text-gray-500 mt-0.5">{firstPattern} • {item.dueLabel}</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${diffColor}`}>{difficulty}</span>
                </div>
              );
            })
          )}
        </div>

        {!selectedDate && (
          <div className="mt-auto pt-6">
            <a href="/app/queue" className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 cursor-pointer">
              View full queue &rarr;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
