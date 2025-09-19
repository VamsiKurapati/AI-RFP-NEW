import axios from 'axios';
import { shouldCompress, compressData } from '../utils/compression';
import Swal from 'sweetalert2';

const handleWordGeneration = async (proposal) => {
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
    loadingDiv.innerHTML = 'Preparing Word export...';
    document.body.appendChild(loadingDiv);
    //Proposal is a base64 string. Convert it as downloadable .docx file
    const proposal = atob(project);
    const proposalData = JSON.parse(proposal);
    console.log(proposalData);
    const docxBlob = new Blob([proposalData], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const docxUrl = URL.createObjectURL(docxBlob);
    const link = document.createElement('a');
    link.href = docxUrl;
    link.download = 'proposal.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(docxUrl);
};

export default handleWordGeneration;