import { useState, useCallback } from 'react';

export const useInteraction = (zoom, updateElement, project, setSelectedElement, setCurrentEditingPage, onInteractionEnd, setIsInInteraction, deleteElement, currentEditingPage) => {
  const [isEditing, setIsEditing] = useState(false);
  const [dragState, setDragState] = useState({
    isDragging: false,
    element: null,
    offset: { x: 0, y: 0 },
    lastX: 0,
    lastY: 0,
    initialX: 0,
    initialY: 0,
    shouldDelete: false
  });
  const [draggedElement, setDraggedElement] = useState(null);
  const [resizeState, setResizeState] = useState({
    isResizing: false,
    element: null,
    handle: null,
    pageIndex: null,
    startPos: { x: 0, y: 0 },
    original: { x: 0, y: 0, width: 0, height: 0 },
    lastWidth: 0,
    lastHeight: 0,
    initialWidth: 0,
    initialHeight: 0
  });
  const [hasInteractionStarted, setHasInteractionStarted] = useState(false);

  const handleMouseDown = useCallback((e, pageIndex, elementId, canvasRefs, setShowProperties) => {
    if (e.target.classList.contains('resize-handle')) return;

    // Do not start dragging when editing text or interacting with inputs/contenteditable
    if (isEditing) return;
    const interactiveTarget = e.target.closest('textarea, input, [contenteditable="true"]');
    if (interactiveTarget) return;

    const page = project.pages[pageIndex];
    const element = page.elements.find(el => el.id === elementId);
    const pageCanvas = canvasRefs.current[pageIndex];
    if (!pageCanvas) return;

    const canvasX = (e.clientX - pageCanvas.getBoundingClientRect().left) / zoom;
    const canvasY = (e.clientY - pageCanvas.getBoundingClientRect().top) / zoom;

    setDragState({
      isDragging: true,
      element: elementId,
      offset: {
        x: canvasX - element.x,
        y: canvasY - element.y
      },
      lastX: element.x,
      lastY: element.y,
      initialX: element.x,
      initialY: element.y,
      shouldDelete: false
    });

    // Set dragged element for alignment guides
    setDraggedElement({
      ...element,
      pageIndex
    });

    setSelectedElement({ pageIndex, elementId });
    setCurrentEditingPage(pageIndex);
    // Open properties panel when element is selected
    if (setShowProperties) setShowProperties(true);

    // Set interaction flag when dragging starts
    if (!hasInteractionStarted) {
      setHasInteractionStarted(true);
      if (setIsInInteraction) setIsInInteraction(true);
    }
  }, [zoom, project, setSelectedElement, setCurrentEditingPage, hasInteractionStarted, setIsInInteraction, isEditing]);

  const handleMouseMove = useCallback((e, canvasRefs, currentEditingPage) => {
    if (dragState.isDragging && canvasRefs.current[currentEditingPage]) {
      // Check if the element still exists before trying to update it
      const currentPage = project.pages[currentEditingPage];
      const element = currentPage?.elements.find(el => el.id === dragState.element);

      if (!element) {
        // Element was deleted, stop dragging
        setDragState({
          isDragging: false,
          element: null,
          offset: { x: 0, y: 0 },
          lastX: 0,
          lastY: 0,
          initialX: 0,
          initialY: 0
        });
        return;
      }

      const pageCanvas = canvasRefs.current[currentEditingPage];
      const rect = pageCanvas.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left) / zoom;
      const canvasY = (e.clientY - rect.top) / zoom;

      const newX = canvasX - dragState.offset.x;
      const newY = canvasY - dragState.offset.y;

      // Only update if the change is significant (more than 1 pixel)
      const deltaX = Math.abs(newX - dragState.lastX || 0);
      const deltaY = Math.abs(newY - dragState.lastY || 0);

      if (deltaX > 1 || deltaY > 1) {
        // Check if element is outside canvas before updating
        const currentPage = project.pages[currentEditingPage];
        if (!currentPage || !currentPage.pageSettings) {
          console.error('Page or pageSettings not found in useInteraction');
          return;
        }
        const element = currentPage.elements.find(el => el.id === dragState.element);

        if (element) {
          const isOutsideCanvas =
            newX + element.width < 0 ||
            newY + element.height < 0 ||
            newX > currentPage.pageSettings.width ||
            newY > currentPage.pageSettings.height;

          if (isOutsideCanvas) {
            // Mark element for deletion in handleMouseUp
            setDragState(prev => ({
              ...prev,
              lastX: newX,
              lastY: newY,
              shouldDelete: true
            }));
          } else {
            // Update element position normally
            updateElement(currentEditingPage, dragState.element, { x: newX, y: newY });

            // Update dragged element for alignment guides
            setDraggedElement(prev => prev ? {
              ...prev,
              x: newX,
              y: newY
            } : null);

            setDragState(prev => ({
              ...prev,
              lastX: newX,
              lastY: newY,
              shouldDelete: false
            }));
          }
        }
      }
    }

    if (resizeState.isResizing && canvasRefs.current[currentEditingPage]) {
      // Check if the element still exists before trying to update it
      const currentPage = project.pages[resizeState.pageIndex];
      if (!currentPage || !currentPage.pageSettings) {
        console.error('Page or pageSettings not found in useInteraction resize');
        return;
      }
      const element = currentPage.elements.find(el => el.id === resizeState.element);

      if (!element) {
        // Element was deleted, stop resizing
        setResizeState({
          isResizing: false,
          element: null,
          handle: null,
          pageIndex: null,
          startPos: { x: 0, y: 0 },
          original: { x: 0, y: 0, width: 0, height: 0 },
          lastWidth: 0,
          lastHeight: 0,
          initialWidth: 0,
          initialHeight: 0
        });
        return;
      }

      const pageCanvas = canvasRefs.current[currentEditingPage];
      const rect = pageCanvas.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left) / zoom;
      const canvasY = (e.clientY - rect.top) / zoom;

      const deltaX = canvasX - resizeState.startPos.x;
      const deltaY = canvasY - resizeState.startPos.y;

      let newWidth = resizeState.original.width;
      let newHeight = resizeState.original.height;
      let newX = resizeState.original.x;
      let newY = resizeState.original.y;

      switch (resizeState.handle) {
        case 'se':
          newWidth = Math.max(5, Math.min(currentPage.pageSettings.width, resizeState.original.width + deltaX));
          newHeight = Math.max(5, Math.min(currentPage.pageSettings.height, resizeState.original.height + deltaY));
          break;
        case 'sw':
          newWidth = Math.max(5, Math.min(currentPage.pageSettings.width, resizeState.original.width - deltaX));
          newHeight = Math.max(5, Math.min(currentPage.pageSettings.height, resizeState.original.height + deltaY));
          newX = resizeState.original.x + deltaX;
          break;
        case 'ne':
          newWidth = Math.max(5, Math.min(currentPage.pageSettings.width, resizeState.original.width + deltaX));
          newHeight = Math.max(5, Math.min(currentPage.pageSettings.height, resizeState.original.height - deltaY));
          newY = resizeState.original.y + deltaY;
          break;
        case 'nw':
          newWidth = Math.max(5, Math.min(currentPage.pageSettings.width, resizeState.original.width - deltaX));
          newHeight = Math.max(5, Math.min(currentPage.pageSettings.height, resizeState.original.height - deltaY));
          newX = resizeState.original.x + deltaX;
          newY = resizeState.original.y + deltaY;
          break;
        case 'n':
          newHeight = Math.max(5, Math.min(currentPage.pageSettings.height, resizeState.original.height - deltaY));
          newY = resizeState.original.y + deltaY;
          break;
        case 's':
          newHeight = Math.max(5, Math.min(currentPage.pageSettings.height, resizeState.original.height + deltaY));
          break;
        case 'e':
          newWidth = Math.max(5, Math.min(currentPage.pageSettings.width, resizeState.original.width + deltaX));
          break;
        case 'w':
          newWidth = Math.max(5, Math.min(currentPage.pageSettings.width, resizeState.original.width - deltaX));
          newX = resizeState.original.x + deltaX;
          break;
        default:
          break;
      }

      // Only update if the change is significant (more than 1 pixel)
      const sizeDeltaX = Math.abs(newWidth - (resizeState.lastWidth || resizeState.original.width));
      const sizeDeltaY = Math.abs(newHeight - (resizeState.lastHeight || resizeState.original.height));

      if (sizeDeltaX > 1 || sizeDeltaY > 1) {
        updateElement(resizeState.pageIndex, resizeState.element, {
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY
        });
        // Update last size
        setResizeState(prev => ({
          ...prev,
          lastWidth: newWidth,
          lastHeight: newHeight
        }));
      }
    }
  }, [dragState, resizeState, zoom, updateElement, project.pages]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      // Check if the movement was significant
      const deltaX = Math.abs(dragState.lastX - dragState.initialX);
      const deltaY = Math.abs(dragState.lastY - dragState.initialY);
      const POSITION_THRESHOLD = 5; // 5 pixels

      // Check if element should be deleted (marked during dragging)
      const shouldDelete = dragState.shouldDelete;

      setDragState({
        isDragging: false,
        element: null,
        offset: { x: 0, y: 0 },
        lastX: 0,
        lastY: 0,
        initialX: 0,
        initialY: 0,
        shouldDelete: false
      });

      // Clear dragged element for alignment guides
      setDraggedElement(null);

      // If element should be deleted, delete it with history
      if (shouldDelete && deleteElement) {
        deleteElement(currentEditingPage, dragState.element);
        if (onInteractionEnd && hasInteractionStarted) {
          setHasInteractionStarted(false);
          if (setIsInInteraction) setIsInInteraction(false);
          onInteractionEnd('Element Deleted', 'Deleted element moved outside canvas');
        }
        return;
      }

      // Only save history if movement was significant
      if (onInteractionEnd && hasInteractionStarted && (deltaX >= POSITION_THRESHOLD || deltaY >= POSITION_THRESHOLD)) {
        setHasInteractionStarted(false);
        if (setIsInInteraction) setIsInInteraction(false);
        onInteractionEnd('Element Moved', 'Moved element');
      } else if (hasInteractionStarted) {
        // Reset interaction state without saving history
        setHasInteractionStarted(false);
        if (setIsInInteraction) setIsInInteraction(false);
      }
    }
    if (resizeState.isResizing) {
      // Check if the resize was significant
      const deltaWidth = Math.abs(resizeState.lastWidth - resizeState.initialWidth);
      const deltaHeight = Math.abs(resizeState.lastHeight - resizeState.initialHeight);
      const SIZE_THRESHOLD = 3; // 3 pixels

      setResizeState({
        isResizing: false,
        element: null,
        handle: null,
        pageIndex: null,
        startPos: { x: 0, y: 0 },
        original: { x: 0, y: 0, width: 0, height: 0 },
        lastWidth: 0,
        lastHeight: 0,
        initialWidth: 0,
        initialHeight: 0
      });

      // Only save history if resize was significant
      if (onInteractionEnd && hasInteractionStarted && (deltaWidth >= SIZE_THRESHOLD || deltaHeight >= SIZE_THRESHOLD)) {
        setHasInteractionStarted(false);
        if (setIsInInteraction) setIsInInteraction(false);
        onInteractionEnd('Element Resized', 'Resized element');
      } else if (hasInteractionStarted) {
        // Reset interaction state without saving history
        setHasInteractionStarted(false);
        if (setIsInInteraction) setIsInInteraction(false);
      }
    }
  }, [dragState.isDragging, dragState.lastX, dragState.lastY, dragState.initialX, dragState.initialY, dragState.element, dragState.shouldDelete, resizeState.isResizing, resizeState.lastWidth, resizeState.lastHeight, resizeState.initialWidth, resizeState.initialHeight, onInteractionEnd, hasInteractionStarted, setIsInInteraction, currentEditingPage, deleteElement]);

  const handleResizeMouseDown = useCallback((e, elementId, handle, selectedElement, canvasRefs) => {
    e.stopPropagation();
    const pageIndex = selectedElement.pageIndex;
    const pageCanvas = canvasRefs.current[pageIndex];
    if (!pageCanvas) return;

    const rect = pageCanvas.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left) / zoom;
    const canvasY = (e.clientY - rect.top) / zoom;
    const page = project.pages[pageIndex];
    const element = page.elements.find(el => el.id === elementId);

    setResizeState({
      isResizing: true,
      element: elementId,
      handle: handle,
      pageIndex: pageIndex,
      startPos: { x: canvasX, y: canvasY },
      original: {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height
      },
      lastWidth: element.width,
      lastHeight: element.height,
      initialWidth: element.width,
      initialHeight: element.height
    });

    // Set interaction flag when resizing starts
    if (!hasInteractionStarted) {
      setHasInteractionStarted(true);
      if (setIsInInteraction) setIsInInteraction(true);
    }
  }, [zoom, project, hasInteractionStarted, setIsInInteraction]);

  return {
    isEditing,
    setIsEditing,
    dragState,
    resizeState,
    draggedElement,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleResizeMouseDown
  };
};