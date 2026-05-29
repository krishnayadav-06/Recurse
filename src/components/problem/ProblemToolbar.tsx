"use client";

import { ArrowLeft, GripVertical, Columns, Rows, Maximize } from "lucide-react";
import Link from "next/link";
import { getPatternStyles } from "../../lib/utils";

export type LayoutMode = "vertical" | "two-column" | "wide";

interface ProblemToolbarProps {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

export function ProblemToolbar({
  title,
  difficulty,
  tags,
  layoutMode,
  setLayoutMode,
  language,
  setLanguage,
}: ProblemToolbarProps) {
  return (
    <div className="h-10 px-4 border-b border-gray-200 flex items-center gap-3 text-sm bg-white shrink-0">
      <Link href="/app/problems" className="text-gray-400 hover:text-gray-700">
        <ArrowLeft size={18} />
      </Link>
      
      <h1 className="font-medium text-gray-900 truncate max-w-[160px]">{title}</h1>
      
      {tags.length > 0 && (
        <span className={`rounded-full px-2 py-0.5 text-xs font-mono hidden sm:inline-block border ${getPatternStyles(tags[0])}`}>
          {tags[0]}
        </span>
      )}
      
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          difficulty === "Easy"
            ? "bg-green-50 text-green-700"
            : difficulty === "Medium"
            ? "bg-yellow-50 text-yellow-700"
            : "bg-red-50 text-red-700"
        }`}
      >
        {difficulty}
      </span>
      
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="border border-gray-200 rounded-md px-2 py-1 text-xs font-mono bg-white outline-none focus:ring-2 focus:ring-signal focus:border-transparent hidden sm:block"
      >
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="cpp">C++</option>
      </select>
      
      <div className="flex-1" />
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => setLayoutMode("vertical")}
          className={`p-1 rounded ${
            layoutMode === "vertical" ? "text-gray-900 bg-gray-100" : "text-gray-400 hover:text-gray-700"
          }`}
          title="Vertical Stack"
        >
          <Rows size={16} />
        </button>
        <button
          onClick={() => setLayoutMode("two-column")}
          className={`p-1 rounded hidden sm:block ${
            layoutMode === "two-column" ? "text-gray-900 bg-gray-100" : "text-gray-400 hover:text-gray-700"
          }`}
          title="Two Column"
        >
          <Columns size={16} />
        </button>
        <button
          onClick={() => setLayoutMode("wide")}
          className={`p-1 rounded hidden sm:block ${
            layoutMode === "wide" ? "text-gray-900 bg-gray-100" : "text-gray-400 hover:text-gray-700"
          }`}
          title="Wide Editor"
        >
          <Maximize size={16} />
        </button>
      </div>
    </div>
  );
}
