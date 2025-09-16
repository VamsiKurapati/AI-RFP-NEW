// Export-related utility functions
import { optimizeSVG, getOptimizationStats } from './svg.js';
import cloudImageService from './cloudImageService.js';
import handlePDFGeneration from '../components/Generate_PDF.jsx';
import Swal from 'sweetalert2';

export function exportToJSON(project) {
  // Process images for export (handle cloud URLs)
  const processedProject = {
    ...project,
    pages: project.pages.map(page => ({
      ...page,
      elements: page.elements.map(element => cloudImageService.processImageForExport(element))
    })),
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      appName: 'Canva App'
    }
  };

  const dataStr = JSON.stringify(processedProject, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const exportFileDefaultName = `canva-project-${timestamp}.json`;
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

export function importFromJSON(event, setProject, setSelectedElement, clearHistory) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        let migratedProject = imported;
        if (imported.pageSettings && imported.elements) {
          migratedProject = {
            pages: [{
              id: 1,
              pageSettings: imported.pageSettings,
              elements: imported.elements
            }],
            currentPage: 0
          };
        }
        migratedProject.pages = migratedProject.pages.map(page => ({
          ...page,
          elements: page.elements.map(element => {
            if (element.type === 'text') {
              return {
                ...element,
                properties: {
                  text: element.properties?.text || 'Click to edit text',
                  fontSize: element.properties?.fontSize || 16,
                  fontFamily: element.properties?.fontFamily || 'Arial',
                  color: element.properties?.color || '#000000',
                  bold: element.properties?.bold || false,
                  italic: element.properties?.italic || false,
                  underline: element.properties?.underline || false,
                  textAlign: element.properties?.textAlign || 'left',
                  listStyle: element.properties?.listStyle || 'none',
                  lineHeight: element.properties?.lineHeight || 1.2,
                  letterSpacing: element.properties?.letterSpacing || 0
                }
              };
            } else if (element.type === 'image') {
              // Process image elements for import (handle cloud URLs)
              return cloudImageService.processImageForImport(element);
            } else if (element.type === 'shape') {
              // Ensure shape elements have all required properties
              return {
                ...element,
                shapeType: element.shapeType || 'rectangle',
                properties: {
                  fill: element.properties?.fill || '#f3f4f6',
                  stroke: element.properties?.stroke || '#111827',
                  strokeWidth: element.properties?.strokeWidth || 2,
                  opacity: element.properties?.opacity || 1,
                  rx: element.properties?.rx || 0,
                  strokeDasharray: element.properties?.strokeDasharray || 'none',
                  shadow: element.properties?.shadow || false,
                  shadowBlur: element.properties?.shadowBlur || 0,
                  shadowColor: element.properties?.shadowColor || '#000',
                  ...element.properties
                }
              };
            }
            return element;
          })
        }));

        // Extract images from JSON and add to uploads panel
        cloudImageService.extractImagesFromJSON(migratedProject);

        // Add flag to indicate this is a newly imported project
        migratedProject._isNewlyImported = true;

        // Clear history first if clearHistory function is provided
        if (clearHistory && typeof clearHistory === 'function') {
          clearHistory();
        }

        setProject(migratedProject);
        setSelectedElement({ pageIndex: 0, elementId: null });
        event.target.value = '';
      } catch (error) {
        Swal.fire({
          title: 'Error importing file. Please check the file format.',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
          showCancelButton: false,
        });
        // console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  }
}

export function importFromJSONData(jsonData, setProject, setSelectedElement, clearHistory) {
  try {
    let migratedProject = jsonData;
    if (jsonData.pageSettings && jsonData.elements) {
      migratedProject = {
        pages: [{
          id: 1,
          pageSettings: jsonData.pageSettings,
          elements: jsonData.elements
        }],
        currentPage: 0
      };
    }
    migratedProject.pages = migratedProject.pages.map(page => ({
      ...page,
      elements: page.elements.map(element => {
        if (element.type === 'text') {
          return {
            ...element,
            properties: {
              text: element.properties?.text || 'Click to edit text',
              fontSize: element.properties?.fontSize || 16,
              fontFamily: element.properties?.fontFamily || 'Arial',
              color: element.properties?.color || '#000000',
              bold: element.properties?.bold || false,
              italic: element.properties?.italic || false,
              underline: element.properties?.underline || false,
              textAlign: element.properties?.textAlign || 'left',
              listStyle: element.properties?.listStyle || 'none',
              lineHeight: element.properties?.lineHeight || 1.2,
              letterSpacing: element.properties?.letterSpacing || 0
            }
          };
        } else if (element.type === 'image') {
          // Process image elements for import (handle cloud URLs)
          return cloudImageService.processImageForImport(element);
        } else if (element.type === 'shape') {
          // Ensure shape elements have all required properties
          return {
            ...element,
            shapeType: element.shapeType || 'rectangle',
            properties: {
              fill: element.properties?.fill || '#f3f4f6',
              stroke: element.properties?.stroke || '#111827',
              strokeWidth: element.properties?.strokeWidth || 2,
              opacity: element.properties?.opacity || 1,
              rx: element.properties?.rx || 0,
              strokeDasharray: element.properties?.strokeDasharray || 'none',
              shadow: element.properties?.shadow || false,
              shadowBlur: element.properties?.shadowBlur || 0,
              shadowColor: element.properties?.shadowColor || '#000',
              ...element.properties
            }
          };
        }
        return element;
      })
    }));

    // Extract images from JSON and add to uploads panel
    cloudImageService.extractImagesFromJSON(migratedProject);

    // Add flag to indicate this is a newly imported project
    migratedProject._isNewlyImported = true;

    // Clear history first if clearHistory function is provided
    if (clearHistory && typeof clearHistory === 'function') {
      clearHistory();
    }

    setProject(migratedProject);
    setSelectedElement({ pageIndex: 0, elementId: null });
  } catch (error) {
    // console.error('Import error:', error);
    Swal.fire({
      title: 'Import error:',
      icon: 'warning',
      timer: 1500,
      showConfirmButton: false,
      showCancelButton: false,
    });
    throw error;
  }
}

// Image compression utility
async function compressImage(src, maxWidth = 1920, quality = 0.8) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.onerror = () => resolve(src); // Fallback to original if compression fails
    img.src = src;
  });
}

// Process element and optimize for export
async function processElementForExport(element) {
  if (element.type === 'image' && element.properties.src) {
    // Compress images to reduce file size
    const compressedSrc = await compressImage(element.properties.src);
    return {
      ...element,
      properties: {
        ...element.properties,
        src: compressedSrc
      }
    };
  }
  return element;
}

// Enhanced PDF export with size optimization
export const exportToPDF = async (project) => {
  await handlePDFGeneration();
};

// Export project as optimized SVG
export function exportToOptimizedSVG(project) {
  try {
    const page = project.pages[project.currentPage || 0];
    if (!page) {
      throw new Error('No page found to export');
    }

    // Create SVG content from page elements
    const svgContent = generateSVGFromPage(page);

    // Optimize the SVG using SVGO
    const optimizedSVG = optimizeSVG(svgContent);

    // Get optimization statistics
    const stats = getOptimizationStats(svgContent, optimizedSVG);

    // Create download
    const blob = new Blob([optimizedSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `canva-export-${timestamp}.svg`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    return { success: true, stats };
  } catch (error) {
    // console.error('SVG export error:', error);
    Swal.fire({
      title: 'SVG export error:',
      icon: 'warning',
      timer: 1500,
      showConfirmButton: false,
      showCancelButton: false,
    });
    return { success: false, error: error.message };
  }
}

// Generate SVG content from page elements
function generateSVGFromPage(page) {
  const { pageSettings, elements } = page;
  const { width, height } = pageSettings;

  // Sort elements by z-index
  const sortedElements = elements.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  // Generate background
  let backgroundElement = '';
  if (pageSettings.background) {
    if (pageSettings.background.type === 'color') {
      backgroundElement = `<rect width="100%" height="100%" fill="${pageSettings.background.value}"/>`;
    } else if (pageSettings.background.type === 'gradient') {
      // Handle gradient backgrounds
      backgroundElement = `<defs><linearGradient id="bg-gradient"><stop offset="0%" style="stop-color:${pageSettings.background.value.split(',')[0]};stop-opacity:1" /><stop offset="100%" style="stop-color:${pageSettings.background.value.split(',')[1]};stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#bg-gradient)"/>`;
    }
  }

  // Generate elements
  const elementSVGs = sortedElements.map(element => {
    if (element.type === 'text') {
      return generateTextSVG(element);
    } else if (element.type === 'image') {
      return generateImageSVG(element);
    } else if (element.type === 'svg') {
      return generateEmbeddedSVG(element);
    } else if (element.type === 'shape') {
      return generateShapeSVG(element);
    }
    return '';
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${backgroundElement}
  ${elementSVGs}
</svg>`;
}

// Generate SVG for text elements
function generateTextSVG(element) {
  const { x, y, width, height, rotation = 0, properties } = element;
  const { text, fontSize = 16, fontFamily = 'Arial', color = '#000000', bold, italic, textAlign = 'left' } = properties;

  const fontWeight = bold ? 'bold' : 'normal';
  const fontStyle = italic ? 'italic' : 'normal';
  const textAnchor = textAlign === 'center' ? 'middle' : textAlign === 'right' ? 'end' : 'start';

  const getSVGFontFamily = (fontFamily) => {
    return fontFamily;
  };

  const transform = rotation !== 0 ? `transform="rotate(${rotation} ${x + width / 2} ${y + height / 2})"` : '';

  return `<text x="${x + (textAlign === 'center' ? width / 2 : textAlign === 'right' ? width : 0)}" y="${y + fontSize}"
    font-family="${getSVGFontFamily(fontFamily)}" font-size="${fontSize}" fill="${color}"
    font-weight="${fontWeight}" font-style="${fontStyle}" text-anchor="${textAnchor}"
    ${transform}>${text}</text>`;
}

function generateImageSVG(element) {
  // Minimal implementation for SVG image export
  const { x, y, width, height, rotation = 0, properties } = element;
  const { src } = properties;
  const transform = rotation !== 0 ? `transform="rotate(${rotation} ${x + width / 2} ${y + height / 2})"` : '';
  return `<image x="${x}" y="${y}" width="${width}" height="${height}" href="${src}" ${transform}/>`;
}

function generateEmbeddedSVG(element) {
  // Minimal implementation for embedded SVG export
  const { x, y, width, height, rotation = 0, properties } = element;
  let svgContent = properties.svgContent;
  if (!svgContent.includes('viewBox') && !svgContent.includes('width=') && !svgContent.includes('height=')) {
    svgContent = svgContent.replace('<svg', `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}"`);
  }
  // Optionally wrap in a <g> with transform for rotation
  if (rotation && rotation !== 0) {
    return `<g transform="rotate(${rotation} ${x + width / 2} ${y + height / 2})"><svg x="${x}" y="${y}" width="${width}" height="${height}">${svgContent}</svg></g>`;
  }
  return `<svg x="${x}" y="${y}" width="${width}" height="${height}">${svgContent}</svg>`;
}

function generateShapeSVG(element) {
  // Minimal implementation for shape export (rectangle as example)
  const { x, y, width, height, properties } = element;
  const { fill = '#000', stroke = '#000', strokeWidth = 1 } = properties;
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
}