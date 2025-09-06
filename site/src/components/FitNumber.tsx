"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = { value: bigint; maxLines?: number; minSize?: number; maxSize?: number };

export function FitNumber({ value, maxLines = 3, minSize = 12, maxSize = 36 }: Props) {
  const text = useMemo(() => value.toString(), [value]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fontSize, setFontSize] = useState<number>(maxSize);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const factor = 0.62; // approx width per character in em for bold digits
    function recalc() {
      if (!el) return; // Guard against null ref
      const width = el.clientWidth || 1;
      const columns = Math.ceil(text.length / maxLines);
      const estimatedSize = Math.floor((width / Math.max(1, columns)) / factor);
      const clamped = Math.max(minSize, Math.min(maxSize, estimatedSize));
      setFontSize(clamped);
    }
    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    return () => {
      try { ro.disconnect(); } catch {}
    };
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
        wordBreak: "break-word",
        whiteSpace: "normal",
        maxHeight: `${maxHeight}px`,
        overflow: "hidden",
      }}
    >
      {text}
    </div>
  );
}


