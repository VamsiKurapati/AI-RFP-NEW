import axios from 'axios';
import { shouldCompress, compressData } from '../utils/compression';
import Swal from 'sweetalert2';

const handlePDFGeneration = async (proposal) => {
    const project = proposal;
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

        const contentType = (res.headers && (res.headers['content-type'] || res.headers['Content-Type'])) || '';

        if (contentType && contentType.includes('application/json')) {
            const text = await res.data.text();
            try {
                const json = JSON.parse(text);
                throw new Error(json.message || 'Server returned JSON instead of a PDF.');
            } catch (e) {
                throw new Error(typeof text === 'string' && text.length < 500 ? text : 'Server returned JSON instead of a PDF.');
            }
        }

        const pdfBlob = res.data && res.data instanceof Blob ? res.data : new Blob([res.data], { type: 'application/pdf' });

        const blobUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `proposal-${new Date()
            .toISOString()
            .slice(0, 19)
            .replace(/:/g, "-")}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.open(blobUrl, "_blank");

        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
        Swal.fire({
            title: "Failed to generate PDF. Please try again.",
            icon: "error",
            timer: 1500,
            showConfirmButton: false,
            showCancelButton: false,
        });
    } finally {
        document.body.removeChild(loadingDiv);
    }
};

export default handlePDFGeneration;