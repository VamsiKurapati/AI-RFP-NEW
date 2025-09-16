import React from 'react';

const ShapeProperties = ({ element, selectedElement, updateElement }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Shape Type</label>
        <select
          value={element.shapeType}
          onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
            shapeType: e.target.value
          })}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="rectangle">Rectangle</option>
          <option value="ellipse">Ellipse</option>
          <option value="triangle">Triangle</option>
          <option value="diamond">Diamond</option>
          <option value="pentagon">Pentagon</option>
          <option value="hexagon">Hexagon</option>
          <option value="octagon">Octagon</option>
          <option value="star">Star</option>
          <option value="heart">Heart</option>
          <option value="cloud">Cloud</option>
          <option value="arrow">Arrow</option>
          <option value="rightArrow">Right Arrow</option>
          <option value="leftArrow">Left Arrow</option>
          <option value="upArrow">Up Arrow</option>
          <option value="downArrow">Down Arrow</option>
          <option value="line">Line</option>
          <option value="parallelogram">Parallelogram</option>
          <option value="trapezoid">Trapezoid</option>
          <option value="chevron">Chevron</option>
          <option value="bookmark">Bookmark</option>
          <option value="lightning">Lightning</option>
          <option value="sun">Sun</option>
          <option value="crescent">Crescent</option>
          <option value="speechBubble">Speech Bubble</option>
          <option value="cross">Cross</option>
          <option value="checkmark">Checkmark</option>
          <option value="plus">Plus</option>
          <option value="minus">Minus</option>
          <option value="exclamation">Exclamation</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fill Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={element.properties.fill || '#f3f4f6'}
            onChange={(e) => {
              const color = e.target.value;
              // Ensure it's a valid 6-digit hex color
              if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                  properties: { ...element.properties, fill: color }
                });
              }
            }}
            className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={element.properties.fill || '#f3f4f6'}
            onChange={(e) => {
              const color = e.target.value;
              // Only allow valid hex color format (6 digits)
              if (/^#[0-9A-Fa-f]{0,6}$/.test(color)) {
                updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                  properties: { ...element.properties, fill: color }
                });
              }
            }}
            maxLength="7"
            className="flex-1 p-2 border border-gray-300 rounded-md"
            placeholder="#f3f4f6"
          />
          <button
            onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              properties: { ...element.properties, fill: 'transparent' }
            })}
            className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-xs"
          >
            None
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Stroke Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={element.properties.stroke || '#111827'}
            onChange={(e) => {
              const color = e.target.value;
              // Ensure it's a valid 6-digit hex color
              if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                  properties: { ...element.properties, stroke: color }
                });
              }
            }}
            className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={element.properties.stroke || '#111827'}
            onChange={(e) => {
              const color = e.target.value;
              // Only allow valid hex color format (6 digits)
              if (/^#[0-9A-Fa-f]{0,6}$/.test(color)) {
                updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                  properties: { ...element.properties, stroke: color }
                });
              }
            }}
            maxLength="7"
            className="flex-1 p-2 border border-gray-300 rounded-md"
            placeholder="#111827"
          />
          <button
            onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              properties: { ...element.properties, stroke: 'none' }
            })}
            className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-xs"
          >
            None
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Stroke Width</label>
        <input
          type="range"
          min="1"
          max="20"
          value={element.properties.strokeWidth || 2}
          onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
            properties: { ...element.properties, strokeWidth: parseInt(e.target.value) }
          })}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1px</span>
          <span>{element.properties.strokeWidth || 2}px</span>
          <span>20px</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Stroke Style</label>
        <select
          value={element.properties.strokeDasharray || 'none'}
          onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
            properties: { ...element.properties, strokeDasharray: e.target.value }
          })}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="none">Solid</option>
          <option value="5,5">Dashed</option>
          <option value="2,2">Dotted</option>
          <option value="10,5">Long Dash</option>
          <option value="5,5,2,2">Dash Dot</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Opacity</label>
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

      {element.shapeType === 'rectangle' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Corner Radius</label>
          <input
            type="range"
            min="0"
            max="50"
            value={element.properties.rx || 6}
            onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              properties: { ...element.properties, rx: parseInt(e.target.value) }
            })}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0px</span>
            <span>{element.properties.rx || 6}px</span>
            <span>50px</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShapeProperties;