import React, { useEffect, useRef } from 'react';
import CanvasPage from './CanvasPage';

const Canvas = ({
  project,
  zoom,
  currentEditingPage,
  selectedElement,
  canvasRefs,
  scrollContainerRef,
  handleMouseDown,
  handleResizeMouseDown,
  isEditing,
  setIsEditing,
  updateElement,
  setSelectedElement,
  setCurrentEditingPage,
  draggedElement
}) => {
  const isProgrammaticScrollRef = useRef(false);

  // Function to determine which update function to use based on element type
  const getUpdateFunction = (elementType) => {
    // For text elements, we'll use the regular updateElement (which should be updateElementWithHistory)
    // The debouncing will be handled in the TextElement component itself
    return updateElement;
  };

  // Ensure proper scroll positioning
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Only reset scroll to top on initial load, not on zoom changes
    // This prevents interfering with page navigation
    scrollContainer.scrollTop = 0;
  }, [scrollContainerRef]);

  // Scroll to the current editing page when it changes
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || currentEditingPage === undefined) return;

    // Find the canvas element for the current editing page
    const currentPageElement = canvasRefs.current[currentEditingPage];
    if (currentPageElement) {
      // Calculate the position to scroll to (center the page)
      const containerHeight = scrollContainer.clientHeight;

      // Get the bounding rect of the page element in the scroll container's coordinate system
      const pageRect = currentPageElement.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();

      // Calculate the relative position of the page within the scroll container
      const relativePageTop = pageRect.top - containerRect.top + scrollContainer.scrollTop;
      const pageHeight = pageRect.height;

      // Scroll to center the page in the viewport
      const scrollTop = relativePageTop - (containerHeight / 2) + (pageHeight / 2);

      // Set flag to prevent scroll listener from interfering
      isProgrammaticScrollRef.current = true;

      // Smooth scroll to the page
      scrollContainer.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });

      // Reset flag after scroll animation completes
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 1000); // Wait for smooth scroll to complete
    }
  }, [currentEditingPage, canvasRefs, scrollContainerRef, setCurrentEditingPage, zoom]);

  // Update currentEditingPage based on scroll position
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      // Skip if this is a programmatic scroll (like from grid view navigation)
      if (isProgrammaticScrollRef.current) return;

      const scrollTop = scrollContainer.scrollTop;
      const containerHeight = scrollContainer.clientHeight;
      const containerCenter = scrollTop + (containerHeight / 2);

      // Find which page is most centered in the viewport
      let mostVisiblePage = 0;
      let minDistance = Infinity;

      project.pages.forEach((_, pageIndex) => {
        const pageElement = canvasRefs.current[pageIndex];
        if (pageElement) {
          // Use getBoundingClientRect to get accurate positions that account for zoom
          const pageRect = pageElement.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();

          // Calculate the relative position of the page within the scroll container
          const relativePageTop = pageRect.top - containerRect.top + scrollContainer.scrollTop;
          const pageHeight = pageRect.height;
          const pageCenter = relativePageTop + (pageHeight / 2);

          const distance = Math.abs(containerCenter - pageCenter);

          if (distance < minDistance) {
            minDistance = distance;
            mostVisiblePage = pageIndex;
          }
        }
      });

      // Update currentEditingPage if it's different
      if (mostVisiblePage !== currentEditingPage) {
        setCurrentEditingPage(mostVisiblePage);
      }
    };

    // Add scroll event listener
    scrollContainer.addEventListener('scroll', handleScroll);

    // Initial check
    handleScroll();

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [project.pages, canvasRefs, currentEditingPage, setCurrentEditingPage, scrollContainerRef, zoom]);

  return (
    <div ref={scrollContainerRef} className="h-full overflow-auto bg-gray-200 relative" style={{
      overscrollBehavior: 'contain',
      paddingTop: '0'
    }}>
      <div className="flex flex-col items-center w-full bg-gray-200" style={{
        minHeight: '100%'
      }}>
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s',
            width: 'fit-content',
            marginTop: '80px',
            marginBottom: '20px'
          }}
        >
          {project.pages.map((page, pageIndex) => (
            <CanvasPage
              key={page.id}
              page={page}
              pageIndex={pageIndex}
              currentEditingPage={currentEditingPage}
              selectedElement={selectedElement}
              canvasRefs={canvasRefs}
              handleMouseDown={handleMouseDown}
              handleResizeMouseDown={handleResizeMouseDown}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              updateElement={getUpdateFunction()}
              setSelectedElement={setSelectedElement}
              setCurrentEditingPage={setCurrentEditingPage}
              project={project}
              draggedElement={draggedElement}
              zoom={zoom}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Canvas;