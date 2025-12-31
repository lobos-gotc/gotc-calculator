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
        
        // Set recommended defaults first
        setRecommendedDefaults();
        
        // Initialize armory display values
        initializeArmoryDisplays();
        
        // Setup storage UI (save/load buttons)
        setupStorageUI();
        
        // Try to load saved data from localStorage
        const loaded = loadFromLocalStorage();
        if (loaded) {
            console.log('Loaded saved configuration from localStorage');
        }
        
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
                
                // Set to legendary quality and level 40
                if (qualitySelect) {
                    qualitySelect.value = 'legendary';
                    updateGearSlotQuality(slot, 'legendary');
                }
                if (levelSelect) {
                    levelSelect.value = '40';
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
            // Handle click events
            toggle.addEventListener('click', (e) => {
                // Don't toggle if clicking on info button or its children
                if (e.target.closest('.info-btn') || e.target.closest('.info-popover')) {
                    return;
                }
                
                const targetId = toggle.getAttribute('data-target');
                const content = document.getElementById(targetId);
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                
                toggle.setAttribute('aria-expanded', !isExpanded);
                // Use flex for armories content, grid for others
                const displayType = content.classList.contains('ms-armories-content') ? 'flex' : 'grid';
                content.style.display = isExpanded ? 'none' : displayType;
            });
            
            // Handle keyboard events for accessibility (Enter/Space)
            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    // Don't toggle if focus is on info button
                    if (e.target.closest('.info-btn')) {
                        return;
                    }
                    e.preventDefault();
                    toggle.click();
                }
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
        const titleBonusEl = document.getElementById('msTitleBonus');
        
        if (!titleSelect) return;
        
        const titleKey = titleSelect.value;
        const titleData = MARCH_SIZE_DATA.sopTitles[titleKey] || { marchSize: 0 };
        
        if (titleBonusEl) {
            titleBonusEl.textContent = `+${formatNumber(titleData.marchSize)}`;
        }
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
        
        // Toggle storage buttons visibility (only for march size calculator)
        updateStorageVisibility(mode === 'march-size');

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
                
                // Debug logging for populate
                if (gear.stats?.legendary?.marchSizePct > 0) {
                    console.log(`[populateGearSlots] ${slot}/${gear.name}: Setting basePct=${option.dataset.basePct} from stats.legendary.marchSizePct=${gear.stats?.legendary?.marchSizePct}`);
                }
                
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
        
        const gearName = select.value;
        const selectedOption = select.options[select.selectedIndex];
        const quality = qualitySelect?.value || 'legendary';
        const level = parseInt(levelSelect?.value) || 40;
        const levelKey = `L${level}`;
        
        // Try to get EXACT values from GEAR_DATABASE first (for lord gear)
        const exactStats = typeof getExactGearMarchSize === 'function' 
            ? getExactGearMarchSize(gearName, slot, levelKey, quality) 
            : null;
        
        let flatMS = 0;
        let pctMS = 0;
        
        if (exactStats) {
            // Use exact database values - no rounding errors!
            flatMS = Math.round(exactStats.flat);
            pctMS = exactStats.pct;
        } else {
            // Fall back to multiplier calculation (for trinkets or unmapped gear)
            const levelMultipliers = { 35: 0.8902, 40: 1.0, 45: 1.1098, 50: 1.2196 };
            const qualityMultipliers = { poor: 0.2, common: 0.4, fine: 0.6, exquisite: 0.8, epic: 0.9, legendary: 1.0 };
            
            const baseMs = parseFloat(selectedOption?.dataset?.baseMs) || 0;
            const basePct = parseFloat(selectedOption?.dataset?.basePct) || 0;
            
            const levelMult = levelMultipliers[level] || 1.0;
            const qualityMult = qualityMultipliers[quality] || 1.0;
            
            pctMS = basePct * levelMult * qualityMult;
            flatMS = Math.floor(baseMs * levelMult * qualityMult);
        }
        
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
            
            // Add Marching Hero bonus (1st signature skill)
            if (elements.marchingHeroLevel) {
                const marchingLevel = parseInt(elements.marchingHeroLevel.value) || 0;
                const marchingBonus = getMarchingHeroMS(marchingLevel);
                results.base += marchingBonus;
                results.breakdown.marchingHero = { flat: marchingBonus };
            }
            
            // Add Hall of Heroes bonus
            if (elements.hallLevel) {
                const hallLevel = parseInt(elements.hallLevel.value) || 0;
                const hallBonus = getHallMS(hallLevel);
                results.base += hallBonus;
                results.breakdown.hallOfHeroes = { flat: hallBonus };
            }
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
            const level = parseInt(slider.value) || 0;
            const currentMS = getMarchingHeroMS(level);
            const maxMS = 8813; // Max at level 60
            if (level === 0) {
                display.textContent = `None | (0 / ${maxMS.toLocaleString()})`;
            } else {
                display.textContent = `Lv ${level} | (${currentMS.toLocaleString()} / ${maxMS.toLocaleString()})`;
            }
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
                const maxMS = values[values.length - 1]; // Keep max display consistent with game overview
                
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
                
                // Get flat march capacity based on quality (for display only, NOT added to march size)
                // Hero capacity = troops that hero can lead, NOT a march size bonus!
                const capacity = getHeroMarchCapacity(heroData.quality, level);
                // NOTE: capacity is NOT added to result.flat - it's just for reference
                
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

        // Level multipliers (fallback for trinkets without exact DB values)
        const levelMultipliers = {
            35: 0.8902,
            40: 1.0,
            45: 1.1098,
            50: 1.2196
        };

        // Quality multipliers (fallback for trinkets without exact DB values)
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
            
            // Convert level to key format for database lookup (e.g., 40 -> "L40")
            const levelKey = `L${level}`;

            // Look up in MARCH_SIZE_DATA for gear metadata
            const slotData = MARCH_SIZE_DATA.gear[slot];
            let gearData = null;
            
            if (slotData && slotData[gearName]) {
                gearData = slotData[gearName];
            }
            
            let adjustedMS = 0;
            let adjustedPct = 0;
            
            if (gearData) {
                // Try to get EXACT values from GEAR_DATABASE first (for lord gear)
                const exactStats = typeof getExactGearMarchSize === 'function' 
                    ? getExactGearMarchSize(gearName, slot, levelKey, quality) 
                    : null;
                
                if (exactStats) {
                    // Use exact database values - no rounding errors!
                    adjustedMS = Math.round(exactStats.flat);
                    adjustedPct = exactStats.pct;
                } else {
                    // Fall back to multiplier calculation (for trinkets or unmapped gear)
                    const baseStats = gearData.stats?.legendary || { marchSize: 0, marchSizePct: 0 };
                    
                    const levelMult = levelMultipliers[level] || 1.0;
                    const qualityMult = qualityMultipliers[quality] || 1.0;
                    const totalMult = levelMult * qualityMult;
                    
                    adjustedMS = Math.floor((baseStats.marchSize || 0) * totalMult);
                    adjustedPct = (baseStats.marchSizePct || 0) * totalMult;
                }
                
                // Update bonus display - show percentage if available, otherwise flat
                if (bonusEl) {
                    if (adjustedPct > 0) {
                        bonusEl.textContent = `+${adjustedPct.toFixed(2)}%`;
                    } else {
                        bonusEl.textContent = `+${formatNumber(adjustedMS)}`;
                    }
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

        // Generate recommendations with base march size for optimization analysis
        generateRecommendations(results.total);

        // Generate breakdown chart
        generateBreakdownChart(results);
    }

    // ============================================
    // GEAR OPTIMIZATION CALCULATIONS
    // ============================================

    const LEVEL_MULTIPLIERS = { 35: 0.85, 40: 1.0, 45: 1.15, 50: 1.30 };
    const QUALITY_MULTIPLIERS = { 
        poor: 0.2, common: 0.4, fine: 0.6, 
        exquisite: 0.8, epic: 0.9, legendary: 1.0 
    };

    // Calculate effective march size contribution from a gear piece
    function calculateEffectiveMS(baseMarchSize, gearStats, level, quality) {
        const levelMult = LEVEL_MULTIPLIERS[level] || 1.0;
        const qualityMult = QUALITY_MULTIPLIERS[quality] || 1.0;
        
        const marchSize = gearStats?.marchSize || 0;
        const marchSizePct = gearStats?.marchSizePct || 0;
        
        if (marchSizePct > 0) {
            return Math.floor(baseMarchSize * (marchSizePct / 100) * levelMult * qualityMult);
        }
        return Math.floor(marchSize * levelMult * qualityMult);
    }

    // Calculate breakeven point where % gear becomes better than flat gear
    function calculateBreakeven(flatGearStats, pctGearStats, flatLevel, flatQuality) {
        const flatLevelMult = LEVEL_MULTIPLIERS[flatLevel] || 1.0;
        const flatQualityMult = QUALITY_MULTIPLIERS[flatQuality] || 1.0;
        
        const flatValue = (flatGearStats?.marchSize || 0) * flatLevelMult * flatQualityMult;
        const pctRate = (pctGearStats?.marchSizePct || 0) / 100;
        
        if (pctRate <= 0) return Infinity;
        
        // At L45 Legendary, % gear gives baseMarchSize * pctRate * 1.15 * 1.0
        // So breakeven is: flatValue / (pctRate * 1.15 * 1.0)
        return Math.ceil(flatValue / (pctRate * 1.15 * 1.0));
    }

    // Find minimum level/quality combinations that beat the current gear value
    function findMinimumRequirements(baseMarchSize, currentValue, pctGearStats) {
        const levels = [35, 40, 45, 50];
        const qualities = ['exquisite', 'epic', 'legendary'];
        const results = [];
        
        for (const level of levels) {
            for (const quality of qualities) {
                const effective = calculateEffectiveMS(baseMarchSize, pctGearStats, level, quality);
                const diff = effective - currentValue;
                results.push({ 
                    level, 
                    quality, 
                    effective: Math.floor(effective), 
                    diff: Math.floor(diff), 
                    beats: diff > 0 
                });
            }
        }
        // Sort by effective value ascending so user sees progression
        return results.sort((a, b) => a.effective - b.effective);
    }

    // Find the best percentage gear for a slot
    function findBestPctGearForSlot(slot) {
        const slotData = MARCH_SIZE_DATA.gear[slot];
        if (!slotData) return null;
        
        let bestPctGear = null;
        let bestPct = 0;
        
        for (const [name, data] of Object.entries(slotData)) {
            const pct = data.stats?.legendary?.marchSizePct || 0;
            if (pct > bestPct) {
                bestPct = pct;
                bestPctGear = { name, ...data };
            }
        }
        
        return bestPctGear;
    }

    // Find the best flat march size gear for a slot
    function findBestFlatGearForSlot(slot) {
        const slotData = MARCH_SIZE_DATA.gear[slot];
        if (!slotData) return null;
        
        let bestFlatGear = null;
        let bestFlat = 0;
        
        for (const [name, data] of Object.entries(slotData)) {
            const flat = data.stats?.legendary?.marchSize || 0;
            const pct = data.stats?.legendary?.marchSizePct || 0;
            // Only consider purely flat gear (no % component)
            if (flat > bestFlat && pct === 0) {
                bestFlat = flat;
                bestFlatGear = { name, ...data };
            }
        }
        
        return bestFlatGear;
    }

    // Calculate breakeven point where flat gear becomes better than % gear
    function calculateBreakevenForFlat(pctGearStats, flatGearStats) {
        const pctRate = (pctGearStats?.marchSizePct || 0) / 100;
        const flatValue = (flatGearStats?.marchSize || 0) * 1.15 * 1.0; // At L45 Legendary
        
        if (pctRate <= 0) return 0;
        
        // At L45 Legendary for %, effective = baseMarchSize * pctRate * 1.15
        // flatValue > baseMarchSize * pctRate * 1.15
        // baseMarchSize < flatValue / (pctRate * 1.15)
        return Math.ceil(flatValue / (pctRate * 1.15));
    }

    // Check if current gear is percentage-based
    function isPercentageGear(gearStats) {
        return (gearStats?.marchSizePct || 0) > 0;
    }

    // State for interactive recommendations
    let recommendationState = {
        baseMarchSize: 0,
        titleBonus: 0,
        selectedTitle: 'none',
        slots: {}
    };

    function generateRecommendations(baseMarchSize) {
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
        
        const slots = ['helmet', 'chest', 'pants', 'weapon', 'ring', 'boots', 'dragonTrinket', 'trinket'];
        
        // Initialize recommendation state
        recommendationState.baseMarchSize = baseMarchSize;
        recommendationState.selectedTitle = document.getElementById('msTitleSelect')?.value || 'none';
        recommendationState.titleBonus = MARCH_SIZE_DATA.sopTitles[recommendationState.selectedTitle]?.marchSize || 0;
        
        // Get current equipped gear data for a slot
        function getCurrentGearData(slot) {
            const select = document.getElementById(`msGearSelect-${slot}`);
            const qualitySelect = document.getElementById(`msGearQuality-${slot}`);
            const levelSelect = document.getElementById(`msGearLevelSelect-${slot}`);
            
            if (select && select.value) {
                const selectedOption = select.options[select.selectedIndex];
                const gearData = MARCH_SIZE_DATA.gear[slot]?.[select.value];
                const quality = qualitySelect?.value || 'legendary';
                const level = parseInt(levelSelect?.value) || 40;
                const baseMs = parseFloat(selectedOption?.dataset?.baseMs) || 0;
                const basePct = parseFloat(selectedOption?.dataset?.basePct) || 0;
                
                const stats = { marchSize: baseMs, marchSizePct: basePct };
                const effectiveValue = calculateEffectiveMS(baseMarchSize, stats, level, quality);
                
                return {
                    slot: slotNames[slot],
                    slotKey: slot,
                    name: select.value,
                    img: gearData?.img || selectedOption?.dataset?.img || DEFAULT_IMAGES[slot],
                    quality: quality,
                    level: level,
                    stats: stats,
                    effectiveValue: effectiveValue,
                    isPct: basePct > 0
                };
            }
            return null;
        }
        
        // Get all available gear for a slot (for dropdown)
        function getAllGearForSlot(slot) {
            const slotData = MARCH_SIZE_DATA.gear[slot];
            if (!slotData) return [];
            
            return Object.entries(slotData).map(([name, data]) => ({
                name,
                img: data.img,
                stats: data.stats?.legendary || { marchSize: 0, marchSizePct: 0 },
                isPct: (data.stats?.legendary?.marchSizePct || 0) > 0,
                season: data.season,
                set: data.set
            })).sort((a, b) => {
                // Sort by effectiveness at current base march size
                const aEff = calculateEffectiveMS(baseMarchSize, a.stats, 45, 'legendary');
                const bEff = calculateEffectiveMS(baseMarchSize, b.stats, 45, 'legendary');
                return bEff - aEff;
            });
        }
        
        // Calculate minimum quality needed per level to beat a target value
        function calculateMinQualityPerLevel(targetValue, gearStats) {
            const levels = [35, 40, 45, 50];
            const qualities = ['poor', 'common', 'fine', 'exquisite', 'epic', 'legendary'];
            const results = {};
            
            for (const level of levels) {
                results[level] = null;
                for (const quality of qualities) {
                    const effective = calculateEffectiveMS(baseMarchSize, gearStats, level, quality);
                    if (effective > targetValue) {
                        results[level] = { quality, effective };
                        break;
                    }
                }
            }
            return results;
        }
        
        // Find the best gear for this slot based on current base march size
        function findBestGearForSlot(slotKey) {
            const allGear = getAllGearForSlot(slotKey);
            if (allGear.length === 0) return null;
            
            // Sort by effectiveness at current base march size (L45 Legendary)
            return allGear[0]; // Already sorted by effectiveness
        }
        
        // Render a single slot optimization card with interactive elements
        function renderOptimizationSlot(slotKey, slotState) {
            const current = getCurrentGearData(slotKey);
            const allGear = getAllGearForSlot(slotKey);
            const bestGear = findBestGearForSlot(slotKey);
            
            // Initialize slot state if not exists
            if (!recommendationState.slots[slotKey]) {
                recommendationState.slots[slotKey] = {
                    selectedGear: bestGear?.name || '',
                    selectedLevel: 45,
                    selectedQuality: 'legendary'
                };
            }
            const state = recommendationState.slots[slotKey];
            
            if (!current) {
                return `
                    <div class="ms-opt-slot" data-slot="${slotKey}">
                        <div class="ms-opt-header">${slotNames[slotKey]}</div>
                        <div class="ms-opt-empty">No gear equipped</div>
                </div>
                `;
            }
            
            const currentImgSrc = current.img?.startsWith('resources/') ? current.img : 'resources/' + current.img;
            const currentQualityColor = MARCH_SIZE_DATA.qualityColors[current.quality] || '#E5CC80';
            
            // Get selected recommendation data
            const selectedGearData = allGear.find(g => g.name === state.selectedGear) || bestGear;
            const recImgSrc = selectedGearData?.img?.startsWith('resources/') 
                ? selectedGearData.img 
                : 'resources/' + (selectedGearData?.img || '');
            const recQualityColor = MARCH_SIZE_DATA.qualityColors[state.selectedQuality] || '#E5CC80';
            
            // Calculate values
            const recStats = selectedGearData?.stats || { marchSize: 0, marchSizePct: 0 };
            const recEffective = calculateEffectiveMS(baseMarchSize, recStats, state.selectedLevel, state.selectedQuality);
            
            // Check if same as current
            const isSameAsCurrent = selectedGearData?.name === current.name 
                && state.selectedLevel === current.level 
                && state.selectedQuality === current.quality;
            
            // Determine badge status - shortened text for mobile
            let badgeHtml = '';
            let slotClass = '';
            if (isSameAsCurrent) {
                badgeHtml = '<span class="ms-opt-badge ms-opt-badge--same">= Same</span>';
                slotClass = 'ms-opt-slot--same';
            } else if (recEffective > current.effectiveValue) {
                badgeHtml = '<span class="ms-opt-badge ms-opt-badge--upgrade">⬆ Upgrade</span>';
                slotClass = 'ms-opt-slot--upgrade';
            } else if (recEffective < current.effectiveValue) {
                badgeHtml = '<span class="ms-opt-badge ms-opt-badge--downgrade">⬇ Downgrade</span>';
                slotClass = 'ms-opt-slot--downgrade';
            } else {
                badgeHtml = '<span class="ms-opt-badge ms-opt-badge--current">No Change</span>';
            }
            
            // Calculate min requirements for the recommended gear to beat current
            const minReqs = calculateMinQualityPerLevel(current.effectiveValue, recStats);
            
            // Build gear dropdown options - shorter format without parentheses
            const gearOptionsHtml = allGear.map(g => {
                const statDisplay = g.isPct ? `${g.stats.marchSizePct.toFixed(1)}%` : `+${formatNumber(g.stats.marchSize)}`;
                return `<option value="${g.name}" ${g.name === state.selectedGear ? 'selected' : ''} title="${g.name} - ${statDisplay}">
                    ${g.name}
                </option>`;
            }).join('');
            
            // Build level options
            const levelOptionsHtml = [35, 40, 45, 50].map(lvl => 
                `<option value="${lvl}" ${lvl === state.selectedLevel ? 'selected' : ''}>Lv.${lvl}</option>`
            ).join('');
            
            // Build quality options - shorter names for mobile
            const qualities = ['poor', 'common', 'fine', 'exquisite', 'epic', 'legendary'];
            const qualityShortNames = { poor: 'Poor', common: 'Com', fine: 'Fine', exquisite: 'Exq', epic: 'Epic', legendary: 'Leg' };
            const qualityOptionsHtml = qualities.map(q => 
                `<option value="${q}" ${q === state.selectedQuality ? 'selected' : ''}>${qualityShortNames[q]}</option>`
            ).join('');
            
            // Build min requirements display - only show levels that can beat, with quality colors
            const qualityColors = MARCH_SIZE_DATA.qualityColors;
            const minReqsHtml = [35, 40, 45, 50].map(lvl => {
                const req = minReqs[lvl];
                if (req) {
                    const qColor = qualityColors[req.quality] || '#E5CC80';
                    const gain = req.effective - current.effectiveValue;
                    return `<span class="ms-opt-minreq" style="border-color: ${qColor}; background: ${qColor}15;" 
                        title="Lv.${lvl} ${capitalizeFirst(req.quality)}: +${formatNumber(req.effective)} (+${formatNumber(gain)} gain)">
                        <span class="ms-opt-minreq__level">Lv.${lvl}</span>
                        <span class="ms-opt-minreq__quality" style="color: ${qColor}">${capitalizeFirst(req.quality)}</span>
                        <span class="ms-opt-minreq__check">✓</span>
                    </span>`;
                }
                return ''; // Don't show levels that can't beat current
            }).filter(html => html).join('');
            
            // Calculate gain/loss for this slot
            const slotGain = recEffective - current.effectiveValue;
            const gainDisplay = slotGain >= 0 ? `+${formatNumber(slotGain)}` : formatNumber(slotGain);
            const gainClass = slotGain > 0 ? 'ms-opt-gain--positive' : (slotGain < 0 ? 'ms-opt-gain--negative' : 'ms-opt-gain--neutral');
            
            // Format current value display
            const currentValueDisplay = current.isPct 
                ? `+${(current.stats.marchSizePct * LEVEL_MULTIPLIERS[current.level] * QUALITY_MULTIPLIERS[current.quality]).toFixed(2)}%`
                : `+${formatNumber(current.stats.marchSize)} flat`;
                
            // Format recommended value display
            const recIsPct = (recStats.marchSizePct || 0) > 0;
            const recValueDisplay = recIsPct
                ? `+${(recStats.marchSizePct * LEVEL_MULTIPLIERS[state.selectedLevel] * QUALITY_MULTIPLIERS[state.selectedQuality]).toFixed(2)}%`
                : `+${formatNumber(recStats.marchSize)} flat`;
            
            return `
                <div class="ms-opt-slot ${slotClass}" data-slot="${slotKey}">
                    <div class="ms-opt-header">
                        <span class="ms-opt-header__title">${slotNames[slotKey]}</span>
                        ${badgeHtml}
                        <span class="ms-opt-header__gain ${gainClass}" id="msOptGain-${slotKey}">${gainDisplay}</span>
                    </div>
                    <div class="ms-opt-comparison">
                        <div class="ms-opt-gear ms-opt-gear--current">
                            <div class="ms-opt-gear__label">Current</div>
                            <div class="ms-opt-gear__image" style="border-color: ${currentQualityColor}">
                                <img src="${currentImgSrc}" alt="${current.name}" onerror="this.style.display='none'">
                    </div>
                            <div class="ms-opt-gear__info">
                                <span class="ms-opt-gear__name">${current.name}</span>
                                <span class="ms-opt-gear__quality" style="color: ${currentQualityColor}">${capitalizeFirst(current.quality)} Lv.${current.level}</span>
                                <span class="ms-opt-gear__effective">+${formatNumber(current.effectiveValue)}</span>
                            </div>
                        </div>
                        <div class="ms-opt-vs">→</div>
                        <div class="ms-opt-gear ms-opt-gear--recommended">
                            <div class="ms-opt-gear__label">Recommended</div>
                            <div class="ms-opt-gear__image" style="border-color: ${recQualityColor}" id="msOptImg-${slotKey}">
                                <img src="${recImgSrc}" alt="${selectedGearData?.name || ''}" onerror="this.style.display='none'">
                            </div>
                            <div class="ms-opt-gear__info">
                                <select class="ms-opt-gear-select" id="msOptGear-${slotKey}" data-slot="${slotKey}" title="${selectedGearData?.name || ''}">
                                    ${gearOptionsHtml}
                                </select>
                                <div class="ms-opt-gear__selectors">
                                    <select class="ms-opt-level-select" id="msOptLevel-${slotKey}" data-slot="${slotKey}">
                                        ${levelOptionsHtml}
                                    </select>
                                    <select class="ms-opt-quality-select" id="msOptQuality-${slotKey}" data-slot="${slotKey}">
                                        ${qualityOptionsHtml}
                                    </select>
                                </div>
                                <span class="ms-opt-gear__effective" id="msOptEffective-${slotKey}">+${formatNumber(recEffective)}</span>
                            </div>
                        </div>
                    </div>
                    ${minReqsHtml ? `
                    <div class="ms-opt-minreqs" id="msOptMinReqs-${slotKey}">
                        <span class="ms-opt-minreqs__label">Min. levels to beat current:</span>
                        <div class="ms-opt-minreqs__list">${minReqsHtml}</div>
                    </div>
                    ` : ''}
                </div>
            `;
        }
        
        // Calculate totals
        function calculateTotals() {
            let totalCurrent = 0;
            let totalRecommended = 0;
            
            for (const slotKey of slots) {
                const current = getCurrentGearData(slotKey);
                if (current) {
                    totalCurrent += current.effectiveValue;
                    
                    const state = recommendationState.slots[slotKey];
                    if (state && state.selectedGear) {
                        const allGear = getAllGearForSlot(slotKey);
                        const selectedGear = allGear.find(g => g.name === state.selectedGear);
                        if (selectedGear) {
                            const recEffective = calculateEffectiveMS(baseMarchSize, selectedGear.stats, state.selectedLevel, state.selectedQuality);
                            totalRecommended += recEffective;
                        } else {
                            totalRecommended += current.effectiveValue;
                        }
                    } else {
                        totalRecommended += current.effectiveValue;
                    }
                }
            }
            
            return { totalCurrent, totalRecommended };
        }
        
        // Generate SoP title selector HTML
        const titleOptionsHtml = Object.entries(MARCH_SIZE_DATA.sopTitles).map(([key, data]) => 
            `<option value="${key}" ${key === recommendationState.selectedTitle ? 'selected' : ''}>
                ${data.name} (+${formatNumber(data.marchSize)})
            </option>`
        ).join('');
        
        // Generate HTML for all slots
        const slotsHtml = slots.map(slot => renderOptimizationSlot(slot)).join('');
        
        // Calculate initial totals
        const { totalCurrent, totalRecommended } = calculateTotals();
        const potentialGain = totalRecommended - totalCurrent;
        
        elements.recommendationsGrid.innerHTML = `
            <div class="ms-optimization-guide">
                <div class="ms-opt-intro">
                    <h3>Gear Optimization Guide</h3>
                    <p>Compare your equipped gear with recommended alternatives. Adjust selections to see real-time impact.</p>
                </div>
                
                <div class="ms-opt-title-section">
                    <div class="ms-opt-title-card">
                        <div class="ms-opt-title-icon">
                            <img src="resources/research/icon_research_march_size_vs_sop.png" alt="Title">
                        </div>
                        <div class="ms-opt-title-controls">
                            <label>SoP Attacker Title</label>
                            <select id="msOptTitleSelect" class="ms-opt-title-select">
                                ${titleOptionsHtml}
                            </select>
                        </div>
                        <div class="ms-opt-title-bonus">
                            <span class="ms-opt-title-bonus__label">Title Bonus</span>
                            <span class="ms-opt-title-bonus__value" id="msOptTitleBonus">+${formatNumber(recommendationState.titleBonus)}</span>
                        </div>
                    </div>
                    <div class="ms-opt-base-info">
                        <span>Base March Size: <strong id="msOptBaseMarch">${formatNumber(baseMarchSize)}</strong></span>
                    </div>
                </div>
                
                <div class="ms-opt-slots">
                    ${slotsHtml}
                </div>
                
                <div class="ms-opt-summary" id="msOptSummary">
                    <div class="ms-opt-summary__row">
                        <span>Current Gear Contribution:</span>
                        <span class="ms-opt-summary__value" id="msOptCurrentTotal">+${formatNumber(totalCurrent)}</span>
                    </div>
                    <div class="ms-opt-summary__row">
                        <span>Recommended Contribution:</span>
                        <span class="ms-opt-summary__value ms-opt-summary__value--optimized" id="msOptRecTotal">+${formatNumber(totalRecommended)}</span>
                    </div>
                    ${potentialGain > 0 ? `
                        <div class="ms-opt-summary__row ms-opt-summary__row--gain" id="msOptGainRow">
                            <span>Potential Gain:</span>
                            <span class="ms-opt-summary__value ms-opt-summary__value--gain" id="msOptGainValue">+${formatNumber(potentialGain)}</span>
                        </div>
                    ` : `<div class="ms-opt-summary__row" id="msOptGainRow" style="display:none;">
                            <span>Potential Gain:</span>
                            <span class="ms-opt-summary__value ms-opt-summary__value--gain" id="msOptGainValue">+0</span>
                        </div>`}
                </div>
            </div>
        `;
        
        // Attach event listeners for interactivity
        setupOptimizationEventListeners();
    }
    
    // Setup event listeners for optimization guide interactivity
    function setupOptimizationEventListeners() {
        const slots = ['helmet', 'chest', 'pants', 'weapon', 'ring', 'boots', 'dragonTrinket', 'trinket'];
        
        // Title change listener
        const titleSelect = document.getElementById('msOptTitleSelect');
        if (titleSelect) {
            titleSelect.addEventListener('change', function() {
                recommendationState.selectedTitle = this.value;
                recommendationState.titleBonus = MARCH_SIZE_DATA.sopTitles[this.value]?.marchSize || 0;
                
                // Update title bonus display
                const bonusEl = document.getElementById('msOptTitleBonus');
                if (bonusEl) {
                    bonusEl.textContent = '+' + formatNumber(recommendationState.titleBonus);
                }
                
                // Full recalculation needed as base march size changes
                recalculateAndUpdateOptimization();
            });
        }
        
        // Slot gear/level/quality change listeners
        for (const slot of slots) {
            const gearSelect = document.getElementById(`msOptGear-${slot}`);
            const levelSelect = document.getElementById(`msOptLevel-${slot}`);
            const qualitySelect = document.getElementById(`msOptQuality-${slot}`);
            
            if (gearSelect) {
                gearSelect.addEventListener('change', function() {
                    recommendationState.slots[slot].selectedGear = this.value;
                    updateSlotDisplay(slot);
                    updateSummaryTotals();
                });
            }
            
            if (levelSelect) {
                levelSelect.addEventListener('change', function() {
                    recommendationState.slots[slot].selectedLevel = parseInt(this.value);
                    updateSlotDisplay(slot);
                    updateSummaryTotals();
                });
            }
            
            if (qualitySelect) {
                qualitySelect.addEventListener('change', function() {
                    recommendationState.slots[slot].selectedQuality = this.value;
                    updateSlotDisplay(slot);
                    updateSummaryTotals();
                });
            }
        }
    }
    
    // Update a single slot's display after change
    function updateSlotDisplay(slotKey) {
        const baseMarchSize = recommendationState.baseMarchSize;
        const state = recommendationState.slots[slotKey];
        const slotData = MARCH_SIZE_DATA.gear[slotKey];
        
        // Get current equipped gear
        const select = document.getElementById(`msGearSelect-${slotKey}`);
        const qualitySelect = document.getElementById(`msGearQuality-${slotKey}`);
        const levelSelect = document.getElementById(`msGearLevelSelect-${slotKey}`);
        
        if (!select || !select.value) return;
        
        const currentName = select.value;
        const currentQuality = qualitySelect?.value || 'legendary';
        const currentLevel = parseInt(levelSelect?.value) || 40;
        
        const selectedOption = select.options[select.selectedIndex];
        const currentBaseMs = parseFloat(selectedOption?.dataset?.baseMs) || 0;
        const currentBasePct = parseFloat(selectedOption?.dataset?.basePct) || 0;
        const currentStats = { marchSize: currentBaseMs, marchSizePct: currentBasePct };
        const currentEffective = calculateEffectiveMS(baseMarchSize, currentStats, currentLevel, currentQuality);
        
        // Get recommended gear data
        const recGearData = slotData?.[state.selectedGear];
        const recStats = recGearData?.stats?.legendary || { marchSize: 0, marchSizePct: 0 };
        const recEffective = calculateEffectiveMS(baseMarchSize, recStats, state.selectedLevel, state.selectedQuality);
        
        // Check if same as current
        const isSameAsCurrent = state.selectedGear === currentName 
            && state.selectedLevel === currentLevel 
            && state.selectedQuality === currentQuality;
        
        // Calculate gain
        const slotGain = recEffective - currentEffective;
        const gainDisplay = slotGain >= 0 ? `+${formatNumber(slotGain)}` : formatNumber(slotGain);
        const gainClass = slotGain > 0 ? 'ms-opt-gain--positive' : (slotGain < 0 ? 'ms-opt-gain--negative' : 'ms-opt-gain--neutral');
        
        // Update badge and gain
        const slotEl = document.querySelector(`.ms-opt-slot[data-slot="${slotKey}"]`);
        if (slotEl) {
            // Remove old classes
            slotEl.classList.remove('ms-opt-slot--upgrade', 'ms-opt-slot--downgrade', 'ms-opt-slot--same');
            
            // Find and update badge
            const header = slotEl.querySelector('.ms-opt-header');
            if (header) {
                const existingBadge = header.querySelector('.ms-opt-badge');
                if (existingBadge) existingBadge.remove();
                
                let badgeHtml = '';
                if (isSameAsCurrent) {
                    badgeHtml = '<span class="ms-opt-badge ms-opt-badge--same">= Same</span>';
                    slotEl.classList.add('ms-opt-slot--same');
                } else if (recEffective > currentEffective) {
                    badgeHtml = '<span class="ms-opt-badge ms-opt-badge--upgrade">⬆ Upgrade</span>';
                    slotEl.classList.add('ms-opt-slot--upgrade');
                } else if (recEffective < currentEffective) {
                    badgeHtml = '<span class="ms-opt-badge ms-opt-badge--downgrade">⬇ Downgrade</span>';
                    slotEl.classList.add('ms-opt-slot--downgrade');
                } else {
                    badgeHtml = '<span class="ms-opt-badge ms-opt-badge--current">No Change</span>';
                }
                header.insertAdjacentHTML('beforeend', badgeHtml);
                
                // Update gain display
                const gainEl = document.getElementById(`msOptGain-${slotKey}`);
                if (gainEl) {
                    gainEl.textContent = gainDisplay;
                    gainEl.className = `ms-opt-header__gain ${gainClass}`;
                }
            }
        }
        
        // Update image
        const imgContainer = document.getElementById(`msOptImg-${slotKey}`);
        if (imgContainer && recGearData) {
            const recImgSrc = recGearData.img?.startsWith('resources/') 
                ? recGearData.img 
                : 'resources/' + recGearData.img;
            const recQualityColor = MARCH_SIZE_DATA.qualityColors[state.selectedQuality] || '#E5CC80';
            imgContainer.style.borderColor = recQualityColor;
            const img = imgContainer.querySelector('img');
            if (img) {
                img.src = recImgSrc;
                img.alt = state.selectedGear;
            }
        }
        
        // Update effective value
        const effectiveEl = document.getElementById(`msOptEffective-${slotKey}`);
        if (effectiveEl) {
            effectiveEl.textContent = '+' + formatNumber(recEffective);
        }
        
        // Update min requirements - only show levels that can beat
        const minReqsContainer = document.getElementById(`msOptMinReqs-${slotKey}`);
        const qualityColors = MARCH_SIZE_DATA.qualityColors;
        const minReqs = calculateMinQualityPerLevelLocal(currentEffective, recStats, baseMarchSize);
        
        const minReqsItems = [35, 40, 45, 50].map(lvl => {
            const req = minReqs[lvl];
            if (req) {
                const qColor = qualityColors[req.quality] || '#E5CC80';
                const gain = req.effective - currentEffective;
                return `<span class="ms-opt-minreq" style="border-color: ${qColor}; background: ${qColor}15;" 
                    title="Lv.${lvl} ${capitalizeFirst(req.quality)}: +${formatNumber(req.effective)} (+${formatNumber(gain)} gain)">
                    <span class="ms-opt-minreq__level">Lv.${lvl}</span>
                    <span class="ms-opt-minreq__quality" style="color: ${qColor}">${capitalizeFirst(req.quality)}</span>
                    <span class="ms-opt-minreq__check">✓</span>
                </span>`;
            }
            return '';
        }).filter(html => html).join('');
        
        if (minReqsContainer) {
            if (minReqsItems) {
                minReqsContainer.style.display = '';
                minReqsContainer.innerHTML = `
                    <span class="ms-opt-minreqs__label">Min. levels to beat current:</span>
                    <div class="ms-opt-minreqs__list">${minReqsItems}</div>
                `;
            } else {
                minReqsContainer.style.display = 'none';
            }
        }
    }
    
    // Helper to calculate min quality per level (outside of generateRecommendations scope)
    function calculateMinQualityPerLevelLocal(targetValue, gearStats, baseMarchSize) {
        const levels = [35, 40, 45, 50];
        const qualities = ['poor', 'common', 'fine', 'exquisite', 'epic', 'legendary'];
        const results = {};
        
        for (const level of levels) {
            results[level] = null;
            for (const quality of qualities) {
                const effective = calculateEffectiveMS(baseMarchSize, gearStats, level, quality);
                if (effective > targetValue) {
                    results[level] = { quality, effective };
                    break;
                }
            }
        }
        return results;
    }
    
    // Update summary totals after slot changes
    function updateSummaryTotals() {
        const slots = ['helmet', 'chest', 'pants', 'weapon', 'ring', 'boots', 'dragonTrinket', 'trinket'];
        const baseMarchSize = recommendationState.baseMarchSize;
        
        let totalCurrent = 0;
        let totalRecommended = 0;
        
        for (const slotKey of slots) {
            // Get current equipped
            const select = document.getElementById(`msGearSelect-${slotKey}`);
            const qualitySelect = document.getElementById(`msGearQuality-${slotKey}`);
            const levelSelect = document.getElementById(`msGearLevelSelect-${slotKey}`);
            
            if (select && select.value) {
                const selectedOption = select.options[select.selectedIndex];
                const quality = qualitySelect?.value || 'legendary';
                const level = parseInt(levelSelect?.value) || 40;
                const baseMs = parseFloat(selectedOption?.dataset?.baseMs) || 0;
                const basePct = parseFloat(selectedOption?.dataset?.basePct) || 0;
                const stats = { marchSize: baseMs, marchSizePct: basePct };
                totalCurrent += calculateEffectiveMS(baseMarchSize, stats, level, quality);
            }
            
            // Get recommended
            const state = recommendationState.slots[slotKey];
            if (state && state.selectedGear) {
                const slotData = MARCH_SIZE_DATA.gear[slotKey];
                const recGearData = slotData?.[state.selectedGear];
                const recStats = recGearData?.stats?.legendary || { marchSize: 0, marchSizePct: 0 };
                totalRecommended += calculateEffectiveMS(baseMarchSize, recStats, state.selectedLevel, state.selectedQuality);
            }
        }
        
        // Update display
        const currentTotalEl = document.getElementById('msOptCurrentTotal');
        const recTotalEl = document.getElementById('msOptRecTotal');
        const gainRowEl = document.getElementById('msOptGainRow');
        const gainValueEl = document.getElementById('msOptGainValue');
        
        if (currentTotalEl) currentTotalEl.textContent = '+' + formatNumber(totalCurrent);
        if (recTotalEl) recTotalEl.textContent = '+' + formatNumber(totalRecommended);
        
        const potentialGain = totalRecommended - totalCurrent;
        if (gainRowEl && gainValueEl) {
            if (potentialGain > 0) {
                gainRowEl.style.display = '';
                gainRowEl.classList.remove('ms-opt-summary__row--loss');
                gainRowEl.classList.add('ms-opt-summary__row--gain');
                gainValueEl.textContent = '+' + formatNumber(potentialGain);
                gainValueEl.classList.remove('ms-opt-summary__value--loss');
                gainValueEl.classList.add('ms-opt-summary__value--gain');
            } else if (potentialGain < 0) {
                gainRowEl.style.display = '';
                gainRowEl.classList.remove('ms-opt-summary__row--gain');
                gainRowEl.classList.add('ms-opt-summary__row--loss');
                gainValueEl.textContent = formatNumber(potentialGain);
                gainValueEl.classList.remove('ms-opt-summary__value--gain');
                gainValueEl.classList.add('ms-opt-summary__value--loss');
            } else {
                gainRowEl.style.display = 'none';
            }
        }
    }
    
    // Full recalculation when title changes
    function recalculateAndUpdateOptimization() {
        // Recalculate base march size with new title
        const results = calculateMarchSizeResults();
        recommendationState.baseMarchSize = results.baseMarchSize || recommendationState.baseMarchSize;
        
        // Update base march size display
        const baseMarchEl = document.getElementById('msOptBaseMarch');
        if (baseMarchEl) {
            baseMarchEl.textContent = formatNumber(recommendationState.baseMarchSize);
        }
        
        // Update all slots
        const slots = ['helmet', 'chest', 'pants', 'weapon', 'ring', 'boots', 'dragonTrinket', 'trinket'];
        for (const slot of slots) {
            updateSlotDisplay(slot);
        }
        
        // Update totals
        updateSummaryTotals();
    }
    
    // Helper to calculate march size results (for title changes)
    function calculateMarchSizeResults() {
        // Get title bonus from optimization state
        const titleBonus = recommendationState.titleBonus;
        
        // Calculate other components using existing logic
        const buildingMS = calculateBuildingMS();
        const armoryMS = calculateArmoryMS();
        const researchMS = calculateResearchMS();
        const heroMS = calculateHeroMS();
        const gearMS = calculateGearMS();
        
        // These functions return objects, extract the appropriate values
        let base = 0;
        let bonusPct = 0;
        
        base += buildingMS.total || 0;
        base += armoryMS.total || 0;
        base += researchMS.flat || 0;
        bonusPct += researchMS.pct || 0;
        base += heroMS.flat || 0;
        bonusPct += heroMS.pct || 0;
        
        const gearFlat = gearMS.flat || 0;
        bonusPct += gearMS.pct || 0;
        
        // Keep Enhancement percentage
        const keepEnhLevel = parseInt(elements.keepEnhancementLevel?.value) || 0;
        if (keepEnhLevel >= 40) {
            bonusPct += 8.0;
        }
        
        const baseForBonus = base + gearFlat + titleBonus;
        const bonus = Math.floor(baseForBonus * (bonusPct / 100));
        const total = baseForBonus + bonus;
        
        // Base march size is everything except gear contribution
        const baseMarchSize = total - gearFlat;
        
        return {
            total: total,
            baseMarchSize: baseMarchSize,
            breakdown: {
                buildings: buildingMS,
                armories: armoryMS,
                research: researchMS,
                heroes: heroMS,
                gear: gearMS,
                title: { flat: titleBonus }
            }
        };
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
            advancedMilitary: { current: 0, max: 5750 } // 750 + 2500 + 2500
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
            const level = parseInt(elements.marchingHeroLevel.value) || 0;
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
        
        // Trigger auto-save (debounced)
        triggerAutoSave();
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
    // DATA STORAGE & PERSISTENCE
    // ============================================
    
    const STORAGE_KEY = 'gotc_march_size_data';
    const STORAGE_VERSION = '1.1'; // Bumped to reset defaults (title=none, level=40)
    
    // Gather all current state into a saveable object
    function gatherCurrentState() {
        const state = {
            version: STORAGE_VERSION,
            timestamp: new Date().toISOString(),
            scenario: currentScenario,
            
            // Buildings
            buildings: {
                keep: parseInt(elements.keepLevel?.value) || 0,
                trainingYard: parseInt(elements.trainingYardLevel?.value) || 0,
                greatHall: parseInt(elements.greatHallLevel?.value) || 0,
                watchtower: parseInt(elements.watchtowerLevel?.value) || 0,
                keepEnhancement: parseInt(elements.keepEnhancementLevel?.value) || 0
            },
            
            // Research
            research: {},
            
            // Armories
            armories: {},
            
            // Heroes
            heroes: {},
            
            // Gear
            gear: {},
            
            // SoP Title
            title: document.getElementById('msTitleSelect')?.value || 'none'
        };
        
        // Gather research values
        if (elements.researchSliders) {
            Object.entries(elements.researchSliders).forEach(([key, slider]) => {
                if (slider) {
                    state.research[key] = parseInt(slider.value) || 0;
                }
            });
        }
        
        // Gather armory values
        if (elements.armoryInputs) {
            elements.armoryInputs.forEach(input => {
                const armoryId = input.dataset.armory;
                if (armoryId) {
                    state.armories[armoryId] = parseInt(input.value) || 0;
                }
            });
        }
        
        // Gather hero selections
        const heroPositions = ['hand', 'war', 'coin', 'whispers', 'law', 'ships', 'commander', 'maester'];
        heroPositions.forEach(position => {
            const select = document.getElementById(`msHeroSelect-${position}`);
            const slider = document.getElementById(`msHeroLevel-${position}`);
            if (select) {
                state.heroes[position] = {
                    id: select.value || '',
                    level: parseInt(slider?.value) || 1
                };
            }
        });
        
        // Gather gear selections
        const gearSlots = ['helmet', 'chest', 'pants', 'weapon', 'ring', 'boots', 'dragonTrinket', 'trinket'];
        gearSlots.forEach(slot => {
            const select = document.getElementById(`msGearSelect-${slot}`);
            const qualitySelect = document.getElementById(`msGearQuality-${slot}`);
            const levelSelect = document.getElementById(`msGearLevelSelect-${slot}`);
            if (select) {
                state.gear[slot] = {
                    name: select.value || '',
                    quality: qualitySelect?.value || 'legendary',
                    level: parseInt(levelSelect?.value) || 40
                };
            }
        });
        
        return state;
    }
    
    // Apply saved state to UI
    function applyState(state) {
        if (!state || state.version !== STORAGE_VERSION) {
            console.log('No valid saved state found or version mismatch');
            return false;
        }
        
        try {
            // Apply scenario
            if (state.scenario) {
                currentScenario = state.scenario;
                const scenarioCard = document.querySelector(`.ms-scenario-card[data-scenario="${state.scenario}"]`);
                if (scenarioCard) {
                    document.querySelectorAll('.ms-scenario-card').forEach(c => c.classList.remove('active'));
                    scenarioCard.classList.add('active');
                }
            }
            
            // Apply buildings
            if (state.buildings) {
                if (elements.keepLevel && state.buildings.keep !== undefined) {
                    elements.keepLevel.value = state.buildings.keep;
                    updateBuildingSliderDisplay('msKeepLevel', 'msKeepLevelDisplay', 'keep');
                }
                if (elements.trainingYardLevel && state.buildings.trainingYard !== undefined) {
                    elements.trainingYardLevel.value = state.buildings.trainingYard;
                    updateBuildingSliderDisplay('msTrainingYardLevel', 'msTrainingYardLevelDisplay', 'trainingYard');
                }
                if (elements.greatHallLevel && state.buildings.greatHall !== undefined) {
                    elements.greatHallLevel.value = state.buildings.greatHall;
                    updateBuildingSliderDisplay('msGreatHallLevel', 'msGreatHallLevelDisplay', 'greatHall');
                }
                if (elements.watchtowerLevel && state.buildings.watchtower !== undefined) {
                    elements.watchtowerLevel.value = state.buildings.watchtower;
                    updateBuildingSliderDisplay('msWatchtowerLevel', 'msWatchtowerLevelDisplay', 'watchtower');
                }
                if (elements.keepEnhancementLevel && state.buildings.keepEnhancement !== undefined) {
                    elements.keepEnhancementLevel.value = state.buildings.keepEnhancement;
                    updateBuildingSliderDisplay('msKeepEnhancementLevel', 'msKeepEnhancementLevelDisplay', 'keepEnhancement');
                }
            }
            
            // Apply research
            if (state.research && elements.researchSliders) {
                Object.entries(state.research).forEach(([key, value]) => {
                    const slider = elements.researchSliders[key];
                    if (slider) {
                        slider.value = value;
                        updateResearchSliderDisplay(key);
                    }
                });
            }
            
            // Apply armories
            if (state.armories && elements.armoryInputs) {
                elements.armoryInputs.forEach(input => {
                    const armoryId = input.dataset.armory;
                    if (armoryId && state.armories[armoryId] !== undefined) {
                        input.value = state.armories[armoryId];
                        updateArmorySliderDisplay(input);
                    }
                });
            }
            
            // Apply heroes
            if (state.heroes) {
                Object.entries(state.heroes).forEach(([position, heroData]) => {
                    const select = document.getElementById(`msHeroSelect-${position}`);
                    const slider = document.getElementById(`msHeroLevel-${position}`);
                    const imgElement = document.getElementById(`msHeroImg-${position}`);
                    const slotElement = document.querySelector(`.ms-hero-slot[data-position="${position}"]`);
                    
                    if (select && heroData.id) {
                        select.value = heroData.id;
                        
                        // Get hero info from data
                        const heroInfo = MARCH_SIZE_DATA.heroes.heroList[heroData.id];
                        
                        // Update hero image
                        if (imgElement && heroInfo) {
                            imgElement.src = heroInfo.img.startsWith('resources/') ? heroInfo.img : 'resources/' + heroInfo.img;
                            imgElement.classList.add('has-hero');
                        }
                        
                        // Update quality styling
                        if (slotElement && heroInfo) {
                            slotElement.classList.add('hero-selected');
                            slotElement.classList.remove('hero-exquisite', 'hero-legendary');
                            if (heroInfo.quality === 'legendary') {
                                slotElement.classList.add('hero-legendary');
                            } else if (heroInfo.quality === 'exquisite') {
                                slotElement.classList.add('hero-exquisite');
                            }
                        }
                        
                        // Set slider max based on hero's maxLevel, then set value
                        if (slider && heroInfo) {
                            slider.disabled = false;
                            slider.max = heroInfo.maxLevel || 60;
                            // Clamp saved level to current max
                            const level = Math.min(heroData.level || 0, heroInfo.maxLevel || 60);
                            slider.value = level;
                        }
                        
                        // Update level display
                        updateHeroLevelDisplay(position);
                    }
                });
            }
            
            // Apply gear
            if (state.gear) {
                Object.entries(state.gear).forEach(([slot, gearData]) => {
                    const select = document.getElementById(`msGearSelect-${slot}`);
                    const qualitySelect = document.getElementById(`msGearQuality-${slot}`);
                    const levelSelect = document.getElementById(`msGearLevelSelect-${slot}`);
                    
                    if (select && gearData.name) {
                        select.value = gearData.name;
                        
                        // Get gear data from MARCH_SIZE_DATA to update image
                        const gearInfo = MARCH_SIZE_DATA.gear[slot] && MARCH_SIZE_DATA.gear[slot][gearData.name];
                        if (gearInfo && gearInfo.img) {
                            updateGearImage(slot, gearInfo.img);
                        }
                    }
                    if (qualitySelect && gearData.quality) {
                        qualitySelect.value = gearData.quality;
                        // Update quality styling/color
                        updateGearSlotQuality(slot, gearData.quality);
                    }
                    if (levelSelect && gearData.level) {
                        levelSelect.value = gearData.level;
                    }
                    
                    // Update bonus display
                    updateGearBonusDisplay(slot);
                });
            }
            
            // Apply SoP title
            if (state.title) {
                const titleSelect = document.getElementById('msTitleSelect');
                if (titleSelect) {
                    titleSelect.value = state.title;
                    updateTitleDisplay();
                }
            }
            
            // Update all section totals
            updateAllSectionTotals();
            
            console.log('State loaded successfully');
            return true;
        } catch (error) {
            console.error('Error applying state:', error);
            return false;
        }
    }
    
    // Save to localStorage
    function saveToLocalStorage() {
        try {
            const state = gatherCurrentState();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            console.log('Saved to localStorage');
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }
    
    // Load from localStorage
    function loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const state = JSON.parse(savedData);
                return applyState(state);
            }
            return false;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return false;
        }
    }
    
    // Export to JSON file
    function exportToJsonFile() {
        try {
            const state = gatherCurrentState();
            const jsonString = JSON.stringify(state, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `march-size-config-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showStorageNotification('Configuration exported successfully!', 'success');
            return true;
        } catch (error) {
            console.error('Error exporting to JSON:', error);
            showStorageNotification('Error exporting configuration', 'error');
            return false;
        }
    }
    
    // Import from JSON file
    function importFromJsonFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const state = JSON.parse(e.target.result);
                    if (applyState(state)) {
                        saveToLocalStorage(); // Also save to localStorage
                        showStorageNotification('Configuration imported successfully!', 'success');
                        resolve(true);
                    } else {
                        showStorageNotification('Invalid configuration file', 'error');
                        resolve(false);
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    showStorageNotification('Error reading configuration file', 'error');
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                showStorageNotification('Error reading file', 'error');
                reject(reader.error);
            };
            
            reader.readAsText(file);
        });
    }
    
    // Show notification for storage operations
    function showStorageNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.ms-storage-notification');
        if (existingNotification) existingNotification.remove();
        
        const notification = document.createElement('div');
        notification.className = `ms-storage-notification ms-storage-notification--${type}`;
        notification.innerHTML = `
            <span class="ms-storage-notification__icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
            <span class="ms-storage-notification__message">${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Setup storage UI event listeners (buttons are in header HTML)
    function setupStorageUI() {
        // Setup event listeners for header storage buttons
        document.getElementById('msSaveConfigHeader')?.addEventListener('click', () => {
            if (saveToLocalStorage()) {
                showStorageNotification('Configuration saved!', 'success');
            }
        });
        
        document.getElementById('msExportConfigHeader')?.addEventListener('click', exportToJsonFile);
        
        // Import button triggers hidden file input
        document.getElementById('msImportConfigHeader')?.addEventListener('click', () => {
            document.getElementById('msImportFileHeader')?.click();
        });
        
        document.getElementById('msImportFileHeader')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await importFromJsonFile(file);
                e.target.value = ''; // Reset file input
            }
        });
    }
    
    // Show/hide storage buttons in header based on calculator mode
    function updateStorageVisibility(isMarSizeMode) {
        const storageTrigger = document.getElementById('msStorageTrigger');
        if (storageTrigger) {
            storageTrigger.style.display = isMarSizeMode ? 'flex' : 'none';
        }
    }
    
    // Auto-save on changes (debounced)
    let autoSaveTimeout = null;
    function triggerAutoSave() {
        if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            saveToLocalStorage();
        }, 2000); // Save 2 seconds after last change
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
        resetCalculator,
        saveToLocalStorage,
        loadFromLocalStorage,
        exportToJsonFile,
        importFromJsonFile
    };

})();

