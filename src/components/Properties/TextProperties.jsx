import React from 'react';

const TextProperties = ({ element, selectedElement, updateElement }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
        <textarea
          value={element.properties.text}
          onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
            properties: { ...element.properties, text: e.target.value }
          })}
          className="w-full h-24 p-2 border border-gray-300 rounded-md resize-none"
          placeholder="Enter text..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
          <input
            type="number"
            value={element.properties.fontSize}
            onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              properties: { ...element.properties, fontSize: parseInt(e.target.value) }
            })}
            className="w-full p-2 border border-gray-300 rounded-md"
            min="8"
            max="72"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
          <select
            value={element.properties.fontFamily}
            onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              properties: { ...element.properties, fontFamily: e.target.value }
            })}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
            <option value="Courier New">Courier New</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
            <option value="Impact">Impact</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
            <option value="Palatino">Palatino</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={element.properties.color}
            onChange={(e) => {
              updateElement(selectedElement.pageIndex, selectedElement.elementId, {
                properties: { ...element.properties, color: e.target.value }
              });
            }}
            className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={element.properties.color}
            onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              properties: { ...element.properties, color: e.target.value }
            })}
            className="flex-1 p-2 border border-gray-300 rounded-md"
            placeholder="#000000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Text Style</label>
        <div className="flex gap-2">
          <button
            onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              properties: { ...element.properties, bold: !element.properties.bold }
            })}
            className={`flex-1 py-2 px-3 rounded-md border text-sm font-medium ${element.properties.bold
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              properties: { ...element.properties, italic: !element.properties.italic }
            })}
            className={`flex-1 py-2 px-3 rounded-md border text-sm ${element.properties.italic
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            <em>I</em>
          </button>
          <button
            onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              properties: { ...element.properties, underline: !element.properties.underline }
            })}
            className={`flex-1 py-2 px-3 rounded-md border text-sm ${element.properties.underline
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            <u>U</u>
          </button>
          <button
            onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              properties: { ...element.properties, listStyle: element.properties.listStyle === 'bullet' ? 'none' : 'bullet' }
            })}
            className={`flex-1 py-2 px-3 rounded-md border text-sm ${element.properties.listStyle === 'bullet'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            • Bullets
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
        <div className="flex gap-1">
          <button
            onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              properties: { ...element.properties, textAlign: 'left' }
            })}
            className={`flex-1 py-2 px-3 rounded-md border text-sm ${element.properties.textAlign === 'left'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            ←
          </button>
          <button
            onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              properties: { ...element.properties, textAlign: 'center' }
            })}
            className={`flex-1 py-2 px-3 rounded-md border text-sm ${element.properties.textAlign === 'center'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            ↔
          </button>
          <button
            onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              properties: { ...element.properties, textAlign: 'right' }
            })}
            className={`flex-1 py-2 px-3 rounded-md border text-sm ${element.properties.textAlign === 'right'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            →
          </button>
          <button
            onClick={() => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
              properties: { ...element.properties, textAlign: 'justify' }
            })}
            className={`flex-1 py-2 px-3 rounded-md border text-sm ${element.properties.textAlign === 'justify'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            ⬌
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Line Height</label>
        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={element.properties.lineHeight || 1.2}
          onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
            properties: { ...element.properties, lineHeight: parseFloat(e.target.value) }
          })}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1.0</span>
          <span>{element.properties.lineHeight || 1.2}</span>
          <span>3.0</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Letter Spacing</label>
        <input
          type="range"
          min="-2"
          max="10"
          step="0.1"
          value={element.properties.letterSpacing || 0}
          onChange={(e) => updateElement(selectedElement.pageIndex, selectedElement.elementId, {
            properties: { ...element.properties, letterSpacing: parseFloat(e.target.value) }
          })}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>-2px</span>
          <span>{element.properties.letterSpacing || 0}px</span>
          <span>10px</span>
        </div>
      </div>
    </div>
  );
};

export default TextProperties;