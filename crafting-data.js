/**
 * Game Crafting Data - Extracted from Game Binaries & Screenshots
 * Last updated: December 19, 2025
 * 
 * This file contains verified data from the game's Protocol Buffer files
 * and in-game screenshots captured via ADB automation.
 * 
 * KEY DISCOVERY: Crafting odds depend on NUMBER OF MATERIALS, not level!
 * - 2-material pieces have different odds than 3-material or 4-material pieces
 * - This is consistent across ALL levels (20-45 verified)
 */

const CRAFTING_DATA = {
    // Material costs per level (in Poor equivalent)
    // Each piece requires this amount of EACH material type
    materialCosts: {
        5: 10,
        10: 20,
        15: 120,
        20: 400,
        25: 1200,
        30: 3000,
        35: 12000,
        40: 45000,
        45: 120000,
        50: 450000
    },

    // Number of materials required by equipment type
    // Seasonal gear always uses 4 materials (3 basic + 1 seasonal)
    materialCount: {
        // Basic gear - varies by piece
        halfhelm: 2,        // e.g., Silk + Hide
        satinDress: 2,      // 2 materials
        emeraldPendant: 3,  // 3 materials
        // Most basic pieces use 3 materials
        defaultBasic: 3,
        // Ceremonial gear (basic but 4 materials)
        ceremonial: 4,
        // Seasonal gear always uses 4 (seasonal + 3 basic)
        seasonal: 4
    },

    // Materials required by equipment piece
    // 'event' refers to the seasonal material for that gear set
    equipmentMaterials: {
        boots: {
            seasonal: true,  // Uses seasonal event material
            materialCount: 4,
            basic: ['milkofthepoppy', 'wildfire', 'weirwood']
        },
        chest: {
            seasonal: true,
            materialCount: 4,
            basic: ['ironwood', 'goldenheartwood', 'leatherstrap']
        },
        helmet: {
            seasonal: true,
            materialCount: 4,
            basic: ['wildfire', 'ironwood', 'leatherstrap']
        },
        pants: {
            seasonal: true,
            materialCount: 4,
            basic: ['dragonglass', 'copperbar', 'blackiron']
        },
        ring: {
            seasonal: true,
            materialCount: 4,
            basic: ['dragonglass', 'silk', 'goldenheartwood']
        },
        weapon: {
            seasonal: true,
            materialCount: 4,
            basic: ['weirwood', 'kingswoodoak', 'hide']
        }
    },

    // Quality tier multipliers (to convert to Poor equivalent)
    // Higher quality materials are worth more Poor materials
    tierMultipliers: {
        poor: 1,
        common: 4,
        fine: 16,
        exquisite: 64,
        epic: 256,
        legendary: 1024
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CRAFTING ODDS - VERIFIED VIA ADB SCREENSHOTS (December 2025)
    // ═══════════════════════════════════════════════════════════════════════════
    // 
    // KEY FINDING: Odds are determined by NUMBER OF MATERIALS, not level!
    // Same odds apply from Level 20 through Level 45 (verified)
    // 
    // Verified at multiple levels: L20, L25, L30, L35, L40, L45
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * EXQUISITE (Purple) Material Odds
     * When crafting with Purple quality materials
     * 
     * Output qualities: Exquisite, Epic, or Legendary only
     * (No Fine output when using Exquisite input)
     */
    oddsExquisite: {
        // 2 materials (e.g., Halfhelm, Satin Dress)
        // Verified: L20 Halfhelm, L35 Satin Dress
        2: {
            poor: 0,
            common: 0,
            fine: 0,
            exquisite: 0.5455,   // 54.55%
            epic: 0.0909,       // 9.09%
            legendary: 0.3636   // 36.36%
        },
        // 3 materials (e.g., Emerald Forehead Pendant, most basic gear)
        // Verified: L20 & L35 basic pieces
        3: {
            poor: 0,
            common: 0,
            fine: 0,
            exquisite: 0.5333,   // 53.33%
            epic: 0.0667,       // 6.67%
            legendary: 0.40     // 40.00%
        },
        // 4 materials (Seasonal gear, Ceremonial gear)
        // Verified: L20, L25, L30, L35, L40, L45 seasonal
        4: {
            poor: 0,
            common: 0,
            fine: 0,
            exquisite: 0.5263,   // 52.63%
            epic: 0.0526,       // 5.26%
            legendary: 0.4211   // 42.11%
        }
    },

    /**
     * FINE (Blue) Material Odds
     * When crafting with Blue quality materials
     * 
     * Output qualities: Fine, Exquisite, Epic, or Legendary
     */
    oddsFine: {
        // 2 materials (e.g., Halfhelm, Satin Dress)
        // Verified: L20 Halfhelm, L35 Satin Dress
        2: {
            poor: 0,
            common: 0,
            fine: 0.50,         // 50.00%
            exquisite: 0.1429,  // 14.29%
            epic: 0.0714,       // 7.14%
            legendary: 0.2857   // 28.57%
        },
        // 3 materials (e.g., Emerald Forehead Pendant, most basic gear)
        // Verified: L20 & L35 basic pieces
        3: {
            poor: 0,
            common: 0,
            fine: 0.50,         // 50.00%
            exquisite: 0.1111,  // 11.11%
            epic: 0.0556,       // 5.56%
            legendary: 0.3333   // 33.33%
        },
        // 4 materials (Seasonal gear, Ceremonial gear)
        // Verified: L20-L45 seasonal, L35 Ceremonial
        4: {
            poor: 0,
            common: 0,
            fine: 0.50,         // 50.00%
            exquisite: 0.0909,  // 9.09%
            epic: 0.0455,       // 4.55%
            legendary: 0.3636   // 36.36%
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LEGACY SUCCESS RATES (for backward compatibility)
    // These map to the new material-count-based odds
    // ═══════════════════════════════════════════════════════════════════════════
    
    successRates: {
        // Rates when using EXQUISITE (Purple) materials - 4 material pieces
        exquisite: {
            15: { legendary: 0.40, epic: 0.0667, exquisite: 0.5333, fine: 0 },      // Level 15 uses 3-mat odds
            20: { legendary: 0.4211, epic: 0.0526, exquisite: 0.5263, fine: 0 },    // VERIFIED
            25: { legendary: 0.4211, epic: 0.0526, exquisite: 0.5263, fine: 0 },    // VERIFIED
            30: { legendary: 0.4211, epic: 0.0526, exquisite: 0.5263, fine: 0 },    // VERIFIED
            35: { legendary: 0.4211, epic: 0.0526, exquisite: 0.5263, fine: 0 },    // VERIFIED
            40: { legendary: 0.4211, epic: 0.0526, exquisite: 0.5263, fine: 0 },    // VERIFIED
            45: { legendary: 0.4211, epic: 0.0526, exquisite: 0.5263, fine: 0 },    // VERIFIED
            50: { legendary: 0.4211, epic: 0.0526, exquisite: 0.5263, fine: 0 }     // Assumed same
        },
        // Rates when using FINE (Blue) materials - 4 material pieces
        fine: {
            15: { legendary: 0.3333, epic: 0.0556, exquisite: 0.1111, fine: 0.50 }, // Uses 3-mat odds
            20: { legendary: 0.3636, epic: 0.0455, exquisite: 0.0909, fine: 0.50 }, // VERIFIED
            25: { legendary: 0.3636, epic: 0.0455, exquisite: 0.0909, fine: 0.50 }, // VERIFIED
            30: { legendary: 0.3636, epic: 0.0455, exquisite: 0.0909, fine: 0.50 }, // VERIFIED
            35: { legendary: 0.3636, epic: 0.0455, exquisite: 0.0909, fine: 0.50 }, // VERIFIED
            40: { legendary: 0.3636, epic: 0.0455, exquisite: 0.0909, fine: 0.50 }, // VERIFIED
            45: { legendary: 0.3636, epic: 0.0455, exquisite: 0.0909, fine: 0.50 }, // VERIFIED
            50: { legendary: 0.3636, epic: 0.0455, exquisite: 0.0909, fine: 0.50 }  // Assumed same
        },
        // Alias for seasonal gear (uses 4-material exquisite odds)
        seasonal: {
            15: { legendary: 0.40, epic: 0.0667, exquisite: 0.5333 },
            20: { legendary: 0.4211, epic: 0.0526, exquisite: 0.5263 },
            25: { legendary: 0.4211, epic: 0.0526, exquisite: 0.5263 },
            30: { legendary: 0.4211, epic: 0.0526, exquisite: 0.5263 },
            35: { legendary: 0.4211, epic: 0.0526, exquisite: 0.5263 },
            40: { legendary: 0.4211, epic: 0.0526, exquisite: 0.5263 },
            45: { legendary: 0.4211, epic: 0.0526, exquisite: 0.5263 },
            50: { legendary: 0.4211, epic: 0.0526, exquisite: 0.5263 }
        },
        // Basic gear with exquisite materials (uses 3-material odds for most pieces)
        basic: {
            15: { legendary: 0.40, epic: 0.0667, exquisite: 0.5333 },
            20: { legendary: 0.40, epic: 0.0667, exquisite: 0.5333 },
            25: { legendary: 0.40, epic: 0.0667, exquisite: 0.5333 },
            30: { legendary: 0.40, epic: 0.0667, exquisite: 0.5333 },
            35: { legendary: 0.40, epic: 0.0667, exquisite: 0.5333 },
            40: { legendary: 0.40, epic: 0.0667, exquisite: 0.5333 },
            45: { legendary: 0.40, epic: 0.0667, exquisite: 0.5333 },
            50: { legendary: 0.40, epic: 0.0667, exquisite: 0.5333 }
        }
    },

    // Combining ratios for upgrading quality
    // 4 lower-tier pieces combine to 1 higher-tier piece
    combineRatio: 4,

    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get odds based on input material quality and number of materials
     * 
     * @param {string} inputQuality - 'fine' or 'exquisite'
     * @param {number} materialCount - 2, 3, or 4
     * @returns {object} - Odds object with all quality probabilities
     */
    getOddsByMaterialCount: function(inputQuality, materialCount) {
        if (inputQuality === 'exquisite' || inputQuality === 'purple') {
            return this.oddsExquisite[materialCount] || this.oddsExquisite[4];
        } else if (inputQuality === 'fine' || inputQuality === 'blue') {
            return this.oddsFine[materialCount] || this.oddsFine[4];
        }
        // Default to exquisite 4-material odds
        return this.oddsExquisite[4];
    },

    /**
     * Calculate effective legendary rate considering quality combining
     * If you fail to get legendary, you can combine 4 lower quality pieces
     * to get 1 higher quality, potentially reaching legendary
     * 
     * Effective Rate = P(legendary) + P(epic)/4 + P(exquisite)/16 + P(fine)/64
     * 
     * This accounts for:
     * - Direct legendary: P(legendary)
     * - 4 epic → 1 legendary: P(epic) / 4
     * - 16 exquisite → 4 epic → 1 legendary: P(exquisite) / 16
     * - 64 fine → 16 exquisite → 4 epic → 1 legendary: P(fine) / 64
     */
    calculateEffectiveRate: function(level, isSeasonalGear = true, inputQuality = 'exquisite') {
        const materialCount = isSeasonalGear ? 4 : 3;
        const odds = this.getOddsByMaterialCount(inputQuality, materialCount);
        
        if (!odds) return null;
        
        return odds.legendary + 
               (odds.epic / this.combineRatio) + 
               (odds.exquisite / (this.combineRatio * this.combineRatio)) +
               (odds.fine / (this.combineRatio * this.combineRatio * this.combineRatio));
    },

    /**
     * Calculate effective rate for a specific material count
     * 
     * @param {number} materialCount - 2, 3, or 4
     * @param {string} inputQuality - 'fine' or 'exquisite'
     * @returns {number} - Effective legendary rate
     */
    calculateEffectiveRateByMaterials: function(materialCount, inputQuality = 'exquisite') {
        const odds = this.getOddsByMaterialCount(inputQuality, materialCount);
        
        if (!odds) return null;
        
        return odds.legendary + 
               (odds.epic / this.combineRatio) + 
               (odds.exquisite / (this.combineRatio * this.combineRatio)) +
               (odds.fine / (this.combineRatio * this.combineRatio * this.combineRatio));
    },

    /**
     * Calculate how many legendary templates you can expect from a given amount of materials
     * 
     * @param {number} materials - Amount of materials (in Poor equivalent)
     * @param {number} level - Target crafting level (15, 20, 25, etc.)
     * @param {boolean} isSeasonalGear - Whether this is seasonal gear
     * @param {string} inputQuality - 'fine' or 'exquisite'
     * @returns {object} - { templates, materialsUsed, remainingMaterials }
     */
    calculateExpectedLegendaries: function(materials, level, isSeasonalGear = true, inputQuality = 'exquisite') {
        const cost = this.materialCosts[level];
        const effectiveRate = this.calculateEffectiveRate(level, isSeasonalGear, inputQuality);
        
        if (!cost || !effectiveRate) return null;
        
        // Materials needed per legendary template (accounting for combining failures)
        const materialsPerLegendary = cost / effectiveRate;
        
        // How many legendaries can we expect?
        const expectedLegendaries = Math.floor(materials / materialsPerLegendary);
        const materialsUsed = expectedLegendaries * materialsPerLegendary;
        
        return {
            templates: expectedLegendaries,
            materialsUsed: Math.round(materialsUsed),
            remainingMaterials: Math.round(materials - materialsUsed),
            effectiveRate: effectiveRate,
            costPerLegendary: Math.round(materialsPerLegendary)
        };
    },

    /**
     * Optimize material allocation across all levels to maximize high-level legendaries
     * Strategy: Allocate to highest levels first (most valuable)
     * 
     * @param {number} materials - Total materials available (in Poor equivalent)
     * @param {boolean} isSeasonalGear - Whether this is seasonal gear
     * @param {string} inputQuality - 'fine' or 'exquisite'
     * @returns {object} - Allocation plan by level
     */
    optimizeAllocation: function(materials, isSeasonalGear = true, inputQuality = 'exquisite') {
        const allocation = {};
        let remaining = materials;
        
        // Start from highest level and work down
        const levels = [50, 45, 40, 35, 30, 25, 20, 15];
        
        for (const level of levels) {
            const result = this.calculateExpectedLegendaries(remaining, level, isSeasonalGear, inputQuality);
            
            if (result && result.templates > 0) {
                allocation[level] = {
                    templates: result.templates,
                    materialsUsed: result.materialsUsed,
                    effectiveRate: result.effectiveRate
                };
                remaining = result.remainingMaterials;
            }
        }
        
        return {
            allocation,
            totalMaterialsUsed: materials - remaining,
            remainingMaterials: remaining
        };
    },

    /**
     * Get all unique basic materials needed across all equipment pieces
     */
    getAllBasicMaterials: function() {
        const allMats = new Set();
        for (const piece of Object.values(this.equipmentMaterials)) {
            piece.basic.forEach(mat => allMats.add(mat));
        }
        return Array.from(allMats);
    },

    /**
     * Find which equipment pieces use a specific material
     */
    findPiecesUsingMaterial: function(materialName) {
        const pieces = [];
        for (const [piece, data] of Object.entries(this.equipmentMaterials)) {
            if (data.basic.includes(materialName)) {
                pieces.push(piece);
            }
        }
        return pieces;
    },

    /**
     * Get a summary of all verified odds for display
     */
    getOddsSummary: function() {
        return {
            exquisite: {
                '2_materials': this.oddsExquisite[2],
                '3_materials': this.oddsExquisite[3],
                '4_materials': this.oddsExquisite[4]
            },
            fine: {
                '2_materials': this.oddsFine[2],
                '3_materials': this.oddsFine[3],
                '4_materials': this.oddsFine[4]
            },
            effectiveRates: {
                'exquisite_2mat': this.calculateEffectiveRateByMaterials(2, 'exquisite'),
                'exquisite_3mat': this.calculateEffectiveRateByMaterials(3, 'exquisite'),
                'exquisite_4mat': this.calculateEffectiveRateByMaterials(4, 'exquisite'),
                'fine_2mat': this.calculateEffectiveRateByMaterials(2, 'fine'),
                'fine_3mat': this.calculateEffectiveRateByMaterials(3, 'fine'),
                'fine_4mat': this.calculateEffectiveRateByMaterials(4, 'fine')
            }
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CRAFTING_DATA;
}
