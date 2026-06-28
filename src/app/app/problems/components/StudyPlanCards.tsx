import React from "react";
import { CURATED_LISTS, CURATED_LIST_LABELS, type CuratedListKey } from "../../../../lib/curated-lists";

interface StudyPlanCardsProps {
  currentList: CuratedListKey;
  onSelectList: (list: CuratedListKey) => void;
  statusMap: Record<string, number>;
}

export function StudyPlanCards({ currentList, onSelectList, statusMap }: StudyPlanCardsProps) {
  const lists: { key: Exclude<CuratedListKey, "all">; tag: string; description: string }[] = [
    {
      key: "neetcode-150",
      tag: "NC-150",
      description: "Top 150 algorithmic questions.",
    },
    {
      key: "blind-75",
      tag: "B-75",
      description: "The legendary technical interview list.",
    },
    {
      key: "grind-75",
      tag: "G-75",
      description: "A modern version of the Blind 75.",
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        Study Plans
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map(({ key, tag, description }, index) => {
          const listSet = CURATED_LISTS[key];
          const totalCount = listSet.size;
          
          let completionCount = 0;
          listSet.forEach((problemId) => {
            if ((statusMap[problemId] || 0) >= 5) {
              completionCount++;
            }
          });

          const isSelected = currentList === key;
          const remainingCount = totalCount - completionCount;

          return (
            <button
              key={key}
              onClick={() => onSelectList(isSelected ? "all" : key)}
              className={`text-left w-full group rounded-lg border p-5 transition-colors duration-150 animate-fade-up outline-none ${
                isSelected 
                  ? "border-gray-900 bg-gray-50/50" 
                  : "border-gray-200 bg-white hover:border-gray-900"
              }`}
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                  {tag}
                </div>
                
                <div 
                  className="font-mono text-sm"
                  style={{ 
                    fontFamily: "'JetBrains Mono', monospace",
                    fontVariantNumeric: "tabular-nums",
                    fontFeatureSettings: '"tnum" 1, "zero" 1'
                  }}
                >
                  <span className="font-bold text-gray-900">{completionCount}</span>
                  <span className="text-gray-400"> / {totalCount}</span>
                </div>
              </div>
              
              <h3 className="text-sm font-semibold text-gray-900 mt-3">{CURATED_LIST_LABELS[key]}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              
              <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between items-center">
                <span className="text-xs font-mono text-gray-400">
                  {completionCount} solved &middot; {remainingCount} remaining
                </span>
                <span className="text-gray-900 font-bold transition-transform duration-150 group-hover:translate-x-[3px]">
                  &rarr;
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
