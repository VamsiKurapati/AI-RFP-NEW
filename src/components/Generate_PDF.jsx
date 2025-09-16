import axios from 'axios';
import { shouldCompress, compressData } from '../utils/compression';
import Swal from 'sweetalert2';

const handlePDFGeneration = async (proposal) => {
    const project = JSON.parse(localStorage.getItem('canva-project')) || JSON.parse(proposal);
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
    loadingDiv.innerHTML = 'Preparing PDF export...';
    document.body.appendChild(loadingDiv);
    try {
        // console.log("Sending request to generate PDF...");
        let jsonData = null;
        let isCompressed = false;
        if (shouldCompress(project)) {
            const compressedResult = compressData(project);
            jsonData = compressedResult.compressed;
            isCompressed = true;
        } else {
            jsonData = project;
        }
        const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/proposals/generatePDF`,
            {
                project: jsonData,
                isCompressed
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    Accept: 'application/pdf, application/octet-stream'
                },
                responseType: 'blob'
            }
        );

        // console.log("Response status:", res.status);
        const contentType = (res.headers && (res.headers['content-type'] || res.headers['Content-Type'])) || '';
        // console.log("Content type:", contentType);

        // If server sent JSON, extract and show the error/info
        if (contentType && contentType.includes('application/json')) {
            const text = await res.data.text();
            try {
                const json = JSON.parse(text);
                throw new Error(json.message || 'Server returned JSON instead of a PDF.');
            } catch (e) {
                throw new Error(typeof text === 'string' && text.length < 500 ? text : 'Server returned JSON instead of a PDF.');
            }
        }

        // Expect a PDF blob
        const pdfBlob = res.data && res.data instanceof Blob ? res.data : new Blob([res.data], { type: 'application/pdf' });

        const blobUrl = URL.createObjectURL(pdfBlob);
        // console.log("Blob URL:", blobUrl);
        // Download automatically
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `proposal-${new Date()
            .toISOString()
            .slice(0, 19)
            .replace(/:/g, "-")}.pdf`;
        // console.log("Link:", link);
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Optional: open in new tab
        window.open(blobUrl, "_blank");

        // Cleanup
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
        // console.error("PDF export error:", err);
        Swal.fire({
            title: "Failed to generate PDF. Please try again.",
            icon: "error",
            timer: 1500,
            showConfirmButton: false,
            showCancelButton: false,
        });
    } finally {
        // Remove loading indicator
        document.body.removeChild(loadingDiv);
    }
};

export default handlePDFGeneration;