import pako from 'pako';
import Swal from 'sweetalert2';

// Compress data using gzip compression
export const compressData = (data) => {
    try {
        // Convert data to JSON string
        const jsonString = JSON.stringify(data);

        // Compress using gzip
        const compressed = pako.gzip(jsonString);

        // Convert to base64 for safe transmission
        const base64Compressed = btoa(String.fromCharCode.apply(null, compressed));

        return {
            compressed: base64Compressed,
            originalSize: jsonString.length,
            compressedSize: base64Compressed.length,
            compressionRatio: ((jsonString.length - base64Compressed.length) / jsonString.length * 100).toFixed(1)
        };
    } catch (error) {
        // console.error('Compression failed:', error);
        Swal.fire({
            title: 'Compression failed:',
            icon: 'warning',
            timer: 1500,
            showConfirmButton: false,
            showCancelButton: false,
        });
        throw new Error('Failed to compress data');
    }
};

// Decompress data (for server-side use)
export const decompressData = (compressedBase64) => {
    try {
        // Convert from base64
        const compressed = Uint8Array.from(atob(compressedBase64), c => c.charCodeAt(0));

        // Decompress
        const decompressed = pako.ungzip(compressed, { to: 'string' });

        // Parse JSON
        return JSON.parse(decompressed);
    } catch (error) {
        // console.error('Decompression failed:', error);
        Swal.fire({
            title: 'Decompression failed:',
            icon: 'warning',
            timer: 1500,
            showConfirmButton: false,
            showCancelButton: false,
        });
        throw new Error('Failed to decompress data');
    }
};

// Check if compression would be beneficial
export const shouldCompress = (data, threshold = 1024) => {
    const jsonString = JSON.stringify(data);
    return jsonString.length > threshold;
};
