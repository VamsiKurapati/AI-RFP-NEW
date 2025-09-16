import React from 'react';
import TextElement from './elements/TextElement';
import ImageElement from './elements/ImageElement';
import LazyImageElement from './elements/LazyImageElement';
import ShapeElement from './elements/ShapeElement';
import SVGElement from './elements/SVGElement';

const ElementRenderer = ({ element, isEditing, setIsEditing, updateElement, pageIndex, project }) => {
  switch (element.type) {
    case 'text':
      return (
        <TextElement
          element={element}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          updateElement={updateElement}
          pageIndex={pageIndex}
          project={project}
        />
      );
    case 'image':
      return <LazyImageElement element={element} />;
    case 'shape':
      return <ShapeElement element={element} />;
    case 'svg':
      return <SVGElement element={element} />;
    default:
      return null;
  }
};

export default ElementRenderer;