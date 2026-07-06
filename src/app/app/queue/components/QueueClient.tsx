"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, AlertCircle, CalendarDays, Loader2, BarChart2 } from "lucide-react";

export type Difficulty = "Easy" | "Medium" | "Hard";
export type SortOption = "due" | "retrievability" | "difficulty" | "pattern";
export type TabOption = "daily" | "backlog" | "upcoming";

export interface QueueProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  patterns: string[];
  due: Date;
  repetitions: number;
  isOverdue: boolean;
  overdueDays: number;
  upcomingDays: number;
  retrievabilityValue: number;
  retrievabilityDisplay: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function difficultyBadge(difficulty: Difficulty) {
  const map: Record<Difficulty, string> = {
    Easy: "bg-green-50 text-green-700",
    Medium: "bg-yellow-50 text-yellow-700",
    Hard: "bg-red-50 text-red-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[difficulty]}`}>
      {difficulty}
    </span>
  );
}

function sortProblems(problems: QueueProblem[], sort: SortOption): QueueProblem[] {
  const copy = [...problems];
  if (sort === "due") return copy.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
  if (sort === "retrievability") return copy.sort((a, b) => a.retrievabilityValue - b.retrievabilityValue);
  if (sort === "difficulty") {
    const order: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 };
    return copy.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
  }
  if (sort === "pattern") {
    return copy.sort((a, b) => (a.patterns[0] ?? "").localeCompare(b.patterns[0] ?? ""));
  }
  return copy;
}

// ─── Sort Dropdown ─────────────────────────────────────────────────────────────

function SortDropdown({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const options: { value: SortOption; label: string }[] = [
    { value: "due", label: "Due date" },
    { value: "retrievability", label: "Urgency (Retrievability)" },
    { value: "difficulty", label: "Difficulty" },
    { value: "pattern", label: "Pattern" },
  ];

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "Sort";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative hidden sm:block" ref={ref}>
      <button
        id="queue-sort-trigger"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 cursor-pointer select-none"
      >
        Sort: {selectedLabel}
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-sm py-1 z-10">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-100"
            >
              <span className={value === opt.value ? "text-gray-900 font-medium" : ""}>{opt.label}</span>
              {value === opt.value && <Check className="w-4 h-4 text-signal" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Visual Rep Tracker ────────────────────────────────────────────────────────

const RepTracker = React.memo(function RepTracker({ reps }: { reps: number }) {
  const safeReps = Math.max(0, reps || 0);
  const MAX = 5; // Show up to 5 visual bars
  
  return (
    <div className="flex items-center gap-[2px]" title={`${safeReps} reps`} aria-label={`${safeReps} repetitions`}>
      {Array.from({ length: MAX }).map((_, i) => (
        <div 
          key={i} 
          className={`w-[2px] h-[10px] flex-shrink-0 rounded-full transition-colors ${i < safeReps ? 'bg-blue-600' : 'bg-gray-200'}`}
        />
      ))}
      {safeReps > MAX && <span className="text-[10px] font-medium ml-1 text-gray-400">+{safeReps - MAX}</span>}
    </div>
  );
});

// ─── Queue Card ───────────────────────────────────────────────────────────────

function QueueCard({ problem }: { problem: QueueProblem }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-5 py-3 flex flex-col hover:border-gray-400 transition-colors duration-150">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 truncate max-w-[320px]">
          {problem.title}
        </h3>
        <div className="flex items-center flex-shrink-0">
          {difficultyBadge(problem.difficulty)}
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-0.5">
        <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
          <div className="flex items-center gap-1">
            {problem.isOverdue ? <AlertCircle className="w-3.5 h-3.5 text-ember" /> : problem.upcomingDays > 0 ? <CalendarDays className="w-3.5 h-3.5 text-blue-500" /> : null}
            <span className={problem.isOverdue ? "text-ember font-medium" : problem.upcomingDays > 0 ? "text-blue-500 font-medium" : ""}>
              {problem.isOverdue
                ? `Overdue ${problem.overdueDays}d`
                : problem.upcomingDays > 0
                  ? `Due in ${problem.upcomingDays}d`
                  : "Due today"}
            </span>
            <span className="mx-1 text-gray-300">·</span>
            <RepTracker reps={problem.repetitions} />
          </div>

          <div className="hidden sm:flex items-center gap-1 text-gray-500" title="Retrievability (Memory Strength)">
            <BarChart2 className="w-3 h-3" />
            {problem.retrievabilityDisplay}
          </div>
        </div>
        <Link
          href={`/app/review/${problem.id}`}
          id={`review-btn-${problem.id}`}
          className="bg-gray-900 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-gray-800 transition-colors duration-150 sm:w-auto w-full mt-2 text-center"
        >
          Review →
        </Link>
      </div>
    </div>
  );
}

// ─── Ghost Card (empty-state decoration) ─────────────────────────────────────

const GHOST_WIDTHS = [
  { title: "w-40", tag1: "w-12", tag2: "w-16", meta: "w-28" },
  { title: "w-56", tag1: "w-16", tag2: "w-14", meta: "w-20" },
  { title: "w-32", tag1: "w-10", tag2: "w-18", meta: "w-24" },
  { title: "w-48", tag1: "w-14", tag2: "w-12", meta: "w-32" },
  { title: "w-36", tag1: "w-18", tag2: "w-10", meta: "w-22" },
];

function GhostCard({ index }: { index: number }) {
  const w = GHOST_WIDTHS[index % GHOST_WIDTHS.length];
  return (
    <div className="bg-white border border-gray-100 rounded-lg px-5 py-3 flex flex-col pointer-events-none select-none">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className={`${w.title} h-5 bg-gray-100 rounded`} />
        <div className="flex items-center flex-shrink-0">
          <div className="w-12 h-5 bg-gray-100 rounded-full" />
        </div>
      </div>
      {/* Bottom row */}
      <div className="flex items-center justify-between mt-0.5">
        <div className={`${w.meta} h-3 bg-gray-100 rounded`} />
        <div className="w-20 h-7 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

function GhostEmptyState({ tab, isAuthenticated }: { tab?: TabOption, isAuthenticated?: boolean }) {
  let title = "You're all caught up.";
  let desc = "No reviews due today. Add problems to get started.";
  
  if (!isAuthenticated) {
    title = "Log in to view your queue.";
    desc = "Track your problems and review them using spaced repetition.";
  } else if (tab === "backlog") {
    title = "No overdue problems.";
    desc = "Great job keeping your backlog clean!";
  } else if (tab === "upcoming") {
    title = "No upcoming problems.";
    desc = "Your future is wide open.";
  }

  return (
    <div className="space-y-2">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-5 text-center">
        <p className="text-sm font-medium text-gray-700">{title}</p>
        <p className="text-xs text-gray-400 mt-1">{desc}</p>
        {!isAuthenticated ? (
          <div className="mt-4">
            <Link
              href="?auth=login"
              className="bg-gray-900 text-white rounded-lg px-10 py-1.5 text-sm font-medium hover:bg-gray-800 hover:shadow-md transition-all duration-200 inline-block"
            >
              Sign in
            </Link>
          </div>
        ) : tab === "daily" && (
          <div className="mt-4">
            <Link
              href="/app/problems"
              id="queue-browse-problems-btn"
              className="border border-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 inline-block"
            >
              Browse problems →
            </Link>
          </div>
        )}
      </div>

      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ opacity: Math.max(0.12, 0.45 - i * 0.1) }}>
          <GhostCard index={i} />
        </div>
      ))}
    </div>
  );
}

export function QueueClient({ 
  initialDaily, 
  initialBacklog, 
  initialUpcoming,
  isAuthenticated = true
}: { 
  initialDaily: QueueProblem[], 
  initialBacklog: QueueProblem[], 
  initialUpcoming: QueueProblem[],
  isAuthenticated?: boolean
}) {
  const router = useRouter();

  // If daily is empty but backlog isn't, default to backlog
  const defaultTab = initialDaily.length === 0 && initialBacklog.length > 0 ? "backlog" : "daily";

  const [activeTab, setActiveTab] = useState<TabOption>(defaultTab);
  const [isSpreading, setIsSpreading] = useState(false);

  const [dailyProblems, setDailyProblems] = useState<QueueProblem[]>(initialDaily);
  const [backlogProblems, setBacklogProblems] = useState<QueueProblem[]>(initialBacklog);
  const [upcomingProblems, setUpcomingProblems] = useState<QueueProblem[]>(initialUpcoming);
  
  const [dailySort, setDailySort] = useState<SortOption>("due");
  const [backlogSort, setBacklogSort] = useState<SortOption>("retrievability");
  const [upcomingSort, setUpcomingSort] = useState<SortOption>("due");

  useEffect(() => {
    setDailyProblems(initialDaily);
    setBacklogProblems(initialBacklog);
    setUpcomingProblems(initialUpcoming);
  }, [initialDaily, initialBacklog, initialUpcoming]);

  const handleSpreadBacklog = async () => {
    setIsSpreading(true);

    // Optimistic UI Update
    const optimisticUpcoming = [...upcomingProblems, ...backlogProblems.map(p => ({
      ...p,
      isOverdue: false,
      upcomingDays: Math.max(1, Math.ceil((p.repetitions || 1) * 0.15))
    }))];
    setUpcomingProblems(optimisticUpcoming);
    setBacklogProblems([]);

    try {
      const res = await fetch("/api/reschedule", { method: "POST" });
      if (res.ok) {
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      router.refresh();
    }
    setIsSpreading(false);
  };

  const activeProblems = activeTab === "daily" ? dailyProblems : activeTab === "backlog" ? backlogProblems : upcomingProblems;
  const currentSort = activeTab === "daily" ? dailySort : activeTab === "backlog" ? backlogSort : upcomingSort;
  const setCurrentSort = activeTab === "daily" ? setDailySort : activeTab === "backlog" ? setBacklogSort : setUpcomingSort;
  const sortedProblems = sortProblems(activeProblems, currentSort);

  return (
    <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      {/* Page Header */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Your Queue
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {dailyProblems.length} due today, {backlogProblems.length} in backlog
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SortDropdown value={currentSort} onChange={setCurrentSort} />
          {activeTab === "backlog" && backlogProblems.length > 0 && (
            <div className="relative hidden sm:block group">
              <button
                onClick={handleSpreadBacklog}
                disabled={isSpreading}
                className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSpreading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
                Spread Backlog
              </button>
              <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 shadow-lg pointer-events-none">
                Reschedules your overdue cards using FSRS Retrievability. Cards you remember best (higher retrievability) are pushed further into the future to balance your daily load.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Spread Button */}
      {activeTab === "backlog" && backlogProblems.length > 0 && (
        <div className="sm:hidden mb-4 mt-2 relative group">
          <button
            onClick={handleSpreadBacklog}
            disabled={isSpreading}
            className="w-full flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSpreading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
            Spread Backlog
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[calc(100vw-32px)] max-w-sm bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 shadow-lg pointer-events-none">
            Reschedules your overdue cards using FSRS Retrievability. Cards you remember best (higher retrievability) are pushed further into the future to balance your daily load.
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 mt-4">
        <button
          onClick={() => setActiveTab("daily")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === "daily"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
        >
          Daily Queue
          {dailyProblems.length > 0 && (
            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${activeTab === 'daily' ? 'bg-gray-100 text-gray-900' : 'bg-gray-100 text-gray-500'}`}>
              {dailyProblems.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("backlog")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === "backlog"
              ? "border-ember text-ember"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
        >
          Backlog
          {backlogProblems.length > 0 && (
            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${activeTab === 'backlog' ? 'bg-red-50 text-ember' : 'bg-gray-100 text-gray-500'}`}>
              {backlogProblems.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "upcoming"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Upcoming
          {upcomingProblems.length > 0 && (
            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${activeTab === 'upcoming' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
              {upcomingProblems.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {sortedProblems.length === 0 ? (
        <GhostEmptyState tab={activeTab} isAuthenticated={isAuthenticated} />
      ) : (
        <div className="space-y-2">
          {sortedProblems.map((problem) => (
            <QueueCard key={problem.id} problem={problem} />
          ))}
        </div>
      )}
    </main>
  );
}
