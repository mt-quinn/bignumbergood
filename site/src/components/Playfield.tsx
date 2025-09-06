"use client";
import { Crucible } from "@/components/Crucible";
import { Gauge } from "@/components/Gauge";
import { labelFor } from "@/lib/gauge";
import { useGameStore } from "@/store/game";
import { useEffect, useMemo, useState } from "react";

export function Playfield() {
  const { daily, phase, researchEval, presentationEval, liveEval, actions } = useGameStore();
  const finalSoFar = (() => {
    if (phase === "research" || phase === "presentation") return liveEval?.final ?? 0n;
    if (phase === "done") return presentationEval?.final ?? 0n;
    return researchEval?.final ?? 0n;
  })();

  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const desiredAspect = useMemo(() => {
    if (typeof window === "undefined") return 16 / 9;
    return window.innerWidth >= 1024 ? 16 / 9 : 3 / 4; // desktop landscape, mobile portrait
  }, []);
  useEffect(() => {
    function update() {
      const padding = 24; // outer breathing room
      const headerReserve = 90; // allow for page title area
      const availW = Math.max(320, window.innerWidth - padding * 2);
      const availH = Math.max(320, window.innerHeight - headerReserve - padding * 2);
      // Fit box of aspect into viewport
      const widthByHeight = availH * desiredAspect;
      const width = Math.min(availW, widthByHeight, 1200);
      const height = Math.floor(width / desiredAspect);
      setSize({ width: Math.floor(width), height });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [desiredAspect]);

  return (
    <div className="mx-auto" style={{ width: size?.width, height: size?.height }}>
      <div className="h-full w-full rounded-2xl border bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-950 p-3 sm:p-5 overflow-hidden">
        <div className="h-full w-full grid grid-cols-[240px_1fr_200px] gap-3 sm:gap-4 overflow-hidden">
          {/* Left: Log */}
          <aside className="h-full rounded-xl border bg-background/40 p-3 overflow-auto min-h-0">
            <div className="text-xs uppercase text-gray-500 mb-2">Log</div>
            <section className="mb-4">
              <h2 className="text-xs uppercase text-gray-500 mb-1">Research</h2>
              <div className="text-sm font-mono space-y-1">
                {(phase !== "research" ? researchEval?.steps : liveEval?.steps)?.map((s, i) => (
                  <div key={i}>{s.log}</div>
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-xs uppercase text-gray-500 mb-1">Presentation</h2>
              <div className="text-sm font-mono space-y-1">
                {(phase === "presentation" ? liveEval?.steps : presentationEval?.steps)?.map((s, i) => (
                  <div key={i}>{s.log}</div>
                ))}
              </div>
            </section>
          </aside>

          {/* Center: Play area */}
          <main className="h-full rounded-xl border bg-background/40 p-3 sm:p-4 flex flex-col min-h-0">
            <div className="text-sm text-gray-500 mb-2">Seed: <span className="font-mono">{daily.seed}</span> — Phase: {phase}</div>
            <div className="flex-1 min-h-0">
              <Crucible />
            </div>
            <div className="mt-2 sm:mt-3 flex gap-2 justify-center">
              <button className="px-3 py-1 rounded border bg-white/60 hover:bg-white transition" onClick={actions.undo}>Undo</button>
              {phase === "research" && (
                <button className="px-3 py-1 rounded border bg-white/60 hover:bg-white transition" onClick={actions.finalizeResearch}>Finish Research</button>
              )}
              {phase === "presentation" && (
                <button className="px-3 py-1 rounded border bg-white/60 hover:bg-white transition" onClick={actions.finalizePresentation}>Finish Presentation</button>
              )}
              {phase === "done" && (
                <>
                  <button className="px-3 py-1 rounded border bg-white/60 hover:bg-white transition" onClick={actions.retrySameIngredients}>Try Again (same)</button>
                  <button className="px-3 py-1 rounded border bg-white/60 hover:bg-white transition" onClick={actions.retryNewIngredients}>Try Again (new)</button>
                </>
              )}
            </div>
          </main>

          {/* Right: Gauge */}
          <aside className="h-full rounded-xl border bg-background/40 p-3 flex flex-col items-center min-h-0">
            <div className="text-sm uppercase text-gray-500 mb-2">Gauge</div>
            <div className="text-2xl font-semibold mb-2">{labelFor(finalSoFar)}</div>
            <div className="w-full">
              <Gauge value={finalSoFar} />
            </div>
            <div className="mt-auto text-center">
              <div className="text-xs text-gray-500">Final</div>
              <div className="font-mono text-lg break-all">{finalSoFar.toString()}</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


