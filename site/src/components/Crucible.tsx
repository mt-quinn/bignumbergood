"use client";
import { useGameStore } from "@/store/game";
import { getElementInfo } from "@/lib/periodic";
import { FitNumber } from "@/components/FitNumber";

function Tile({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="px-3 py-2 rounded-lg border bg-background text-base sm:text-lg hover:bg-white/70 transition">
      {children}
    </button>
  );
}

// A new component for items within the sequence display for clarity
function SequenceItem({ item }: { item: { type: 'element', value: number } | { type: 'reagent', emoji: string } }) {
  if (item.type === 'element') {
    return (
      <div className="w-16 h-16 rounded-md bg-gradient-to-b from-zinc-200 to-zinc-300 dark:from-zinc-600 dark:to-zinc-800 border border-zinc-400 dark:border-zinc-500 shadow-md flex items-center justify-center">
        <span className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          {item.value}
        </span>
      </div>
    );
  } else { // reagent
    return (
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-300 to-purple-400 dark:from-indigo-800 dark:to-purple-900 border border-indigo-400 dark:border-indigo-600 shadow-lg flex items-center justify-center">
        <span className="text-3xl">
          {item.emoji}
        </span>
      </div>
    );
  }
}

export function Crucible() {
  const { selectionElements, selectionReagents, sequenceElements, sequenceReagents, liveEval, actions } = useGameStore();
  const needsElement = sequenceElements.length === sequenceReagents.length && sequenceElements.length < 5;
  const needsReagent = sequenceElements.length === sequenceReagents.length + 1 && sequenceReagents.length < 4;
  
  const currentTotal = liveEval?.final ?? (sequenceElements[0] ? BigInt(sequenceElements[0]) : 0n);

  // Build the incremental sequence of chosen items
  const sequenceDisplay: React.ReactNode[] = [];
  for (let i = 0; i < sequenceElements.length; i++) {
    sequenceDisplay.push(<SequenceItem key={`e-${i}`} item={{ type: 'element', value: sequenceElements[i] }} />);
    if (i < sequenceReagents.length) {
      sequenceDisplay.push(<SequenceItem key={`r-${i}`} item={{ type: 'reagent', emoji: sequenceReagents[i].emoji }} />);
    }
  }

  return (
    <div className="h-full flex flex-col gap-2 sm:gap-3 min-h-0">
      {/* Top: Reagents Pool */}
      <div className={`${needsReagent ? "opacity-100" : "opacity-60"} transition-opacity`}>
        <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1 text-center">Reagents {needsReagent && <span className="text-blue-600">(Pick Next)</span>}</div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-1 justify-center">
          {selectionReagents.map((r, i) => (
            <Tile key={`${r.emoji}-${i}`} onClick={() => actions.addReagent(r.id, r.emoji)}>
              <span className="text-2xl">{r.emoji}</span>
            </Tile>
          ))}
        </div>
      </div>

      {/* Middle: Crucible Display (contained) */}
      <div className="flex-1 rounded-xl border bg-background/60 p-2 flex flex-col min-h-0 overflow-hidden text-center">
        {/* Reserve space for total to prevent overlap */}
        <div className="w-full min-h-[3.25rem] sm:min-h-[4rem]">
          <FitNumber value={currentTotal} maxLines={3} />
        </div>
        {/* Sequence area grows and scrolls within the panel */}
        <div className="flex-1 overflow-auto pt-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {sequenceDisplay}
          </div>
        </div>
      </div>

      {/* Bottom: Elements Pool */}
      <div className={`${needsElement ? "opacity-100" : "opacity-60"} transition-opacity`}>
        <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1 text-center">Elements {needsElement && <span className="text-blue-600">(Pick Next)</span>}</div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-1 justify-center">
          {selectionElements.map((n, i) => {
            const info = getElementInfo(n);
            return (
              <Tile key={`${n}-${i}`} onClick={() => actions.addElement(n)}>
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold leading-none">{n}</div>
                  <div className="text-sm font-medium">{info?.symbol ?? "?"}</div>
                </div>
              </Tile>
            );
          })}
        </div>
      </div>
    </div>
  );
}


