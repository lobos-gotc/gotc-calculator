# GOTC Calculators - Application Architecture

## Overview

This is a **Game of Thrones Conquest** calculator application for template crafting and march size optimization. It's a single-page web app built with vanilla JavaScript.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    USER INTERFACE                                    │
│                                     (index.html)                                     │
│  ┌──────────────────────────────────┐    ┌────────────────────────────────────────┐ │
│  │     TEMPLATE CALCULATOR          │    │       MARCH SIZE CALCULATOR            │ │
│  │  ┌─────────────────────────────┐ │    │  ┌─────────────────────────────────┐   │ │
│  │  │ Step 1: Material Input      │ │    │  │ Step 1: Research Selection      │   │ │
│  │  │ Step 2: Crafting Strategy   │ │    │  │ Step 2: Hero Configuration      │   │ │
│  │  │ Step 3: Results             │ │    │  │ Step 3: March Size Results      │   │ │
│  │  └─────────────────────────────┘ │    │  └─────────────────────────────────┘   │ │
│  └──────────────────────────────────┘    └────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION LOGIC LAYER                                 │
│                                                                                      │
│  ┌────────────────────┐  ┌────────────────────┐  ┌─────────────────────────────┐   │
│  │    wizard.js       │  │   craftparse.js    │  │   template-planner.js       │   │
│  │  ─────────────     │  │  ──────────────    │  │  ────────────────────       │   │
│  │  • Navigation      │  │  • Core Calculation│  │  • Material Balancing       │   │
│  │  • UI State        │  │  • Product Scoring │  │  • Cascade Projection       │   │
│  │  • Event Handling  │  │  • Material Deduct │  │  • Auto Value Calculation   │   │
│  │  • Carousel View   │  │  • Plan Generation │  │  • Survival Rates           │   │
│  └─────────┬──────────┘  └─────────┬──────────┘  └──────────────┬──────────────┘   │
│            │                       │                             │                  │
│            └───────────────────────┼─────────────────────────────┘                  │
│                                    │                                                │
│  ┌────────────────────┐  ┌────────┴───────────┐  ┌──────────────────────────────┐  │
│  │   optimizer.js     │  │   ms-calculator.js │  │      history.js              │  │
│  │  ─────────────     │  │  ────────────────  │  │  ────────────────            │  │
│  │  • Product Ranking │  │  • March Size Calc │  │  • Save/Load State           │  │
│  │  • Strategy Logic  │  │  • Hero Bonuses    │  │  • Calculation History       │  │
│  │  • Fast-tracking   │  │  • Research Bonus  │  │  • LocalStorage              │  │
│  └────────────────────┘  └────────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   DATA LAYER                                         │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                              products.js                                      │   │
│  │  Aggregates all season data into craftItem.products[]                        │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                           │
│         ┌───────────────────────────────┼───────────────────────────────┐          │
│         ▼                               ▼                               ▼          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │
│  │ season0.js  │  │ season1.js  │  │ season2.js  │  │  seasonctw.js           │   │
│  │ (Basic)     │  │ (Daenerys)  │  │ (Tyrion)    │  │  (CTW - Ceremonial)     │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────────┘   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   ... season3-12.js          │
│  │ season3.js  │  │ season4.js  │  │ season5.js  │                              │   │
│  └─────────────┘  └─────────────┘  └─────────────┘                              │   │
│                                                                                      │
│  ┌─────────────────────────┐  ┌────────────────────────────────────────────────┐   │
│  │     materials.js        │  │              ms-data.js                        │   │
│  │  ───────────────────    │  │  ──────────────────────────                    │   │
│  │  Material definitions   │  │  March size bonuses, heroes,                   │   │
│  │  by season (images,     │  │  research data, gear slots,                    │   │
│  │  IDs, display names)    │  │  armory bonuses                                │   │
│  └─────────────────────────┘  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               ASSETS & RESOURCES                                     │
│                                                                                      │
│  resources/                                                                          │
│  ├── materials/     (86 .png, 13 .webp) - Crafting material icons                   │
│  ├── item/          (663 .png, 31 .webp) - Gear piece images                        │
│  ├── heroes/        (40 .png) - Hero portraits                                      │
│  ├── armories/      (19 .png) - Armory icons                                        │
│  ├── trinkets/      (17 .png) - Trinket icons                                       │
│  └── research/      (12 .png) - Research icons                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Template Calculator - Calculation Flow

```
                              ┌──────────────────────────┐
                              │   USER INPUTS MATERIALS  │
                              │  (Step 1 - My Materials) │
                              └────────────┬─────────────┘
                                           │
                                           ▼
                              ┌──────────────────────────┐
                              │  gatherMaterialsFromInputs()
                              │  (craftparse.js)         │
                              │  Collects all material   │
                              │  quantities from inputs  │
                              └────────────┬─────────────┘
                                           │
                                           ▼
                        ┌──────────────────────────────────────┐
                        │   USER CONFIGURES STRATEGY (Step 2)  │
                        │  • Usage % (60-100%)                 │
                        │  • Quality levels per template tier  │
                        │  • Season gear preferences           │
                        │  • CTW (Ceremonial) options          │
                        │  • Template counts per level         │
                        └──────────────────┬───────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        calculateWithPreferences()                                 │
│                            (craftparse.js)                                        │
│                                                                                   │
│  1. Gather materials from inputs                                                 │
│  2. Read quality multipliers per level                                           │
│  3. Read template counts per level (1, 5, 10, 15, 20, 25, 30, 35, 40, 45)       │
│  4. Apply usage percentage to limit material consumption                         │
│  5. Pass to calculateProductionPlan()                                            │
└──────────────────────────────────────┬───────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        calculateProductionPlan()                                 │
│                           (craftparse.js)                                        │
│                                                                                  │
│  MAIN LOOP (while templates remaining):                                          │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │  For each level with remaining templates:                                  │  │
│  │    1. getUserPreferences() → Get ranked material preferences               │  │
│  │    2. selectProduct() → Score & select best gear piece                     │  │
│  │    3. getMaterialScore() → Score based on:                                 │  │
│  │       • Material availability rank (most abundant = highest)               │  │
│  │       • CTW bonus for ceremonial pieces                                    │  │
│  │       • Season zero preference                                             │  │
│  │       • Weirwood penalty (scarce material)                                 │  │
│  │    4. getMaxCraftableQuantity() → Max pieces given materials               │  │
│  │    5. updateAvailableMaterials() → Deduct used materials                   │  │
│  │    6. appendPlanEntry() → Add to production plan                           │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────┬───────────────────────────────────────────┘
                                       │
                                       ▼
                       ┌───────────────────────────────┐
                       │      RENDER RESULTS           │
                       │       (Step 3)                │
                       │                               │
                       │  • Crafting plan by level     │
                       │  • Material usage breakdown   │
                       │  • Remaining materials        │
                       │  • Template totals            │
                       └───────────────────────────────┘
```

---

## Template Planner - Cascade System

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                          CASCADE PROJECTION SYSTEM                                  │
│                          (template-planner.js)                                      │
│                                                                                     │
│  The cascade system calculates how many templates survive from one level to        │
│  the next during gear upgrading/combining.                                         │
│                                                                                     │
│  SURVIVAL RATE: ~43% per level transition (Exquisite/Purple with 4 materials)     │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                             │   │
│  │    L10 Templates                                                            │   │
│  │         │                                                                   │   │
│  │         │  × 0.43 survival                                                  │   │
│  │         ▼                                                                   │   │
│  │    L15 Templates ─────────────────────────────────────────────────────────  │   │
│  │         │                                                                   │   │
│  │         │  × 0.43 survival                                                  │   │
│  │         ▼                                                                   │   │
│  │    L20 Templates + Season Gear (optional)                                   │   │
│  │         │                                                                   │   │
│  │         │  × 0.43 survival                                                  │   │
│  │         ▼                                                                   │   │
│  │    L25 Templates + Season Gear                                              │   │
│  │         │                                                                   │   │
│  │         ▼  ... continues to L30 → L35 → L40 → L45                          │   │
│  │                                                                             │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  MATERIAL BALANCING ALGORITHM:                                                     │
│  ─────────────────────────────                                                     │
│  Goal: Select gear pieces to craft such that materials are used EVENLY             │
│                                                                                     │
│  1. Rank materials by remaining quantity (most abundant first)                     │
│  2. Score each possible gear piece based on:                                       │
│     - Which materials it uses (prefer abundant materials)                          │
│     - Special modifiers (CTW, season preferences)                                  │
│  3. Select highest-scoring piece                                                   │
│  4. Repeat until target templates reached or materials exhausted                   │
│                                                                                     │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Product Scoring System

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                           PRODUCT SCORING (craftparse.js)                           │
│                                                                                     │
│  Each gear piece is scored to determine crafting priority:                         │
│                                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │   getMaterialScore(product, preferences, materials, multiplier, level, opts)  │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  SCORE COMPONENTS:                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                             │   │
│  │  1. MATERIAL RANK POINTS (MATERIAL_RANK_POINTS):                            │   │
│  │  ───────────────────────────────────────────────                            │   │
│  │  Rank 1 (most abundant):  +40 points                                        │   │
│  │  Rank 2:                  +32 points                                        │   │
│  │  Rank 3:                  +25 points                                        │   │
│  │  Rank 4:                  +12 points                                        │   │
│  │  Rank 5:                   +7 points                                        │   │
│  │  Rank 6:                   +2 points                                        │   │
│  │  Rank 7:                    0 points                                        │   │
│  │  Rank 8:                  -10 points                                        │   │
│  │  Rank 9:                  -15 points                                        │   │
│  │  Rank 10:                 -22 points                                        │   │
│  │  Rank 11:                 -30 points                                        │   │
│  │  Rank 12 (least abundant):-40 points                                        │   │
│  │                                                                             │   │
│  │  2. QUALITY ODDS BONUS (for L15+):                                          │   │
│  │  ──────────────────────────────────                                         │   │
│  │  Pieces with more materials have BETTER legendary success rates:            │   │
│  │  • 2-material pieces: 36.36% legendary →  +0 points (baseline)              │   │
│  │  • 3-material pieces: 40.00% legendary →  +9 points                         │   │
│  │  • 4-material pieces: 42.11% legendary → +15 points (best odds)             │   │
│  │                                                                             │   │
│  │  3. OTHER MODIFIERS:                                                        │   │
│  │  ────────────────────                                                       │   │
│  │  • INSUFFICIENT_MATERIAL_PENALTY: -1000 (can't craft)                       │   │
│  │  • WEIRWOOD_PRIORITY_PENALTY:      -20 (preserve weirwood)                  │   │
│  │  • GEAR_MATERIAL_SCORE:            +22 (season gear bonus)                  │   │
│  │  • SEASON_ZERO_LOW_BONUS:          -10 (deprioritize S0)                    │   │
│  │  • SEASON_ZERO_HIGH_BONUS:         +15 (prioritize S0)                      │   │
│  │                                                                             │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  FINAL SCORE = Material Rank Points + Quality Odds Bonus + Other Modifiers         │
│                                                                                     │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

## March Size Calculator Flow

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                        MARCH SIZE CALCULATOR                                        │
│                        (ms-calculator.js + ms-data.js)                              │
│                                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │  STEP 1: RESEARCH SELECTION                                                   │  │
│  │  ──────────────────────────                                                   │  │
│  │  • Command I/II/III levels                                                    │  │
│  │  • Army Expertise I/II                                                        │  │
│  │  • SoP March Size I/II                                                        │  │
│  │  • Troop Surge I/II/III                                                       │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                       │                                            │
│                                       ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │  STEP 2: HERO & GEAR CONFIGURATION                                            │  │
│  │  ─────────────────────────────────                                            │  │
│  │  • Hero selection (Hand, War, Coin, Law, Ships, Commander, Maester)           │  │
│  │  • Hero levels (affects march size bonuses)                                   │  │
│  │  • Gear loadout (trinkets, dragon gear, standard gear)                        │  │
│  │  • Armory levels (standard, trinket, dragon)                                  │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                       │                                            │
│                                       ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │  STEP 3: CALCULATION                                                          │  │
│  │  ───────────────────                                                          │  │
│  │                                                                               │  │
│  │  Total March Size = Base + Research Bonus + Hero Bonus + Gear Bonus          │  │
│  │                     + Armory Bonus + Dragon Bonus + Trinket Bonus            │  │
│  │                                                                               │  │
│  │  Each hero has different bonuses at different levels:                         │  │
│  │  • Criston Cole (Hand): Best march size bonus at high levels                  │  │
│  │  • Leaf (War): Strong march bonus                                             │  │
│  │  • Euron (Coin): Moderate march bonus                                         │  │
│  │  • etc.                                                                       │  │
│  │                                                                               │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Structures

### Product (Gear Piece)
```javascript
{
  name: "Dragonbone Sword",
  level: 25,
  img: "resources/item/dragonbone_sword.png",
  materials: {
    "dragonglass": 5,
    "black-iron": 3,
    "goldenheart-wood": 2
  },
  setName: "Dragonbone Set",
  season: 0,
  warlord: false
}
```

### Material
```javascript
{
  "black-iron": {
    "img": "resources/materials/icon_crafting_blackiron.webp",
    "Original-name": "Black Iron"
  }
}
```

### Crafting Plan Entry
```javascript
{
  level: 25,
  product: { /* product object */ },
  quantity: 50,
  materialBreakdown: [
    { material: "dragonglass", used: 250, remaining: 1000 }
  ]
}
```

---

## Quality Multipliers

| Quality    | Material Multiplier |
|------------|---------------------|
| Poor       | 1×                  |
| Common     | 2×                  |
| Fine       | 4×                  |
| Exquisite  | 8×                  |
| Epic       | 16×                 |
| Legendary  | 32×                 |

---

## File Dependency Graph

```
index.html
    │
    ├── style.css
    │
    ├── DATA (loaded first, in order)
    │   ├── season0.js → season12.js, seasonctw.js
    │   ├── products.js (aggregates seasons)
    │   ├── materials.js
    │   └── crafting-data.js
    │
    ├── EXTERNAL
    │   └── tesseract.min.js (OCR library)
    │
    └── LOGIC (deferred, in order)
        ├── craftparse.js      (core calculation engine)
        ├── ocr-scanner.js     (screenshot OCR)
        ├── optimizer.js       (product selection logic)
        ├── template-planner.js (material balancing)
        ├── wizard.js          (UI navigation & state)
        ├── history.js         (save/load calculations)
        └── march-size/
            ├── ms-data.js     (march size data)
            └── ms-calculator.js (march size logic)
```

---

## Key Algorithms

### 1. Material Ranking
Materials are ranked by remaining quantity. The algorithm prefers to use abundant materials first.

### 2. Product Scoring
Each craftable product is scored based on which materials it uses. Products using abundant materials score higher. Quality odds bonuses favor pieces with more materials (better legendary rates).

### 3. Cascade Projection
Calculates how many templates will survive through level upgrades (43% survival rate per level).

### 4. Fast-Track Mode
When a single product type dominates a level, the algorithm can process large batches at once instead of piece-by-piece.

### 5. Real-Time Preview (CraftScoring API)
The cascade projection system uses `window.CraftScoring.scoreProductsForLevel()` to preview which pieces would be crafted based on current settings. This gives users immediate feedback as they modify inputs.

```javascript
// Example: Get scored products for Level 25
const scored = window.CraftScoring.scoreProductsForLevel(25, materials, {
    includeCTW: true,
    includeSeasonGear: true,
    seasonGearLevels: [20, 25, 30, 35, 40, 45]
});
// Returns: [{ product: {...}, score: 45.3 }, { product: {...}, score: 38.1 }, ...]
```

---

## State Management

- **Local Storage**: Calculation history persisted via `history.js`
- **URL Parameters**: `?debug=true` enables console logging
- **Theme**: Dark/light mode stored in localStorage
- **Session State**: Current step, material inputs, strategy settings

---

*Last updated: December 2024*

