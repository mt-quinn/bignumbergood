"use client";
import { useGameStore } from "@/store/game";
import { Playfield } from "@/components/Playfield";
import { ShareImage } from "@/components/ShareImage";

export default function Home() {
  const { daily, phase, presentationEval } = useGameStore();

  return (
    <div className="min-h-screen p-4 sm:p-6 grid grid-cols-1 gap-4">
      {/* Playfield is the main component, containing all game UI */}
      <div className="grid gap-4">
        <h1 className="text-2xl font-semibold text-center sm:text-left">Big Number Good</h1>
        <Playfield />

        {phase === "done" && presentationEval && (
          <section className="mt-4">
            <h2 className="text-lg font-medium mb-2 text-center sm:text-left">Share Your Result</h2>
            <ShareImage
              elements={daily.elements}
              reagentEmojis={daily.reagents.map(r => r.emoji)}
              final={presentationEval.final}
            />
          </section>
        )}
      </div>
    </div>
  );
}
