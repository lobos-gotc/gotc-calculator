# Hero March Size Bonuses - Council Positions Only

This document lists only heroes that have **council march size bonuses** (skills 3-8).
Heroes with signature skills (1-2) provide march size only as marchers and are NOT included in council dropdowns.

## Heroes with Council March Size Bonuses

### The Hand
- **Criston Cole** (The Kingmaker) - Level 60: +3,280 march size

### Master of War
- **Leaf** (Child of the Forest) - Level 20: +2,295 march size

### Master of Coin
- **Euron Greyjoy** (King of Salt and Rock) - Level 40: +2,624 march size

### Master of Whispers
- *(No heroes with council march size bonuses verified yet)*

### Master of Law
- **The Waif** (Faceless Disciple) - Level 40: +2,624 march size
- **Alicent Hightower** (Dowager Queen) - Level 30: +2,020 march size

### Master of Ships
- *(No heroes with council march size bonuses verified yet)*

### Lord Commander
- **Aemond Targaryen** - Level 40: +3,075 march size
- **Yara Greyjoy** (Queen of the Iron Islands) - Level 20: +1,148 march size
- **Gwayne Hightower** - Level 60: +3,018 march size
- **Jon Snow** (Lord Commander) - Level 30: +2,295 march size

### Grand Maester
- **Viserys Targaryen** (Mask) - Level 40: +2,525 march size

---

## Total: 10 Heroes with Council March Size Bonuses

### How to Add More Heroes:
1. Go to the `data-extraction-tools` branch
2. Use `collect_hero_screenshots.py` to capture hero details
3. Check skills 3-8 for march size bonuses
4. Add verified heroes to `ms-data.js` with the format:
   ```javascript
   heroId: {
       name: "Hero Name",
       title: "Hero Title",
       img: "heroes/filename.png",
       positions: ["position"],
       maxLevel: 60,
       quality: "legendary",
       councilMarchSize: { type: 'flat', unlockLevel: 20, value: 1000 }
   }
   ```

### Important Notes:
- ✅ Only include heroes with **council** march size (skills 3-8)
- ❌ Do NOT include signature skills (1-2) - those are marcher-only
- 🎯 Focus on verifying high-impact heroes first (legendary quality)
- 📸 Hero images must exist in `resources/heroes/` directory

