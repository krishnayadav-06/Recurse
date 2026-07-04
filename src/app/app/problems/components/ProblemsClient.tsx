"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { Dropdown } from "./ui/Dropdown";
import { FilterChip } from "./ui/FilterChip";
import { PatternSelector } from "./PatternSelector";
import { ProblemsTable } from "./ProblemsTable";
import { CURATED_LISTS, CURATED_LIST_LABELS, NEETCODE_150_SECTIONS, type CuratedListKey } from "../../../../lib/curated-lists";
import { DifficultyBadge } from "./ui/DifficultyBadge";
import type { Problem, SortField, SortDir } from "../types";
import { StudyPlanCards } from "./StudyPlanCards";

const DIFFICULTY_ORDER: Record<string, number> = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
};

interface ProblemsClientProps {
  initialProblems: Problem[];
  initialStatusMap: Record<string, number>;
}

export function ProblemsClient({ initialProblems, initialStatusMap }: ProblemsClientProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [pattern, setPattern] = useState("All");
  const [list, setList] = useState<CuratedListKey>("all");

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const allPatterns = useMemo(() => {
    const set = new Set<string>();
    for (const p of initialProblems) {
      if (p.patterns) p.patterns.forEach((t) => set.add(t));
    }
    return ["All", ...Array.from(set).sort()];
  }, [initialProblems]);

  const problemTopics = useMemo(() => {
    const map = new Map<string, string>();
    for (const section of NEETCODE_150_SECTIONS) {
      for (const p of section.problems) {
        map.set(p, section.topic);
      }
    }
    return map;
  }, []);

  const filtered = useMemo(() => {
    let result = initialProblems;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }

    if (difficulty !== "All") {
      result = result.filter((p) => p.difficulty === difficulty);
    }

    if (pattern !== "All") {
      result = result.filter((p) => p.patterns?.includes(pattern));
    }

    if (list !== "all") {
      const listSet = CURATED_LISTS[list];
      result = result.filter((p) => listSet.has(p.id));
    }

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
  }, [initialProblems, search, difficulty, pattern, list, sortField, sortDir]);

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
        if (sortDir === "asc") {
          setSortDir("desc");
        } else {
          setSortField(null);
          setSortDir("asc");
        }
      } else {
        setSortField(field);
        setSortDir("asc");
      }
    },
    [sortField, sortDir]
  );

  const isDefaultSort = !sortField && (list === "all" || list === "neetcode-150");

  return (
    <>
      {/* Page content */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-1 flex flex-col pt-8 pb-12">
        <StudyPlanCards 
          currentList={list} 
          onSelectList={setList} 
          statusMap={initialStatusMap} 
        />

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 py-3 border-b border-gray-200 mt-2">
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
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 mb-2">
            {search && <FilterChip label={`"${search}"`} onRemove={() => setSearch("")} />}
            {difficulty !== "All" && <FilterChip label={difficulty} onRemove={() => setDifficulty("All")} />}
            {pattern !== "All" && <FilterChip label={pattern} onRemove={() => setPattern("All")} />}
            {list !== "all" && <FilterChip label={CURATED_LIST_LABELS[list]} onRemove={() => setList("all")} />}
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="mt-4">
          <ProblemsTable
            filtered={filtered}
            statusMap={initialStatusMap}
            problemTopics={problemTopics}
            sortField={sortField}
            sortDir={sortDir}
            toggleSort={toggleSort}
            clearAllFilters={clearAllFilters}
            isDefaultSort={isDefaultSort}
          />
        </div>
      </div>
    </>
  );
}
