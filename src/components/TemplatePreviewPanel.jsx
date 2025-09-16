import React from 'react';
import { scaleSVGToFitPage } from '../utils/svg';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../constants';
import Swal from 'sweetalert2';

const TemplatePreviewPanel = ({ show, folder, svgPreviews, onClose, setBackground }) => {
  if (!show || !folder) return null;

  const previews = svgPreviews[folder] || [];

  const handleTemplateApply = (svgUrl) => {
    fetch(svgUrl)
      .then(res => res.text())
      .then(svgContent => {
        // Scale the SVG to fit the page dimensions
        const scaledSVG = scaleSVGToFitPage(svgContent, PAGE_WIDTH, PAGE_HEIGHT);
        setBackground('svg', scaledSVG);
      })
      .catch(error => {
        // console.error('Error loading template:', error);
        Swal.fire({
          title: "Failed to load template",
          icon: "error",
          timer: 1500,
          showConfirmButton: false,
          showCancelButton: false,
        });
      });
  };

  return (
    <div className="fixed left-[352px] top-16 w-80 bg-white border-r border-gray-200 shadow-lg overflow-y-auto z-30 sidebar-panel mb-16 max-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{folder} - Pages</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-3 overflow-y-auto h-full">
          {previews.map((svgUrl, idx) => (
            <button
              key={idx}
              className="border rounded p-2 bg-gray-50 hover:bg-blue-50 transition-colors flex flex-col items-center min-w-0"
              onClick={() => handleTemplateApply(svgUrl)}
            >
              <div className="w-20 h-28 flex items-center justify-center overflow-hidden bg-white border mb-1 rounded">
                <img src={svgUrl} alt="SVG preview" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewPanel; 