"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface MasteredProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  patterns: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function difficultyBadge(difficulty: "Easy" | "Medium" | "Hard") {
  const map = {
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

// ─── Mastered Card ────────────────────────────────────────────────────────────

interface MasteredCardProps {
  problem: MasteredProblem;
  onRestore: (id: string) => void;
}

function MasteredCard({ problem, onRestore }: MasteredCardProps) {
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
        <div className="text-xs text-gray-400 font-mono">
          Suspended (Mastered)
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onRestore(problem.id)}
            className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-1.5 font-medium transition-colors duration-150 cursor-pointer"
          >
            Restore to Queue
          </button>
          <Link
            href={`/app/review/${problem.id}`}
            className="bg-gray-900 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-gray-800 transition-colors duration-150 text-center"
          >
            Practice Anyway
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Ghost Card ───────────────────────────────────────────────────────────────

const GHOST_WIDTHS = [
  { title: "w-40", tag1: "w-12", tag2: "w-16" },
  { title: "w-56", tag1: "w-16", tag2: "w-14" },
  { title: "w-32", tag1: "w-10", tag2: "w-18" },
  { title: "w-48", tag1: "w-14", tag2: "w-12" },
  { title: "w-36", tag1: "w-18", tag2: "w-10" },
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
        <div className="w-28 h-3 bg-gray-100 rounded" />
        <div className="flex gap-2">
          <div className="w-24 h-7 bg-gray-100 rounded-lg" />
          <div className="w-20 h-7 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Ghost Empty State ────────────────────────────────────────────────────────

function GhostEmptyState({ isAuthenticated }: { isAuthenticated?: boolean }) {
  const title = isAuthenticated ? "No mastered problems yet." : "Log in to view your mastered problems.";
  const desc = isAuthenticated
    ? 'When you find a problem too easy, mark it as "Don\'t track" after solving to move it here.'
    : "Track your progress and see which problems you've completely mastered.";

  return (
    <div className="space-y-2">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-5 text-center">
        <p className="text-sm font-medium text-gray-700">{title}</p>
        <p className="text-xs text-gray-400 mt-1">{desc}</p>
        <div className="mt-4">
          {!isAuthenticated ? (
            <Link
              href="?auth=login"
              className="bg-gray-900 text-white rounded-lg px-10 py-1.5 text-sm font-medium hover:bg-gray-800 hover:shadow-md transition-all duration-200 inline-block"
            >
              Sign in
            </Link>
          ) : (
            <Link
              href="/app/problems"
              className="border border-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 inline-block"
            >
              Browse problems →
            </Link>
          )}
        </div>
      </div>

      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ opacity: Math.max(0.12, 0.55 - i * 0.1) }}>
          <GhostCard index={i} />
        </div>
      ))}
    </div>
  );
}

export function MasteredClient({
  initialProblems,
  isAuthenticated = true
}: {
  initialProblems: MasteredProblem[];
  isAuthenticated?: boolean;
}) {
  const router = useRouter();
  const [problems, setProblems] = useState<MasteredProblem[]>(initialProblems);

  useEffect(() => {
    setProblems(initialProblems);
  }, [initialProblems]);

  const handleRestore = async (problemId: string) => {
    // Optimistic UI update
    setProblems(prev => prev.filter(p => p.id !== problemId));

    try {
      // Restoring a problem sends rating 1 (Again) which clears is_mastered
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          rating: 1, // Again
        })
      });
      if (res.ok) {
        router.refresh(); // Refresh Server Component to ensure sync
      } else {
        router.refresh(); // Revert on failure
      }
    } catch (err) {
      console.error("Failed to restore problem:", err);
      router.refresh(); // Revert on failure
    }
  };

  return (
    <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Mastered
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {problems.length} problem{problems.length !== 1 ? "s" : ""} mastered
          </p>
        </div>
      </div>

      {problems.length === 0 ? (
        <GhostEmptyState isAuthenticated={isAuthenticated} />
      ) : (
        <div className="space-y-2">
          {problems.map((problem) => (
            <MasteredCard
              key={problem.id}
              problem={problem}
              onRestore={handleRestore}
            />
          ))}
        </div>
      )}
    </main>
  );
}
