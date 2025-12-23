/**
 * Wizard UI Navigation and Logic
 * Handles step navigation, validation, and transitions
 */

(function() {
    'use strict';

    const WIZARD_STEPS = 3;
    let currentStep = 1;

    // DOM Elements
    const elements = {
        progressSteps: null,
        wizardSteps: null,
        prevBtn: null,
        nextBtn: null,
        calculateBtn: null,
        newCalcBtn: null,
        connectors: null
    };

    /**
     * Initialize wizard when DOM is ready
     */
    function init() {
        // Cache DOM elements - scoped to template calculator only
        const templateSection = document.getElementById('templateCalculator');
        
        // Only select elements within the template calculator section
        elements.progressSteps = templateSection?.querySelectorAll('.wizard-progress__step') || 
                                 document.querySelectorAll('#templateCalculator .wizard-progress__step, .wizard-progress:not(.ms-progress) .wizard-progress__step');
        elements.wizardSteps = templateSection?.querySelectorAll('.wizard-step') || 
                              document.querySelectorAll('#templateCalculator .wizard-step');
        elements.connectors = templateSection?.querySelectorAll('.wizard-progress__connector') ||
                             document.querySelectorAll('#templateCalculator .wizard-progress__connector, .wizard-progress:not(.ms-progress) .wizard-progress__connector');
        elements.prevBtn = document.getElementById('wizardPrev');
        elements.nextBtn = document.getElementById('wizardNext');
        elements.calculateBtn = document.getElementById('calculateWithPreferences');
        elements.newCalcBtn = document.getElementById('wizardNewCalc');

        if (!elements.progressSteps.length || !elements.wizardSteps.length) {
            console.warn('Wizard elements not found');
            return;
        }

        // Bind events
        bindEvents();

        // Initialize first step
        updateWizardState();
    }

    /**
     * Bind event listeners
     */
    function bindEvents() {
        // Navigation buttons
        elements.prevBtn?.addEventListener('click', goToPrevStep);
        elements.nextBtn?.addEventListener('click', goToNextStep);
        elements.newCalcBtn?.addEventListener('click', startNewCalculation);

        // Progress step clicks
        elements.progressSteps.forEach((step, index) => {
            step.addEventListener('click', () => {
                const targetStep = index + 1;
                // Allow going to any step (completed, current, or next)
                // But not beyond step 2 unless on results (step 3 requires calculate)
                if (targetStep <= 2 || currentStep === 3) {
                    goToStep(targetStep);
                }
            });
        });

        // Calculate button - craftparse.js handles the actual calculation
        // and will call wizardShowResults() when done
        // We don't need an extra handler here since craftparse.js handles everything

        // Accordion toggles in settings
        document.querySelectorAll('.settings-card__header .accordion-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', !isExpanded);
                
                const targetId = toggle.getAttribute('data-target');
                const content = document.getElementById(targetId);
                if (content) {
                    content.style.display = isExpanded ? 'none' : 'block';
                }
            });
        });

        // Gear materials accordion
        const gearToggle = document.getElementById('toggleAdvMaterials');
        const gearContent = document.getElementById('advMaterials');
        
        if (gearToggle && gearContent) {
            gearToggle.addEventListener('click', () => {
                const isExpanded = gearToggle.getAttribute('aria-expanded') === 'true';
                gearToggle.setAttribute('aria-expanded', !isExpanded);
                gearToggle.classList.toggle('open', !isExpanded);
                gearContent.style.display = isExpanded ? 'none' : 'block';
            });
        }

        // ═══════════════════════════════════════════════════════════════════════
        // STRATEGY SETTINGS EVENT LISTENERS (Dynamic Cascade Updates)
        // ═══════════════════════════════════════════════════════════════════════
        
        // Helper to trigger cascade update with debounce
        function triggerCascadeUpdate() {
            clearTimeout(window._cascadeDebounce);
            window._cascadeDebounce = setTimeout(() => {
                const materials = gatherMaterialsFromInputs();
                
                // Clear any previous calculated results (show preview instead)
                clearCalculatedState();
                
                // Debug: Show what materials were gathered
                const matCount = Object.keys(materials).length;
                const totalMats = Object.values(materials).reduce((a, b) => a + b, 0);
                console.warn(`[DEBUG] triggerCascadeUpdate: ${matCount} materials, total: ${totalMats}`);
                
                if (matCount > 0) {
                    renderCascadeProjection(materials);
                } else {
                    console.warn('[DEBUG] No materials found - skipping projection');
                }
                // Always update material summary
                updateMaterialSummary(materials);
            }, 200);
        }
        
        // Expose clearCalculatedState for external use
        window.clearCalculatedState = clearCalculatedState;
        
        /**
         * Look up material info (name and image) from the global materials object
         * @param {string} matId - Material ID (e.g., 'abalone', 'frozen-heart')
         * @returns {object} - { name: string, img: string }
         */
        function lookupMaterialInfo(matId) {
            // Default fallback
            let displayName = matId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            let imgPath = 'resources/materials/icon_crafting_unknown.webp';
            
            // Check if the global materials object exists (from materials.js)
            // materials.js defines: const materials = {...}
            if (typeof materials !== 'undefined') {
                // Search through all seasons (0, 1, 2, 3, etc.)
                for (const seasonKey of Object.keys(materials)) {
                    const season = materials[seasonKey];
                    if (season && season.mats && season.mats[matId]) {
                        const matData = season.mats[matId];
                        displayName = matData['Original-name'] || displayName;
                        imgPath = matData.img || imgPath;
                        console.log(`[MaterialLookup] Found ${matId}: ${displayName}, img: ${imgPath}`);
                        break;
                    }
                }
            } else {
                console.warn('[MaterialLookup] materials object not found');
            }
            
            return { name: displayName, img: imgPath };
        }
        
        /**
         * Update the material summary display
         * Shows total materials and how much will be used based on slider
         */
        function updateMaterialSummary(materials) {
            const usageSlider = document.getElementById('usageSlider');
            const usagePercent = usageSlider ? parseInt(usageSlider.value) / 100 : 0.6;
            
            // Basic materials list (Season 0) with display names
            const BASIC_MATERIALS_INFO = {
                'black-iron': { name: 'Black Iron', img: 'resources/materials/icon_crafting_blackiron.webp' },
                'copper-bar': { name: 'Copper Bar', img: 'resources/materials/icon_crafting_copper_bar.webp' },
                'dragonglass': { name: 'Dragonglass', img: 'resources/materials/icon_crafting_dragonglass.webp' },
                'goldenheart-wood': { name: 'Goldenheart', img: 'resources/materials/icon_crafting_goldenheart_wood.webp' },
                'hide': { name: 'Hide', img: 'resources/materials/icon_crafting_hide.webp' },
                'ironwood': { name: 'Ironwood', img: 'resources/materials/icon_crafting_ironwood.webp' },
                'kingswood-oak': { name: 'Kingswood Oak', img: 'resources/materials/icon_crafting_kingswood_oak.webp' },
                'leather-straps': { name: 'Leather Straps', img: 'resources/materials/icon_crafting_leather_straps.webp' },
                'milk-of-the-poppy': { name: 'Milk of Poppy', img: 'resources/materials/icon_crafting_milk_of_the_poppy.webp' },
                'silk': { name: 'Silk', img: 'resources/materials/icon_crafting_silk.webp' },
                'weirwood': { name: 'Weirwood', img: 'resources/materials/icon_crafting_weir_wood.webp' },
                'wildfire': { name: 'Wildfire', img: 'resources/materials/icon_crafting_wild_fire.webp' }
            };
            
            const BASIC_MATERIAL_IDS = Object.keys(BASIC_MATERIALS_INFO);
            
            let totalBasic = 0;
            let totalGear = 0;
            const basicMaterials = [];
            const gearMaterials = [];
            
            // Calculate totals and collect individual materials
            if (materials && typeof materials === 'object') {
                for (const [key, value] of Object.entries(materials)) {
                    const matId = key.replace(/^my-/, '');
                    const amount = parseInt(value) || 0;
                    
                    if (amount > 0) {
                        if (BASIC_MATERIAL_IDS.includes(matId)) {
                            totalBasic += amount;
                            const info = BASIC_MATERIALS_INFO[matId];
                            basicMaterials.push({
                                id: matId,
                                name: info.name,
                                img: info.img,
                                total: amount,
                                used: Math.floor(amount * usagePercent),
                                remaining: amount - Math.floor(amount * usagePercent)
                            });
                        } else {
                            totalGear += amount;
                            // Look up material info from the global materials object
                            const matInfo = lookupMaterialInfo(matId);
                            
                            gearMaterials.push({
                                id: matId,
                                name: matInfo.name,
                                img: matInfo.img,
                                total: amount,
                                used: Math.floor(amount * usagePercent),
                                remaining: amount - Math.floor(amount * usagePercent)
                            });
                        }
                    }
                }
            }
            
            // Sort materials by total amount (descending)
            basicMaterials.sort((a, b) => b.total - a.total);
            gearMaterials.sort((a, b) => b.total - a.total);
            
            // Calculate used amounts
            const usedBasic = Math.floor(totalBasic * usagePercent);
            const usedGear = Math.floor(totalGear * usagePercent);
            
            // Format numbers with commas
            const formatNum = (n) => n.toLocaleString();
            
            // Update summary UI elements
            const basicUsedEl = document.getElementById('basicMatsUsed');
            const basicTotalEl = document.getElementById('basicMatsTotal');
            const gearUsedEl = document.getElementById('gearMatsUsed');
            const gearTotalEl = document.getElementById('gearMatsTotal');
            const usageBarFill = document.getElementById('usageBarFill');
            
            if (basicUsedEl) basicUsedEl.textContent = formatNum(usedBasic);
            if (basicTotalEl) basicTotalEl.textContent = formatNum(totalBasic);
            if (gearUsedEl) gearUsedEl.textContent = formatNum(usedGear);
            if (gearTotalEl) gearTotalEl.textContent = formatNum(totalGear);
            
            // Update progress bar
            if (usageBarFill) {
                usageBarFill.style.width = `${usagePercent * 100}%`;
                
                // Change color based on usage level
                usageBarFill.classList.remove('low', 'medium', 'high');
                if (usagePercent <= 0.5) {
                    usageBarFill.classList.add('low');
                } else if (usagePercent <= 0.75) {
                    usageBarFill.classList.add('medium');
                } else {
                    usageBarFill.classList.add('high');
                }
            }
            
            // Update detailed breakdown
            updateMaterialDetailGrid('basicMaterialsGrid', basicMaterials);
            updateMaterialDetailGrid('gearMaterialsGrid', gearMaterials);
            
            // Show/hide gear materials section
            const gearSection = document.getElementById('gearMaterialsSection');
            if (gearSection) {
                gearSection.style.display = gearMaterials.length > 0 ? 'block' : 'none';
            }
            
            // Show/hide summary based on whether there are materials
            const summaryEl = document.getElementById('materialSummary');
            if (summaryEl) {
                summaryEl.style.display = (totalBasic > 0 || totalGear > 0) ? 'block' : 'none';
            }
            
            // Calculate and display template estimates
            if (basicMaterials.length > 0) {
                // Find the bottleneck material (minimum amount)
                const minMat = basicMaterials.reduce((min, mat) => mat.total < min.total ? mat : min, basicMaterials[0]);
                const usableMinMat = Math.floor(minMat.total * usagePercent);
                
                // Each template piece needs ~24 materials per slot (avg for L10)
                const COST_PER_MAT_SLOT = 24;
                const estimatedL10 = Math.floor(usableMinMat / COST_PER_MAT_SLOT);
                
                // Calculate cascade projections
                const CASCADE_RATE = 0.43 + (1 - 0.43) / 16; // ~46% effective with combining
                const l15 = Math.floor(estimatedL10 * CASCADE_RATE);
                const l20 = Math.floor(l15 * CASCADE_RATE);
                const l25 = Math.floor(l20 * CASCADE_RATE);
                const l30 = Math.floor(l25 * CASCADE_RATE);
                const l35 = Math.floor(l30 * CASCADE_RATE);
                const l40 = Math.floor(l35 * CASCADE_RATE);
                const l45 = Math.floor(l40 * CASCADE_RATE);
                
                // Template estimate removed from UI - data still calculated above
            }
        }
        
        /**
         * Update a material detail grid with individual material rows
         */
        function updateMaterialDetailGrid(gridId, materials) {
            const grid = document.getElementById(gridId);
            if (!grid) return;
            
            if (materials.length === 0) {
                grid.innerHTML = '<div class="material-row"><span class="material-row__name" style="opacity: 0.5;">No materials entered</span></div>';
                return;
            }
            
            const formatNum = (n) => n.toLocaleString();
            
            grid.innerHTML = materials.map(mat => `
                <div class="material-row">
                    <span class="material-row__name">
                        <img src="${mat.img}" alt="${mat.name}" class="material-row__icon" onerror="this.style.display='none'">
                        ${mat.name}
                    </span>
                    <span class="material-row__usage">
                        <span class="material-row__used">${formatNum(mat.used)}</span>
                        <span class="material-row__separator">/</span>
                        <span class="material-row__total">${formatNum(mat.total)}</span>
                    </span>
                    <span class="material-row__remaining ${mat.remaining === 0 ? 'zero' : ''}">
                        ${mat.remaining > 0 ? '+' + formatNum(mat.remaining) : '0'} left
                    </span>
                </div>
            `).join('');
        }
        
        /**
         * Setup material detail toggle
         */
        function setupMaterialDetailToggle() {
            const toggleBtn = document.getElementById('materialDetailToggle');
            const detailSection = document.getElementById('materialDetail');
            
            if (toggleBtn && detailSection) {
                toggleBtn.addEventListener('click', () => {
                    const isExpanded = detailSection.style.display !== 'none';
                    detailSection.style.display = isExpanded ? 'none' : 'block';
                    toggleBtn.classList.toggle('open', !isExpanded);
                    const spanEl = toggleBtn.querySelector('span');
                    if (spanEl) spanEl.textContent = isExpanded ? 'Details' : 'Hide';
                });
            }
        }
        
        // Setup toggle after DOM ready
        setTimeout(setupMaterialDetailToggle, 100);
        
        // Expose for external use
        window.updateMaterialSummary = updateMaterialSummary;
        
        // Usage slider - update live
        const usageSlider = document.getElementById('usageSlider');
        const usageValue = document.getElementById('usageValue');
        if (usageSlider && usageValue) {
            usageSlider.addEventListener('input', () => {
                usageValue.textContent = usageSlider.value + '%';
                // Update material summary immediately (no debounce needed for display)
                const materials = gatherMaterialsFromInputs();
                updateMaterialSummary(materials);
                // Trigger full cascade update (debounced)
                triggerCascadeUpdate();
            });
        }

        // Season Gear Quick Select Buttons
        const gearSelectL20Plus = document.getElementById('gearSelectL20Plus');
        const gearSelectAll = document.getElementById('gearSelectAll');
        const gearSelectNone = document.getElementById('gearSelectNone');
        
        const updateGearLevelButtons = (selectedLevels) => {
            const select = document.getElementById('gearMaterialLevels');
            const dropdown = document.querySelector('#gearLevelsContainer .level-dropdown--inline');
            if (!select || !dropdown) return;
            
            Array.from(select.options).forEach(opt => {
                const level = parseInt(opt.value, 10);
                const isSelected = selectedLevels.includes(level);
                opt.selected = isSelected;
                const divOpt = dropdown.querySelector(`div[data-value="${opt.value}"]`);
                if (divOpt) {
                    divOpt.classList.toggle('selected', isSelected);
                }
            });
            triggerCascadeUpdate();
        };
        
        if (gearSelectL20Plus) {
            gearSelectL20Plus.addEventListener('click', () => {
                updateGearLevelButtons([20, 25, 30, 35, 40, 45]);
            });
        }
        
        if (gearSelectAll) {
            gearSelectAll.addEventListener('click', () => {
                updateGearLevelButtons([5, 10, 15, 20, 25, 30, 35, 40, 45]);
            });
        }
        
        if (gearSelectNone) {
            gearSelectNone.addEventListener('click', () => {
                updateGearLevelButtons([]);
            });
        }

        // CTW Checkbox Controls
        const includeWarlordsCheckbox = document.getElementById('includeWarlords');
        const level20OnlyWarlordsCheckbox = document.getElementById('level20OnlyWarlords');
        const l20OnlyLabel = document.getElementById('l20OnlyLabel');
        
        // Function to update L20 only checkbox state based on Include CTW
        const updateL20OnlyState = () => {
            if (includeWarlordsCheckbox) {
                const isIncluded = includeWarlordsCheckbox.checked;
                // Handle both old and new label structure
                if (l20OnlyLabel) {
                    l20OnlyLabel.classList.toggle('disabled', !isIncluded);
                }
                if (level20OnlyWarlordsCheckbox) {
                    level20OnlyWarlordsCheckbox.disabled = !isIncluded;
                    if (!isIncluded) {
                        level20OnlyWarlordsCheckbox.checked = false;
                    }
                }
            }
        };
        
        if (includeWarlordsCheckbox) {
            includeWarlordsCheckbox.addEventListener('change', () => {
                updateL20OnlyState();
                triggerCascadeUpdate();
            });
        }
        
        if (level20OnlyWarlordsCheckbox) {
            level20OnlyWarlordsCheckbox.addEventListener('change', () => {
                triggerCascadeUpdate();
            });
        }
        
        // Initialize L20 only state
        updateL20OnlyState();

        // Odds Settings - update cascade on change
        const oddsSettings = ['includeLowOdds', 'includeMediumOdds', 'qualityOddsScoring'];
        oddsSettings.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', triggerCascadeUpdate);
            }
        });

        // Season 0 Priority slider - update cascade on change
        const seasonZeroPriority = document.getElementById('seasonZeroPriority');
        if (seasonZeroPriority) {
            seasonZeroPriority.addEventListener('input', triggerCascadeUpdate);
            seasonZeroPriority.addEventListener('change', triggerCascadeUpdate);
        }

        // Test data dropdown
        const testDataSelect = document.getElementById('testDataSelect');
        if (testDataSelect) {
            testDataSelect.addEventListener('change', (e) => {
                const scenario = e.target.value;
                if (!scenario) return;
                
                loadTestScenario(scenario);
                
                // Flash success state
                testDataSelect.style.background = 'rgba(39, 174, 96, 0.2)';
                testDataSelect.style.borderColor = 'rgba(39, 174, 96, 0.5)';
                setTimeout(() => {
                    testDataSelect.style.background = '';
                    testDataSelect.style.borderColor = '';
                    testDataSelect.value = ''; // Reset dropdown
                }, 1500);
            });
        }

        // Templates toggle (manual configuration)
        const templatesToggle = document.getElementById('templatesToggle');
        const templatesContent = document.getElementById('templatesContent');
        if (templatesToggle && templatesContent) {
            templatesToggle.addEventListener('click', () => {
                const isExpanded = templatesToggle.getAttribute('aria-expanded') === 'true';
                templatesToggle.setAttribute('aria-expanded', !isExpanded);
                templatesContent.style.display = isExpanded ? 'none' : 'block';
            });
        }

        // Global popover element that gets appended to body
        let activePopover = null;
        
        // Helper function to position and show popover
        function showPopover(btn) {
            const wrapper = btn.closest('.info-btn-wrapper');
            const sourcePopover = wrapper?.querySelector('.info-popover');
            
            if (!sourcePopover) return;
            
            // Close any existing popover
            closeAllPopovers();
            
            // Create a clone of the popover and append to body
            // This ensures it's not clipped by any parent overflow
            activePopover = sourcePopover.cloneNode(true);
            activePopover.style.display = 'block';
            activePopover.style.visibility = 'hidden';
            document.body.appendChild(activePopover);
            
            const btnRect = btn.getBoundingClientRect();
            const popoverRect = activePopover.getBoundingClientRect();
            const popoverHeight = popoverRect.height;
            const popoverWidth = popoverRect.width;
            
            // Calculate position - center horizontally, above the button
            let left = btnRect.left + (btnRect.width / 2) - (popoverWidth / 2);
            let top = btnRect.top - popoverHeight - 8; // 8px gap above button
            
            // If not enough space above, show below
            if (top < 10) {
                top = btnRect.bottom + 8; // 8px gap below button
            }
            
            // Keep within viewport horizontally
            if (left < 10) left = 10;
            if (left + popoverWidth > window.innerWidth - 10) {
                left = window.innerWidth - popoverWidth - 10;
            }
            
            // Keep within viewport vertically
            if (top + popoverHeight > window.innerHeight - 10) {
                top = window.innerHeight - popoverHeight - 10;
            }
            
            activePopover.style.left = left + 'px';
            activePopover.style.top = top + 'px';
            activePopover.style.bottom = 'auto';
            activePopover.style.visibility = 'visible';
            activePopover.classList.add('active');
        }
        
        // Helper to close all popovers
        function closeAllPopovers() {
            if (activePopover && activePopover.parentNode) {
                activePopover.parentNode.removeChild(activePopover);
                activePopover = null;
            }
            // Also hide any inline popovers (shouldn't be visible but just in case)
            document.querySelectorAll('.info-popover.active').forEach(p => {
                p.classList.remove('active');
            });
        }

        // Info button popovers - use event delegation for better handling
        document.addEventListener('click', (e) => {
            const infoBtn = e.target.closest('.info-btn');
            const infoLinkBtn = e.target.closest('.info-link-btn');
            
            if (infoBtn || infoLinkBtn) {
                e.stopPropagation();
                e.preventDefault();
                showPopover(infoBtn || infoLinkBtn);
                return;
            }
            
            // Close popovers when clicking outside
            if (!e.target.closest('.info-popover')) {
                closeAllPopovers();
            }
        }, true); // Use capture phase to catch events before accordion

        // Close popovers on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllPopovers();
            }
        });
        
        // Close popovers on scroll or resize
        window.addEventListener('scroll', closeAllPopovers, true);
        window.addEventListener('resize', closeAllPopovers);

        // Material input focus states
        document.querySelectorAll('.material-item input').forEach(input => {
            input.addEventListener('focus', () => {
                input.closest('.material-item')?.classList.add('focused');
            });
            input.addEventListener('blur', () => {
                input.closest('.material-item')?.classList.remove('focused');
            });
        });

        // Template quality change - update card styling
        document.querySelectorAll('.template-card__quality').forEach(select => {
            const updateCardQuality = () => {
                const card = select.closest('.template-card');
                if (card) {
                    card.setAttribute('data-quality', select.value);
                }
            };
            
            select.addEventListener('change', updateCardQuality);
            // Set initial state
            updateCardQuality();
        });

        // Gear materials input focus states
        const observeGearMaterials = () => {
            document.querySelectorAll('#advMaterials .my-material input').forEach(input => {
                input.addEventListener('focus', () => {
                    input.closest('.my-material')?.classList.add('active');
                });
                input.addEventListener('blur', () => {
                    if (!input.value) {
                        input.closest('.my-material')?.classList.remove('active');
                    }
                });
                input.addEventListener('input', () => {
                    if (input.value) {
                        input.closest('.my-material')?.classList.add('active');
                    }
                });
            });
        };

        // Observe for dynamically added gear materials
        const advMaterials = document.getElementById('advMaterials');
        if (advMaterials) {
            const observer = new MutationObserver(observeGearMaterials);
            observer.observe(advMaterials, { childList: true, subtree: true });
            observeGearMaterials();
        }
    }

    /**
     * Go to a specific step
     */
    function goToStep(step) {
        if (step < 1 || step > WIZARD_STEPS) return;
        
        // Mark all previous steps as completed
        for (let i = 1; i < step; i++) {
            const progressStep = elements.progressSteps[i - 1];
            if (progressStep) {
                progressStep.classList.add('completed');
            }
        }

        // If moving to step 2 (Configure Templates) from step 1
        // Check if we have materials and show appropriate state
        if (step === 2 && currentStep === 1) {
            updatePlannerState();
        }

        currentStep = step;
        updateWizardState();
    }

    /**
     * Go to next step
     */
    function goToNextStep() {
        if (currentStep < WIZARD_STEPS) {
            // Mark current step as completed
            elements.progressSteps[currentStep - 1]?.classList.add('completed');
            
            // If moving from step 1 (Materials) to step 2 (Configure Templates)
            // Check if we have materials and show appropriate state
            if (currentStep === 1) {
                updatePlannerState();
            }
            
            currentStep++;
            updateWizardState();
        }
    }
    
    /**
     * Auto-populate template amounts based on entered materials
     * Reads all material inputs, identifies seasons with materials,
     * and calculates expected template counts for each level
     */
    function autoPopulateTemplatesFromMaterials() {
        // Gather all material amounts from inputs
        const materialAmounts = {};
        const seasonMaterials = {}; // Track materials by season
        
        // Build materialToSeason map from the global materials object
        const matToSeason = {};
        if (typeof materials !== 'undefined') {
            Object.values(materials).forEach(seasonData => {
                const season = seasonData.season;
                Object.keys(seasonData.mats || {}).forEach(mat => {
                    matToSeason[mat] = season;
                    matToSeason[mat.toLowerCase().replace(/\s+/g, '-')] = season;
                });
            });
        }
        
        // Get material season from the map
        const getMaterialSeason = (inputId) => {
            // Remove 'my-' prefix to get material key
            const matKey = inputId.replace(/^my-/, '');
            
            // Check our built map
            if (matToSeason[matKey] !== undefined) {
                return matToSeason[matKey];
            }
            
            // Fallback: check if material name suggests a season
            // Basic materials are season 0
            const basicMaterials = ['black-iron', 'copper-bar', 'dragonglass', 'goldenheart-wood', 
                                   'hide', 'ironwood', 'kingswood-oak', 'leather-straps', 
                                   'milk-of-the-poppy', 'silk', 'weirwood', 'wildfire'];
            if (basicMaterials.includes(matKey)) {
                return 0;
            }
            
            // If not basic, assume it's a seasonal material
            return 1; // Default to season 1 if we can't determine
        };
        
        // Read basic material inputs
        document.querySelectorAll('#yourMaterials .my-material input.numeric-input').forEach(input => {
            const rawValue = input.value;
            const value = parseInt((rawValue || '').replace(/,/g, '')) || 0;
            if (value > 0) {
                materialAmounts[input.id] = value;
                const season = getMaterialSeason(input.id);
                if (!seasonMaterials[season]) {
                    seasonMaterials[season] = [];
                }
                seasonMaterials[season].push({ id: input.id, amount: value });
                console.log(`Basic material: ${input.id} = ${value} (season ${season})`);
            }
        });
        
        // Read gear material inputs
        document.querySelectorAll('#advMaterials .my-material input.numeric-input').forEach(input => {
            const rawValue = input.value;
            const value = parseInt((rawValue || '').replace(/,/g, '')) || 0;
            if (value > 0) {
                materialAmounts[input.id] = value;
                const season = getMaterialSeason(input.id);
                if (!seasonMaterials[season]) {
                    seasonMaterials[season] = [];
                }
                seasonMaterials[season].push({ id: input.id, amount: value });
                console.log(`Gear material: ${input.id} = ${value} (season ${season})`);
            }
        });
        
        console.log('Auto-populate: materials found:', Object.keys(materialAmounts).length, 
                    'season materials:', seasonMaterials);
        
        // Find seasons with materials (excluding season 0 - basic materials)
        const seasonsWithGear = Object.keys(seasonMaterials)
            .map(Number)
            .filter(s => s > 0);
        
        if (seasonsWithGear.length === 0) {
            console.log('No gear materials detected, skipping auto-population');
            return;
        }
        
        // Auto-select gear levels
        const gearLevels = [5, 10, 15, 20, 25, 30, 35, 40, 45];
        const select = document.getElementById('gearMaterialLevels');
        const dropdown = document.querySelector('#gearLevelsContainer .level-dropdown--inline');
        
        if (select && dropdown) {
            Array.from(select.options).forEach(option => {
                const level = parseInt(option.value, 10);
                if (gearLevels.includes(level)) {
                    option.selected = true;
                    const divOpt = dropdown.querySelector(`div[data-value="${option.value}"]`);
                    if (divOpt) {
                        divOpt.classList.add('selected');
                    }
                }
            });
        }
        
        // Find the minimum seasonal material amount (bottleneck)
        let minSeasonalAmount = Infinity;
        for (const season of seasonsWithGear) {
            for (const mat of seasonMaterials[season]) {
                if (mat.amount < minSeasonalAmount) {
                    minSeasonalAmount = mat.amount;
                }
            }
        }
        
        if (minSeasonalAmount === Infinity || minSeasonalAmount <= 0) {
            return;
        }
        
        // ===========================================
        // CRAFTING LOGIC BASED ON GAME MECHANICS
        // ===========================================
        // 
        // Crafting Flow:
        // 1. Levels 1-10: 100% success rate
        // 2. Level 15+: Variable success rates when using Exquisite materials:
        //    - Legendary: ~40% (direct success)
        //    - Epic: ~6-9% (partial fail)
        //    - Exquisite: ~53-55% (fail but keep quality)
        // 
        // Combining mechanic (4:1 ratio):
        //    - 4 Exquisite → 1 Epic
        //    - 4 Epic → 1 Legendary
        // 
        // Effective Legendary rate = Direct% + (Epic%/4) + (Exquisite%/16)
        // 
        // Quality multipliers: Poor=1, Common=4, Fine=16, Exquisite=64, Epic=256, Legendary=1024
        
        // ═══════════════════════════════════════════════════════════════════════
        // CRAFTING ODDS - VERIFIED VIA ADB SCREENSHOTS (December 2025)
        // ═══════════════════════════════════════════════════════════════════════
        // KEY FINDING: Odds depend on NUMBER OF MATERIALS, not level!
        // Seasonal gear = 4 materials, Basic gear varies (2-4)
        // ═══════════════════════════════════════════════════════════════════════
        
        const useCraftingData = typeof CRAFTING_DATA !== 'undefined';
        
        // Verified odds by material count (Exquisite/Purple input)
        const FALLBACK_ODDS_EXQUISITE = {
            2: { legendary: 0.3636, epic: 0.0909, exquisite: 0.5455, fine: 0 },
            3: { legendary: 0.40, epic: 0.0667, exquisite: 0.5333, fine: 0 },
            4: { legendary: 0.4211, epic: 0.0526, exquisite: 0.5263, fine: 0 }
        };
        
        // Verified odds by material count (Fine/Blue input)
        const FALLBACK_ODDS_FINE = {
            2: { legendary: 0.2857, epic: 0.0714, exquisite: 0.1429, fine: 0.50 },
            3: { legendary: 0.3333, epic: 0.0556, exquisite: 0.1111, fine: 0.50 },
            4: { legendary: 0.3636, epic: 0.0455, exquisite: 0.0909, fine: 0.50 }
        };
        
        // Get effective legendary rate by material count
        // Accounts for 4:1 combining: effective = legendary + epic/4 + exquisite/16 + fine/64
        const getEffectiveLegendaryRate = (materialCount = 4, inputQuality = 'exquisite') => {
            if (useCraftingData) {
                return CRAFTING_DATA.calculateEffectiveRateByMaterials(materialCount, inputQuality) || 0.40;
            }
            // Fallback to verified inline rates
            const oddsTable = inputQuality === 'fine' ? FALLBACK_ODDS_FINE : FALLBACK_ODDS_EXQUISITE;
            const odds = oddsTable[materialCount] || oddsTable[4];
            return odds.legendary + (odds.epic / 4) + (odds.exquisite / 16) + (odds.fine / 64);
        };
        
        // Material costs per template at each level (from game binaries)
        const seasonalMaterialCosts = useCraftingData ? CRAFTING_DATA.materialCosts : {
            15: 120,
            20: 400,
            25: 1200,
            30: 3000,
            35: 12000,
            40: 45000,
            45: 120000
        };
        
        // Calculate how many Legendary templates at each level
        // Strategy: Use materials efficiently across levels
        let remainingMaterials = minSeasonalAmount;
        const templateEstimates = {};
        
        // Seasonal gear uses 4 materials
        const materialCount = 4;
        // Default to exquisite (purple) materials - most common for high-level crafting
        const inputQuality = 'exquisite';
        
        // Calculate for each level (user typically wants highest levels)
        // Prioritize from highest to lowest
        const levels = [45, 40, 35, 30, 25, 20];
        
        for (const level of levels) {
            const materialCost = seasonalMaterialCosts[level];
            const effectiveRate = getEffectiveLegendaryRate(materialCount, inputQuality);
            
            // Materials needed per Legendary template = baseCost / effectiveRate
            // (accounting for materials lost to failed crafts that get combined)
            const materialsPerLegendary = materialCost / effectiveRate;
            
            // How many Legendary templates can we make at this level?
            const legendaryTemplates = Math.floor(remainingMaterials / materialsPerLegendary);
            
            if (legendaryTemplates > 0) {
                templateEstimates[level] = legendaryTemplates;
                // Reserve materials for this level
                remainingMaterials -= legendaryTemplates * materialsPerLegendary;
            }
        }
        
        const effectiveRateDisplay = (getEffectiveLegendaryRate(materialCount, inputQuality) * 100).toFixed(1) + '%';
        console.log('Crafting calculation:', {
            minSeasonalMaterials: minSeasonalAmount,
            materialCount: materialCount,
            inputQuality: inputQuality,
            effectiveRate: effectiveRateDisplay,
            estimates: templateEstimates
        });
        
        // Update template input fields
        for (const [level, count] of Object.entries(templateEstimates)) {
            const input = document.getElementById(`templateAmount${level}`);
            if (input && count > 0) {
                input.value = count;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Highlight the card
                const card = document.querySelector(`.template-card[data-level="${level}"]`);
                if (card) {
                    card.classList.add('has-value');
                }
            }
        }
        
        console.log('Auto-populated templates:', templateEstimates, 
                    'from seasonal materials:', minSeasonalAmount,
                    'seasons detected:', seasonsWithGear);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // OPTIMIZER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Update the Template Plan section based on available materials
     */
    function updatePlannerState() {
        const materials = gatherMaterialsFromInputs();
        updateTemplatePlan(materials);
    }

    /**
     * Get quality class for a level
     * L1-10: Legendary, L15-25: Exquisite, L30-35: Fine, L40-45: Common
     */
    function getQualityForLevel(level) {
        if (level <= 10) return { quality: 'legendary', label: 'Legendary' };
        if (level <= 25) return { quality: 'exquisite', label: 'Exquisite' };
        if (level <= 35) return { quality: 'fine', label: 'Fine' };
        return { quality: 'common', label: 'Common' };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TEST DATA SCENARIOS
    // ═══════════════════════════════════════════════════════════════════════
    
    // Basic material IDs (12 total)
    const BASIC_MAT_IDS = [
        'my-black-iron', 'my-copper-bar', 'my-dragonglass', 'my-goldenheart-wood',
        'my-hide', 'my-ironwood', 'my-kingswood-oak', 'my-leather-straps',
        'my-milk-of-the-poppy', 'my-silk', 'my-weirwood', 'my-wildfire'
    ];
    
    // Sample seasonal material IDs (S11 + S12)
    const SEASONAL_MAT_IDS = [
        // Season 11
        'my-ash-cloaked-clow', 'my-charred-driftwood', 'my-frostbitten-leather',
        'my-frozen-weirwood-sap', 'my-greenfyre-penny',
        // Season 12
        'my-burning-stag-hide', 'my-combusted-leather', 'my-fireborn-silk',
        'my-frost-crusted-abalone', 'my-frostfang-bronze-discs'
    ];
    
    // Helper to create materials object with same value for all basic mats
    function createBasicMaterials(valuePerMat) {
        const mats = {};
        BASIC_MAT_IDS.forEach(id => { mats[id] = valuePerMat; });
        return mats;
    }
    
    // Helper to create seasonal materials with same value
    function createSeasonalMaterials(valuePerMat) {
        const mats = {};
        SEASONAL_MAT_IDS.forEach(id => { mats[id] = valuePerMat; });
        return mats;
    }
    
    // Test scenarios configuration
    const TEST_SCENARIOS = {
        // Clear all
        'clear': {},
        
        // Basic Materials Only
        'basic-small': createBasicMaterials(1000000),      // 1M each
        'basic-medium': createBasicMaterials(10000000),    // 10M each
        'basic-large': createBasicMaterials(50000000),     // 50M each
        'basic-whale': createBasicMaterials(100000000),    // 100M each
        
        // Mixed (Basic + Seasonal)
        'mixed-starter': {
            ...createBasicMaterials(5000000),              // 5M basic
            ...createSeasonalMaterials(1000000)            // 1M seasonal
        },
        'mixed-balanced': {
            ...createBasicMaterials(20000000),             // 20M basic
            ...createSeasonalMaterials(5000000)            // 5M seasonal
        },
        'mixed-endgame': {
            ...createBasicMaterials(50000000),             // 50M basic
            ...createSeasonalMaterials(20000000)           // 20M seasonal
        },
        
        // Special Scenarios
        'bottleneck-iron': {
            ...createBasicMaterials(20000000),
            'my-black-iron': 2000000,                      // Only 2M iron (bottleneck)
            'my-copper-bar': 2000000                       // Low copper too
        },
        'bottleneck-leather': {
            ...createBasicMaterials(20000000),
            'my-leather-straps': 1500000,                  // Very low leather
            'my-hide': 3000000                             // Low hide
        },
        'seasonal-only': {
            ...createBasicMaterials(5000000),              // Low basic
            ...createSeasonalMaterials(50000000)           // High seasonal
        },
        
        // Legacy scenario (original test data)
        'legacy': {
            'my-black-iron': 108200000,
            'my-copper-bar': 91200000,
            'my-dragonglass': 101400000,
            'my-goldenheart-wood': 106200000,
            'my-hide': 97100000,
            'my-ironwood': 96100000,
            'my-kingswood-oak': 102200000,
            'my-leather-straps': 91100000,
            'my-milk-of-the-poppy': 86900000,
            'my-silk': 109400000,
            'my-weirwood': 115800000,
            'my-wildfire': 92900000,
            'my-ash-cloaked-clow': 274600,
            'my-charred-driftwood': 6000000,
            'my-frostbitten-leather': 1900,
            'my-frozen-weirwood-sap': 20200,
            'my-greenfyre-penny': 1600000,
            'my-burning-stag-hide': 3600000,
            'my-combusted-leather': 1800000,
            'my-fireborn-silk': 27600000,
            'my-frost-crusted-abalone': 182000,
            'my-frostfang-bronze-discs': 2700000
        }
    };

    /**
     * Load a test scenario by name
     */
    function loadTestScenario(scenarioName) {
        const scenario = TEST_SCENARIOS[scenarioName];
        if (!scenario) {
            console.warn(`Unknown scenario: ${scenarioName}`);
            return;
        }
        
        console.log(`🧪 Loading test scenario: ${scenarioName}`);
        
        // Clear all inputs first
        document.querySelectorAll('.my-material input.numeric-input').forEach(input => {
            input.value = '';
        });
        
        // Load scenario values
        let loadedCount = 0;
        let hasSeasonalMaterials = false;
        
        for (const [inputId, value] of Object.entries(scenario)) {
            const input = document.getElementById(inputId);
            if (input && value > 0) {
                input.value = value.toLocaleString('en-US');
                input.dispatchEvent(new Event('input', { bubbles: true }));
                loadedCount++;
                
                // Check if this is a seasonal material
                if (SEASONAL_MAT_IDS.includes(inputId)) {
                    hasSeasonalMaterials = true;
                }
            }
        }
        
        // Expand gear materials accordion if we have seasonal materials
        if (hasSeasonalMaterials) {
            const gearToggle = document.getElementById('toggleAdvMaterials');
            const gearContent = document.getElementById('advMaterials');
            if (gearToggle && gearContent) {
                gearToggle.setAttribute('aria-expanded', 'true');
                gearToggle.classList.add('open');
                gearContent.style.display = 'block';
            }
        }
        
        // Calculate totals for logging
        const basicTotal = Object.entries(scenario)
            .filter(([k]) => BASIC_MAT_IDS.includes(k))
            .reduce((sum, [, v]) => sum + v, 0);
        
        const seasonalTotal = Object.entries(scenario)
            .filter(([k]) => SEASONAL_MAT_IDS.includes(k))
            .reduce((sum, [, v]) => sum + v, 0);
        
        console.log(`✓ Loaded ${loadedCount} materials`);
        console.log(`📦 Basic: ${basicTotal.toLocaleString()}`);
        if (seasonalTotal > 0) {
            console.log(`⚔️ Seasonal: ${seasonalTotal.toLocaleString()}`);
        }
        
        // Trigger cascade update
        triggerCascadeUpdate();
        
        return { loadedCount, basicTotal, seasonalTotal };
    }

    /**
     * Clear all material inputs
     */
    function clearTestData() {
        document.querySelectorAll('.my-material input.numeric-input').forEach(input => {
            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        console.log('✓ All materials cleared');
    }

    // Legacy function aliases for backwards compatibility
    function loadTestData() { return loadTestScenario('legacy'); }
    function loadTestData10M() { return loadTestScenario('basic-medium'); }

    // Expose test functions globally
    window.loadTestScenario = loadTestScenario;
    window.loadTestData = loadTestData;
    window.loadTestData10M = loadTestData10M;
    window.clearTestData = clearTestData;
    window.TEST_SCENARIOS = TEST_SCENARIOS;

    // ═══════════════════════════════════════════════════════════════════════
    // MATERIAL INPUT LISTENERS - Update summary when materials change
    // ═══════════════════════════════════════════════════════════════════════
    
    // Add listeners to all material inputs to update summary
    function setupMaterialInputListeners() {
        const materialInputs = document.querySelectorAll('.my-material input.numeric-input');
        materialInputs.forEach(input => {
            input.addEventListener('input', () => {
                // Update material summary immediately
                const materials = gatherMaterialsFromInputs();
                if (typeof window.updateMaterialSummary === 'function') {
                    window.updateMaterialSummary(materials);
                }
            });
        });
        console.log(`[Wizard] Added listeners to ${materialInputs.length} material inputs`);
    }
    
    // Setup listeners after a short delay to ensure DOM is ready
    setTimeout(setupMaterialInputListeners, 500);

    // ═══════════════════════════════════════════════════════════════════════
    // TEMPLATE PLAN - Recommended values based on materials and settings
    // ═══════════════════════════════════════════════════════════════════════
    
    // Recommended template counts based on materials + current settings
    // These recalculate whenever any setting changes
    const recommendedValues = {};
    const TEMPLATE_LEVELS = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
    
    // Locked levels - values manually set by user that should not be overwritten
    // by slider/quality changes. Key is level, value is the locked count.
    const lockedLevels = {};
    
    /**
     * Lock a level with a specific value
     * @param {number} level - The level to lock (1, 5, 10, etc.)
     * @param {number} value - The value to lock it to
     */
    function lockLevel(level, value) {
        lockedLevels[level] = value;
        const input = document.getElementById(`templateAmount${level}`);
        const card = document.querySelector(`.template-card[data-level="${level}"]`);
        if (input) {
            input.setAttribute('data-locked', 'true');
        }
        if (card) {
            card.setAttribute('data-locked', 'true');
        }
        console.log(`[Lock] L${level} locked to ${value}`);
    }
    
    /**
     * Unlock a level (allow auto-calculation)
     * @param {number} level - The level to unlock
     */
    function unlockLevel(level) {
        delete lockedLevels[level];
        const input = document.getElementById(`templateAmount${level}`);
        const card = document.querySelector(`.template-card[data-level="${level}"]`);
        if (input) {
            input.removeAttribute('data-locked');
        }
        if (card) {
            card.removeAttribute('data-locked');
        }
        console.log(`[Unlock] L${level} unlocked`);
    }
    
    /**
     * Check if a level is locked
     * @param {number} level - The level to check
     * @returns {boolean}
     */
    function isLevelLocked(level) {
        return lockedLevels.hasOwnProperty(level);
    }
    
    /**
     * Get locked value for a level (or undefined if not locked)
     * @param {number} level - The level to check
     * @returns {number|undefined}
     */
    function getLockedValue(level) {
        return lockedLevels[level];
    }
    
    /**
     * Clear all locked levels
     */
    function clearAllLocks() {
        TEMPLATE_LEVELS.forEach(level => unlockLevel(level));
        console.log('[Lock] All levels unlocked');
    }
    
    /**
     * Update Template Plan based on materials and settings
     * This replaces the old renderCascadeProjection
     */
    function updateTemplatePlan(materials) {
        const hasMaterials = materials && Object.values(materials).some(v => v > 0);
        const templatePlanSection = document.getElementById('templatePlanSection');
        const templatePlanEmpty = document.getElementById('templatePlanEmpty');
        const templateChips = document.getElementById('templateChips');
        const templatePlanSummary = document.getElementById('templatePlanSummary');
        
        if (!hasMaterials) {
            // Show empty state
            if (templatePlanEmpty) templatePlanEmpty.classList.add('visible');
            if (templateChips) templateChips.style.opacity = '0.5';
            if (templatePlanSummary) templatePlanSummary.style.display = 'none';
            
            // Clear auto values
            TEMPLATE_LEVELS.forEach(level => {
                const autoEl = document.getElementById(`autoValue${level}`);
                if (autoEl) autoEl.textContent = 'auto: --';
                recommendedValues[level] = 0;
            });
            return;
        }
        
        // Hide empty state, show content
        if (templatePlanEmpty) templatePlanEmpty.classList.remove('visible');
        if (templateChips) templateChips.style.opacity = '1';
        if (templatePlanSummary) templatePlanSummary.style.display = 'flex';
        
        // Calculate recommended values based on materials and settings
        calculateRecommendedPlan(materials);
        
        // Update the UI
        updateTemplatePlanUI();
        
        // Update summary
        updateTemplatePlanSummary();
    }
    
    /**
     * Calculate recommended template values based on materials and current settings
     * Uses HYBRID approach:
     * 1. Instant estimate via lighter simulation (accounts for L1-L45 costs)
     * 2. Background refinement via full simulation (optional, for accuracy)
     */
    function calculateRecommendedPlan(materials) {
        // Get usage percentage from slider
        const usageSlider = document.getElementById('usageSlider');
        const usagePercent = usageSlider ? parseInt(usageSlider.value) / 100 : 0.6;
        
        console.log(`[TemplatePlan] Recalculating with usage: ${usagePercent * 100}%`);

        // Get quality settings from template card selectors
        const qualitySettings = getQualitySettingsFromUI();

        // Basic materials list
        const BASIC_MATERIALS = ['black-iron', 'copper-bar', 'dragonglass', 'goldenheart-wood', 
                               'hide', 'ironwood', 'kingswood-oak', 'leather-straps', 
                               'milk-of-the-poppy', 'silk', 'weirwood', 'wildfire'];

        // Convert material IDs from my-xxx to xxx and categorize
        const normalizedMaterials = {};
        const basicMaterials = {};
        const gearMaterials = {};
        let totalBasicMats = 0;
        let totalGearMats = 0;
        
        for (const [key, value] of Object.entries(materials)) {
            const matId = key.replace(/^my-/, '');
            normalizedMaterials[matId] = value;
            
            if (BASIC_MATERIALS.includes(matId)) {
                basicMaterials[matId] = value;
                totalBasicMats += value;
            } else {
                gearMaterials[matId] = value;
                totalGearMats += value;
            }
        }

        console.log('[TemplatePlan] Total basic mats:', totalBasicMats, 'Total gear mats:', totalGearMats);

        // ═══════════════════════════════════════════════════════════════════════
        // STEP 1: INSTANT ESTIMATE (Lighter Simulation)
        // ALWAYS calculate from materials/slider - locked values are applied later
        // ═══════════════════════════════════════════════════════════════════════
        
        let startingTemplates = 0;
        let cascade = [];
        let craftingPlan = {};
        
        // Always calculate from materials - this ensures slider changes affect non-locked levels
        if (typeof TemplatePlanner !== 'undefined' && TemplatePlanner.estimateStartingTemplates) {
            // Use the new estimation system that accounts for L1-L45 material costs
            const estimate = TemplatePlanner.estimateStartingTemplates(
                totalBasicMats, 
                usagePercent, 
                qualitySettings
            );
            
            startingTemplates = estimate.startingTemplates;
            
            console.log('%c[TemplatePlan] Hybrid Estimate:', 'color: lime; font-weight: bold', {
                totalBasicMats: totalBasicMats.toLocaleString(),
                usagePercent: `${(usagePercent * 100).toFixed(0)}%`,
                startingTemplates: startingTemplates.toLocaleString(),
                estimatedUsage: estimate.estimatedUsage?.toLocaleString(),
                actualUsagePercent: `${((estimate.usagePercent || 0) * 100).toFixed(1)}%`
            });
            
            // Log breakdown by level
            if (estimate.breakdown) {
                console.log('[TemplatePlan] Cost breakdown by level:');
                for (const [level, data] of Object.entries(estimate.breakdown)) {
                    console.log(`  L${level}: ${data.templates} templates × ${data.baseCost} × ${data.multiplier} (${data.quality}) = ${data.totalCost.toLocaleString()}`);
                }
            }
        } else {
            // Fallback: simple estimate (less accurate, only considers L1-L10)
            console.warn('[TemplatePlan] estimateStartingTemplates not available, using fallback');
            const avgCostPerTemplate = 112640; // L1+L5+L10 legendary cost
            startingTemplates = Math.floor((totalBasicMats * usagePercent) / avgCostPerTemplate);
        }
        
        console.log('[TemplatePlan] Locked levels:', { ...lockedLevels });

        // ═══════════════════════════════════════════════════════════════════════
        // STEP 2: BUILD CASCADE with proper propagation from locked levels
        // - Locked levels keep their values
        // - Non-locked levels cascade from the nearest locked ancestor, or from calculated start
        // ═══════════════════════════════════════════════════════════════════════
        
        if (typeof TemplatePlanner !== 'undefined' && TemplatePlanner.calculateCascade) {
            // Determine L1-L10 counts (all legendary, same count)
            // For L1-L10, each level inherits from the HIGHEST locked level in the chain
            // Priority: L10 lock > L5 lock > L1 lock > startingTemplates
            let l1Count, l5Count, l10Count;
            
            // L10: check from highest to lowest
            if (isLevelLocked(10)) {
                l10Count = lockedLevels[10];
            } else if (isLevelLocked(5)) {
                l10Count = lockedLevels[5];
            } else if (isLevelLocked(1)) {
                l10Count = lockedLevels[1];
            } else {
                l10Count = startingTemplates;
            }
            
            // L5: check from L5 down
            if (isLevelLocked(5)) {
                l5Count = lockedLevels[5];
            } else if (isLevelLocked(1)) {
                l5Count = lockedLevels[1];
            } else {
                l5Count = startingTemplates;
            }
            
            // L1: only check L1
            l1Count = isLevelLocked(1) ? lockedLevels[1] : startingTemplates;
            
            console.log('[Cascade] L1-10 counts:', { l1Count, l5Count, l10Count, startingTemplates, lockedLevels: { ...lockedLevels } });
            
            cascade = [
                { level: 1, count: l1Count, successRate: 1.0 },
                { level: 5, count: l5Count, successRate: 1.0 },
                { level: 10, count: l10Count, successRate: 1.0 }
            ];
            
            // For L15+, we need to cascade from the appropriate starting point
            // Find the effective starting count for cascade (L10's value, considering locks)
            let cascadeStartCount = l10Count;
            
            // Calculate cascade from L10 using the effective start count
            const cascadeFromL10 = TemplatePlanner.calculateCascade(10, cascadeStartCount, 45, qualitySettings);
            
            // Build L15+ cascade, but restart cascade from any locked level
            let previousCount = cascadeStartCount;
            const levelsAfter10 = [15, 20, 25, 30, 35, 40, 45];
            
            levelsAfter10.forEach((level, index) => {
                if (isLevelLocked(level)) {
                    // Use locked value and update previousCount for next iteration
                    previousCount = lockedLevels[level];
                    cascade.push({ level, count: previousCount, successRate: 1.0 });
                } else {
                    // Find this level in the calculated cascade
                    const calcStage = cascadeFromL10.find(c => c.level === level);
                    if (calcStage) {
                        // If previous level was locked, recalculate cascade from that locked value
                        const prevLevel = index === 0 ? 10 : levelsAfter10[index - 1];
                        if (isLevelLocked(prevLevel)) {
                            // Recalculate from the locked level
                            const newCascade = TemplatePlanner.calculateCascade(prevLevel, lockedLevels[prevLevel], level, qualitySettings);
                            const newStage = newCascade.find(c => c.level === level);
                            previousCount = newStage ? newStage.count : Math.floor(previousCount * calcStage.successRate);
                        } else {
                            previousCount = calcStage.count;
                        }
                        cascade.push({ level, count: previousCount, successRate: calcStage.successRate });
                    }
                }
            });
        } else {
            // Fallback cascade calculation
            const CASCADE_RATES = {
                15: 0.465, 20: 0.465, 25: 0.465,
                30: 0.20, 35: 0.20, 40: 0.10, 45: 0.10
            };
            
            const l1Count = isLevelLocked(1) ? lockedLevels[1] : startingTemplates;
            const l5Count = isLevelLocked(5) ? lockedLevels[5] : l1Count;
            const l10Count = isLevelLocked(10) ? lockedLevels[10] : l5Count;
            
            cascade.push({ level: 1, count: l1Count, successRate: 1.0 });
            cascade.push({ level: 5, count: l5Count, successRate: 1.0 });
            cascade.push({ level: 10, count: l10Count, successRate: 1.0 });
            
            let currentCount = l10Count;
            [15, 20, 25, 30, 35, 40, 45].forEach(level => {
                if (isLevelLocked(level)) {
                    currentCount = lockedLevels[level];
                    cascade.push({ level, count: currentCount, successRate: 1.0 });
                } else {
                    const survivalRate = CASCADE_RATES[level] || 0.43;
                    currentCount = Math.floor(currentCount * survivalRate);
                    cascade.push({ level, count: currentCount, successRate: survivalRate });
                }
            });
        }

        // ═══════════════════════════════════════════════════════════════════════
        // STEP 3: GENERATE CRAFTING PLAN (for carousel display)
        // ═══════════════════════════════════════════════════════════════════════
        
        // Get settings for piece selection
        const includeWarlordsEl = document.getElementById('includeWarlords');
        const includeCTW = includeWarlordsEl?.checked ?? true;
        
        const gearSelect = document.getElementById('gearMaterialLevels');
        const seasonGearLevels = gearSelect
            ? Array.from(gearSelect.selectedOptions).map(opt => parseInt(opt.value, 10))
            : [20, 25, 30, 35, 40, 45];
        
        // Generate piece breakdown for carousel
        craftingPlan = generateFullCraftingPlan({}, cascade, normalizedMaterials, {
            includeCTW,
            includeSeasonGear: seasonGearLevels.length > 0,
            seasonGearLevels
        });
        
        // ═══════════════════════════════════════════════════════════════════════
        // STEP 4: UPDATE RECOMMENDED VALUES
        // ═══════════════════════════════════════════════════════════════════════
        
        cascade.forEach(stage => {
            recommendedValues[stage.level] = stage.count;
        });
        
        console.log('[TemplatePlan] Recommended values updated:', { ...recommendedValues });
        
        // Store for later use
        window.currentTemplatePlan = {
            cascade,
            craftingPlan,
            basicMaterials,
            gearMaterials,
            totalBasicMats,
            totalGearMats,
            usagePercent,
            startingTemplates,
            qualitySettings
        };
    }
    
    /**
     * Get quality settings from the UI (template card quality selectors)
     */
    function getQualitySettingsFromUI() {
        const settings = {};
        TEMPLATE_LEVELS.forEach(level => {
            const select = document.getElementById(`temp${level}`);
            if (select && select.value) {
                settings[level] = select.value.toLowerCase();
            }
        });
        return settings;
    }
    
    /**
     * Generate full crafting plan for ALL levels (1-45)
     * Uses the same scoring logic as calculateProductionPlan for accurate previews
     * - For L1, L5, L10: use balanced pieces from template planner
     * - For L15-L45: use scoring-based piece selection with cascade counts
     */
    function generateFullCraftingPlan(basePlan, cascade, materials, options = {}) {
        const fullPlan = {};
        const { includeCTW = true, includeSeasonGear = false, seasonGearLevels = [] } = options;
        
        // Get products database
        const hasProducts = typeof craftItem !== 'undefined' && craftItem.products;
        if (!hasProducts) {
            console.warn('[Wizard] craftItem not available, using default pieces');
        }
        
        // Check if CraftScoring API is available
        const useScoringAPI = typeof window.CraftScoring !== 'undefined';
        
        // Process each level
        TEMPLATE_LEVELS.forEach(level => {
            const cascadeStage = cascade.find(c => c.level === level);
            const levelCount = cascadeStage?.count || 0;
            
            if (levelCount === 0) {
                fullPlan[level] = [];
                return;
            }
            
            // For early levels (L1, L5, L10), use the base plan if available
            // Check both number and string keys for safety
            const basePlanPieces = basePlan[level] || basePlan[String(level)];
            if (basePlanPieces && basePlanPieces.length > 0) {
                fullPlan[level] = basePlanPieces;
                return;
            }
            
            // Try to use scoring API for piece selection (works for all levels)
            if (useScoringAPI && hasProducts) {
                try {
                    const scoredProducts = window.CraftScoring.scoreProductsForLevel(level, materials, {
                        includeCTW,
                        includeSeasonGear: includeSeasonGear && seasonGearLevels.includes(level),
                        seasonGearLevels
                    });
                    
                    if (scoredProducts && scoredProducts.length > 0) {
                        // Distribute templates across top-scored pieces
                        const piecesWithCounts = distributeByScore(scoredProducts, levelCount);
                        if (piecesWithCounts.length > 0) {
                            fullPlan[level] = piecesWithCounts;
                            return;
                        }
                    }
                } catch (e) {
                    console.warn(`[Wizard] Scoring failed for level ${level}:`, e);
                }
            }
            
            // Fallback: get available pieces and distribute evenly
            if (hasProducts) {
                const availablePieces = getAvailablePiecesForLevel(level, {
                    includeCTW,
                    includeSeasonGear: includeSeasonGear && seasonGearLevels.includes(level)
                });
                
                if (availablePieces.length > 0) {
                    // Distribute templates evenly across available pieces
                    const piecesWithCounts = distributeTemplatesAcrossPieces(availablePieces, levelCount);
                    fullPlan[level] = piecesWithCounts;
                    return;
                }
            }
            
            // Final fallback: use default gear pieces (works even without craftItem)
            const defaultPieces = getDefaultPiecesForLevel(level, levelCount);
            if (defaultPieces.length > 0) {
                fullPlan[level] = defaultPieces;
                return;
            }
            
            // Ultimate fallback: generic placeholder
            fullPlan[level] = [{
                name: `Level ${level} Template`,
                count: levelCount,
                img: levelIcons[level],
                level: level
            }];
        });
        
        console.log('[Wizard] Generated crafting plan:', Object.keys(fullPlan).length, 'levels');
        
        return fullPlan;
    }
    
    /**
     * Distribute templates across pieces weighted by their score
     * Higher scored pieces get more templates
     */
    function distributeByScore(scoredProducts, totalCount) {
        if (scoredProducts.length === 0) return [];
        if (totalCount === 0) return [];
        
        // Take top 6 pieces (to show variety in carousel)
        const topPieces = scoredProducts.slice(0, 6);
        
        // Normalize scores to positive values for weighting
        const minScore = Math.min(...topPieces.map(p => p.score));
        const normalizedPieces = topPieces.map(item => ({
            ...item,
            weight: item.score - minScore + 1 // Ensure all weights are positive
        }));
        
        // Calculate total weight
        const totalWeight = normalizedPieces.reduce((sum, p) => sum + p.weight, 0);
        
        // Distribute based on weight proportion
        let remaining = totalCount;
        const result = normalizedPieces.map((item, index) => {
            // For last item, give remaining count to avoid rounding errors
            const count = index === normalizedPieces.length - 1
                ? remaining
                : Math.round((item.weight / totalWeight) * totalCount);
            
            remaining -= count;
            
            return {
                name: item.product.name,
                level: item.product.level,
                img: item.product.img,
                materials: item.product.materials,
                setName: item.product.setName || 'Standard',
                season: item.product.season || 0,
                count: Math.max(0, count),
                score: item.score // Include score for debugging
            };
        });
        
        // Filter out zero-count pieces and sort by count
        return result
            .filter(p => p.count > 0)
            .sort((a, b) => b.count - a.count);
    }
    
    /**
     * Get available pieces for a specific level
     */
    function getAvailablePiecesForLevel(level, options = {}) {
        const { includeCTW = true, includeSeasonGear = false } = options;
        
        if (typeof craftItem === 'undefined' || !craftItem.products) {
            return [];
        }
        
        return craftItem.products.filter(product => {
            if (product.level !== level) return false;
            
            // Basic gear (season 0) is always included
            const isBasic = product.season === 0;
            const isCTW = product.setName === 'Ceremonial Targaryen Warlord';
            const isSeasonGear = product.season > 0 && !isCTW;
            
            if (isBasic) return true;
            if (isCTW && includeCTW) return true;
            if (isSeasonGear && includeSeasonGear) return true;
            
            return false;
        }).map(product => ({
            name: product.name,
            level: product.level,
            img: product.img,
            materials: product.materials,
            setName: product.setName || 'Standard',
            season: product.season || 0
        }));
    }
    
    /**
     * Distribute template count across pieces (balanced distribution)
     */
    function distributeTemplatesAcrossPieces(pieces, totalCount) {
        if (pieces.length === 0) return [];
        
        // Calculate base count per piece
        const baseCount = Math.floor(totalCount / pieces.length);
        let remainder = totalCount % pieces.length;
        
        return pieces.map((piece, index) => {
            // Add 1 to first N pieces where N = remainder
            const count = baseCount + (index < remainder ? 1 : 0);
            return {
                ...piece,
                count: count
            };
        }).filter(p => p.count > 0)
          .sort((a, b) => b.count - a.count); // Sort by count descending
    }
    
    // Store piece carousel state per level
    const carouselState = {};
    
    // Default piece icons per level
    const levelIcons = {
        1: 'resources/item/icon_eq_standard_helmet_woodenbucket.webp',
        5: 'resources/item/icon_eq_standard_helmet_woolbandana.webp',
        10: 'resources/item/icon_eq_standard_helmet_strawhat.webp',
        15: 'resources/item/15-25/icon_eq_standard_helmet_ironskullcap.png',
        20: 'resources/item/15-25/icon_eq_standard_helmet_halfhelm.png',
        25: 'resources/item/15-25/icon_eq_standard_helmet_piratetricorne.png',
        30: 'resources/item/30-45/icon_eq_standard_helmet_kettlehelm.png',
        35: 'resources/item/30-45/icon_eq_standard_helmet_casque.png',
        40: 'resources/item/30-45/icon_eq_standard_helmet_goldencrown.png',
        45: 'resources/item/30-45/icon_eq_standard_helmet_jewelencrustedtiara.png'
    };
    
    // Default gear pieces per level bracket (for when no crafting plan exists)
    const defaultGearPieces = {
        early: [ // L1-10: Basic starter gear
            { name: 'Helmet', slot: 'helmet', icons: ['icon_eq_standard_helmet_woodenbucket.webp', 'icon_eq_standard_helmet_woolbandana.webp', 'icon_eq_standard_helmet_strawhat.webp'] },
            { name: 'Armor', slot: 'armor', icons: ['icon_eq_standard_armor_peasantcloth.webp', 'icon_eq_standard_armor_plainrobe.webp'] },
            { name: 'Boots', slot: 'boots', icons: ['icon_eq_standard_boots_simplesandals.webp', 'icon_eq_standard_boots_farmboots.webp'] },
            { name: 'Weapon', slot: 'weapon', icons: ['icon_eq_standard_weapon_woodencudgel.webp', 'icon_eq_standard_weapon_rustysword.webp'] }
        ],
        mid: [ // L15-25: Intermediate gear
            { name: 'Iron Helmet', slot: 'helmet', icons: ['15-25/icon_eq_standard_helmet_ironskullcap.png', '15-25/icon_eq_standard_helmet_halfhelm.png', '15-25/icon_eq_standard_helmet_piratetricorne.png'] },
            { name: 'Chain Mail', slot: 'armor', icons: ['15-25/icon_eq_standard_armor_chainmail.png', '15-25/icon_eq_standard_armor_leatherjerkin.png'] },
            { name: 'Steel Boots', slot: 'boots', icons: ['15-25/icon_eq_standard_boots_steelboots.png', '15-25/icon_eq_standard_boots_ridingboots.png'] },
            { name: 'Steel Sword', slot: 'weapon', icons: ['15-25/icon_eq_standard_weapon_steelsword.png', '15-25/icon_eq_standard_weapon_broadaxe.png'] }
        ],
        high: [ // L30-45: Advanced gear
            { name: 'Crown', slot: 'helmet', icons: ['30-45/icon_eq_standard_helmet_kettlehelm.png', '30-45/icon_eq_standard_helmet_casque.png', '30-45/icon_eq_standard_helmet_goldencrown.png', '30-45/icon_eq_standard_helmet_jewelencrustedtiara.png'] },
            { name: 'Plate Armor', slot: 'armor', icons: ['30-45/icon_eq_standard_armor_platemail.png', '30-45/icon_eq_standard_armor_royalplate.png'] },
            { name: 'Royal Boots', slot: 'boots', icons: ['30-45/icon_eq_standard_boots_plateboots.png', '30-45/icon_eq_standard_boots_royalboots.png'] },
            { name: 'Royal Sword', slot: 'weapon', icons: ['30-45/icon_eq_standard_weapon_royalsword.png', '30-45/icon_eq_standard_weapon_kingsgreatsword.png'] }
        ]
    };
    
    /**
     * Get default pieces for a level when no crafting plan exists
     */
    function getDefaultPiecesForLevel(level, totalCount) {
        let bracket = 'early';
        if (level >= 15 && level <= 25) bracket = 'mid';
        else if (level >= 30) bracket = 'high';
        
        const gearTypes = defaultGearPieces[bracket];
        const perPiece = Math.ceil(totalCount / gearTypes.length);
        
        return gearTypes.map((gear, index) => {
            // Pick an icon based on level within bracket
            const levelIndex = level <= 10 ? Math.floor((level - 1) / 5) : 
                              level <= 25 ? Math.floor((level - 15) / 5) :
                              Math.floor((level - 30) / 5);
            const iconIndex = Math.min(levelIndex, gear.icons.length - 1);
            const icon = gear.icons[iconIndex] || gear.icons[0];
            
            return {
                name: gear.name,
                img: `resources/item/${icon}`,
                count: index === gearTypes.length - 1 
                    ? Math.max(0, totalCount - (perPiece * index))
                    : perPiece
            };
        });
    }
    
    /**
     * Update the Template Plan UI with recommended values
     * Skips locked levels - their values are preserved
     */
    function updateTemplatePlanUI() {
        console.log('[TemplatePlan] Updating UI with recommended values:', { ...recommendedValues });
        console.log('[TemplatePlan] Locked levels:', { ...lockedLevels });
        
        // First pass: update all input values (skip locked levels)
        TEMPLATE_LEVELS.forEach(level => {
            const input = document.getElementById(`templateAmount${level}`);
            const card = document.querySelector(`.template-card[data-level="${level}"]`);
            const qualitySelect = document.getElementById(`temp${level}`);
            
            // Skip locked levels - preserve their values
            if (isLevelLocked(level)) {
                console.log(`[TemplatePlan] L${level} is locked (${lockedLevels[level]}), skipping`);
                // Still update the carousel with the locked value
                updatePiecesCarousel(level);
                return;
            }
            
            const value = recommendedValues[level] || 0;
            
            // Update input with recommended value
            if (input) {
                const newValue = value > 0 ? value.toString() : '';
                // Only update if value actually changed to avoid unnecessary events
                if (input.value !== newValue) {
                    input.value = newValue;
                }
                input.placeholder = value > 0 ? value.toString() : '0';
            }
            
            // Update card quality attribute
            if (card) {
                const quality = qualitySelect?.value || getDefaultQuality(level);
                card.setAttribute('data-quality', quality);
            }
        });
        
        // Second pass: update all carousels (after all values are set)
        // This ensures the carousel has access to the latest craftingPlan
        TEMPLATE_LEVELS.forEach(level => {
            if (!isLevelLocked(level)) {
                updatePiecesCarousel(level);
            }
        });
        
        // Update summary with latest values
        updateTemplatePlanSummary();
    }
    
    /**
     * Update pieces carousel for a level
     */
    function updatePiecesCarousel(level) {
        const piecesContainer = document.getElementById(`pieces${level}`);
        if (!piecesContainer) return;
        
        const input = document.getElementById(`templateAmount${level}`);
        const templateCount = parseInt(input?.value) || recommendedValues[level] || 0;
        
        // Get crafting plan pieces if available (keys are strings)
        const craftingPlan = window.currentTemplatePlan?.craftingPlan;
        let pieces = craftingPlan?.[String(level)] || craftingPlan?.[level] || [];
        
        // If pieces exist in crafting plan, use them with their actual calculated counts
        if (pieces.length > 0) {
            // Use the pieces as-is from the crafting plan - they already have correct counts
            pieces = pieces.map(p => ({
                name: p.name,
                img: p.img,
                count: p.count,
                materials: p.materials
            }));
            console.log(`[Carousel] Level ${level}: Loaded ${pieces.length} pieces from crafting plan`);
        } else if (level >= 15 && templateCount > 0) {
            // For cascade levels (L15+), show cascade result info
            pieces = [{
                name: `Cascade Result`,
                img: levelIcons[level],
                count: templateCount,
                isCascade: true
            }];
        } else if (templateCount > 0) {
            // No crafting plan pieces for early levels - use defaults
            pieces = getDefaultPiecesForLevel(level, templateCount);
        } else {
            // No templates, show placeholder
            pieces = [{
                name: `Level ${level} Template`,
                img: levelIcons[level],
                count: 0
            }];
        }
        
        // Initialize carousel state if needed
        if (!carouselState[level]) {
            carouselState[level] = { currentIndex: 0, pieces: [] };
        }
        carouselState[level].pieces = pieces;
        
        // Render carousel
        renderCarousel(level);
    }
    
    /**
     * Render horizontal scroll strip for a level
     */
    function renderCarousel(level) {
        const piecesContainer = document.getElementById(`pieces${level}`);
        if (!piecesContainer) return;
        
        const state = carouselState[level];
        if (!state || !state.pieces.length) return;
        
        // Calculate total pieces for this level
        const totalPieces = state.pieces.reduce((sum, p) => sum + (p.count || 0), 0);
        
        // Update the level label to show total
        const labelEl = document.querySelector(`.template-card-wrapper[data-level="${level}"] .template-card__label`);
        if (labelEl && totalPieces > 0) {
            labelEl.textContent = `Level ${level} (${formatNumber(totalPieces)} pcs)`;
        }
        
        // Build horizontal strip HTML - simple scrollable list
        let html = `<div class="pieces-strip" data-level="${level}">`;
        
        state.pieces.forEach((piece, index) => {
            const imgSrc = piece.img || levelIcons[level];
            const name = piece.name || `Piece ${index + 1}`;
            const count = piece.count || 0;
            
            html += `
                <div class="piece-card" data-index="${index}">
                    <img src="${imgSrc}" alt="${name}" class="piece-card__img" onerror="this.src='${levelIcons[level]}'">
                    <div class="piece-card__name" title="${name}">${name}</div>
                    <div class="piece-card__count">${formatNumber(count)}</div>
                </div>
            `;
        });
        
        html += '</div>';
        
        piecesContainer.innerHTML = html;
    }
    
    // Grid layout doesn't need carousel navigation functions
    
    /**
     * Get default quality for a level
     */
    function getDefaultQuality(level) {
        if (level <= 10) return 'legendary';
        if (level <= 25) return 'exquisite';
        if (level <= 35) return 'fine';
        return 'common';
    }
    
    /**
     * Format number with commas
     */
    function formatNumber(num) {
        return num.toLocaleString('en-US');
    }
    
    /**
     * Update carousel with actual production plan from calculateProductionPlan
     * This is called after the full calculation runs to show the exact pieces
     */
    function updateCarouselWithProductionPlan(productionPlan) {
        if (!productionPlan) return;
        
        console.log('[Carousel] Updating with production plan:', Object.keys(productionPlan));
        
        // Store the production plan for carousel to use
        if (!window.currentTemplatePlan) {
            window.currentTemplatePlan = {};
        }
        window.currentTemplatePlan.craftingPlan = productionPlan;
        window.currentTemplatePlan.fromProductionPlan = true; // Flag that this is from actual calculation
        
        // Update each level's carousel
        TEMPLATE_LEVELS.forEach(level => {
            const pieces = productionPlan[level] || productionPlan[String(level)] || [];
            
            // Update carousel state
            if (!carouselState[level]) {
                carouselState[level] = { currentIndex: 0, pieces: [] };
            }
            
            if (pieces.length > 0) {
                carouselState[level].pieces = pieces;
                
                // Mark the card as having calculated results
                const card = document.querySelector(`.template-card[data-level="${level}"]`);
                if (card) {
                    card.classList.add('calculated');
                }
            }
            
            // Render the carousel
            renderCarousel(level);
        });
        
        // Update the template plan summary
        const summaryEl = document.getElementById('templatePlanSummary');
        if (summaryEl) {
            summaryEl.classList.add('has-results');
        }
        
        // Update summary counts
        updateTemplatePlanSummary();
    }
    
    // Expose the function globally for craftparse.js to call
    window.updateCarouselWithProductionPlan = updateCarouselWithProductionPlan;
    
    /**
     * Clear the calculated state (when materials change)
     */
    function clearCalculatedState() {
        if (window.currentTemplatePlan) {
            window.currentTemplatePlan.fromProductionPlan = false;
        }
        
        // Remove calculated class from all cards
        document.querySelectorAll('.template-card.calculated').forEach(card => {
            card.classList.remove('calculated');
        });
        
        const summaryEl = document.getElementById('templatePlanSummary');
        if (summaryEl) {
            summaryEl.classList.remove('has-results');
        }
    }
    
    /**
     * Update Template Plan summary
     * Dynamically finds starting and ending levels based on actual values
     */
    function updateTemplatePlanSummary() {
        const summaryStart = document.getElementById('summaryStart');
        const summaryFinal = document.getElementById('summaryFinal');
        const summarySurvival = document.getElementById('summarySurvival');
        const summaryStartLabel = document.getElementById('summaryStartLabel');
        const summaryFinalLabel = document.getElementById('summaryFinalLabel');
        
        // Find first non-zero level (starting point)
        let startLevel = null;
        let startCount = 0;
        for (const level of TEMPLATE_LEVELS) {
            const input = document.getElementById(`templateAmount${level}`);
            const value = parseInt(input?.value) || 0;
            if (value > 0) {
                startLevel = level;
                startCount = value;
                break;
            }
        }
        
        // Find last non-zero level (ending point) - iterate in reverse
        let endLevel = null;
        let endCount = 0;
        for (let i = TEMPLATE_LEVELS.length - 1; i >= 0; i--) {
            const level = TEMPLATE_LEVELS[i];
            const input = document.getElementById(`templateAmount${level}`);
            const value = parseInt(input?.value) || 0;
            if (value > 0) {
                endLevel = level;
                endCount = value;
                break;
            }
        }
        
        // Calculate survival rate
        const survivalRate = startCount > 0 && endCount > 0 ? ((endCount / startCount) * 100).toFixed(1) : 0;
        
        // Update labels to show actual levels
        if (summaryStartLabel) {
            summaryStartLabel.textContent = startLevel ? `L${startLevel} Start` : 'Start';
        }
        if (summaryFinalLabel) {
            summaryFinalLabel.textContent = endLevel ? `L${endLevel} Final` : 'Final';
        }
        
        // Update values
        if (summaryStart) summaryStart.textContent = startCount > 0 ? formatNumber(startCount) : '--';
        if (summaryFinal) summaryFinal.textContent = endCount > 0 ? formatNumber(endCount) : '--';
        if (summarySurvival) summarySurvival.textContent = startCount > 0 && endCount > 0 ? `${survivalRate}%` : '--%';
    }
    
    /**
     * Handle template card input changes
     * When user edits a level, propagate cascade to downstream levels
     */
    function onTemplateInputChange(level, value) {
        const rawValue = value.replace(/,/g, '').trim();
        const numValue = parseInt(rawValue, 10);
        const count = isNaN(numValue) ? 0 : numValue;
        
        // Lock this level with the user's value (including 0)
        // This prevents slider/quality changes from overwriting it
        if (rawValue !== '' || value === '0') {
            lockLevel(level, count);
        }
        
        // Update pieces carousel with new count
        updatePiecesCarousel(level);
        
        // Cascade propagation: When a level changes, update all subsequent non-locked levels
        propagateCascadeFromLevel(level);
        
        // IMPORTANT: Also recalculate the cascade data structure to reflect locked values
        // This ensures window.currentTemplatePlan.cascade has correct values for Calculate
        const materials = gatherMaterialsFromInputs();
        if (materials && Object.values(materials).some(v => v > 0)) {
            calculateRecommendedPlan(materials);
        }
        
        // Update summary
        updateTemplatePlanSummary();
    }
    
    /**
     * Propagate cascade changes from a modified level to all subsequent levels
     * 
     * Key rules:
     * - Levels 1, 5, 10 are ALL legendary quality - no loss between them
     * - Cascade survival rates only apply from L10 onwards (L10→L15→L20...)
     * - Locked levels are SKIPPED - their values are preserved
     */
    function propagateCascadeFromLevel(fromLevel) {
        const input = document.getElementById(`templateAmount${fromLevel}`);
        const startCount = parseInt(input?.value?.replace(/,/g, '')) || 0;
        
        // Get current quality settings from UI for accurate cascade calculation
        const qualitySettings = getQualitySettingsFromUI();
        
        // Helper to update a level if not locked
        function updateLevelIfNotLocked(level, count) {
            // Skip if this level is locked
            if (isLevelLocked(level)) {
                console.log(`[Cascade] L${level} is locked, skipping`);
                return;
            }
            
            const levelInput = document.getElementById(`templateAmount${level}`);
            if (levelInput) {
                levelInput.value = count > 0 ? count.toString() : '';
                levelInput.placeholder = count > 0 ? count.toString() : '0';
                recommendedValues[level] = count;
                updatePiecesCarousel(level);
            }
        }
        
        // For levels 1-10: they're all legendary, so count stays the same
        if (fromLevel <= 10) {
            // Update L1, L5, L10 with the same count (no loss between them)
            [1, 5, 10].forEach(level => {
                if (level > fromLevel) {
                    updateLevelIfNotLocked(level, startCount);
                }
            });
            
            // Calculate cascade from L10 for levels 15+ with quality-based rates
            if (typeof TemplatePlanner !== 'undefined' && TemplatePlanner.calculateCascade) {
                const cascade = TemplatePlanner.calculateCascade(10, startCount, 45, qualitySettings);
                
                cascade.forEach(stage => {
                    if (stage.level > 10) {
                        updateLevelIfNotLocked(stage.level, stage.count);
                    }
                });
            }
        } else {
            // For levels 15+, use normal cascade calculation with quality-based rates
            if (typeof TemplatePlanner !== 'undefined' && TemplatePlanner.calculateCascade) {
                const cascade = TemplatePlanner.calculateCascade(fromLevel, startCount, 45, qualitySettings);
                
                cascade.forEach(stage => {
                    if (stage.level > fromLevel) {
                        updateLevelIfNotLocked(stage.level, stage.count);
                    }
                });
            }
        }
    }
    
    /**
     * Handle quality change
     * Quality affects:
     * - Material cost multiplier for that level
     * - Survival rate for cascade calculations (L15+)
     * - Starting template estimate (since different qualities use different materials)
     */
    function onQualityChange(level, quality) {
        const card = document.querySelector(`.template-card[data-level="${level}"]`);
        if (card) {
            card.setAttribute('data-quality', quality);
        }
        
        // Quality change affects material usage and cascade rates
        // Always recalculate the full recommended plan to get accurate estimates
        const materials = gatherMaterialsFromInputs();
        if (materials && Object.values(materials).some(v => v > 0)) {
            // Recalculate recommended plan with new quality settings
            calculateRecommendedPlan(materials);
            
            // Update the UI with new values
            updateTemplatePlanUI();
        } else {
            // No materials - just propagate cascade if L15+
            if (level >= 15) {
                const input = document.getElementById(`templateAmount${level}`);
                const count = parseInt(input?.value) || 0;
                if (count > 0) {
                    propagateCascadeFromLevel(level);
                }
            }
        }
        
        // Update carousel to reflect quality change
        updatePiecesCarousel(level);
        
        // Update summary
        updateTemplatePlanSummary();
    }
    
    /**
     * Reset all template inputs to recommended values
     * Triggers a full recalculation based on current materials and settings
     */
    function resetTemplatePlanToAuto() {
        // Clear all locked levels - reset to auto mode
        clearAllLocks();
        
        // Reset carousel states
        Object.keys(carouselState).forEach(key => {
            carouselState[key].currentIndex = 0;
        });
        
        // Recalculate from current materials
        const materials = gatherMaterialsFromInputs();
        if (materials && Object.values(materials).some(v => v > 0)) {
            calculateRecommendedPlan(materials);
        }
        
        // Update UI with fresh recommended values
        updateTemplatePlanUI();
        updateTemplatePlanSummary();
    }
    
    /**
     * Initialize Template Plan event listeners
     */
    function initTemplatePlanEvents() {
        // Input change handlers for each level
        TEMPLATE_LEVELS.forEach(level => {
            const input = document.getElementById(`templateAmount${level}`);
            const qualitySelect = document.getElementById(`temp${level}`);
            const card = document.querySelector(`.template-card[data-level="${level}"]`);
            
            if (input) {
                input.addEventListener('input', (e) => {
                    onTemplateInputChange(level, e.target.value);
                });
                
                input.addEventListener('focus', () => {
                    if (card) card.classList.add('focused');
                });
                
                input.addEventListener('blur', () => {
                    if (card) card.classList.remove('focused');
                });
                
                // Double-click on input to unlock and clear
                input.addEventListener('dblclick', () => {
                    if (isLevelLocked(level)) {
                        unlockLevel(level);
                        input.value = '';
                        // Trigger recalculation from materials
                        const materials = gatherMaterialsFromInputs();
                        if (materials && Object.values(materials).some(v => v > 0)) {
                            calculateRecommendedPlan(materials);
                            updateTemplatePlanUI();
                        }
                    }
                });
            }
            
            // Double-click on card to unlock
            if (card) {
                card.addEventListener('dblclick', (e) => {
                    // Don't trigger if clicking on input or quality select
                    if (e.target.closest('.template-card__input') || 
                        e.target.closest('.quality-select')) {
                        return;
                    }
                    
                    if (isLevelLocked(level)) {
                        unlockLevel(level);
                        if (input) input.value = '';
                        // Trigger recalculation from materials
                        const materials = gatherMaterialsFromInputs();
                        if (materials && Object.values(materials).some(v => v > 0)) {
                            calculateRecommendedPlan(materials);
                            updateTemplatePlanUI();
                        }
                    }
                });
            }
            
            if (qualitySelect) {
                qualitySelect.addEventListener('change', (e) => {
                    onQualityChange(level, e.target.value);
                });
                
                // Set initial quality color
                if (card) {
                    card.setAttribute('data-quality', qualitySelect.value);
                }
            }
        });
        
        // Carousel - simple horizontal scroll, no event handlers needed
        
        // Reset button (also clears all locks)
        const resetBtn = document.getElementById('resetToAutoBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetTemplatePlanToAuto);
        }
    }
    
    // Initialize Template Plan events when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTemplatePlanEvents);
    } else {
        initTemplatePlanEvents();
    }

    /**
     * Render cascade projection - now uses Template Plan
     * Kept for backward compatibility
     */
    function renderCascadeProjection(materials) {
        updateTemplatePlan(materials);
    }

    /**
     * Run the template planner (legacy support)
     */
    function runTemplatePlanner() {
        const materials = gatherMaterialsFromInputs();
        updateTemplatePlan(materials);
    }

    // Keep the old runOptimization for backwards compatibility
    function runOptimization(strategy = 'balanced') {
        runTemplatePlanner();
    }

    /**
     * Populate template input fields from cascade projection data
     * This bridges the cascade projection to the craftparse.js calculation
     */
    /**
     * Populate template inputs from cascade data
     * RESPECTS manual inputs: only fills empty fields, preserves user changes
     */
    function populateTemplateInputsFromCascade() {
        const levels = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
        
        // Locked levels are already tracked in the lockedLevels object
        // No need to capture them again
        const hasAnyLocked = Object.keys(lockedLevels).length > 0;
        console.log('Locked levels:', { ...lockedLevels });
        
        // If no cascade exists, generate it first
        if (!window.currentTemplatePlan?.cascade) {
            console.log('No cascade data found, generating...');
            const materials = gatherMaterialsFromInputs();
            if (Object.keys(materials).length > 0) {
                renderCascadeProjection(materials);
            } else {
                console.warn('No materials entered to calculate cascade');
                alert('Please enter materials first to calculate templates.');
                return;
            }
        }
        
        const cascade = window.currentTemplatePlan?.cascade;
        const craftingPlan = window.currentTemplatePlan?.craftingPlan;
        
        if (!cascade || cascade.length === 0) {
            console.warn('No cascade data available to populate template inputs');
            alert('Could not generate cascade projection. Please check your materials.');
            return;
        }

        console.log('Populating template inputs from cascade (respecting locked values):', cascade);

        // Populate from cascade data
        // Use locked values where they exist, otherwise use cascade
        cascade.forEach(stage => {
            const level = stage.level;
            const input = document.getElementById(`templateAmount${level}`);
            
            if (input) {
                // Use locked value if this level is locked
                if (isLevelLocked(level)) {
                    const lockedValue = lockedLevels[level];
                    input.value = lockedValue > 0 ? lockedValue.toString() : '0';
                    console.log(`L${level}: Using LOCKED value ${lockedValue}`);
                    return;
                }
                
                // For levels with crafting plan, sum up all pieces
                const planPieces = craftingPlan?.[level];
                let count = stage.count;
                
                if (planPieces && planPieces.length > 0) {
                    count = planPieces.reduce((sum, piece) => sum + piece.count, 0);
                }
                
                // Only set if count > 0
                if (count > 0) {
                    input.value = count;
                    console.log(`L${level}: Set from cascade ${count}`);
                }
            }
        });

        // Only set quality selects if NO locked levels exist (first time setup)
        // If user has locked any input, respect all quality selections as-is
        if (!hasAnyLocked) {
            levels.forEach(level => {
                const select = document.getElementById(`temp${level}`);
                if (select) {
                    // L1-10: Legendary (typical), L15-25: Exquisite, L30-35: Fine, L40+: Common
                    let quality = 'legendary';
                    if (level >= 15 && level <= 25) quality = 'exquisite';
                    else if (level >= 30 && level <= 35) quality = 'fine';
                    else if (level >= 40) quality = 'common';
                    
                    select.value = quality;
                }
            });
            console.log('Quality selects set to defaults (no locked values detected)');
        } else {
            console.log('Quality selects preserved (locked values detected)');
        }
        
        console.log('Template inputs populated from cascade');
    }

    /**
     * Gather all material amounts from input fields
     * @returns {object} - { 'my-material-id': amount }
     */
    function gatherMaterialsFromInputs() {
        const materials = {};
        
        // Read basic material inputs
        document.querySelectorAll('#yourMaterials .my-material input.numeric-input').forEach(input => {
            const rawValue = input.value;
            const value = parseInt((rawValue || '').replace(/,/g, '')) || 0;
            if (value > 0) {
                materials[input.id] = value;
            }
        });
        
        // Read gear material inputs
        document.querySelectorAll('#advMaterials .my-material input.numeric-input').forEach(input => {
            const rawValue = input.value;
            const value = parseInt((rawValue || '').replace(/,/g, '')) || 0;
            if (value > 0) {
                materials[input.id] = value;
            }
        });
        
        return materials;
    }

    /**
     * Show the manual templates configuration section
     */
    function showManualTemplates() {
        const toggle = document.getElementById('templatesToggle');
        const content = document.getElementById('templatesContent');
        
        if (toggle && content) {
            toggle.setAttribute('aria-expanded', 'true');
            content.style.display = 'block';
            
            // Scroll to templates section
            content.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Go to previous step
     */
    function goToPrevStep() {
        if (currentStep > 1) {
            currentStep--;
            updateWizardState();
        }
    }

    /**
     * Start a new calculation - show prompt for fresh start or continue with remaining
     */
    function startNewCalculation() {
        // Check if we have previous calculation data
        const hasRemainingMaterials = typeof remainingUse !== 'undefined' && 
                                       Object.keys(remainingUse).length > 0 &&
                                       typeof initialMaterials !== 'undefined' &&
                                       Object.keys(initialMaterials).length > 0;
        
        if (hasRemainingMaterials) {
            showNewCalcPrompt();
        } else {
            // No previous data, just start fresh
            doStartFresh();
        }
    }
    
    /**
     * Show the new calculation prompt modal
     */
    function showNewCalcPrompt() {
        // Create modal if it doesn't exist
        let modal = document.getElementById('newCalcModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'newCalcModal';
            modal.className = 'new-calc-modal';
            modal.innerHTML = `
                <div class="new-calc-modal__content">
                    <div class="new-calc-modal__header">
                        <h3>Start New Calculation</h3>
                    </div>
                    <div class="new-calc-modal__body">
                        <p>What would you like to do with your materials?</p>
                        <div class="new-calc-modal__options">
                            <button type="button" class="new-calc-option new-calc-option--continue" id="newCalcContinue">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="32" height="32">
                                    <path fill="currentColor" d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H352c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V80c0-17.7-14.3-32-32-32s-32 14.3-32 32v35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V432c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H160c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"/>
                                </svg>
                                <span class="option-title">Continue with Remaining</span>
                                <span class="option-desc">Subtract used materials and continue crafting</span>
                            </button>
                            <button type="button" class="new-calc-option new-calc-option--fresh" id="newCalcFresh">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="32" height="32">
                                    <path fill="currentColor" d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z"/>
                                </svg>
                                <span class="option-title">Start Fresh</span>
                                <span class="option-desc">Clear all materials and start over</span>
                            </button>
                        </div>
                    </div>
                    <div class="new-calc-modal__footer">
                        <button type="button" class="new-calc-modal__cancel" id="newCalcCancel">Cancel</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Bind modal events
            document.getElementById('newCalcContinue').addEventListener('click', () => {
                closeNewCalcModal();
                doContinueWithRemaining();
            });
            
            document.getElementById('newCalcFresh').addEventListener('click', () => {
                closeNewCalcModal();
                doStartFresh();
            });
            
            document.getElementById('newCalcCancel').addEventListener('click', closeNewCalcModal);
            
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeNewCalcModal();
                }
            });
        }
        
        modal.style.display = 'flex';
    }
    
    /**
     * Close the new calculation modal
     */
    function closeNewCalcModal() {
        const modal = document.getElementById('newCalcModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    /**
     * Continue with remaining materials (subtract used from initial)
     */
    function doContinueWithRemaining() {
        // Calculate remaining materials
        const remaining = {};
        
        if (typeof initialMaterials !== 'undefined' && typeof remainingUse !== 'undefined') {
            // Create a normalized key map for matching
            const normalizeKey = (key) => key.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            // Build map from initial materials
            for (const [key, value] of Object.entries(initialMaterials)) {
                remaining[key] = value;
            }
            
            // Subtract used amounts
            for (const [usedKey, usedAmount] of Object.entries(remainingUse)) {
                // Find matching key in remaining
                const normalizedUsed = normalizeKey(usedKey);
                for (const [remKey, remValue] of Object.entries(remaining)) {
                    const normalizedRem = normalizeKey(remKey);
                    if (normalizedUsed === normalizedRem || 
                        normalizedUsed.includes(normalizedRem) || 
                        normalizedRem.includes(normalizedUsed)) {
                        remaining[remKey] = Math.max(0, remValue - usedAmount);
                        break;
                    }
                }
            }
        }
        
        // Reset wizard state
        currentStep = 1;
        elements.progressSteps.forEach(step => {
            step.classList.remove('completed');
        });
        
        // Clear results
        const resultsContainer = document.getElementById('results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
        
        // Populate inputs with remaining materials
        for (const [key, value] of Object.entries(remaining)) {
            const input = document.getElementById(`my-${key.toLowerCase().replace(/\s+/g, '-')}`);
            if (input && value > 0) {
                input.value = value;
                const parent = input.closest('.my-material');
                if (parent) {
                    parent.classList.add('active');
                }
            }
        }
        
        // Reset the tracking variables
        if (typeof remainingUse !== 'undefined') {
            Object.keys(remainingUse).forEach(key => delete remainingUse[key]);
        }
        
        updateWizardState();
    }
    
    /**
     * Start completely fresh (clear all materials)
     */
    function doStartFresh() {
        currentStep = 1;
        
        // Remove completed states
        elements.progressSteps.forEach(step => {
            step.classList.remove('completed');
        });

        // Clear results
        const resultsContainer = document.getElementById('results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
        
        // Clear all material inputs
        document.querySelectorAll('.my-material input.numeric-input').forEach(input => {
            input.value = '';
            const parent = input.closest('.my-material');
            if (parent) {
                parent.classList.remove('active');
            }
        });
        
        // Reset global variables if they exist
        if (typeof initialMaterials !== 'undefined') {
            Object.keys(initialMaterials).forEach(key => delete initialMaterials[key]);
        }
        if (typeof remainingUse !== 'undefined') {
            Object.keys(remainingUse).forEach(key => delete remainingUse[key]);
        }

        updateWizardState();
    }

    /**
     * Update wizard UI state based on current step
     */
    function updateWizardState() {
        // Update progress indicator
        elements.progressSteps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.toggle('active', stepNum === currentStep);
        });

        // Update connectors
        elements.connectors.forEach((connector, index) => {
            const stepNum = index + 1;
            connector.classList.toggle('completed', stepNum < currentStep);
        });

        // Update wizard step visibility
        elements.wizardSteps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.toggle('active', stepNum === currentStep);
        });

        // Update navigation buttons
        updateNavigationButtons();

        // Scroll to top of wizard
        document.querySelector('.wizard-content')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    /**
     * Update navigation button states
     */
    function updateNavigationButtons() {
        // Previous button
        if (elements.prevBtn) {
            elements.prevBtn.disabled = currentStep === 1;
            elements.prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
        }

        // Next button - hide on step 2 (show calculate instead) and step 3
        if (elements.nextBtn) {
            elements.nextBtn.style.display = (currentStep >= 2) ? 'none' : 'inline-flex';
        }

        // Calculate button - show on step 2
        if (elements.calculateBtn) {
            elements.calculateBtn.style.display = (currentStep === 2) ? 'inline-flex' : 'none';
        }

        // New calculation button - show only on step 3 (results)
        if (elements.newCalcBtn) {
            elements.newCalcBtn.style.display = (currentStep === 3) ? 'inline-flex' : 'none';
        }
    }

    /**
     * Public method to show results step (called from craftparse.js)
     */
    window.wizardShowResults = function() {
        goToStep(3);
    };

    /**
     * Public method to go to a specific step
     */
    window.wizardGoToStep = function(step) {
        // Reset completed states when going back to step 1
        if (step === 1) {
            elements.progressSteps.forEach(s => s.classList.remove('completed'));
        }
        goToStep(step);
    };

    /**
     * Public method to get current step
     */
    window.wizardGetCurrentStep = function() {
        return currentStep;
    };

    /**
     * Public method to reset wizard progress
     */
    window.wizardResetProgress = function() {
        elements.progressSteps.forEach(step => {
            step.classList.remove('completed');
        });
        currentStep = 1;
        updateWizardState();
    };

    /**
     * Public method to populate template inputs from cascade data
     * Called by craftparse.js before calculation
     */
    window.wizardPopulateTemplateInputs = function() {
        populateTemplateInputsFromCascade();
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

