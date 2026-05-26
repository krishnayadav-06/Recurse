"use client";

import Editor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import { useEffect, useCallback } from "react";

interface EditorPanelProps {
  language: string;
  code: string;
  onChange: (value: string | undefined) => void;
  isSubmitting: boolean;
  onRun: () => void;
  onSubmit: () => void;
}

export function EditorPanel({
  language,
  code,
  onChange,
  isSubmitting,
  onRun,
  onSubmit,
}: EditorPanelProps) {
  // Keyboard shortcuts: Cmd/Ctrl+Enter → Run, Cmd/Ctrl+Shift+Enter → Submit
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isSubmitting) return;

      const mod = e.metaKey || e.ctrlKey;
      if (!mod || e.key !== "Enter") return;

      e.preventDefault();
      e.stopPropagation();

      if (e.shiftKey) {
        onSubmit();
      } else {
        onRun();
      }
    },
    [isSubmitting, onRun, onSubmit]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <div className="flex-1 overflow-hidden pt-2">
        <Editor
          height="100%"
          language={language === "python" ? "python" : language === "cpp" ? "cpp" : "java"}
          theme="vs-dark"
          value={code}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight: "line",
            bracketPairColorization: { enabled: true },
            fontSize: 13,
            fontFamily: "JetBrains Mono, monospace",
            lineHeight: 1.6,
          }}
        />
      </div>

      <div className="flex items-center gap-3 px-3 py-2 border-t border-gray-700 bg-[#1e1e1e] shrink-0">
        {/* Run button — ember hover */}
        <button
          onClick={onRun}
          disabled={isSubmitting}
          className="border border-gray-600 text-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:border-ember hover:ring-1 hover:ring-ember disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ▶ Run
        </button>

        {/* Submit button — CTA sweep animation matching Hero buttons */}
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="group relative inline-flex items-center justify-center overflow-hidden bg-white text-gray-900 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:-translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="absolute inset-0 bg-gray-200 translate-y-[100%] transition-transform duration-300 ease-out group-hover:translate-y-0 z-0" />
          <span className="relative z-10 flex items-center gap-1.5">
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span className="font-mono">grading…</span>
              </>
            ) : (
              "Submit →"
            )}
          </span>
        </button>
        
        <div className="ml-auto hidden lg:flex items-center gap-4 text-xs font-mono text-gray-600">
          <span>Cmd/Ctrl + Enter to Run</span>
          <span>Cmd/Ctrl + Shift + Enter to Submit</span>
        </div>
      </div>
    </div>
  );
}
