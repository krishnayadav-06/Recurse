import React from "react";
import { X } from "lucide-react";

export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="rounded-full bg-gray-100 text-gray-700 px-2.5 py-1 text-xs font-medium flex items-center gap-1">
      {label}
      <X
        className="w-3 h-3 cursor-pointer hover:text-gray-900 transition-colors"
        onClick={onRemove}
      />
    </span>
  );
}
