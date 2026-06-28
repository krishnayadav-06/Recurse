"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SearchX, ArrowUp, ArrowDown } from "lucide-react";
import { getPatternStyles } from "../../../../lib/utils";
import { DifficultyBadge } from "./ui/DifficultyBadge";
import { StatusIcon } from "./ui/StatusIcon";
import type { Problem, SortField, SortDir } from "../types";

interface ProblemsTableProps {
  filtered: Problem[];
  statusMap: Record<string, number>;
  problemTopics: Map<string, string>;
  sortField: SortField | null;
  sortDir: SortDir;
  toggleSort: (field: SortField) => void;
  clearAllFilters: () => void;
  isDefaultSort: boolean;
}

export function ProblemsTable({
  filtered,
  statusMap,
  problemTopics,
  sortField,
  sortDir,
  toggleSort,
  clearAllFilters,
  isDefaultSort,
}: ProblemsTableProps) {
  const router = useRouter();

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 inline ml-0.5" />
    ) : (
      <ArrowDown className="w-3 h-3 inline ml-0.5" />
    );
  };

  return (
    <div className="flex-1 overflow-hidden mt-6 mb-8 border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col">
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-sm" id="problems-table">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-4 text-left w-12 py-3.5 hidden md:table-cell">
                #
              </th>
              <th
                className="text-xs font-semibold uppercase tracking-wider text-left py-3.5 px-3 cursor-pointer select-none transition-colors group"
                onClick={() => toggleSort("title")}
              >
                <span className={sortField === "title" ? "text-gray-900" : "text-gray-500"}>
                  Title
                  <SortIndicator field="title" />
                </span>
              </th>
              <th
                className="text-xs font-semibold uppercase tracking-wider text-left py-3.5 px-3 w-28 cursor-pointer select-none transition-colors group"
                onClick={() => toggleSort("difficulty")}
              >
                <span className={sortField === "difficulty" ? "text-gray-900" : "text-gray-500"}>
                  Difficulty
                  <SortIndicator field="difficulty" />
                </span>
              </th>
              <th className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-left py-3.5 px-3 w-64 hidden md:table-cell">
                Patterns
              </th>
              <th className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right py-3.5 pr-4 w-20">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <SearchX className="w-12 h-12 text-gray-300" />
                    <p className="text-sm text-gray-500 mt-3">
                      No problems match your filters.
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="mt-3 border border-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Clear filters
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {filtered.length > 0 && (() => {
              let lastTopic: string | null = null;

              return filtered.map((problem, idx) => {
                const currentTopic = problemTopics.get(problem.id) || "Uncategorized";
                const showHeader = isDefaultSort && currentTopic !== lastTopic;
                if (isDefaultSort) {
                  lastTopic = currentTopic;
                }

                return (
                  <React.Fragment key={problem.id}>
                    {showHeader && (
                      <tr className="bg-gray-50/80 border-y border-gray-200">
                        <td colSpan={5} className="px-4 py-3 text-xs font-bold text-gray-900 uppercase tracking-widest text-center">
                          {currentTopic}
                        </td>
                      </tr>
                    )}
                    <tr
                      onClick={() => router.push(`/app/review/${problem.id}`)}
                      className="hover:bg-gray-50/75 cursor-pointer transition-colors duration-100 group"
                    >
                      <td className="font-mono text-xs text-gray-400 pl-4 py-3.5 hidden md:table-cell">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-3.5 font-medium text-gray-900 group-hover:text-signal transition-colors">
                        {problem.title}
                      </td>
                      <td className="px-3 py-3.5">
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </td>
                      <td className="px-3 py-3.5 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {problem.patterns?.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className={`rounded-full px-2 py-0.5 text-xs font-mono border ${getPatternStyles(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                          {(problem.patterns?.length ?? 0) > 2 && (
                            <span className="text-xs text-gray-400 font-mono self-center">
                              +{problem.patterns.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-right pr-4">
                        <div className="flex justify-end">
                          <StatusIcon reps={statusMap[problem.id]} />
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              });
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
