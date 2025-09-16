import React, { useEffect, useRef, useCallback } from 'react';
import { Type, Image, Plus, Trash2, Download } from 'lucide-react';
import Swal from 'sweetalert2';

const FloatingToolbar = ({
  addTextElement,
  imageInputRef,
  showBackgroundPanel,
  setShowBackgroundPanel,
  addPage,
  deletePage,
  currentEditingPage,
  clearCurrentPage,
  clearAllPages,
  jsonInputRef,
  exportToJSON,
  exportToPDF,
  exportToSVG,
  totalPages = 1,
  selectedElement,
  selectedEl,
  updateElement,
  deleteElement,
  duplicateElement,
  onDeselect,
  onOpenProperties,
  setProject
}) => {
  const toolbarRef = useRef(null);

  // Check if an element is selected
  const hasSelectedElement = selectedElement && selectedEl;



  // Function to update UI state without creating history
  const updateUIState = useCallback((updates) => {
    if (!selectedEl || !selectedElement) return;

    setProject(prev => {
      const newProject = {
        ...prev,
        pages: prev.pages.map((p, idx) =>
          idx === selectedElement.pageIndex
            ? {
              ...p,
              elements: p.elements.map(el =>
                el.id === selectedElement.elementId
                  ? { ...el, properties: { ...el.properties, ...updates } }
                  : el
              )
            }
            : p
        )
      };
      return newProject;
    });
  }, [selectedEl, selectedElement, setProject]);

  // Function to close all panels
  const closeAllPanels = useCallback(() => {
    try {
      if (selectedEl && selectedElement) {
        updateUIState({
          showLineHeightPanel: false,
          showCommonEffectsPanel: false,
          showSpecialEffectsPanel: false,
          showStrokeStylePanel: false,
          showShapeEffectsPanel: false
        });
      }
    } catch (error) {
      // console.warn('Error closing panels:', error);
      Swal.fire({
        title: "Failed to close panels",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
    }
  }, [selectedEl, selectedElement, updateUIState]);

  // Function to open only one panel at a time
  const openPanel = useCallback((panelName) => {
    try {
      if (selectedEl && selectedElement) {
        const panelStates = {
          showLineHeightPanel: panelName === 'lineHeight',
          showCommonEffectsPanel: panelName === 'commonEffects',
          showSpecialEffectsPanel: panelName === 'specialEffects',
          showStrokeStylePanel: panelName === 'strokeStyle',
          showShapeEffectsPanel: panelName === 'shapeEffects'
        };

        updateUIState(panelStates);
      }
    } catch (error) {
      // console.warn('Error opening panel:', error);
      Swal.fire({
        title: "Failed to open panel",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
    }
  }, [selectedEl, selectedElement, updateUIState]);

  // Handle click outside to close panels
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        closeAllPanels();
      }
    };

    if (hasSelectedElement) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [hasSelectedElement, selectedEl, selectedElement, updateUIState, closeAllPanels]);

  return (
    <div className="flex justify-center items-center w-full">
      {hasSelectedElement ? (
        // Show element properties when an element is selected
        <div ref={toolbarRef} className="flex items-center gap-4 bg-white rounded-2xl shadow-lg px-6 py-4 border border-gray-200 pointer-events-auto max-w-4xl">
          <div className="flex-1 max-w-3xl overflow-x-auto">
            <div className="flex gap-4">
              {selectedEl.type === 'text' && (
                <div className="flex gap-2 items-center">
                  {/* Font Family Selector */}
                  <select
                    value={selectedEl.properties.fontFamily || 'Arial'}
                    onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                      properties: { ...selectedEl.properties, fontFamily: e.target.value }
                    })}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                  </select>

                  {/* Font Size Controls */}
                  <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden">
                    <button
                      onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                        properties: { ...selectedEl.properties, fontSize: Math.max(8, (selectedEl.properties.fontSize || 16) - 1) }
                      })}
                      className="w-8 h-8 bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center text-sm font-medium"
                      title="Decrease Font Size"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-sm font-medium text-gray-700 min-w-12 text-center">
                      {selectedEl.properties.fontSize || 16}
                    </span>
                    <button
                      onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                        properties: { ...selectedEl.properties, fontSize: Math.min(500, (selectedEl.properties.fontSize || 16) + 1) }
                      })}
                      className="w-8 h-8 bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center text-sm font-medium"
                      title="Increase Font Size"
                    >
                      +
                    </button>
                  </div>

                  {/* Text Color Picker */}
                  <div className="flex items-center gap-1">
                    <div className="relative">
                      <input
                        type="color"
                        value={selectedEl.properties.color || '#000000'}
                        onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                          properties: { ...selectedEl.properties, color: e.target.value }
                        })}
                        className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer rounded-md"
                        style={{ zIndex: 1 }}
                      />
                      <div className="w-8 h-8 text-gray-700 hover:bg-gray-100 flex items-center justify-center">
                        <div className="relative">
                          <div className="w-4 h-4 rounded-full" style={{
                            background: `conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000)`
                          }}></div>
                          <div className="absolute inset-0 w-4 h-4 rounded-full bg-white opacity-20"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text Styling Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                        properties: { ...selectedEl.properties, bold: !selectedEl.properties.bold }
                      })}
                      className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded-md ${selectedEl.properties.bold
                        ? 'bg-black bg-opacity-20 text-black'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                        properties: { ...selectedEl.properties, italic: !selectedEl.properties.italic }
                      })}
                      className={`w-8 h-8 flex items-center justify-center text-sm italic rounded-md ${selectedEl.properties.italic
                        ? 'bg-black bg-opacity-20 text-black'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                        properties: { ...selectedEl.properties, underline: !selectedEl.properties.underline }
                      })}
                      className={`w-8 h-8 flex items-center justify-center text-sm underline rounded-md ${selectedEl.properties.underline
                        ? 'bg-black bg-opacity-20 text-black'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      title="Underline"
                    >
                      U
                    </button>
                  </div>

                  {/* Case Conversion */}
                  <button
                    onClick={() => {
                      const currentText = selectedEl.properties.text || '';
                      const newText = currentText === currentText.toUpperCase()
                        ? currentText.toLowerCase()
                        : currentText.toUpperCase();
                      updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                        properties: { ...selectedEl.properties, text: newText }
                      });
                    }}
                    className="w-8 h-8 text-gray-700 hover:bg-gray-100 flex items-center justify-center text-xs font-medium rounded-md"
                    title="Toggle Case"
                  >
                    aA
                  </button>

                  {/* Alignment Button - Cycles through left, center, right, justify */}
                  <button
                    onClick={() => {
                      const currentAlign = selectedEl.properties.textAlign || 'left';
                      const alignments = ['left', 'center', 'right', 'justify'];
                      const currentIndex = alignments.indexOf(currentAlign);
                      const nextIndex = (currentIndex + 1) % alignments.length;
                      const nextAlign = alignments[nextIndex];

                      updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                        properties: { ...selectedEl.properties, textAlign: nextAlign }
                      });
                    }}
                    className="w-8 h-8 text-gray-700 hover:bg-gray-100 flex items-center justify-center rounded-md"
                    title={`Text Align: ${selectedEl.properties.textAlign || 'left'}`}
                  >
                    {/* Using SVG icons from src/components/icons/ */}
                    {selectedEl.properties.textAlign === 'left' && (
                      <svg width="14" height="14" viewBox="-2.24 -2.24 36.48 36.48" fill="currentColor">
                        <path d="M0 30.016h20v-4h-20v4zM0 22.016h28v-4h-28v4zM0 14.016h24v-4h-24v4zM0 6.016h32v-4h-32v4z" />
                      </svg>
                    )}
                    {selectedEl.properties.textAlign === 'center' && (
                      <svg width="14" height="14" viewBox="0 0 48 48" fill="currentColor">
                        <rect x="6.684" y="6" width="34" height="4" />
                        <rect x="7.684" y="26" width="32" height="4" />
                        <rect x="11.684" y="16" width="24" height="4" />
                        <rect x="15.684" y="36" width="16" height="4" />
                      </svg>
                    )}
                    {selectedEl.properties.textAlign === 'right' && (
                      <svg width="14" height="14" viewBox="-2.24 -2.24 36.48 36.48" fill="currentColor">
                        <path d="M0 6.016v-4h32v4h-32zM4 22.016v-4h28v4h-28zM8 14.016v-4h24v4h-24zM12 30.016v-4h20v4h-20z" />
                      </svg>
                    )}
                    {selectedEl.properties.textAlign === 'justify' && (
                      <svg width="14" height="14" viewBox="-40.96 -40.96 593.92 593.92" fill="currentColor">
                        <rect y="15.852" width="512" height="56" />
                        <rect y="157.276" width="512" height="56" />
                        <rect y="298.708" width="512" height="56" />
                        <rect y="440.148" width="512" height="56" />
                      </svg>
                    )}
                  </button>

                  {/* List Button */}
                  <button
                    onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                      properties: { ...selectedEl.properties, listStyle: selectedEl.properties.listStyle === 'bullet' ? 'none' : 'bullet' }
                    })}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${selectedEl.properties.listStyle === 'bullet'
                      ? 'bg-black bg-opacity-20 text-black'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    title="Toggle List"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                    </svg>
                  </button>

                  {/* Line Height/Letter Spacing */}
                  <button
                    className="w-8 h-8 text-gray-700 hover:bg-gray-100 flex items-center justify-center rounded-md"
                    title="Line Height/Letter Spacing"
                    onClick={() => {
                      // Toggle line height panel visibility
                      const currentState = selectedEl.properties.showLineHeightPanel || false;
                      if (currentState) {
                        closeAllPanels();
                      } else {
                        openPanel('lineHeight');
                      }
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 13H15M7 17L11.2717 7.60224C11.5031 7.09323 11.6188 6.83872 11.7791 6.75976C11.9184 6.69115 12.0816 6.69115 12.2209 6.75976C12.3812 6.83872 12.4969 7.09323 12.7283 7.60224L17 17M21 21H3M21 3H3" />
                    </svg>
                  </button>

                  {/* Separator */}
                  <div className="w-px h-6 bg-gray-300"></div>


                </div>
              )}

              {selectedEl.type === 'image' && (
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedEl.properties.fit || 'contain'}
                    onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                      properties: { ...selectedEl.properties, fit: e.target.value }
                    })}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    title="Image Fit: Choose how the image fits within its container"
                  >
                    <option value="contain">Contain</option>
                    <option value="cover">Cover</option>
                    <option value="fill">Fill</option>
                    <option value="none">None</option>
                  </select>

                  {/* Common Effects Button */}
                  <button
                    className={`w-8 h-8 text-gray-700 hover:bg-gray-100 flex items-center justify-center rounded-md ${selectedEl.properties.showCommonEffectsPanel ? 'bg-black bg-opacity-20 text-black' : ''
                      }`}
                    title="Common Effects"
                    onClick={() => {
                      const currentState = selectedEl.properties.showCommonEffectsPanel || false;
                      if (currentState) {
                        closeAllPanels();
                      } else {
                        openPanel('commonEffects');
                      }
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M18,11a1,1,0,0,1-1,1,5,5,0,0,0-5,5,1,1,0,0,1-2,0,5,5,0,0,0-5-5,1,1,0,0,1,0-2,5,5,0,0,0,5-5,1,1,0,0,1,2,0,5,5,0,0,0,5,5A1,1,0,0,1,18,11Z" />
                      <path d="M19,24a1,1,0,0,1-1,1,2,2,0,0,0-2,2,1,1,0,0,1-2,0,2,2,0,0,0-2-2,1,1,0,0,1,0-2,2,2,0,0,0,2-2,1,1,0,0,1,2,0,2,2,0,0,0,2,2A1,1,0,0,1,19,24Z" />
                      <path d="M28,17a1,1,0,0,1-1,1,4,4,0,0,0-4,4,1,1,0,0,1-2,0,4,4,0,0,0-4-4,1,1,0,0,1,0-2,4,4,0,0,0,4-4,1,1,0,0,1,2,0,4,4,0,0,0,4,4A1,1,0,0,1,28,17Z" />
                    </svg>
                  </button>

                  {/* Special Effects Button */}
                  <button
                    className={`w-8 h-8 text-gray-700 hover:bg-gray-100 flex items-center justify-center rounded-md ${selectedEl.properties.showSpecialEffectsPanel ? 'bg-black bg-opacity-20 text-black' : ''
                      }`}
                    title="Special Effects"
                    onClick={() => {
                      const currentState = selectedEl.properties.showSpecialEffectsPanel || false;
                      if (currentState) {
                        closeAllPanels();
                      } else {
                        openPanel('specialEffects');
                      }
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M30.87,14.23,26,22.67V8l3.77,2.18A3,3,0,0,1,30.87,14.23Z" />
                      <path d="M6,8.26V22.34l-4.6-8a3,3,0,0,1,1.1-4.1Z" />
                      <path d="M21,4H11A3,3,0,0,0,8,7V25a3,3,0,0,0,3,3H21a3,3,0,0,0,3-3V7A3,3,0,0,0,21,4ZM13,8a1,1,0,1,1-1,1A1,1,0,0,1,13,8Zm6,16a1,1,0,1,1,1-1A1,1,0,0,1,19,24Zm-3-4a4,4,0,1,1,4-4A4,4,0,0,1,16,20Z" />
                      <circle cx="16" cy="16" r="2" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Common Effects Panel */}
              {selectedEl.type === 'image' && selectedEl.properties.showCommonEffectsPanel && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 min-w-64">
                  <div className="text-sm font-medium text-gray-700 mb-3">Common Effects</div>

                  {/* Brightness */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600">Brightness</span>
                      <span className="text-xs text-gray-500">{Math.round((selectedEl.properties.brightness || 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={selectedEl.properties.brightness || 1}
                      onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                        properties: { ...selectedEl.properties, brightness: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0%</span>
                      <span>100%</span>
                      <span>200%</span>
                    </div>
                  </div>

                  {/* Contrast */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600">Contrast</span>
                      <span className="text-xs text-gray-500">{Math.round((selectedEl.properties.contrast || 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={selectedEl.properties.contrast || 1}
                      onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                        properties: { ...selectedEl.properties, contrast: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0%</span>
                      <span>100%</span>
                      <span>200%</span>
                    </div>
                  </div>

                  {/* Saturation */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600">Saturation</span>
                      <span className="text-xs text-gray-500">{Math.round((selectedEl.properties.saturation || 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={selectedEl.properties.saturation || 1}
                      onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                        properties: { ...selectedEl.properties, saturation: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0%</span>
                      <span>100%</span>
                      <span>200%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Special Effects Panel */}
              {selectedEl.type === 'image' && selectedEl.properties.showSpecialEffectsPanel && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 min-w-64">
                  <div className="text-sm font-medium text-gray-700 mb-3">Special Effects</div>

                  {/* Opacity */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600">Opacity</span>
                      <span className="text-xs text-gray-500">{Math.round((selectedEl.properties.opacity || 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={selectedEl.properties.opacity || 1}
                      onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                        properties: { ...selectedEl.properties, opacity: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0%</span>
                      <span>100%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Blur */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600">Blur</span>
                      <span className="text-xs text-gray-500">{selectedEl.properties.blur || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={selectedEl.properties.blur || 0}
                      onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                        properties: { ...selectedEl.properties, blur: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0px</span>
                      <span>0px</span>
                      <span>10px</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Stroke Style Panel */}
              {selectedEl.type === 'shape' && selectedEl.properties.showStrokeStylePanel && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 min-w-64">
                  <div className="text-sm font-medium text-gray-700 mb-3">Stroke Style</div>

                  {/* Line Style Options */}
                  <div className="mb-4">
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                          properties: { ...selectedEl.properties, strokeDasharray: undefined }
                        })}
                        className={`w-10 h-10 border rounded-md flex items-center justify-center ${!selectedEl.properties.strokeDasharray || selectedEl.properties.strokeDasharray === 'none'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-300 hover:border-gray-400'
                          }`}
                        title="Solid Line"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="3" y1="12" x2="21" y2="12" />
                        </svg>
                      </button>
                      <button
                        onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                          properties: { ...selectedEl.properties, strokeDasharray: '5,5' }
                        })}
                        className={`w-10 h-10 border rounded-md flex items-center justify-center ${selectedEl.properties.strokeDasharray === '5,5'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-300 hover:border-gray-400'
                          }`}
                        title="Dashed Line"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 12h4M9 12h4M15 12h4M21 12h3" />
                        </svg>
                      </button>
                      <button
                        onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                          properties: { ...selectedEl.properties, strokeDasharray: '2,2' }
                        })}
                        className={`w-10 h-10 border rounded-md flex items-center justify-center ${selectedEl.properties.strokeDasharray === '2,2'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-300 hover:border-gray-400'
                          }`}
                        title="Dotted Line"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="6" cy="12" r="1" />
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="18" cy="12" r="1" />
                        </svg>
                      </button>
                      <button
                        onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                          properties: { ...selectedEl.properties, strokeDasharray: '5,5,2,2' }
                        })}
                        className={`w-10 h-10 border rounded-md flex items-center justify-center ${selectedEl.properties.strokeDasharray === '5,5,2,2'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-300 hover:border-gray-400'
                          }`}
                        title="Dash-Dot Line"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 12h3M9 12h3M15 12h3" />
                          <circle cx="21" cy="12" r="1" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Stroke Weight */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600">Stroke weight</span>
                      <span className="text-xs text-gray-500">{selectedEl.properties.strokeWidth || 2}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={selectedEl.properties.strokeWidth || 2}
                      onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                        properties: { ...selectedEl.properties, strokeWidth: parseInt(e.target.value) }
                      })}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0px</span>
                      <span>10px</span>
                      <span>20px</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Shape Effects Panel */}
              {selectedEl.type === 'shape' && selectedEl.properties.showShapeEffectsPanel && (
                <div className="absolute top-full right-0 -mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 min-w-64">
                  <div className="text-sm font-medium text-gray-700 mb-3">Special Effects</div>

                  {/* Opacity */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600">Opacity</span>
                      <span className="text-xs text-gray-500">{Math.round((selectedEl.properties.opacity || 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={selectedEl.properties.opacity || 1}
                      onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                        properties: { ...selectedEl.properties, opacity: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0%</span>
                      <span>100%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Corner Radius */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600">Corner Radius</span>
                      <span className="text-xs text-gray-500">{selectedEl.properties.rx || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={selectedEl.properties.rx || 0}
                      onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                        properties: { ...selectedEl.properties, rx: parseInt(e.target.value) }
                      })}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0px</span>
                      <span>25px</span>
                      <span>50px</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedEl.type === 'shape' && (
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedEl.shapeType || 'rectangle'}
                    onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                      shapeType: e.target.value
                    })}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="rectangle">Rectangle</option>
                    <option value="ellipse">Ellipse</option>
                    <option value="triangle">Triangle</option>
                    <option value="diamond">Diamond</option>
                    <option value="star">Star</option>
                  </select>
                  <input
                    type="color"
                    value={selectedEl.properties.fill || '#f3f4f6'}
                    onChange={(e) => {
                      const color = e.target.value;
                      // Ensure it's a valid 6-digit hex color
                      if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                        updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                          properties: { ...selectedEl.properties, fill: color }
                        });
                      }
                    }}
                    className="w-8 h-8 border border-gray-300 rounded-md cursor-pointer"
                    title="Fill Color"
                  />
                  <input
                    type="color"
                    value={selectedEl.properties.stroke || '#111827'}
                    onChange={(e) => {
                      const color = e.target.value;
                      // Ensure it's a valid 6-digit hex color
                      if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                        updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                          properties: { ...selectedEl.properties, stroke: color }
                        });
                      }
                    }}
                    className="w-8 h-8 border border-gray-300 rounded-md cursor-pointer"
                    title="Stroke Color"
                  />

                  {/* Stroke Style Button */}
                  <button
                    className={`w-8 h-8 text-gray-700 hover:bg-gray-100 flex items-center justify-center rounded-md ${selectedEl.properties.showStrokeStylePanel ? 'bg-black bg-opacity-20 text-black' : ''
                      }`}
                    title="Stroke Style"
                    onClick={() => {
                      const currentState = selectedEl.properties.showStrokeStylePanel || false;
                      if (currentState) {
                        closeAllPanels();
                      } else {
                        openPanel('strokeStyle');
                      }
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 12h18" />
                      <path d="M3 6h18" />
                      <path d="M3 18h18" />
                    </svg>
                  </button>

                  {/* Special Effects Button */}
                  <button
                    className={`w-8 h-8 text-gray-700 hover:bg-gray-100 flex items-center justify-center rounded-md ${selectedEl.properties.showShapeEffectsPanel ? 'bg-black bg-opacity-20 text-black' : ''
                      }`}
                    title="Special Effects"
                    onClick={() => {
                      const currentState = selectedEl.properties.showShapeEffectsPanel || false;
                      if (currentState) {
                        closeAllPanels();
                      } else {
                        openPanel('shapeEffects');
                      }
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M30.87,14.23,26,22.67V8l3.77,2.18A3,3,0,0,1,30.87,14.23Z" />
                      <path d="M6,8.26V22.34l-4.6-8a3,3,0,0,1,1.1-4.1Z" />
                      <path d="M21,4H11A3,3,0,0,0,8,7V25a3,3,0,0,0,3,3H21a3,3,0,0,0,3-3V7A3,3,0,0,0,21,4ZM13,8a1,1,0,1,1-1,1A1,1,0,0,1,13,8Zm6,16a1,1,0,1,1,1-1A1,1,0,0,1,19,24Zm-3-4a4,4,0,1,1,4-4A4,4,0,0,1,16,20Z" />
                      <circle cx="16" cy="16" r="2" />
                    </svg>
                  </button>
                </div>
              )}

              {selectedEl.type === 'svg' && (
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedEl.properties?.fit || 'contain'}
                    onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                      properties: { ...selectedEl.properties, fit: e.target.value }
                    })}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="contain">Contain</option>
                    <option value="cover">Cover</option>
                    <option value="fill">Fill</option>
                    <option value="none">None</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => duplicateElement(selectedEl, selectedElement)}
              className="w-8 h-8 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center"
              title="Duplicate"
            >
              <svg width="14" height="14" viewBox="-1.68 -1.68 27.36 27.36" fill="currentColor">
                <path d="M24,24H6V6h18V24z M8,22h14V8H8V22z M4,18H0v-4h2v2h2V18z M2,12H0V6h2V12z M18,4h-2V2h-2V0h4V4z M2,4H0V0h4v2H2V4z M12,2 H6V0h6V2z" />
              </svg>
            </button>
            <button
              onClick={() => deleteElement(selectedElement.pageIndex, selectedElement.elementId)}
              className="w-8 h-8 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={onOpenProperties}
              className="w-8 h-8 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center"
              title="More Options"
            >
              <span className="text-lg font-bold">⋯</span>
            </button>
          </div>
        </div>
      ) : (
        // Show regular toolbar when no element is selected
        <div
          className="flex items-center gap-5 bg-white rounded-2xl shadow-lg px-6 py-3 border border-gray-200 pointer-events-auto"
          style={{
            minWidth: 0,
            width: 'fit-content'
          }}
        >
          <button
            onClick={addTextElement}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
            title="Add Text"
          >
            <Type size={20} />
          </button>
          <button
            onClick={() => imageInputRef.current?.click()}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
            title="Add Image"
          >
            <Image size={20} />
          </button>
          <button
            onClick={addPage}
            disabled={totalPages >= 50}
            className={`p-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${totalPages >= 50
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-indigo-500 text-white hover:bg-indigo-600 hover:scale-105'
              }`}
            title={totalPages >= 50 ? "Maximum page limit reached (50 pages)" : "Add Page"}
          >
            <Plus size={20} />
          </button>
          <button
            onClick={() => deletePage(currentEditingPage)}
            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
            title="Delete Current Page"
          >
            <Trash2 size={20} />
          </button>
          <button
            onClick={exportToPDF}
            className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
            title="Export PDF"
          >
            <Download size={20} />
          </button>
        </div>
      )}

      {selectedEl && selectedEl.type === 'text' && selectedEl.properties.showLineHeightPanel && (
        <div className="absolute top-full left-[87%] transform -translate-x-1/2 -mt-5 bg-white border border-gray-200 rounded-lg p-2 min-w-64 z-[9999] shadow-lg">
          <div className="space-y-4">
            {/* Letter Spacing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Letter spacing</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="-1"
                  max="10"
                  step="0.1"
                  value={selectedEl.properties.letterSpacing || 0}
                  onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                    properties: { ...selectedEl.properties, letterSpacing: parseFloat(e.target.value) }
                  })}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  value={selectedEl.properties.letterSpacing || 0}
                  onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                    properties: { ...selectedEl.properties, letterSpacing: parseFloat(e.target.value) }
                  })}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  min="-1"
                  max="10"
                  step="0.1"
                />
              </div>
            </div>

            {/* Line Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Line spacing</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={selectedEl.properties.lineHeight || 1.2}
                  onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                    properties: { ...selectedEl.properties, lineHeight: parseFloat(e.target.value) }
                  })}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  value={selectedEl.properties.lineHeight || 1.2}
                  onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                    properties: { ...selectedEl.properties, lineHeight: parseFloat(e.target.value) }
                  })}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  min="1"
                  max="3"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingToolbar;