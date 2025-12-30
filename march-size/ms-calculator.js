/**
 * March Size Calculator
 * 
 * Handles all calculation logic and UI interactions for the March Size Calculator feature.
 */

(function() {
    'use strict';

    // State
    let currentScenario = 'ms-vs-sop';
    let currentStep = 1;
    const totalSteps = 3;

    // DOM Elements (cached on init)
    let elements = {};

    // ============================================
    // INITIALIZATION
    // ============================================

    function init() {
        // Wait for data to be available
        if (typeof MARCH_SIZE_DATA === 'undefined') {
            console.error('March Size Data not loaded');
            return;
        }

        cacheElements();
        setupEventListeners();
        populateGearSlots();
        setupGearEventListeners(); // Ensure gear listeners are set up
        populateHeroes();
        updateNavigationState();
        
        // Set recommended defaults
        setRecommendedDefaults();
        
        // Initialize armory display values
        initializeArmoryDisplays();
        
        // Initialize all section totals
        updateAllSectionTotals();

        console.log('March Size Calculator initialized');
    }
    
    // Set recommended default values for all inputs
    function setRecommendedDefaults() {
        // Recommended armory levels
        const armoryDefaults = {
            standard: 196,  // Recommended for standard armories
            trinket: 105,   // Recommended for trinket armories
            dragon: 126     // Recommended for dragon armories
        };
        
        // Recommended hero selections with levels
        const heroDefaults = {
            hand: { id: 'cristoncole', level: 50 },
            war: { id: 'leaf', level: 40 },
            coin: { id: 'euron', level: 30 },
            law: { id: 'waif', level: 30 },
            ships: { id: 'jaqen', level: 40 },
            commander: { id: 'aemond', level: 30 },
            maester: { id: 'viserys', level: 30 }
        };
        
        // Research max levels (default to max)
        const researchDefaults = {
            command: 3,        // Command I max level
            command2: 5,       // Command II max level
            command3: 7,       // Command III max level
            armyExpertise: 4,  // Army Expertise max level
            armyExpertise2: 4, // Army Expertise II max level
            sopMarchSize: 5,   // SoP March Size max level
            sopMarchSize2: 5,  // SoP March Size II max level
            troopSurge1: 5,    // Troop Surge I max level
            troopSurge2: 5,    // Troop Surge II max level
            troopSurge3: 5     // Troop Surge III max level
        };
        
        // Enhancement max levels (default to max)
        const enhancementDefaults = {
            greatHall: 25,           // Great Hall max level
            watchtower: 20,          // Watchtower max level
            keepEnhancement: 40      // Keep Enhancement max level (for 8% bonus)
        };
        
        // Building defaults (max levels)
        const buildingDefaults = {
            keep: 40,           // Keep max level
            trainingYard: 40    // Training Yard max level
        };
        
        // Set building defaults
        if (elements.keepLevel) {
            elements.keepLevel.value = buildingDefaults.keep;
            updateBuildingSliderDisplay('msKeepLevel', 'msKeepLevelDisplay', 'keep');
        }
        if (elements.trainingYardLevel) {
            elements.trainingYardLevel.value = buildingDefaults.trainingYard;
            updateBuildingSliderDisplay('msTrainingYardLevel', 'msTrainingYardLevelDisplay', 'trainingYard');
        }
        
        // Set enhancement defaults
        if (elements.greatHallLevel) {
            elements.greatHallLevel.value = enhancementDefaults.greatHall;
            updateBuildingSliderDisplay('msGreatHallLevel', 'msGreatHallLevelDisplay', 'greatHall');
        }
        if (elements.watchtowerLevel) {
            elements.watchtowerLevel.value = enhancementDefaults.watchtower;
            updateBuildingSliderDisplay('msWatchtowerLevel', 'msWatchtowerLevelDisplay', 'watchtower');
        }
        if (elements.keepEnhancementLevel) {
            elements.keepEnhancementLevel.value = enhancementDefaults.keepEnhancement;
            updateBuildingSliderDisplay('msKeepEnhancementLevel', 'msKeepEnhancementLevelDisplay', 'keepEnhancement');
        }
        
        // Set research defaults (all to max)
        Object.entries(researchDefaults).forEach(([key, maxLevel]) => {
            const slider = elements.researchSliders[key];
            if (slider) {
                slider.value = maxLevel;
                updateResearchSliderDisplay(key);
            }
        });
        
        // Set armory defaults
        if (elements.armoryInputs) {
            elements.armoryInputs.forEach(input => {
                const armoryId = input.dataset.armory;
                let category = 'standard';
                
                if (MARCH_SIZE_DATA.armories.trinket[armoryId]) {
                    category = 'trinket';
                } else if (MARCH_SIZE_DATA.armories.dragon[armoryId]) {
                    category = 'dragon';
                }
                
                input.value = armoryDefaults[category];
            });
        }
        
        // Set hero defaults
        Object.entries(heroDefaults).forEach(([position, defaults]) => {
            const select = document.getElementById(`msHeroSelect-${position}`);
            const slider = document.getElementById(`msHeroLevel-${position}`);
            const imgElement = document.getElementById(`msHeroImg-${position}`);
            const slotElement = document.querySelector(`.ms-hero-slot[data-position="${position}"]`);
            
            if (select && defaults.id) {
                select.value = defaults.id;
                
                // Update image and styling
                const hero = MARCH_SIZE_DATA.heroes.heroList[defaults.id];
                if (hero && imgElement) {
                    imgElement.src = `resources/${hero.img}`;
                    imgElement.classList.add('has-hero');
                    
                    // Update quality styling
                    if (slotElement) {
                        slotElement.classList.add('hero-selected');
                        slotElement.classList.remove('hero-exquisite', 'hero-legendary');
                        if (hero.quality === 'legendary') {
                            slotElement.classList.add('hero-legendary');
                        } else if (hero.quality === 'exquisite') {
                            slotElement.classList.add('hero-exquisite');
                        }
                    }
                    
                    // Set slider max based on hero and enable it
                    if (slider) {
                        slider.disabled = false; // Enable the slider
                        slider.max = hero.maxLevel || 60;
                        slider.value = defaults.level;
                    }
                }
            }
            
            // Update hero level display
            updateHeroLevelDisplay(position);
        });
        
        // Set marching hero default (level 60)
        if (elements.marchingHeroLevel) {
            elements.marchingHeroLevel.value = 60;
            updateMarchingHeroDisplay();
        }
        
        // Set hall of heroes default (level 21)
        if (elements.hallLevel) {
            elements.hallLevel.value = 21;
            updateHallLevelDisplay();
        }
        
        // Update hero bonus display
        updateHeroBonusDisplay();
        
        // Set recommended gear defaults for maximum march size
        const gearDefaults = {
            helmet: 'Queen Mother Vestments',
            chest: 'Queen Mother Vestments',
            pants: 'Queen Mother Vestments',
            weapon: 'Queen Mother Vestments',
            ring: 'Queen Mother Vestments',
            boots: 'Queen Mother Vestments',
            trinket: 'KG White Cloak',
            dragonTrinket: 'KG White Cloak'
        };
        
        // Set gear defaults after a short delay to ensure dropdowns are populated
        setTimeout(() => {
            Object.entries(gearDefaults).forEach(([slot, gearName]) => {
                const select = document.getElementById(`msGearSelect-${slot}`);
                const qualitySelect = document.getElementById(`msGearQuality-${slot}`);
                const levelSelect = document.getElementById(`msGearLevelSelect-${slot}`);
                
                if (select) {
                    // Find and select the gear option
                    for (let i = 0; i < select.options.length; i++) {
                        if (select.options[i].value === gearName) {
                            select.selectedIndex = i;
                            break;
                        }
                    }
                    
                    // Get the gear data for image update
                    const gearData = MARCH_SIZE_DATA.gear[slot] && MARCH_SIZE_DATA.gear[slot][gearName];
                    if (gearData && gearData.img) {
                        updateGearImage(slot, gearData.img);
                    }
                }
                
                // Set to legendary quality and level 45
                if (qualitySelect) {
                    qualitySelect.value = 'legendary';
                    updateGearSlotQuality(slot, 'legendary');
                }
                if (levelSelect) {
                    levelSelect.value = '45';
                }
                
                // Update dropdown stats display
                updateGearDropdownStats(slot);
                
                // Update gear bonus display
                updateGearBonusDisplay(slot);
            });
            
            // Recalculate march size after gear is set
            calculateMarchSize();
        }, 100);
    }
    
    // Initialize armory slider displays with march size values
    function initializeArmoryDisplays() {
        if (elements.armoryInputs) {
            elements.armoryInputs.forEach(input => {
                updateArmorySliderDisplay(input);
            });
        }
    }

    function cacheElements() {
        elements = {
            // Mode selector
            modeButtons: document.querySelectorAll('.calc-mode-btn'),
            templateSection: document.getElementById('templateCalculator'),
            marchSizeSection: document.getElementById('marchSizeCalculator'),
            
            // Progress
            progressSteps: document.querySelectorAll('.ms-progress .wizard-progress__step'),
            
            // Wizard steps
            steps: {
                scenario: document.getElementById('ms-step-scenario'),
                input: document.getElementById('ms-step-input'),
                results: document.getElementById('ms-step-results')
            },
            
            // Scenario cards
            scenarioCards: document.querySelectorAll('.ms-scenario-card'),
            
            // Modifiers
            keepEnhancementLevel: document.getElementById('msKeepEnhancementLevel'),
            
            // Gear grid
            gearGrid: document.getElementById('msGearGrid'),
            
            // Buildings
            keepLevel: document.getElementById('msKeepLevel'),
            trainingYardLevel: document.getElementById('msTrainingYardLevel'),
            greatHallLevel: document.getElementById('msGreatHallLevel'),
            watchtowerLevel: document.getElementById('msWatchtowerLevel'),
            
            // Armories - Individual armory inputs
            armoryInputs: document.querySelectorAll('[data-armory]'),
            
            // Research sliders
            researchSliders: {
                // Military I
                command: document.getElementById('msCommand'),
                command2: document.getElementById('msCommand2'),
                command3: document.getElementById('msCommand3'),
                // Military II
                armyExpertise: document.getElementById('msArmyExpertise'),
                armyExpertise2: document.getElementById('msArmyExpertise2'),
                sopMarchSize: document.getElementById('msSop'),
                sopMarchSize2: document.getElementById('msSop2'),
                // Advanced Military
                troopSurge1: document.getElementById('msTroopSurge1'),
                troopSurge2: document.getElementById('msTroopSurge2'),
                troopSurge3: document.getElementById('msTroopSurge3')
            },
            // Research value displays
            researchValues: {
                command: document.getElementById('msCommandValue'),
                command2: document.getElementById('msCommand2Value'),
                command3: document.getElementById('msCommand3Value'),
                armyExpertise: document.getElementById('msArmyExpertiseValue'),
                armyExpertise2: document.getElementById('msArmyExpertise2Value'),
                sopMarchSize: document.getElementById('msSopValue'),
                sopMarchSize2: document.getElementById('msSop2Value'),
                troopSurge1: document.getElementById('msTroopSurge1Value'),
                troopSurge2: document.getElementById('msTroopSurge2Value'),
                troopSurge3: document.getElementById('msTroopSurge3Value')
            },
            
            // Heroes grid
            heroesGrid: document.getElementById('msHeroesGrid'),
            
            
            // Marching Hero
            marchingHeroLevel: document.getElementById('msMarchingHeroLevel'),
            
            // Hall of Heroes
            hallLevel: document.getElementById('msHallLevel'),
            
            // Manual total
            manualTotal: document.getElementById('msManualTotal'),
            
            // Results
            totalValue: document.getElementById('msTotalValue'),
            baseValue: document.getElementById('msBaseValue'),
            gearValue: document.getElementById('msGearValue'),
            bonusValue: document.getElementById('msBonusValue'),
            recommendationScenario: document.getElementById('msRecommendationScenario'),
            recommendationsGrid: document.getElementById('msRecommendationsGrid'),
            breakdownChart: document.getElementById('msBreakdownChart'),
            
            // Navigation
            prevBtn: document.getElementById('msPrev'),
            nextBtn: document.getElementById('msNext'),
            calculateBtn: document.getElementById('msCalculate'),
            newCalcBtn: document.getElementById('msNewCalc')
        };
    }

    function setupEventListeners() {
        // Calculator mode switching
        elements.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => switchCalculatorMode(btn.dataset.mode));
        });

        // Scenario selection
        elements.scenarioCards.forEach(card => {
            card.addEventListener('click', () => selectScenario(card.dataset.scenario));
        });

        // Accordion toggles for MS sections
        const msAccordions = document.querySelectorAll('#marchSizeCalculator .accordion-toggle');
        msAccordions.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const targetId = toggle.getAttribute('data-target');
                const content = document.getElementById(targetId);
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                
                toggle.setAttribute('aria-expanded', !isExpanded);
                // Use flex for armories content, grid for others
                const displayType = content.classList.contains('ms-armories-content') ? 'flex' : 'grid';
                content.style.display = isExpanded ? 'none' : displayType;
            });
        });

        // Navigation buttons
        if (elements.prevBtn) {
            elements.prevBtn.addEventListener('click', () => goToStep(currentStep - 1));
        }
        if (elements.nextBtn) {
            elements.nextBtn.addEventListener('click', () => goToStep(currentStep + 1));
        }
        if (elements.calculateBtn) {
            elements.calculateBtn.addEventListener('click', calculateMarchSize);
        }
        if (elements.newCalcBtn) {
            elements.newCalcBtn.addEventListener('click', resetCalculator);
        }

        // Progress step clicks
        elements.progressSteps.forEach(step => {
            step.addEventListener('click', () => {
                const stepNum = parseInt(step.dataset.step);
                if (stepNum <= currentStep || stepNum === currentStep + 1) {
                    goToStep(stepNum);
                }
            });
        });
        
        // Add listeners for inputs that affect base march size (for hero bonus calculations)
        setupBaseMarchSizeListeners();
        
        // Title selection listener
        const titleSelect = document.getElementById('msTitleSelect');
        if (titleSelect) {
            titleSelect.addEventListener('change', updateTitleDisplay);
        }
    }
    
    function updateTitleDisplay() {
        const titleSelect = document.getElementById('msTitleSelect');
        const titleBonusValue = document.getElementById('msTitleBonus')?.querySelector('.ms-title-bonus__value');
        
        if (!titleSelect || !titleBonusValue) return;
        
        const titleKey = titleSelect.value;
        const titleData = MARCH_SIZE_DATA.sopTitles[titleKey] || { marchSize: 0 };
        
        titleBonusValue.textContent = `+${formatNumber(titleData.marchSize)}`;
    }
    
    function setupBaseMarchSizeListeners() {
        // Buildings - sliders
        if (elements.keepLevel) {
            elements.keepLevel.addEventListener('input', () => {
                updateBuildingSliderDisplay('msKeepLevel', 'msKeepLevelDisplay', 'keep');
                updateHeroBonusDisplay();
                updateAllSectionTotals();
            });
        }
        if (elements.trainingYardLevel) {
            elements.trainingYardLevel.addEventListener('input', () => {
                updateBuildingSliderDisplay('msTrainingYardLevel', 'msTrainingYardLevelDisplay', 'trainingYard');
                updateHeroBonusDisplay();
                updateAllSectionTotals();
            });
        }
        if (elements.greatHallLevel) {
            elements.greatHallLevel.addEventListener('input', () => {
                updateBuildingSliderDisplay('msGreatHallLevel', 'msGreatHallLevelDisplay', 'greatHall');
                updateHeroBonusDisplay();
                updateAllSectionTotals();
            });
        }
        if (elements.watchtowerLevel) {
            elements.watchtowerLevel.addEventListener('input', () => {
                updateBuildingSliderDisplay('msWatchtowerLevel', 'msWatchtowerLevelDisplay', 'watchtower');
                updateHeroBonusDisplay();
                updateAllSectionTotals();
            });
        }
        if (elements.keepEnhancementLevel) {
            elements.keepEnhancementLevel.addEventListener('input', () => {
                updateBuildingSliderDisplay('msKeepEnhancementLevel', 'msKeepEnhancementLevelDisplay', 'keepEnhancement');
                updateHeroBonusDisplay();
                updateAllSectionTotals();
            });
        }
        
        // Armories - sliders
        elements.armoryInputs.forEach(input => {
            input.addEventListener('input', () => {
                updateArmorySliderDisplay(input);
                updateHeroBonusDisplay();
                updateAllSectionTotals();
            });
        });
        
        // Research sliders
        Object.entries(elements.researchSliders).forEach(([key, slider]) => {
            if (slider) {
                slider.addEventListener('input', () => {
                    updateResearchSliderDisplay(key);
                    updateHeroBonusDisplay();
                    updateAllSectionTotals();
                });
            }
        });
        
        // Marching Hero level slider
        if (elements.marchingHeroLevel) {
            elements.marchingHeroLevel.addEventListener('input', () => {
                updateMarchingHeroDisplay();
                updateAllSectionTotals();
            });
        }
        
        // Hall of Heroes level slider
        if (elements.hallLevel) {
            elements.hallLevel.addEventListener('input', () => {
                updateHallLevelDisplay();
                updateAllSectionTotals();
            });
        }
        
        // Manual total input
        if (elements.manualTotal) {
            elements.manualTotal.addEventListener('input', updateHeroBonusDisplay);
        }
    }

    // ============================================
    // CALCULATOR MODE SWITCHING
    // ============================================

    function switchCalculatorMode(mode) {
        elements.modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Toggle history button visibility (only for template calculator)
        const historyTrigger = document.querySelector('.history-trigger');
        if (historyTrigger) {
            historyTrigger.style.display = mode === 'template' ? 'block' : 'none';
        }

        if (mode === 'template') {
            elements.templateSection.style.display = 'block';
            elements.templateSection.classList.add('active');
            elements.marchSizeSection.style.display = 'none';
            elements.marchSizeSection.classList.remove('active');
        } else {
            elements.templateSection.style.display = 'none';
            elements.templateSection.classList.remove('active');
            elements.marchSizeSection.style.display = 'block';
            elements.marchSizeSection.classList.add('active');
            
            // Ensure we start at step 1 when switching to march size mode
            goToStep(1);
        }
    }

    // ============================================
    // SCENARIO SELECTION
    // ============================================

    function selectScenario(scenario) {
        currentScenario = scenario;
        elements.scenarioCards.forEach(card => {
            card.classList.toggle('active', card.dataset.scenario === scenario);
        });
        
        // Refresh gear dropdowns based on new scenario
        const filter = SCENARIO_TO_GEAR_FILTER[scenario] || 'sop';
        populateGearSlots(filter);
    }

    // ============================================
    // WIZARD NAVIGATION
    // ============================================

    function goToStep(step) {
        if (step < 1 || step > totalSteps) return;
        
        // Note: If going to results via Calculate button, calculateMarchSize() handles it
        // Don't call calculateMarchSize here to avoid infinite loop

        currentStep = step;
        
        // Update step visibility
        Object.values(elements.steps).forEach((stepEl, index) => {
            if (stepEl) {
                stepEl.classList.toggle('active', index + 1 === step);
            }
        });

        // Update progress indicators
        elements.progressSteps.forEach((progressStep, index) => {
            const stepNum = index + 1;
            progressStep.classList.toggle('active', stepNum === step);
            progressStep.classList.toggle('completed', stepNum < step);
        });

        updateNavigationState();
    }

    function updateNavigationState() {
        // Previous button
        if (elements.prevBtn) {
            elements.prevBtn.disabled = currentStep === 1;
            elements.prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
        }

        // Next button
        if (elements.nextBtn) {
            const showNext = currentStep < totalSteps - 1;
            elements.nextBtn.style.display = showNext ? 'flex' : 'none';
        }

        // Calculate button
        if (elements.calculateBtn) {
            elements.calculateBtn.style.display = currentStep === 2 ? 'flex' : 'none';
        }

        // New Calculation button
        if (elements.newCalcBtn) {
            elements.newCalcBtn.style.display = currentStep === 3 ? 'flex' : 'none';
        }
    }

    // ============================================
    // GEAR SET MAPPINGS
    // ============================================

    // Default placeholder images
    const DEFAULT_IMAGES = {
        helmet: 'resources/item/gear_slot_helmet.png',
        chest: 'resources/item/gear_slot_chest.png',
        pants: 'resources/item/gear_slot_pants.png',
        boots: 'resources/item/gear_slot_boots.png',
        ring: 'resources/item/gear_slot_ring.png',
        weapon: 'resources/item/gear_slot_weapon.png',
        trinket: 'resources/item/gear_slot_trinket.png',
        dragonTrinket: 'resources/item/gear_slot_trinket.png'
    };

    // Map scenario IDs to gear scenario filters
    const SCENARIO_TO_GEAR_FILTER = {
        'ms-vs-sop': 'sop',
        'ms-vs-keep': 'keep',
        'dragon-vs-sop': 'sop',
        'dragon-vs-keep': 'keep',
        'ms-reinforce': 'reinforce',
        'dragon-reinforce': 'reinforce'
    };

    // Map scenario IDs to display names
    const SCENARIO_DISPLAY_NAMES = {
        'ms-vs-sop': 'March Size vs Seat of Power',
        'ms-vs-keep': 'March Size vs Keep',
        'dragon-vs-sop': 'Dragon March vs Seat of Power',
        'dragon-vs-keep': 'Dragon March vs Keep',
        'ms-reinforce': 'March Size Reinforcement',
        'dragon-reinforce': 'Dragon Reinforcement'
    };

    // Get gear options for a specific slot filtered by current scenario
    function getGearOptionsForSlot(slot, scenarioFilter) {
        const slotData = MARCH_SIZE_DATA.gear[slot];
        if (!slotData) return [];

        const options = [];
        for (const [name, data] of Object.entries(slotData)) {
            // Filter by scenario if specified
            if (scenarioFilter && data.scenarios && !data.scenarios.includes(scenarioFilter)) {
                continue;
            }
            options.push({
                name: name,
                set: data.set,
                img: data.img,
                season: data.season,
                stats: data.stats
            });
        }

        // Sort by season (newer first), then by march size stats
        options.sort((a, b) => {
            // First by season
            if ((b.season || 0) !== (a.season || 0)) {
                return (b.season || 0) - (a.season || 0);
            }
            // Then by total march size value
            const aMS = (a.stats?.legendary?.marchSize || 0) + (a.stats?.legendary?.marchSizePct || 0) * 10000;
            const bMS = (b.stats?.legendary?.marchSize || 0) + (b.stats?.legendary?.marchSizePct || 0) * 10000;
            return bMS - aMS;
        });

        return options;
    }

    // ============================================
    // POPULATE UI
    // ============================================

    function populateGearSlots(scenarioFilter = null) {
        const slots = ['helmet', 'chest', 'pants', 'dragonTrinket', 'boots', 'ring', 'weapon', 'trinket'];
        const filter = scenarioFilter || SCENARIO_TO_GEAR_FILTER[currentScenario] || 'sop';

        slots.forEach(slot => {
            const select = document.getElementById(`msGearSelect-${slot}`);
            if (!select) return;

            // Store current selection if any
            const currentValue = select.value;

            // Clear existing options
            select.innerHTML = '<option value="">-- None --</option>';

            // Get gear options for this slot
            const gearOptions = getGearOptionsForSlot(slot, filter);

            if (gearOptions.length === 0) {
                const option = document.createElement('option');
                option.disabled = true;
                option.textContent = 'No MS gear available';
                select.appendChild(option);
                return;
            }

            // Get current level and quality for stat calculation
            const levelSelect = document.getElementById(`msGearLevelSelect-${slot}`);
            const qualitySelect = document.getElementById(`msGearQuality-${slot}`);
            const level = parseInt(levelSelect?.value) || 40;
            const quality = qualitySelect?.value || 'legendary';

            // Add gear options (already sorted)
            gearOptions.forEach(gear => {
                const option = document.createElement('option');
                option.value = gear.name; // Use name as value
                option.dataset.img = gear.img;
                option.dataset.set = gear.set;
                option.dataset.baseMs = gear.stats?.legendary?.marchSize || 0;
                option.dataset.basePct = gear.stats?.legendary?.marchSizePct || 0;
                
                // Calculate adjusted stats based on level and quality
                const statText = getGearStatText(gear.stats?.legendary, level, quality);
                option.textContent = `${gear.name}${statText}`;
                select.appendChild(option);
            });

            // Restore selection if it still exists
            if (currentValue) {
                const optionExists = Array.from(select.options).some(o => o.value === currentValue);
                if (optionExists) {
                    select.value = currentValue;
                    // Update image for restored selection
                    const selectedOption = select.options[select.selectedIndex];
                    if (selectedOption?.dataset?.img) {
                        updateGearImage(slot, selectedOption.dataset.img);
                        updateGearSlotQuality(slot, quality);
                    }
                }
            }
        });

        // Setup event listeners (only once on init)
        setupGearEventListeners();
    }

    // Calculate stat text for dropdown display
    function getGearStatText(baseStats, level, quality) {
        if (!baseStats) return '';
        
        const levelMult = { 35: 0.85, 40: 1.0, 45: 1.15, 50: 1.30 }[level] || 1.0;
        const qualityMult = { poor: 0.2, common: 0.4, fine: 0.6, exquisite: 0.8, epic: 0.9, legendary: 1.0 }[quality] || 1.0;
        const totalMult = levelMult * qualityMult;
        
        if (baseStats.marchSize) {
            const adjustedMS = Math.floor(baseStats.marchSize * totalMult);
            return ` ${(adjustedMS / 1000).toFixed(1)}K`;
        } else if (baseStats.marchSizePct) {
            const adjustedPct = baseStats.marchSizePct * totalMult;
            return ` ${adjustedPct.toFixed(2)}%`;
        }
        return '';
    }

    // Update dropdown text when level or quality changes
    function updateGearDropdownStats(slot) {
        const select = document.getElementById(`msGearSelect-${slot}`);
        const levelSelect = document.getElementById(`msGearLevelSelect-${slot}`);
        const qualitySelect = document.getElementById(`msGearQuality-${slot}`);
        
        if (!select) return;
        
        const level = parseInt(levelSelect?.value) || 40;
        const quality = qualitySelect?.value || 'legendary';
        
        // Update each option's display text
        Array.from(select.options).forEach(option => {
            if (!option.value) return; // Skip "-- None --"
            
            const baseMs = parseFloat(option.dataset.baseMs) || 0;
            const basePct = parseFloat(option.dataset.basePct) || 0;
            const gearName = option.value;
            
            const statText = getGearStatText({ marchSize: baseMs, marchSizePct: basePct }, level, quality);
            option.textContent = `${gearName}${statText}`;
        });
    }

    function setupGearEventListeners() {
        const slots = ['helmet', 'chest', 'pants', 'dragonTrinket', 'boots', 'ring', 'weapon', 'trinket'];
        
        slots.forEach(slot => {
            const select = document.getElementById(`msGearSelect-${slot}`);
            const qualitySelect = document.getElementById(`msGearQuality-${slot}`);
            const levelSelect = document.getElementById(`msGearLevelSelect-${slot}`);
            
            if (!select) return;
            
            // Only add listeners once
            if (select._listenersAdded) return;

            // Add change listener to update image
            select.addEventListener('change', (e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                const imgPath = selectedOption?.dataset?.img || '';
                
                console.log('Gear selected:', e.target.value, 'Image:', imgPath);
                
                if (imgPath) {
                    updateGearImage(slot, imgPath);
                } else {
                    updateGearImage(slot, '');
                }
                
                // Update quality styling when gear is selected
                if (qualitySelect && e.target.value) {
                    updateGearSlotQuality(slot, qualitySelect.value);
                } else {
                    updateGearSlotQuality(slot, '');
                }
                
                // Update gear bonus display
                updateGearBonusDisplay(slot);
                
                // Update hero bonus display
                updateHeroBonusDisplay();
            });

            // Add quality change listener
            if (qualitySelect && !qualitySelect._listenersAdded) {
                qualitySelect.addEventListener('change', () => {
                    updateGearDropdownStats(slot);
                    if (select.value) {
                        updateGearSlotQuality(slot, qualitySelect.value);
                    }
                    // Update gear bonus display
                    updateGearBonusDisplay(slot);
                    // Update hero bonus display
                    updateHeroBonusDisplay();
                });
                qualitySelect._listenersAdded = true;
            }

            // Add level change listener
            if (levelSelect && !levelSelect._listenersAdded) {
                levelSelect.addEventListener('change', () => {
                    updateGearDropdownStats(slot);
                    // Update gear bonus display
                    updateGearBonusDisplay(slot);
                    // Update hero bonus display
                    updateHeroBonusDisplay();
                });
                levelSelect._listenersAdded = true;
            }

            select._listenersAdded = true;
        });
    }

    function updateGearSlotQuality(slot, quality) {
        const slotElement = document.querySelector(`.ms-gear-slot-visual[data-slot="${slot}"]`);
        if (slotElement) {
            if (quality) {
                slotElement.dataset.quality = quality;
            } else {
                delete slotElement.dataset.quality;
            }
        }
    }

    // Update bonus display for a single gear slot
    function updateGearBonusDisplay(slot) {
        const select = document.getElementById(`msGearSelect-${slot}`);
        const qualitySelect = document.getElementById(`msGearQuality-${slot}`);
        const levelSelect = document.getElementById(`msGearLevelSelect-${slot}`);
        const bonusEl = document.getElementById(`msGearBonus-${slot}`);
        
        if (!bonusEl) return;
        
        if (!select || !select.value) {
            bonusEl.textContent = '+0';
            return;
        }
        
        const selectedOption = select.options[select.selectedIndex];
        const quality = qualitySelect?.value || 'legendary';
        const level = parseInt(levelSelect?.value) || 40;
        
        // Level multipliers
        const levelMultipliers = { 35: 0.85, 40: 1.0, 45: 1.15, 50: 1.30 };
        // Quality multipliers
        const qualityMultipliers = { poor: 0.2, common: 0.4, fine: 0.6, exquisite: 0.8, epic: 0.9, legendary: 1.0 };
        
        // Get base stats from option dataset (already stored during populate)
        const baseMs = parseFloat(selectedOption?.dataset?.baseMs) || 0;
        const basePct = parseFloat(selectedOption?.dataset?.basePct) || 0;
        
        console.log(`[updateGearBonusDisplay] Slot: ${slot}, Gear: ${select.value}, baseMs: ${baseMs}, basePct: ${basePct}, dataset:`, selectedOption?.dataset);
        
        const levelMult = levelMultipliers[level] || 1.0;
        const qualityMult = qualityMultipliers[quality] || 1.0;
        
        // Handle percentage march size first (takes priority)
        const pctMS = basePct * levelMult * qualityMult;
        
        // Handle flat march size
        const flatMS = Math.floor(baseMs * levelMult * qualityMult);
        
        console.log(`[updateGearBonusDisplay] pctMS: ${pctMS}, flatMS: ${flatMS}`);
        
        if (pctMS > 0) {
            bonusEl.textContent = `+${pctMS.toFixed(2)}%`;
        } else if (flatMS > 0) {
            bonusEl.textContent = `+${formatNumber(flatMS)}`;
        } else {
            bonusEl.textContent = '+0';
        }
    }

    function updateGearImage(slot, imgPath) {
        const imgElement = document.getElementById(`msGearImg-${slot}`);
        
        if (imgElement) {
            if (imgPath && imgPath.length > 0) {
                // Add resources/ prefix if not already present
                const fullPath = imgPath.startsWith('resources/') ? imgPath : `resources/${imgPath}`;
                console.log(`Setting ${slot} image to:`, fullPath);
                imgElement.src = fullPath;
                imgElement.classList.add('has-gear');
                
                // Handle image load error
                imgElement.onerror = function() {
                    console.warn(`Failed to load image: ${fullPath}, using default`);
                    this.src = DEFAULT_IMAGES[slot] || DEFAULT_IMAGES.helmet;
                };
            } else {
                imgElement.src = DEFAULT_IMAGES[slot] || DEFAULT_IMAGES.helmet;
                imgElement.classList.remove('has-gear');
            }
        }
    }

    function populateHeroes() {
        // Populate hero dropdowns for each position
        const positions = ['hand', 'war', 'coin', 'whispers', 'law', 'ships', 'commander', 'maester'];
        const heroList = MARCH_SIZE_DATA.heroes.heroList;

        positions.forEach(position => {
            const select = document.getElementById(`msHeroSelect-${position}`);
            if (!select) return;

            // Clear existing options except "None"
            select.innerHTML = '<option value="">-- None --</option>';

            // Find heroes that can be assigned to this position
            for (const [heroId, heroData] of Object.entries(heroList)) {
                if (heroData.positions.includes(position)) {
                    const option = document.createElement('option');
                    option.value = heroId;
                    option.dataset.img = heroData.img;
                    
                    // Display name with title (if available) as subtitle
                    let displayText = heroData.name;
                    if (heroData.title) {
                        displayText += ` - ${heroData.title}`;
                    }
                    option.textContent = displayText;
                    select.appendChild(option);
                }
            }

            // Add change event listener
            select.addEventListener('change', (e) => {
                const heroId = e.target.value;
                const imgElement = document.getElementById(`msHeroImg-${position}`);
                const slotElement = document.querySelector(`.ms-hero-slot[data-position="${position}"]`);
                const slider = document.getElementById(`msHeroLevel-${position}`);
                const levelDisplay = document.getElementById(`msHeroLevelDisplay-${position}`);
                // Get the default position icon from data attribute
                const defaultIcon = imgElement?.dataset.default || `heroes/icon-${position}.png`;
                
                // Remove previous quality classes
                if (slotElement) {
                    slotElement.classList.remove('hero-selected', 'hero-exquisite', 'hero-legendary');
                }
                
                if (heroId && heroList[heroId]) {
                    const heroData = heroList[heroId];
                    if (imgElement) {
                        // Use the actual hero portrait image
                        imgElement.src = 'resources/' + heroData.img;
                        imgElement.classList.add('has-hero');
                        // Fallback to position icon if image fails to load
                        imgElement.onerror = function() {
                            this.src = defaultIcon;
                        };
                    }
                    if (slotElement) {
                        slotElement.classList.add('hero-selected');
                        // Add quality class for styling
                        if (heroData.quality === 'exquisite') {
                            slotElement.classList.add('hero-exquisite');
                        } else if (heroData.quality === 'legendary') {
                            slotElement.classList.add('hero-legendary');
                        }
                    }
                    // Enable slider and set max level based on hero quality
                    if (slider) {
                        slider.disabled = false;
                        slider.max = heroData.maxLevel || 60;
                        slider.value = slider.max; // Set to max by default
                    }
                } else {
                    if (imgElement) {
                        // Reset to position icon
                        imgElement.src = defaultIcon;
                        imgElement.classList.remove('has-hero');
                    }
                    // Disable slider and reset
                    if (slider) {
                        slider.disabled = true;
                        slider.value = 0;
                        slider.max = 60;
                    }
                    if (levelDisplay) {
                        levelDisplay.textContent = 'Lv 0';
                    }
                }
                
                // Update hero bonus display
                updateHeroBonusDisplay();
                updateHeroLevelDisplay(position);
                updateAllSectionTotals();
            });
            
            // Add level slider event listener
            const slider = document.getElementById(`msHeroLevel-${position}`);
            if (slider) {
                slider.addEventListener('input', () => {
                    updateHeroLevelDisplay(position);
                    updateHeroBonusDisplay();
                    updateAllSectionTotals();
                });
            }
        });
    }
    
    // Update hero level display with council march size bonus
    // Format: Lv X | (current / max) | (Unlocks lvY) or (Maxed)
    function updateHeroLevelDisplay(position) {
        const slider = document.getElementById(`msHeroLevel-${position}`);
        const display = document.getElementById(`msHeroLevelDisplay-${position}`);
        const select = document.getElementById(`msHeroSelect-${position}`);
        
        if (slider && display) {
            const level = parseInt(slider.value) || 0;
            const maxLevel = parseInt(slider.max) || 60;
            const heroId = select?.value;
            
            if (heroId && MARCH_SIZE_DATA.heroes.heroList[heroId]) {
                const hero = MARCH_SIZE_DATA.heroes.heroList[heroId];
                
                // Get council march size bonus (only show this, not capacity)
                if (hero.councilMarchSize) {
                    const bonus = hero.councilMarchSize;
                    const unlockLevel = bonus.unlockLevel;
                    const maxValue = bonus.value;
                    const isUnlocked = level >= unlockLevel;
                    const isMaxed = level >= maxLevel;
                    
                    // Current value is 0 before unlock, full value after
                    const currentValue = isUnlocked ? maxValue : 0;
                    
                    // Format the bonus display based on type
                    let bonusStr;
                    if (bonus.type === 'pct') {
                        bonusStr = `${currentValue.toFixed(2)}% / ${maxValue.toFixed(2)}%`;
                    } else {
                        bonusStr = `${currentValue.toLocaleString()} / ${maxValue.toLocaleString()}`;
                    }
                    
                    // Format unlock status
                    let statusStr;
                    if (isMaxed && isUnlocked) {
                        statusStr = '(Maxed)';
                    } else if (isUnlocked) {
                        statusStr = '(Active)';
                    } else {
                        statusStr = `(Unlocks Lv${unlockLevel})`;
                    }
                    
                    display.textContent = `Lv ${level} | (${bonusStr}) | ${statusStr}`;
                } else {
                    // Hero has no council march size bonus
                    display.textContent = `Lv ${level} | (No march size bonus)`;
                }
            } else {
                display.textContent = `Lv ${level}`;
            }
        }
    }

    // ============================================
    // HERO BONUS DISPLAY
    // ============================================

    function updateHeroBonusDisplay() {
        // Calculate base march size (without hero bonuses) to use for percentage calculations
        const baseMS = calculateBaseMarshSize();
        
        const heroList = MARCH_SIZE_DATA.heroes.heroList;
        const positions = ['hand', 'war', 'coin', 'whispers', 'law', 'ships', 'commander', 'maester'];
        
        let totalHeroBonus = 0;
        
        positions.forEach(position => {
            const select = document.getElementById(`msHeroSelect-${position}`);
            const slider = document.getElementById(`msHeroLevel-${position}`);
            const bonusElement = document.getElementById(`msHeroBonus-${position}`);
            
            if (!select || !slider || !bonusElement) return;
            
            const heroId = select.value;
            const level = parseInt(slider.value) || 0;
            
            if (heroId && heroList[heroId] && level > 0 && baseMS > 0) {
                const heroData = heroList[heroId];
                const marchSizePct = heroData.marchSizePct;
                
                // Find applicable level (closest lower or equal)
                const levels = Object.keys(marchSizePct).map(Number).sort((a, b) => a - b);
                let pct = 0;
                
                for (const lvl of levels) {
                    if (lvl <= level) {
                        pct = marchSizePct[lvl];
                    } else {
                        break;
                    }
                }
                
                // Calculate absolute bonus from base march size
                const absoluteBonus = Math.floor(baseMS * (pct / 100));
                totalHeroBonus += absoluteBonus;
                
                // Display bonus
                bonusElement.textContent = `+${absoluteBonus.toLocaleString()} troops`;
            } else {
                bonusElement.textContent = '';
            }
        });
        
        // Update aggregate display
        const aggregateElement = document.getElementById('msHeroesTotal');
        if (aggregateElement) {
            aggregateElement.textContent = `+${totalHeroBonus.toLocaleString()} troops`;
        }
    }
    
    function calculateBaseMarshSize() {
        // Calculate base march size without hero bonuses
        let base = 0;
        
        // Manual total override
        const manualTotal = parseInt(elements.manualTotal?.value) || 0;
        if (manualTotal > 0) {
            return manualTotal;
        }
        
        // Buildings (Training Yard, Keep)
        const buildingMS = calculateBuildingMS();
        base += buildingMS.total;
        
        // Armories
        const armoryMS = calculateArmoryMS();
        base += armoryMS.flat;
        
        // Research
        const researchMS = calculateResearchMS();
        base += researchMS.flat;
        
        // Gear (flat only, not percentage)
        const gearMS = calculateGearMS();
        base += gearMS.flat;
        
        return base;
    }

    // ============================================
    // CALCULATION ENGINE
    // ============================================

    function calculateMarchSize() {
        const results = {
            base: 0,
            gear: 0,
            bonus: 0,
            bonusPct: 0,
            breakdown: {}
        };

        // Check for manual total override
        const manualTotal = parseInt(elements.manualTotal?.value) || 0;
        if (manualTotal > 0) {
            results.base = manualTotal;
        } else {
            // Calculate from buildings
            results.breakdown.buildings = calculateBuildingMS();
            results.base += results.breakdown.buildings.total;

            // Calculate from armories
            results.breakdown.armories = calculateArmoryMS();
            results.base += results.breakdown.armories.total;

            // Calculate from research
            results.breakdown.research = calculateResearchMS();
            results.base += results.breakdown.research.flat;
            results.bonusPct += results.breakdown.research.pct;

            // Calculate from heroes (flat capacity + position bonus %)
            results.breakdown.heroes = calculateHeroMS();
            results.base += results.breakdown.heroes.flat;
            results.bonusPct += results.breakdown.heroes.pct;
        }

        // Calculate from gear
        results.breakdown.gear = calculateGearMS();
        results.gear = results.breakdown.gear.flat;
        results.bonusPct += results.breakdown.gear.pct;

        // Calculate from SoP Title
        results.breakdown.title = calculateTitleMS();
        results.gear += results.breakdown.title.flat;

        // Quick modifiers (Keep Enhancement)
        const keepEnhLevel = parseInt(elements.keepEnhancementLevel?.value) || 0;
        if (keepEnhLevel >= 40) {
            results.bonusPct += 8.0;
        }

        // Calculate bonus amount from percentage
        const baseForBonus = results.base + results.gear;
        results.bonus = Math.floor(baseForBonus * (results.bonusPct / 100));

        // Total
        results.total = results.base + results.gear + results.bonus;

        // Display results
        displayResults(results);
        
        // Go to results step
        goToStep(3);
    }

    function calculateBuildingMS() {
        const result = { total: 0, items: [], enhancements: [] };
        
        // === BUILDINGS ===
        // Keep (34-40)
        const keepLevel = parseInt(elements.keepLevel?.value) || 0;
        if (keepLevel >= 34) {
            const keepData = getBuildingMarchSize('keep', keepLevel);
            result.total += keepData.marchSize;
            result.items.push({ name: 'Keep', level: keepLevel, value: keepData.marchSize });
        }

        // Training Yard (34-40)
        const trainingLevel = parseInt(elements.trainingYardLevel?.value) || 0;
        if (trainingLevel >= 34) {
            const data = getBuildingMarchSize('trainingYard', trainingLevel);
            result.total += data.marchSize;
            result.items.push({ name: 'Training Yard', level: trainingLevel, value: data.marchSize });
        }

        // === ENHANCEMENTS ===
        // Great Hall (16-25)
        const hallLevel = parseInt(elements.greatHallLevel?.value) || 0;
        if (hallLevel >= 16) {
            const data = getEnhancementMarchSize('greatHall', hallLevel);
            result.total += data.marchSize;
            result.enhancements.push({ name: 'Great Hall', level: hallLevel, value: data.marchSize });
        }

        // Watchtower (11-20)
        const towerLevel = parseInt(elements.watchtowerLevel?.value) || 0;
        if (towerLevel >= 11) {
            const data = getEnhancementMarchSize('watchtower', towerLevel);
            result.total += data.marchSize;
            result.enhancements.push({ name: 'Watchtower', level: towerLevel, value: data.marchSize });
        }

        return result;
    }

    function calculateArmoryMS() {
        const result = { total: 0, items: [] };

        // Loop through all armory inputs
        if (elements.armoryInputs) {
            elements.armoryInputs.forEach(input => {
                const level = parseInt(input.value) || 0;
                if (level > 0) {
                    const armoryId = input.dataset.armory;
                    const armoryName = input.previousElementSibling?.textContent || armoryId;
                    
                    // Determine armory type based on ID
                    let armoryType = 'standard';
                    if (MARCH_SIZE_DATA.armories.trinket[armoryId]) {
                        armoryType = 'trinket';
                    } else if (MARCH_SIZE_DATA.armories.dragon[armoryId]) {
                        armoryType = 'dragon';
                    }
                    
                    const data = getArmoryMarchSize(armoryType, armoryId, level);
                    if (data.marchSize > 0) {
                        result.total += data.marchSize;
                        result.items.push({ 
                            name: armoryName, 
                            level: level, 
                            value: data.marchSize,
                            type: armoryType
                        });
                    }
                }
            });
        }

        return result;
    }

    function calculateResearchMS() {
        const result = { flat: 0, pct: 0, items: [] };
        const research = MARCH_SIZE_DATA.research;

        // Loop through all research sliders
        Object.entries(elements.researchSliders).forEach(([key, slider]) => {
            if (slider && research[key]) {
                const level = parseInt(slider.value) || 0;
                if (level > 0) {
                    const data = research[key];
                    const marchSize = level * data.perLevel;
                    result.flat += marchSize;
                    result.items.push({ 
                        name: `${data.name} Lv${level}`, 
                        value: marchSize 
                    });
                }
            }
        });

        return result;
    }
    
    // Update research slider display
    function updateResearchSliderDisplay(key) {
        const slider = elements.researchSliders[key];
        const display = elements.researchValues[key];
        const research = MARCH_SIZE_DATA.research[key];
        
        if (slider && display && research) {
            const level = parseInt(slider.value) || 0;
            const currentValue = level * research.perLevel;
            display.textContent = `Lv ${level} | (${currentValue.toLocaleString()} / ${research.maxMarchSize.toLocaleString()})`;
        }
    }
    
    // Marching Hero progression: 1st Signature Skill march size bonus
    // Levels 1-60, max value 8,813 at level 60
    const MARCHING_HERO_PROGRESSION = {
        minLevel: 1,
        maxLevel: 60,
        minMS: 100,
        maxMS: 8813
    };
    
    // Calculate marching hero march size based on level (1st signature skill)
    function getMarchingHeroMS(level) {
        if (level < 1) return 0;
        if (level > 60) level = 60;
        
        // Linear interpolation from minMS to maxMS
        const range = MARCHING_HERO_PROGRESSION.maxLevel - MARCHING_HERO_PROGRESSION.minLevel;
        const msRange = MARCHING_HERO_PROGRESSION.maxMS - MARCHING_HERO_PROGRESSION.minMS;
        const progress = (level - MARCHING_HERO_PROGRESSION.minLevel) / range;
        
        return Math.round(MARCHING_HERO_PROGRESSION.minMS + (msRange * progress));
    }
    
    // Update marching hero display - format: Lv X | (current / max)
    function updateMarchingHeroDisplay() {
        const slider = elements.marchingHeroLevel;
        const display = document.getElementById('msMarchingHeroLevelDisplay');
        
        if (slider && display) {
            const level = parseInt(slider.value) || 1;
            const currentMS = getMarchingHeroMS(level);
            const maxMS = 8813; // Max at level 60
            display.textContent = `Lv ${level} | (${currentMS.toLocaleString()} / ${maxMS.toLocaleString()})`;
        }
    }
    
    // Hall of Heroes (Rising Adventurer) - Single March Size vs. Player
    // Extracted from game screenshots - Ranks 13-21
    const HALL_PROGRESSION = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Ranks 0-12: no bonus
        66,    // Rank 13
        154,   // Rank 14
        242,   // Rank 15
        352,   // Rank 16
        505,   // Rank 17
        703,   // Rank 18
        989,   // Rank 19
        1385,  // Rank 20
        2000   // Rank 21
    ];
    
    // Get Hall of Heroes march size by level
    function getHallMS(level) {
        if (level < 0) return 0;
        if (level >= HALL_PROGRESSION.length) return HALL_PROGRESSION[HALL_PROGRESSION.length - 1];
        return HALL_PROGRESSION[level];
    }
    
    // Update Hall of Heroes display - format: Lv X | (current / max)
    function updateHallLevelDisplay() {
        const slider = elements.hallLevel;
        const display = document.getElementById('msHallLevelDisplay');
        const bonusDisplay = document.getElementById('msRisingAdventurerBonus');
        
        if (slider && display) {
            const level = parseInt(slider.value) || 0;
            const currentMS = getHallMS(level);
            const maxMS = 2000; // Max at rank 21
            
            if (level < 13) {
                display.textContent = `Lv ${level} | (0 / ${maxMS.toLocaleString()}) Unlocks Lv13`;
            } else {
                display.textContent = `Lv ${level} | (${currentMS.toLocaleString()} / ${maxMS.toLocaleString()})`;
            }
            
            // Update the Rising Adventurer card bonus display
            if (bonusDisplay) {
                bonusDisplay.textContent = `+${currentMS.toLocaleString()}`;
            }
        }
    }
    
    // Update building slider display with march size values
    function updateBuildingSliderDisplay(sliderId, displayId, buildingType) {
        const slider = document.getElementById(sliderId);
        const display = document.getElementById(displayId);
        
        if (slider && display) {
            const level = parseInt(slider.value) || 0;
            
            // Get march size for this building/enhancement
            let currentMS = 0;
            let maxMS = 0;
            
            if (buildingType === 'keep') {
                const data = getBuildingMarchSize('keep', level);
                currentMS = data.marchSize || 0;
                maxMS = 41100; // Max keep march size at level 40
            } else if (buildingType === 'trainingYard') {
                const data = getBuildingMarchSize('trainingYard', level);
                currentMS = data.marchSize || 0;
                maxMS = 53500; // Max training yard march size at level 40
            } else if (buildingType === 'greatHall') {
                const data = getEnhancementMarchSize('greatHall', level);
                currentMS = data.marchSize || 0;
                maxMS = 5000; // Max great hall march size at level 25
            } else if (buildingType === 'watchtower') {
                const data = getEnhancementMarchSize('watchtower', level);
                currentMS = data.marchSize || 0;
                maxMS = 2500; // Max watchtower march size at level 20
            } else if (buildingType === 'keepEnhancement') {
                const data = getEnhancementMarchSize('keepEnhancement', level);
                currentMS = data.marchSize || 0;
                maxMS = 50000; // Max keep enhancement march size at level 40
            } else {
                // Fallback for unknown types - just show level
                display.textContent = `Lv ${level}`;
                return;
            }
            
            display.textContent = `Lv ${level} | (${currentMS.toLocaleString()} / ${maxMS.toLocaleString()})`;
        }
    }
    
    // Update armory slider display with march size bonus
    function updateArmorySliderDisplay(input) {
        const displayId = input.id + 'Display';
        const display = document.getElementById(displayId);
        
        if (display) {
            const level = parseInt(input.value) || 0;
            const armoryId = input.dataset.armory;
            
            // Determine armory type from armoryId
            let armoryType = 'standard';
            if (MARCH_SIZE_DATA.armories.trinket[armoryId]) {
                armoryType = 'trinket';
            } else if (MARCH_SIZE_DATA.armories.dragon[armoryId]) {
                armoryType = 'dragon';
            }
            
            // Get values from progression arrays
            const progressions = MARCH_SIZE_DATA.armoryProgressions;
            if (progressions && progressions[armoryType]) {
                const values = progressions[armoryType];
                const currentMS = getArmoryMarchSize(armoryType, armoryId, level);
                const maxMS = values[values.length - 1]; // Last value in array is max
                
                // Display as "Lv X | (currentMS / maxMS)"
                display.textContent = `Lv ${level} | (${currentMS.marchSize.toLocaleString()} / ${maxMS.toLocaleString()})`;
            } else {
                display.textContent = `Lv ${level}`;
            }
        }
    }

    function calculateHeroMS() {
        const result = { flat: 0, pct: 0, items: [] };
        const heroList = MARCH_SIZE_DATA.heroes.heroList;
        const positions = ['hand', 'war', 'coin', 'whispers', 'law', 'ships', 'commander', 'maester'];

        positions.forEach(position => {
            const select = document.getElementById(`msHeroSelect-${position}`);
            const levelInput = document.getElementById(`msHeroLevel-${position}`);
            
            if (!select || !select.value) return;
            
            const heroId = select.value;
            const level = parseInt(levelInput?.value) || 0;
            
            if (heroId && heroList[heroId] && level > 0) {
                const heroData = heroList[heroId];
                
                // Get flat march capacity based on quality
                const capacity = getHeroMarchCapacity(heroData.quality, level);
                result.flat += capacity;
                
                // Get council march size bonus (new structure: { type, unlockLevel, value })
                let pct = 0;
                let flatBonus = 0;
                
                if (heroData.councilMarchSize && level >= heroData.councilMarchSize.unlockLevel) {
                    // New structure: { type: 'pct'|'flat', unlockLevel: N, value: V }
                    if (heroData.councilMarchSize.type === 'pct') {
                        pct = heroData.councilMarchSize.value;
                    } else if (heroData.councilMarchSize.type === 'flat') {
                        flatBonus = heroData.councilMarchSize.value;
                    }
                }
                
                result.flat += flatBonus;
                result.pct += pct;
                result.items.push({ 
                    position, 
                    heroId,
                    heroName: heroData.name,
                    level,
                    quality: heroData.quality,
                    capacity,
                    flatBonus,
                    pct 
                });
            }
        });

        return result;
    }

    function calculateDragonMS() {
        const result = { flat: 0, pct: 0, items: [] };
        const talents = MARCH_SIZE_DATA.dragonTalents;

        // Adolescent Dragon
        const adolescentLevel = parseInt(elements.adolescentDragonLevel?.value) || 0;
        if (adolescentLevel > 0) {
            const levels = Object.keys(talents.adolescent.talents).map(Number).sort((a, b) => a - b);
            let applicableLevel = null;
            for (const lvl of levels) {
                if (lvl <= adolescentLevel) applicableLevel = lvl;
                else break;
            }
            if (applicableLevel) {
                const data = talents.adolescent.talents[applicableLevel];
                result.flat += data.marchSize || 0;
                result.pct += data.marchSizePct || 0;
                result.items.push({ name: 'Adolescent Dragon', level: adolescentLevel, value: data.marchSize });
            }
        }

        // Adult Dragon
        const adultLevel = parseInt(elements.adultDragonLevel?.value) || 0;
        if (adultLevel > 0) {
            const levels = Object.keys(talents.adult.talents).map(Number).sort((a, b) => a - b);
            let applicableLevel = null;
            for (const lvl of levels) {
                if (lvl <= adultLevel) applicableLevel = lvl;
                else break;
            }
            if (applicableLevel) {
                const data = talents.adult.talents[applicableLevel];
                result.flat += data.marchSize || 0;
                result.pct += data.marchSizePct || 0;
                result.items.push({ name: 'Adult Dragon', level: adultLevel, value: data.marchSize, pct: data.marchSizePct });
            }
        }

        return result;
    }

    function calculateGearMS() {
        const result = { flat: 0, pct: 0, items: [] };
        const slots = ['helmet', 'chest', 'pants', 'dragonTrinket', 'boots', 'ring', 'weapon', 'trinket'];

        // Level multipliers (relative to level 40 Gold as base from the reference)
        const levelMultipliers = {
            35: 0.85,
            40: 1.0,
            45: 1.15,
            50: 1.30
        };

        // Quality multipliers (relative to legendary)
        const qualityMultipliers = {
            poor: 0.2,
            common: 0.4,
            fine: 0.6,
            exquisite: 0.8,
            epic: 0.9,
            legendary: 1.0
        };

        slots.forEach(slot => {
            const select = document.getElementById(`msGearSelect-${slot}`);
            const qualitySelect = document.getElementById(`msGearQuality-${slot}`);
            const levelSelect = document.getElementById(`msGearLevelSelect-${slot}`);
            const bonusEl = document.getElementById(`msGearBonus-${slot}`);
            
            if (!select || !select.value) {
                // Update bonus display to show +0 when no gear selected
                if (bonusEl) bonusEl.textContent = '+0';
                return;
            }
            
            const gearName = select.value;
            const quality = qualitySelect?.value || 'legendary';
            const level = parseInt(levelSelect?.value) || 40;
            const selectedOption = select.options[select.selectedIndex];
            const imgPath = selectedOption?.dataset?.img || '';

            // Look up in MARCH_SIZE_DATA
            const slotData = MARCH_SIZE_DATA.gear[slot];
            let gearData = null;
            
            if (slotData && slotData[gearName]) {
                gearData = slotData[gearName];
            }
            
            if (gearData) {
                // Get base stats (legendary at level 40)
                const baseStats = gearData.stats?.legendary || { marchSize: 0, marchSizePct: 0 };
                
                // Apply multipliers
                const levelMult = levelMultipliers[level] || 1.0;
                const qualityMult = qualityMultipliers[quality] || 1.0;
                const totalMult = levelMult * qualityMult;
                
                const adjustedMS = Math.floor((baseStats.marchSize || 0) * totalMult);
                const adjustedPct = (baseStats.marchSizePct || 0) * totalMult;
                
                // Update bonus display
                if (bonusEl) {
                    bonusEl.textContent = `+${formatNumber(adjustedMS)}`;
                }
                
                result.flat += adjustedMS;
                result.pct += adjustedPct;
                result.items.push({
                    slot,
                    name: gearName,
                    set: gearData.set,
                    quality,
                    level,
                    img: imgPath || gearData.img,
                    marchSize: adjustedMS,
                    marchSizePct: adjustedPct
                });
            } else {
                // Gear not found in data, show +0
                if (bonusEl) bonusEl.textContent = '+0';
            }
        });

        return result;
    }

    function calculateTitleMS() {
        const result = { flat: 0, name: 'No Title' };
        
        const titleSelect = document.getElementById('msTitleSelect');
        if (!titleSelect || !titleSelect.value || titleSelect.value === 'none') {
            return result;
        }
        
        const titleData = MARCH_SIZE_DATA.sopTitles[titleSelect.value];
        if (titleData) {
            result.flat = titleData.marchSize;
            result.name = titleData.name;
        }
        
        return result;
    }

    // ============================================
    // DISPLAY RESULTS
    // ============================================

    function displayResults(results) {
        // Update total
        if (elements.totalValue) {
            elements.totalValue.textContent = formatNumber(results.total);
        }

        // Update breakdown
        if (elements.baseValue) {
            elements.baseValue.textContent = formatNumber(results.base);
        }
        if (elements.gearValue) {
            elements.gearValue.textContent = formatNumber(results.gear);
        }
        if (elements.bonusValue) {
            elements.bonusValue.textContent = `+${formatNumber(results.bonus)}`;
        }

        // Update scenario label
        if (elements.recommendationScenario) {
            elements.recommendationScenario.textContent = SCENARIO_DISPLAY_NAMES[currentScenario] || capitalizeFirst(currentScenario);
        }

        // Generate recommendations
        generateRecommendations();

        // Generate breakdown chart
        generateBreakdownChart(results);
    }

    function generateRecommendations() {
        if (!elements.recommendationsGrid) return;

        const slotNames = {
            helmet: 'Helmet',
            chest: 'Chest',
            pants: 'Pants',
            dragonTrinket: 'Dragon Trinket',
            boots: 'Boots',
            ring: 'Ring',
            weapon: 'Weapon',
            trinket: 'Trinket'
        };
        
        const filter = SCENARIO_TO_GEAR_FILTER[currentScenario] || 'sop';
        const leftSlots = ['helmet', 'chest', 'pants', 'dragonTrinket'];
        const rightSlots = ['weapon', 'ring', 'boots', 'trinket'];
        
        function getSlotData(slot) {
            const select = document.getElementById(`msGearSelect-${slot}`);
            const qualitySelect = document.getElementById(`msGearQuality-${slot}`);
            const levelSelect = document.getElementById(`msGearLevelSelect-${slot}`);
            
            if (select && select.value) {
                const selectedOption = select.options[select.selectedIndex];
                const gearData = MARCH_SIZE_DATA.gear[slot]?.[select.value];
                const quality = qualitySelect?.value || 'legendary';
                const level = levelSelect?.value || '40';
                const baseMs = parseFloat(selectedOption?.dataset?.baseMs) || 0;
                const basePct = parseFloat(selectedOption?.dataset?.basePct) || 0;
                
                // Calculate current and max values
                const levelMult = { 35: 0.85, 40: 1.0, 45: 1.15, 50: 1.30 }[parseInt(level)] || 1.0;
                const qualityMult = { poor: 0.2, common: 0.4, fine: 0.6, exquisite: 0.8, epic: 0.9, legendary: 1.0 }[quality] || 1.0;
                const currentMs = Math.floor(baseMs * levelMult * qualityMult);
                const maxMs = Math.floor(baseMs * 1.30);
                const currentPct = basePct * levelMult * qualityMult;
                const maxPct = basePct * 1.30;
                
                return {
                    slot: slotNames[slot],
                    slotKey: slot,
                    name: select.value,
                    img: gearData?.img || selectedOption?.dataset?.img || DEFAULT_IMAGES[slot],
                    quality: quality,
                    level: level,
                    currentMs, maxMs, currentPct, maxPct,
                    stats: gearData?.stats?.legendary,
                    isRecommendation: false
                };
            }
            return null;
        }
        
        function renderSlot(data, isRight = false) {
            if (!data) return '';
            
            const imgSrc = data.img.startsWith('resources/') ? data.img : 'resources/' + data.img;
            const qualityColor = MARCH_SIZE_DATA.qualityColors[data.quality] || '#E5CC80';
            
            let progressionText = '';
            if (data.currentMs > 0) {
                progressionText = `(+${formatNumber(data.currentMs)}/${formatNumber(data.maxMs)})`;
            } else if (data.currentPct > 0) {
                progressionText = `(+${data.currentPct.toFixed(2)}%/${data.maxPct.toFixed(2)}%)`;
            }
            
            const isDragonTrinket = data.slotKey === 'dragonTrinket';
            
            return `
                <div class="ms-rec-slot ${isRight ? 'ms-rec-slot--right' : ''} ${isDragonTrinket ? 'ms-rec-slot--dragon' : ''}" data-quality="${data.quality}">
                    <span class="ms-rec-slot__progression">${progressionText}</span>
                    <div class="ms-rec-slot__image" style="border-color: ${qualityColor}">
                        <img src="${imgSrc}" alt="${data.name}" onerror="this.src='${DEFAULT_IMAGES[data.slotKey] || 'resources/item/ring.png'}'">
                    </div>
                    <div class="ms-rec-slot__info">
                        <span class="ms-rec-slot__label">${data.slot}</span>
                        <span class="ms-rec-slot__name">${data.name}</span>
                        <span class="ms-rec-slot__quality" style="color: ${qualityColor}">${capitalizeFirst(data.quality)} Lv.${data.level}</span>
                    </div>
                </div>
            `;
        }
        
        const leftHtml = leftSlots.map(slot => renderSlot(getSlotData(slot), false)).join('');
        const rightHtml = rightSlots.map(slot => renderSlot(getSlotData(slot), true)).join('');
        
        elements.recommendationsGrid.innerHTML = `
            <div class="ms-rec-column ms-rec-column--left">
                ${leftHtml}
            </div>
            <div class="ms-rec-center">
                <img src="resources/stark-logo.png" alt="Logo" class="ms-rec-logo">
            </div>
            <div class="ms-rec-column ms-rec-column--right">
                ${rightHtml}
            </div>
        `;
    }

    function generateBreakdownChart(results) {
        if (!elements.breakdownChart) return;

        const breakdown = results.breakdown || {};
        const chartData = [];

        // Buildings
        if (breakdown.buildings?.total > 0) {
            chartData.push({ label: 'Buildings', value: breakdown.buildings.total });
        }

        // Armories
        if (breakdown.armories?.total > 0) {
            chartData.push({ label: 'Armories', value: breakdown.armories.total });
        }

        // Research
        if (breakdown.research?.flat > 0) {
            chartData.push({ label: 'Research', value: breakdown.research.flat });
        }


        // Gear
        if (breakdown.gear?.flat > 0) {
            chartData.push({ label: 'Gear', value: breakdown.gear.flat });
        }

        // Heroes (show separately with absolute value)
        if (breakdown.heroes?.pct > 0) {
            const baseForBonus = results.base + results.gear;
            const heroBonus = Math.floor(baseForBonus * (breakdown.heroes.pct / 100));
            if (heroBonus > 0) {
                chartData.push({ 
                    label: `Heroes (+${breakdown.heroes.pct.toFixed(2)}%)`, 
                    value: heroBonus 
                });
            }
        }

        // Other Bonuses (percentage-based excluding heroes)
        const otherBonusPct = results.bonusPct - (breakdown.heroes?.pct || 0);
        if (otherBonusPct > 0) {
            const baseForBonus = results.base + results.gear;
            const otherBonus = Math.floor(baseForBonus * (otherBonusPct / 100));
            if (otherBonus > 0) {
                chartData.push({ label: 'Other Bonuses', value: otherBonus });
            }
        }

        // Find max for scaling
        const maxValue = Math.max(...chartData.map(d => d.value), 1);

        elements.breakdownChart.innerHTML = chartData.map(item => {
            const percentage = (item.value / maxValue) * 100;
            return `
                <div class="ms-chart-bar">
                    <span class="ms-chart-bar__label">${item.label}</span>
                    <div class="ms-chart-bar__track">
                        <div class="ms-chart-bar__fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="ms-chart-bar__value">${formatNumber(item.value)}</span>
                </div>
            `;
        }).join('');
    }

    // ============================================
    // RESET
    // ============================================

    function resetCalculator() {
        // Reset to step 1
        goToStep(1);

        // Reset scenario
        selectScenario('ms-vs-sop');

        // Reset modifiers
        if (elements.keepEnhancementLevel) elements.keepEnhancementLevel.value = '0';

        // Reset gear selections
        const slots = ['helmet', 'chest', 'pants', 'dragonTrinket', 'boots', 'ring', 'weapon', 'trinket'];
        slots.forEach(slot => {
            const select = document.getElementById(`msGearSelect-${slot}`);
            const qualitySelect = document.getElementById(`msGearQuality-${slot}`);
            const levelSelect = document.getElementById(`msGearLevelSelect-${slot}`);
            if (select) {
                select.value = '';
                updateGearImage(slot, '');
            }
            if (qualitySelect) {
                qualitySelect.value = 'legendary';
            }
            if (levelSelect) {
                levelSelect.value = '45';
            }
            // Clear quality styling
            updateGearSlotQuality(slot, '');
        });

        // Reset building levels and their displays
        if (elements.keepLevel) {
            elements.keepLevel.value = '35';
            updateBuildingSliderDisplay('msKeepLevel', 'msKeepLevelDisplay', 'keep');
        }
        if (elements.trainingYardLevel) {
            elements.trainingYardLevel.value = '0';
            updateBuildingSliderDisplay('msTrainingYardLevel', 'msTrainingYardLevelDisplay', 'trainingYard');
        }
        if (elements.greatHallLevel) {
            elements.greatHallLevel.value = '0';
            updateBuildingSliderDisplay('msGreatHallLevel', 'msGreatHallLevelDisplay', 'greatHall');
        }
        if (elements.watchtowerLevel) {
            elements.watchtowerLevel.value = '0';
            updateBuildingSliderDisplay('msWatchtowerLevel', 'msWatchtowerLevelDisplay', 'watchtower');
        }
        if (elements.keepEnhancementLevel) {
            elements.keepEnhancementLevel.value = '0';
            updateBuildingSliderDisplay('msKeepEnhancementLevel', 'msKeepEnhancementLevelDisplay', 'keepEnhancement');
        }

        // Reset armory levels and their displays
        if (elements.armoryInputs) {
            elements.armoryInputs.forEach(input => {
                input.value = '0';
                updateArmorySliderDisplay(input);
            });
        }

        // Reset research sliders
        Object.entries(elements.researchSliders).forEach(([key, slider]) => {
            if (slider) {
                slider.value = 0;
                updateResearchSliderDisplay(key);
            }
        });

        // Reset hero selections and levels
        const heroPositions = ['hand', 'war', 'coin', 'whispers', 'law', 'ships', 'commander', 'maester'];
        heroPositions.forEach(position => {
            const select = document.getElementById(`msHeroSelect-${position}`);
            const slider = document.getElementById(`msHeroLevel-${position}`);
            const levelDisplay = document.getElementById(`msHeroLevelDisplay-${position}`);
            const imgElement = document.getElementById(`msHeroImg-${position}`);
            const slotElement = document.querySelector(`.ms-hero-slot[data-position="${position}"]`);
            // Get the default position icon from data attribute
            const defaultIcon = imgElement?.dataset.default || `heroes/icon-${position}.png`;
            
            if (select) select.value = '';
            if (slider) {
                slider.value = 0;
                slider.disabled = true;
                slider.max = 60;
            }
            if (levelDisplay) levelDisplay.textContent = 'Lv 0';
            if (imgElement) {
                imgElement.src = defaultIcon;
                imgElement.classList.remove('has-hero');
            }
            if (slotElement) {
                slotElement.classList.remove('hero-selected', 'hero-exquisite', 'hero-legendary');
            }
        });

        // Reset manual total
        if (elements.manualTotal) elements.manualTotal.value = '';
    }

    // ============================================
    // SECTION TOTALS & AGGREGATION
    // ============================================

    // Max values for each section (based on game data)
    const SECTION_MAXES = {
        buildings: {
            keep: 41100,         // Keep level 40
            trainingYard: 53500  // Training Yard level 40
        },
        enhancements: {
            greatHall: 5000,      // Great Hall level 25
            watchtower: 2500      // Watchtower level 20
        },
        armories: {
            standard: 2167,   // Per armory max
            trinket: 854,     // Per armory max
            dragon: 895       // Per armory max
        }
    };

    // Count of armories in each category
    const ARMORY_COUNTS = {
        standard: 16,  // 16 standard armories × 2167 = 34,672
        trinket: 6,    // 6 trinket armories × 854 = 5,124
        dragon: 3      // 3 dragon armories × 895 = 2,685
        // Total: 42,481
    };

    // Calculate building section total
    function calculateBuildingsTotal() {
        let current = 0;
        let max = SECTION_MAXES.buildings.keep + SECTION_MAXES.buildings.trainingYard;
        
        // Keep
        if (elements.keepLevel) {
            const level = parseInt(elements.keepLevel.value) || 0;
            const data = getBuildingMarchSize('keep', level);
            current += data.marchSize || 0;
        }
        
        // Training Yard
        if (elements.trainingYardLevel) {
            const level = parseInt(elements.trainingYardLevel.value) || 0;
            const data = getBuildingMarchSize('trainingYard', level);
            current += data.marchSize || 0;
        }
        
        return { current, max };
    }

    // Calculate enhancements section total (including Keep Enhancement percentage)
    function calculateEnhancementsTotal() {
        let currentFlat = 0;
        let currentPct = 0;
        let maxFlat = SECTION_MAXES.enhancements.greatHall + SECTION_MAXES.enhancements.watchtower;
        let maxPct = 8.0; // Keep Enhancement at level 40 provides 8%
        
        // Great Hall
        if (elements.greatHallLevel) {
            const level = parseInt(elements.greatHallLevel.value) || 0;
            const data = getEnhancementMarchSize('greatHall', level);
            currentFlat += data.marchSize || 0;
        }
        
        // Watchtower
        if (elements.watchtowerLevel) {
            const level = parseInt(elements.watchtowerLevel.value) || 0;
            const data = getEnhancementMarchSize('watchtower', level);
            currentFlat += data.marchSize || 0;
        }
        
        // Keep Enhancement (percentage bonus at level 40)
        if (elements.keepEnhancementLevel) {
            const level = parseInt(elements.keepEnhancementLevel.value) || 0;
            if (level >= 40) {
                currentPct = 8.0;
            }
        }
        
        return { 
            current: currentFlat, 
            max: maxFlat,
            currentPct: currentPct,
            maxPct: maxPct
        };
    }

    // Calculate armory category totals (standard, trinket, dragon)
    function calculateArmoryCategoryTotals() {
        const totals = {
            standard: { current: 0, max: SECTION_MAXES.armories.standard * ARMORY_COUNTS.standard },
            trinket: { current: 0, max: SECTION_MAXES.armories.trinket * ARMORY_COUNTS.trinket },
            dragon: { current: 0, max: SECTION_MAXES.armories.dragon * ARMORY_COUNTS.dragon }
        };
        
        if (elements.armoryInputs) {
            elements.armoryInputs.forEach(input => {
                const level = parseInt(input.value) || 0;
                const armoryId = input.dataset.armory;
                
                // Determine category
                let category = 'standard';
                if (MARCH_SIZE_DATA.armories.trinket[armoryId]) {
                    category = 'trinket';
                } else if (MARCH_SIZE_DATA.armories.dragon[armoryId]) {
                    category = 'dragon';
                }
                
                const data = getArmoryMarchSize(category, armoryId, level);
                totals[category].current += data.marchSize || 0;
            });
        }
        
        return totals;
    }

    // Calculate armories section total (sum of all categories)
    function calculateArmoriesTotalAggregate() {
        const categories = calculateArmoryCategoryTotals();
        return {
            current: categories.standard.current + categories.trinket.current + categories.dragon.current,
            max: categories.standard.max + categories.trinket.max + categories.dragon.max,
            categories: categories
        };
    }

    // Calculate research section total with category breakdown
    function calculateResearchTotal() {
        // Define which research belongs to which category
        const categories = {
            military1: ['command', 'command2', 'command3'],
            military2: ['armyExpertise', 'armyExpertise2', 'sopMarchSize', 'sopMarchSize2'],
            advancedMilitary: ['troopSurge1', 'troopSurge2', 'troopSurge3']
        };
        
        const categoryTotals = {
            military1: { current: 0, max: 30000 },      // 6000 + 10000 + 14000
            military2: { current: 0, max: 22500 },     // 10000 + 10000 + 1250 + 1250
            advancedMilitary: { current: 0, max: 7500 } // 2500 + 2500 + 2500
        };
        
        let totalCurrent = 0;
        let totalMax = 0;
        
        // Calculate category totals
        Object.entries(categories).forEach(([category, researchKeys]) => {
            researchKeys.forEach(key => {
                const slider = elements.researchSliders[key];
                if (slider) {
                    const level = parseInt(slider.value) || 0;
                    const researchData = MARCH_SIZE_DATA.research[key];
                    if (researchData) {
                        categoryTotals[category].current += level * (researchData.perLevel || 0);
                    }
                }
            });
            
            totalCurrent += categoryTotals[category].current;
            totalMax += categoryTotals[category].max;
        });
        
        return { 
            current: totalCurrent, 
            max: totalMax,
            categories: categoryTotals
        };
    }

    // Calculate heroes section totals (council, marching, hall - with flat and percentage)
    function calculateHeroesTotal() {
        // Council heroes calculation
        let councilFlat = 0;
        let councilPct = 0;
        let councilMaxFlat = 0;
        let councilMaxPct = 0;
        const councilPositions = ['hand', 'war', 'coin', 'whispers', 'law', 'ships', 'commander', 'maester'];
        
        councilPositions.forEach(position => {
            const select = document.getElementById(`msHeroSelect-${position}`);
            const slider = document.getElementById(`msHeroLevel-${position}`);
            
            if (select && slider && select.value && select.value !== 'none') {
                const heroId = select.value;
                const level = parseInt(slider.value) || 0;
                const hero = MARCH_SIZE_DATA.heroes.heroList[heroId];
                
                if (hero && hero.councilMarchSize) {
                    const bonus = hero.councilMarchSize;
                    const isUnlocked = level >= bonus.unlockLevel;
                    
                    // Track max values (what they could get if unlocked)
                    if (bonus.type === 'flat') {
                        councilMaxFlat += bonus.value || 0;
                        if (isUnlocked) {
                            councilFlat += bonus.value || 0;
                        }
                    } else if (bonus.type === 'pct') {
                        councilMaxPct += bonus.value || 0;
                        if (isUnlocked) {
                            councilPct += bonus.value || 0;
                        }
                    }
                }
            }
        });
        
        // Marching hero calculation - 1st signature skill march size bonus
        let marchingFlat = 0;
        let marchingPct = 0; // No percentage bonus for marching hero capacity
        let marchingMaxFlat = 8813; // Max at level 60
        let marchingMaxPct = 0; // No percentage for marching hero
        
        if (elements.marchingHeroLevel) {
            const level = parseInt(elements.marchingHeroLevel.value) || 1;
            marchingFlat = getMarchingHeroMS(level);
        }
        
        // Hall of Heroes calculation - level 13-21 maps to 66-2,000
        let hallFlat = 0;
        let hallMaxFlat = 2000; // Max at level 21
        
        if (elements.hallLevel) {
            const level = parseInt(elements.hallLevel.value) || 0;
            hallFlat = getHallMS(level);
        }
        
        return { 
            // Totals across all hero sections
            current: councilFlat + marchingFlat + hallFlat,
            currentPct: councilPct + marchingPct,
            // Council breakdown
            council: {
                flat: councilFlat,
                pct: councilPct,
                maxFlat: councilMaxFlat,
                maxPct: councilMaxPct
            },
            // Marching breakdown
            marching: {
                flat: marchingFlat,
                pct: marchingPct,
                maxFlat: marchingMaxFlat,
                maxPct: marchingMaxPct
            },
            // Hall breakdown
            hall: {
                flat: hallFlat,
                maxFlat: hallMaxFlat
            }
        };
    }

    // Update all section total displays
    function updateAllSectionTotals() {
        // Buildings
        const buildingsTotal = calculateBuildingsTotal();
        const buildingsTotalEl = document.getElementById('msBuildingsTotal');
        if (buildingsTotalEl) {
            buildingsTotalEl.textContent = `(+${buildingsTotal.current.toLocaleString()} / ${buildingsTotal.max.toLocaleString()})`;
        }
        
        // Enhancements (flat + percentage)
        const enhancementsTotal = calculateEnhancementsTotal();
        const enhancementsTotalEl = document.getElementById('msEnhancementsTotal');
        if (enhancementsTotalEl) {
            let pctText = enhancementsTotal.currentPct > 0 ? ` +${enhancementsTotal.currentPct}%` : '';
            enhancementsTotalEl.textContent = `(+${enhancementsTotal.current.toLocaleString()} / ${enhancementsTotal.max.toLocaleString()}${pctText})`;
        }
        
        // Armories (aggregate and categories)
        const armoriesTotal = calculateArmoriesTotalAggregate();
        
        // Main armories accordion total
        const armoriesTotalEl = document.getElementById('msArmoriesTotal');
        if (armoriesTotalEl) {
            armoriesTotalEl.textContent = `(+${armoriesTotal.current.toLocaleString()} / ${armoriesTotal.max.toLocaleString()})`;
        }
        
        // Standard armories category
        const standardTotalEl = document.getElementById('msStandardArmoriesTotal');
        if (standardTotalEl) {
            standardTotalEl.textContent = `(+${armoriesTotal.categories.standard.current.toLocaleString()} / ${armoriesTotal.categories.standard.max.toLocaleString()})`;
        }
        
        // Trinket armories category
        const trinketTotalEl = document.getElementById('msTrinketArmoriesTotal');
        if (trinketTotalEl) {
            trinketTotalEl.textContent = `(+${armoriesTotal.categories.trinket.current.toLocaleString()} / ${armoriesTotal.categories.trinket.max.toLocaleString()})`;
        }
        
        // Dragon armories category
        const dragonTotalEl = document.getElementById('msDragonArmoriesTotal');
        if (dragonTotalEl) {
            dragonTotalEl.textContent = `(+${armoriesTotal.categories.dragon.current.toLocaleString()} / ${armoriesTotal.categories.dragon.max.toLocaleString()})`;
        }
        
        // Research (aggregate and categories)
        const researchTotal = calculateResearchTotal();
        
        // Main research accordion total
        const researchTotalEl = document.getElementById('msResearchTotal');
        if (researchTotalEl) {
            researchTotalEl.textContent = `(+${researchTotal.current.toLocaleString()} / ${researchTotal.max.toLocaleString()})`;
        }
        
        // Military I category
        const military1TotalEl = document.getElementById('msMilitary1Total');
        if (military1TotalEl) {
            military1TotalEl.textContent = `(+${researchTotal.categories.military1.current.toLocaleString()} / ${researchTotal.categories.military1.max.toLocaleString()})`;
        }
        
        // Military II category
        const military2TotalEl = document.getElementById('msMilitary2Total');
        if (military2TotalEl) {
            military2TotalEl.textContent = `(+${researchTotal.categories.military2.current.toLocaleString()} / ${researchTotal.categories.military2.max.toLocaleString()})`;
        }
        
        // Advanced Military category
        const advMilitaryTotalEl = document.getElementById('msAdvancedMilitaryTotal');
        if (advMilitaryTotalEl) {
            advMilitaryTotalEl.textContent = `(+${researchTotal.categories.advancedMilitary.current.toLocaleString()} / ${researchTotal.categories.advancedMilitary.max.toLocaleString()})`;
        }
        
        // Heroes (flat + percentage with category breakdown)
        const heroesTotal = calculateHeroesTotal();
        
        // Main Heroes accordion total
        const heroesTotalEl = document.getElementById('msHeroesAccordionTotal');
        if (heroesTotalEl) {
            let parts = [];
            if (heroesTotal.current > 0) {
                parts.push(`+${heroesTotal.current.toLocaleString()}`);
            }
            if (heroesTotal.currentPct > 0) {
                parts.push(`+${heroesTotal.currentPct.toFixed(2)}%`);
            }
            heroesTotalEl.textContent = parts.length > 0 ? `(${parts.join(' ')})` : '(+0)';
        }
        
        // Council Heroes category total
        const councilTotalEl = document.getElementById('msCouncilHeroesTotal');
        if (councilTotalEl) {
            let parts = [];
            if (heroesTotal.council.maxFlat > 0 || heroesTotal.council.flat > 0) {
                parts.push(`+${heroesTotal.council.flat.toLocaleString()} / ${heroesTotal.council.maxFlat.toLocaleString()}`);
            }
            if (heroesTotal.council.maxPct > 0 || heroesTotal.council.pct > 0) {
                parts.push(`+${heroesTotal.council.pct.toFixed(2)}% / ${heroesTotal.council.maxPct.toFixed(2)}%`);
            }
            councilTotalEl.textContent = parts.length > 0 ? `(${parts.join(' | ')})` : '(+0)';
        }
        
        // Marching Hero category total
        const marchingTotalEl = document.getElementById('msMarchingHeroTotal');
        if (marchingTotalEl) {
            if (heroesTotal.marching.maxFlat > 0) {
                marchingTotalEl.textContent = `(+${heroesTotal.marching.flat.toLocaleString()} / ${heroesTotal.marching.maxFlat.toLocaleString()})`;
            } else {
                marchingTotalEl.textContent = '(+0)';
            }
        }
        
        // Hall of Heroes category total
        const hallTotalEl = document.getElementById('msHallHeroesTotal');
        if (hallTotalEl) {
            hallTotalEl.textContent = `(+${heroesTotal.hall.flat.toLocaleString()} / ${heroesTotal.hall.maxFlat.toLocaleString()})`;
        }
        
        // Update base march size total
        updateBaseMarchSizeTotal();
    }

    // Calculate and update the base march size total
    function updateBaseMarchSizeTotal() {
        const buildingsTotal = calculateBuildingsTotal();
        const enhancementsTotal = calculateEnhancementsTotal();
        const armoriesTotal = calculateArmoriesTotalAggregate();
        const researchTotal = calculateResearchTotal();
        const heroesTotal = calculateHeroesTotal();
        
        // Sum all flat bonuses
        const flatTotal = buildingsTotal.current + 
                         enhancementsTotal.current + 
                         armoriesTotal.current + 
                         researchTotal.current +
                         heroesTotal.current;
        
        // Sum all percentage bonuses
        const pctTotal = (enhancementsTotal.currentPct || 0) + 
                        (heroesTotal.currentPct || 0);
        
        // Calculate the bonus from percentages
        const pctBonus = Math.floor(flatTotal * pctTotal / 100);
        
        // Total = flat + percentage bonus
        const grandTotal = flatTotal + pctBonus;
        
        // Update displays
        const baseTotalEl = document.getElementById('msBaseMarchSizeTotal');
        if (baseTotalEl) {
            baseTotalEl.textContent = grandTotal.toLocaleString();
        }
        
        // Update percentage display
        const pctTotalEl = document.getElementById('msPercentageTotal');
        if (pctTotalEl) {
            pctTotalEl.textContent = `+${pctTotal.toFixed(2)}%`;
        }
        
        // Update breakdown display
        const breakdownEl = document.getElementById('msBreakdownDisplay');
        if (breakdownEl) {
            breakdownEl.innerHTML = `
                <span class="ms-breakdown__flat">${flatTotal.toLocaleString()} base</span>
                <span class="ms-breakdown__plus">+</span>
                <span class="ms-breakdown__pct">${pctBonus.toLocaleString()} (${pctTotal.toFixed(2)}%)</span>
            `;
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    function formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    }

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ============================================
    // INITIALIZATION ON DOM READY
    // ============================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for external access if needed
    window.marchSizeCalculator = {
        init,
        switchCalculatorMode,
        calculateMarchSize,
        resetCalculator
    };

})();

