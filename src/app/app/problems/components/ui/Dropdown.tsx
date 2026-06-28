"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

export function Dropdown<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  renderOption,
}: {
  id: string;
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
  renderOption?: (v: T) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const renderItem = (v: T) => {
    if (renderOption) return renderOption(v);
    return v;
  };
  const isActive = value !== options[0];

  return (
    <div ref={ref} className="relative" id={id}>
      <button
        onClick={() => setOpen((p) => !p)}
        className={`border rounded-lg px-3 py-2 text-sm flex items-center gap-1.5 transition-colors duration-150 cursor-pointer ${
          isActive
            ? "border-gray-900 text-gray-900 font-medium"
            : "border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span className="hidden sm:inline">{label}:</span>
        <span className="inline-flex items-center">{renderItem(value)}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-sm py-1">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors duration-100 ${
                value === opt
                  ? "text-gray-900 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="inline-flex items-center">{renderItem(opt)}</span>
              {value === opt && <Check className="w-4 h-4 text-[#38bdf8]" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
