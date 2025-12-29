/**
 * OCR Scanner for Material Detection
 * Uses Tesseract.js to extract material quantities from game screenshots
 * Supports multiple screenshots with combined results
 */

(function() {
    'use strict';

    // Material name mappings (lowercase for matching)
    // This includes both basic materials (season 0) and advanced/gear materials (seasons 1-12)
    const MATERIAL_MAPPINGS = {
        // Basic Materials (Season 0)
        'black iron': 'my-black-iron',
        'blackiron': 'my-black-iron',
        'copper bar': 'my-copper-bar',
        'copperbar': 'my-copper-bar',
        'copper ba': 'my-copper-bar',  // OCR truncation
        'dragonglass': 'my-dragonglass',
        'dragon glass': 'my-dragonglass',
        'dragongiass': 'my-dragonglass',  // OCR l/i confusion
        'dragong1ass': 'my-dragonglass',  // OCR l->1
        'oragonglass': 'my-dragonglass',  // OCR D->O
        'goldenheart wood': 'my-goldenheart-wood',
        'goldenheart': 'my-goldenheart-wood',
        'goldenheartwood': 'my-goldenheart-wood',
        'hide': 'my-hide',
        'ironwood': 'my-ironwood',
        'iron wood': 'my-ironwood',
        'kingswood oak': 'my-kingswood-oak',
        'kingswoodoak': 'my-kingswood-oak',
        'kingswood': 'my-kingswood-oak',
        'leather straps': 'my-leather-straps',
        'leatherstraps': 'my-leather-straps',
        'leather strap': 'my-leather-straps',
        'ieather straps': 'my-leather-straps',  // OCR L->i
        'leather 5traps': 'my-leather-straps',  // OCR S->5
        'leather strap5': 'my-leather-straps',  // OCR S->5
        'leatherstrap': 'my-leather-straps',
        'milk of the poppy': 'my-milk-of-the-poppy',
        'milkofthepoppy': 'my-milk-of-the-poppy',
        'milk poppy': 'my-milk-of-the-poppy',
        'poppy': 'my-milk-of-the-poppy',
        'silk': 'my-silk',
        'weirwood': 'my-weirwood',
        'weir wood': 'my-weirwood',
        'wildfire': 'my-wildfire',
        'wild fire': 'my-wildfire',
        
        // Season 1 Materials
        'abalone': 'my-abalone',
        'blackfyre penny': 'my-blackfyre-penny',
        'blackfyrepenny': 'my-blackfyre-penny',
        'bone': 'my-bone',
        'driftwood': 'my-driftwood',
        'golden claw': 'my-golden-claw',
        'goldenclaw': 'my-golden-claw',
        'horse hide': 'my-horse-hide',
        'horsehide': 'my-horse-hide',
        'lock of hair': 'my-lock-of-hair',
        'lockofhair': 'my-lock-of-hair',
        'pinecone': 'my-pinecone',
        'qartheen jeweled beetle': 'my-qartheen-jeweled-beetle',
        'jeweled beetle': 'my-qartheen-jeweled-beetle',
        'raven feather': 'my-raven-feather',
        'ravenfeather': 'my-raven-feather',
        
        // Season 2 Materials
        'bucket of tar': 'my-bucket-of-tar',
        'bucketoftar': 'my-bucket-of-tar',
        'cockle shell': 'my-cockle-shell',
        'cockleshell': 'my-cockle-shell',
        'dragon spine': 'my-dragon-spine',
        'dragonspine': 'my-dragon-spine',
        'golden thread': 'my-golden-thread',
        'goldenthread': 'my-golden-thread',
        'hoof': 'my-hoof',
        'horsehair tassel': 'my-horsehair-tassel',
        'horsehairtassel': 'my-horsehair-tassel',
        'horsehoe': 'my-horsehoe',
        'horseshoe': 'my-horsehoe',
        
        // Season 3 Materials
        'ancient leather': 'my-ancient-leather',
        'ancientleather': 'my-ancient-leather',
        'battered ringmail': 'my-battered-ringmail',
        'batteredringmail': 'my-battered-ringmail',
        'black leather': 'my-black-leather',
        'blackleather': 'my-black-leather',
        'conqueror shagreen': 'my-conqueror-shagreen',
        'conquerorshagreen': 'my-conqueror-shagreen',
        'floral silk': 'my-floral-silk',
        'floralsilk': 'my-floral-silk',
        'kingsguard emblems': 'my-kingsguard-emblems',
        'kingsguardemblems': 'my-kingsguard-emblems',
        'silvered steel': 'my-silvered-steel',
        'silveredsteel': 'my-silvered-steel',
        
        // Season 4 Materials
        'black scalemail': 'my-black-scalemail',
        'blackscalemail': 'my-black-scalemail',
        'cloth-of-silver': 'my-cloth-of-silver',
        'cloth of silver': 'my-cloth-of-silver',
        'clothofsilver': 'my-cloth-of-silver',
        'composite cloth': 'my-composite-cloth',
        'compositecloth': 'my-composite-cloth',
        'gilded plates': 'my-gilded-plates',
        'gildedplates': 'my-gilded-plates',
        'heavy brocade': 'my-heavy-brocade',
        'heavybrocade': 'my-heavy-brocade',
        'leather and fletchings': 'my-leather-and-fletchings',
        'leatherandfletchings': 'my-leather-and-fletchings',
        'stag hide': 'my-stag-hide',
        'staghide': 'my-stag-hide',
        
        // Season 5 Materials
        'crimson taffeta': 'my-crimson-taffeta',
        'crimsontaffeta': 'my-crimson-taffeta',
        'green chiffon': 'my-green-chiffon',
        'greenchiffon': 'my-green-chiffon',
        'pilfered boots': 'my-pilfered-boots',
        'pilferedboots': 'my-pilfered-boots',
        'red clay tiles': 'my-red-clay-tiles',
        'redclaytiles': 'my-red-clay-tiles',
        'royal samite': 'my-royal-samite',
        'royalsamite': 'my-royal-samite',
        'scavenged bone': 'my-scavenged-bone',
        'scavengedbone': 'my-scavenged-bone',
        'stitched leather': 'my-stitched-leather',
        'stitchedleather': 'my-stitched-leather',
        
        // Season 6 Materials
        'alligator skins': 'my-alligator-skins',
        'alligatorskins': 'my-alligator-skins',
        'hardened leather': 'my-hardened-leather',
        'hardenedleather': 'my-hardened-leather',
        'lavish silk': 'my-lavish-silk',
        'lavishsilk': 'my-lavish-silk',
        'rimed leather': 'my-rimed-leather',
        'rimedleather': 'my-rimed-leather',
        'royal velvet': 'my-royal-velvet',
        'royalvelvet': 'my-royal-velvet',
        'seawater cloth': 'my-seawater-cloth',
        'seawatercloth': 'my-seawater-cloth',
        'weirwood sap': 'my-weirwood-sap',
        'weirwoodsap': 'my-weirwood-sap',
        
        // Season 7 Materials
        'boiled leather': 'my-boiled-leather',
        'boiledleather': 'my-boiled-leather',
        'drowned leather': 'my-drowned-leather',
        'drownedleather': 'my-drowned-leather',
        'fur-lined leather': 'my-fur-lined-leather',
        'fur lined leather': 'my-fur-lined-leather',
        'furlinedleather': 'my-fur-lined-leather',
        'linked mail': 'my-linked-mail',
        'linkedmail': 'my-linked-mail',
        'luxurious linen': 'my-luxurious-linen',
        'luxuriouslinen': 'my-luxurious-linen',
        'sundry steel': 'my-sundry-steel',
        'sundrysteel': 'my-sundry-steel',
        'untarnished leather': 'my-untarnished-leather',
        'untarnishedleather': 'my-untarnished-leather',
        
        // Season 8 Materials
        'dark steel plate': 'my-dark-steel-plate',
        'darksteelplate': 'my-dark-steel-plate',
        'dragon tempered fabrics': 'my-dragon-tempered-fabrics',
        'dragontempered': 'my-dragon-tempered-fabrics',
        'gilded mail': 'my-gilded-mail',
        'gildedmail': 'my-gilded-mail',
        'northern fox pelts': 'my-northern-fox-pelts',
        'northernfoxpelts': 'my-northern-fox-pelts',
        'ritual cloths': 'my-ritual-cloths',
        'ritualcloths': 'my-ritual-cloths',
        'silk brocade': 'my-silk-brocade',
        'silkbrocade': 'my-silk-brocade',
        'targaryen embroidery': 'my-targaryen-embroidery',
        'targaryenembroidery': 'my-targaryen-embroidery',
        
        // Season 9 Materials
        'bronze discs': 'my-bronze-discs',
        'bronzediscs': 'my-bronze-discs',
        'hardy silks': 'my-hardy-silks',
        'hardysilks': 'my-hardy-silks',
        'kingsguard leather': 'my-kingsguard-leather',
        'kingsguardleather': 'my-kingsguard-leather',
        'liberator silk': 'my-liberator-silk',
        'liberatorsilk': 'my-liberator-silk',
        'motley cloth': 'my-motley-cloth',
        'motleycloth': 'my-motley-cloth',
        'northern leathers': 'my-northern-leathers',
        'northernleathers': 'my-northern-leathers',
        'steel scales': 'my-steel-scales',
        'steelscales': 'my-steel-scales',
        
        // Season 10 Materials
        'fishmonger fishing net': 'my-fishmongers-fishing-net',
        'fishmongers fishing net': 'my-fishmongers-fishing-net',
        'fishing net': 'my-fishmongers-fishing-net',
        'heraldic finery': 'my-heraldic-finery',
        'heraldicfinery': 'my-heraldic-finery',
        'hightower silk': 'my-hightower-silk',
        'hightowersilk': 'my-hightower-silk',
        'iron scales': 'my-iron-scales',
        'ironscales': 'my-iron-scales',
        'leather bound chains': 'my-leather-bound-chains',
        'leatherboundchains': 'my-leather-bound-chains',
        'sanguine thread': 'my-sanguine-thread',
        'sanguinethread': 'my-sanguine-thread',
        'umber chains': 'my-umber-chains',
        'umberchains': 'my-umber-chains',
        
        // Season 11 Materials
        'ash cloaked clow': 'my-ash-cloaked-clow',
        'ashcloakedclow': 'my-ash-cloaked-clow',
        'charred driftwood': 'my-charred-driftwood',
        'charreddriftwood': 'my-charred-driftwood',
        'frostbitten leather': 'my-frostbitten-leather',
        'frostbittenleather': 'my-frostbitten-leather',
        'frozen weirwood sap': 'my-frozen-weirwood-sap',
        'frozenweirwoodsap': 'my-frozen-weirwood-sap',
        'greenfyre penny': 'my-greenfyre-penny',
        'greenfyrepenny': 'my-greenfyre-penny',
        'iron laurel': 'my-iron-laurel',
        'ironlaurel': 'my-iron-laurel',
        'targaryen cloth bolt': 'my-targaryen-cloth-bolt',
        'targaryenclothbolt': 'my-targaryen-cloth-bolt',
        
        // Season 12 Materials
        'burning stag hide': 'my-burning-stag-hide',
        'burningstaghide': 'my-burning-stag-hide',
        'combusted leather': 'my-combusted-leather',
        'combustedleather': 'my-combusted-leather',
        'fireborn silk': 'my-fireborn-silk',
        'firebornsilk': 'my-fireborn-silk',
        'frost crusted abalone': 'my-frost-crusted-abalone',
        'frostcrustedabalone': 'my-frost-crusted-abalone',
        'frostfang bronze discs': 'my-frostfang-bronze-discs',
        'frostfangbronzediscs': 'my-frostfang-bronze-discs',
        'myrish lace': 'my-myrish-lace',
        'myrishlace': 'my-myrish-lace',
        'scorched horsehair tassel': 'my-scorched-horsehair-tassel',
        'scorchedhorsehair': 'my-scorched-horsehair-tassel'
    };

    // Material display info - dynamically built from materials.js if available
    // Falls back to basic materials if materials.js isn't loaded yet
    let MATERIAL_INFO = {};
    
    // Build MATERIAL_INFO from materials.js data
    function buildMaterialInfo() {
        if (typeof materials !== 'undefined') {
            MATERIAL_INFO = {};
            for (const seasonKey of Object.keys(materials)) {
                const season = materials[seasonKey];
                for (const [matKey, matInfo] of Object.entries(season.mats)) {
                    const inputId = `my-${matKey}`;
                    MATERIAL_INFO[inputId] = {
                        name: matInfo['Original-name'],
                        img: matInfo.img,
                        season: season.season
                    };
                }
            }
        } else {
            // Fallback to basic materials only
            MATERIAL_INFO = {
                'my-black-iron': { name: 'Black Iron', img: 'materials/icon_crafting_blackiron.webp', season: 0 },
                'my-copper-bar': { name: 'Copper Bar', img: 'materials/icon_crafting_copper_bar.webp', season: 0 },
                'my-dragonglass': { name: 'Dragonglass', img: 'materials/icon_crafting_dragonglass.webp', season: 0 },
                'my-goldenheart-wood': { name: 'Goldenheart Wood', img: 'materials/icon_crafting_goldenheart_wood.webp', season: 0 },
                'my-hide': { name: 'Hide', img: 'materials/icon_crafting_hide.webp', season: 0 },
                'my-ironwood': { name: 'Ironwood', img: 'materials/icon_crafting_ironwood.webp', season: 0 },
                'my-kingswood-oak': { name: 'Kingswood Oak', img: 'materials/icon_crafting_kingswood_oak.webp', season: 0 },
                'my-leather-straps': { name: 'Leather Straps', img: 'materials/icon_crafting_leather_straps.webp', season: 0 },
                'my-milk-of-the-poppy': { name: 'Milk of the Poppy', img: 'materials/icon_crafting_milk_of_the_poppy.webp', season: 0 },
                'my-silk': { name: 'Silk', img: 'materials/icon_crafting_silk.webp', season: 0 },
                'my-weirwood': { name: 'Weirwood', img: 'materials/icon_crafting_weir_wood.webp', season: 0 },
                'my-wildfire': { name: 'Wildfire', img: 'materials/icon_crafting_wild_fire.webp', season: 0 }
            };
        }
    }
    
    // Initialize on load
    buildMaterialInfo();

    // Display order for materials - built dynamically
    // Basic materials first (season 0), then by season number
    function getMaterialOrder() {
        const order = [];
        if (typeof materials !== 'undefined') {
            // Sort seasons: 0 first, then ascending
            const seasonKeys = Object.keys(materials).map(Number).sort((a, b) => {
                if (a === 0) return -1;
                if (b === 0) return 1;
                return a - b;
            });
            
            for (const seasonKey of seasonKeys) {
                const season = materials[seasonKey];
                for (const matKey of Object.keys(season.mats)) {
                    order.push(`my-${matKey}`);
                }
            }
        } else {
            // Fallback
            order.push(
                'my-black-iron', 'my-copper-bar', 'my-dragonglass', 'my-goldenheart-wood',
                'my-hide', 'my-ironwood', 'my-kingswood-oak', 'my-leather-straps',
                'my-milk-of-the-poppy', 'my-silk', 'my-weirwood', 'my-wildfire'
            );
        }
        return order;
    }

    // Quality tier multipliers (to convert back to Poor equivalent)
    // 4 Poor = 1 Common, 4 Common = 1 Fine, etc.
    const QUALITY_MULTIPLIERS = [1, 4, 16, 64, 256, 1024]; // Poor, Common, Fine, Exquisite, Epic, Legendary
    const QUALITY_NAMES = ['Poor', 'Common', 'Fine', 'Exquisite', 'Epic', 'Legendary'];

    // State
    let uploadedImages = []; // Array of { id, dataUrl, status, materials, rawText, processedImage }
    let combinedMaterials = {};
    let imageIdCounter = 0;
    let ocrWorker = null;

    // DOM Elements
    const dropZone = document.getElementById('screenshotDropZone');
    const fileInput = document.getElementById('screenshotInput');
    const gallery = document.getElementById('screenshotsGallery');
    const galleryCount = document.getElementById('galleryCount');
    const galleryImages = document.getElementById('galleryImages');
    const addMoreBtn = document.getElementById('addMoreScreenshots');
    const clearAllBtn = document.getElementById('clearAllScreenshots');
    const progressSection = document.getElementById('ocrProgress');
    const progressFill = document.getElementById('ocrProgressFill');
    const statusText = document.getElementById('ocrStatus');
    const resultsSection = document.getElementById('ocrResults');
    const detectedMaterialsEl = document.getElementById('detectedMaterials');
    const detectedMaterialsToggle = document.getElementById('detectedMaterialsToggle');
    const detectedMaterialsCount = document.getElementById('detectedMaterialsCount');
    const applyBtn = document.getElementById('applyDetectedMaterials');

    // Initialize event listeners
    function init() {
        if (!dropZone) return;
        
        // Rebuild material info now that materials.js should be loaded
        buildMaterialInfo();

        // Click to upload
        dropZone.addEventListener('click', () => fileInput.click());

        // File input change
        fileInput.addEventListener('change', handleFileSelect);

        // Drag and drop
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);

        // Add more button
        addMoreBtn.addEventListener('click', () => fileInput.click());

        // Clear all button
        clearAllBtn.addEventListener('click', resetUpload);

        // Apply detected materials
        applyBtn.addEventListener('click', applyMaterials);

        // Paste from clipboard
        document.addEventListener('paste', handlePaste);
        
        // Accordion toggle for detected materials
        if (detectedMaterialsToggle) {
            detectedMaterialsToggle.addEventListener('click', () => {
                const isExpanded = detectedMaterialsToggle.getAttribute('aria-expanded') === 'true';
                detectedMaterialsToggle.setAttribute('aria-expanded', !isExpanded);
                detectedMaterialsEl.classList.toggle('collapsed', isExpanded);
            });
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');

        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) {
            processFiles(files);
        }
    }

    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            processFiles(files);
            fileInput.value = ''; // Reset so same files can be selected again
        }
    }

    function handlePaste(e) {
        const items = e.clipboardData?.items;
        if (!items) return;

        const imageFiles = [];
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    imageFiles.push(file);
                }
            }
        }

        if (imageFiles.length > 0) {
            processFiles(imageFiles);
            e.preventDefault();
        }
    }

    function processFiles(files) {
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                addImageToGallery(e.target.result);
            };
            reader.readAsDataURL(file);
        });
    }

    function addImageToGallery(dataUrl) {
        const imageId = ++imageIdCounter;
        const imageData = {
            id: imageId,
            dataUrl: dataUrl,
            status: 'pending',
            materials: {}
        };
        uploadedImages.push(imageData);

        // Show gallery, hide drop zone
        gallery.style.display = 'block';
        dropZone.style.display = 'none';

        // Create gallery item
        const item = document.createElement('div');
        item.className = 'gallery-image-item';
        item.id = `gallery-item-${imageId}`;
        item.innerHTML = `
            <img src="${dataUrl}" alt="Screenshot ${imageId}">
            <button type="button" class="remove-image-btn" data-id="${imageId}" aria-label="Remove">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M345 137c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-119 119L73 103c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l119 119L39 375c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l119-119L311 409c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-119-119L345 137z"/></svg>
            </button>
            <div class="scan-status" id="scan-status-${imageId}"></div>
        `;

        // Add remove handler
        item.querySelector('.remove-image-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeImage(imageId);
        });

        galleryImages.appendChild(item);
        updateGalleryCount();

        // Start OCR for this image
        performOCR(imageData);
    }

    function removeImage(imageId) {
        uploadedImages = uploadedImages.filter(img => img.id !== imageId);
        const item = document.getElementById(`gallery-item-${imageId}`);
        if (item) {
            item.remove();
        }

        updateGalleryCount();
        updateCombinedResults();

        if (uploadedImages.length === 0) {
            resetUpload();
        }
    }

    function updateGalleryCount() {
        const count = uploadedImages.length;
        galleryCount.textContent = `${count} screenshot${count !== 1 ? 's' : ''}`;
    }

    function resetUpload() {
        uploadedImages = [];
        combinedMaterials = {};
        galleryImages.innerHTML = '';
        gallery.style.display = 'none';
        progressSection.style.display = 'none';
        resultsSection.style.display = 'none';
        dropZone.style.display = 'block';
        fileInput.value = '';
    }

    async function getOCRWorker() {
        if (!ocrWorker) {
            statusText.textContent = 'Initializing OCR engine...';
            progressSection.style.display = 'block';
            progressFill.style.width = '10%';

            ocrWorker = await Tesseract.createWorker('eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        progressFill.style.width = `${progress}%`;
                    }
                }
            });

            // Set parameters to improve recognition
            await ocrWorker.setParameters({
                preserve_interword_spaces: '1',
                tessedit_pageseg_mode: '6', // Assume uniform block of text
            });
        }
        return ocrWorker;
    }

    async function performOCR(imageData) {
        const statusEl = document.getElementById(`scan-status-${imageData.id}`);
        if (statusEl) {
            statusEl.className = 'scan-status scanning';
        }

        progressSection.style.display = 'block';
        statusText.textContent = `Processing image ${imageData.id}...`;

        try {
            const worker = await getOCRWorker();
            
            // Try multiple preprocessing methods and combine results
            const preprocessMethods = [
                { name: 'threshold', fn: preprocessThreshold },
                { name: 'contrast', fn: preprocessHighContrast },
                { name: 'original', fn: (url) => Promise.resolve(url) }
            ];
            
            let allTexts = [];
            let allMaterials = {};
            let bestProcessedImage = null;
            
            for (let i = 0; i < preprocessMethods.length; i++) {
                const method = preprocessMethods[i];
                statusText.textContent = `Scanning image ${imageData.id} (method ${i + 1}/${preprocessMethods.length})...`;
                
                try {
                    const processedImage = await method.fn(imageData.dataUrl);
                    if (i === 0) bestProcessedImage = processedImage;
                    
                    const { data: { text } } = await worker.recognize(processedImage);
                    
                    // Parse and merge results
                    const materials = parseOCRText(text);
                    const foundMaterials = Object.keys(materials).map(k => MATERIAL_INFO[k]?.name || k).join(', ');
                    allTexts.push(`--- ${method.name} ---\n${text}\n\n[Found: ${foundMaterials || 'none'}]`);
                    
                    for (const [key, value] of Object.entries(materials)) {
                        if (!allMaterials[key]) {
                            allMaterials[key] = value;
                        } else {
                            // Smart value selection: when values are ~10x apart, prefer smaller
                            // This handles OCR decimal drops (3.6M read as 36M)
                            const existing = allMaterials[key];
                            const ratio = Math.max(existing, value) / Math.min(existing, value);
                            
                            if (ratio >= 8 && ratio <= 12) {
                                // Values are ~10x apart - likely a decimal drop issue
                                // Prefer the smaller value (it's probably correct)
                                allMaterials[key] = Math.min(existing, value);
                                console.log(`Decimal correction: ${key} - chose ${Math.min(existing, value)} over ${Math.max(existing, value)} (ratio: ${ratio.toFixed(1)})`);
                            } else {
                                // Values are similar or very different - take the higher one
                                allMaterials[key] = Math.max(existing, value);
                            }
                        }
                    }
                    
                    // Merge detailed results
                    if (window._ocrDetailedResults) {
                        imageData.detailedResults = imageData.detailedResults || {};
                        for (const [key, detail] of Object.entries(window._ocrDetailedResults)) {
                            if (!imageData.detailedResults[key] || 
                                (detail.total > (imageData.detailedResults[key].total || 0))) {
                                imageData.detailedResults[key] = detail;
                            }
                        }
                    }
                } catch (e) {
                    console.error(`Method ${method.name} failed:`, e);
                }
            }
            
            imageData.processedImage = bestProcessedImage;
            imageData.rawText = allTexts.join('\n\n');
            imageData.materials = allMaterials;
            imageData.status = 'complete';

            if (statusEl) {
                statusEl.className = 'scan-status complete';
            }

            // Update combined results
            updateCombinedResults();

        } catch (error) {
            console.error('OCR Error:', error);
            imageData.status = 'error';
            imageData.rawText = 'Error: ' + error.message;
            if (statusEl) {
                statusEl.className = 'scan-status error';
            }
        }

        // Check if all images are processed
        const pendingImages = uploadedImages.filter(img => img.status === 'pending');
        if (pendingImages.length === 0) {
            progressSection.style.display = 'none';
        }
    }

    // Preprocess method 1: Threshold-based for dark backgrounds
    async function preprocessThreshold(dataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const scale = 2;
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    
                    // Detect text colors (gold headers, white numbers)
                    const isGoldText = r > 140 && g > 100 && b < 150 && r > b;
                    const isWhiteText = r > 150 && g > 150 && b > 150;
                    const isBrightPixel = gray > 110;
                    
                    const newValue = (isGoldText || isWhiteText || isBrightPixel) ? 0 : 255;
                    
                    data[i] = newValue;
                    data[i + 1] = newValue;
                    data[i + 2] = newValue;
                }
                
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = dataUrl;
        });
    }

    // Preprocess method 2: High contrast grayscale (inverted)
    async function preprocessHighContrast(dataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const scale = 2;
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // Grayscale
                    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    
                    // Increase contrast
                    gray = ((gray - 128) * 2) + 128;
                    gray = Math.max(0, Math.min(255, gray));
                    
                    // Invert (dark bg -> light bg)
                    gray = 255 - gray;
                    
                    data[i] = gray;
                    data[i + 1] = gray;
                    data[i + 2] = gray;
                }
                
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = dataUrl;
        });
    }

    function updateCombinedResults() {
        // Combine materials from all scanned images
        combinedMaterials = {};
        window._ocrDetailedResults = {};
        
        for (const imageData of uploadedImages) {
            if (imageData.status === 'complete') {
                for (const [inputId, amount] of Object.entries(imageData.materials)) {
                    if (!combinedMaterials[inputId]) {
                        combinedMaterials[inputId] = amount;
                        if (imageData.detailedResults && imageData.detailedResults[inputId]) {
                            window._ocrDetailedResults[inputId] = imageData.detailedResults[inputId];
                        }
                    } else {
                        // Smart value selection: when values are ~10x apart, prefer smaller
                        // This handles OCR decimal drops (3.6M read as 36M)
                        const existing = combinedMaterials[inputId];
                        const ratio = Math.max(existing, amount) / Math.min(existing, amount);
                        
                        if (ratio >= 8 && ratio <= 12) {
                            // Values are ~10x apart - likely a decimal drop issue
                            // Prefer the smaller value (it's probably correct)
                            combinedMaterials[inputId] = Math.min(existing, amount);
                        } else {
                            // Values are similar or very different - take the higher one
                            if (amount > existing) {
                                combinedMaterials[inputId] = amount;
                                if (imageData.detailedResults && imageData.detailedResults[inputId]) {
                                    window._ocrDetailedResults[inputId] = imageData.detailedResults[inputId];
                                }
                            }
                        }
                    }
                }
            }
        }

        displayResults(combinedMaterials);
    }

    function parseOCRText(text) {
        const results = {};
        const detailedResults = {}; // Store breakdown by quality tier
        
        // Clean up OCR text - fix common OCR mistakes
        let cleanedText = text
            .replace(/[|l]/g, (match, offset, string) => {
                // If surrounded by digits, likely a 1
                const before = string[offset - 1];
                const after = string[offset + 1];
                if (/\d/.test(before) || /\d/.test(after)) return '1';
                return match;
            })
            .replace(/O/g, (match, offset, string) => {
                // If surrounded by digits, likely a 0
                const before = string[offset - 1];
                const after = string[offset + 1];
                if (/\d/.test(before) || /\d/.test(after)) return '0';
                return match;
            })
            .replace(/S(\d)/gi, '5$1') // S followed by digit -> 5
            .replace(/(\d)S/gi, '$15') // digit followed by S -> 5
            .replace(/B(\d)/g, '8$1')  // B before digit -> 8
            .replace(/(\d)B/g, '$18')  // digit before B -> 8
            .replace(/[Il1]\s*[Mm]\b/g, '91M')  // IM, lM, 1M alone -> likely 91M
            .replace(/(\d)[Il]([Mm])/g, '$11$2') // 9IM, 9lM -> 91M
            .replace(/[Il](\d)([Mm])/g, '1$1$2'); // I9M, l9M -> 19M
        
        console.log('OCR Raw Text:', text);
        console.log('OCR Cleaned Text:', cleanedText);

        // Try line-by-line parsing first (more reliable for game screenshots)
        const lineResults = parseByLines(cleanedText);
        if (Object.keys(lineResults.results).length > 0) {
            console.log('Line-by-line parsing found materials:', lineResults.results);
            Object.assign(results, lineResults.results);
            Object.assign(detailedResults, lineResults.detailed);
        }
        
        // Also try position-based parsing for any materials not found
        const materialPositions = findMaterialPositions(cleanedText);
        console.log('Found materials at positions:', materialPositions);
        
        // Log which materials were found for debugging
        const foundMaterialNames = materialPositions.map(m => m.materialName);
        console.log('Materials found in this text:', foundMaterialNames);

        // For each material, find ALL amounts between it and the next material
        for (let m = 0; m < materialPositions.length; m++) {
            const mat = materialPositions[m];
            
            // Skip if already found via line-by-line parsing
            if (results[mat.inputId]) {
                continue;
            }
            
            const startPos = mat.position + mat.materialName.length;
            const endPos = m < materialPositions.length - 1 
                ? materialPositions[m + 1].position 
                : cleanedText.length;
            
            // Get the text segment for this material
            const segment = cleanedText.substring(startPos, endPos);
            
            // Find all amounts in this segment (for all quality tiers)
            const amounts = findAllAmountsInSegment(segment);
            console.log(`${mat.materialName} amounts found:`, amounts);
            
            // Calculate total Poor equivalent
            let totalPoorEquivalent = 0;
            const tierBreakdown = [];
            
            // Process Poor tier (index 0)
            if (amounts[0] > 0) {
                totalPoorEquivalent += amounts[0];
                tierBreakdown.push({
                    tier: 'Poor',
                    amount: amounts[0],
                    multiplier: 1,
                    poorEquivalent: amounts[0]
                });
            }
            
            // Process Common tier (index 1) - only M values
            if (amounts[1] > 0) {
                const commonContribution = amounts[1] * 4;
                totalPoorEquivalent += commonContribution;
                tierBreakdown.push({
                    tier: 'Common',
                    amount: amounts[1],
                    multiplier: 4,
                    poorEquivalent: commonContribution
                });
            }
            
            // K values are shown but NOT included in total (tier unknown)
            const kValues = amounts.kValues || [];
            if (kValues.length > 0) {
                for (const kv of kValues) {
                    tierBreakdown.push({
                        tier: 'K (not counted)',
                        amount: kv,
                        multiplier: 0, // Not counted
                        poorEquivalent: 0
                    });
                }
            }
            
            if (totalPoorEquivalent > 0) {
                results[mat.inputId] = totalPoorEquivalent;
                detailedResults[mat.inputId] = {
                    name: mat.materialName,
                    tiers: tierBreakdown,
                    total: totalPoorEquivalent
                };
                console.log(`${mat.materialName} total Poor equivalent: ${totalPoorEquivalent}`, tierBreakdown);
            }
        }

        // Store detailed results for display
        window._ocrDetailedResults = detailedResults;

        return results;
    }
    
    // Parse OCR text line by line - more reliable for game screenshots
    // where materials and amounts appear on consecutive lines
    function parseByLines(text) {
        const results = {};
        const detailed = {};
        const lines = text.split(/\n/);
        
        // Build material patterns for matching
        const materialPatterns = buildMaterialPatterns();
        
        // Track which line indices we've associated with materials
        const usedLines = new Set();
        
        // First pass: find all material names and their line indices
        // IMPORTANT: Longer patterns must take priority to avoid false matches
        // e.g., "Frost Crusted Abalone" should NOT also match "Abalone"
        const materialLines = [];
        
        // Sort ALL materials by their longest pattern length (longest first)
        const sortedMaterialPatterns = [...materialPatterns].sort((a, b) => {
            const aMax = Math.max(...a.patterns.map(p => p.length));
            const bMax = Math.max(...b.patterns.map(p => p.length));
            return bMax - aMax;
        });
        
        for (let i = 0; i < lines.length; i++) {
            // Normalize the line: lowercase and collapse multiple spaces
            const lineLower = lines[i].toLowerCase().replace(/\s+/g, ' ');
            
            // Track which character positions on this line are already "claimed"
            const claimedPositions = new Set();
            
            for (const material of sortedMaterialPatterns) {
                // Sort patterns by length (longest first)
                const sortedPatterns = [...material.patterns].sort((a, b) => b.length - a.length);
                
                for (const pattern of sortedPatterns) {
                    // Also normalize the pattern
                    const normalizedPattern = pattern.replace(/\s+/g, ' ');
                    const matchPos = lineLower.indexOf(normalizedPattern);
                    if (matchPos !== -1) {
                        // Check if any character in this match range is already claimed
                        let isOverlapping = false;
                        for (let pos = matchPos; pos < matchPos + normalizedPattern.length; pos++) {
                            if (claimedPositions.has(pos)) {
                                isOverlapping = true;
                                break;
                            }
                        }
                        
                        if (isOverlapping) {
                            // This pattern overlaps with a longer match, skip it
                            continue;
                        }
                        
                        // Check if this material is already found nearby (within 3 lines)
                        const alreadyFound = materialLines.some(m => 
                            m.inputId === material.id && Math.abs(m.lineIndex - i) < 3
                        );
                        
                        if (!alreadyFound) {
                            // Claim the character positions for this match
                            for (let pos = matchPos; pos < matchPos + normalizedPattern.length; pos++) {
                                claimedPositions.add(pos);
                            }
                            
                            materialLines.push({
                                materialName: material.name,
                                inputId: material.id,
                                lineIndex: i,
                                lineText: lines[i],
                                matchedPattern: pattern
                            });
                            usedLines.add(i);
                        }
                        break; // Found this material on this line
                    }
                }
            }
        }
        
        console.log('Line-by-line: Found materials:', materialLines.map(m => `${m.materialName} at line ${m.lineIndex}`));
        
        // Second pass: for each material, look for amounts on same line or next few lines
        for (const mat of materialLines) {
            // Look at this line and the next 3 lines for amounts
            let searchText = '';
            for (let j = mat.lineIndex; j < Math.min(mat.lineIndex + 4, lines.length); j++) {
                // Stop if we hit another material name (except on the first line)
                if (j > mat.lineIndex) {
                    const isAnotherMaterial = materialLines.some(m => 
                        m.lineIndex === j && m.inputId !== mat.inputId
                    );
                    if (isAnotherMaterial) break;
                }
                searchText += ' ' + lines[j];
            }
            
            // Find amounts in this text
            const amounts = findAllAmountsInSegment(searchText);
            console.log(`Line-by-line: ${mat.materialName} amounts from lines ${mat.lineIndex}-${mat.lineIndex + 3}:`, amounts);
            
            // Calculate total Poor equivalent
            let totalPoorEquivalent = 0;
            const tierBreakdown = [];
            
            // Process Poor tier (index 0)
            if (amounts[0] > 0) {
                totalPoorEquivalent += amounts[0];
                tierBreakdown.push({
                    tier: 'Poor',
                    amount: amounts[0],
                    multiplier: 1,
                    poorEquivalent: amounts[0]
                });
            }
            
            // Process Common tier (index 1) - only M values
            if (amounts[1] > 0) {
                const commonContribution = amounts[1] * 4;
                totalPoorEquivalent += commonContribution;
                tierBreakdown.push({
                    tier: 'Common',
                    amount: amounts[1],
                    multiplier: 4,
                    poorEquivalent: commonContribution
                });
            }
            
            // K values are shown but NOT included in total (tier unknown)
            const kValues = amounts.kValues || [];
            if (kValues.length > 0) {
                for (const kv of kValues) {
                    tierBreakdown.push({
                        tier: 'K (not counted)',
                        amount: kv,
                        multiplier: 0,
                        poorEquivalent: 0
                    });
                }
            }
            
            if (totalPoorEquivalent > 0) {
                // Only update if this is a better result (higher value)
                if (!results[mat.inputId] || results[mat.inputId] < totalPoorEquivalent) {
                    results[mat.inputId] = totalPoorEquivalent;
                    detailed[mat.inputId] = {
                        name: mat.materialName,
                        tiers: tierBreakdown,
                        total: totalPoorEquivalent
                    };
                    console.log(`Line-by-line: ${mat.materialName} = ${totalPoorEquivalent}`, tierBreakdown);
                }
            }
        }
        
        return { results, detailed };
    }

    // Build material patterns from MATERIAL_MAPPINGS
    function buildMaterialPatterns() {
        // Group by input ID and collect all patterns
        const patternsByInput = {};
        
        for (const [pattern, inputId] of Object.entries(MATERIAL_MAPPINGS)) {
            if (!patternsByInput[inputId]) {
                patternsByInput[inputId] = {
                    id: inputId,
                    name: MATERIAL_INFO[inputId]?.name || pattern,
                    patterns: []
                };
            }
            patternsByInput[inputId].patterns.push(pattern);
        }
        
        // Convert to array and sort by name length (longest first for better matching)
        const result = Object.values(patternsByInput);
        result.sort((a, b) => {
            // Sort by longest pattern first
            const aMax = Math.max(...a.patterns.map(p => p.length));
            const bMax = Math.max(...b.patterns.map(p => p.length));
            return bMax - aMax;
        });
        
        return result;
    }

    // Find all material name positions in text
    function findMaterialPositions(text) {
        const positions = [];
        // Normalize: lowercase and collapse multiple spaces
        const textLower = text.toLowerCase().replace(/\s+/g, ' ');
        
        // Build patterns dynamically from mappings
        const materialPatterns = buildMaterialPatterns();
        
        // Sort ALL materials by their longest pattern length (longest first)
        // This ensures "Frost Crusted Abalone" is found before "Abalone"
        const sortedMaterialPatterns = [...materialPatterns].sort((a, b) => {
            const aMax = Math.max(...a.patterns.map(p => p.length));
            const bMax = Math.max(...b.patterns.map(p => p.length));
            return bMax - aMax;
        });
        
        // Track which character positions are already "claimed" by a match
        const claimedPositions = new Set();
        
        for (const material of sortedMaterialPatterns) {
            // Sort patterns by length (longest first)
            const sortedPatterns = [...material.patterns].sort((a, b) => b.length - a.length);
            
            for (const pattern of sortedPatterns) {
                // Normalize the pattern too
                const normalizedPattern = pattern.replace(/\s+/g, ' ');
                // Use simple indexOf for more reliable matching (word boundaries can fail with OCR noise)
                let searchPos = 0;
                while (true) {
                    const pos = textLower.indexOf(normalizedPattern, searchPos);
                    if (pos === -1) break;
                    
                    // Check if any character in this match range is already claimed
                    let isOverlapping = false;
                    for (let p = pos; p < pos + normalizedPattern.length; p++) {
                        if (claimedPositions.has(p)) {
                            isOverlapping = true;
                            break;
                        }
                    }
                    
                    if (isOverlapping) {
                        // This pattern overlaps with a longer match, skip it
                        searchPos = pos + 1;
                        continue;
                    }
                    
                    // Check if this position is already covered by another material (nearby)
                    const alreadyCovered = positions.some(p => 
                        Math.abs(pos - p.position) < 5 // Within 5 chars is probably same material
                    );
                    
                    if (!alreadyCovered) {
                        // Claim the character positions for this match
                        for (let p = pos; p < pos + normalizedPattern.length; p++) {
                            claimedPositions.add(p);
                        }
                        
                        positions.push({
                            materialName: material.name,
                            inputId: material.id,
                            position: pos
                        });
                        break; // Found this material, move to next
                    }
                    searchPos = pos + 1;
                }
            }
        }
        
        // Sort by position
        positions.sort((a, b) => a.position - b.position);
        
        return positions;
    }

    // Find all amounts in a text segment (for quality tiers)
    function findAllAmountsInSegment(segment) {
        const amounts = [];
        
        // Pattern to match numbers with K/M suffix only
        // We IGNORE B (billion) values as they are always OCR noise
        const pattern = /(\d+)(?:[.,](\d+))?\s*([kKmM])/g;
        
        let match;
        while ((match = pattern.exec(segment)) !== null) {
            const intPart = match[1];
            const decPart = match[2] || '';
            const suffix = (match[3] || '').toLowerCase();
            
            let value;
            if (decPart) {
                value = parseFloat(intPart + '.' + decPart);
            } else {
                value = parseInt(intPart);
            }
            
            // Check if decimal part is just zeros (treat as no decimal)
            const hasRealDecimal = decPart && decPart !== '0' && decPart !== '00';
            
            // Apply suffix multiplier
            if (suffix === 'k') {
                value *= 1000;
                
                // Fix OCR decimal drop: 12K or 12.0K is likely 1.2K
                // Game typically has values like 1.2K, 7.2K, not 12K, 72K
                if (!hasRealDecimal && value >= 10000 && value < 100000) {
                    const corrected = value / 10;
                    console.log(`Correcting K value: ${value} -> ${corrected} (likely decimal drop)`);
                    value = corrected;
                }
            } else if (suffix === 'm') {
                value *= 1000000;
                
                // NOTE: We no longer try to "correct" decimal drops for M values
                // because seasonal materials have valid Poor tier values across a wide range (1M-150M)
                // The old logic incorrectly assumed values outside 50-150M needed correction
            }
            
            // Filter out unreasonable M values (> 500M is likely OCR noise)
            // Basic materials can have 50-150M, seasonal materials can have 1-50M
            // Raised limit to accommodate potential edge cases
            if (suffix === 'm' && value > 500000000) {
                console.log(`Filtering out unreasonable M value: ${value} (> 500M)`);
                continue;
            }
            
            amounts.push(Math.round(value));
        }
        
        // Separate M values (millions) from K values (thousands)
        const mValues = amounts.filter(a => a >= 1000000); // 1M+
        const kValues = amounts.filter(a => a >= 1000 && a < 1000000); // 1K-999K
        
        // Sort M values: largest first
        mValues.sort((a, b) => b - a);
        
        // IMPORTANT: Don't try to classify Poor vs Common based on value ranges!
        // Seasonal/gear materials have much smaller Poor values than basic materials:
        // - Basic materials: Poor tier is 50-150M
        // - Seasonal materials: Poor tier can be 1K-50M
        // 
        // Simple rules:
        // 1. If there are M values, largest M is Poor tier
        // 2. If there are NO M values but there are K values, largest K is Poor tier
        // 3. Common tier is only detected if there's a second value at ~1/4 ratio
        let poorValue = 0;
        let commonValue = 0;
        let usedKForPoor = false;
        
        if (mValues.length >= 1) {
            // M values present - largest is Poor tier
            poorValue = mValues[0];
            
            if (mValues.length >= 2) {
                // Check if second M value could be Common (roughly 1/4 of Poor)
                const secondValue = mValues[1];
                const expectedCommonRatio = poorValue / 4;
                const ratioMin = expectedCommonRatio * 0.5;
                const ratioMax = expectedCommonRatio * 1.5;
                
                if (secondValue >= ratioMin && secondValue <= ratioMax) {
                    commonValue = secondValue;
                    console.log(`Detected Common tier: ${secondValue} (Poor=${poorValue}, expected ratio ~${expectedCommonRatio.toFixed(0)})`);
                } else {
                    console.log(`Second M value ${secondValue} not treated as Common (Poor=${poorValue}, ratio not ~4:1)`);
                }
            }
        } else if (kValues.length >= 1) {
            // No M values, but K values present - largest K is Poor tier
            // This handles seasonal materials like "Ash Cloaked Claw: 274.6K"
            kValues.sort((a, b) => b - a);
            poorValue = kValues[0];
            usedKForPoor = true;
            console.log(`Using K value as Poor tier: ${poorValue} (no M values found)`);
            
            if (kValues.length >= 2) {
                // Check if second K value could be Common
                const secondValue = kValues[1];
                const expectedCommonRatio = poorValue / 4;
                const ratioMin = expectedCommonRatio * 0.5;
                const ratioMax = expectedCommonRatio * 1.5;
                
                if (secondValue >= ratioMin && secondValue <= ratioMax) {
                    commonValue = secondValue;
                    console.log(`Detected Common tier (K): ${secondValue}`);
                }
            }
        }
        
        // Build result array for 6 tiers: [Poor, Common, Fine, Exquisite, Epic, Legendary]
        const result = [0, 0, 0, 0, 0, 0];
        
        // Poor tier (index 0)
        result[0] = poorValue;
        
        // Common tier (index 1): only if we detected a valid Common-tier value
        if (commonValue > 0) {
            result[1] = commonValue;
        }
        
        // K values that weren't used for Poor/Common: store for display but don't count
        // (we can't determine their tier position)
        const unusedKValues = usedKForPoor 
            ? kValues.slice(commonValue > 0 ? 2 : 1) 
            : kValues;
        result.kValues = unusedKValues;
        
        return result;
    }

    // Fuzzy match for material names (handles OCR errors)
    function fuzzyMatch(text, materialName) {
        // Direct include check
        if (text.includes(materialName)) return true;
        
        // Check for common OCR substitutions
        const variations = [
            materialName,
            materialName.replace(/i/g, 'l'),
            materialName.replace(/l/g, 'i'),
            materialName.replace(/o/g, '0'),
            materialName.replace(/0/g, 'o'),
            materialName.replace(/ /g, ''),
            materialName.replace(/-/g, ' '),
        ];
        
        for (const variant of variations) {
            if (text.includes(variant)) return true;
        }
        
        // Check if most words match
        const words = materialName.split(' ');
        if (words.length > 1) {
            const matchedWords = words.filter(w => text.includes(w));
            if (matchedWords.length >= words.length - 1 && matchedWords.length > 0) {
                return true;
            }
        }
        
        return false;
    }

    function findAllAmounts(text) {
        const amounts = [];
        
        // Pattern to find numbers with M/K/B suffix
        // Handles: 87.9M, 91M, 88.2M, 115.5M, 9M, 1M, etc.
        const patterns = [
            /(\d{1,3}[.,]\d{1,2})\s*[mM]/g,    // 87.9M, 88.2M
            /(\d{1,3})\s*[mM]/g,                // 91M, 106M, 9M (allow 1-3 digits)
            /(\d{1,3}[.,]\d{1,2})\s*[kK]/g,    // 500.5K
            /(\d{1,4})\s*[kK]/g,                // 500K, 5000K
            /(\d{1,3}[.,]\d{1,2})\s*[bB]/g,    // 1.5B
        ];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                let numStr = match[1].replace(',', '.');
                const fullMatch = match[0].toLowerCase();
                
                let multiplier = 1;
                if (fullMatch.includes('m')) multiplier = 1000000;
                else if (fullMatch.includes('k')) multiplier = 1000;
                else if (fullMatch.includes('b')) multiplier = 1000000000;
                
                // Handle cases where decimal was dropped (912M -> 91.2M)
                // If we have 3+ digits and no decimal, and it's in M range, assume decimal after 2nd digit
                if (numStr.length >= 3 && !numStr.includes('.') && multiplier === 1000000) {
                    const num = parseInt(numStr);
                    if (num >= 100 && num < 1000) {
                        // Could be 912 -> 91.2 or actual 912
                        // Check if inserting decimal gives reasonable value (50-200 range typical)
                        const withDecimal = parseFloat(numStr.slice(0, 2) + '.' + numStr.slice(2));
                        if (withDecimal >= 50 && withDecimal <= 200) {
                            numStr = numStr.slice(0, 2) + '.' + numStr.slice(2);
                        }
                    }
                }
                
                const value = Math.round(parseFloat(numStr) * multiplier);
                if (value > 0 && !isNaN(value)) {
                    amounts.push({
                        value,
                        index: match.index,
                        raw: match[0]
                    });
                }
            }
        }
        
        // Sort by position in text
        amounts.sort((a, b) => a.index - b.index);
        
        return amounts;
    }

    function findAmountInLine(line) {
        if (!line) return null;
        
        // Clean the line - fix common OCR mistakes with numbers
        let cleanLine = line
            .replace(/[oO](?=\d)/g, '0')  // O before digit -> 0
            .replace(/(?<=\d)[oO]/g, '0') // O after digit -> 0
            .replace(/[lI](?=\d)/g, '1')  // l/I before digit -> 1
            .replace(/(?<=\d)[lI]/g, '1') // l/I after digit -> 1
            .replace(/[sS](?=\d)/g, '5')  // S before digit -> 5
            .replace(/(?<=\d)[sS]/g, '5') // S after digit -> 5
            .replace(/[lI][mM]/g, '1M')   // IM or lM -> 1M
            .replace(/(\d)[lI]([mM])/g, '$11$2'); // 9IM -> 91M
        
        // Match patterns like "87.9M", "91M", "88.2M", "115.5M", "9M"
        const patterns = [
            /(\d{1,3})[.,](\d{1,2})\s*[mM]/,   // 87.9M, 115.5M
            /(\d{1,3})\s*[mM]/,                 // 91M, 106M, 9M (1-3 digits)
            /(\d{1,3})[.,](\d{1,2})\s*[kK]/,   // 500.5K
            /(\d{1,4})\s*[kK]/,                 // 5000K
            /(\d{1,3})[.,](\d{1,2})\s*[bB]/,   // 1.5B
        ];

        for (const pattern of patterns) {
            const match = cleanLine.match(pattern);
            if (match) {
                let numStr;
                if (match[2]) {
                    // Has decimal part
                    numStr = match[1] + '.' + match[2];
                } else {
                    numStr = match[1];
                    
                    // Handle cases where decimal was dropped (912M -> 91.2M)
                    if (numStr.length >= 3) {
                        const num = parseInt(numStr);
                        if (num >= 100 && num < 1000) {
                            const withDecimal = parseFloat(numStr.slice(0, 2) + '.' + numStr.slice(2));
                            if (withDecimal >= 50 && withDecimal <= 200) {
                                numStr = numStr.slice(0, 2) + '.' + numStr.slice(2);
                            }
                        }
                    }
                }
                
                const fullMatch = match[0].toLowerCase();
                
                let multiplier = 1;
                if (fullMatch.includes('m')) multiplier = 1000000;
                else if (fullMatch.includes('k')) multiplier = 1000;
                else if (fullMatch.includes('b')) multiplier = 1000000000;
                
                const amount = parseFloat(numStr) * multiplier;
                if (amount > 0 && !isNaN(amount)) {
                    return Math.round(amount);
                }
            }
        }
        return null;
    }

    function parseAmount(numStr, suffix) {
        const num = parseFloat(numStr);
        if (isNaN(num)) return 0;
        
        let multiplier = 1;
        switch (suffix) {
            case 'k': multiplier = 1000; break;
            case 'm': multiplier = 1000000; break;
            case 'b': multiplier = 1000000000; break;
        }
        
        return Math.round(num * multiplier);
    }

    function displayResults(materials) {
        detectedMaterialsEl.innerHTML = '';

        const materialCount = Object.keys(materials).length;
        const completedScans = uploadedImages.filter(img => img.status === 'complete').length;
        
        // Update the accordion count
        if (detectedMaterialsCount) {
            detectedMaterialsCount.textContent = materialCount > 0 ? `(${materialCount} found)` : '';
        }
        
        // Ensure accordion is expanded when showing new results
        if (detectedMaterialsToggle && materialCount > 0) {
            detectedMaterialsToggle.setAttribute('aria-expanded', 'true');
            detectedMaterialsEl.classList.remove('collapsed');
        }

        if (materialCount === 0) {
            if (completedScans === 0) {
                detectedMaterialsEl.innerHTML = '<p class="no-materials-detected">Scanning in progress...</p>';
            } else {
                detectedMaterialsEl.innerHTML = '<p class="no-materials-detected">No materials detected. Try clearer screenshots.</p>';
            }
            applyBtn.style.display = 'none';
        } else {
            // Get detailed results if available
            const detailedResults = window._ocrDetailedResults || {};
            
            // Group materials by season
            const materialsBySeason = {};
            for (const [inputId, amount] of Object.entries(materials)) {
                const info = MATERIAL_INFO[inputId];
                if (!info) continue;
                
                const season = info.season || 0;
                if (!materialsBySeason[season]) {
                    materialsBySeason[season] = [];
                }
                materialsBySeason[season].push({ inputId, amount, info });
            }
            
            // Sort seasons: 0 (Basic) first, then 1, 2, 3, etc.
            const sortedSeasons = Object.keys(materialsBySeason)
                .map(Number)
                .sort((a, b) => {
                    if (a === 0) return -1;
                    if (b === 0) return 1;
                    return a - b;
                });
            
            // Add select all / deselect all buttons at the top
            const selectionControls = document.createElement('div');
            selectionControls.className = 'ocr-selection-controls';
            selectionControls.innerHTML = `
                <button type="button" class="ocr-select-all">Select All</button>
                <button type="button" class="ocr-deselect-all">Deselect All</button>
            `;
            detectedMaterialsEl.appendChild(selectionControls);
            
            selectionControls.querySelector('.ocr-select-all').addEventListener('click', () => {
                detectedMaterialsEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.checked = true;
                    cb.closest('.detected-material-item')?.classList.remove('excluded');
                });
            });
            
            selectionControls.querySelector('.ocr-deselect-all').addEventListener('click', () => {
                detectedMaterialsEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.checked = false;
                    cb.closest('.detected-material-item')?.classList.add('excluded');
                });
            });
            
            // Display materials grouped by season
            for (const season of sortedSeasons) {
                const seasonMaterials = materialsBySeason[season];
                
                // Create season header
                const seasonHeader = document.createElement('div');
                seasonHeader.className = 'ocr-season-header';
                const seasonName = season === 0 ? 'Basic Materials' : `Season ${season}`;
                const materialCount = seasonMaterials.length;
                seasonHeader.innerHTML = `
                    <span class="season-name">${seasonName}</span>
                    <span class="season-count">${materialCount} material${materialCount !== 1 ? 's' : ''}</span>
                `;
                detectedMaterialsEl.appendChild(seasonHeader);
                
                // Create container for this season's materials
                const seasonContainer = document.createElement('div');
                seasonContainer.className = 'ocr-season-materials';
                
                // Sort materials within season by the order they appear in materials.js
                const materialOrder = getMaterialOrder();
                seasonMaterials.sort((a, b) => {
                    const indexA = materialOrder.indexOf(a.inputId);
                    const indexB = materialOrder.indexOf(b.inputId);
                    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
                });
                
                for (const { inputId, amount, info } of seasonMaterials) {
                    const item = document.createElement('div');
                    item.className = 'detected-material-item';
                    
                    // Check if we have tier breakdown
                    const detail = detailedResults[inputId];
                    let tierInfo = '';
                    if (detail && detail.tiers && detail.tiers.length > 0) {
                        const countedTiers = detail.tiers.filter(t => t.multiplier > 0);
                        const uncountedTiers = detail.tiers.filter(t => t.multiplier === 0);
                        
                        const tierParts = countedTiers.map(t => 
                            `${formatNumber(t.amount)} ${t.tier}${t.multiplier > 1 ? ` (×${t.multiplier})` : ''}`
                        );
                        
                        let breakdown = tierParts.join(' + ');
                        
                        // Show uncounted K values separately
                        if (uncountedTiers.length > 0) {
                            const kParts = uncountedTiers.map(t => formatNumber(t.amount));
                            breakdown += ` <span style="color:#888; font-size:9px;">[+${kParts.join(', ')} K detected]</span>`;
                        }
                        
                        tierInfo = `<span class="tier-breakdown">${breakdown}</span>`;
                    }
                    
                    // Create unique checkbox ID
                    const checkboxId = `ocr-include-${inputId}`;
                    
                    item.innerHTML = `
                        <label class="material-checkbox">
                            <input type="checkbox" id="${checkboxId}" data-input-id="${inputId}" checked>
                            <span class="checkmark"></span>
                        </label>
                        <img src="${info.img}" alt="${info.name}">
                        <span class="material-name">${info.name}</span>
                        <span class="material-amount">${formatNumber(amount)}</span>
                        ${tierInfo}
                    `;
                    
                    // Handle checkbox changes (both direct clicks and label clicks)
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    checkbox.addEventListener('change', () => {
                        item.classList.toggle('excluded', !checkbox.checked);
                    });
                    
                    // Add click handler to toggle checkbox when clicking anywhere on the item
                    // (except on the checkbox label area which handles it natively)
                    item.addEventListener('click', (e) => {
                        // Check if click is on the checkbox or its label
                        const isCheckboxArea = e.target.closest('.material-checkbox');
                        if (!isCheckboxArea) {
                            checkbox.checked = !checkbox.checked;
                            item.classList.toggle('excluded', !checkbox.checked);
                        }
                    });
                    
                    seasonContainer.appendChild(item);
                }
                
                detectedMaterialsEl.appendChild(seasonContainer);
            }
            
            applyBtn.style.display = 'block';
        }

        // Update debug info
        const debugEl = document.getElementById('ocrDebugText');
        if (debugEl) {
            let debugHTML = '';
            
            // Show tier conversion info
            debugHTML += `<div style="margin-bottom: 15px; padding: 10px; background: #e3f2fd; border-radius: 4px;">`;
            debugHTML += `<strong>Quality Tier Multipliers (to Poor):</strong><br>`;
            debugHTML += `Poor: 1× | Common: 4× | Fine: 16× | Exquisite: 64× | Epic: 256× | Legendary: 1024×`;
            debugHTML += `</div>`;
            
            uploadedImages.forEach((img, i) => {
                debugHTML += `<div style="margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">`;
                debugHTML += `<strong>=== Screenshot ${i + 1} (${img.status}) ===</strong><br>`;
                if (img.processedImage) {
                    debugHTML += `<div style="margin: 10px 0;"><small>Processed image (what OCR sees):</small><br>`;
                    debugHTML += `<img src="${img.processedImage}" style="max-width: 100%; max-height: 150px; border: 1px solid #999;"></div>`;
                }
                debugHTML += `<pre style="white-space: pre-wrap; font-size: 10px; background: #eee; padding: 5px; max-height: 100px; overflow-y: auto;">${img.rawText || 'No text extracted'}</pre>`;
                debugHTML += `<small>Detected: ${JSON.stringify(img.materials)}</small>`;
                debugHTML += `</div>`;
            });
            debugEl.innerHTML = debugHTML;
        }

        resultsSection.style.display = 'block';
    }

    function formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    }

    /**
     * Auto-select gear levels based on detected seasonal materials.
     * All seasonal materials (seasons 1-12) unlock levels: 5, 10, 15, 20, 25, 30, 35, 40, 45
     * For level 20+, the probability-based calculation is handled by the main calculator,
     * but we can estimate template counts based on material amounts.
     */
    function autoSelectGearLevels(appliedSeasons, gearContent) {
        const select = document.getElementById('gearMaterialLevels');
        const dropdown = gearContent?.querySelector('.level-dropdown');
        
        if (!select || !dropdown || appliedSeasons.size === 0) {
            return;
        }
        
        // All seasonal materials unlock these levels
        const gearLevels = [5, 10, 15, 20, 25, 30, 35, 40, 45];
        
        // Select the levels in both the hidden select and the visual dropdown
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
        
        // Also auto-populate template amounts based on seasonal material amounts
        autoPopulateTemplateAmounts(appliedSeasons);
    }
    
    /**
     * Auto-populate template amounts based on available seasonal materials.
     * Uses actual game crafting mechanics with success rates and combining.
     * 
     * CRAFTING MECHANICS:
     * - Levels 1-10: 100% success rate
     * - Level 15+: Variable success rates when using Exquisite materials
     * - Failed crafts can be combined (4:1 ratio) to upgrade quality
     * - Effective rate = direct% + (epic%/4) + (exquisite%/16)
     */
    function autoPopulateTemplateAmounts(appliedSeasons) {
        // Find the minimum seasonal material amount (the bottleneck)
        let minSeasonalAmount = Infinity;
        
        for (const [inputId, amount] of Object.entries(combinedMaterials)) {
            const info = MATERIAL_INFO[inputId];
            if (info && info.season > 0 && appliedSeasons.has(info.season)) {
                if (amount < minSeasonalAmount) {
                    minSeasonalAmount = amount;
                }
            }
        }
        
        if (minSeasonalAmount === Infinity || minSeasonalAmount <= 0) {
            return;
        }
        
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
        
        let remainingMaterials = minSeasonalAmount;
        const templateEstimates = {};
        
        // Seasonal gear uses 4 materials
        const materialCount = 4;
        // Default to exquisite (purple) materials - most common for high-level crafting
        const inputQuality = 'exquisite';
        
        // Prioritize highest levels (most valuable)
        const levels = [45, 40, 35, 30, 25, 20];
        
        for (const level of levels) {
            const materialCost = seasonalMaterialCosts[level];
            const effectiveRate = getEffectiveLegendaryRate(materialCount, inputQuality);
            
            // Materials per Legendary = baseCost / effectiveRate
            const materialsPerLegendary = materialCost / effectiveRate;
            
            const legendaryTemplates = Math.floor(remainingMaterials / materialsPerLegendary);
            
            if (legendaryTemplates > 0) {
                templateEstimates[level] = legendaryTemplates;
                remainingMaterials -= legendaryTemplates * materialsPerLegendary;
            }
        }
        
        // Update template input fields with estimates
        for (const [level, count] of Object.entries(templateEstimates)) {
            const input = document.getElementById(`templateAmount${level}`);
            if (input && count > 0) {
                input.value = count;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                
                const card = document.querySelector(`.template-card[data-level="${level}"]`);
                if (card) {
                    card.classList.add('has-value');
                }
            }
        }
        
        const effectiveRateDisplay = (getEffectiveLegendaryRate(materialCount, inputQuality) * 100).toFixed(1) + '%';
        console.log('Crafting estimate:', {
            seasonalMaterials: minSeasonalAmount,
            materialCount: materialCount,
            inputQuality: inputQuality,
            effectiveRate: effectiveRateDisplay,
            legendaryTemplates: templateEstimates
        });
    }

    function applyMaterials() {
        const scaleSelect = document.getElementById('scaleSelect');
        const scale = scaleSelect ? parseInt(scaleSelect.value) : 1;
        
        let appliedCount = 0;
        let advancedCount = 0;
        let skippedCount = 0;
        const appliedSeasons = new Set(); // Track which seasons have applied materials

        for (const [inputId, amount] of Object.entries(combinedMaterials)) {
            // Check if this material is selected (checkbox checked)
            const checkbox = document.querySelector(`#ocr-include-${inputId}`);
            if (checkbox && !checkbox.checked) {
                skippedCount++;
                continue; // Skip unchecked materials
            }
            
            const input = document.getElementById(inputId);
            if (input) {
                // Apply the value considering the scale
                // Preserve decimal precision for Million scale (e.g., 87.9M → 87.9)
                let scaledValue;
                if (scale > 1) {
                    scaledValue = amount / scale;
                    // Round to 1 decimal place if there's a decimal, otherwise keep as integer
                    scaledValue = Number.isInteger(scaledValue) ? scaledValue : parseFloat(scaledValue.toFixed(1));
                } else {
                    scaledValue = amount;
                }
                input.value = scaledValue;
                
                // Trigger the active class for the label animation
                const parent = input.closest('.my-material') || input.closest('.material-item');
                if (parent) {
                    parent.classList.add('active');
                }

                // Trigger input event for any listeners
                input.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Track if this is an advanced material and which season
                const info = MATERIAL_INFO[inputId];
                if (info && info.season > 0) {
                    advancedCount++;
                    appliedSeasons.add(info.season);
                }
                appliedCount++;
            }
        }
        
        // If we found advanced materials, expand the Gear Materials section
        if (advancedCount > 0) {
            const gearToggle = document.getElementById('toggleAdvMaterials');
            const gearContent = document.getElementById('advMaterials');
            if (gearToggle && gearContent) {
                gearToggle.setAttribute('aria-expanded', 'true');
                gearToggle.classList.add('open');
                gearContent.style.display = 'block';
                
                // Expand the specific season accordions that have applied materials
                const seasonHeaders = gearContent.querySelectorAll('h4');
                seasonHeaders.forEach(header => {
                    // Extract season number from header text (e.g., "Season 12" -> 12)
                    const match = header.textContent.match(/Season\s*(\d+)/i);
                    if (match) {
                        const seasonNum = parseInt(match[1]);
                        if (appliedSeasons.has(seasonNum)) {
                            // Find the next sibling div (the materials container)
                            const seasonDiv = header.nextElementSibling;
                            if (seasonDiv && seasonDiv.tagName === 'DIV') {
                                seasonDiv.style.display = 'block';
                                header.classList.add('open');
                            }
                        }
                    }
                });
                
                // Auto-select gear levels based on detected materials
                autoSelectGearLevels(appliedSeasons, gearContent);
            }
        }

        // Show a brief success message
        const originalText = applyBtn.textContent;
        const message = advancedCount > 0 
            ? `✓ Applied ${appliedCount} (${advancedCount} gear)!`
            : `✓ Applied ${appliedCount}!`;
        applyBtn.textContent = message;
        applyBtn.style.background = '#1b5e20';
        
        // Collapse the detected materials accordion (user can re-expand to review)
        if (detectedMaterialsToggle && detectedMaterialsEl) {
            detectedMaterialsToggle.setAttribute('aria-expanded', 'false');
            detectedMaterialsEl.classList.add('collapsed');
        }
        
        setTimeout(() => {
            applyBtn.textContent = originalText;
            applyBtn.style.background = '';
        }, 2500);
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (ocrWorker) {
            ocrWorker.terminate();
        }
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

