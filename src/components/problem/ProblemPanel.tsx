"use client";

import { ChevronDown, ChevronRight, CheckCircle2, XCircle, Code, Loader2, FileText, Lightbulb, History, MessageSquare, BookOpen, FlaskConical, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getPatternStyles } from "../../lib/utils";
import { createClient } from "../../utils/supabase/client";
import Editor from "@monaco-editor/react";
import { RatingOverlay } from "./RatingOverlay";
import DOMPurify from "isomorphic-dompurify";

interface ProblemPanelProps {
  problemId: string;
  title: string;
  description: string;
  htmlContent?: string;
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation?: string; images?: string[] }>;
  hints: string[];
  tags: string[];
  activeTab: "description" | "solutions" | "submissions";
  onTabChange: (tab: "description" | "solutions" | "submissions") => void;
  submissionState?: "idle" | "submitting" | "graded";
  gradingResult?: { correct: boolean; message: string; solution?: string; executionTimeMs?: number; reviewLogId?: string };
  onRatingConfirm?: (rating: string) => void;
  isMasterySuggested?: boolean;
  onClearSubmission?: () => void;
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
  htmlContent,
  constraints,
  examples,
  hints,
  tags,
  activeTab,
  onTabChange,
  submissionState = "idle",
  gradingResult,
  onRatingConfirm,
  isMasterySuggested,
  onClearSubmission,
}: ProblemPanelProps) {
  const [hintsExpanded, setHintsExpanded] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [hasFetchedSubs, setHasFetchedSubs] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"Accepted" | "Wrong Answer" | null>(null);
  const [drawerSub, setDrawerSub] = useState<Submission | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const seenImages = new Set<string>();

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!hasFetchedSubs) setLoadingSubs(true);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      let userId = user?.id;
      if (!userId && process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_DEV_USER_ID) {
        userId = process.env.NEXT_PUBLIC_DEV_USER_ID;
      }

      if (!userId) {
        setSubmissions([]);
        setLoadingSubs(false);
        setHasFetchedSubs(true);
        return;
      }

      const { data } = await supabase
        .from("review_logs")
        .select("*")
        .eq("problem_id", problemId)
        .eq("user_id", userId)
        .order("reviewed_at", { ascending: false });

      if (data) setSubmissions(data);
      setLoadingSubs(false);
      setHasFetchedSubs(true);
    };

    if (submissionState !== "submitting") {
      fetchSubmissions();
    }
  }, [problemId, submissionState]);

  const renderDescription = () => (
    <div className="space-y-5 p-5">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {htmlContent ? (
          <div
            className="
              text-[15px] text-gray-900 leading-relaxed problem-description-html tracking-tight font-sans
              [&_p]:mb-5 
              [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2
              [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-5 
              [&_strong]:font-semibold [&_strong]:text-black
              [&_em]:italic
              [&_img]:max-w-full [&_img]:my-8 [&_img]:mix-blend-multiply
              [&_code]:font-mono [&_code]:text-[13.5px] [&_code]:text-black [&_code]:bg-black/[0.04] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-sm
              
              /* Pre tags (older Leetcode format) */
              [&_pre]:my-8 [&_pre]:pl-4 [&_pre]:border-l-2 [&_pre]:border-gray-300 [&_pre]:text-[13.5px] [&_pre]:text-gray-800 [&_pre]:font-mono [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:leading-relaxed
              [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-black [&_pre_code]:rounded-none
              [&_pre_strong]:font-sans [&_pre_strong]:font-semibold [&_pre_strong]:text-black [&_pre_strong]:tracking-tight
              
              /* Example Block (newer Leetcode format) */
              [&_.example-block]:my-8 [&_.example-block]:pl-4 [&_.example-block]:border-l-2 [&_.example-block]:border-gray-300 [&_.example-block]:text-[13.5px] [&_.example-block]:text-gray-800 [&_.example-block]:font-mono [&_.example-block]:leading-relaxed
              [&_.example-block_p]:mb-1.5 [&_.example-block_p:last-child]:mb-0
              [&_.example-block_strong]:font-sans [&_.example-block_strong]:font-semibold [&_.example-block_strong]:text-black [&_.example-block_strong]:tracking-tight
              
              /* Example Wrapper (custom parsing format) */
              [&_.example-wrapper]:my-10 [&_.example-wrapper]:flex [&_.example-wrapper]:flex-col [&_.example-wrapper]:gap-3
              [&_.example-wrapper_img]:self-start [&_.example-wrapper_img]:max-h-[320px] [&_.example-wrapper_img]:object-contain [&_.example-wrapper_img]:my-4
              [&_.example-wrapper_pre]:my-2 [&_.example-wrapper_pre]:pl-4 [&_.example-wrapper_pre]:border-l-2 [&_.example-wrapper_pre]:border-gray-300 [&_.example-wrapper_pre]:bg-transparent [&_.example-wrapper_pre]:p-0 [&_.example-wrapper_pre]:text-[13.5px] [&_.example-wrapper_pre]:text-gray-800 [&_.example-wrapper_pre]:leading-relaxed
              [&_.example-wrapper_pre_strong]:font-sans [&_.example-wrapper_pre_strong]:font-semibold [&_.example-wrapper_pre_strong]:text-black [&_.example-wrapper_pre_strong]:tracking-tight
              
              [&_.example-wrapper_.example-block]:my-2 [&_.example-wrapper_.example-block]:pl-4 [&_.example-wrapper_.example-block]:border-l-2 [&_.example-wrapper_.example-block]:border-gray-300 [&_.example-wrapper_.example-block]:bg-transparent [&_.example-wrapper_.example-block]:p-0 [&_.example-wrapper_.example-block]:text-[13.5px] [&_.example-wrapper_.example-block]:text-gray-800 [&_.example-wrapper_.example-block]:font-mono [&_.example-wrapper_.example-block]:leading-relaxed
              [&_.example-wrapper_p]:mb-0
              [&_.example-wrapper_.example-block_p]:mb-1.5 [&_.example-wrapper_.example-block_p:last-child]:mb-0
              [&_.example-wrapper_.example-block_strong]:font-sans [&_.example-wrapper_.example-block_strong]:font-semibold [&_.example-wrapper_.example-block_strong]:text-black [&_.example-wrapper_.example-block_strong]:tracking-tight
              
              [&_.example]:block [&_.example]:text-[15px] [&_.example]:font-semibold [&_.example]:text-black [&_.example]:tracking-tight [&_.example]:mb-2
            "
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent, { ADD_ATTR: ['class'] }) }}
          />
        ) : (
          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {description}
          </div>
        )}
      </div>

      {!htmlContent && examples.length > 0 && (
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

                <div className="font-mono text-xs text-gray-800 break-words whitespace-pre-wrap mt-1">
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

      {!htmlContent && constraints.length > 0 && (
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
        {submissionState === "submitting" && (
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 mx-4 mt-4">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin mb-2" />
            <div className="text-sm font-medium text-gray-900">Evaluating your solution...</div>
            <div className="text-xs text-gray-500 mt-1">Running against test cases</div>
          </div>
        )}

        {/* Graded result state */}
        {submissionState === "graded" && gradingResult && (
          <div className="flex flex-col flex-1 overflow-y-auto scrollbar-hide p-5 relative">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onClearSubmission}
                className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Submissions History
              </button>
            </div>

            {gradingResult.correct ? (
              <div className="flex flex-col mt-4">
                <RatingOverlay
                  runtimeMs={gradingResult.executionTimeMs || 0}
                  suggestedRating={(isMasterySuggested ? "Mastered" : (gradingResult.executionTimeMs || 0) > 500 ? "Hard" : "Good") as any}
                  onConfirm={onRatingConfirm as any}
                  isMasterySuggested={isMasterySuggested}
                />
              </div>
            ) : (
              <div>
                <div className="border rounded-lg p-4 border-red-200 bg-red-50">
                  <div className="font-medium flex items-center gap-2 text-red-700">
                    <XCircle size={18} />
                    Not quite
                  </div>
                  {gradingResult.message && (
                    <div className="mt-1 text-sm opacity-80">{gradingResult.message}</div>
                  )}
                  {gradingResult.solution && (
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="mt-2 text-xs font-medium border border-gray-300 rounded px-2 py-1 bg-white hover:bg-gray-50 transition-colors"
                    >
                      {showSolution ? "Hide reference solution ↑" : "See reference solution ↓"}
                    </button>
                  )}
                </div>
                {gradingResult.solution && showSolution && (
                  <div className="mt-4 bg-gray-950 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
                    <pre>{gradingResult.solution}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Loading state */}
        {submissionState === "idle" && loadingSubs && (
          <div className="flex justify-center pt-12">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {submissionState === "idle" && !loadingSubs && submissions.length === 0 && (
          <div className="text-xs text-gray-400 text-center py-12">
            <div>No submissions yet.</div>
            <div className="mt-1">Submit your code to see history here.</div>
          </div>
        )}

        {/* Table */}
        {submissionState === "idle" && !loadingSubs && submissions.length > 0 && (
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
                  fontSize: 14,
                  fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
                  lineHeight: 19,
                  lineNumbersMinChars: 3,
                  glyphMargin: true,
                  folding: true,
                  padding: { top: 8 },
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
          className={`text-xs transition-colors flex items-center gap-1.5 ${activeTab === "description"
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
          className={`text-xs transition-colors flex items-center gap-1.5 ${activeTab === "solutions"
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
          className={`text-xs transition-colors flex items-center gap-1.5 ${activeTab === "submissions"
              ? "font-semibold text-gray-900"
              : "font-medium text-gray-500 hover:text-gray-700"
            }`}
        >
          <History className={`w-3.5 h-3.5 ${activeTab === "submissions" ? "text-blue-500" : "text-blue-400"}`} />
          Submissions
          {submissionState === "submitting" && <Loader2 className="w-3 h-3 animate-spin text-signal ml-0.5" />}
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
