# Big Number Good — Refined Design Document

## Core Concept
Big Number Good is a daily alchemy-themed math puzzle where players attempt to create the largest number possible. 
Each day they receive a fresh set of **elements** (with known/displayed atomic numbers) and **reagents** (mysterious operators). 
The joy of play comes from **discovering what the reagents do, deducing sequencing strategies, and watching numbers balloon.**

The game emphasizes accessibility: even a “bad” run yields delightfully large numbers, while optimal sequencing rewards careful thinking.

---

## Daily Setup

- **Elements (Numbers):** 5 numbers, known at the start. Elements are represented with their atomic number, which is also their numerical value. There should be 3 numbers less than 10, one number between 10 and 50, and one number above 50.
- **Reagents (Operators):** 4 reagents, each represented by a completely random emoji
- **Grammar:** Equations are always structured left-to-right as:  
  `E₁ R₁ E₂ R₂ E₃ R₃ E₄ R₄ E₅`
- **Mandatory Use:** All elements and all reagents must be used exactly once.

---

## Gameplay Flow

### 1. Gameplay Loop
- There is a black circle in the middle of the screen representing the player's crucible. Above the circle is the row of reagents, and below is the row of elements with their numbers displayed. To the left of this whole section is the game log (described later)
- The player places elements and reagents into the crucible by dragging their tile from their row above or below the crucible onto the circle in the middle of the screen. As soon as the player releases each element into the crucible, their total and the game log both update. 
- As the number goes up, an arrow flies up a vertical gauge on the right side of the screen. This gauge is labeled with ever-increasing size descriptors, ranging from "tiny" to an ever absurdly increasing large size descriptor for every order of magnitude the player reaches. It should be animated and move quickly, and it should also *scroll vertically* such that only 3-4 sections of it are visible at a time.

### 2. Research Run (Discovery)
- The player builds a full sequence using all elements and reagents.  
- The crucible displays a **running total after each step**, letting the player infer each reagent’s effect.  
- A game log shows a history of reactions (eg. 5 🐍 4 = 20, 20 🍕 2 = 400). This log is visible throughout all phases, and always contains all information the player has uncovered so far (but without interpretation - just rote display).
- The final result does not count toward their score.

### 3. Presentation Run (Performance)
- The player constructs a second (and final) sequence using their deductions.  
- The result of this second run is locked in and entered onto leaderboards or percentiles.



---

## Reagent Pool

Each daily puzzle includes:
- **2 Positive operators** (growth)
- **1 Mischievous operator** (quirky, double-edged)
- **1 Negative operator** (forces strategic placement)

### Positive (2 chosen daily)
- **Addition:** `a + b`
- **Multiplication:** `a × b`
- **Exponentiation:** `a ^ b`
- **Concatenation:** `concat(a, b)` (e.g., 7 and 3 → 73)

### Mischievous (1 chosen daily)
- **Reset to B×1000:** overwrite `a` with `b × 1000`
- **Digit replacement:** replace all digits of `a` with the digits of `b`  
  - Example: (14, 67) → 6767  
  - Example: (1864, 9) → 9999

### Negative (1 chosen daily)
- **Subtraction:** `a − b`
- **Division:** `a ÷ b` (integer division)
- **Digit filter:** remove all instances of digit b from a  
  - Example: (1348, 3) → 148

---

## Design Principles

1. **Accessibility**  
   - Even poor runs yield big, funny numbers.  
   - Feedback is instant and clear (running total updates after each step).  

2. **Discovery**  
   - Reagent effects are never revealed directly.  
   - Players must deduce from number changes.  

3. **Replayability**  
   - Daily shuffle of elements and reagents.  
   - Prior knowledge doesn’t solve tomorrow’s puzzle.  

4. **Tone**  
   - Whimsical, light, and approachable.  
   - Reagents are random emoji (not math symbols).  
   - The alchemy theme frames failures as explosions and successes as spectacles.  

---

## Example Daily Puzzle

**Elements:** [7, 15, 28, 42, 90]  
**Reagents:**  🪐,  🐢,  🍉,  🧩

**Hidden meanings:**  
- 🪐 = addition  
- 🐢 = multiplication  
- 🍉 = reset to b×1000  
- 🧩 = subtraction  

### Research Run (random order)
1. `28 🧩 42` = -14  
2. `-14 🪐 7` = -7  
3. `-7 🍉 15` = 15,000  
4. `15,000 🐢 90` = 1,350,000  

**Final (research) total:** 1,350,000  

### Presentation Run (player attempt)
1. `7 🍉 15` = 15,000  
2. `15,000 🪐 42` = 15,042  
3. `15,042 🐢 90` = 1,353,780  
4. `1,353,780 🧩 28` = 1,353,752  

**Final (presentation) total:** 1,353,752  

---

## Why It Works

- **Satisfying escalation:** Numbers grow big almost no matter what.  
- **Strategic tension:** Negative and mischievous reagents force placement choices.  
- **Replayable depth:** With 2,880 permutations per day (5! × 4!), players can chase optimal strategies.  
- **Theme coherence:** The alchemy wrapper makes math playful and light.  

---

## Next Steps
- Build a daily generator that randomly selects elements + 2 positive, 1 mischievous, 1 negative reagent.  
- Playtest with small groups to balance the “badness” of negatives and “wildness” of mischievous effects.  
- Add flavor text for narrative reinforcement (e.g., “your crucible bursts into flame,” “the gold collapses to dust”).  