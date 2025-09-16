import React, { useState } from 'react';
import ElementRenderer from './ElementRenderer';
import SelectionHandles from './SelectionHandles';
import AlignmentGuides from './AlignmentGuides';

const CanvasPage = ({
  page,
  pageIndex,
  currentEditingPage,
  selectedElement,
  canvasRefs,
  handleMouseDown,
  handleResizeMouseDown,
  isEditing,
  setIsEditing,
  updateElement,
  setSelectedElement,
  setCurrentEditingPage,
  project,
  draggedElement,
  zoom
}) => {
  const [hoveredElement, setHoveredElement] = useState(null);



  return (
    <div
      ref={el => canvasRefs.current[pageIndex] = el}
      className={`mx-auto mb-12 relative shadow-lg bg-white transition-all duration-200 ${currentEditingPage === pageIndex ? 'border-4 border-blue-500' : 'border-2 border-gray-300'
        }`}
      style={{
        width: `${page.pageSettings.width}px`,
        height: `${page.pageSettings.height}px`,
        backgroundColor: page.pageSettings.background.type === 'color'
          ? page.pageSettings.background.value
          : '#ffffff',
        backgroundImage: page.pageSettings.background.type === 'gradient'
          ? page.pageSettings.background.value
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) {
          setSelectedElement({ pageIndex: 0, elementId: null });
        }
        // Don't automatically switch pages on click - let grid view control this
        // setCurrentEditingPage(pageIndex);
      }}
      onMouseEnter={() => {
        // Don't automatically switch pages on mouse enter - let grid view control this
        // if (currentEditingPage !== pageIndex) {
        //   setCurrentEditingPage(pageIndex);
        // }
      }}
    >
      {/* SVG Background Layer */}
      {page.pageSettings.background.type === 'svg' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%', zIndex: 0 }}
          dangerouslySetInnerHTML={{ __html: page.pageSettings.background.value }}
        />
      )}

      {/* Alignment Guides */}
      {draggedElement && (
        <AlignmentGuides
          draggedElement={draggedElement}
          allElements={page.elements}
          pageWidth={page.pageSettings.width}
          pageHeight={page.pageSettings.height}
          zoom={zoom}
        />
      )}

      {/* Elements */}
      {page.elements.map((element) => {
        const isHovered = hoveredElement === element.id;
        const isSelected = selectedElement.pageIndex === pageIndex && selectedElement.elementId === element.id;

        return (
          <div
            key={element.id}
            className="element absolute cursor-move"
            style={{
              left: `${element.x}px`,
              top: `${element.y}px`,
              width: `${element.width}px`,
              height: `${element.height}px`,
              transform: `rotate(${element.rotation}deg)`,
              zIndex: isNaN(element.zIndex) ? 1 : element.zIndex,
              // Add hover highlighting
              outline: isHovered && !isSelected ? '2px solid #3b82f6' : 'none',
              outlineOffset: '2px',
              transition: 'outline 0.2s ease-in-out'
            }}
            onMouseDown={(e) => handleMouseDown(e, pageIndex, element.id)}
            onMouseEnter={() => setHoveredElement(element.id)}
            onMouseLeave={() => setHoveredElement(null)}
          >
            <ElementRenderer
              element={element}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              updateElement={updateElement}
              pageIndex={pageIndex}
              project={project}
            />

            {/* Selection handles */}
            {isSelected && (
              <SelectionHandles
                element={element}
                handleResizeMouseDown={handleResizeMouseDown}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CanvasPage;