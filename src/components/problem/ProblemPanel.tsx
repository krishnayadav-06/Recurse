"use client";

import { ChevronDown, ChevronRight, CheckCircle2, XCircle, Code, Loader2, FileText, Lightbulb, History, MessageSquare, BookOpen, FlaskConical, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getPatternStyles } from "../../lib/utils";
import { createClient } from "../../utils/supabase/client";
import Editor from "@monaco-editor/react";

interface ProblemPanelProps {
  problemId: string;
  title: string;
  description: string;
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation?: string; images?: string[] }>;
  hints: string[];
  tags: string[];
  activeTab: "description" | "solutions" | "submissions";
  onTabChange: (tab: "description" | "solutions" | "submissions") => void;
  isSubmitting: boolean;
}

interface Submission {
  id: string;
  reviewed_at: string;
  execution_passed: boolean;
  review_duration_ms: number;
  language: string;
  code: string;
}

export function ProblemPanel({
  problemId,
  title,
  description,
  constraints,
  examples,
  hints,
  tags,
  activeTab,
  onTabChange,
  isSubmitting,
}: ProblemPanelProps) {
  const [hintsExpanded, setHintsExpanded] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [hasFetchedSubs, setHasFetchedSubs] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"Accepted" | "Wrong Answer" | null>(null);
  const [drawerSub, setDrawerSub] = useState<Submission | null>(null);

  const seenImages = new Set<string>();

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!hasFetchedSubs) setLoadingSubs(true);

      const supabase = createClient();
      const { data } = await supabase
        .from("review_logs")
        .select("*")
        .eq("problem_id", problemId)
        .order("reviewed_at", { ascending: false });

      if (data) setSubmissions(data);
      setLoadingSubs(false);
      setHasFetchedSubs(true);
    };

    if (!isSubmitting) {
      fetchSubmissions();
    }
  }, [problemId, isSubmitting]);

  const renderDescription = () => (
    <div className="space-y-5 p-5">
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
          {description}
        </div>
      </div>

      {examples.length > 0 && (
        <div className="space-y-3">
          {examples.map((ex, idx) => {
            const uniqueImages = ex.images?.filter((imgUrl) => {
              if (seenImages.has(imgUrl)) return false;
              seenImages.add(imgUrl);
              return true;
            }) || [];

            return (
              <div key={idx} className="border border-gray-200 bg-gray-50/50 rounded-lg p-3 space-y-1">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Example {idx + 1}
                </div>

                {uniqueImages.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2 mb-1">
                    {uniqueImages.map((imgUrl, i) => (
                      <img
                        key={i}
                        src={imgUrl}
                        alt={`Example ${idx + 1} Image ${i + 1}`}
                        className="max-w-full rounded-md border border-gray-200 shadow-sm max-h-64 object-contain self-start"
                      />
                    ))}
                  </div>
                )}

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
            );
          })}
        </div>
      )}

      {constraints.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-900">Constraints:</div>
          <ul className="list-disc pl-5 space-y-1">
            {constraints.map((c, i) => (
              <li key={i} className="text-sm text-gray-600">
                <code className="font-mono text-gray-700 bg-amber-50/50 border border-amber-100/50 px-1.5 py-0.5 rounded text-xs">{c}</code>
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

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-3 mt-auto border-t border-gray-100">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2.5 py-1 text-xs font-mono border ${getPatternStyles(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const renderSubmissions = () => {
    const filtered = submissions.filter((sub) => {
      if (filterStatus === null) return true;
      if (filterStatus === "Accepted" && sub.execution_passed) return true;
      if (filterStatus === "Wrong Answer" && !sub.execution_passed) return true;
      return false;
    });

    return (
      <div className="relative flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Filter chip row */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 shrink-0 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setFilterStatus(filterStatus === "Accepted" ? null : "Accepted")}
            className={
              filterStatus === "Accepted"
                ? "rounded-full border border-green-200 bg-green-50 text-green-700 text-xs px-3 py-1 font-medium whitespace-nowrap"
                : "rounded-full border border-gray-200 text-xs text-gray-500 px-3 py-1 cursor-pointer hover:border-gray-400 transition-colors whitespace-nowrap"
            }
          >
            Accepted
          </button>
          <button
            onClick={() => setFilterStatus(filterStatus === "Wrong Answer" ? null : "Wrong Answer")}
            className={
              filterStatus === "Wrong Answer"
                ? "rounded-full border border-red-200 bg-red-50 text-red-500 text-xs px-3 py-1 font-medium whitespace-nowrap"
                : "rounded-full border border-gray-200 text-xs text-gray-500 px-3 py-1 cursor-pointer hover:border-gray-400 transition-colors whitespace-nowrap"
            }
          >
            Wrong Answer
          </button>
        </div>

        {/* Submitting pulse state */}
        {isSubmitting && (
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 mx-4 mt-4">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin mb-2" />
            <div className="text-sm font-medium text-gray-900">Evaluating your solution...</div>
            <div className="text-xs text-gray-500 mt-1">Running against test cases</div>
          </div>
        )}

        {/* Loading state */}
        {!isSubmitting && loadingSubs && (
          <div className="flex justify-center pt-12">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isSubmitting && !loadingSubs && submissions.length === 0 && (
          <div className="text-xs text-gray-400 text-center py-12">
            <div>No submissions yet.</div>
            <div className="mt-1">Submit your code to see history here.</div>
          </div>
        )}

        {/* Table */}
        {!isSubmitting && !loadingSubs && submissions.length > 0 && (
          <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
            <div className="border border-gray-200 rounded-lg overflow-auto scrollbar-hide bg-white relative w-full">
              <div className="min-w-[400px]">
                {/* Header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-2 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                  {["Submission", "Language", "Runtime", "Code"].map((col) => (
                    <div key={col} className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      {col}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {filtered.map((sub) => (
                  <div
                    key={sub.id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-100 items-center"
                  >
                    {/* Status */}
                    <div className={`text-sm font-semibold truncate pr-2 ${sub.execution_passed ? "text-green-600" : "text-red-500"}`}>
                      {sub.execution_passed ? "Accepted" : "Wrong Answer"}
                    </div>

                    {/* Language */}
                    <div className="truncate pr-2">
                      <span className="rounded-full bg-gray-100 text-gray-600 px-2.5 py-0.5 text-xs font-mono">
                        {sub.language || "unknown"}
                      </span>
                    </div>

                    {/* Runtime */}
                    <div className="font-mono text-xs text-gray-600 truncate pr-2">
                      {sub.review_duration_ms != null ? `${sub.review_duration_ms} ms` : <span className="text-gray-400">N/A</span>}
                    </div>

                    {/* View */}
                    <div>
                      <button
                        onClick={() => setDrawerSub(sub)}
                        className="text-xs text-signal hover:underline cursor-pointer font-medium"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Code Drawer */}
        <div
          className="absolute inset-y-0 right-0 w-full bg-white z-10 flex flex-col border-l border-gray-200 transition-transform duration-200 ease-out"
          style={{ transform: drawerSub ? "translateX(0)" : "translateX(100%)" }}
        >
          {/* Drawer header */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-gray-50 shrink-0">
            <button onClick={() => setDrawerSub(null)}>
              <ArrowLeft className="w-4 h-4 text-gray-400 hover:text-gray-700 cursor-pointer" />
            </button>
            <span className="text-xs font-medium text-gray-600">Back to submissions</span>
            {drawerSub && (
              <div className="ml-auto flex items-center gap-2">
                <span className={`text-xs font-semibold ${drawerSub.execution_passed ? "text-green-600" : "text-red-500"}`}>
                  {drawerSub.execution_passed ? "Accepted" : "Wrong Answer"}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  · {new Date(drawerSub.reviewed_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
            )}
          </div>

          {/* Monaco editor */}
          <div className="flex-1 overflow-hidden">
            {drawerSub && (
              <Editor
                height="100%"
                language={drawerSub.language === "cpp" ? "cpp" : drawerSub.language === "java" ? "java" : "python"}
                value={drawerSub.code || ""}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  contextmenu: false,
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-white border-r border-gray-200 min-w-[260px] overflow-hidden relative">
      <div className="flex items-center border-b border-gray-200 px-3 bg-[#f8f9fa] shrink-0 h-[34px] gap-2.5">
        <button
          onClick={() => onTabChange("description")}
          className={`text-xs transition-colors flex items-center gap-1.5 ${
            activeTab === "description"
              ? "font-semibold text-gray-900"
              : "font-medium text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText className={`w-3.5 h-3.5 ${activeTab === "description" ? "text-blue-500" : "text-blue-400"}`} />
          Description
        </button>

        <div className="w-px h-3 bg-gray-300/80"></div>

        <button
          onClick={() => onTabChange("solutions")}
          className={`text-xs transition-colors flex items-center gap-1.5 ${
            activeTab === "solutions"
              ? "font-semibold text-gray-900"
              : "font-medium text-gray-500 hover:text-gray-700"
          }`}
        >
          <FlaskConical className={`w-3.5 h-3.5 ${activeTab === "solutions" ? "text-blue-500" : "text-blue-400"}`} />
          Solutions
        </button>

        <div className="w-px h-3 bg-gray-300/80"></div>

        <button
          onClick={() => onTabChange("submissions")}
          className={`text-xs transition-colors flex items-center gap-1.5 ${
            activeTab === "submissions"
              ? "font-semibold text-gray-900"
              : "font-medium text-gray-500 hover:text-gray-700"
          }`}
        >
          <History className={`w-3.5 h-3.5 ${activeTab === "submissions" ? "text-blue-500" : "text-blue-400"}`} />
          Submissions
          {isSubmitting && <Loader2 className="w-3 h-3 animate-spin text-signal ml-0.5" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {activeTab === "description" && (
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {renderDescription()}
          </div>
        )}
        {activeTab === "submissions" && renderSubmissions()}
        {activeTab === "solutions" && (
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-full">
              <FlaskConical className="w-12 h-12 text-blue-500 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Official Solutions</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                The official step-by-step solution and approach for this problem will be available soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
