import React from 'react';
import TextProperties from './Properties/TextProperties';
import ImageProperties from './Properties/ImageProperties';
import ShapeProperties from './Properties/ShapeProperties';
import CommonProperties from './Properties/CommonProperties';
import { truncateText } from '../utils/text';

const PropertiesPanel = ({
  show,
  selectedElement,
  selectedEl,
  updateElement,
  deleteElement,
  duplicateElement,
  onClose,
  project,
}) => {
  if (!show) return null;

  return (
    <div className="fixed left-[70px] top-16 w-80 bg-white border-r border-gray-200 shadow-lg overflow-y-auto z-20 sidebar-panel mb-16 max-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM13 9a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Element Properties</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {!selectedEl ? (
          // No element selected state
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-800 mb-2">No Element Selected</h4>
              <p className="text-sm text-gray-600">
                Select an element on the canvas to see its properties and make adjustments.
              </p>
            </div>
          </div>
        ) : (
          // Element selected state
          <>
            {/* Element Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">Selected Element</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">
                  {selectedEl.type}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {selectedEl.type === 'text' && (selectedEl.properties?.text ? truncateText(selectedEl.properties.text, 30) : 'Text element')}
                {selectedEl.type === 'image' && 'Image element'}
                {selectedEl.type === 'shape' && `${selectedEl.shapeType || 'Shape'} element`}
                {selectedEl.type === 'svg' && 'SVG element'}
              </p>
            </div>

            {/* Element-specific properties */}
            <div className="space-y-6">
              {selectedEl.type === 'text' && selectedElement && selectedElement.pageIndex !== undefined && selectedElement.pageIndex >= 0 && selectedElement.pageIndex < project.pages.length && (
                <TextProperties
                  element={selectedEl}
                  selectedElement={selectedElement}
                  updateElement={updateElement}
                />
              )}

              {selectedEl.type === 'image' && selectedElement && selectedElement.pageIndex !== undefined && selectedElement.pageIndex >= 0 && selectedElement.pageIndex < project.pages.length && (
                <ImageProperties
                  element={selectedEl}
                  selectedElement={selectedElement}
                  updateElement={updateElement}
                />
              )}

              {selectedEl.type === 'shape' && selectedElement && selectedElement.pageIndex !== undefined && selectedElement.pageIndex >= 0 && selectedElement.pageIndex < project.pages.length && (
                <ShapeProperties
                  element={selectedEl}
                  selectedElement={selectedElement}
                  updateElement={updateElement}
                />
              )}

              {selectedEl.type === 'svg' && selectedElement && selectedElement.pageIndex !== undefined && selectedElement.pageIndex >= 0 && selectedElement.pageIndex < project.pages.length && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">SVG Properties</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fit</label>
                    <select
                      value={selectedEl.properties?.fit || 'contain'}
                      onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                        properties: { ...selectedEl.properties, fit: e.target.value }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="contain">Contain</option>
                      <option value="cover">Cover</option>
                      <option value="fill">Fill</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Common properties for all elements */}
              {selectedElement && selectedElement.pageIndex !== undefined && selectedElement.pageIndex >= 0 && selectedElement.pageIndex < project.pages.length && (
                <CommonProperties
                  element={selectedEl}
                  selectedElement={selectedElement}
                  updateElement={updateElement}
                  deleteElement={deleteElement}
                  duplicateElement={duplicateElement}
                  project={project}
                />
              )}
            </div>
          </>
        )}

        {/* Actions */}
        {selectedEl && selectedElement && selectedElement.pageIndex !== undefined && selectedElement.pageIndex >= 0 && selectedElement.pageIndex < project.pages.length && (
          <div className="border-t pt-4 mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Actions</h4>
            <div className="space-y-3">
              <button
                onClick={() => duplicateElement()}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate Element
              </button>
              <button
                onClick={() => deleteElement(selectedElement.pageIndex, selectedElement.elementId)}
                className="w-full px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Element
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel; 