import React from 'react';

const ImageProperties = ({ element, selectedElement, updateElement }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image Fit</label>
        <select
          value={element.properties.fit}
          onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
            properties: { ...element.properties, fit: e.target.value }
          })}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="contain">Contain - Fit entire image</option>
          <option value="cover">Cover - Fill container</option>
          <option value="fill">Fill - Stretch to fit</option>
          <option value="none">None - Original size</option>
          <option value="scale-down">Scale Down - Smaller of contain or none</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {element.properties.fit === 'contain' && 'Image will be scaled to fit entirely within the container'}
          {element.properties.fit === 'cover' && 'Image will cover the entire container, may be cropped'}
          {element.properties.fit === 'fill' && 'Image will be stretched to fill the container exactly'}
          {element.properties.fit === 'none' && 'Image will maintain its original size'}
          {element.properties.fit === 'scale-down' && 'Image will be scaled down if needed'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image Preview</label>
        <div className="w-full h-32 border border-gray-300 rounded-md overflow-hidden bg-gray-50">
          <img
            src={element.properties.src}
            alt="Preview"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Flip Options</label>
        <div className="flex gap-2">
          <button
            onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              properties: {
                ...element.properties,
                flipHorizontal: !element.properties.flipHorizontal
              }
            })}
            className={`flex-1 p-2 border rounded-md text-sm font-medium transition-colors ${element.properties.flipHorizontal
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            Flip Horizontal
          </button>
          <button
            onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              properties: {
                ...element.properties,
                flipVertical: !element.properties.flipVertical
              }
            })}
            className={`flex-1 p-2 border rounded-md text-sm font-medium transition-colors ${element.properties.flipVertical
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            Flip Vertical
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
        <input
          type="range"
          min="0"
          max="50"
          value={element.properties.borderRadius || 0}
          onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
            properties: { ...element.properties, borderRadius: parseInt(e.target.value) }
          })}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0px</span>
          <span>{element.properties.borderRadius || 0}px</span>
          <span>50px</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image Filters</label>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={element.properties.opacity || 1}
              onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                properties: { ...element.properties, opacity: parseFloat(e.target.value) }
              })}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>{Math.round((element.properties.opacity || 1) * 100)}%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Brightness</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={element.properties.brightness || 1}
              onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                properties: { ...element.properties, brightness: parseFloat(e.target.value) }
              })}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>{Math.round((element.properties.brightness || 1) * 100)}%</span>
              <span>200%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Contrast</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={element.properties.contrast || 1}
              onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                properties: { ...element.properties, contrast: parseFloat(e.target.value) }
              })}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>{Math.round((element.properties.contrast || 1) * 100)}%</span>
              <span>200%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Saturation</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={element.properties.saturate || 1}
              onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                properties: { ...element.properties, saturate: parseFloat(e.target.value) }
              })}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>{Math.round((element.properties.saturate || 1) * 100)}%</span>
              <span>200%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Blur</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={element.properties.blur || 0}
              onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                properties: { ...element.properties, blur: parseFloat(e.target.value) }
              })}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0px</span>
              <span>{element.properties.blur || 0}px</span>
              <span>10px</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
            properties: {
              ...element.properties,
              opacity: 1,
              brightness: 1,
              contrast: 1,
              saturate: 1,
              blur: 0
            }
          })}
          className="w-full mt-3 p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default ImageProperties;