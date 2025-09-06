import seedrandom from "seedrandom";

export type RandomGenerator = {
  next: () => number;
  intInRange: (minInclusive: number, maxInclusive: number) => number;
  pick: <T>(items: readonly T[]) => T;
  shuffle: <T>(items: readonly T[]) => T[];
};

export function createRandom(seed: string): RandomGenerator {
  const rng = seedrandom(seed);
  return {
    next: () => rng.quick(),
    intInRange: (minInclusive: number, maxInclusive: number) => {
      const x = rng.quick();
      return Math.floor(x * (maxInclusive - minInclusive + 1)) + minInclusive;
    },
    pick: <T>(items: readonly T[]): T => {
      const idx = Math.floor(rng.quick() * items.length);
      return items[idx];
    },
    shuffle: <T>(items: readonly T[]): T[] => {
      const arr = items.slice() as T[];
      for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rng.quick() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
  };
}

export function localDayKey(date: Date = new Date()): string {
  // YYYY-MM-DD in the user's local timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}


