"use client";
import { useMemo } from "react";
import { GAUGE_LABELS, orderOfMagnitude } from "@/lib/gauge";

export function Gauge({ value }: { value: bigint }) {
  const index = useMemo(() => orderOfMagnitude(value), [value]);
  const clamped = Math.min(GAUGE_LABELS.length - 1, index);
  const itemHeight = 40; // px
  const visible = 4; // 3-4 visible at a time
  const offset = Math.max(0, clamped - Math.floor(visible / 2));

  return (
    <div className="w-full h-64 overflow-hidden relative">
      <div
        className="absolute left-2 top-2 text-xl transition-transform duration-300"
        style={{ transform: `translateY(${(clamped - offset) * itemHeight}px)` }}
      >
        ▲
      </div>
      <div
        className="transition-transform duration-300"
        style={{ transform: `translateY(-${offset * itemHeight}px)` }}
      >
        {GAUGE_LABELS.map((label, i) => (
          <div
            key={label}
            className={`h-10 flex items-center justify-center ${i === clamped ? "font-semibold" : "text-gray-500"}`}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}


