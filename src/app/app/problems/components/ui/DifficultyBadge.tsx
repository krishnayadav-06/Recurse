import React from "react";

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    Easy: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    Medium: "bg-amber-50 text-amber-700 border border-amber-200/50",
    Hard: "bg-rose-50 text-rose-700 border border-rose-100",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[difficulty] ?? ""}`}
    >
      {difficulty}
    </span>
  );
}
