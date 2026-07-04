'use client';

import { useEffect, useState } from 'react';

export function BreakdownPanel({ userProblems = [] }: { userProblems?: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = userProblems.length;
  
  // Calculate difficulty breakdown
  let easy = 0, medium = 0, hard = 0;
  
  // Calculate pattern breakdown
  const patternCounts: Record<string, number> = {};

  userProblems.forEach(up => {
    const p = Array.isArray(up.problems) ? up.problems[0] : up.problems;
    if (!p) return;

    if (p.difficulty === 'Easy') easy++;
    else if (p.difficulty === 'Medium') medium++;
    else if (p.difficulty === 'Hard') hard++;

    if (p.patterns && Array.isArray(p.patterns)) {
      p.patterns.forEach((pat: string) => {
        patternCounts[pat] = (patternCounts[pat] || 0) + 1;
      });
    }
  });

  const difficultyStats = [
    { label: 'Easy', count: easy, percent: total ? (easy / total) * 100 : 0, color: 'bg-green-400' },
    { label: 'Medium', count: medium, percent: total ? (medium / total) * 100 : 0, color: 'bg-yellow-400' },
    { label: 'Hard', count: hard, percent: total ? (hard / total) * 100 : 0, color: 'bg-red-400' },
  ];

  // Sort and take top 5 patterns
  const topPatterns = Object.entries(patternCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({
      label,
      count,
      percent: total ? (count / total) * 100 : 0,
      color: 'bg-gray-300'
    }));

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
          {topPatterns.length === 0 ? (
            <div className="text-xs text-gray-400">No patterns to display yet.</div>
          ) : (
            topPatterns.map((stat, idx) => (
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
            ))
          )}
        </div>
        {topPatterns.length > 0 && (
          <div className="text-xs text-gray-400 mt-2">Showing top {topPatterns.length} patterns</div>
        )}
      </div>
    </div>
  );
}
