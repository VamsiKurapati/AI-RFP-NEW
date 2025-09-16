// Storage utility for handling localStorage operations with quota management
import Swal from "sweetalert2";

const STORAGE_KEYS = {
    PROJECT: 'canva-project',
    CLOUD_IMAGES: 'canva-cloud-images',
    HISTORY: 'canva-history'
};

// Check if localStorage is available
const isLocalStorageAvailable = () => {
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
};

// Get localStorage usage
const getStorageUsage = () => {
    if (!isLocalStorageAvailable()) return 0;

    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length;
        }
    }
    return total;
};

// Get available storage space (approximate)
const getAvailableStorage = () => {
    // Most browsers have 5-10MB limit
    const maxStorage = 5 * 1024 * 1024; // 5MB
    const used = getStorageUsage();
    return maxStorage - used;
};

// Safe setItem with quota checking
const safeSetItem = (key, value) => {
    if (!isLocalStorageAvailable()) {
        // console.warn('localStorage is not available');
        Swal.fire({
            title: 'localStorage is not available',
            icon: 'warning',
            timer: 1500,
            showConfirmButton: false,
            showCancelButton: false,
        });
        return false;
    }

    try {
        const dataSize = JSON.stringify(value).length;
        const available = getAvailableStorage();

        if (dataSize > available) {
            // console.warn(`Data size (${dataSize} bytes) exceeds available storage (${available} bytes)`);
            Swal.fire({
                title: `Data size (${dataSize} bytes) exceeds available storage (${available} bytes)`,
                icon: 'warning',
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: false,
            });

            // Try to clear some space
            clearOldData();

            // Check again after clearing
            const newAvailable = getAvailableStorage();
            if (dataSize > newAvailable) {
                // console.error('Even after clearing old data, storage is insufficient');
                Swal.fire({
                    title: 'Even after clearing old data, storage is insufficient',
                    icon: 'warning',
                    timer: 1500,
                    showConfirmButton: false,
                    showCancelButton: false,
                });
                return false;
            }
        }

        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            // console.error('localStorage quota exceeded');
            Swal.fire({
                title: 'localStorage quota exceeded',
                icon: 'warning',
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: false,
            });
            clearOldData();

            // Try one more time
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (retryError) {
                // console.error('Failed to save data even after clearing space:', retryError);
                Swal.fire({
                    title: 'Failed to save data even after clearing space:',
                    icon: 'warning',
                    timer: 1500,
                    showConfirmButton: false,
                    showCancelButton: false,
                });
                return false;
            }
        } else {
            // console.error('Error saving to localStorage:', error);
            Swal.fire({
                title: 'Error saving to localStorage:',
                icon: 'warning',
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: false,
            });
            return false;
        }
    }
};

// Safe getItem
const safeGetItem = (key) => {
    if (!isLocalStorageAvailable()) {
        // console.warn('localStorage is not available');
        Swal.fire({
            title: 'localStorage is not available',
            icon: 'warning',
            timer: 1500,
            showConfirmButton: false,
            showCancelButton: false,
        });
        return null;
    }

    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        // console.error('Error reading from localStorage:', error);
        Swal.fire({
            title: 'Error reading from localStorage:',
            icon: 'warning',
            timer: 1500,
            showConfirmButton: false,
            showCancelButton: false,
        });
        return null;
    }
};

// Clear old data to free up space
const clearOldData = () => {
    const keysToClear = [STORAGE_KEYS.HISTORY]; // Clear history first as it's less critical

    keysToClear.forEach(key => {
        try {
            localStorage.removeItem(key);
            // console.log(`Cleared ${key} to free up space`);
            Swal.fire({
                title: `Cleared ${key} to free up space`,
                icon: 'warning',
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: false,
            });
        } catch (error) {
            // console.error(`Error clearing ${key}:`, error);
            Swal.fire({
                title: `Error clearing ${key}:`,
                icon: 'warning',
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: false,
            });
        }
    });
};

// Compress large data before saving
const compressData = (data) => {
    // For now, just remove large base64 image data
    if (typeof data === 'object' && data.pages) {
        return {
            ...data,
            pages: data.pages.map(page => ({
                ...page,
                elements: page.elements.map(element => {
                    if (element.type === 'image' && element.properties?.src?.startsWith('data:')) {
                        return {
                            ...element,
                            properties: {
                                ...element.properties,
                                src: '[LARGE_IMAGE_DATA]' // Replace with placeholder
                            }
                        };
                    }
                    return element;
                })
            }))
        };
    }
    return data;
};

export {
    STORAGE_KEYS,
    isLocalStorageAvailable,
    getStorageUsage,
    getAvailableStorage,
    safeSetItem,
    safeGetItem,
    clearOldData,
    compressData
}; 