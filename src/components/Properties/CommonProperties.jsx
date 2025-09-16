import React from 'react';

const CommonProperties = ({
  element,
  selectedElement,
  updateElement,
  deleteElement,
  duplicateElement,
  project
}) => {
  return (
    <div className="border-t pt-4 mt-6">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Position & Size</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">X Position</label>
          <input
            type="number"
            value={Math.round(element.x)}
            onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              x: parseInt(e.target.value)
            })}
            className="w-full p-2 text-sm border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Y Position</label>
          <input
            type="number"
            value={Math.round(element.y)}
            onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              y: parseInt(e.target.value)
            })}
            className="w-full p-2 text-sm border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Width</label>
          <input
            type="number"
            value={Math.round(element.width)}
            onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              width: parseInt(e.target.value)
            })}
            className="w-full p-2 text-sm border border-gray-300 rounded-md"
            min="20"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Height</label>
          <input
            type="number"
            value={Math.round(element.height)}
            onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              height: parseInt(e.target.value)
            })}
            className="w-full p-2 text-sm border border-gray-300 rounded-md"
            min="20"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-xs text-gray-600 mb-1">Rotation</label>
        <input
          type="range"
          min="0"
          max="360"
          value={element.rotation}
          onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
            rotation: parseInt(e.target.value)
          })}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0°</span>
          <span>{element.rotation}°</span>
          <span>360°</span>
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-xs text-gray-600 mb-1">Z-Index (Layer Order)</label>
        <input
          type="number"
          value={isNaN(element.zIndex) ? 0 : element.zIndex}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              zIndex: isNaN(value) ? 0 : value
            });
          }}
          className="w-full p-2 text-sm border border-gray-300 rounded-md"
          min="0"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              zIndex: (isNaN(element.zIndex) ? 0 : element.zIndex) + 1
            })}
            className="flex-1 py-1 px-2 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
          >
            Bring Forward
          </button>
          <button
            onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              zIndex: Math.max(0, (isNaN(element.zIndex) ? 0 : element.zIndex) - 1)
            })}
            className="flex-1 py-1 px-2 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
          >
            Send Back
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={() => duplicateElement(element, selectedElement)}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Duplicate Element
        </button>
        <button
          onClick={() => deleteElement(selectedElement.pageIndex, selectedElement.elementId)}
          className="w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Delete Element
        </button>
      </div>

      <div className="mt-4 pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              x: 0, y: 0
            })}
            className="py-2 px-3 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
          >
            Reset Position
          </button>
          <button
            onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              rotation: 0
            })}
            className="py-2 px-3 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
          >
            Reset Rotation
          </button>
          <button
            onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              width: 100, height: 100
            })}
            className="py-2 px-3 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
          >
            Reset Size
          </button>
          <button
            onClick={() => {
              // Center element on canvas using actual page settings
              const page = project.pages[selectedElement.pageIndex];
              const centerX = (page.pageSettings.width - element.width) / 2;
              const centerY = (page.pageSettings.height - element.height) / 2;
              updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                x: centerX, y: centerY
              });
            }}
            className="py-2 px-3 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
          >
            Center
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommonProperties;