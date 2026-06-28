"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Check, AlertCircle } from "lucide-react";
import { UserDropdown } from "../../../components/UserDropdown";

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = "Easy" | "Medium" | "Hard";
type SortOption = "due" | "difficulty" | "pattern";

interface QueueProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  patterns: string[];
  due: Date;
  repetitions: number;
  isOverdue: boolean;
}

// ─── Stub data — replaced with live Supabase query once user_problems is wired ─
const STUB_PROBLEMS: QueueProblem[] = [];


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
  if (sort === "due") return copy.sort((a, b) => a.due.getTime() - b.due.getTime());
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
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-sm py-1 z-10">
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

// ─── Queue Card ───────────────────────────────────────────────────────────────

function QueueCard({ problem }: { problem: QueueProblem }) {
  const visiblePatterns = problem.patterns.slice(0, 2);
  const extraCount = problem.patterns.length - 2;

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-5 py-3 flex flex-col gap-1 hover:border-gray-400 transition-colors duration-150">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-gray-900 truncate max-w-[320px]">
          {problem.title}
        </span>
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          {difficultyBadge(problem.difficulty)}
          {visiblePatterns.map((p) => (
            <span key={p} className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-mono">
              {p}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-mono">
              +{extraCount}
            </span>
          )}
        </div>
        <div className="flex sm:hidden flex-shrink-0">
          {difficultyBadge(problem.difficulty)}
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-0.5">
        <div className="flex items-center gap-1 text-xs text-gray-400 font-mono">
          {problem.isOverdue && <AlertCircle className="w-3.5 h-3.5 text-ember" />}
          <span>{problem.isOverdue ? "Overdue" : "Due now"} · rep {problem.repetitions}</span>
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
// Exact same structure as QueueCard, fully desaturated, non-interactive.

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
    <div className="bg-white border border-gray-100 rounded-lg px-5 py-3 flex flex-col gap-1 pointer-events-none select-none">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className={`${w.title} h-4 bg-gray-100 rounded`} />
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <div className={`${w.tag1} h-5 bg-gray-100 rounded-full`} />
          <div className={`${w.tag2} h-5 bg-gray-100 rounded-full`} />
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

// ─── Ghost Empty State ────────────────────────────────────────────────────────

function GhostEmptyState() {
  return (
    <div className="space-y-2">
      {/* Message card — sits at the top of the stack */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-5 text-center">
        <p className="text-sm font-medium text-gray-700">You&apos;re all caught up.</p>
        <p className="text-xs text-gray-400 mt-1">
          No reviews due. Add problems to get started.
        </p>
        <div className="mt-4">
          <Link
            href="/app/problems"
            id="queue-browse-problems-btn"
            className="border border-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 inline-block"
          >
            Browse problems →
          </Link>
        </div>
      </div>

      {/* Ghost cards below — fading out toward the bottom */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ opacity: Math.max(0.12, 0.55 - i * 0.1) }}>
          <GhostCard index={i} />
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton Card (loading state) ───────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-48 h-4 bg-gray-100 rounded" />
        <div className="flex gap-2">
          <div className="w-14 h-5 bg-gray-100 rounded-full" />
          <div className="w-14 h-5 bg-gray-100 rounded-full" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="w-32 h-3 bg-gray-100 rounded" />
        <div className="w-20 h-7 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Shell Nav ────────────────────────────────────────────────────────────────

function ShellNav() {
  return (
    <header className="sticky top-0 z-[60] h-14 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 bg-white">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-semibold text-gray-900 cursor-pointer">
          Recurse
        </Link>
        <nav className="hidden md:flex gap-4">
          <Link href="/app/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
            Dashboard
          </Link>
          <Link href="/app/queue" className="text-sm text-gray-900 font-medium cursor-pointer">
            Queue
          </Link>
          <Link href="/app/problems" className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
            Problems
          </Link>
        </nav>
      </div>
      <UserDropdown />
    </header>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QueuePage() {
  const [sort, setSort] = useState<SortOption>("due");
  const isLoading = false;
  const problems = sortProblems(STUB_PROBLEMS, sort);
  const dueCount = problems.length;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <ShellNav />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Page Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Your Queue
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isLoading ? (
                <span className="inline-block w-32 h-3 bg-gray-100 rounded animate-pulse" />
              ) : (
                `${dueCount} problem${dueCount !== 1 ? "s" : ""} due today`
              )}
            </p>
          </div>
          <SortDropdown value={sort} onChange={setSort} />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-2">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : problems.length === 0 ? (
          <GhostEmptyState />
        ) : (
          <div className="space-y-2">
            {problems.map((problem) => (
              <QueueCard key={problem.id} problem={problem} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
