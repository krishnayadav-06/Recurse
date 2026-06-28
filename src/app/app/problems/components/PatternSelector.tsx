"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { getPatternStyles } from "../../../../lib/utils";

export function PatternSelector({
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
