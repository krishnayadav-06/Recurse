"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ProblemPanelProps {
  title: string;
  description: string;
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation?: string }>;
  hints: string[];
  tags: string[];
}

export function ProblemPanel({
  title,
  description,
  constraints,
  examples,
  hints,
  tags,
}: ProblemPanelProps) {
  const [hintsExpanded, setHintsExpanded] = useState(false);

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-5 space-y-5 bg-white flex flex-col min-w-[260px]">
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
          {description}
        </div>
      </div>

      {examples.length > 0 && (
        <div className="space-y-3">
          {examples.map((ex, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-1">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Example {idx + 1}
              </div>
              <div className="font-mono text-xs text-gray-800 break-words mt-1">
                <span className="text-gray-500">Input:</span> {ex.input}
                <br />
                <span className="text-gray-500">Output:</span> {ex.output}
                {ex.explanation && (
                  <>
                    <br />
                    <span className="text-gray-500">Explanation:</span> {ex.explanation}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {constraints.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-900">Constraints:</div>
          <ul className="list-disc pl-5 space-y-1">
            {constraints.map((c, i) => (
              <li key={i} className="text-sm text-gray-600">
                <code className="font-mono text-gray-700 bg-gray-50 px-1 py-0.5 rounded text-xs">{c}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hints.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setHintsExpanded(!hintsExpanded)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            {hintsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span>{hintsExpanded ? "Hide Hints" : `Show hint 1 of ${hints.length}`}</span>
          </button>
          
          {hintsExpanded && (
            <div className="mt-3 space-y-2">
              {hints.map((hint, i) => (
                <div key={i} className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <span className="font-medium text-gray-900 mr-2">Hint {i + 1}:</span>
                  {hint}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1" />

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-100">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 text-gray-600 px-2.5 py-1 text-xs font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
