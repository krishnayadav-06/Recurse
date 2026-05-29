"use client";

import { CheckCircle2, XCircle, Plus, Loader2, X, Clock, AlertTriangle, Terminal } from "lucide-react";
import { useState } from "react";

export type TestCaseState = "hidden" | "running" | "results" | "grading" | "graded";

interface TestCase {
  id: string;
  input: string;
  output?: string;
  expected: string;
  status?: "pass" | "fail";
  error?: string;
}

interface TestCasesPanelProps {
  state: TestCaseState;
  testCases: TestCase[];
  onClose: () => void;
  gradingResult?: { correct: boolean; message: string; solution?: string };
}

export function TestCasesPanel({ state, testCases, onClose, gradingResult }: TestCasesPanelProps) {
  const [activeTab, setActiveTab] = useState<string>(testCases[0]?.id || "");

  if (state === "hidden") return null;

  /* ---- Spinner states ---- */
  if (state === "running" || state === "grading") {
    return (
      <div className="flex flex-col h-full bg-white relative">
        <button onClick={onClose} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-700 z-10 rounded-md hover:bg-gray-100 transition-colors">
          <X size={16} />
        </button>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-gray-100" />
              <Loader2 size={24} className="animate-spin text-gray-400 absolute inset-0 m-auto" />
            </div>
            <div className="font-mono text-xs text-gray-400">
              {state === "grading" ? "submitting & grading…" : "running test cases…"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Graded / Submit result ---- */
  if (state === "graded" && gradingResult) {
    return (
      <div className="flex flex-col h-full bg-white relative overflow-y-auto scrollbar-hide p-5">
        <button onClick={onClose} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-700 z-10 rounded-md hover:bg-gray-100 transition-colors">
          <X size={16} />
        </button>

        {/* Error/success banner */}
        <div
          className={`border rounded-xl p-4 ${
            gradingResult.correct
              ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/50"
              : "border-red-200 bg-gradient-to-br from-red-50 to-rose-50/50"
          }`}
        >
          <div
            className={`font-medium flex items-center gap-2 ${
              gradingResult.correct ? "text-green-700" : "text-red-700"
            }`}
          >
            {gradingResult.correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            {(() => {
              // Split message: first line is the title, rest is details
              const parts = gradingResult.message.split("\n\n");
              return parts[0] || (gradingResult.correct ? "Accepted" : "Error");
            })()}
          </div>
          {/* Show short part of the message if it's a simple one-liner */}
          {(() => {
            const parts = gradingResult.message.split("\n\n");
            // If there's no details section, show the message as a subtitle (if it differs from title)
            if (parts.length === 1 && gradingResult.correct) {
              return <div className="mt-2 text-sm opacity-80 leading-relaxed">{parts[0]}</div>;
            }
            return null;
          })()}
        </div>

        {/* Details block: compilation errors, runtime errors, raw stdout */}
        {(() => {
          const parts = gradingResult.message.split("\n\n");
          const details = parts.slice(1).join("\n\n");
          if (!details) return null;
          return (
            <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-3 py-1.5 border-b border-gray-200 bg-gray-50 flex items-center gap-1.5">
                <Terminal size={12} className="text-gray-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Output</span>
              </div>
              <pre className="px-3 py-2.5 text-xs font-mono text-gray-700 whitespace-pre-wrap break-words leading-relaxed max-h-60 overflow-y-auto bg-gray-950 text-gray-300">
                {details}
              </pre>
            </div>
          );
        })()}

        {/* Reference solution */}
        {!gradingResult.correct && gradingResult.solution && (
          <button className="mt-3 text-xs font-medium border border-gray-300 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50 transition-colors">
            See reference solution ↓
          </button>
        )}
        {!gradingResult.correct && gradingResult.solution && (
          <div className="mt-4 bg-gray-950 rounded-xl p-4 font-mono text-xs text-green-400 overflow-x-auto">
            <pre className="leading-relaxed">{gradingResult.solution}</pre>
          </div>
        )}
      </div>
    );
  }

  /* ---- Results view ---- */
  const activeCase = testCases.find((tc) => tc.id === activeTab) || testCases[0];
  const passCount = testCases.filter((tc) => tc.status === "pass").length;
  const failCount = testCases.filter((tc) => tc.status === "fail").length;
  const hasResults = testCases.some((tc) => tc.status !== undefined);
  const allPassed = hasResults && failCount === 0;

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* ---- Header with summary ---- */}
      <div className="border-b border-gray-200">
        {/* Summary bar (shown only when there are actual results) */}
        {hasResults && (
          <div className={`px-4 py-2 flex items-center gap-3 text-xs ${allPassed ? "bg-green-50/70" : "bg-red-50/50"}`}>
            <div className={`flex items-center gap-1.5 font-medium ${allPassed ? "text-green-700" : "text-red-700"}`}>
              {allPassed ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              {allPassed ? "All tests passed" : `${failCount} test${failCount !== 1 ? "s" : ""} failed`}
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                {passCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
                {failCount}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-400 transition-all duration-300"
                style={{ width: `${testCases.length > 0 ? (passCount / testCases.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex items-center justify-between pr-2">
          <div className="flex gap-1 px-3 pt-2 pb-2 overflow-x-auto">
            {testCases.map((tc, i) => {
              const isActive = activeTab === tc.id;
              return (
                <button
                  key={tc.id}
                  onClick={() => setActiveTab(tc.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-mono flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    isActive
                      ? tc.status === "fail"
                        ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                        : tc.status === "pass"
                        ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                        : "bg-gray-100 text-gray-900 ring-1 ring-gray-200"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {tc.status === "pass" && <CheckCircle2 size={13} className="text-green-500" />}
                  {tc.status === "fail" && <XCircle size={13} className="text-red-500" />}
                  Case {i + 1}
                </button>
              );
            })}
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ---- Test case detail ---- */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3 space-y-3">
        {/* Input */}
        <ResultBlock label="Input" icon={<Terminal size={12} />}>
          <code className="text-gray-800">{activeCase?.input}</code>
        </ResultBlock>

        {/* Output vs Expected: side-by-side when failed, stacked when passed */}
        {activeCase?.status === "fail" && !activeCase?.error ? (
          <div className="grid grid-cols-2 gap-2">
            <ResultBlock label="Your Output" variant="fail">
              <code className="text-red-700">{activeCase?.output || "—"}</code>
            </ResultBlock>
            <ResultBlock label="Expected" variant="pass">
              <code className="text-green-700">{activeCase?.expected}</code>
            </ResultBlock>
          </div>
        ) : (
          <>
            <ResultBlock
              label="Output"
              variant={activeCase?.status === "pass" ? "pass" : activeCase?.status === "fail" ? "fail" : undefined}
            >
              <code className={activeCase?.status === "pass" ? "text-green-700" : activeCase?.status === "fail" ? "text-red-700" : "text-gray-800"}>
                {activeCase?.output || "…"}
              </code>
            </ResultBlock>
            <ResultBlock label="Expected">
              <code className="text-gray-700">{activeCase?.expected}</code>
            </ResultBlock>
          </>
        )}

        {/* Error detail (stderr / runtime error) */}
        {activeCase?.error && (
          <div className="rounded-lg border border-red-200 bg-red-50/50 overflow-hidden">
            <div className="px-3 py-1.5 border-b border-red-100 flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-red-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red-500">Error</span>
            </div>
            <pre className="px-3 py-2 text-xs font-mono text-red-700 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {activeCase.error}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reusable block for input / output / expected                              */
/* -------------------------------------------------------------------------- */

function ResultBlock({
  label,
  icon,
  variant,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  variant?: "pass" | "fail";
  children: React.ReactNode;
}) {
  const bgColor =
    variant === "pass"
      ? "bg-green-50/60 border-green-100"
      : variant === "fail"
      ? "bg-red-50/60 border-red-100"
      : "bg-gray-50/80 border-gray-100";

  return (
    <div className={`rounded-lg border ${bgColor} overflow-hidden`}>
      <div className="px-3 py-1.5 border-b border-inherit flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      </div>
      <div className="px-3 py-2 font-mono text-xs whitespace-pre-wrap break-words leading-relaxed">
        {children}
      </div>
    </div>
  );
}
