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
      const padding = 16; // tighter on mobile
      const headerReserve = 72; // title area
      const availW = Math.max(320, window.innerWidth - padding * 2);
      const availH = Math.max(420, window.innerHeight - headerReserve - padding * 2);
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
      <div className="h-full w-full rounded-2xl border bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-950 p-2 sm:p-4 overflow-hidden">
        {/* Mobile-first single column; switch to 3 columns on lg */}
        <div className="h-full w-full grid grid-rows-[1fr_auto_auto] lg:grid-rows-1 grid-cols-1 lg:grid-cols-[240px_1fr_200px] gap-2 sm:gap-3 overflow-hidden">
          {/* Left: Log (mobile order 3) */}
          <aside className="order-3 lg:order-1 h-full rounded-xl border bg-background/40 p-2 sm:p-3 overflow-auto min-h-0">
            <div className="text-xs uppercase text-gray-500 mb-2">Log</div>
            <section className="mb-4">
              <h2 className="text-xs uppercase text-gray-500 mb-1">Research</h2>
              <div className="text-xs sm:text-sm font-mono space-y-1">
                {(phase !== "research" ? researchEval?.steps : liveEval?.steps)?.map((s, i) => (
                  <div key={i}>{s.log}</div>
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-xs uppercase text-gray-500 mb-1">Presentation</h2>
              <div className="text-xs sm:text-sm font-mono space-y-1">
                {(phase === "presentation" ? liveEval?.steps : presentationEval?.steps)?.map((s, i) => (
                  <div key={i}>{s.log}</div>
                ))}
              </div>
            </section>
          </aside>

          {/* Center: Play area (mobile order 1) */}
          <main className="order-1 lg:order-2 h-full rounded-xl border bg-background/40 p-2 sm:p-3 flex flex-col min-h-0">
            <div className="text-xs sm:text-sm text-gray-500 mb-2 text-center lg:text-left">Seed: <span className="font-mono">{daily.seed}</span> — Phase: {phase}</div>
            <div className="flex-1 min-h-0">
              <Crucible />
            </div>
            <div className="mt-2 sm:mt-3 flex gap-2 justify-center">
              <button className="px-4 py-2 rounded border bg-white/70 hover:bg-white transition text-sm">Undo</button>
              {phase === "research" && (
                <button className="px-4 py-2 rounded border bg-white/70 hover:bg-white transition text-sm" onClick={actions.finalizeResearch}>Finish Research</button>
              )}
              {phase === "presentation" && (
                <button className="px-4 py-2 rounded border bg-white/70 hover:bg-white transition text-sm" onClick={actions.finalizePresentation}>Finish Presentation</button>
              )}
              {phase === "done" && (
                <>
                  <button className="px-4 py-2 rounded border bg-white/70 hover:bg-white transition text-sm" onClick={actions.retrySameIngredients}>Try Again (same)</button>
                  <button className="px-4 py-2 rounded border bg-white/70 hover:bg-white transition text-sm" onClick={actions.retryNewIngredients}>Try Again (new)</button>
                </>
              )}
            </div>
          </main>

          {/* Right: Gauge (mobile order 2, compact) */}
          <aside className="order-2 lg:order-3 h-full rounded-xl border bg-background/40 p-2 sm:p-3 flex flex-col items-center min-h-0">
            <div className="text-xs sm:text-sm uppercase text-gray-500 mb-1 sm:mb-2">Gauge</div>
            <div className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2">{labelFor(finalSoFar)}</div>
            <div className="w-full max-h-40 sm:max-h-none">
              <Gauge value={finalSoFar} />
            </div>
            <div className="mt-auto text-center">
              <div className="text-[10px] sm:text-xs text-gray-500">Final</div>
              <div className="font-mono text-base sm:text-lg break-all">{finalSoFar.toString()}</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


