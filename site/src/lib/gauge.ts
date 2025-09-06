export const GAUGE_LABELS: string[] = [
  "tiny",
  "little",
  "small",
  "modest",
  "chunky",
  "big",
  "huge",
  "immense",
  "titanic",
  "astronomical",
  "mythic",
  "unfathomable",
  "cosmic",
  "transcendent",
];

export function orderOfMagnitude(n: bigint): number {
  const s = n < 0n ? (-n).toString() : n.toString();
  // number of digits - 1 is base-10 order
  return Math.max(0, s.length - 1);
}

export function labelFor(n: bigint): string {
  const ord = orderOfMagnitude(n);
  return GAUGE_LABELS[Math.min(GAUGE_LABELS.length - 1, ord)];
}


