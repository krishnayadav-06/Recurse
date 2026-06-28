import React from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";

export function StatusIcon({ reps }: { reps: number | undefined }) {
  if (reps === undefined || reps === 0) {
    return <span className="text-gray-300 text-sm">—</span>;
  }
  if (reps >= 5) {
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  }
  return <RefreshCw className="w-4 h-4 text-gray-400" />;
}
