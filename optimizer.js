/**
 * Crafting Optimizer
 * Calculates the optimal crafting plan to maximize high-level Legendary gear
 * 
 * @author Crafting Tool Team
 * @version 1.0.0
 * @date December 2025
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // CONSTANTS & CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Optimization strategies
     */
    const STRATEGIES = {
        MAX_LEVEL: 'max_level',      // Push as many pieces to Level 50 as possible
        BALANCED: 'balanced',         // Even spread across all 6 pieces
        SAFE_PATH: 'safe_path'        // Focus on Level 45 (cheaper, more legendaries)
    };

    /**
     * Equipment pieces and their material requirements
     * Each piece needs: 1 seasonal material + 3 basic materials
     */
    const EQUIPMENT_MATERIALS = {
        boots: {
            name: 'Boots',
            icon: '🥾',
            seasonal: true,
            basic: ['milk-of-the-poppy', 'wildfire', 'weirwood'],
            materialCount: 4
        },
        chest: {
            name: 'Chest',
            icon: '👕',
            seasonal: true,
            basic: ['ironwood', 'goldenheart-wood', 'leather-straps'],
            materialCount: 4
        },
        helmet: {
            name: 'Helmet',
            icon: '⛑️',
            seasonal: true,
            basic: ['wildfire', 'ironwood', 'leather-straps'],
            materialCount: 4
        },
        pants: {
            name: 'Pants',
            icon: '👖',
            seasonal: true,
            basic: ['dragonglass', 'copper-bar', 'black-iron'],
            materialCount: 4
        },
        ring: {
            name: 'Ring',
            icon: '💍',
            seasonal: true,
            basic: ['dragonglass', 'silk', 'goldenheart-wood'],
            materialCount: 4
        },
        weapon: {
            name: 'Weapon',
            icon: '⚔️',
            seasonal: true,
            basic: ['weirwood', 'kingswood-oak', 'hide'],
            materialCount: 4
        }
    };

    /**
     * Material costs per template at each level (Poor equivalent)
     */
    const MATERIAL_COSTS = {
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
    };

    /**
     * Verified crafting odds by material count (Exquisite/Purple input)
     * From ADB screenshots December 2025
     */
    const ODDS_EXQUISITE = {
        2: { legendary: 0.3636, epic: 0.0909, exquisite: 0.5455, fine: 0 },
        3: { legendary: 0.40, epic: 0.0667, exquisite: 0.5333, fine: 0 },
        4: { legendary: 0.4211, epic: 0.0526, exquisite: 0.5263, fine: 0 }
    };

    /**
     * Verified crafting odds by material count (Fine/Blue input)
     */
    const ODDS_FINE = {
        2: { legendary: 0.2857, epic: 0.0714, exquisite: 0.1429, fine: 0.50 },
        3: { legendary: 0.3333, epic: 0.0556, exquisite: 0.1111, fine: 0.50 },
        4: { legendary: 0.3636, epic: 0.0455, exquisite: 0.0909, fine: 0.50 }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // CORE CALCULATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Calculate effective legendary rate accounting for 4:1 combining
     * Effective = legendary + epic/4 + exquisite/16 + fine/64
     * 
     * @param {number} materialCount - Number of materials (2, 3, or 4)
     * @param {string} inputQuality - 'exquisite' or 'fine'
     * @returns {number} - Effective legendary rate (0-1)
     */
    function calculateEffectiveRate(materialCount = 4, inputQuality = 'exquisite') {
        // Use CRAFTING_DATA if available
        if (typeof CRAFTING_DATA !== 'undefined' && CRAFTING_DATA.calculateEffectiveRateByMaterials) {
            return CRAFTING_DATA.calculateEffectiveRateByMaterials(materialCount, inputQuality);
        }
        
        // Fallback to local odds
        const oddsTable = inputQuality === 'fine' ? ODDS_FINE : ODDS_EXQUISITE;
        const odds = oddsTable[materialCount] || oddsTable[4];
        
        return odds.legendary + 
               (odds.epic / 4) + 
               (odds.exquisite / 16) + 
               (odds.fine / 64);
    }

    /**
     * Calculate materials needed per legendary template
     * 
     * @param {number} level - Target crafting level
     * @param {number} materialCount - Number of materials (2, 3, or 4)
     * @param {string} inputQuality - 'exquisite' or 'fine'
     * @returns {number} - Materials per legendary
     */
    function getMaterialsPerLegendary(level, materialCount = 4, inputQuality = 'exquisite') {
        const baseCost = MATERIAL_COSTS[level];
        const effectiveRate = calculateEffectiveRate(materialCount, inputQuality);
        return baseCost / effectiveRate;
    }

    /**
     * Find the bottleneck material for an equipment piece
     * 
     * @param {string} pieceKey - Equipment piece key (boots, chest, etc.)
     * @param {object} materials - Available materials { 'material-id': amount }
     * @param {number} seasonalAmount - Amount of seasonal material available
     * @returns {object} - { material, amount, isBottleneck }
     */
    function findBottleneck(pieceKey, materials, seasonalAmount) {
        const piece = EQUIPMENT_MATERIALS[pieceKey];
        if (!piece) return null;

        let bottleneck = {
            material: 'seasonal',
            materialName: 'Seasonal Material',
            amount: seasonalAmount,
            isBottleneck: true
        };

        // Check each basic material
        for (const matKey of piece.basic) {
            const matId = `my-${matKey}`;
            const amount = materials[matId] || 0;
            
            if (amount < bottleneck.amount) {
                bottleneck = {
                    material: matId,
                    materialName: matKey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    amount: amount,
                    isBottleneck: true
                };
            }
        }

        return bottleneck;
    }

    /**
     * Calculate max legendaries for a single piece at a given level
     * 
     * @param {string} pieceKey - Equipment piece key
     * @param {object} materials - Available materials
     * @param {number} seasonalAmount - Seasonal material available
     * @param {number} level - Target level
     * @param {string} inputQuality - Material quality used
     * @returns {object} - Calculation results
     */
    function calculatePieceOutput(pieceKey, materials, seasonalAmount, level, inputQuality = 'exquisite') {
        const piece = EQUIPMENT_MATERIALS[pieceKey];
        const bottleneck = findBottleneck(pieceKey, materials, seasonalAmount);
        
        if (!bottleneck || bottleneck.amount <= 0) {
            return {
                piece: pieceKey,
                pieceName: piece.name,
                pieceIcon: piece.icon,
                level: level,
                expectedLegendaries: 0,
                bottleneck: bottleneck,
                materialsUsed: 0,
                materialsRemaining: 0
            };
        }

        const materialsPerLegendary = getMaterialsPerLegendary(level, piece.materialCount, inputQuality);
        const maxLegendaries = Math.floor(bottleneck.amount / materialsPerLegendary);
        const materialsUsed = maxLegendaries * materialsPerLegendary;

        return {
            piece: pieceKey,
            pieceName: piece.name,
            pieceIcon: piece.icon,
            level: level,
            expectedLegendaries: maxLegendaries,
            bottleneck: bottleneck,
            materialsPerLegendary: Math.round(materialsPerLegendary),
            materialsUsed: Math.round(materialsUsed),
            materialsRemaining: Math.round(bottleneck.amount - materialsUsed),
            effectiveRate: (calculateEffectiveRate(piece.materialCount, inputQuality) * 100).toFixed(1) + '%'
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CASCADING CRAFTING SIMULATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Get the practical success rate per crafting level
     * 
     * The "effective rate" with perfect 4:1 combining is ~46.7%, but in practice:
     * - Most players don't perfectly combine all failures
     * - Some failures are lost or used elsewhere
     * - RNG variance means actual results vary
     * 
     * We use a "practical rate" that's closer to real player experience
     * 
     * @param {number} materialCount - 2, 3, or 4
     * @param {string} inputQuality - 'exquisite' or 'fine'
     * @param {boolean} perfectCombining - If true, use theoretical max; if false, use practical
     * @returns {number} - Success rate per level
     */
    function getPracticalRate(materialCount = 4, inputQuality = 'exquisite', perfectCombining = false) {
        const oddsTable = inputQuality === 'fine' ? ODDS_FINE : ODDS_EXQUISITE;
        const odds = oddsTable[materialCount] || oddsTable[4];
        
        if (perfectCombining) {
            // Theoretical maximum with perfect 4:1 combining
            return odds.legendary + (odds.epic / 4) + (odds.exquisite / 16) + (odds.fine / 64);
        } else {
            // Practical rate: raw legendary + partial combining credit
            // Assume ~50% efficiency on combining (some failures lost/wasted)
            const combineBonus = (odds.epic / 8) + (odds.exquisite / 32) + (odds.fine / 128);
            return odds.legendary + combineBonus;
        }
    }

    /**
     * Simulate the cascading crafting process
     * 
     * CRAFTING CHAIN:
     * Materials → L10 (100%) → L15 → L20 → L25 → L30 → L35 → L40 → L45 → L50
     * 
     * At each level 15+:
     * - You need 1 template from previous level + materials for that level
     * - Success rate determines quality (legendary/epic/exquisite)
     * - Failed crafts can be combined (4:1) to upgrade quality
     * 
     * @param {number} availableMaterials - Total materials available (Poor equivalent)
     * @param {number} targetLevel - Target level to reach (20, 25, 30, 35, 40, 45, 50)
     * @param {number} materialCount - Number of materials used (2, 3, or 4)
     * @param {string} inputQuality - 'exquisite' or 'fine'
     * @param {boolean} perfectCombining - Use perfect combining (theoretical max)
     * @returns {object} - { startingTemplates, finalLegendaries, materialsUsed, breakdown }
     */
    function simulateCraftingChain(availableMaterials, targetLevel, materialCount = 4, inputQuality = 'exquisite', perfectCombining = false) {
        const CRAFTING_LEVELS = [10, 15, 20, 25, 30, 35, 40, 45, 50];
        const targetIndex = CRAFTING_LEVELS.indexOf(targetLevel);
        
        if (targetIndex === -1) {
            return { startingTemplates: 0, finalLegendaries: 0, materialsUsed: 0 };
        }

        // Calculate total materials needed per final legendary at target level
        // This accounts for the cascading losses at each level
        // Use practical rate for realistic estimates
        const effectiveRate = getPracticalRate(materialCount, inputQuality, perfectCombining);
        
        // How many levels do we need to climb from L10?
        const levelsToClimb = targetIndex; // L10 is index 0, so L50 would be 8 levels to climb
        
        // Total material cost is sum of costs at each level we pass through
        let totalMaterialCostPerPath = 0;
        for (let i = 0; i <= targetIndex; i++) {
            totalMaterialCostPerPath += MATERIAL_COSTS[CRAFTING_LEVELS[i]];
        }
        
        // Calculate the cascade multiplier
        // Each level after L10 has success rate applied
        // So to get 1 final legendary, we need 1/rate^levels starting templates
        const cascadeMultiplier = Math.pow(1 / effectiveRate, levelsToClimb);
        
        // Materials needed per final legendary = 
        // (L10 templates needed * L10 cost) + (materials at each subsequent level)
        // 
        // Simplified model: we need cascadeMultiplier L10 templates to get 1 final legendary
        // Each L10 template costs MATERIAL_COSTS[10] materials
        // Plus we need materials at each level for the templates that make it through
        
        // More accurate calculation:
        // At L10: Start with N templates, cost = N * 20
        // At L15: N * rate templates survive, cost = N * rate * 120  
        // At L20: N * rate^2 templates, cost = N * rate^2 * 400
        // etc.
        
        let materialsPerFinalLegendary = 0;
        let templatesAtLevel = 1; // Start with needing 1 final legendary
        
        // Work backwards from target to L10
        for (let i = targetIndex; i >= 0; i--) {
            const level = CRAFTING_LEVELS[i];
            const levelCost = MATERIAL_COSTS[level];
            
            // Materials needed at this level for the templates at this level
            materialsPerFinalLegendary += templatesAtLevel * levelCost;
            
            // How many templates did we need at the previous level?
            // (only applies for levels after L10)
            if (i > 0) {
                templatesAtLevel = templatesAtLevel / effectiveRate;
            }
        }
        
        // How many final legendaries can we make?
        const finalLegendaries = Math.floor(availableMaterials / materialsPerFinalLegendary);
        const startingTemplates = Math.ceil(finalLegendaries * cascadeMultiplier);
        const materialsUsed = finalLegendaries * materialsPerFinalLegendary;
        
        // Build breakdown by level
        const breakdown = [];
        let currentTemplates = startingTemplates;
        
        for (let i = 0; i <= targetIndex; i++) {
            const level = CRAFTING_LEVELS[i];
            breakdown.push({
                level,
                templatesIn: Math.round(currentTemplates),
                templatesOut: i < targetIndex ? Math.round(currentTemplates * effectiveRate) : finalLegendaries,
                materialCost: MATERIAL_COSTS[level]
            });
            
            if (i < targetIndex) {
                currentTemplates = currentTemplates * effectiveRate;
            }
        }
        
        return {
            startingTemplates: Math.round(startingTemplates),
            finalLegendaries,
            materialsUsed: Math.round(materialsUsed),
            materialsPerLegendary: Math.round(materialsPerFinalLegendary),
            effectiveRate: (effectiveRate * 100).toFixed(1) + '%',
            cascadeMultiplier: cascadeMultiplier.toFixed(1),
            breakdown
        };
    }

    /**
     * Calculate piece output using cascading simulation
     */
    function calculatePieceOutputCascading(pieceKey, materials, seasonalAmount, targetLevel, inputQuality = 'exquisite') {
        const piece = EQUIPMENT_MATERIALS[pieceKey];
        const bottleneck = findBottleneck(pieceKey, materials, seasonalAmount);
        
        if (!bottleneck || bottleneck.amount <= 0) {
            return {
                piece: pieceKey,
                pieceName: piece.name,
                pieceIcon: piece.icon,
                level: targetLevel,
                expectedLegendaries: 0,
                bottleneck: bottleneck,
                materialsUsed: 0,
                startingTemplates: 0
            };
        }

        const simulation = simulateCraftingChain(
            bottleneck.amount, 
            targetLevel, 
            piece.materialCount, 
            inputQuality
        );

        return {
            piece: pieceKey,
            pieceName: piece.name,
            pieceIcon: piece.icon,
            level: targetLevel,
            expectedLegendaries: simulation.finalLegendaries,
            bottleneck: bottleneck,
            materialsPerLegendary: simulation.materialsPerLegendary,
            materialsUsed: simulation.materialsUsed,
            startingTemplates: simulation.startingTemplates,
            effectiveRate: simulation.effectiveRate,
            breakdown: simulation.breakdown
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // OPTIMIZATION STRATEGIES
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * MAX_LEVEL Strategy: Push as many pieces to Level 50 as possible
     * Uses cascading simulation for accurate results
     */
    function optimizeMaxLevel(materials, seasonalAmount, inputQuality = 'exquisite') {
        const plan = {
            strategy: STRATEGIES.MAX_LEVEL,
            strategyName: 'Maximum Level',
            strategyDescription: 'Push as many pieces to Level 50 as possible',
            pieces: {},
            summary: {
                totalLegendaries: 0,
                level50Count: 0,
                level45Count: 0,
                level40Count: 0,
                totalMaterialsUsed: 0
            }
        };

        const pieces = Object.keys(EQUIPMENT_MATERIALS);
        
        for (const pieceKey of pieces) {
            // Try Level 50 first
            let result = calculatePieceOutputCascading(pieceKey, materials, seasonalAmount, 50, inputQuality);
            
            // If no L50 possible, try L45
            if (result.expectedLegendaries === 0) {
                result = calculatePieceOutputCascading(pieceKey, materials, seasonalAmount, 45, inputQuality);
            }
            
            // If still nothing, try L40
            if (result.expectedLegendaries === 0) {
                result = calculatePieceOutputCascading(pieceKey, materials, seasonalAmount, 40, inputQuality);
            }
            
            // Try L35
            if (result.expectedLegendaries === 0) {
                result = calculatePieceOutputCascading(pieceKey, materials, seasonalAmount, 35, inputQuality);
            }

            plan.pieces[pieceKey] = result;
            plan.summary.totalLegendaries += result.expectedLegendaries;
            plan.summary.totalMaterialsUsed += result.materialsUsed;
            
            if (result.level === 50 && result.expectedLegendaries > 0) {
                plan.summary.level50Count++;
            } else if (result.level === 45 && result.expectedLegendaries > 0) {
                plan.summary.level45Count++;
            } else if (result.level === 40 && result.expectedLegendaries > 0) {
                plan.summary.level40Count++;
            }
        }

        return plan;
    }

    /**
     * BALANCED Strategy: Even spread across all 6 pieces at same level
     */
    function optimizeBalanced(materials, seasonalAmount, inputQuality = 'exquisite') {
        const plan = {
            strategy: STRATEGIES.BALANCED,
            strategyName: 'Balanced',
            strategyDescription: 'Even spread across all 6 equipment pieces',
            pieces: {},
            summary: {
                totalLegendaries: 0,
                targetLevel: 50,
                totalMaterialsUsed: 0
            }
        };

        const pieces = Object.keys(EQUIPMENT_MATERIALS);
        
        // Find the best level where ALL pieces can produce at least 1 legendary
        const targetLevels = [50, 45, 40, 35, 30, 25, 20];
        let bestLevel = 20;
        
        for (const level of targetLevels) {
            let allCanProduce = true;
            
            for (const pieceKey of pieces) {
                const result = calculatePieceOutputCascading(pieceKey, materials, seasonalAmount, level, inputQuality);
                if (result.expectedLegendaries === 0) {
                    allCanProduce = false;
                    break;
                }
            }
            
            if (allCanProduce) {
                bestLevel = level;
                break;
            }
        }
        
        plan.summary.targetLevel = bestLevel;

        // Calculate output at best level for all pieces
        for (const pieceKey of pieces) {
            const result = calculatePieceOutputCascading(pieceKey, materials, seasonalAmount, bestLevel, inputQuality);
            plan.pieces[pieceKey] = result;
            plan.summary.totalLegendaries += result.expectedLegendaries;
            plan.summary.totalMaterialsUsed += result.materialsUsed;
        }

        return plan;
    }

    /**
     * SAFE_PATH Strategy: Focus on Level 40 for maximum legendaries
     * Much more achievable than L45/L50 with typical material amounts
     */
    function optimizeSafePath(materials, seasonalAmount, inputQuality = 'exquisite') {
        const plan = {
            strategy: STRATEGIES.SAFE_PATH,
            strategyName: 'Safe Path',
            strategyDescription: 'Focus on Level 40 for more Legendary pieces',
            pieces: {},
            summary: {
                totalLegendaries: 0,
                totalMaterialsUsed: 0,
                materialEfficiency: 0
            }
        };

        const pieces = Object.keys(EQUIPMENT_MATERIALS);
        
        for (const pieceKey of pieces) {
            // Try L40 first, fall back to L35 if needed
            let result = calculatePieceOutputCascading(pieceKey, materials, seasonalAmount, 40, inputQuality);
            
            if (result.expectedLegendaries === 0) {
                result = calculatePieceOutputCascading(pieceKey, materials, seasonalAmount, 35, inputQuality);
            }
            
            plan.pieces[pieceKey] = result;
            plan.summary.totalLegendaries += result.expectedLegendaries;
            plan.summary.totalMaterialsUsed += result.materialsUsed;
        }

        // Calculate comparison vs L50
        const l50Plan = optimizeMaxLevel(materials, seasonalAmount, inputQuality);
        if (l50Plan.summary.totalLegendaries > 0) {
            plan.summary.vsLevel50 = {
                moreLegendaries: plan.summary.totalLegendaries - l50Plan.summary.totalLegendaries,
                percentMore: ((plan.summary.totalLegendaries / l50Plan.summary.totalLegendaries - 1) * 100).toFixed(0) + '%'
            };
        }

        return plan;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MAIN OPTIMIZATION FUNCTION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Generate optimal crafting plan based on available materials and strategy
     * 
     * @param {object} materials - Available materials { 'my-material-id': amount }
     * @param {string} strategy - One of STRATEGIES values
     * @param {object} options - Additional options
     * @returns {object} - Optimized crafting plan
     */
    function optimizeCraftingPlan(materials, strategy = STRATEGIES.MAX_LEVEL, options = {}) {
        const inputQuality = options.inputQuality || 'exquisite';
        
        // Find seasonal materials (any material from season > 0)
        let seasonalAmount = Infinity;
        let seasonalMaterials = [];
        
        // Build material info map
        const materialInfo = {};
        if (typeof MATERIAL_INFO !== 'undefined') {
            Object.assign(materialInfo, MATERIAL_INFO);
        }
        
        // Find minimum seasonal material (the bottleneck)
        for (const [matId, amount] of Object.entries(materials)) {
            const info = materialInfo[matId];
            if (info && info.season > 0) {
                seasonalMaterials.push({ id: matId, amount, season: info.season });
                if (amount < seasonalAmount) {
                    seasonalAmount = amount;
                }
            }
        }
        
        // If no seasonal materials found, try to detect from material names
        if (seasonalAmount === Infinity) {
            // Look for materials that aren't basic (basic materials have specific IDs)
            const basicMaterials = [
                'my-black-iron', 'my-copper-bar', 'my-dragonglass', 'my-goldenheart-wood',
                'my-hide', 'my-ironwood', 'my-kingswood-oak', 'my-leather-straps',
                'my-milk-of-the-poppy', 'my-silk', 'my-weirwood', 'my-wildfire'
            ];
            
            for (const [matId, amount] of Object.entries(materials)) {
                if (!basicMaterials.includes(matId) && amount > 0) {
                    seasonalMaterials.push({ id: matId, amount, season: 1 });
                    if (amount < seasonalAmount) {
                        seasonalAmount = amount;
                    }
                }
            }
        }
        
        if (seasonalAmount === Infinity) {
            seasonalAmount = 0;
        }

        // Run the appropriate strategy
        let plan;
        switch (strategy) {
            case STRATEGIES.MAX_LEVEL:
                plan = optimizeMaxLevel(materials, seasonalAmount, inputQuality);
                break;
            case STRATEGIES.BALANCED:
                plan = optimizeBalanced(materials, seasonalAmount, inputQuality);
                break;
            case STRATEGIES.SAFE_PATH:
                plan = optimizeSafePath(materials, seasonalAmount, inputQuality);
                break;
            default:
                plan = optimizeMaxLevel(materials, seasonalAmount, inputQuality);
        }

        // Add metadata
        plan.metadata = {
            seasonalAmount,
            seasonalMaterials,
            inputQuality,
            generatedAt: new Date().toISOString()
        };

        return plan;
    }

    /**
     * Compare all strategies and return comparison data
     * 
     * @param {object} materials - Available materials
     * @param {object} options - Additional options
     * @returns {object} - Comparison of all strategies
     */
    function compareStrategies(materials, options = {}) {
        const comparison = {
            maxLevel: optimizeCraftingPlan(materials, STRATEGIES.MAX_LEVEL, options),
            balanced: optimizeCraftingPlan(materials, STRATEGIES.BALANCED, options),
            safePath: optimizeCraftingPlan(materials, STRATEGIES.SAFE_PATH, options)
        };

        // Find the best strategy based on different criteria
        comparison.recommendations = {
            mostLegendaries: null,
            highestLevel: null,
            bestBalance: null
        };

        // Most total legendaries
        let maxLegendaries = 0;
        for (const [key, plan] of Object.entries(comparison)) {
            if (key === 'recommendations') continue;
            if (plan.summary.totalLegendaries > maxLegendaries) {
                maxLegendaries = plan.summary.totalLegendaries;
                comparison.recommendations.mostLegendaries = key;
            }
        }

        // Highest level achieved
        if (comparison.maxLevel.summary.level50Count > 0) {
            comparison.recommendations.highestLevel = 'maxLevel';
        } else {
            comparison.recommendations.highestLevel = 'safePath';
        }

        // Best balance (all 6 pieces at same level)
        comparison.recommendations.bestBalance = 'balanced';

        return comparison;
    }

    /**
     * Get shared materials analysis (materials used by multiple pieces)
     * 
     * @returns {object} - Shared materials info
     */
    function getSharedMaterialsAnalysis() {
        const materialUsage = {};
        
        for (const [pieceKey, piece] of Object.entries(EQUIPMENT_MATERIALS)) {
            for (const mat of piece.basic) {
                if (!materialUsage[mat]) {
                    materialUsage[mat] = [];
                }
                materialUsage[mat].push(piece.name);
            }
        }
        
        // Find materials used by multiple pieces
        const shared = {};
        for (const [mat, pieces] of Object.entries(materialUsage)) {
            if (pieces.length > 1) {
                shared[mat] = {
                    materialName: mat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    usedBy: pieces,
                    count: pieces.length
                };
            }
        }
        
        return shared;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ═══════════════════════════════════════════════════════════════════════════
    // VERIFICATION / TESTING HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Verify the cascading calculation matches expected results
     * User reported: 1000 L10 templates → ~5 L40 legendaries
     */
    function verifyCascadingCalculation() {
        // Test: How many materials to get 1000 L10 templates?
        const l10Cost = MATERIAL_COSTS[10]; // 20
        const materialsFor1000L10 = 1000 * l10Cost; // 20,000
        
        console.log('=== Verification Test ===');
        console.log(`Materials for 1000 L10 templates: ${materialsFor1000L10.toLocaleString()}`);
        
        // Simulate at different target levels
        [35, 40, 45, 50].forEach(level => {
            const result = simulateCraftingChain(materialsFor1000L10, level, 4, 'exquisite');
            console.log(`L${level}: ${result.finalLegendaries} legendaries (from ${result.startingTemplates} L10 templates)`);
        });
        
        return {
            materialsFor1000L10,
            results: {
                L35: simulateCraftingChain(materialsFor1000L10, 35, 4, 'exquisite'),
                L40: simulateCraftingChain(materialsFor1000L10, 40, 4, 'exquisite'),
                L45: simulateCraftingChain(materialsFor1000L10, 45, 4, 'exquisite'),
                L50: simulateCraftingChain(materialsFor1000L10, 50, 4, 'exquisite')
            }
        };
    }

    /**
     * Quick estimate: Given starting L10 templates, how many final legendaries?
     * 
     * @param {number} l10Templates - Number of L10 templates to start with
     * @param {number} targetLevel - Target level (20, 25, 30, 35, 40, 45, 50)
     * @param {number} materialCount - 2, 3, or 4 materials
     * @param {string} inputQuality - 'exquisite' or 'fine'
     * @param {boolean} perfectCombining - Use perfect combining (theoretical max)
     * @returns {object} - { finalLegendaries, lossPerLevel }
     */
    function estimateFromTemplates(l10Templates, targetLevel, materialCount = 4, inputQuality = 'exquisite', perfectCombining = false) {
        const CRAFTING_LEVELS = [10, 15, 20, 25, 30, 35, 40, 45, 50];
        const practicalRate = getPracticalRate(materialCount, inputQuality, perfectCombining);
        
        const targetIndex = CRAFTING_LEVELS.indexOf(targetLevel);
        const levelsToClimb = targetIndex; // Number of success-rate steps
        
        const finalLegendaries = Math.floor(l10Templates * Math.pow(practicalRate, levelsToClimb));
        
        return {
            startingTemplates: l10Templates,
            targetLevel,
            finalLegendaries,
            successRate: (practicalRate * 100).toFixed(1) + '%',
            levelsClimbed: levelsToClimb,
            totalLossRatio: (l10Templates / Math.max(1, finalLegendaries)).toFixed(1) + ':1',
            mode: perfectCombining ? 'theoretical (perfect combining)' : 'practical (realistic)'
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════

    // Expose to global scope
    window.CraftingOptimizer = {
        // Constants
        STRATEGIES,
        EQUIPMENT_MATERIALS,
        MATERIAL_COSTS,
        
        // Core functions
        calculateEffectiveRate,
        getPracticalRate,
        getMaterialsPerLegendary,
        findBottleneck,
        calculatePieceOutput,
        
        // Cascading simulation
        simulateCraftingChain,
        calculatePieceOutputCascading,
        estimateFromTemplates,
        
        // Optimization functions
        optimizeCraftingPlan,
        compareStrategies,
        
        // Analysis functions
        getSharedMaterialsAnalysis,
        verifyCascadingCalculation,
        
        // Strategy-specific functions
        optimizeMaxLevel,
        optimizeBalanced,
        optimizeSafePath
    };

    // Run verification on load
    console.log('✅ Crafting Optimizer loaded (with cascading simulation)');
    console.log('   Strategies:', Object.values(STRATEGIES).join(', '));
    console.log('   Equipment pieces:', Object.keys(EQUIPMENT_MATERIALS).length);
    
    // Quick verification - should show ~5 L40 from 1000 L10 (matching user experience)
    const verifyPractical = estimateFromTemplates(1000, 40, 4, 'exquisite', false);
    const verifyTheory = estimateFromTemplates(1000, 40, 4, 'exquisite', true);
    console.log(`   Verification (practical): 1000 L10 → ${verifyPractical.finalLegendaries} L40 (${verifyPractical.successRate}/level)`);
    console.log(`   Verification (theoretical): 1000 L10 → ${verifyTheory.finalLegendaries} L40 (${verifyTheory.successRate}/level)`);

})();

