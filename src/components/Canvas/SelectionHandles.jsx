import React from 'react';

const SelectionHandles = ({ element, handleResizeMouseDown }) => {
  return (
    <>
      <div className="selection-outline absolute inset-0 border-2 border-blue-500 pointer-events-none" />

      {/* Corner handles */}
      <div
        className="resize-handle absolute w-2 h-2 bg-blue-500 cursor-nw-resize"
        style={{ top: '-4px', left: '-4px' }}
        onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'nw')}
      />
      <div
        className="resize-handle absolute w-2 h-2 bg-blue-500 cursor-ne-resize"
        style={{ top: '-4px', right: '-4px' }}
        onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'ne')}
      />
      <div
        className="resize-handle absolute w-2 h-2 bg-blue-500 cursor-sw-resize"
        style={{ bottom: '-4px', left: '-4px' }}
        onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'sw')}
      />
      <div
        className="resize-handle absolute w-2 h-2 bg-blue-500 cursor-se-resize"
        style={{ bottom: '-4px', right: '-4px' }}
        onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'se')}
      />

      {/* Edge handles */}
      <div
        className="resize-handle absolute w-2 h-2 bg-blue-500 cursor-n-resize"
        style={{ top: '-4px', left: '50%', transform: 'translateX(-50%)' }}
        onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'n')}
      />
      <div
        className="resize-handle absolute w-2 h-2 bg-blue-500 cursor-s-resize"
        style={{ bottom: '-4px', left: '50%', transform: 'translateX(-50%)' }}
        onMouseDown={(e) => handleResizeMouseDown(e, element.id, 's')}
      />
      <div
        className="resize-handle absolute w-2 h-2 bg-blue-500 cursor-e-resize"
        style={{ right: '-4px', top: '50%', transform: 'translateY(-50%)' }}
        onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'e')}
      />
      <div
        className="resize-handle absolute w-2 h-2 bg-blue-500 cursor-w-resize"
        style={{ left: '-4px', top: '50%', transform: 'translateY(-50%)' }}
        onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'w')}
      />
    </>
  );
};

export default SelectionHandles;