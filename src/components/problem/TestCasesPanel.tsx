"use client";

import { CheckCircle2, XCircle, Plus, Loader2, X } from "lucide-react";
import { useState } from "react";

export type TestCaseState = "hidden" | "running" | "results" | "grading" | "graded";

export interface TestCase {
  id: string;
  input: string;
  output?: string;
  expected: string;
  status?: "pass" | "fail";
}

interface TestCasesPanelProps {
  state: TestCaseState;
  testCases: TestCase[];
  onClose: () => void;
  gradingResult?: { correct: boolean; message: string; solution?: string; executionTimeMs?: number };
}

export function TestCasesPanel({ state, testCases, onClose, gradingResult }: TestCasesPanelProps) {
  const [activeTab, setActiveTab] = useState<string>(testCases[0]?.id || "");
  const [showSolution, setShowSolution] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const handleClose = () => {
    onClose();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("collapse-test-panel"));
    }
  };


  // Handle global run errors (e.g., compilation error, crash before outputting JSON)
  // We can pass this error via gradingResult when state is "results"
  if (state === "results" && gradingResult && !gradingResult.correct) {
     return (
      <div className="flex flex-col h-full bg-white relative overflow-y-auto scrollbar-hide p-5">
        <button onClick={handleClose} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-700 z-10">
          <X size={16} />
        </button>
        <div className="border rounded-lg p-4 border-red-200 bg-red-50">
          <div className="font-medium flex items-center gap-2 text-red-700">
            <XCircle size={18} />
            Execution Error
          </div>
        </div>
        <div className="mt-4 bg-[#1e1e1e] rounded-lg p-4 font-mono text-xs text-red-400 overflow-x-auto">
          <pre>{gradingResult.message}</pre>
        </div>
      </div>
    );
  }

  const activeCase = testCases.find((tc) => tc.id === activeTab) || testCases[0];

  return (
    <div className="flex flex-col h-full bg-white relative">

      <div className="flex items-center justify-between border-b border-gray-200 pr-2">
        <div className="flex gap-1 px-3 pt-3 pb-2 overflow-x-auto">
          {testCases.map((tc, i) => (
            <button
              key={tc.id}
              onClick={() => setActiveTab(tc.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-mono flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tc.id ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {state !== "running" && tc.status === "pass" && <CheckCircle2 size={14} className="text-green-500" />}
              {state !== "running" && tc.status === "fail" && <XCircle size={14} className="text-red-500" />}
              Case {i + 1}
            </button>
          ))}
          <button className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 flex items-center">
            <Plus size={14} />
          </button>
        </div>
        <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-700">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3 space-y-4">
        <div>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100 pb-1 mb-2">
            Input
          </div>
          <div className="font-mono text-xs bg-gray-50 rounded p-2 text-gray-800 whitespace-pre-wrap">
            {activeCase?.input}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100 pb-1 mb-2 flex items-center gap-2">
            Output
            {state === "running" && <span className="text-[10px] text-blue-400 animate-pulse normal-case tracking-normal">Generating...</span>}
          </div>
          {state === "running" ? (
            <div className="font-mono text-xs bg-gray-50 rounded p-3 space-y-2.5">
              <div className="h-2.5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              <div className="h-2.5 bg-gray-200 rounded w-1/2 animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="h-2.5 bg-gray-200 rounded w-1/4 animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>
          ) : (
            <div
              className={`font-mono text-xs rounded p-2 ${
                activeCase?.status === "fail" ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-800"
              }`}
            >
              {activeCase?.output || "..."}
            </div>
          )}
        </div>
        <div>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100 pb-1 mb-2">
            Expected
          </div>
          <div className="font-mono text-xs bg-gray-50 rounded p-2 text-gray-600">
            {activeCase?.expected}
          </div>
        </div>
      </div>
    </div>
  );
}
