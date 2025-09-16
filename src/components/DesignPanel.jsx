import React from 'react';
import { scaleSVGToFitPage } from '../utils/svg';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../constants';
import Swal from 'sweetalert2';

const DesignPanel = ({
  show,
  view = 'main',
  onBack,
  onClose,
  selectedTemplateSet,
  onTemplateSetClick,
  sets = {},
  svgPreviews = {},
  handleSVGUpload,
  svgInputRef,
  setBackground
}) => {
  if (!show) return null;



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

  // Template preview view
  if (view === 'preview' && selectedTemplateSet) {
    const previews = svgPreviews[selectedTemplateSet] || [];
    return (
      <div className="fixed left-[70px] top-16 w-80 bg-white border-r border-gray-200 shadow-lg overflow-y-auto z-20 sidebar-panel mb-16 max-h-[calc(100vh-4rem)]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button onClick={e => { e.stopPropagation(); onBack(); }} className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-300 mr-2">←</button>
              <h3 className="text-lg font-semibold text-gray-800">{selectedTemplateSet} - Pages</h3>
            </div>
            <button onClick={e => { e.stopPropagation(); onClose(); }} className="text-gray-500 hover:text-gray-700">✕</button>
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
  }

  // Main design tools view
  return (
    <div className="fixed left-[70px] top-16 w-80 bg-white border-r border-gray-200 shadow-lg overflow-y-auto z-20 sidebar-panel mb-16 max-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Design Logo */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Design</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {/* Design Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Design Tools</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Templates & Colors
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Upload templates and customize backgrounds
          </p>
        </div>

        <div className="space-y-6">
          {/* SVG Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Templates</label>
            <button
              onClick={() => svgInputRef.current?.click()}
              className="w-full px-4 py-3 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors mb-2"
            >
              Upload SVG Template
            </button>
            <p className="text-xs text-gray-500 mb-4">Upload an SVG file to use as template background</p>
            {/* Template Sets */}
            {Object.keys(sets).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Template Sets</label>
                <div className="grid grid-cols-2 gap-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                  {Object.entries(sets).map(([folder, svgs]) => {
                    const firstSvgUrl = svgPreviews[folder]?.[0];
                    return (
                      <button
                        key={folder}
                        className="flex flex-col items-center border rounded p-2 bg-gray-50 hover:bg-blue-50 transition-colors min-w-0"
                        onClick={e => { e.stopPropagation(); onTemplateSetClick(folder); }}
                      >
                        <div className="w-16 h-20 flex items-center justify-center overflow-hidden bg-white border mb-1 rounded">
                          {firstSvgUrl ? (
                            <img src={firstSvgUrl} alt={folder} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                          ) : (
                            <span className="text-xs text-gray-400">No preview</span>
                          )}
                        </div>
                        <span className="text-xs text-center font-medium">{folder}</span>
                        {svgs && Array.isArray(svgs) && (
                          <span className="text-xs text-gray-400">({svgs.length} pages)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {Object.keys(sets).length === 0 && (
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                No template sets available. Upload SVG files to create templates.
              </div>
            )}
          </div>
          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Background Color</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                onChange={(e) => setBackground('color', e.target.value)}
                className="w-10 h-10 border rounded cursor-pointer"
                defaultValue="#ffffff"
              />
              <button
                onClick={() => setBackground('color', '#ffffff')}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
              >
                Reset
              </button>
            </div>
          </div>
          {/* Gradient Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Gradient Backgrounds</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { gradient: 'linear-gradient(45deg, #ff6b6b, #ffd93d)', name: 'Sunset' },
                { gradient: 'linear-gradient(135deg, #667eea, #764ba2)', name: 'Purple Sky' },
                { gradient: 'linear-gradient(45deg, #56ab2f, #a8e6cf)', name: 'Forest' },
                { gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)', name: 'Peach' },
                { gradient: 'linear-gradient(45deg, #a8edea, #fed6e3)', name: 'Mint' },
                { gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)', name: 'Pink' },
                { gradient: 'linear-gradient(45deg, #ffecd2, #fcb69f)', name: 'Orange' },
                { gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)', name: 'Cyan' }
              ].map((gradient, index) => (
                <button
                  key={index}
                  onClick={() => setBackground('gradient', gradient.gradient)}
                  className="w-full h-10 rounded border border-gray-300 hover:border-blue-500 transition-colors flex items-center justify-center text-white text-xs font-medium shadow-sm"
                  style={{ background: gradient.gradient }}
                  title={gradient.name}
                >
                  {gradient.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignPanel;