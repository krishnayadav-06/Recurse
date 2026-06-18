"use client";

import {
  LayoutList,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Rows,
  Columns,
  Maximize,
  Play,
  CloudUpload,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export type LayoutMode = "vertical" | "two-column" | "wide";

interface ProblemToolbarProps {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  language: string;
  setLanguage: (lang: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ProblemToolbar({
  title,
  difficulty,
  layoutMode,
  setLayoutMode,
  language,
  setLanguage,
  onRun,
  onSubmit,
  isSubmitting,
}: ProblemToolbarProps) {
  const router = useRouter();

  return (
    <div className="h-9 w-full bg-white border-b border-gray-200 flex items-center px-3 gap-2 shrink-0 relative z-10">
      {/* Left group */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/app/problems")}
          className="text-gray-500 hover:text-gray-900 cursor-pointer p-1"
          title="Back to Problems"
        >
          <LayoutList className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <div className="flex items-center gap-1">
          <button className="text-gray-500 hover:text-gray-900 cursor-pointer p-1 opacity-30 cursor-not-allowed" disabled>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="text-gray-500 hover:text-gray-900 cursor-pointer p-1 opacity-30 cursor-not-allowed" disabled>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button className="text-gray-500 hover:text-gray-900 cursor-pointer p-1" title="Random Problem">
          <Shuffle className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-gray-200 mx-2" />

        <h1 className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{title}</h1>

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
      </div>

      {/* Center group */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLayoutMode("vertical")}
            className={`p-1 rounded ${layoutMode === "vertical" ? "text-gray-900 bg-gray-100" : "text-gray-500 hover:text-gray-900"}`}
            title="Vertical Stack"
          >
            <Rows className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayoutMode("two-column")}
            className={`p-1 rounded hidden sm:block ${layoutMode === "two-column" ? "text-gray-900 bg-gray-100" : "text-gray-500 hover:text-gray-900"}`}
            title="Two Column"
          >
            <Columns className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayoutMode("wide")}
            className={`p-1 rounded hidden sm:block ${layoutMode === "wide" ? "text-gray-900 bg-gray-100" : "text-gray-500 hover:text-gray-900"}`}
            title="Wide Editor"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <div className="relative group">
          <button
            onClick={onRun}
            disabled={isSubmitting}
            className="text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-md px-3 py-1 text-xs font-medium flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed bg-white"
          >
            <Play className="w-4 h-4" />
            Run
          </button>
          
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex items-center gap-1.5 bg-white text-gray-900 border border-gray-200 shadow-xl text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap z-50">
            <span>Run</span>
            <span className="border border-gray-200 rounded px-1.5 py-0.5 text-[10px] leading-none bg-gray-100 text-gray-500 font-medium">Ctrl</span>
            <span className="border border-gray-200 rounded px-1.5 py-0.5 text-[10px] leading-none bg-gray-100 text-gray-500 font-medium">'</span>
          </div>
        </div>

        <div className="relative group">
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-gray-900 text-white hover:bg-gray-800 rounded-md px-3 py-1 text-xs font-medium flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-1 focus:ring-offset-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="font-mono">grading…</span>
              </>
            ) : (
              <>
                <CloudUpload className="w-3.5 h-3.5" />
                Submit &rarr;
              </>
            )}
          </button>
          
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex items-center gap-1.5 bg-white text-gray-900 border border-gray-200 shadow-xl text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap z-50">
            <span>Submit</span>
            <span className="border border-gray-200 rounded px-1.5 py-0.5 text-[10px] leading-none bg-gray-100 text-gray-500 font-medium">Ctrl</span>
            <span className="border border-gray-200 rounded px-1.5 py-0.5 text-[10px] leading-none bg-gray-100 text-gray-500 font-medium">Enter</span>
          </div>
        </div>
      </div>

      {/* Right group */}
      <div className="ml-auto flex items-center gap-2">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-white text-gray-700 text-xs font-mono border border-gray-200 rounded px-2 py-1 hover:border-gray-300 outline-none"
        >
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>
    </div>
  );
}
