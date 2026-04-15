import React, { useState, useRef } from "react";
import { Zap } from "lucide-react";

const initialCode = `# Two Sum
# Pattern: Hash Table
# Difficulty: Easy

def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i`;

function highlightPython(code: string) {
  const lines = code.split("\n");

  return lines.map((line, lineIndex) => {
    if (line.trim().startsWith("#")) {
      return (
        <span key={lineIndex} style={{ color: "#737373" }}>
          {line}
          {lineIndex < lines.length - 1 ? "\n" : ""}
        </span>
      );
    }

    const tokens: React.ReactNode[] = [];
    let currentPos = 0;
    const keywords = /\b(def|if|in|for|return|class|import|from|as|while|elif|else|try|except|finally|with|pass|break|continue)\b/g;
    const builtins = /\b(enumerate|range|len|print|str|int|list|dict|set|tuple)\b/g;
    const numbers = /\b(\d+)\b/g;

    const parts: { start: number; end: number; type: string }[] = [];

    let match;
    while ((match = keywords.exec(line)) !== null) {
      parts.push({ start: match.index, end: match.index + match[0].length, type: "keyword" });
    }
    while ((match = builtins.exec(line)) !== null) {
      parts.push({ start: match.index, end: match.index + match[0].length, type: "builtin" });
    }
    while ((match = numbers.exec(line)) !== null) {
      parts.push({ start: match.index, end: match.index + match[0].length, type: "number" });
    }

    parts.sort((a, b) => a.start - b.start);

    parts.forEach((part, i) => {
      if (part.start > currentPos) {
        tokens.push(<span key={`${lineIndex}-${i}-text`}>{line.substring(currentPos, part.start)}</span>);
      }
      const text = line.substring(part.start, part.end);
      const color = part.type === "keyword" ? "#c084fc" : part.type === "builtin" ? "#60a5fa" : "#fbbf24";
      tokens.push(<span key={`${lineIndex}-${i}-${part.type}`} style={{ color }}>{text}</span>);
      currentPos = part.end;
    });

    if (currentPos < line.length) {
      tokens.push(<span key={`${lineIndex}-end`}>{line.substring(currentPos)}</span>);
    }

    return (
      <span key={lineIndex}>
        {tokens}
        {lineIndex < lines.length - 1 ? "\n" : ""}
      </span>
    );
  });
}

export const CodeEditor: React.FC = () => {
  const [code, setCode] = useState<string>(initialCode);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
      highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  return (
    <div
      className="bg-[#0d0d0d] border rounded-2xl overflow-hidden transition-all duration-500 relative group w-full max-w-xl mx-auto shadow-[8px_8px_0_0_#E63B2E]"
      style={{
        borderColor: isFocused ? '#4ade80' : isHovered ? '#E63B2E' : '#2a2a2a',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-[#0d0d0d] border-b border-[#2a2a2a] px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ef4444] transition-all group-hover:shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          <div className="w-3 h-3 rounded-full bg-[#eab308] transition-all group-hover:shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
          <div className="w-3 h-3 rounded-full bg-[#4ade80] transition-all group-hover:shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
        </div>
        <span className="text-xs text-[#737373] ml-2 font-mono">problem-session.py</span>
        {isFocused ? (
          <span className="ml-auto text-xs text-[#4ade80] animate-pulse font-mono tracking-widest">● EDITING</span>
        ) : (
          <span className="ml-auto text-xs text-[#737373] opacity-0 group-hover:opacity-100 transition-opacity font-mono">TRY EDITING →</span>
        )}
      </div>

      <div className="p-6">
        <div className="relative w-full h-[280px] overflow-hidden rounded">
          <div
            ref={highlightRef}
            className="absolute inset-0 text-sm pointer-events-none overflow-hidden"
            style={{ fontFamily: "'Space Mono', monospace", lineHeight: "1.5", whiteSpace: "pre-wrap", wordWrap: "break-word", color: "#e8e8e8" }}
            aria-hidden="true"
          >
            {highlightPython(code)}
            {"\n"}
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onScroll={handleScroll}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="absolute inset-0 w-full h-full bg-transparent text-sm resize-none outline-none overflow-auto editor-scrollbar custom-cursor border-0"
            style={{ fontFamily: "'Space Mono', monospace", lineHeight: "1.5", caretColor: "#4ade80", color: "transparent", whiteSpace: "pre-wrap", wordWrap: "break-word" }}
            spellCheck={false}
          />
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-[#2a2a2a] mt-4">
          <Zap className="w-4 h-4 text-[#E63B2E] transition-all group-hover:animate-pulse" />
          <span className="text-[#E63B2E] font-mono text-xs tracking-widest">
            NEXT REVIEW: 3 DAYS
          </span>
        </div>
      </div>
      <style>{`
        .editor-scrollbar::-webkit-scrollbar { width: 12px; height: 12px; }
        .editor-scrollbar::-webkit-scrollbar-track { background: #0d0d0d; }
        .editor-scrollbar::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 6px; border: 2px solid #0d0d0d; }
        .editor-scrollbar::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
        .custom-cursor { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="2" height="16" viewBox="0 0 2 16"><rect width="2" height="16" fill="%234ade80"/></svg>') 1 8, text; }
      `}</style>
    </div>
  );
};
