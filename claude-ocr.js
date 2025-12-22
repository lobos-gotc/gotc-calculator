/**
 * Claude Vision OCR - Uses Anthropic's Claude API for accurate image analysis
 * 
 * This provides much more accurate results than Tesseract.js for game screenshots
 * because Claude understands context and can read stylized fonts.
 * 
 * SETUP:
 * 1. Get an API key from https://console.anthropic.com/
 * 2. Set up a backend proxy (Claude API doesn't support browser CORS)
 *    OR use a serverless function (Vercel, Netlify, AWS Lambda)
 * 
 * IMPORTANT: Never expose your API key in frontend code!
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        // Your backend endpoint that proxies to Claude API
        // Example: '/api/claude-ocr' or 'https://your-backend.com/api/analyze-screenshot'
        apiEndpoint: '/api/claude-ocr',
        
        // Model to use (claude-3-5-sonnet or claude-3-opus for best vision)
        model: 'claude-sonnet-4-20250514',
        
        // Maximum tokens for response
        maxTokens: 2000
    };

    // The prompt that tells Claude exactly what to extract
    const EXTRACTION_PROMPT = `You are analyzing a screenshot from the mobile game "Game of Thrones: Conquest" showing crafting materials inventory.

Extract ALL materials and their quantities from this image. The format shows:
- Material name (e.g., "Black Iron", "Weirwood", "Ash Cloaked Claw")
- Quantity with suffix (e.g., "108.2M" = 108,200,000, "274.6K" = 274,600, "1.9K" = 1,900)

Return the data as a JSON object with this exact format:
{
  "materials": [
    {"name": "Material Name", "amount": 123456789, "raw": "123.4M"},
    ...
  ],
  "season": "Basic Materials" or "Season 11" or "Season 12" etc.
}

Rules:
- Convert K to thousands (1K = 1,000)
- Convert M to millions (1M = 1,000,000)
- Handle decimals correctly (3.6M = 3,600,000)
- Only include materials that have a quantity > 0
- Use exact material names as shown in the game

Return ONLY valid JSON, no other text.`;

    /**
     * Convert an image file to base64
     */
    async function imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove data URL prefix to get just the base64
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Analyze a screenshot using Claude's vision API
     * 
     * @param {File} imageFile - The image file to analyze
     * @returns {Object} - Extracted materials data
     */
    async function analyzeScreenshot(imageFile) {
        try {
            // Convert image to base64
            const base64Image = await imageToBase64(imageFile);
            const mediaType = imageFile.type || 'image/png';

            // Prepare the request for your backend proxy
            const requestBody = {
                model: CONFIG.model,
                max_tokens: CONFIG.maxTokens,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: mediaType,
                                    data: base64Image
                                }
                            },
                            {
                                type: 'text',
                                text: EXTRACTION_PROMPT
                            }
                        ]
                    }
                ]
            };

            // Send to backend proxy
            const response = await fetch(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            
            // Parse the response - Claude returns the JSON in the content
            const content = data.content?.[0]?.text || data.text || '';
            
            // Extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Could not parse JSON from response');
            }

            const extracted = JSON.parse(jsonMatch[0]);
            
            console.log('Claude OCR Result:', extracted);
            return extracted;

        } catch (error) {
            console.error('Claude OCR Error:', error);
            throw error;
        }
    }

    /**
     * Analyze multiple screenshots and combine results
     */
    async function analyzeMultipleScreenshots(imageFiles) {
        const allMaterials = {};
        
        for (const file of imageFiles) {
            try {
                const result = await analyzeScreenshot(file);
                
                if (result.materials) {
                    for (const mat of result.materials) {
                        // Normalize material name to ID format
                        const matId = mat.name.toLowerCase().replace(/\s+/g, '-');
                        
                        // Add or update material amount
                        if (!allMaterials[matId] || mat.amount > allMaterials[matId].amount) {
                            allMaterials[matId] = {
                                name: mat.name,
                                amount: mat.amount,
                                raw: mat.raw,
                                season: result.season
                            };
                        }
                    }
                }
            } catch (error) {
                console.error(`Failed to analyze ${file.name}:`, error);
            }
        }
        
        return allMaterials;
    }

    /**
     * Apply extracted materials to the input fields
     */
    function applyExtractedMaterials(materials) {
        let appliedCount = 0;
        
        for (const [matId, data] of Object.entries(materials)) {
            const inputId = `my-${matId}`;
            const input = document.getElementById(inputId);
            
            if (input) {
                input.value = data.amount.toLocaleString('en-US');
                input.dispatchEvent(new Event('input', { bubbles: true }));
                appliedCount++;
            } else {
                console.log(`Input not found for: ${matId} (${data.name})`);
            }
        }
        
        console.log(`Applied ${appliedCount} materials to inputs`);
        return appliedCount;
    }

    // ========================================
    // MOCK/DEMO MODE (for testing without API)
    // ========================================

    /**
     * Demo function - simulates Claude API response
     * Use this to test the UI without an actual API key
     */
    async function analyzeScreenshotDemo(imageFile) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Return mock data based on filename or random selection
        const mockResponses = [
            {
                season: 'Basic Materials',
                materials: [
                    { name: 'Black Iron', amount: 108200000, raw: '108.2M' },
                    { name: 'Copper Bar', amount: 91200000, raw: '91.2M' },
                    { name: 'Dragonglass', amount: 101400000, raw: '101.4M' },
                    { name: 'Goldenheart Wood', amount: 106200000, raw: '106.2M' },
                    { name: 'Hide', amount: 97100000, raw: '97.1M' },
                    { name: 'Ironwood', amount: 96100000, raw: '96.1M' }
                ]
            },
            {
                season: 'Season 11',
                materials: [
                    { name: 'Ash Cloaked Claw', amount: 274600, raw: '274.6K' },
                    { name: 'Charred Driftwood', amount: 6000000, raw: '6M' },
                    { name: 'Frostbitten Leather', amount: 1900, raw: '1.9K' },
                    { name: 'Frozen Weirwood Sap', amount: 20200, raw: '20.2K' },
                    { name: 'Greenfyre Penny', amount: 1600000, raw: '1.6M' }
                ]
            }
        ];
        
        return mockResponses[Math.floor(Math.random() * mockResponses.length)];
    }

    // ========================================
    // PUBLIC API
    // ========================================

    window.ClaudeOCR = {
        analyzeScreenshot,
        analyzeMultipleScreenshots,
        applyExtractedMaterials,
        analyzeScreenshotDemo,  // For testing without API
        
        // Configuration
        setApiEndpoint: (endpoint) => { CONFIG.apiEndpoint = endpoint; },
        setModel: (model) => { CONFIG.model = model; }
    };

    console.log('ClaudeOCR module loaded. Use ClaudeOCR.analyzeScreenshot(file) to analyze images.');

})();




