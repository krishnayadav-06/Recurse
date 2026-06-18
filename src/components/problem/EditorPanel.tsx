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
  // Keyboard shortcuts: Ctrl+' → Run, Ctrl+Enter → Submit
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isSubmitting) return;

      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === "'") {
        e.preventDefault();
        e.stopPropagation();
        onRun();
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        onSubmit();
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
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
            lineHeight: 22,
          }}
        />
      </div>
    </div>
  );
}
