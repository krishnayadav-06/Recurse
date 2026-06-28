'use client';

import { useState, useEffect } from 'react';
import { HeatmapView } from './HeatmapView';
import { CalendarView } from './CalendarView';

type ViewMode = 'heatmap' | 'calendar';

export function ActivityPanel() {
  const [view, setView] = useState<ViewMode>('calendar');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedView = localStorage.getItem('recurse_activity_view') as ViewMode;
    if (savedView === 'heatmap' || savedView === 'calendar') {
      setView(savedView);
    }
  }, []);

  const handleToggle = (mode: ViewMode) => {
    setView(mode);
    localStorage.setItem('recurse_activity_view', mode);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline">
          <h2 className="text-sm font-semibold text-gray-900">Activity</h2>
          <span className="text-xs text-gray-400 ml-2 font-mono">
            {view === 'heatmap' ? '342 reviews in the last year' : 'Upcoming reviews'}
          </span>
        </div>
        
        {/* Toggle */}
        <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => handleToggle('heatmap')}
            className={`px-3 py-1 text-xs transition-colors duration-100 ${
              view === 'heatmap'
                ? 'text-gray-900 font-medium bg-gray-100'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Heatmap
          </button>
          <div className="w-px h-full bg-gray-200" />
          <button
            onClick={() => handleToggle('calendar')}
            className={`px-3 py-1 text-xs transition-colors duration-100 ${
              view === 'calendar'
                ? 'text-gray-900 font-medium bg-gray-100'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[200px] transition-opacity duration-150">
        {isClient && view === 'heatmap' && <HeatmapView />}
        {isClient && view === 'calendar' && <CalendarView />}
      </div>
    </div>
  );
}
