import React, { useState, useEffect, useRef } from 'react';
import cloudImageService from '../../../utils/cloudImageService';

const LazyImageElement = ({ element, onLoad, onError }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Load image when visible
  useEffect(() => {
    if (!isVisible) return;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        const src = element.properties.src;
        let finalSrc = src;

        // Handle cloud images (uploaded images)
        if (cloudImageService.isCloudImage(src)) {
          finalSrc = cloudImageService.getCloudUrl(src);
        }
        // Handle template images
        else if (cloudImageService.isTemplateImage(src)) {
          finalSrc = cloudImageService.getTemplateUrl(src);
        }

        setImageSrc(finalSrc);
        setIsLoading(false);

        if (onLoad) {
          onLoad();
        }
      } catch (error) {
        // console.error('Error loading image:', error);
        setHasError(true);
        setIsLoading(false);

        if (onError) {
          onError(error);
        }
      }
    };

    loadImage();
  }, [isVisible, element.properties.src, onLoad, onError]);

  // Build transform string for flip effects
  const transforms = [];

  if (element.properties.flipHorizontal) {
    transforms.push('scaleX(-1)');
  }

  if (element.properties.flipVertical) {
    transforms.push('scaleY(-1)');
  }

  const transformStyle = transforms.length > 0 ? transforms.join(' ') : 'none';

  // Loading placeholder
  if (isLoading) {
    return (
      <div
        ref={imgRef}
        className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center"
        style={{
          borderRadius: (element.properties.borderRadius ?? 0) + 'px',
          transform: transformStyle
        }}
      >
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  // Error placeholder
  if (hasError) {
    return (
      <div
        ref={imgRef}
        className="w-full h-full bg-red-100 flex items-center justify-center"
        style={{
          borderRadius: (element.properties.borderRadius ?? 0) + 'px',
          transform: transformStyle
        }}
      >
        <div className="text-center">
          <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-xs text-red-500">Failed to load</p>
        </div>
      </div>
    );
  }

  // Image
  return (
    <img
      ref={imgRef}
      src={imageSrc}
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
      onLoad={() => {
        setIsLoading(false);
        if (onLoad) onLoad();
      }}
      onError={(e) => {
        setHasError(true);
        setIsLoading(false);
        if (onError) onError(e);
      }}
    />
  );
};

export default LazyImageElement; 