import React from 'react';

const ImageElement = ({ element }) => {
  // Build transform string for flip effects
  const transforms = [];

  if (element.properties.flipHorizontal) {
    transforms.push('scaleX(-1)');
  }

  if (element.properties.flipVertical) {
    transforms.push('scaleY(-1)');
  }

  const transformStyle = transforms.length > 0 ? transforms.join(' ') : 'none';

  return (
    <img
      src={element.properties.src}
      alt=""
      className="w-full h-full"
      style={{
        objectFit: element.properties.fit === 'stretch' ? 'fill' :
          element.properties.fit === 'scale-down' ? 'scale-down' :
            element.properties.fit || 'contain',
        opacity: element.properties.opacity ?? 1,
        filter: `brightness(${element.properties.brightness ?? 1}) contrast(${element.properties.contrast ?? 1}) saturate(${element.properties.saturate ?? 1}) blur(${element.properties.blur ?? 0}px)`,
        borderRadius: (element.properties.borderRadius ?? 0) + 'px',
        transform: transformStyle
      }}
      draggable={false}
    />
  );
};

export default ImageElement;