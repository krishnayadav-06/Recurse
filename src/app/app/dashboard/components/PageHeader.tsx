import { Play, Flame, Edit2 } from 'lucide-react';
import Link from 'next/link';

export function PageHeader() {
  const getGreeting = () => {
    const greetings = ['Hey', 'Sup', 'Wagwan', 'Hows the weather?'];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const greeting = getGreeting();
  // TODO: Fetch user name from Supabase auth session once connected.
  const name = 'Krishna Yadav';
  const username = 'kris-yadav';
  const streak = 34;

  return (
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex items-center justify-end">
        <Link
          href="/app/queue"
          className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors duration-150 shadow-sm"
        >
          <Play className="w-4 h-4" />
          <span>Start review</span>
        </Link>
      </div>

      <div className="flex items-start gap-5 mt-2">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-xl font-bold shadow-sm shrink-0 mt-1">
          &lt;\k.&gt;
        </div>

        {/* Title and stacked stats */}
        <div className="flex flex-col gap-2 pb-0.5">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-none">
            {greeting}, {name}
          </h1>

          <div className="flex flex-col gap-2 mt-1">
            {/* User Profile Row */}
            <div className="flex items-center gap-3">
              <span
                className="text-sm font-medium text-gray-600 group flex items-center gap-1.5 cursor-pointer hover:text-blue-600 transition-colors"
                title="Edit username"
              >
                @{username}
                <Edit2 className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
              </span>
              <span className="text-gray-300">&middot;</span>
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#E8490F]" />
                <span className="font-semibold text-gray-700">{streak} Day</span> Streak
              </span>
            </div>

            {/* Daily Progress Row */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                <span className="font-mono font-medium text-gray-700">12</span> problems due today
              </span>

              <span className="text-gray-300">&middot;</span>

              {/* Segmented Progress Bar */}
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  let fillWidth = '0%';
                  if (i < 3) fillWidth = '100%';
                  else if (i === 3) fillWidth = '60%';

                  return (
                    <div key={i} className="w-8 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#E8490F] rounded-full"
                        style={{ width: fillWidth }}
                      />
                    </div>
                  );
                })}
                <span className="text-xs text-gray-400 ml-1.5">NeetCode 150</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
