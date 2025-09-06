"use client";
import { create } from "zustand";
import { generateDaily, type DailyPuzzle } from "@/lib/daily";
import { evaluateSequence, evaluatePartialSequence, type Evaluation } from "@/lib/engine";
import { OperatorId } from "@/lib/operators";

export type Phase = "research" | "presentation" | "done";

export type ReagentItem = { id: OperatorId; emoji: string };

export type GameState = {
  daily: DailyPuzzle;
  phase: Phase;
  selectionElements: number[];
  selectionReagents: ReagentItem[];
  sequenceElements: number[];
  sequenceReagents: ReagentItem[];
  researchEval?: Evaluation;
  presentationEval?: Evaluation;
  liveEval?: Evaluation;
  actions: GameActions;
};

export type GameActions = {
  reset: (seedOverride?: string) => void;
  addElement: (value: number) => void;
  addReagent: (id: OperatorId, emoji: string) => void;
  undo: () => void;
  finalizeResearch: () => void;
  finalizePresentation: () => void;
  retrySameIngredients: () => void;
  retryNewIngredients: () => void;
};

function initDaily(seedOverride?: string) {
  const daily = generateDaily(new Date(), seedOverride);
  return {
    daily,
    selectionElements: [...daily.elements],
    selectionReagents: daily.reagents.map((r) => ({ id: r.id, emoji: r.emoji })),
    sequenceElements: [],
    sequenceReagents: [],
  };
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initDaily(),
  phase: "research",
  actions: {
    reset: (seedOverride?: string) => set({ ...initDaily(seedOverride), phase: "research", researchEval: undefined, presentationEval: undefined, liveEval: undefined }),
    addElement: (value: number) => {
      const s = get();
      // Grammar: must place an element when counts are equal (E R E R E R E R E)
      const canPlace = s.sequenceElements.length === s.sequenceReagents.length && s.sequenceElements.length < 5;
      if (canPlace && s.selectionElements.includes(value)) {
        const idx = s.selectionElements.indexOf(value);
        const nextSel = s.selectionElements.slice();
        nextSel.splice(idx, 1);
        const nextSeq = s.sequenceElements.concat([value]);
        const live = evaluatePartialSequence(nextSeq, s.sequenceReagents);
        set({ selectionElements: nextSel, sequenceElements: nextSeq, liveEval: live });
      }
    },
    addReagent: (id: OperatorId, emoji: string) => {
      const s = get();
      // Grammar: must place a reagent when there is exactly one more element than reagents
      const canPlace = s.sequenceElements.length === s.sequenceReagents.length + 1 && s.sequenceReagents.length < 4;
      const index = s.selectionReagents.findIndex((r) => r.id === id && r.emoji === emoji);
      if (canPlace && index >= 0) {
        const nextSel = s.selectionReagents.slice();
        nextSel.splice(index, 1);
        const nextSeq = s.sequenceReagents.concat([{ id, emoji }]);
        const live = evaluatePartialSequence(s.sequenceElements, nextSeq);
        set({ selectionReagents: nextSel, sequenceReagents: nextSeq, liveEval: live });
      }
    },
    undo: () => {
      const s = get();
      if (s.sequenceReagents.length > s.sequenceElements.length - 1) {
        const last = s.sequenceReagents[s.sequenceReagents.length - 1];
        const nextSelR = s.selectionReagents.concat([last]);
        const nextSeqR = s.sequenceReagents.slice(0, -1);
        const live = evaluatePartialSequence(s.sequenceElements, nextSeqR);
        set({ selectionReagents: nextSelR, sequenceReagents: nextSeqR, liveEval: live });
        return;
      }
      if (s.sequenceElements.length > 0) {
        const last = s.sequenceElements[s.sequenceElements.length - 1];
        const nextSelE = s.selectionElements.concat([last]);
        const nextSeqE = s.sequenceElements.slice(0, -1);
        const live = evaluatePartialSequence(nextSeqE, s.sequenceReagents);
        set({ selectionElements: nextSelE, sequenceElements: nextSeqE, liveEval: live });
      }
    },
    finalizeResearch: () => {
      const s = get();
      if (s.sequenceElements.length === 5 && s.sequenceReagents.length === 4) {
        const evaln = evaluateSequence(s.sequenceElements, s.sequenceReagents);
        set({ researchEval: evaln, phase: "presentation", sequenceElements: [], sequenceReagents: [], selectionElements: [...s.daily.elements], selectionReagents: s.daily.reagents.slice(), liveEval: undefined });
      }
    },
    finalizePresentation: () => {
      const s = get();
      if (s.sequenceElements.length === 5 && s.sequenceReagents.length === 4) {
        const evaln = evaluateSequence(s.sequenceElements, s.sequenceReagents);
        set({ presentationEval: evaln, phase: "done", liveEval: undefined });
      }
    },
    retrySameIngredients: () => {
      const s = get();
      set({ phase: "research", researchEval: undefined, presentationEval: undefined, sequenceElements: [], sequenceReagents: [], selectionElements: [...s.daily.elements], selectionReagents: s.daily.reagents.slice(), liveEval: undefined });
    },
    retryNewIngredients: () => {
      const newSeed = `debug-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
      get().actions.reset(newSeed);
    },
  },
}));


