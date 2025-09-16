import React from 'react';

const SVGElement = ({ element }) => {
  if (!element.properties?.svgContent) return null;

  return (
    <div
      className="w-full h-full"
      dangerouslySetInnerHTML={{ __html: element.properties.svgContent }}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default SVGElement;