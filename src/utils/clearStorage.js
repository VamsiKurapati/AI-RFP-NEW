// Utility to clear localStorage and help with quota issues
import Swal from 'sweetalert2';

export const clearAllStorage = () => {
    try {
        localStorage.clear();
        // console.log('All localStorage data cleared successfully');
        return true;
    } catch (error) {
        // console.error('Failed to clear localStorage:', error);
        Swal.fire({
            title: 'Failed to clear localStorage:',
            icon: 'warning',
            timer: 1500,
            showConfirmButton: false,
            showCancelButton: false,
        });
        return false;
    }
};

export const clearProjectData = () => {
    try {
        localStorage.removeItem('canva-project');
        localStorage.removeItem('canva-cloud-images');
        localStorage.removeItem('canva-history');
        // console.log('Project data cleared successfully');
        return true;
    } catch (error) {
        // console.error('Failed to clear project data:', error);
        Swal.fire({
            title: 'Failed to clear project data:',
            icon: 'warning',
            timer: 1500,
            showConfirmButton: false,
            showCancelButton: false,
        });
        return false;
    }
};

export const getStorageInfo = () => {
    try {
        let totalSize = 0;
        const items = {};

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const size = localStorage[key].length;
                totalSize += size;
                items[key] = {
                    size,
                    sizeFormatted: formatBytes(size)
                };
            }
        }

        return {
            totalSize,
            totalSizeFormatted: formatBytes(totalSize),
            items
        };
    } catch (error) {
        // console.error('Error getting storage info:', error);
        Swal.fire({
            title: 'Error getting storage info:',
            icon: 'warning',
            timer: 1500,
            showConfirmButton: false,
            showCancelButton: false,
        });
        return null;
    }
};

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Function to be called from browser console for debugging
window.clearCanvaStorage = () => {
    const success = clearAllStorage();
    if (success) {
        Swal.fire({
            title: 'All storage cleared successfully! Please refresh the page.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            showCancelButton: false,
        });
    } else {
        Swal.fire({
            title: 'Failed to clear storage. Please try again.',
            icon: 'error',
            timer: 1500,
            showConfirmButton: false,
            showCancelButton: false,
        });
    }
};

window.getCanvaStorageInfo = () => {
    const info = getStorageInfo();
    // console.log('Storage Info:', info);
    return info;
}; 