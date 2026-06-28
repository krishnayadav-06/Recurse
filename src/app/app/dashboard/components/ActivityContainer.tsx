'use client';

import { useState, useEffect } from 'react';
import { ActivityPanel } from './ActivityPanel';
import { Eye, EyeOff } from 'lucide-react';

export function ActivityContainer() {
  const [isHidden, setIsHidden] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedHidden = localStorage.getItem('recurse_activity_hidden');
    if (savedHidden === 'true') {
      setIsHidden(true);
    }
  }, []);

  const toggleHidden = () => {
    const newState = !isHidden;
    setIsHidden(newState);
    if (newState) {
      localStorage.setItem('recurse_activity_hidden', 'true');
    } else {
      localStorage.removeItem('recurse_activity_hidden');
    }
  };

  // Prevent hydration mismatch
  if (!isClient) return <div className="min-h-[200px]" />;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <button 
          onClick={toggleHidden}
          className="text-[11px] font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5 bg-white hover:bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-200 shadow-sm"
        >
          {isHidden ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Show Activity</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide Activity</span>
            </>
          )}
        </button>
      </div>

      {!isHidden && <ActivityPanel />}
    </div>
  );
}
