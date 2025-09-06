import { getElementInfo } from "./periodic";

export function formatWithCommas(n: bigint): string {
  const s = n.toString();
  const negative = s.startsWith("-");
  const core = negative ? s.slice(1) : s;
  const withCommas = core.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return negative ? `-${withCommas}` : withCommas;
}

const EMOJI_DESCRIPTIONS: Record<string, string> = {
  // Fruit & food
  "🍎": "apple",
  "🍌": "banana",
  "🍇": "grapes",
  "🍉": "watermelon",
  "🍓": "strawberry",
  "🍒": "cherries",
  "🍑": "peach",
  "🥝": "kiwi",
  "🍍": "pineapple",
  "🥥": "coconut",
  "🍔": "hamburger",
  "🍟": "fries",
  "🌭": "hot dog",
  "🍕": "pizza",
  "🌮": "taco",
  "🌯": "burrito",
  "🥪": "sandwich",
  "🍜": "noodles",
  "🍣": "sushi",
  "🍪": "cookie",
  "🍫": "chocolate bar",
  "🍩": "donut",
  "🍰": "cake",
  "🧁": "cupcake",
  "🥐": "croissant",
  "🥖": "baguette",
  "🧀": "cheese",
  "🥚": "egg",
  "🥛": "milk",
  "🧃": "juice box",
  "🍺": "beer",
  "🍷": "wine",
  "🥤": "soda cup",
  "🧋": "bubble tea",
  "🍶": "sake",
  "🍵": "tea",
  "☕️": "coffee",
  "🍼": "baby bottle",
  "🍾": "champagne",
  "🥫": "canned food",
  "🧂": "salt",
  "🧈": "butter",
  "🫙": "jar",
  "🍯": "honey",
  "🍗": "poultry leg",
  "🍖": "meat on bone",
  "🥓": "bacon",
  "🥩": "steak",
  "🥗": "salad",
  "🥔": "potato",
  "🥕": "carrot",
  "🌽": "corn",
  "🧄": "garlic",
  "🧅": "onion",
  "🥒": "cucumber",
  "🫑": "bell pepper",
  "🍄": "mushroom",
  "🍆": "eggplant",
  "🧊": "ice",
  // Tools & hardware
  "🔧": "wrench",
  "🔨": "hammer",
  "🪓": "axe",
  "🪚": "saw",
  "🔩": "nut and bolt",
  "🔗": "link",
  "⛓️": "chain",
  "🧲": "magnet",
  "🧪": "test tube",
  "⚗️": "alembic",
  // Household & cleaning
  "🧴": "lotion bottle",
  "🧺": "basket",
  "🪣": "bucket",
  "🧹": "broom",
  "🧽": "sponge",
  "🪥": "toothbrush",
  "🧻": "roll of paper",
  "🧼": "soap",
  "🧯": "fire extinguisher",
  "🧷": "safety pin",
  // Stationery & objects
  "📦": "box",
  "📕": "book",
  "📘": "blue book",
  "📙": "orange book",
  "📗": "green book",
  "📎": "paperclip",
  "✂️": "scissors",
  "🖊️": "pen",
  "✏️": "pencil",
  "🗝️": "old key",
  // Keys, lights, toys
  "🔑": "key",
  "🔒": "lock",
  "🔓": "unlocked lock",
  "🪙": "coin",
  "💡": "light bulb",
  "🔦": "flashlight",
  "🕯️": "candle",
  "🧸": "teddy bear",
  "🎲": "die",
};

export function describeEmoji(emoji: string): string {
  return EMOJI_DESCRIPTIONS[emoji] ?? "mystery";
}

function aOrAn(word: string): string {
  const ch = word.trim().toLowerCase()[0];
  return ["a", "e", "i", "o", "u"].includes(ch) ? "an" : "a";
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildSharePhrase(elements: number[], reagentEmojis: string[], final: bigint): string {
  const elementNames = elements.map((z) => (getElementInfo(z)?.name ?? `Z${z}`)).map((n) => n.toLowerCase());
  const reagentNames = reagentEmojis.map((e) => describeEmoji(e).toLowerCase());
  const eShuffled = shuffle(elementNames);
  const rShuffled = shuffle(reagentNames);
  // Alternate starting with element: E R E R E R E R E
  const parts: string[] = ["I combined"];
  for (let i = 0; i < eShuffled.length; i += 1) {
    const ename = eShuffled[i];
    // Element names: no article
    parts.push(ename);
    if (i < rShuffled.length) {
      const rname = rShuffled[i];
      parts.push("and");
      // Reagents: use a/an
      parts.push(`${aOrAn(rname)} ${rname}`);
    }
    if (i < eShuffled.length - 1 && i + 1 < eShuffled.length) {
      parts.push("and");
    }
  }
  parts.push("and all I got was");
  parts.push(`${formatWithCommas(final)}`);
  parts.push("gold");
  return parts.join(" ");
}

export type ShareToken = { text: string; color?: string };

export const ELEMENT_COLOR = "#22c55e"; // green-500
export const REAGENT_COLOR = "#3b82f6"; // blue-500
export const PLAIN_COLOR = "#F3F4F6"; // gray-100
export const TITLE_COLOR = "#F59E0B"; // amber-500

// Reagent nouns that shouldn't take an article (mass/uncountable nouns)
const NO_ARTICLE_REAGENTS = new Set<string>([
  "soap",
  "milk",
  "butter",
  "honey",
  "salt",
  "ice",
  "sushi",
  "bacon",
  "garlic",
  "tea",
  "coffee",
  "sake",
  "wine",
  "beer",
]);

export function buildShareTokens(
  elements: number[],
  reagentEmojis: string[],
  final: bigint
): ShareToken[] {
  const elementNames = elements.map((z) => (getElementInfo(z)?.name ?? `Z${z}`)).map((n) => n.toLowerCase());
  const reagentNames = reagentEmojis.map((e) => describeEmoji(e).toLowerCase());
  const eShuffled = shuffle(elementNames);
  const rShuffled = shuffle(reagentNames);

  const tokens: ShareToken[] = [];
  const pushPlain = (t: string) => tokens.push({ text: t, color: PLAIN_COLOR });
  const pushElem = (t: string) => tokens.push({ text: t, color: ELEMENT_COLOR });
  const pushReag = (t: string) => tokens.push({ text: t, color: REAGENT_COLOR });
  const pushTitle = (t: string) => tokens.push({ text: t, color: TITLE_COLOR });

  pushPlain("I COMBINED");

  for (let i = 0; i < eShuffled.length; i += 1) {
    const ename = eShuffled[i];
    pushPlain(" ");
    pushElem(ename);
    if (i < rShuffled.length) {
      const rname = rShuffled[i];
      pushPlain(" AND ");
      if (NO_ARTICLE_REAGENTS.has(rname)) {
        pushReag(rname);
      } else {
        const art = aOrAn(rname);
        pushReag(`${art} ${rname}`);
      }
    }
    if (i < eShuffled.length - 1 && i + 1 < eShuffled.length) {
      pushPlain(" AND ");
    }
  }

  pushPlain(" AND ALL I GOT WAS ");
  pushTitle(formatWithCommas(final));
  pushPlain(" ");
  pushTitle("GOLD");

  return tokens;
}


