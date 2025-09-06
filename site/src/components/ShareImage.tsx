"use client";
import { useRef } from "react";
import { buildSharePhrase, buildShareTokens, TITLE_COLOR, PLAIN_COLOR } from "@/lib/share";

export function ShareImage({
  elements,
  reagentEmojis,
  final,
}: {
  elements: number[];
  reagentEmojis: string[];
  final: bigint;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function handleGenerate() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const phrase = buildSharePhrase(elements, reagentEmojis, final);
    const tokens = buildShareTokens(elements, reagentEmojis, final);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 1200;
    const TITLE_TEXT = "www.bignumbergood.com";
    const BODY_FONT_SIZE = 48; // larger, punchier body
    const family = "Impact, Haettenschweiler, 'Arial Black', Oswald, system-ui, sans-serif";
    const sidePad = 64; // horizontal padding
    const gap = 10; // tiny gap between body and title (title now below)

    // Body font setup
    const bodyFont = `800 ${BODY_FONT_SIZE}px ${family}`;
    const bodyLineHeight = Math.round(BODY_FONT_SIZE * 1.05);

    // Measure body lines first to compute exact height; use all-caps for wrapping
    ctx.font = bodyFont;
    const phraseUpper = phrase.toUpperCase();
    const lines = wrapText(ctx, phraseUpper, W - sidePad * 2);
    const bodyHeight = lines.length * bodyLineHeight;

    // Dynamically determine title font size to fit available width
    const maxTitleSize = 128;
    const minTitleSize = 28;
    let titleSize = maxTitleSize;
    ctx.font = `800 ${titleSize}px ${family}`;
    const maxTitleWidth = W - sidePad * 2;
    const titleUpper = TITLE_TEXT.toUpperCase();
    while (titleSize > minTitleSize && ctx.measureText(titleUpper).width > maxTitleWidth) {
      titleSize -= 2;
      ctx.font = `800 ${titleSize}px ${family}`;
    }
    const titleFont = `800 ${titleSize}px ${family}`;
    const titleLineHeight = Math.round(titleSize * 1.05);
    const titleWidth = ctx.measureText(titleUpper).width;

    // Compute tight canvas height with minimal vertical padding
    const topPad = 20;
    const bottomPad = 20;
    const H = topPad + bodyHeight + gap + titleLineHeight + bottomPad;
    canvas.width = W;
    canvas.height = H;

    // Redraw with fresh state after resize
    const ctx2 = canvas.getContext("2d");
    if (!ctx2) return;
    ctx2.textBaseline = "top";
    // Background
    ctx2.fillStyle = "#111827";
    ctx2.fillRect(0, 0, W, H);

    // Draw body (centered) with colored tokens per line
    ctx2.font = bodyFont;
    let y = topPad;
    const lines2 = wrapTokens(ctx2, tokens, W - sidePad * 2);
    for (const lineTokens of lines2) {
      const lineWidth = measureTokens(ctx2, lineTokens);
      let x = (W - lineWidth) / 2;
      for (const tk of lineTokens) {
        ctx2.fillStyle = tk.color ?? PLAIN_COLOR;
        ctx2.fillText(tk.text.toUpperCase(), x, y);
        x += ctx2.measureText(tk.text.toUpperCase()).width;
      }
      y += bodyLineHeight;
    }

    // Draw title BELOW body (after measuring actual y)
    ctx2.fillStyle = TITLE_COLOR;
    ctx2.font = titleFont;
    const titleY = y + gap;
    // If title would overflow, increase canvas height and redraw once
    if (titleY + titleLineHeight + bottomPad > H) {
      const extra = titleY + titleLineHeight + bottomPad - H;
      canvas.height = H + extra;
      const ctx3 = canvas.getContext("2d");
      if (!ctx3) return;
      ctx3.textBaseline = "top";
      ctx3.fillStyle = "#111827";
      ctx3.fillRect(0, 0, W, H + extra);
      // Repaint body
      ctx3.font = bodyFont;
      let y2 = topPad;
      for (const lineTokens of lines2) {
        const lw = measureTokens(ctx3, lineTokens);
        let x2 = (W - lw) / 2;
        for (const tk of lineTokens) {
          ctx3.fillStyle = tk.color ?? PLAIN_COLOR;
          ctx3.fillText(tk.text.toUpperCase(), x2, y2);
          x2 += ctx3.measureText(tk.text.toUpperCase()).width;
        }
        y2 += bodyLineHeight;
      }
      // Draw title
      ctx3.fillStyle = TITLE_COLOR;
      ctx3.font = titleFont;
      ctx3.fillText(titleUpper, (W - titleWidth) / 2, y + gap);
      return;
    }
    ctx2.fillText(titleUpper, (W - titleWidth) / 2, titleY);
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "big-number-good.png";
    a.click();
  }

  return (
    <div className="grid gap-2">
      <canvas ref={canvasRef} className="block w-full max-w-[900px] h-auto border rounded" />
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded border" onClick={handleGenerate}>Generate image</button>
        <button className="px-3 py-2 rounded border" onClick={handleDownload}>Download</button>
      </div>
    </div>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const test = current ? current + " " + w : w;
    const width = ctx.measureText(test).width;
    if (width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

type Token = { text: string; color?: string };
function wrapTokens(ctx: CanvasRenderingContext2D, tokens: Token[], maxWidth: number): Token[][] {
  const lines: Token[][] = [];
  let current: Token[] = [];

  function widthOf(tks: Token[]): number {
    let w = 0;
    for (const tk of tks) {
      w += ctx.measureText(tk.text.toUpperCase()).width;
    }
    return w;
  }

  function splitTokenByWidth(tk: Token): Token[] {
    const text = tk.text.toUpperCase();
    const parts: Token[] = [];
    let i = 0;
    while (i < text.length) {
      // If the whole remaining text fits, push and break
      const remaining = text.slice(i);
      const remWidth = ctx.measureText(remaining).width;
      if (remWidth <= maxWidth) {
        parts.push({ text: remaining, color: tk.color });
        break;
      }
      // Binary search the largest slice that fits
      let lo = 1;
      let hi = remaining.length;
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        const slice = remaining.slice(0, mid);
        const width = ctx.measureText(slice).width;
        if (width <= maxWidth) lo = mid + 1; else hi = mid;
      }
      const end = Math.max(1, lo - 1);
      parts.push({ text: remaining.slice(0, end), color: tk.color });
      i += end;
    }
    return parts;
  }

  for (const tk of tokens) {
    const segments = splitTokenByWidth(tk);
    for (const seg of segments) {
      const test = current.concat([seg]);
      if (widthOf(test) > maxWidth && current.length > 0) {
        lines.push(current);
        current = [seg];
      } else {
        current = test;
      }
    }
  }
  if (current.length > 0) lines.push(current);
  return lines;
}

function measureTokens(ctx: CanvasRenderingContext2D, tokens: Token[]): number {
  let w = 0;
  for (const tk of tokens) {
    w += ctx.measureText(tk.text.toUpperCase()).width;
  }
  return w;
}


