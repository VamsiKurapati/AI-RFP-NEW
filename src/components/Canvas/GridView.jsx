import React, { useEffect, useState, useRef } from 'react';
import GridElementRenderer from './GridElementRenderer';

const GridView = ({
  project,
  zoom,
  scrollContainerRef,
  onPageClick,
  currentEditingPage,
  onReorderPages
}) => {
  // Calculate grid layout based on screen size
  const [itemsPerRow, setItemsPerRow] = React.useState(3);

  // Drag and drop state
  const [draggedPageIndex, setDraggedPageIndex] = useState(null);
  const [dragOverPageIndex, setDragOverPageIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);

  // Ensure proper scroll positioning
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Ensure scroll starts at the top
    scrollContainer.scrollTop = 0;
  }, [scrollContainerRef]);

  React.useEffect(() => {
    const updateGridLayout = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setItemsPerRow(1);
      } else if (width < 1024) {
        setItemsPerRow(2);
      } else if (width < 1440) {
        setItemsPerRow(3);
      } else {
        setItemsPerRow(4);
      }
    };

    updateGridLayout();
    window.addEventListener('resize', updateGridLayout);
    return () => window.removeEventListener('resize', updateGridLayout);
  }, []);

  // Handle drag start
  const handleDragStart = (e, pageIndex) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', pageIndex);
    setDraggedPageIndex(pageIndex);
    setIsDragging(true);

    // Create a custom drag image
    if (dragRef.current) {
      e.dataTransfer.setDragImage(dragRef.current, 0, 0);
    }
  };

  // Handle drag over
  const handleDragOver = (e, pageIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Only update if we're hovering over a different page
    if (dragOverPageIndex !== pageIndex) {
      setDragOverPageIndex(pageIndex);
    }
  };

  // Handle drag leave
  const handleDragLeave = (e) => {
    // Only clear if we're leaving the page element entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverPageIndex(null);
    }
  };

  // Handle drop
  const handleDrop = (e, targetPageIndex) => {
    e.preventDefault();

    if (draggedPageIndex !== null && draggedPageIndex !== targetPageIndex) {
      onReorderPages(draggedPageIndex, targetPageIndex);
    }

    // Reset drag state
    setDraggedPageIndex(null);
    setDragOverPageIndex(null);
    setIsDragging(false);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedPageIndex(null);
    setDragOverPageIndex(null);
    setIsDragging(false);
  };

  // Handle keyboard navigation for reordering
  const handleKeyDown = (e, pageIndex) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Start drag mode for keyboard users
      setDraggedPageIndex(pageIndex);
      setIsDragging(true);
    }
  };

  // Handle keyboard reordering
  const handleKeyboardReorder = (fromIndex, direction) => {
    const newIndex = fromIndex + direction;
    if (newIndex >= 0 && newIndex < project.pages.length) {
      onReorderPages(fromIndex, newIndex);
    }
  };

  // Calculate drop zone position for visual feedback
  const getDropZoneStyle = (pageIndex) => {
    if (dragOverPageIndex === pageIndex && draggedPageIndex !== pageIndex) {
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        border: '2px dashed #3b82f6',
        borderRadius: '8px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointerEvents: 'none',
        zIndex: 10
      };
    }
    return null;
  };

  const gridGap = 12;

  return (
    <div ref={scrollContainerRef} className="h-full overflow-auto bg-gray-200 relative" style={{ overscrollBehavior: 'contain' }}>
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="mb-4 flex-shrink-0 p-4">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-gray-800">Grid View</h2>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              Read Only
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">View all pages in a grid layout. Click the grid icon to return to edit mode.</p>
          <p className="text-xs text-gray-500 mb-2">Showing {project.pages.length} page{project.pages.length !== 1 ? 's' : ''}</p>
          <p className="text-xs text-blue-600">
            💡 Drag pages to rearrange their order
            {isDragging && draggedPageIndex !== null && (
              <span className="ml-2 text-orange-600 font-medium">
                Moving Page {draggedPageIndex + 1}...
              </span>
            )}
          </p>
        </div>

        <div
          className="grid flex-1 px-4 pb-4"
          style={{
            gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`,
            gap: `${gridGap}px`,
            alignContent: project.pages.length <= itemsPerRow ? 'center' : 'start',
            justifyContent: project.pages.length <= itemsPerRow ? 'center' : 'start',
            minHeight: 'fit-content'
          }}
        >
          {project.pages.map((page, pageIndex) => (
            <div
              key={page.id}
              className={`rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-200 ${currentEditingPage === pageIndex
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-white'
                } ${draggedPageIndex === pageIndex ? 'opacity-50 scale-95 shadow-2xl' : ''
                } ${dragOverPageIndex === pageIndex && draggedPageIndex !== pageIndex
                  ? 'ring-2 ring-blue-400 ring-opacity-50'
                  : ''
                }`}
              style={{
                transition: 'all 0.2s ease',
                width: 'fit-content',
                maxWidth: '100%',
                transform: draggedPageIndex === pageIndex ? 'scale(0.95) rotate(2deg)' : 'scale(1) rotate(0deg)',
                zIndex: draggedPageIndex === pageIndex ? 20 : 1
              }}
              onClick={() => onPageClick(pageIndex)}
              title={`Click to edit Page ${pageIndex + 1}`}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, pageIndex)}
              onDragOver={(e) => handleDragOver(e, pageIndex)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, pageIndex)}
              onDragEnd={handleDragEnd}
              onKeyDown={(e) => handleKeyDown(e, pageIndex)}
            >
              {/* Page Header */}
              <div className={`px-2 py-1 border-b border-gray-200 ${currentEditingPage === pageIndex ? 'bg-blue-100' : 'bg-gray-50'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-medium ${currentEditingPage === pageIndex ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                      Page {pageIndex + 1}
                    </span>
                    {currentEditingPage === pageIndex && (
                      <span className="text-xs text-blue-600 font-bold">(Current)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">
                      {Math.round(page.pageSettings.width * 0.3)} × {Math.round(page.pageSettings.height * 0.3)}
                    </span>
                    {/* Drag handle */}
                    <div
                      className="w-4 h-4 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex items-center justify-center"
                      title="Drag to reorder (or use arrow keys)"
                      onMouseDown={(e) => e.stopPropagation()}
                      tabIndex={0}
                      role="button"
                      aria-label={`Reorder page ${pageIndex + 1}`}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'ArrowLeft') {
                          handleKeyboardReorder(pageIndex, -1);
                        } else if (e.key === 'ArrowRight') {
                          handleKeyboardReorder(pageIndex, 1);
                        }
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page Content */}
              <div
                className="relative bg-white overflow-hidden"
                style={{
                  width: `${page.pageSettings.width * 0.3}px`,
                  height: `${page.pageSettings.height * 0.3}px`,
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
                }}
              >
                {/* Drop Zone Indicator */}
                {getDropZoneStyle(pageIndex) && (
                  <div style={getDropZoneStyle(pageIndex)} />
                )}
                {/* SVG Background Layer */}
                {page.pageSettings.background.type === 'svg' && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: '100%', height: '100%', zIndex: 0 }}
                    dangerouslySetInnerHTML={{ __html: page.pageSettings.background.value }}
                  />
                )}

                {/* Elements - Read Only */}
                {page.elements.map((element) => {
                  // Create a scaled version of the element for grid view
                  const scaledElement = {
                    ...element,
                    x: element.x * 0.3,
                    y: element.y * 0.3,
                    width: element.width * 0.3,
                    height: element.height * 0.3
                  };

                  return (
                    <div
                      key={element.id}
                      className="absolute pointer-events-none"
                      style={{
                        left: `${scaledElement.x}px`,
                        top: `${scaledElement.y}px`,
                        width: `${scaledElement.width}px`,
                        height: `${scaledElement.height}px`,
                        transform: `rotate(${element.rotation}deg)`,
                        zIndex: isNaN(element.zIndex) ? 1 : element.zIndex
                      }}
                    >
                      <GridElementRenderer
                        element={scaledElement}
                        pageIndex={pageIndex}
                        project={project}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Hidden drag reference element */}
        <div
          ref={dragRef}
          className="hidden"
          style={{
            width: '100px',
            height: '100px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '2px dashed #3b82f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3b82f6',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          Moving Page
        </div>
      </div>
    </div>
  );
};

export default GridView; 