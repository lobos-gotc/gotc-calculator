/**
 * Dragon March Size Data Module
 * 
 * Data extracted from game files:
 * - dragon_talents_data.json
 * - dragon_data.json
 * 
 * Contains dragon-specific march size contributions:
 * - Dragon talent trees (Whelp, Adolescent, Adult)
 * - Dragon level progression
 */

const DRAGON_MS_DATA = {
    // ============================================
    // DRAGON LEVEL PROGRESSION
    // Maps dragon level to stage and available talent points
    // ============================================
    levels: {
        stages: {
            hatchling: { min: 1, max: 10, name: "Hatchling" },
            whelp: { min: 11, max: 20, name: "Whelp" },
            adolescent: { min: 21, max: 30, name: "Adolescent" },
            adult: { min: 31, max: 69, name: "Adult" }
        },
        // Cumulative talent points by level (from dragon_data.json)
        talentPoints: {
            1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 11,
            11: 12, 12: 13, 13: 14, 14: 15, 15: 16, 16: 17, 17: 18, 18: 19, 19: 20, 20: 22,
            21: 23, 22: 24, 23: 25, 24: 26, 25: 27, 26: 28, 27: 29, 28: 30, 29: 31, 30: 33,
            31: 34, 32: 35, 33: 36, 34: 37, 35: 38, 36: 39, 37: 40, 38: 41, 39: 42, 40: 43,
            41: 44, 42: 45, 43: 46, 44: 47, 45: 48, 46: 49, 47: 50, 48: 51, 49: 52, 50: 53,
            51: 54, 52: 55, 53: 56, 54: 57, 55: 58, 56: 59, 57: 60, 58: 61, 59: 62, 60: 63,
            61: 64, 62: 65, 63: 66, 64: 67, 65: 68, 66: 69, 67: 70, 68: 71, 69: 72
        }
    },

    // ============================================
    // DRAGON TALENTS - MARCH SIZE RELATED
    // Extracted from dragon_talents_data.json
    // ============================================
    talents: {
        // Whelp Tree (Dragon Level 11+) - March Size vs Creatures (NPC)
        whelp: {
            marchSizeVsNPC1: {
                id: "talent_dragon_w_d_march_size_npc_1",
                name: "Dragon: March Size vs. Creature",
                description: "Increases march size when attacking creatures",
                maxLevel: 5,
                dragonLevelRequired: 11,
                statType: "DragonMaxMarchSizeVsNPC",
                // Values at each level (cumulative bonus)
                values: [100, 400, 700, 1000, 1300]
            },
            marchSizeVsNPC2: {
                id: "talent_dragon_w_d_march_size_npc_2",
                name: "Dragon: March Size vs. Creature II",
                description: "Further increases march size when attacking creatures",
                maxLevel: 10,
                dragonLevelRequired: 11,
                statType: "DragonMaxMarchSizeVsNPC",
                // Values at each level (cumulative bonus)
                values: [100, 400, 700, 1000, 1300, 1600, 1900, 2200, 2500, 2800]
            }
        },

        // Adolescent Tree (Dragon Level 21+) - General March Size
        adolescent: {
            marchSize1: {
                id: "talent_dragon_a_d_march_size_1",
                name: "Dragon: March Size",
                description: "Increases march size for dragon marches",
                maxLevel: 5,
                dragonLevelRequired: 21,
                statType: "DragonMaxMarchSize",
                // Values at each level (cumulative bonus)
                values: [200, 350, 500, 650, 800]
            },
            marchSize2: {
                id: "talent_dragon_a_d_march_size_2",
                name: "Dragon: March Size II",
                description: "Further increases march size for dragon marches",
                maxLevel: 10,
                dragonLevelRequired: 21,
                statType: "DragonMaxMarchSize",
                // Values at each level (cumulative bonus)
                values: [200, 350, 500, 650, 800, 950, 1100, 1250, 1400, 1550]
            }
        },

        // Adult Tree (Dragon Level 31+) - Fire Breath Mini Talents with March Size
        // These are single-point talents spread across the Adult tree
        adult: {
            // Cavalry branch
            fireBreathMini1: {
                id: "talent_dragon_ad_combo_mini_1",
                name: "Fire Breath Damage (Cavalry)",
                description: "Unlocks after Cavalry vs Ranged talents",
                maxLevel: 1,
                dragonLevelRequired: 31,
                statType: "DragonMaxMarchSize",
                values: [200]
            },
            // Ranged branch
            fireBreathMini2: {
                id: "talent_dragon_ad_combo_mini_2",
                name: "Fire Breath Damage (Ranged)",
                description: "Unlocks after Ranged vs Ranged talents",
                maxLevel: 1,
                dragonLevelRequired: 31,
                statType: "DragonMaxMarchSize",
                values: [200]
            },
            // Infantry branch
            fireBreathMini3: {
                id: "talent_dragon_ad_combo_mini_3",
                name: "Fire Breath Damage (Infantry)",
                description: "Unlocks after Infantry vs Ranged talents",
                maxLevel: 1,
                dragonLevelRequired: 31,
                statType: "DragonMaxMarchSize",
                values: [200]
            },
            // Infantry combo (main)
            fireBreathCombo3: {
                id: "talent_dragon_ad_combo_3",
                name: "Fire Breath Damage (Infantry Combo)",
                description: "Major infantry branch talent",
                maxLevel: 1,
                dragonLevelRequired: 31,
                statType: "DragonMaxMarchSize",
                values: [200]
            },
            // Siege branch
            fireBreathMini4: {
                id: "talent_dragon_ad_combo_mini_4",
                name: "Fire Breath Damage (Siege)",
                description: "Unlocks after Siege vs Ranged talents",
                maxLevel: 1,
                dragonLevelRequired: 31,
                statType: "DragonMaxMarchSize",
                values: [200]
            },
            // Second tier - Cavalry
            fireBreathMini5: {
                id: "talent_dragon_ad_combo_mini_5",
                name: "Fire Breath Damage (Cavalry II)",
                description: "Second tier cavalry branch",
                maxLevel: 1,
                dragonLevelRequired: 31,
                statType: "DragonMaxMarchSize",
                values: [200]
            },
            // Second tier - Ranged
            fireBreathMini6: {
                id: "talent_dragon_ad_combo_mini_6",
                name: "Fire Breath Damage (Ranged II)",
                description: "Second tier ranged branch",
                maxLevel: 1,
                dragonLevelRequired: 31,
                statType: "DragonMaxMarchSize",
                values: [200]
            },
            // Second tier - Infantry
            fireBreathMini7: {
                id: "talent_dragon_ad_combo_mini_7",
                name: "Fire Breath Damage (Infantry II)",
                description: "Second tier infantry branch",
                maxLevel: 1,
                dragonLevelRequired: 31,
                statType: "DragonMaxMarchSize",
                values: [200]
            },
            // Infantry combo (second tier)
            fireBreathCombo7: {
                id: "talent_dragon_ad_combo_7",
                name: "Fire Breath Damage (Infantry Combo II)",
                description: "Second tier infantry combo talent",
                maxLevel: 1,
                dragonLevelRequired: 31,
                statType: "DragonMaxMarchSize",
                values: [200]
            },
            // Second tier - Siege
            fireBreathMini8: {
                id: "talent_dragon_ad_combo_mini_8",
                name: "Fire Breath Damage (Siege II)",
                description: "Second tier siege branch",
                maxLevel: 1,
                dragonLevelRequired: 31,
                statType: "DragonMaxMarchSize",
                values: [200]
            }
        }
    },

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    /**
     * Get dragon stage from level
     * @param {number} level - Dragon level (1-69)
     * @returns {string} Stage name (hatchling, whelp, adolescent, adult)
     */
    getStageFromLevel: function(level) {
        const stages = this.levels.stages;
        if (level >= stages.adult.min) return 'adult';
        if (level >= stages.adolescent.min) return 'adolescent';
        if (level >= stages.whelp.min) return 'whelp';
        return 'hatchling';
    },

    /**
     * Get total talent points available at a level
     * @param {number} level - Dragon level
     * @returns {number} Total talent points
     */
    getTalentPointsAtLevel: function(level) {
        return this.levels.talentPoints[level] || 0;
    },

    /**
     * Get march size bonus from a talent at a specific level
     * @param {string} tree - Talent tree (whelp, adolescent, adult)
     * @param {string} talentKey - Talent key within the tree
     * @param {number} level - Current talent level (1-based)
     * @returns {number} March size bonus
     */
    getTalentBonus: function(tree, talentKey, level) {
        const talent = this.talents[tree]?.[talentKey];
        if (!talent || level <= 0) return 0;
        const index = Math.min(level, talent.maxLevel) - 1;
        return talent.values[index] || 0;
    },

    /**
     * Calculate total march size from all dragon talents
     * @param {Object} talentLevels - Object with talent levels { whelp: {}, adolescent: {}, adult: {} }
     * @returns {Object} { total, vsNPC, vsSoP, breakdown }
     */
    calculateTotalMarchSize: function(talentLevels) {
        let total = 0;
        let vsNPC = 0;
        let vsSoP = 0;
        const breakdown = [];

        // Calculate Whelp talents (vs NPC only)
        if (talentLevels.whelp) {
            Object.entries(talentLevels.whelp).forEach(([key, level]) => {
                const bonus = this.getTalentBonus('whelp', key, level);
                if (bonus > 0) {
                    vsNPC += bonus;
                    const talent = this.talents.whelp[key];
                    breakdown.push({
                        tree: 'whelp',
                        name: talent.name,
                        level: level,
                        bonus: bonus,
                        type: 'vsNPC'
                    });
                }
            });
        }

        // Calculate Adolescent talents (general march size)
        if (talentLevels.adolescent) {
            Object.entries(talentLevels.adolescent).forEach(([key, level]) => {
                const bonus = this.getTalentBonus('adolescent', key, level);
                if (bonus > 0) {
                    vsSoP += bonus;
                    total += bonus;
                    const talent = this.talents.adolescent[key];
                    breakdown.push({
                        tree: 'adolescent',
                        name: talent.name,
                        level: level,
                        bonus: bonus,
                        type: 'general'
                    });
                }
            });
        }

        // Calculate Adult talents (general march size)
        if (talentLevels.adult) {
            Object.entries(talentLevels.adult).forEach(([key, level]) => {
                const bonus = this.getTalentBonus('adult', key, level);
                if (bonus > 0) {
                    vsSoP += bonus;
                    total += bonus;
                    const talent = this.talents.adult[key];
                    breakdown.push({
                        tree: 'adult',
                        name: talent.name,
                        level: level,
                        bonus: bonus,
                        type: 'general'
                    });
                }
            });
        }

        return {
            total: total + vsNPC, // Total including vs NPC
            vsNPC: vsNPC,         // Only vs NPC bonuses
            vsSoP: vsSoP,         // General march size (applies to SoP)
            breakdown: breakdown
        };
    },

    /**
     * Get all talents available at a dragon level
     * @param {number} dragonLevel - Dragon level
     * @returns {Object} Available talents by tree
     */
    getAvailableTalents: function(dragonLevel) {
        const available = { whelp: {}, adolescent: {}, adult: {} };

        Object.entries(this.talents).forEach(([tree, talents]) => {
            Object.entries(talents).forEach(([key, talent]) => {
                if (dragonLevel >= talent.dragonLevelRequired) {
                    available[tree][key] = talent;
                }
            });
        });

        return available;
    },

    /**
     * Get maximum march size bonus possible from all talents
     * @returns {Object} { total, vsNPC, vsSoP }
     */
    getMaxPossibleBonus: function() {
        let vsNPC = 0;
        let vsSoP = 0;

        // Whelp max
        Object.values(this.talents.whelp).forEach(talent => {
            vsNPC += talent.values[talent.maxLevel - 1];
        });

        // Adolescent max
        Object.values(this.talents.adolescent).forEach(talent => {
            vsSoP += talent.values[talent.maxLevel - 1];
        });

        // Adult max (all are single-point)
        Object.values(this.talents.adult).forEach(talent => {
            vsSoP += talent.values[0];
        });

        return {
            total: vsNPC + vsSoP,
            vsNPC: vsNPC,
            vsSoP: vsSoP
        };
    },

    // ============================================
    // DRAGON RESEARCH - MARCH SIZE RELATED
    // Extracted from research_data.json
    // ============================================
    research: {
        // Whelp Research Tree (Category: research_Dragon_03)
        whelp: {
            marchSizeNpc1: {
                id: "research_dragon_march_size_npc_1",
                name: "Dragon March Size vs Creatures",
                description: "Increases dragon march size when attacking creatures",
                category: "research_Dragon_03",
                maxLevel: 10,
                statType: "DragonMaxMarchSizeVsNPC_research",
                // Values at each level (cumulative bonus)
                values: [100, 150, 200, 250, 300, 350, 400, 450, 500, 550]
            },
            marchSizeNpc2: {
                id: "research_dragon_march_size_npc_2",
                name: "Dragon March Size vs Creatures II",
                description: "Further increases dragon march size vs creatures",
                category: "research_Dragon_03",
                maxLevel: 10,
                statType: "DragonMaxMarchSizeVsNPC_research",
                values: [100, 150, 200, 250, 300, 350, 400, 450, 500, 550]
            }
        },

        // Adolescent Research Tree (Category: research_Dragon_04)
        adolescent: {
            marchSize1: {
                id: "research_dragon_march_size_1",
                name: "Dragon March Size",
                description: "Increases dragon march size for SoP/Keep",
                category: "research_Dragon_04",
                maxLevel: 10,
                statType: "DragonMaxMarchSize_research",
                values: [300, 350, 400, 450, 500, 550, 600, 650, 700, 750]
            }
        },

        // Adult Research Tree (Category: research_Dragon_05)
        adult: {
            marchSize2: {
                id: "research_dragon_march_size_2",
                name: "Dragon March Size II",
                description: "Further increases dragon march size for SoP/Keep",
                category: "research_Dragon_05",
                maxLevel: 10,
                statType: "DragonMaxMarchSize_research",
                values: [500, 550, 600, 650, 700, 750, 800, 850, 900, 950]
            }
        }
    },

    /**
     * Get research bonus at a specific level
     * @param {string} tree - Research tree (whelp, adolescent, adult)
     * @param {string} researchKey - Research key within the tree
     * @param {number} level - Current research level (1-based)
     * @returns {number} March size bonus
     */
    getResearchBonus: function(tree, researchKey, level) {
        const research = this.research[tree]?.[researchKey];
        if (!research || level <= 0) return 0;
        const index = Math.min(level, research.maxLevel) - 1;
        return research.values[index] || 0;
    },

    /**
     * Calculate total march size from dragon research
     * @param {Object} researchLevels - Object with research levels { whelp: {}, adolescent: {}, adult: {} }
     * @returns {Object} { total, vsNPC, vsSoP, breakdown }
     */
    calculateResearchMarchSize: function(researchLevels) {
        let total = 0;
        let vsNPC = 0;
        let vsSoP = 0;
        const breakdown = [];

        // Calculate Whelp research (vs NPC only)
        if (researchLevels.whelp) {
            Object.entries(researchLevels.whelp).forEach(([key, level]) => {
                const bonus = this.getResearchBonus('whelp', key, level);
                if (bonus > 0) {
                    vsNPC += bonus;
                    const research = this.research.whelp[key];
                    breakdown.push({
                        tree: 'whelp',
                        name: research.name,
                        level: level,
                        bonus: bonus,
                        type: 'vsNPC'
                    });
                }
            });
        }

        // Calculate Adolescent research (general march size)
        if (researchLevels.adolescent) {
            Object.entries(researchLevels.adolescent).forEach(([key, level]) => {
                const bonus = this.getResearchBonus('adolescent', key, level);
                if (bonus > 0) {
                    vsSoP += bonus;
                    total += bonus;
                    const research = this.research.adolescent[key];
                    breakdown.push({
                        tree: 'adolescent',
                        name: research.name,
                        level: level,
                        bonus: bonus,
                        type: 'general'
                    });
                }
            });
        }

        // Calculate Adult research (general march size)
        if (researchLevels.adult) {
            Object.entries(researchLevels.adult).forEach(([key, level]) => {
                const bonus = this.getResearchBonus('adult', key, level);
                if (bonus > 0) {
                    vsSoP += bonus;
                    total += bonus;
                    const research = this.research.adult[key];
                    breakdown.push({
                        tree: 'adult',
                        name: research.name,
                        level: level,
                        bonus: bonus,
                        type: 'general'
                    });
                }
            });
        }

        return {
            total: total + vsNPC,
            vsNPC: vsNPC,
            vsSoP: vsSoP,
            breakdown: breakdown
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DRAGON_MS_DATA;
}
