import { createRandom, localDayKey } from "./prng";
import { OPERATOR_CATEGORIES, type OperatorId } from "./operators";

export type DailyPuzzle = {
  seed: string;
  elements: number[]; // 5 numbers: 3 <10, 1 in [10,50], 1 >50
  reagents: { id: OperatorId; emoji: string }[]; // 4 emojis (hidden meaning)
};

const POSITIVE: OperatorId[] = OPERATOR_CATEGORIES.positive;
const MISCHIEVOUS: OperatorId[] = OPERATOR_CATEGORIES.mischievous;
const NEGATIVE: OperatorId[] = OPERATOR_CATEGORIES.negative;

// Tangible, holdable objects (no trophies/abstract). Curated pool.
const REAGENT_EMOJIS = [
  "🍎","🍌","🍇","🍉","🍓","🍒","🍑","🥝","🍍","🥥",
  "🍔","🍟","🌭","🍕","🌮","🌯","🥪","🍜","🍣","🍪",
  "🍫","🍩","🍰","🧁","🥐","🥖","🧀","🥚","🥛","🧃",
  "🍺","🍷","🥤","🧋","🍶","🍵","☕️","🍼","🍾","🥫",
  "🧂","🧈","🫙","🍯","🍗","🍖","🥓","🥩","🥗","🥔",
  "🥕","🌽","🧄","🧅","🥒","🫑","🍄","🍆","🥫","🧊",
  "🔧","🔨","🪓","🪚","🔩","🔗","⛓️","🧲","🧪","⚗️",
  "🧴","🧺","🪣","🧹","🧽","🪥","🧻","🧼","🧯","🧷",
  "📦","📕","📘","📙","📗","📎","✂️","🖊️","✏️","🗝️",
  "🔑","🔒","🔓","🪙","💡","🔦","🕯️","🧯","🧸","🎲",
];

export function generateDaily(date: Date = new Date(), overrideSeed?: string): DailyPuzzle {
  const seed = overrideSeed ?? localDayKey(date);
  const rng = createRandom(seed);

  // elements: 3 small (<10), 1 mid (10-50), 1 large (>50 up to ~99)
  // Ensure small numbers are unique by sampling without replacement
  const smallPool = rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const small = [smallPool[0], smallPool[1], smallPool[2]];
  // Sample mid and large ensuring they are not equal to any chosen small
  let mid = rng.intInRange(10, 50);
  while (small.includes(mid)) mid = rng.intInRange(10, 50);
  let large = rng.intInRange(51, 99);
  while (small.includes(large) || large === mid) large = rng.intInRange(51, 99);
  const elements = rng.shuffle([small[0], small[1], small[2], mid, large]);

  // operators: 2 positive, 1 mischievous, 1 negative (no duplicates within category)
  const pos = rng.shuffle(POSITIVE).slice(0, 2);
  const mis = rng.pick(MISCHIEVOUS);
  const neg = rng.pick(NEGATIVE);
  const opIds: OperatorId[] = rng.shuffle([pos[0], pos[1], mis, neg]);

  // assign emojis randomly per day
  const emojis = rng.shuffle(REAGENT_EMOJIS).slice(0, 4);
  const reagents = opIds.map((id, i) => ({ id, emoji: emojis[i] }));

  return { seed, elements, reagents };
}

export function generateWithSeed(seed: string): DailyPuzzle {
  return generateDaily(new Date(), seed);
}


