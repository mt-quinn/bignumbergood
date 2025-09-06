"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = { value: bigint; maxLines?: number; minSize?: number; maxSize?: number };

export function FitNumber({ value, maxLines = 3, minSize = 12, maxSize = 36 }: Props) {
  const text = useMemo(() => value.toString(), [value]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const [fontSize, setFontSize] = useState<number>(maxSize);

  useEffect(() => {
    const container = containerRef.current;
    const span = spanRef.current;
    if (!container || !span) return;

    function fits(size: number): boolean {
      // Apply size and measure
      container.style.fontSize = `${size}px`;
      // Allow layout flush
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      span.offsetWidth;
      const lineHeight = 1.1;
      const maxH = Math.round(size * lineHeight * maxLines);
      const withinWidth = span.scrollWidth <= container.clientWidth + 0.5;
      const withinHeight = span.scrollHeight <= maxH + 0.5;
      return withinWidth && withinHeight;
    }

    // Binary search the largest size that fits
    let lo = minSize;
    let hi = maxSize;
    let best = minSize;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (fits(mid)) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    setFontSize(best);
  }, [text, maxLines, minSize, maxSize]);

  const lineHeight = 1.1;
  const maxHeight = Math.round(fontSize * lineHeight * maxLines);

  return (
    <div
      ref={containerRef}
      className="w-full text-center font-bold"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight,
        overflowWrap: "anywhere",
        wordBreak: "break-all",
        whiteSpace: "normal",
        maxHeight: `${maxHeight}px`,
        overflow: "hidden",
      }}
    >
      <span ref={spanRef}>{text}</span>
    </div>
  );
}


