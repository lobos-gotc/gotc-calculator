/**
 * Dragon March Size Calculator Module
 * 
 * Simplified helper module for dragon-specific march size calculations.
 * Dragon UI elements are now integrated into the main calculator HTML.
 * This module provides backwards compatibility and helper functions.
 */

const DragonMarchSizeModule = (function() {
    'use strict';

    // Module state
    let isInitialized = false;

    // ============================================
    // INITIALIZATION
    // ============================================

    /**
     * Initialize the dragon module
     * Since dragon elements are now in the main HTML, this is minimal
     */
    function init() {
        if (isInitialized) {
            console.log('Dragon Module already initialized');
            return;
        }

        isInitialized = true;
        console.log('Dragon March Size Module initialized (integrated mode)');
    }

    /**
     * Check if module is active/initialized
     */
    function isActive() {
        return isInitialized;
    }

    // ============================================
    // CALCULATION HELPERS
    // ============================================

    /**
     * Calculate total dragon march size from all integrated elements
     * This aggregates values from the HTML elements integrated into main calculator
     */
    function calculateDragonMS() {
        const result = {
            vsSoP: 0,
            vsNPC: 0,
            armories: 0,
            research: 0,
            gear: 0,
            heroes: 0,
            shrine: 0
        };

        // Dragon Armories
        const dragonArmoryInputs = document.querySelectorAll('[data-armory-type="dragon"] input[data-armory]');
        dragonArmoryInputs.forEach(input => {
            const level = parseInt(input.value) || 0;
            if (level > 0 && typeof MARCH_SIZE_DATA !== 'undefined') {
                const armoryKey = input.dataset.armory;
                const armoryData = MARCH_SIZE_DATA.armories?.dragon?.[armoryKey];
                if (armoryData?.maxMS) {
                    const maxLevel = armoryData.maxLevel || 126;
                    const marchSize = Math.round((level / maxLevel) * armoryData.maxMS);
                    result.armories += marchSize;
                }
            }
        });

        // Dragon Research
        const dragonResearchInputs = {
            'msDragonMarchSizeNpc1': 20,
            'msDragonMarchSizeNpc2': 20,
            'msDragonMarchSize1': 200,
            'msDragonMarchSize2': 210
        };
        
        Object.entries(dragonResearchInputs).forEach(([id, perLevel]) => {
            const input = document.getElementById(id);
            if (input) {
                const level = parseInt(input.value) || 0;
                result.research += level * perLevel;
            }
        });

        // Dragon Gear (saddle, chanfron, peytral)
        if (typeof GEAR_DATABASE !== 'undefined' && GEAR_DATABASE.dragon_gear) {
            const dragonSlots = ['saddle', 'chanfron', 'peytral'];
            dragonSlots.forEach(slot => {
                const select = document.getElementById(`msGearSelect-${slot}`);
                const levelSelect = document.getElementById(`msGearLevelSelect-${slot}`);
                const qualitySelect = document.getElementById(`msGearQuality-${slot}`);
                
                if (select && select.value) {
                    const setId = select.value;
                    const level = parseInt(levelSelect?.value) || 40;
                    const quality = qualitySelect?.value || 'legendary';
                    const levelKey = `L${level}`;
                    
                    const setData = GEAR_DATABASE.dragon_gear[setId];
                    if (setData?.slots?.[slot]?.stats?.dragonmaxmarchsize) {
                        const levelData = setData.slots[slot].stats.dragonmaxmarchsize[levelKey];
                        if (levelData && levelData[quality] !== undefined) {
                            result.gear += Math.round(levelData[quality]);
                        }
                    }
                }
            });
        }

        // Dragon Hero Hall
        const dragonHeroInput = document.getElementById('msDragonHeroLevel');
        if (dragonHeroInput) {
            const level = parseInt(dragonHeroInput.value) || 0;
            result.heroes = Math.min(level * 100, 2000);
        }

        // Shrine
        const shrineInput = document.getElementById('msShrineLevel');
        if (shrineInput && typeof MARCH_SIZE_DATA !== 'undefined') {
            const level = parseInt(shrineInput.value) || 0;
            const shrineData = MARCH_SIZE_DATA.buildings?.shrine;
            if (shrineData) {
                const maxLevel = shrineData.maxLevel || 40;
                const maxMS = shrineData.maxMS || 1000;
                result.shrine = Math.round((level / maxLevel) * maxMS);
            }
        }

        // Aggregate totals
        result.vsSoP = result.armories + result.research + result.gear + result.heroes + result.shrine;
        
        return result;
    }

    // ============================================
    // STATE MANAGEMENT
    // ============================================

    /**
     * Gather current dragon state from integrated elements
     */
    function gatherState() {
        const state = {
            armories: {},
            research: {},
            gear: {},
            heroes: { level: 0 },
            shrine: { level: 0 }
        };

        // Armories
        const dragonArmoryInputs = document.querySelectorAll('[data-armory-type="dragon"] input[data-armory]');
        dragonArmoryInputs.forEach(input => {
            const key = input.dataset.armory;
            state.armories[key] = parseInt(input.value) || 0;
        });

        // Research
        ['msDragonMarchSizeNpc1', 'msDragonMarchSizeNpc2', 'msDragonMarchSize1', 'msDragonMarchSize2'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                state.research[id] = parseInt(input.value) || 0;
            }
        });

        // Gear
        ['saddle', 'chanfron', 'peytral'].forEach(slot => {
            const select = document.getElementById(`msGearSelect-${slot}`);
            const levelSelect = document.getElementById(`msGearLevelSelect-${slot}`);
            const qualitySelect = document.getElementById(`msGearQuality-${slot}`);
            
            state.gear[slot] = {
                name: select?.value || '',
                level: parseInt(levelSelect?.value) || 40,
                quality: qualitySelect?.value || 'legendary'
            };
        });

        // Heroes
        const heroInput = document.getElementById('msDragonHeroLevel');
        state.heroes.level = parseInt(heroInput?.value) || 0;

        // Shrine
        const shrineInput = document.getElementById('msShrineLevel');
        state.shrine.level = parseInt(shrineInput?.value) || 0;

        return state;
    }

    /**
     * Apply saved state to dragon elements
     */
    function applyState(state) {
        if (!state) return;

        // Armories
        if (state.armories) {
            Object.entries(state.armories).forEach(([key, level]) => {
                const input = document.querySelector(`[data-armory-type="dragon"] input[data-armory="${key}"]`);
                if (input) input.value = level;
            });
        }

        // Research
        if (state.research) {
            Object.entries(state.research).forEach(([id, level]) => {
                const input = document.getElementById(id);
                if (input) input.value = level;
            });
        }

        // Gear
        if (state.gear) {
            Object.entries(state.gear).forEach(([slot, data]) => {
                const select = document.getElementById(`msGearSelect-${slot}`);
                const levelSelect = document.getElementById(`msGearLevelSelect-${slot}`);
                const qualitySelect = document.getElementById(`msGearQuality-${slot}`);
                
                if (select) select.value = data.name || '';
                if (levelSelect) levelSelect.value = data.level || 40;
                if (qualitySelect) qualitySelect.value = data.quality || 'legendary';
            });
        }

        // Heroes
        if (state.heroes) {
            const heroInput = document.getElementById('msDragonHeroLevel');
            if (heroInput) heroInput.value = state.heroes.level || 0;
        }

        // Shrine
        if (state.shrine) {
            const shrineInput = document.getElementById('msShrineLevel');
            if (shrineInput) shrineInput.value = state.shrine.level || 0;
        }
    }

    /**
     * Reset all dragon elements to default values
     */
    function reset() {
        // Armories
        const dragonArmoryInputs = document.querySelectorAll('[data-armory-type="dragon"] input[data-armory]');
        dragonArmoryInputs.forEach(input => {
            input.value = '0';
        });

        // Research
        ['msDragonMarchSizeNpc1', 'msDragonMarchSizeNpc2', 'msDragonMarchSize1', 'msDragonMarchSize2'].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '0';
        });

        // Gear
        ['saddle', 'chanfron', 'peytral'].forEach(slot => {
            const select = document.getElementById(`msGearSelect-${slot}`);
            const levelSelect = document.getElementById(`msGearLevelSelect-${slot}`);
            const qualitySelect = document.getElementById(`msGearQuality-${slot}`);
            const bonusEl = document.getElementById(`msGearBonus-${slot}`);
            
            if (select) select.value = '';
            if (levelSelect) levelSelect.value = '40';
            if (qualitySelect) qualitySelect.value = 'legendary';
            if (bonusEl) bonusEl.textContent = '+0';
        });

        // Heroes
        const heroInput = document.getElementById('msDragonHeroLevel');
        const heroDisplay = document.getElementById('msDragonHeroLevelDisplay');
        const heroBonus = document.getElementById('msDragonHeroBonus');
        if (heroInput) heroInput.value = '0';
        if (heroDisplay) heroDisplay.textContent = 'Lv 0 | (0 / 2,000)';
        if (heroBonus) heroBonus.textContent = '+0';

        // Shrine
        const shrineInput = document.getElementById('msShrineLevel');
        const shrineDisplay = document.getElementById('msShrineLevelDisplay');
        if (shrineInput) shrineInput.value = '0';
        if (shrineDisplay) shrineDisplay.textContent = 'Lv 0';
    }

    // ============================================
    // PUBLIC API
    // ============================================

    return {
        init,
        isActive,
        calculateDragonMS,
        gatherState,
        applyState,
        reset
    };
})();
