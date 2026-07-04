import React, { useState } from "react";
import { CheckCircle2, ChevronRight, Archive } from "lucide-react";

export type RatingOption = "Hard" | "Good" | "Easy" | "Mastered";

interface RatingOverlayProps {
  runtimeMs: number;
  memoryMb?: number;
  suggestedRating: RatingOption;
  onConfirm: (rating: RatingOption) => void;
  isMasterySuggested?: boolean;
}

export function RatingOverlay({ runtimeMs, memoryMb, suggestedRating, onConfirm, isMasterySuggested }: RatingOverlayProps) {
  const [selected, setSelected] = useState<RatingOption | null>(suggestedRating);

  // Interval projection for preview
  const getIntervalPreview = (r: RatingOption | null) => {
    switch (r) {
      case "Hard": return "tomorrow";
      case "Good": return "3 days";
      case "Easy": return "7 days";
      case "Mastered": return "never (untracked)";
      default: return "—";
    }
  };

  const isMastered = selected === "Mastered";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out space-y-4 px-4 py-3">
      {/* Step 1: Execution Result */}
      <div className="border border-gray-200 bg-white rounded-lg p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <div>
            <h3 className="font-semibold text-gray-900 tracking-tight">Accepted</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              Runtime: {runtimeMs}ms {memoryMb ? `· Memory: ${memoryMb}MB` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Step 2: FSRS Rating */}
      <div className="border border-gray-200 bg-gray-50 rounded-xl p-5 shadow-sm space-y-4">
        <h4 className="text-sm font-medium text-gray-900 tracking-tight">
          How was this problem for you?
        </h4>
        
        <div className="grid grid-cols-3 gap-2">
          {(["Hard", "Good", "Easy"] as RatingOption[]).map((r) => {
            const isSelected = selected === r;
            const isSuggested = suggestedRating === r;
            return (
              <button
                key={r}
                onClick={() => setSelected(r)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-150 ${
                  isSelected 
                    ? "border-gray-900 bg-white ring-1 ring-gray-900 shadow-sm" 
                    : isMasterySuggested
                      ? "border-gray-200 bg-gray-50/50 text-gray-300 hover:border-gray-300 hover:text-gray-500"
                      : "border-gray-200 bg-white hover:border-gray-400 text-gray-700"
                }`}
              >
                {isSuggested && !isSelected && (
                  <span className="absolute -top-2 bg-gray-900 text-white text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full z-10">
                    Suggested
                  </span>
                )}
                <span className={`text-sm font-medium ${isSelected ? "text-gray-900" : ""}`}>{r}</span>
              </button>
            );
          })}
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200/60">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelected("Mastered")}
              className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-md transition-colors relative ${
                isMastered 
                  ? "bg-gray-200 text-gray-900" 
                  : isMasterySuggested
                    ? "bg-amber-100 text-amber-900 hover:bg-amber-200 ring-1 ring-amber-300"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
            >
              {isMasterySuggested && !isMastered && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full z-10 shadow-sm border border-white">
                  Suggested
                </span>
              )}
              <Archive className="w-3.5 h-3.5" />
              Don't track (Mastered)
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-gray-500 block">Next review:</span>
              <span className={`text-sm font-mono font-medium ${selected === "Easy" ? "text-blue-600" : "text-gray-900"}`}>
                {getIntervalPreview(selected)}
              </span>
            </div>
            
            <button
              disabled={!selected}
              onClick={() => selected && onConfirm(selected)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-40 transition-all flex items-center gap-1"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
