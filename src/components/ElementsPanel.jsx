import React from 'react';

const ElementsPanel = ({ show, onClose, addTextElement, imageInputRef, addShapeElement }) => {
  if (!show) return null;
  return (
    <div className="fixed left-[70px] top-16 w-80 bg-white border-r border-gray-200 shadow-lg overflow-y-auto z-20 sidebar-panel mb-16 max-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Elements Logo */}
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Elements</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {/* Elements Info */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Elements Library</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Shapes
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Add shapes to your design
          </p>
        </div>

        <div className="space-y-4">
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Add Elements</label>
            <div className="space-y-3">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="w-full px-4 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Add Image
              </button>
            </div>
          </div> */}

          {/* Shapes Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Shapes</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => addShapeElement('rectangle')}
                className="flex flex-col items-center justify-center px-2 py-3 bg-purple-100 hover:bg-purple-200 rounded border border-purple-300 text-purple-800"
              >
                <svg width="28" height="28"><rect x="4" y="8" width="20" height="12" fill="#a78bfa" stroke="#7c3aed" strokeWidth="2" rx="2" /></svg>
                <span className="text-xs mt-1">Rectangle</span>
              </button>
              <button
                onClick={() => addShapeElement('ellipse')}
                className="flex flex-col items-center justify-center px-2 py-3 bg-blue-100 hover:bg-blue-200 rounded border border-blue-300 text-blue-800"
              >
                <svg width="28" height="28"><ellipse cx="14" cy="14" rx="10" ry="7" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" /></svg>
                <span className="text-xs mt-1">Ellipse</span>
              </button>
              <button
                onClick={() => addShapeElement('line')}
                className="flex flex-col items-center justify-center px-2 py-3 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-gray-800"
              >
                <svg width="28" height="28"><line x1="5" y1="23" x2="23" y2="5" stroke="#6b7280" strokeWidth="2.5" /></svg>
                <span className="text-xs mt-1">Line</span>
              </button>
              <button
                onClick={() => addShapeElement('triangle')}
                className="flex flex-col items-center justify-center px-2 py-3 bg-yellow-100 hover:bg-yellow-200 rounded border border-yellow-300 text-yellow-800"
              >
                <svg width="28" height="28"><polygon points="14,5 25,23 3,23" fill="#fde68a" stroke="#f59e42" strokeWidth="2" /></svg>
                <span className="text-xs mt-1">Triangle</span>
              </button>
              <button
                onClick={() => addShapeElement('hexagon')}
                className="flex flex-col items-center justify-center px-2 py-3 bg-green-100 hover:bg-green-200 rounded border border-green-300 text-green-800"
              >
                <svg width="28" height="28"><polygon points="7,7 21,7 27,14 21,21 7,21 1,14" fill="#6ee7b7" stroke="#059669" strokeWidth="2" /></svg>
                <span className="text-xs mt-1">Hexagon</span>
              </button>
              <button
                onClick={() => addShapeElement('star')}
                className="flex flex-col items-center justify-center px-2 py-3 bg-yellow-100 hover:bg-yellow-200 rounded border border-yellow-300 text-yellow-800"
              >
                <svg width="28" height="28"><polygon points="14,3 17,11 26,11 18.5,16.5 21,25 14,20 7,25 9.5,16.5 2,11 11,11" fill="#fde68a" stroke="#f59e42" strokeWidth="2" /></svg>
                <span className="text-xs mt-1">Star</span>
              </button>
              <button
                onClick={() => addShapeElement('arrow')}
                className="flex flex-col items-center justify-center px-2 py-3 bg-blue-100 hover:bg-blue-200 rounded border border-blue-300 text-blue-800"
              >
                <svg width="28" height="28"><line x1="4" y1="14" x2="24" y2="14" stroke="#2563eb" strokeWidth="2" /><polygon points="18,8 24,14 18,20" fill="#2563eb" /></svg>
                <span className="text-xs mt-1">Arrow</span>
              </button>
              <button
                onClick={() => addShapeElement('diamond')}
                className="flex flex-col items-center justify-center px-2 py-3 bg-indigo-100 hover:bg-indigo-200 rounded border border-indigo-300 text-indigo-800"
              >
                <svg width="28" height="28"><polygon points="14,3 25,14 14,25 3,14" fill="#a5b4fc" stroke="#6366f1" strokeWidth="2" /></svg>
                <span className="text-xs mt-1">Diamond</span>
              </button>
              <button
                onClick={() => addShapeElement('parallelogram')}
                className="flex flex-col items-center justify-center px-2 py-3 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-gray-800"
              >
                <svg width="28" height="28"><polygon points="7,7 25,7 21,21 3,21" fill="#d1d5db" stroke="#6b7280" strokeWidth="2" /></svg>
                <span className="text-xs mt-1">Parallelogram</span>
              </button>
              <button onClick={() => addShapeElement('rightArrow')} className="flex flex-col items-center justify-center px-2 py-3 bg-blue-100 hover:bg-blue-200 rounded border border-blue-300 text-blue-800"><svg width="28" height="28"><polygon points="6,8 18,8 18,4 26,14 18,24 18,20 6,20" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" /></svg><span className="text-xs mt-1">Right Arrow</span></button>
              <button onClick={() => addShapeElement('leftArrow')} className="flex flex-col items-center justify-center px-2 py-3 bg-blue-100 hover:bg-blue-200 rounded border border-blue-300 text-blue-800"><svg width="28" height="28"><polygon points="22,8 10,8 10,4 2,14 10,24 10,20 22,20" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" /></svg><span className="text-xs mt-1">Left Arrow</span></button>
              <button onClick={() => addShapeElement('upArrow')} className="flex flex-col items-center justify-center px-2 py-3 bg-blue-100 hover:bg-blue-200 rounded border border-blue-300 text-blue-800"><svg width="28" height="28"><polygon points="8,22 8,10 4,10 14,2 24,10 20,10 20,22" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" /></svg><span className="text-xs mt-1">Up Arrow</span></button>
              <button onClick={() => addShapeElement('downArrow')} className="flex flex-col items-center justify-center px-2 py-3 bg-blue-100 hover:bg-blue-200 rounded border border-blue-300 text-blue-800"><svg width="28" height="28"><polygon points="8,6 8,18 4,18 14,26 24,18 20,18 20,6" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" /></svg><span className="text-xs mt-1">Down Arrow</span></button>
              <button onClick={() => addShapeElement('heart')} className="flex flex-col items-center justify-center px-2 py-3 bg-pink-100 hover:bg-pink-200 rounded border border-pink-300 text-pink-800"><svg width="28" height="28"><path d="M14 24s-8-6.5-8-12A6 6 0 0114 6a6 6 0 018 6c0 5.5-8 12-8 12z" fill="#f9a8d4" stroke="#be185d" strokeWidth="2" /></svg><span className="text-xs mt-1">Heart</span></button>
              <button onClick={() => addShapeElement('cloud')} className="flex flex-col items-center justify-center px-2 py-3 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-gray-800"><svg width="28" height="28"><ellipse cx="14" cy="18" rx="10" ry="6" fill="#d1d5db" /><ellipse cx="9" cy="15" rx="5" ry="4" fill="#d1d5db" /><ellipse cx="19" cy="15" rx="5" ry="4" fill="#d1d5db" /><ellipse cx="14" cy="15" rx="7" ry="5" fill="#e5e7eb" /></svg><span className="text-xs mt-1">Cloud</span></button>
              <button onClick={() => addShapeElement('speechBubble')} className="flex flex-col items-center justify-center px-2 py-3 bg-yellow-100 hover:bg-yellow-200 rounded border border-yellow-300 text-yellow-800"><svg width="28" height="28"><ellipse cx="14" cy="13" rx="10" ry="7" fill="#fde68a" stroke="#f59e42" strokeWidth="2" /><polygon points="10,20 14,17 18,20" fill="#fde68a" stroke="#f59e42" strokeWidth="2" /></svg><span className="text-xs mt-1">Speech Bubble</span></button>
              <button onClick={() => addShapeElement('cross')} className="flex flex-col items-center justify-center px-2 py-3 bg-red-100 hover:bg-red-200 rounded border border-red-300 text-red-800"><svg width="28" height="28"><line x1="6" y1="6" x2="22" y2="22" stroke="#ef4444" strokeWidth="3" /><line x1="22" y1="6" x2="6" y2="22" stroke="#ef4444" strokeWidth="3" /></svg><span className="text-xs mt-1">Cross</span></button>
              <button onClick={() => addShapeElement('checkmark')} className="flex flex-col items-center justify-center px-2 py-3 bg-green-100 hover:bg-green-200 rounded border border-green-300 text-green-800"><svg width="28" height="28"><polyline points="6,15 12,22 22,6" fill="none" stroke="#059669" strokeWidth="3" /></svg><span className="text-xs mt-1">Checkmark</span></button>
              <button onClick={() => addShapeElement('crescent')} className="flex flex-col items-center justify-center px-2 py-3 bg-yellow-100 hover:bg-yellow-200 rounded border border-yellow-300 text-yellow-800"><svg width="28" height="28"><path d="M20 14a8 8 0 01-8 8 8 8 0 010-16 6 6 0 008 8z" fill="#fde68a" stroke="#f59e42" strokeWidth="2" /></svg><span className="text-xs mt-1">Crescent</span></button>
              <button
                onClick={() => addShapeElement('pentagon')}
                className="flex flex-col items-center justify-center px-2 py-3 bg-pink-100 hover:bg-pink-200 rounded border border-pink-300 text-pink-800"
              >
                <svg width="28" height="28"><polygon points="14,4 25,12 21,24 7,24 3,12" fill="#f9a8d4" stroke="#be185d" strokeWidth="2" /></svg>
                <span className="text-xs mt-1">Pentagon</span>
              </button>
              <button onClick={() => addShapeElement('octagon')} className="flex flex-col items-center justify-center px-2 py-3 bg-indigo-100 hover:bg-indigo-200 rounded border border-indigo-300 text-indigo-800"><svg width="28" height="28"><polygon points="9,2 19,2 26,9 26,19 19,26 9,26 2,19 2,9" fill="#a5b4fc" stroke="#6366f1" strokeWidth="2" /></svg><span className="text-xs mt-1">Octagon</span></button>
              <button onClick={() => addShapeElement('trapezoid')} className="flex flex-col items-center justify-center px-2 py-3 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-gray-800"><svg width="28" height="28"><polygon points="6,22 22,22 26,6 2,6" fill="#d1d5db" stroke="#6b7280" strokeWidth="2" /></svg><span className="text-xs mt-1">Trapezoid</span></button>
              <button onClick={() => addShapeElement('chevron')} className="flex flex-col items-center justify-center px-2 py-3 bg-blue-100 hover:bg-blue-200 rounded border border-blue-300 text-blue-800"><svg width="28" height="28"><polygon points="0,0 22,0 28,14 22,28 0,28 6,14" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2" /></svg><span className="text-xs mt-1">Chevron</span></button>
              <button onClick={() => addShapeElement('bookmark')} className="flex flex-col items-center justify-center px-2 py-3 bg-pink-100 hover:bg-pink-200 rounded border border-pink-300 text-pink-800"><svg width="28" height="28"><rect x="7" y="4" width="14" height="20" fill="#f9a8d4" stroke="#be185d" strokeWidth="2" /><polygon points="7,24 14,18 21,24" fill="#be185d" /></svg><span className="text-xs mt-1">Bookmark</span></button>
              <button onClick={() => addShapeElement('lightning')} className="flex flex-col items-center justify-center px-2 py-3 bg-yellow-100 hover:bg-yellow-200 rounded border border-yellow-300 text-yellow-800"><svg width="28" height="28"><polygon points="12,2 24,12 16,12 18,26 4,14 12,14" fill="#fde68a" stroke="#f59e42" strokeWidth="2" /></svg><span className="text-xs mt-1">Lightning</span></button>
              <button onClick={() => addShapeElement('sun')} className="flex flex-col items-center justify-center px-2 py-3 bg-yellow-100 hover:bg-yellow-200 rounded border border-yellow-300 text-yellow-800"><svg width="28" height="28"><circle cx="14" cy="14" r="7" fill="#fde68a" stroke="#f59e42" strokeWidth="2" /><g stroke="#f59e42" strokeWidth="2"><line x1="14" y1="2" x2="14" y2="7" /><line x1="14" y1="21" x2="14" y2="26" /><line x1="2" y1="14" x2="7" y2="14" /><line x1="21" y1="14" x2="26" y2="14" /><line x1="5" y1="5" x2="9" y2="9" /><line x1="19" y1="19" x2="23" y2="23" /><line x1="5" y1="23" x2="9" y2="19" /><line x1="19" y1="9" x2="23" y2="5" /></g></svg><span className="text-xs mt-1">Sun</span></button>
              <button onClick={() => addShapeElement('plus')} className="flex flex-col items-center justify-center px-2 py-3 bg-green-100 hover:bg-green-200 rounded border border-green-300 text-green-800"><svg width="28" height="28"><line x1="14" y1="5" x2="14" y2="23" stroke="#059669" strokeWidth="3" /><line x1="5" y1="14" x2="23" y2="14" stroke="#059669" strokeWidth="3" /></svg><span className="text-xs mt-1">Plus</span></button>
              <button onClick={() => addShapeElement('minus')} className="flex flex-col items-center justify-center px-2 py-3 bg-red-100 hover:bg-red-200 rounded border border-red-300 text-red-800"><svg width="28" height="28"><line x1="5" y1="14" x2="23" y2="14" stroke="#ef4444" strokeWidth="3" /></svg><span className="text-xs mt-1">Minus</span></button>
              <button onClick={() => addShapeElement('exclamation')} className="flex flex-col items-center justify-center px-2 py-3 bg-yellow-100 hover:bg-yellow-200 rounded border border-yellow-300 text-yellow-800"><svg width="28" height="28"><line x1="14" y1="5" x2="14" y2="19" stroke="#f59e42" strokeWidth="3" /><circle cx="14" cy="23" r="2" fill="#f59e42" /></svg><span className="text-xs mt-1">Exclamation</span></button>
            </div>
          </div>

          <div className="h-24"></div> {/* Add bottom spacing */}
        </div>
      </div>
    </div>
  );
};

export default ElementsPanel; 