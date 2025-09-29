import axios from 'axios';
import { shouldCompress, compressData } from '../utils/compression';
import Swal from 'sweetalert2';

const handleWordGeneration = async (proposal) => {
    const project = proposal;

    // Create loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        color: white;
        font-family: Arial, sans-serif;
        font-size: 18px;
    `;
    loadingDiv.innerHTML = 'Preparing Word export...';
    document.body.appendChild(loadingDiv);

    try {
        // Validate input
        if (!project) {
            throw new Error('No proposal data provided');
        }

        // Check if it's a valid base64 string
        const isValidBase64 = (str) => {
            if (!str || typeof str !== 'string') return false;
            try {
                // Check if it's a valid base64 string by trying to decode it
                const decoded = atob(str);
                // Check if it can be re-encoded to the same string (roundtrip test)
                return btoa(decoded) === str;
            } catch (e) {
                return false;
            }
        };

        let binaryData;

        if (isValidBase64(project)) {
            // It's a base64 string, decode it
            binaryData = atob(project);
        } else {
            // It might already be binary data or JSON
            if (typeof project === 'string') {
                try {
                    // Try to parse as JSON first
                    const jsonData = JSON.parse(project);
                    binaryData = JSON.stringify(jsonData);
                } catch (e) {
                    // If not JSON, use as is
                    binaryData = project;
                }
            } else {
                // If it's an object, stringify it
                binaryData = JSON.stringify(project);
            }
        }

        // Convert to Uint8Array for proper binary handling
        const uint8Array = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i);
        }

        // Create blob and download
        const docxBlob = new Blob([uint8Array], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        const docxUrl = URL.createObjectURL(docxBlob);
        const link = document.createElement('a');
        link.href = docxUrl;
        link.download = `proposal_${new Date().getTime()}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(docxUrl);

    } catch (error) {

        // Show error message to user
        Swal.fire({
            icon: 'error',
            title: 'Download Failed',
            text: `Failed to generate Word document: ${error.message}. Please try again or contact support.`,
            confirmButtonColor: '#2563EB'
        });
    } finally {
        // Always remove loading indicator
        if (document.body.contains(loadingDiv)) {
            document.body.removeChild(loadingDiv);
        }
    }
};

export default handleWordGeneration;