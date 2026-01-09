# GOTC Calculators

A comprehensive suite of calculators for **Game of Thrones: Conquest (GOTC)**, featuring template crafting optimization and march size planning.

🔗 **Live Demo:** [https://lobos-gotc.github.io/gotc-calculator/](https://lobos-gotc.github.io/gotc-calculator/)

![GOTC Calculators](resources/stark-logo.png)

---

## 📋 Table of Contents

- [Features](#features)
- [Template Calculator](#template-calculator)
  - [Step 1: Input Materials](#step-1-input-materials)
  - [Step 2: Crafting Strategy](#step-2-crafting-strategy)
  - [Step 3: View Results](#step-3-view-results)
- [March Size Calculator](#march-size-calculator)
- [Local Development](#local-development)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Template Calculator
- 📸 **OCR Scanning** - Scan materials directly from game screenshots
- 📊 **Cascade Projections** - See template survival rates from L1 to L45
- ⚙️ **Quality Optimization** - Choose legendary, epic, exquisite, or lower qualities per level
- 🎯 **Smart Piece Selection** - Balances materials while prioritizing high-success-rate items
- 🌟 **Season Support** - Includes Season 0-12 gear and CTW (Ceremonial Targaryen Warlord) items

### March Size Calculator
- 👥 **Council Optimization** - Calculate optimal hero placements for maximum march size
- 📈 **Hero Database** - Comprehensive list of heroes with council march size bonuses
- 🎖️ **Position Tracking** - Track bonuses per council position (Hand, Master of War, etc.)

---

## 🔧 Template Calculator

The Template Calculator helps you plan your crafting journey from L1 templates all the way to L45 legendary gear.

### Step 1: Input Materials

**Option A: Manual Entry**
1. Click on any material input field
2. Enter the quantity you have available
3. Repeat for all materials (basic and seasonal)

**Option B: OCR Scanning (Recommended)**
1. Take screenshots of your materials in-game
2. Click **"Scan Screenshot"** button
3. Select your screenshot file
4. The OCR will automatically detect and populate material quantities
5. Review and adjust any values if needed

**Option C: Test Data**
- Click **"Load Test Data"** to populate with sample materials for testing

### Step 2: Crafting Strategy

Configure your crafting preferences:

#### Material Usage Slider
- Adjust how much of your materials to use (20%-100%)
- Lower percentages save materials for future crafting events

#### Gear Levels
- Select which levels should use **seasonal gear materials**
- Quick select buttons: **L20+**, **All**, or **Clear**
- Unselected levels use basic (Season 0) materials only

#### Preferences
| Setting | Description |
|---------|-------------|
| **CTW** | Include Ceremonial Targaryen Warlord items |
| **L20 only** | Restrict CTW items to L20 templates only |
| **Low/Med Odds** | Include rare items with lower drop rates |
| **Best** | Prioritize items with highest quality success rates |
| **S0 (Season 0)** | Priority slider for basic materials (Off → High) |

#### Template Plan
The Template Plan shows your projected crafting journey:

- **Input boxes** - Editable template counts per level
- **Quality selectors** - Choose quality tier per level (affects survival rates)
- **Carousel** - Preview of gear pieces that will be crafted
- **Cascade** - Automatic calculation of surviving templates at each level

**Quality Tiers & Survival Rates:**
| Quality | Survival Rate | Typical Levels |
|---------|---------------|----------------|
| Legendary | 100% | L1, L5, L10 |
| Exquisite | ~46.5% | L15, L20, L25 |
| Fine | ~20% | L30, L35 |
| Common | ~10% | L40, L45 |

> 💡 **Tip:** 4 failed templates combine into 1 template of the next quality tier!

### Step 3: View Results

Click **"Calculate"** to see your crafting results:

- **Summary** - Total pieces crafted, materials used
- **Detailed Breakdown** - Exact pieces per level with images
- **Material Usage** - How much of each material was consumed

---

## 🏃 March Size Calculator

Optimize your hero council for maximum march size.

### How to Use

1. Click **"March Size Calculator"** tab
2. Select heroes for each council position:
   - The Hand
   - Master of War
   - Master of Coin
   - Master of Whispers
   - Master of Law
   - Master of Ships
   - Lord Commander
   - Grand Maester

3. View the total march size bonus from all council positions

### Heroes with Council March Size Bonuses

| Position | Hero | Level Required | Bonus |
|----------|------|----------------|-------|
| The Hand | Criston Cole | 60 | +3,280 |
| Master of War | Leaf | 20 | +2,295 |
| Master of Coin | Euron Greyjoy | 40 | +2,624 |
| Master of Law | The Waif | 40 | +2,624 |
| Master of Law | Alicent Hightower | 30 | +2,020 |
| Lord Commander | Aemond Targaryen | 40 | +3,075 |
| Lord Commander | Jon Snow | 30 | +2,295 |
| Lord Commander | Yara Greyjoy | 20 | +1,148 |
| Lord Commander | Gwayne Hightower | 60 | +3,018 |
| Grand Maester | Viserys Targaryen | 40 | +2,525 |

> ⚠️ **Note:** Only heroes with **council skills (3-8)** providing march size are included. Signature skills (1-2) only work when the hero is marching.

---

## 💻 Local Development

### Prerequisites
- A modern web browser
- Python 3.x (for local server) or any static file server

### Running Locally

```bash
# Clone the repository
git clone https://github.com/lobos-gotc/gotc-calculator.git
cd gotc-calculator

# Start a local server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

### Debug Mode

Add `?debug=true` to the URL to enable console logging:
```
http://localhost:8080?debug=true
```

### Project Structure

```
gotc-calculator/
├── index.html          # Main application
├── style.css           # Styles (supports dark/light themes)
├── craftparse.js       # Core crafting calculation engine
├── template-planner.js # Template cascade & material balancing
├── wizard.js           # UI wizard flow & interactions
├── ocr-scanner.js      # Screenshot OCR processing
├── optimizer.js        # Gear optimization algorithms
├── materials.js        # Material definitions
├── products.js         # Product/gear definitions
├── crafting-data.js    # Crafting recipes & costs
├── seasons/            # Season-specific gear data (S0-S12, CTW)
├── resources/          # Images and icons
├── march-size/         # March size calculator module
│   ├── ms-calculator.js
│   ├── ms-data.js
│   └── heroes_list.json
└── extra_resources/    # Additional assets
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs** - Open an issue with reproduction steps
2. **Add Heroes** - Submit PRs to add missing hero data to `ms-data.js`
3. **Update Season Data** - Help keep season gear data current
4. **Improve UI/UX** - Suggest or implement interface improvements

### Adding New Heroes

```javascript
// In march-size/ms-data.js
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

---

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Game of Thrones: Conquest community
- [Tesseract.js](https://tesseract.projectnaptha.com/) for OCR capabilities
- All contributors and testers

---

<p align="center">
  <i>Winter is Coming... but your templates don't have to fail! ❄️</i>
</p>

