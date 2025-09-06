export type BigIntish = bigint;

export type OperatorId = "add" | "mul" | "pow" | "concat" | "resetBx1000" | "digitReplace" | "sub" | "div" | "digitFilter";

export type Operator = {
  id: OperatorId;
  emoji: string;
  apply: (a: BigIntish, b: BigIntish) => BigIntish;
  // For display/logging, we keep a short description
  describe: (a: BigIntish, b: BigIntish, result: BigIntish) => string;
};

function concatBigints(a: bigint, b: bigint): bigint {
  const s = a.toString() + b.toString();
  return BigInt(s);
}

function digitReplace(a: bigint, b: bigint): bigint {
  const bStr = b.toString();
  const aStr = a.toString();
  return BigInt(aStr.replace(/\d/g, bStr));
}

function digitFilter(a: bigint, b: bigint): bigint {
  const digitsB = new Set(b.toString().split(""));
  const filtered = a
    .toString()
    .split("")
    .filter((ch) => !digitsB.has(ch))
    .join("");
  // If all digits removed, treat as 0
  return BigInt(filtered === "" ? "0" : filtered);
}

function intDivTowardZero(a: bigint, b: bigint): bigint {
  if (b === 0n) return 0n; // avoid divide-by-zero: define as 0
  const sign = (a < 0n) !== (b < 0n) ? -1n : 1n;
  const abs = (x: bigint) => (x < 0n ? -x : x);
  const q = abs(a) / abs(b);
  return sign < 0n ? -q : q;
}

export const OPERATORS: Operator[] = [
  {
    id: "add",
    emoji: "➕",
    apply: (a, b) => a + b,
    describe: (a, b, r) => `${a} ${"➕"} ${b} = ${r}`,
  },
  {
    id: "mul",
    emoji: "✖️",
    apply: (a, b) => a * b,
    describe: (a, b, r) => `${a} ${"✖️"} ${b} = ${r}`,
  },
  {
    id: "pow",
    emoji: "^",
    apply: (a, b) => {
      // Fast exponentiation for bigint, b assumed non-negative
      let base = a;
      let exp = b < 0n ? 0n : b;
      let result = 1n;
      while (exp > 0n) {
        if (exp & 1n) result *= base;
        base *= base;
        exp >>= 1n;
      }
      return result;
    },
    describe: (a, b, r) => `${a} ^ ${b} = ${r}`,
  },
  {
    id: "concat",
    emoji: "🔗",
    apply: (a, b) => concatBigints(a, b),
    describe: (a, b, r) => `${a} ${"🔗"} ${b} = ${r}`,
  },
  {
    id: "resetBx1000",
    emoji: "🧪",
    apply: (_a, b) => b * 1000n,
    describe: (a, b, r) => `${a} ${"🧪"} ${b} = ${r}`,
  },
  {
    id: "digitReplace",
    emoji: "🔁",
    apply: (a, b) => digitReplace(a, b),
    describe: (a, b, r) => `${a} ${"🔁"} ${b} = ${r}`,
  },
  {
    id: "sub",
    emoji: "➖",
    apply: (a, b) => a - b,
    describe: (a, b, r) => `${a} ${"➖"} ${b} = ${r}`,
  },
  {
    id: "div",
    emoji: "➗",
    apply: (a, b) => intDivTowardZero(a, b),
    describe: (a, b, r) => `${a} ${"➗"} ${b} = ${r}`,
  },
  {
    id: "digitFilter",
    emoji: "🧹",
    apply: (a, b) => digitFilter(a, b),
    describe: (a, b, r) => `${a} ${"🧹"} ${b} = ${r}`,
  },
];

export type OperatorCategory = "positive" | "mischievous" | "negative";

export const OPERATOR_CATEGORIES: Record<OperatorCategory, OperatorId[]> = {
  positive: ["add", "mul", "pow", "concat"],
  mischievous: ["resetBx1000", "digitReplace"],
  negative: ["sub", "div", "digitFilter"],
};

export function getOperatorById(id: OperatorId): Operator {
  const op = OPERATORS.find((o) => o.id === id);
  if (!op) throw new Error(`Unknown operator id: ${id}`);
  return op;
}


