'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ChevronDown } from 'lucide-react';

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  return Math.floor(seconds) + ' seconds ago';
}

export function RecentActivity({ reviewLogs = [] }: { reviewLogs?: any[] }) {
  const [limit, setLimit] = useState(10);
  const recentLogs = reviewLogs.slice(0, limit);
  const router = useRouter();



  const getRatingStyle = (rating: string | null) => {
    switch (rating) {
      case 'Nailed':
        return 'text-green-600 bg-green-50';
      case 'Good':
        return 'text-blue-600 bg-blue-50';
      case 'Hesitant':
        return 'text-orange-600 bg-orange-50';
      case 'Blackout':
        return 'text-red-600 bg-red-50';
      case 'Again':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const hasMore = limit < reviewLogs.length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Recent activity</h2>
        <Link
          href="/app/problems"
          className="text-xs text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
        >
          View all &rarr;
        </Link>
      </div>

      {recentLogs.length === 0 ? (
        <div className="py-10 text-center">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
          <div className="text-sm text-gray-500 mt-3">No reviews yet.</div>
          <div className="text-xs text-gray-400 mt-1">Start from the Problems list to begin.</div>
        </div>
      ) : (
        <div className="flex flex-col mt-4">
          {recentLogs.map((log) => {
            const timeString = timeAgo(new Date(log.reviewed_at));
            const title = Array.isArray(log.problems) ? log.problems[0]?.title : log.problems?.title || 'Unknown Problem';
            
            return (
              <div key={log.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 group cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {title}
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5">Reviewed {timeString}</span>
                </div>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getRatingStyle(log.rating)}`}>
                  {log.rating || (log.execution_passed ? 'Accepted' : 'Failed')}
                </span>
              </div>
            );
          })}
          
          {hasMore && (
            <button
              onClick={() => setLimit(l => l + 5)}
              className="mt-4 w-full py-2 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
