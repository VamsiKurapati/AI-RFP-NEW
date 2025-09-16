import React from 'react';

const AlignmentGuides = ({
  draggedElement,
  allElements,
  pageWidth,
  pageHeight,
  snapThreshold = 15,
  zoom = 1
}) => {
  if (!draggedElement) return null;

  const guides = [];
  const draggedBounds = {
    left: draggedElement.x,
    right: draggedElement.x + draggedElement.width,
    top: draggedElement.y,
    bottom: draggedElement.y + draggedElement.height,
    centerX: draggedElement.x + draggedElement.width / 2,
    centerY: draggedElement.y + draggedElement.height / 2
  };

  // Check alignment with other elements
  allElements.forEach(element => {
    if (element.id === draggedElement.id) return;

    const elementBounds = {
      left: element.x,
      right: element.x + element.width,
      top: element.y,
      bottom: element.y + element.height,
      centerX: element.x + element.width / 2,
      centerY: element.y + element.height / 2
    };

    // Vertical alignment guides (left, center, right)
    if (Math.abs(draggedBounds.left - elementBounds.left) < snapThreshold) {
      guides.push({
        type: 'vertical',
        x: elementBounds.left,
        y1: 0,
        y2: pageHeight,
        color: '#3b82f6'
      });
    }

    if (Math.abs(draggedBounds.centerX - elementBounds.centerX) < snapThreshold) {
      guides.push({
        type: 'vertical',
        x: elementBounds.centerX,
        y1: 0,
        y2: pageHeight,
        color: '#10b981'
      });
    }

    if (Math.abs(draggedBounds.right - elementBounds.right) < snapThreshold) {
      guides.push({
        type: 'vertical',
        x: elementBounds.right,
        y1: 0,
        y2: pageHeight,
        color: '#3b82f6'
      });
    }

    // Horizontal alignment guides (top, center, bottom)
    if (Math.abs(draggedBounds.top - elementBounds.top) < snapThreshold) {
      guides.push({
        type: 'horizontal',
        y: elementBounds.top,
        x1: 0,
        x2: pageWidth,
        color: '#3b82f6'
      });
    }

    if (Math.abs(draggedBounds.centerY - elementBounds.centerY) < snapThreshold) {
      guides.push({
        type: 'horizontal',
        y: elementBounds.centerY,
        x1: 0,
        x2: pageWidth,
        color: '#10b981'
      });
    }

    if (Math.abs(draggedBounds.bottom - elementBounds.bottom) < snapThreshold) {
      guides.push({
        type: 'horizontal',
        y: elementBounds.bottom,
        x1: 0,
        x2: pageWidth,
        color: '#3b82f6'
      });
    }
  });

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1000 }}
      width={pageWidth * zoom}
      height={pageHeight * zoom}
      viewBox={`0 0 ${pageWidth} ${pageHeight}`}
    >

      {guides.map((guide, index) => (
        <line
          key={index}
          x1={guide.type === 'vertical' ? guide.x : guide.x1}
          y1={guide.type === 'vertical' ? guide.y1 : guide.y}
          x2={guide.type === 'vertical' ? guide.x : guide.x2}
          y2={guide.type === 'vertical' ? guide.y2 : guide.y}
          stroke={guide.color}
          strokeWidth="1"
          strokeDasharray="5,5"
          opacity="0.8"
        />
      ))}
    </svg>
  );
};

export default AlignmentGuides; 