"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Check,
  X,
  SearchX,
  ArrowUp,
  ArrowDown,
  Plus,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "../../../utils/supabase/client";
import {
  CURATED_LISTS,
  CURATED_LIST_LABELS,
  NEETCODE_150_SECTIONS,
  type CuratedListKey,
} from "../../../lib/curated-lists";
import { getPatternStyles } from "../../../lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  patterns: string[];
}

interface UserStatus {
  problem_id: string;
  reps: number;
}

type SortField = "title" | "difficulty";
type SortDir = "asc" | "desc";

const DIFFICULTY_ORDER: Record<string, number> = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
};


/* -------------------------------------------------------------------------- */
/*  Dropdown                                                                  */
/* -------------------------------------------------------------------------- */

function Dropdown<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  renderOption,
}: {
  id: string;
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
  renderOption?: (v: T) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const renderItem = (v: T) => {
    if (renderOption) return renderOption(v);
    return v;
  };
  const isActive = value !== options[0]; // first option is always "All"

  return (
    <div ref={ref} className="relative" id={id}>
      <button
        onClick={() => setOpen((p) => !p)}
        className={`border rounded-lg px-3 py-2 text-sm flex items-center gap-1.5 transition-colors duration-150 cursor-pointer ${
          isActive
            ? "border-gray-900 text-gray-900 font-medium"
            : "border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span className="hidden sm:inline">{label}:</span>
        <span className="inline-flex items-center">{renderItem(value)}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-sm py-1">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors duration-100 ${
                value === opt
                  ? "text-gray-900 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="inline-flex items-center">{renderItem(opt)}</span>
              {value === opt && <Check className="w-4 h-4 text-signal" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pattern Selector (Rectangular Panel with Search)                         */
/* -------------------------------------------------------------------------- */

function PatternSelector({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const filteredOptions = useMemo(() => {
    const patternsOnly = options.filter((o) => o !== "All");
    if (!search) return patternsOnly;
    const q = search.toLowerCase();
    return patternsOnly.filter((o) => o.toLowerCase().includes(q));
  }, [options, search]);

  const isActive = value !== "All";

  return (
    <div ref={ref} className="relative" id="filter-pattern">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`border rounded-lg px-3 py-2 text-sm flex items-center gap-1.5 transition-colors duration-150 cursor-pointer ${
          isActive
            ? "border-gray-900 text-gray-900 font-medium"
            : "border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span className="hidden sm:inline">Pattern:</span>
        <span className="max-w-[120px] truncate sm:max-w-none">{value}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <>
          {/* Mobile Overlay */}
          <div 
            className="fixed inset-0 bg-black/5 z-40 sm:hidden" 
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }} 
          />
          {/* Panel */}
          <div className="fixed sm:absolute z-50 w-[calc(100vw-2rem)] sm:w-[480px] bg-white border border-gray-200 rounded-xl shadow-xl p-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-auto sm:left-0 sm:translate-x-0 sm:translate-y-0 sm:mt-1">
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patterns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-signal focus:outline-none"
                autoFocus
              />
            </div>
            <button
              onClick={() => {
                onChange("All");
                setOpen(false);
              }}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer font-medium ${
                value === "All"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              All Patterns
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto pr-1">
            {filteredOptions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No patterns match your search</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {filteredOptions.map((opt) => {
                  const isSelected = value === opt;
                  const colorStyles = getPatternStyles(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        onChange(opt);
                        setOpen(false);
                      }}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-all cursor-pointer inline-flex items-center gap-1 group ${colorStyles} ${
                        isSelected
                          ? "ring-1 ring-signal ring-offset-0.5 font-semibold"
                          : "hover:brightness-95"
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="w-3 h-3 text-signal flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/*  Difficulty badge                                                          */
/* -------------------------------------------------------------------------- */

function DifficultyBadge({ difficulty }: { difficulty: string }) {
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

/* -------------------------------------------------------------------------- */
/*  Status icon                                                               */
/* -------------------------------------------------------------------------- */

function StatusIcon({ reps }: { reps: number | undefined }) {
  if (reps === undefined || reps === 0) {
    return <span className="text-gray-300 text-sm">—</span>;
  }
  if (reps >= 5) {
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  }
  return <RefreshCw className="w-4 h-4 text-gray-400" />;
}

/* -------------------------------------------------------------------------- */
/*  Skeleton row                                                              */
/* -------------------------------------------------------------------------- */

const SKELETON_TITLE_WIDTHS = ["w-36", "w-48", "w-56"];

function SkeletonRow({ index }: { index: number }) {
  return (
    <tr className="h-12 animate-pulse">
      <td className="pl-4 py-3.5 hidden md:table-cell">
        <div className="w-6 h-3 bg-gray-100 rounded" />
      </td>
      <td className="px-3 py-3.5">
        <div className={`${SKELETON_TITLE_WIDTHS[index % 3]} h-3 bg-gray-100 rounded`} />
      </td>
      <td className="px-3 py-3.5">
        <div className="w-16 h-5 bg-gray-100 rounded-full" />
      </td>
      <td className="px-3 py-3.5 hidden md:table-cell">
        <div className="w-32 h-5 bg-gray-100 rounded-full" />
      </td>
      <td className="px-3 py-3.5 text-right pr-4">
        <div className="w-4 h-4 bg-gray-100 rounded-full ml-auto" />
      </td>
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main page                                                                 */
/* -------------------------------------------------------------------------- */

export default function ProblemsPage() {
  const router = useRouter();

  /* ---- Data state ---- */
  const [problems, setProblems] = useState<Problem[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---- Filter state ---- */
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [pattern, setPattern] = useState("All");
  const [list, setList] = useState<CuratedListKey>("all");

  /* ---- Sort state ---- */
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  /* ---- Data fetch ---- */
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      const supabase = createClient();
      // Fire both queries in parallel
      const [problemsRes, statusRes] = await Promise.all([
        supabase
          .from("problems")
          .select("id, title, difficulty, patterns")
          .order("title", { ascending: true }),
        // Status query — for now with no auth, this will return empty.
        // When auth is wired up, this will use the RLS-filtered user_problems.
        supabase.from("user_problems").select("problem_id, reps"),
      ]);

      if (cancelled) return;

      if (problemsRes.error) {
        setError(problemsRes.error.message);
        setLoading(false);
        return;
      }

      setProblems(problemsRes.data as Problem[]);

      if (statusRes.data) {
        const map: Record<string, number> = {};
        for (const row of statusRes.data as UserStatus[]) {
          map[row.problem_id] = row.reps;
        }
        setStatusMap(map);
      }

      setLoading(false);
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---- Derived: all unique patterns ---- */
  const allPatterns = useMemo(() => {
    const set = new Set<string>();
    for (const p of problems) {
      if (p.patterns) p.patterns.forEach((t) => set.add(t));
    }
    return ["All", ...Array.from(set).sort()];
  }, [problems]);

  /* ---- Derived: problem topics for grouping ---- */
  const problemTopics = useMemo(() => {
    const map = new Map<string, string>();
    for (const section of NEETCODE_150_SECTIONS) {
      for (const p of section.problems) {
        map.set(p, section.topic);
      }
    }
    return map;
  }, []);

  /* ---- Filtered + sorted list ---- */
  const filtered = useMemo(() => {
    let result = problems;

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }

    // Difficulty
    if (difficulty !== "All") {
      result = result.filter((p) => p.difficulty === difficulty);
    }

    // Pattern
    if (pattern !== "All") {
      result = result.filter((p) => p.patterns?.includes(pattern));
    }

    // Curated list
    if (list !== "all") {
      const listSet = CURATED_LISTS[list];
      result = result.filter((p) => listSet.has(p.id));
    }

    // Sort
    if (sortField) {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        if (sortField === "title") {
          cmp = a.title.localeCompare(b.title);
        } else if (sortField === "difficulty") {
          cmp = (DIFFICULTY_ORDER[a.difficulty] ?? 1) - (DIFFICULTY_ORDER[b.difficulty] ?? 1);
        }
        return sortDir === "desc" ? -cmp : cmp;
      });
    } else {
      // Default sort by the selected list's order, or NeetCode 150 if "All" is selected
      const listForOrder = list !== "all" ? CURATED_LISTS[list] : CURATED_LISTS["neetcode-150"];
      const orderArr = Array.from(listForOrder);
      const orderMap = new Map(orderArr.map((id, idx) => [id, idx]));
      
      result = [...result].sort((a, b) => {
        const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
        const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return a.title.localeCompare(b.title);
      });
    }

    return result;
  }, [problems, search, difficulty, pattern, list, sortField, sortDir]);

  /* ---- Active filter chips ---- */
  const hasActiveFilters = difficulty !== "All" || pattern !== "All" || list !== "all" || search !== "";

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setDifficulty("All");
    setPattern("All");
    setList("all");
  }, []);

  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("asc");
      }
    },
    [sortField]
  );

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 inline ml-0.5" />
    ) : (
      <ArrowDown className="w-3 h-3 inline ml-0.5" />
    );
  };


  /* ---- Render ---- */
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Shell nav */}
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 bg-white">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-gray-900 cursor-pointer" onClick={() => router.push("/")}>
            Recurse
          </span>
          <nav className="hidden md:flex gap-4">
            <span className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
              Dashboard
            </span>
            <span className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
              Queue
            </span>
            <span className="text-sm text-gray-900 font-medium cursor-pointer">
              Problems
            </span>
          </nav>
        </div>
        <div className="text-sm text-gray-500 cursor-pointer">User ▾</div>
      </header>

      {/* Page content */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        {/* Page header */}
        <div className="flex items-end justify-between py-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Problems
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? "Loading…" : `${filtered.length} problem${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          {/* Add problem button — stub */}
          <button
            id="add-problem-btn"
            className="hidden sm:flex bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add problem
          </button>
          <button
            className="sm:hidden w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar */}
        <div className={`flex flex-wrap items-center gap-3 py-3 border-b border-gray-200 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="search-problems"
              type="text"
              placeholder="Search problems…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-signal focus:outline-none transition-shadow"
            />
          </div>

          <Dropdown<"All" | "Easy" | "Medium" | "Hard">
            id="filter-difficulty"
            label="Difficulty"
            value={difficulty}
            options={["All", "Easy", "Medium", "Hard"]}
            onChange={setDifficulty}
            renderOption={(v) => {
              if (v === "All") return "All";
              return <DifficultyBadge difficulty={v} />;
            }}
          />

          <PatternSelector
            value={pattern}
            options={allPatterns}
            onChange={setPattern}
          />

          <Dropdown<CuratedListKey>
            id="filter-list"
            label="List"
            value={list}
            options={["all", "neetcode-150", "blind-75", "grind-75"]}
            onChange={setList}
            renderOption={(v) => CURATED_LIST_LABELS[v]}
          />
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && !loading && (
          <div className="flex flex-wrap gap-2 pt-2">
            {search && (
              <FilterChip label={`"${search}"`} onRemove={() => setSearch("")} />
            )}
            {difficulty !== "All" && (
              <FilterChip label={difficulty} onRemove={() => setDifficulty("All")} />
            )}
            {pattern !== "All" && (
              <FilterChip label={pattern} onRemove={() => setPattern("All")} />
            )}
            {list !== "all" && (
              <FilterChip
                label={CURATED_LIST_LABELS[list]}
                onRemove={() => setList("all")}
              />
            )}
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="border border-red-200 bg-red-50 rounded-lg p-4 text-sm text-red-700 mt-4">
            Failed to load problems: {error}
          </div>
        )}

        {/* Table Container Card */}
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
                {loading &&
                  Array.from({ length: 10 }).map((_, i) => (
                    <SkeletonRow key={i} index={i} />
                  ))}

                {!loading && filtered.length === 0 && (
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

                {!loading && (() => {
                  let lastTopic: string | null = null;
                  const isDefaultSort = !sortField && (list === "all" || list === "neetcode-150");

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
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Filter chip                                                               */
/* -------------------------------------------------------------------------- */

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="rounded-full bg-gray-100 text-gray-700 px-2.5 py-1 text-xs font-medium flex items-center gap-1">
      {label}
      <X
        className="w-3 h-3 cursor-pointer hover:text-gray-900 transition-colors"
        onClick={onRemove}
      />
    </span>
  );
}
