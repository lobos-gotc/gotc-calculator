/**
 * Template Planner - Material Balancing Algorithm
 * 
 * This module implements a material balancing algorithm for template generation.
 * The goal is to select which gear pieces to craft such that materials are used evenly,
 * minimizing the variance in remaining materials.
 * 
 * Based on the Discord bot logic but extended to support:
 * - Multiple level ranges (L5, L10, L15, L20, L25, L30, L35, L40, L45)
 * - Cascade calculations (templates surviving through levels)
 * - Both basic and seasonal gear materials
 */

(function() {
    'use strict';

    // ========================================
    // CONSTANTS
    // ========================================

    // Material ID mapping (short codes used by players)
    const MATERIAL_CODES = {
        'BI': 'black-iron',
        'CB': 'copper-bar',
        'DG': 'dragonglass',
        'GH': 'goldenheart-wood',
        'HD': 'hide',
        'IW': 'ironwood',
        'KW': 'kingswood-oak',
        'LS': 'leather-straps',
        'MP': 'milk-of-the-poppy',
        'SK': 'silk',
        'WW': 'weirwood',
        'WF': 'wildfire'
    };

    // Reverse mapping
    const MATERIAL_IDS_TO_CODES = {};
    Object.entries(MATERIAL_CODES).forEach(([code, id]) => {
        MATERIAL_IDS_TO_CODES[id] = code;
    });

    // Cascade survival rates by level (using Exquisite/Purple materials with 4 mats)
    // Based on verified game data: ~42% legendary + combining losses
    const CASCADE_SURVIVAL_RATES = {
        15: 0.43,  // L10 → L15
        20: 0.43,  // L15 → L20
        25: 0.43,  // L20 → L25
        30: 0.43,  // L25 → L30
        35: 0.43,  // L30 → L35
        40: 0.43,  // L35 → L40
        45: 0.43   // L40 → L45
    };

    // Level to material cost (Poor equivalent per material slot)
    const LEVEL_COSTS = {
        1: 10,
        5: 15,
        10: 30,
        15: 180,
        20: 600,
        25: 1600,
        30: 4000,
        35: 16000,
        40: 45000,
        45: 120000
    };

    // ========================================
    // TEMPLATE ESTIMATION SYSTEM
    // ========================================
    
    // Average base material costs per level (total materials, not per slot)
    // Based on typical piece compositions from season0.js
    const LEVEL_AVG_BASE_COSTS = {
        1:  20,      // 2 mats × 10 each
        5:  30,      // 2 mats × 15 each
        10: 60,      // 2-3 mats × 20-30 each
        15: 360,     // 2 mats × 180 each
        20: 1200,    // 2 mats × 600 each
        25: 4800,    // 3 mats × 1600 each (or 2 × 2400)
        30: 12000,   // 3 mats × 4000 each (or 2 × 6000)
        35: 48000,   // 3 mats × 16000 each (or 2 × 24000)
        40: 180000,  // 4 mats × 45000 each (or 3 × 60000)
        45: 480000   // 4 mats × 120000 each
    };

    // Quality multipliers (4^index)
    const QUALITY_MULTIPLIERS = {
        poor: 1,
        common: 4,
        fine: 16,
        exquisite: 64,
        epic: 256,
        legendary: 1024
    };

    // Default quality by level (typical user choices)
    const DEFAULT_QUALITIES = {
        1: 'legendary',
        5: 'legendary',
        10: 'legendary',
        15: 'exquisite',
        20: 'exquisite',
        25: 'exquisite',
        30: 'fine',
        35: 'fine',
        40: 'common',
        45: 'common'
    };

    // Effective survival rates per quality (base rate + combining bonus)
    // 4 failures combine to 1 success at next tier, so effective rate is higher
    const EFFECTIVE_SURVIVAL_RATES = {
        legendary: 1.0,       // 100% - no loss
        epic: 0.75,           // ~70% + combining ≈ 75%
        exquisite: 0.465,     // ~43% + combining ≈ 46.5%
        fine: 0.20,           // ~16% + combining ≈ 20%
        common: 0.10,         // ~6% + combining ≈ 10%
        poor: 0.05            // ~3% + combining ≈ 5%
    };

    /**
     * Estimate material usage for a given starting template count
     * Uses average costs per level and cascade survival rates
     * 
     * @param {number} startingCount - Number of starting templates at L1
     * @param {Object} qualitySettings - Quality for each level (e.g., { 1: 'legendary', 15: 'exquisite' })
     * @returns {Object} - { totalUsage, breakdown: { level: { templates, cost } } }
     */
    function estimateMaterialUsage(startingCount, qualitySettings = {}) {
        const breakdown = {};
        let totalUsage = 0;
        let templates = startingCount;
        
        const levels = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
        
        for (const level of levels) {
            // Get quality for this level (use default if not specified)
            const quality = qualitySettings[level] || DEFAULT_QUALITIES[level];
            const multiplier = QUALITY_MULTIPLIERS[quality] || 1;
            const survivalRate = EFFECTIVE_SURVIVAL_RATES[quality] || 0.43;
            
            // Calculate cost for this level
            const baseCost = LEVEL_AVG_BASE_COSTS[level] || 0;
            const levelCost = Math.ceil(templates) * baseCost * multiplier;
            
            breakdown[level] = {
                templates: Math.ceil(templates),
                quality,
                multiplier,
                baseCost,
                totalCost: levelCost
            };
            
            totalUsage += levelCost;
            
            // Apply survival rate for next level (L1-L10 are all legendary, no loss between them)
            if (level >= 10) {
                templates = templates * survivalRate;
            }
        }
        
        return { totalUsage, breakdown };
    }

    /**
     * Estimate the maximum starting templates for given materials and usage target
     * Uses binary search to find the optimal starting count
     * 
     * @param {number} totalMaterials - Total available materials
     * @param {number} usagePercent - Target usage percentage (0.0 to 1.0)
     * @param {Object} qualitySettings - Quality for each level
     * @returns {Object} - { startingTemplates, estimatedUsage, breakdown }
     */
    /**
     * Estimate the maximum starting templates for given materials and usage target
     * Uses binary search to find the optimal starting count
     * 
     * @param {number|Object} materialsInput - Total materials (number) OR individual materials object
     * @param {number} usagePercent - Target usage percentage (0.0 to 1.0)
     * @param {Object} qualitySettings - Quality for each level
     * @returns {Object} - { startingTemplates, estimatedUsage, breakdown, bottleneck }
     */
    function estimateStartingTemplates(materialsInput, usagePercent = 0.6, qualitySettings = {}) {
        let totalMaterials = 0;
        let individualMaterials = null;
        let bottleneck = null;
        
        // Handle both number input (total) and object input (individual materials)
        if (typeof materialsInput === 'number') {
            totalMaterials = materialsInput;
        } else if (typeof materialsInput === 'object' && materialsInput !== null) {
            individualMaterials = materialsInput;
            totalMaterials = Object.values(individualMaterials).reduce((sum, val) => sum + (val || 0), 0);
            
            // Detect bottleneck material
            bottleneck = detectBottleneckMaterial(individualMaterials, qualitySettings);
        }
        
        const targetUsage = totalMaterials * usagePercent;
        
        // If we have individual materials and a bottleneck, use bottleneck-based estimation
        if (bottleneck && bottleneck.limitedTemplates < Infinity) {
            // Apply usage percent to bottleneck limit
            const bottleneckLimit = Math.floor(bottleneck.limitedTemplates * usagePercent);
            
            if (bottleneckLimit > 0) {
                const estimate = estimateMaterialUsage(bottleneckLimit, qualitySettings);
                return {
                    startingTemplates: bottleneckLimit,
                    estimatedUsage: estimate.totalUsage,
                    usagePercent: totalMaterials > 0 ? estimate.totalUsage / totalMaterials : 0,
                    breakdown: estimate.breakdown,
                    bottleneck: bottleneck
                };
            }
        }
        
        // Binary search for the right starting count
        let low = 1;
        let high = 100000; // Reasonable upper bound
        let bestEstimate = null;
        
        // Quick sanity check - if even 1 template exceeds target, return 0
        const singleTemplateUsage = estimateMaterialUsage(1, qualitySettings);
        if (singleTemplateUsage.totalUsage > targetUsage) {
            return {
                startingTemplates: 0,
                estimatedUsage: 0,
                usagePercent: 0,
                breakdown: {},
                bottleneck: bottleneck,
                message: 'Insufficient materials for even 1 template'
            };
        }
        
        let iterations = 0;
        const maxIterations = 50;
        
        while (high - low > 1 && iterations < maxIterations) {
            iterations++;
            const mid = Math.floor((low + high) / 2);
            const estimate = estimateMaterialUsage(mid, qualitySettings);
            
            if (estimate.totalUsage <= targetUsage) {
                low = mid;
                bestEstimate = { count: mid, ...estimate };
            } else {
                high = mid;
            }
        }
        
        // Final check at low value
        if (!bestEstimate) {
            const finalEstimate = estimateMaterialUsage(low, qualitySettings);
            bestEstimate = { count: low, ...finalEstimate };
        }
        
        return {
            startingTemplates: bestEstimate.count,
            estimatedUsage: bestEstimate.totalUsage,
            usagePercent: totalMaterials > 0 ? bestEstimate.totalUsage / totalMaterials : 0,
            breakdown: bestEstimate.breakdown,
            bottleneck: bottleneck
        };
    }
    
    /**
     * Detect which material is the bottleneck (limits template production the most)
     * @param {Object} materials - Individual material amounts { 'black-iron': 1000000, ... }
     * @param {Object} qualitySettings - Quality for each level
     * @returns {Object|null} - { material, amount, limitedTemplates, reason }
     */
    function detectBottleneckMaterial(materials, qualitySettings = {}) {
        if (!materials || Object.keys(materials).length === 0) return null;
        
        // Average material consumption per template across all levels
        // This is an approximation based on typical gear recipes
        // Each piece uses 2-4 material types, ~60-100 total per template at early levels
        const AVG_MATS_PER_TEMPLATE_L1_L10 = 110; // Average across L1+L5+L10 for legendary
        
        // Quality multiplier for early levels (L1-L10 are typically legendary)
        const earlyQuality = qualitySettings[1] || qualitySettings[5] || qualitySettings[10] || 'legendary';
        const multiplier = QUALITY_MULTIPLIERS[earlyQuality] || 1024;
        
        // Adjust based on quality - legendary uses much more materials
        const adjustedAvgMats = AVG_MATS_PER_TEMPLATE_L1_L10 * (multiplier / 1024);
        
        // Find the material with the lowest capacity
        let bottleneck = null;
        let minTemplates = Infinity;
        
        // Basic materials that are used in most crafting recipes
        const COMMON_BASIC_MATS = [
            'black-iron', 'copper-bar', 'dragonglass', 'goldenheart-wood',
            'hide', 'ironwood', 'kingswood-oak', 'leather-straps',
            'milk-of-the-poppy', 'silk', 'weirwood', 'wildfire'
        ];
        
        for (const [matId, amount] of Object.entries(materials)) {
            if (amount <= 0) continue;
            
            // Normalize material ID (remove my- prefix if present)
            const normalizedId = matId.replace(/^my-/, '');
            
            // Only check basic materials for bottleneck (they're used more consistently)
            if (!COMMON_BASIC_MATS.includes(normalizedId)) continue;
            
            // Estimate how many templates this material can support
            // Each basic material is used in roughly 1/4 to 1/2 of recipes
            // Conservative estimate: assume this material is used in 1/3 of pieces
            const usageRate = 0.33;
            const avgUsagePerTemplate = adjustedAvgMats * usageRate;
            
            if (avgUsagePerTemplate > 0) {
                const templatesSupported = Math.floor(amount / avgUsagePerTemplate);
                
                if (templatesSupported < minTemplates) {
                    minTemplates = templatesSupported;
                    bottleneck = {
                        material: normalizedId,
                        amount: amount,
                        limitedTemplates: templatesSupported,
                        reason: `Limited by ${normalizedId.replace(/-/g, ' ')}`
                    };
                }
            }
        }
        
        return bottleneck;
    }

    // ========================================
    // PIECE DATABASE (from season0.js)
    // ========================================

    /**
     * Get all available pieces for balancing at given levels
     * @param {number[]} levels - Array of levels to include
     * @param {Object} options - Filtering options
     * @param {boolean} options.includeCTW - Include Ceremonial Targaryen Warlord pieces
     * @param {boolean} options.includeSeasonGear - Include seasonal gear
     * @param {number[]} options.seasonGearLevels - Levels at which to allow season gear (e.g., [20,25,30,35,40,45])
     */
    function getAvailablePieces(levels, options = {}) {
        if (typeof craftItem === 'undefined' || !craftItem.products) {
            console.error('craftItem not available');
            return [];
        }

        const {
            includeCTW = true,
            includeSeasonGear = false,
            seasonGearLevels = [20, 25, 30, 35, 40, 45]  // Default: L20+
        } = options;

        return craftItem.products.filter(product => {
            const level = product.level;
            if (!levels.includes(level)) return false;

            // Basic gear (season 0) is always included
            const isBasic = product.season === 0;
            
            // CTW check
            const isCTW = product.setName === 'Ceremonial Targaryen Warlord';
            
            // Season gear check (season > 0 but not CTW)
            const isSeasonGear = product.season > 0 && !isCTW;

            // Include logic
            if (isBasic) return true;
            if (isCTW && includeCTW) return true;
            if (isSeasonGear && includeSeasonGear && seasonGearLevels.includes(level)) return true;

            return false;
        }).map(product => ({
            name: product.name,
            level: product.level,
            materials: product.materials,
            materialCount: Object.keys(product.materials).length,
            totalCost: Object.values(product.materials).reduce((a, b) => a + b, 0),
            setName: product.setName || 'Standard',
            season: product.season || 0,
            img: product.img
        }));
    }

    // ========================================
    // MATERIAL BALANCING ALGORITHM
    // ========================================

    /**
     * Calculate the RMSE (Root Mean Square Error) of remaining materials
     * Lower is better - means more balanced
     */
    function calculateRMSE(remaining) {
        const values = Object.values(remaining);
        if (values.length === 0) return 0;
        
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(variance);
    }

    /**
     * Calculate the range (max - min) of remaining materials
     */
    function calculateRange(remaining) {
        const values = Object.values(remaining);
        if (values.length === 0) return 0;
        return Math.max(...values) - Math.min(...values);
    }

    /**
     * Try to craft a piece and return the new material state
     * Returns null if not enough materials
     */
    function tryCraftPiece(piece, materials) {
        const newMaterials = { ...materials };
        
        for (const [matId, cost] of Object.entries(piece.materials)) {
            if (!newMaterials[matId] || newMaterials[matId] < cost) {
                return null; // Not enough of this material
            }
            newMaterials[matId] -= cost;
        }
        
        return newMaterials;
    }
    
    /**
     * Check if a piece can be crafted with current materials (without modifying)
     */
    function canCraftPiece(piece, materials) {
        for (const [matId, cost] of Object.entries(piece.materials)) {
            if (!materials[matId] || materials[matId] < cost) {
                return false;
            }
        }
        return true;
    }

    /**
     * Score a potential craft based on how much it improves balance
     * Higher score = better choice
     */
    function scoreCraft(piece, materials) {
        const newMaterials = tryCraftPiece(piece, materials);
        if (!newMaterials) return -Infinity;
        
        const currentRMSE = calculateRMSE(materials);
        const newRMSE = calculateRMSE(newMaterials);
        
        // Score is how much we improve RMSE (positive = improvement)
        // Also factor in using materials that we have more of
        let excessScore = 0;
        const mean = Object.values(materials).reduce((a, b) => a + b, 0) / Object.values(materials).length;
        
        for (const matId of Object.keys(piece.materials)) {
            if (materials[matId] > mean) {
                excessScore += (materials[matId] - mean) / mean;
            }
        }
        
        return (currentRMSE - newRMSE) + excessScore * 0.1;
    }

    /**
     * Main balancing algorithm - greedy approach
     * Selects pieces one at a time, always choosing the one that best improves balance
     */
    function balanceMaterials(inputMaterials, targetCount, levels, options = {}) {
        const {
            usagePercent = 0.6,  // Use 60% of materials by default
            includeCTW = true,   // Include Ceremonial Targaryen Warlord pieces
            includeSeasonGear = false, // Include seasonal gear
            seasonGearLevels = [20, 25, 30, 35, 40, 45], // Levels at which season gear is allowed
            maxIterations = 100000  // Safety limit
        } = options;

        console.log(`%c[TemplatePlanner] balanceMaterials called with usagePercent: ${(usagePercent * 100).toFixed(0)}%`, 'color: yellow; font-weight: bold');
        console.log('[TemplatePlanner] Details:', {
            materialCount: Object.keys(inputMaterials).length,
            targetCount,
            levels,
            usagePercent
        });

        // Normalize material IDs (convert short codes to full IDs)
        const materials = {};
        for (const [key, value] of Object.entries(inputMaterials)) {
            const matId = MATERIAL_CODES[key.toUpperCase()] || key.toLowerCase().replace(/\s+/g, '-');
            materials[matId] = value;
        }

        console.log('[TemplatePlanner] Normalized materials:', materials);

        // Calculate target materials to use
        const targetToUse = {};
        for (const [matId, amount] of Object.entries(materials)) {
            targetToUse[matId] = Math.floor(amount * usagePercent);
        }

        // Get available pieces with filtering options
        const pieces = getAvailablePieces(levels, {
            includeCTW,
            includeSeasonGear,
            seasonGearLevels
        });
        
        console.log('[TemplatePlanner] Available pieces:', pieces.length);
        console.log('[TemplatePlanner] Pieces by level:', {
            L1: pieces.filter(p => p.level === 1).length,
            L5: pieces.filter(p => p.level === 5).length,
            L10: pieces.filter(p => p.level === 10).length
        });
        if (pieces.length > 0) {
            console.log('[TemplatePlanner] Sample L1 piece:', pieces.find(p => p.level === 1));
        }

        if (pieces.length === 0) {
            console.error('[TemplatePlanner] No pieces available!');
            return {
                success: false,
                error: 'No pieces available for selected levels',
                craftingPlan: [],
                remaining: materials,
                stats: {}
            };
        }

        // Working copy of materials
        let remaining = { ...materials };
        const pieceCounts = {};
        let totalCrafted = 0;
        let iterations = 0;
        
        // Calculate total materials and target to use
        const totalOriginal = Object.values(materials).reduce((a, b) => a + b, 0);
        const targetMatsToUse = Math.floor(totalOriginal * usagePercent);
        
        // Estimate pieces we can craft (average ~60 materials per piece)
        const AVG_MATS_PER_PIECE = 60;
        const estimatedPieces = Math.ceil(targetMatsToUse / AVG_MATS_PER_PIECE);
        
        // Use batch mode for large quantities (> 1000 pieces)
        const useBatchMode = estimatedPieces > 1000;
        // For batch mode: craft larger batches to finish faster
        // batchSize = estimated pieces / 100 iterations target
        const batchSize = useBatchMode ? Math.max(1000, Math.floor(estimatedPieces / 50)) : 1;
        
        // Adjust maxIterations based on estimated pieces
        const effectiveMaxIterations = useBatchMode 
            ? Math.max(maxIterations, Math.ceil(estimatedPieces / batchSize) + 100)
            : maxIterations;
        
        console.log(`%c[TemplatePlanner] Mode: ${useBatchMode ? 'BATCH' : 'SINGLE'}, batchSize: ${batchSize}, estimated pieces: ${estimatedPieces}, maxIter: ${effectiveMaxIterations}`, 'color: cyan');

        // Greedy loop - craft until we hit usage target or can't improve
        while (iterations < effectiveMaxIterations) {
            iterations++;
            
            // Score all possible crafts
            let bestPiece = null;
            let bestScore = -Infinity;

            for (const piece of pieces) {
                const score = scoreCraft(piece, remaining);
                if (score > bestScore && canCraftPiece(piece, remaining)) {
                    bestScore = score;
                    bestPiece = piece;
                }
            }

            // If no valid craft found, we're done
            if (!bestPiece) {
                console.log(`%c[TemplatePlanner] STOPPING: No valid craft found | crafted: ${totalCrafted}`, 'color: red; font-weight: bold');
                break;
            }
            
            // Calculate how many of this piece we can craft in this batch
            let craftCount = 1;
            if (useBatchMode) {
                // Find the maximum we can craft of this piece
                let maxCraftable = Infinity;
                for (const [matId, cost] of Object.entries(bestPiece.materials)) {
                    if (remaining[matId] !== undefined && cost > 0) {
                        maxCraftable = Math.min(maxCraftable, Math.floor(remaining[matId] / cost));
                    }
                }
                // Limit to batch size (don't use targetCount as it might be Infinity)
                craftCount = Math.min(batchSize, maxCraftable);
                craftCount = Math.max(1, craftCount);
            }

            // Check if crafting this batch would exceed usage target
            const totalRemaining = Object.values(remaining).reduce((a, b) => a + b, 0);
            const percentUsed = 1 - (totalRemaining / totalOriginal);
            
            if (percentUsed >= usagePercent) {
                console.log(`%c[TemplatePlanner] STOPPING at target: used ${(percentUsed * 100).toFixed(1)}% >= target ${(usagePercent * 100).toFixed(1)}% | crafted: ${totalCrafted}`, 'color: orange; font-weight: bold');
                break;
            }

            // Execute the craft (batch)
            for (const [matId, cost] of Object.entries(bestPiece.materials)) {
                if (remaining[matId] !== undefined) {
                    remaining[matId] -= cost * craftCount;
                }
            }
            totalCrafted += craftCount;
            
            // Track piece counts
            const pieceKey = `${bestPiece.name}|${bestPiece.level}`;
            pieceCounts[pieceKey] = (pieceCounts[pieceKey] || 0) + craftCount;
        }

        // Log final result
        const finalRemaining = Object.values(remaining).reduce((a, b) => a + b, 0);
        const totalOriginalFinal = Object.values(materials).reduce((a, b) => a + b, 0);
        const finalPercentUsed = 1 - (finalRemaining / totalOriginalFinal);
        console.log(`%c[TemplatePlanner] FINISHED: crafted ${totalCrafted} pieces, used ${(finalPercentUsed * 100).toFixed(1)}% of materials (target: ${(usagePercent * 100).toFixed(0)}%)`, 'color: lime; font-weight: bold');

        // Build the crafting plan grouped by level
        const planByLevel = {};
        for (const [key, count] of Object.entries(pieceCounts)) {
            const [name, level] = key.split('|');
            const piece = pieces.find(p => p.name === name && p.level === parseInt(level));
            
            if (!planByLevel[level]) {
                planByLevel[level] = [];
            }
            planByLevel[level].push({
                name,
                count,
                level: parseInt(level),
                materials: piece?.materials || {},
                img: piece?.img
            });
        }

        // Sort each level's pieces by count (descending)
        for (const level of Object.keys(planByLevel)) {
            planByLevel[level].sort((a, b) => b.count - a.count);
        }

        // Calculate usage stats
        const used = {};
        for (const matId of Object.keys(materials)) {
            used[matId] = materials[matId] - remaining[matId];
        }

        return {
            success: true,
            craftingPlan: planByLevel,
            totalCrafted,
            remaining,
            used,
            starting: materials,
            stats: {
                rmse: Math.round(calculateRMSE(remaining)),
                range: Math.round(calculateRange(remaining)),
                minRemaining: Math.min(...Object.values(remaining)),
                maxRemaining: Math.max(...Object.values(remaining)),
                iterations
            }
        };
    }

    // ========================================
    // CASCADE CALCULATOR
    // ========================================

    /**
     * Calculate how many templates survive through the cascade
     * Starting from a given level with a given count
     */
    /**
     * Calculate cascade projection from a starting level/count to target level
     * @param {number} startLevel - Starting level (e.g., 10)
     * @param {number} startCount - Number of templates at start level
     * @param {number} targetLevel - Target level to cascade to (default 45)
     * @param {Object} qualitySettings - Quality settings per level (e.g., { 15: 'exquisite', 20: 'epic' })
     * @returns {Array} - Array of { level, count, legendary, fromCombining, failed }
     */
    function calculateCascade(startLevel, startCount, targetLevel = 45, qualitySettings = {}) {
        const levels = [10, 15, 20, 25, 30, 35, 40, 45];
        const results = [];
        
        let currentCount = startCount;
        let currentLevel = startLevel;
        
        // Add starting point
        results.push({
            level: currentLevel,
            count: currentCount,
            legendary: currentCount,
            epic: 0,
            exquisite: 0
        });

        // Cascade through each level
        for (const nextLevel of levels) {
            if (nextLevel <= currentLevel) continue;
            if (nextLevel > targetLevel) break;

            // Get quality for the SOURCE level (where we're transitioning FROM)
            // The survival rate is determined by the quality of templates we're upgrading
            const sourceQuality = qualitySettings[currentLevel] || DEFAULT_QUALITIES[currentLevel] || 'legendary';
            
            // Get quality for the DESTINATION level (for display purposes)
            const destQuality = qualitySettings[nextLevel] || DEFAULT_QUALITIES[nextLevel] || 'exquisite';
            
            // Use SOURCE level's quality to determine survival rate
            const survivalRate = EFFECTIVE_SURVIVAL_RATES[sourceQuality] || 0.43;
            
            // Calculate outputs based on source quality's survival rate
            const legendary = Math.floor(currentCount * survivalRate);
            const failed = currentCount - legendary;
            
            // For legendary quality, there's no combining needed (100% success)
            // For other qualities, combining bonus is already factored into EFFECTIVE_SURVIVAL_RATES
            const fromCombining = sourceQuality === 'legendary' ? 0 : Math.floor(failed / 16);
            
            currentCount = legendary + fromCombining;
            currentLevel = nextLevel;
            
            results.push({
                level: nextLevel,
                count: currentCount,
                legendary: legendary,
                fromCombining: fromCombining,
                failed: failed,
                quality: destQuality,
                sourceQuality: sourceQuality,
                survivalRate: survivalRate
            });
        }

        return results;
    }

    /**
     * Reverse cascade - calculate how many templates needed at start level
     * to achieve a target count at end level
     */
    /**
     * Reverse cascade - calculate how many templates needed at start level
     * to achieve a target count at end level
     * @param {number} targetLevel - Target level to achieve
     * @param {number} targetCount - Desired count at target level
     * @param {number} startLevel - Starting level (default 10)
     * @param {Object} qualitySettings - Quality settings per level
     * @returns {Array} - Array of { level, count, needed }
     */
    function reverseCascade(targetLevel, targetCount, startLevel = 10, qualitySettings = {}) {
        const levels = [10, 15, 20, 25, 30, 35, 40, 45];
        
        // Work backwards
        let neededAtLevel = targetCount;
        const results = [];
        
        // Start from target and work back
        results.unshift({
            level: targetLevel,
            count: targetCount,
            needed: targetCount
        });

        for (let i = levels.length - 1; i >= 0; i--) {
            const level = levels[i];
            if (level >= targetLevel) continue;
            if (level < startLevel) break;

            const nextLevel = levels[i + 1];
            
            // Get quality for the SOURCE level (where we're transitioning FROM)
            // The survival rate is determined by the quality of templates we're upgrading
            const sourceQuality = qualitySettings[level] || DEFAULT_QUALITIES[level] || 'legendary';
            
            // Use SOURCE level's quality to determine survival rate
            const effectiveRate = EFFECTIVE_SURVIVAL_RATES[sourceQuality] || 0.43;
            
            neededAtLevel = Math.ceil(neededAtLevel / effectiveRate);
            
            results.unshift({
                level: level,
                count: neededAtLevel,
                needed: neededAtLevel,
                quality: sourceQuality
            });
        }

        return results;
    }

    // ========================================
    // FULL PLANNING WORKFLOW
    // ========================================

    /**
     * Generate a complete template plan from materials
     * 
     * @param {Object} materials - Input materials (can use short codes or full IDs)
     * @param {Object} options - Planning options
     * @returns {Object} Complete plan with crafting instructions and cascade
     */
    function generateTemplatePlan(materials, options = {}) {
        const {
            usagePercent = 0.6,
            startLevels = [5, 10],
            targetTemplates = null,  // If null, calculate max possible
            targetLevel = 45,
            includeCTW = true,
            includeSeasonGear = false,
            seasonGearLevels = [20, 25, 30, 35, 40, 45]
        } = options;

        console.log('[TemplatePlanner] generateTemplatePlan called with:', {
            materials,
            options,
            materialCount: Object.keys(materials).length
        });

        // First, do material balancing for early levels
        // Use Infinity so only usagePercent limits the crafting
        const balanceResult = balanceMaterials(materials, targetTemplates || Infinity, startLevels, {
            usagePercent,
            includeCTW,
            includeSeasonGear,
            seasonGearLevels
        });
        
        console.log('[TemplatePlanner] balanceResult:', {
            success: balanceResult.success,
            error: balanceResult.error,
            totalCrafted: balanceResult.totalCrafted,
            craftingPlan: balanceResult.craftingPlan
        });

        if (!balanceResult.success) {
            return balanceResult;
        }

        // Calculate templates at L10 (combining L5 and L10 crafts)
        let l10Templates = 0;
        for (const level of Object.keys(balanceResult.craftingPlan)) {
            const levelPieces = balanceResult.craftingPlan[level];
            for (const piece of levelPieces) {
                if (parseInt(level) === 10) {
                    l10Templates += piece.count;
                } else if (parseInt(level) === 5) {
                    // L5 pieces need to be upgraded to L10 first
                    l10Templates += piece.count;
                }
            }
        }

        // Calculate cascade from L10 to target
        const cascade = calculateCascade(10, l10Templates, targetLevel);

        // Also calculate reverse (how many L10 needed for various targets)
        const reverseTargets = [1, 5, 10, 20, 50].map(target => ({
            target,
            cascade: reverseCascade(targetLevel, target, 10)
        }));

        return {
            success: true,
            balancing: balanceResult,
            cascade,
            reverseTargets,
            summary: {
                startingTemplates: l10Templates,
                finalTemplates: cascade[cascade.length - 1]?.count || 0,
                finalLevel: targetLevel,
                materialsUsed: balanceResult.used,
                materialsRemaining: balanceResult.remaining,
                rmse: balanceResult.stats.rmse,
                range: balanceResult.stats.range
            }
        };
    }

    // ========================================
    // FORMATTING HELPERS
    // ========================================

    /**
     * Format a number with commas
     */
    function formatNumber(num) {
        return num.toLocaleString();
    }

    /**
     * Format material ID to display name
     */
    function formatMaterialName(matId) {
        return matId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Get short code for material ID
     */
    function getMaterialCode(matId) {
        return MATERIAL_IDS_TO_CODES[matId] || matId.substring(0, 2).toUpperCase();
    }

    /**
     * Format the crafting plan as text (similar to Discord bot output)
     */
    function formatPlanAsText(plan) {
        if (!plan.success) {
            return `Error: ${plan.error}`;
        }

        const lines = [];
        
        // Crafting plan by level
        for (const [level, pieces] of Object.entries(plan.balancing.craftingPlan).sort((a, b) => a[0] - b[0])) {
            lines.push(`Level ${level}:`);
            for (const piece of pieces) {
                lines.push(`  ⤷ ${piece.count.toString().padStart(5)} | ${piece.name}`);
            }
        }

        lines.push('');
        lines.push('-'.repeat(50));
        lines.push('Material |  Remaining  |  Starting   |    Used    ');
        lines.push('-'.repeat(50));

        // Material summary
        for (const [matId, starting] of Object.entries(plan.balancing.starting)) {
            const code = getMaterialCode(matId);
            const remaining = plan.balancing.remaining[matId] || 0;
            const used = starting - remaining;
            lines.push(
                `${code.padEnd(8)} | ${formatNumber(remaining).padStart(11)} | ${formatNumber(starting).padStart(11)} | ${formatNumber(used).padStart(10)}`
            );
        }

        lines.push('-'.repeat(50));
        lines.push(`Min Remaining : ${formatNumber(plan.balancing.stats.minRemaining).padStart(11)}`);
        lines.push(`Max Remaining : ${formatNumber(plan.balancing.stats.maxRemaining).padStart(11)}`);
        lines.push(`Range         : ${formatNumber(plan.balancing.stats.range).padStart(11)}`);
        lines.push(`RMSE Score    : ${formatNumber(plan.balancing.stats.rmse).padStart(11)}`);
        lines.push(`Temp Count    : ${formatNumber(plan.balancing.totalCrafted).padStart(11)}`);

        // Cascade summary
        lines.push('');
        lines.push('='.repeat(50));
        lines.push('CASCADE PROJECTION (L10 → L45)');
        lines.push('='.repeat(50));
        
        for (const stage of plan.cascade) {
            lines.push(`L${stage.level.toString().padStart(2)}: ${formatNumber(stage.count).padStart(6)} legendary templates`);
        }

        return lines.join('\n');
    }

    // ========================================
    // PUBLIC API
    // ========================================

    window.TemplatePlanner = {
        // Core functions
        balanceMaterials,
        calculateCascade,
        reverseCascade,
        generateTemplatePlan,
        
        // Template estimation (lighter simulation)
        estimateStartingTemplates,
        estimateMaterialUsage,
        detectBottleneckMaterial,
        
        // Utilities
        getAvailablePieces,
        calculateRMSE,
        calculateRange,
        formatPlanAsText,
        formatNumber,
        formatMaterialName,
        getMaterialCode,
        
        // Constants
        MATERIAL_CODES,
        MATERIAL_IDS_TO_CODES,
        CASCADE_SURVIVAL_RATES,
        LEVEL_COSTS,
        LEVEL_AVG_BASE_COSTS,
        QUALITY_MULTIPLIERS,
        DEFAULT_QUALITIES,
        EFFECTIVE_SURVIVAL_RATES
    };

    console.log('TemplatePlanner loaded successfully');

})();

