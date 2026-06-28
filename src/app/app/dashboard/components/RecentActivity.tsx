import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export function RecentActivity() {
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

      {/* 
      Empty State (Commented out to show mock data)
      <div className="py-10 text-center">
        <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
        <div className="text-sm text-gray-500 mt-3">No reviews yet.</div>
        <div className="text-xs text-gray-400 mt-1">Start from the Problems list to begin.</div>
      </div>
      */}

      {/* List */}
      <div className="flex flex-col mt-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 group cursor-pointer">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Two Sum</span>
            <span className="text-xs text-gray-500 mt-0.5">Reviewed 2 hours ago</span>
          </div>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">Nailed</span>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 group cursor-pointer">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">LRU Cache</span>
            <span className="text-xs text-gray-500 mt-0.5">Reviewed 5 hours ago</span>
          </div>
          <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">Hesitant</span>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 group cursor-pointer">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Valid Anagram</span>
            <span className="text-xs text-gray-500 mt-0.5">Reviewed yesterday</span>
          </div>
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">Familiar</span>
        </div>
      </div>
    </div>
  );
}
