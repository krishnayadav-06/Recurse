'use client';

import { useEffect, useState } from 'react';

export function BreakdownPanel() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const difficultyStats = [
    { label: 'Easy', count: 142, percent: 85, color: 'bg-[#E8490F]' },
    { label: 'Medium', count: 87, percent: 55, color: 'bg-[#E8490F]' },
    { label: 'Hard', count: 14, percent: 15, color: 'bg-[#E8490F]' },
  ];

  const patternStats = [
    { label: 'Array', count: 56, percent: 75, color: 'bg-[#E8490F]' },
    { label: 'Two Pointers', count: 34, percent: 45, color: 'bg-[#E8490F]' },
    { label: 'Sliding Window', count: 18, percent: 25, color: 'bg-[#E8490F]' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-6">
      {/* Difficulty Breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">By difficulty</h2>
        <div className="flex flex-col">
          {difficultyStats.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-3 mb-2">
              <div className="w-16 text-xs text-gray-500">{stat.label}</div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ease-out ${stat.color}`}
                  style={{ width: mounted ? `${stat.percent}%` : '0%' }}
                />
              </div>
              <div className="w-8 text-right font-mono text-xs text-gray-500">
                {stat.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pattern Breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3 pt-4 border-t border-gray-100">
          By pattern
        </h2>
        <div className="flex flex-col">
          {patternStats.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-3 mb-2">
              <div className="w-24 text-xs text-gray-500 truncate">{stat.label}</div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ease-out ${stat.color}`}
                  style={{ width: mounted ? `${stat.percent}%` : '0%' }}
                />
              </div>
              <div className="w-8 text-right font-mono text-xs text-gray-500">
                {stat.count}
              </div>
            </div>
          ))}
        </div>
        {patternStats.length > 0 && (
          <div className="text-xs text-gray-400 mt-2">Showing top {patternStats.length} patterns</div>
        )}
      </div>
    </div>
  );
}
