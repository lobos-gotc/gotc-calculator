/**
 * OCR API Key Management Module
 * Contains obfuscated default key and key retrieval functions
 */

(function(window) {
    'use strict';
    
    // Obfuscated key parts (split, reversed, rotated +5, double base64'd)
    // This deters casual extraction but is not truly secure
    const _p1 = 'TXpRM09EazJNMUE9';  // Part 1: encodes first half
    const _p2 = 'TWpBME16TTNNZz09';  // Part 2: encodes second half
    
    // Decode helper functions
    function _b64d(str) {
        try {
            return atob(str);
        } catch (e) {
            return '';
        }
    }
    
    function _rot(str, n) {
        return str.split('').map(c => {
            const code = c.charCodeAt(0);
            if (code >= 48 && code <= 57) { // 0-9
                return String.fromCharCode(((code - 48 - n + 10) % 10) + 48);
            } else if (code >= 65 && code <= 90) { // A-Z
                return String.fromCharCode(((code - 65 - n + 26) % 26) + 65);
            } else if (code >= 97 && code <= 122) { // a-z
                return String.fromCharCode(((code - 97 - n + 26) % 26) + 97);
            }
            return c;
        }).join('');
    }
    
    function _rev(str) {
        return str.split('').reverse().join('');
    }
    
    /**
     * Get the default API key (decoded)
     * @returns {string} The decoded API key
     */
    function getDefaultKey() {
        try {
            // Decode: double base64 -> reverse rotation by 5 -> reverse string -> combine parts
            const d1 = _b64d(_b64d(_p1));
            const d2 = _b64d(_b64d(_p2));
            const r1 = _rot(d1, 5);
            const r2 = _rot(d2, 5);
            return _rev(r1) + _rev(r2);
        } catch (e) {
            console.error('Key decode error');
            return '';
        }
    }
    
    /**
     * Get the user's custom API key from localStorage
     * @returns {string|null} User's API key or null if not set
     */
    function getUserKey() {
        try {
            return localStorage.getItem('ocrspace_user_key') || null;
        } catch (e) {
            return null;
        }
    }
    
    /**
     * Save user's custom API key to localStorage
     * @param {string} key - The API key to save
     */
    function setUserKey(key) {
        try {
            if (key && key.trim()) {
                localStorage.setItem('ocrspace_user_key', key.trim());
            } else {
                localStorage.removeItem('ocrspace_user_key');
            }
        } catch (e) {
            console.error('Failed to save user key');
        }
    }
    
    /**
     * Check if user has a custom key set
     * @returns {boolean}
     */
    function hasUserKey() {
        return !!getUserKey();
    }
    
    /**
     * Clear user's custom API key
     */
    function clearUserKey() {
        try {
            localStorage.removeItem('ocrspace_user_key');
        } catch (e) {
            // Ignore
        }
    }
    
    /**
     * Get the active API key (user key takes priority)
     * @returns {string|null} The active API key to use
     */
    function getActiveKey() {
        const userKey = getUserKey();
        if (userKey) {
            return userKey;
        }
        return getDefaultKey();
    }
    
    // Expose to window
    window.OCRKeyManager = {
        getDefaultKey: getDefaultKey,
        getUserKey: getUserKey,
        setUserKey: setUserKey,
        hasUserKey: hasUserKey,
        clearUserKey: clearUserKey,
        getActiveKey: getActiveKey
    };
    
})(window);

