// SVG utility functions
import Swal from 'sweetalert2';

// Browser-compatible SVG optimizer
export function optimizeSVG(svgContent) {
  try {
    // Parse the SVG content
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svg = doc.querySelector('svg');

    if (!svg) {
      // console.warn('No SVG element found in content');
      Swal.fire({
        title: 'No SVG element found in content',
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      return svgContent;
    }

    // Remove comments
    const comments = doc.evaluate('//comment()', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = comments.snapshotLength - 1; i >= 0; i--) {
      comments.snapshotItem(i).remove();
    }

    // Remove empty elements
    const emptyElements = doc.querySelectorAll('*');
    emptyElements.forEach(element => {
      if (element.children.length === 0 && !element.textContent.trim()) {
        element.remove();
      }
    });

    // Optimize attributes
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(element => {
      // Remove empty attributes
      const attributes = Array.from(element.attributes);
      attributes.forEach(attr => {
        if (!attr.value || attr.value.trim() === '') {
          element.removeAttribute(attr.name);
        }
      });

      // Optimize colors
      const colorAttributes = ['fill', 'stroke', 'color'];
      colorAttributes.forEach(attrName => {
        const attr = element.getAttribute(attrName);
        if (attr) {
          const optimizedColor = optimizeColor(attr);
          if (optimizedColor !== attr) {
            element.setAttribute(attrName, optimizedColor);
          }
        }
      });

      // Optimize numbers
      const numberAttributes = ['x', 'y', 'width', 'height', 'cx', 'cy', 'r', 'rx', 'ry', 'stroke-width', 'font-size'];
      numberAttributes.forEach(attrName => {
        const attr = element.getAttribute(attrName);
        if (attr && !isNaN(attr)) {
          const optimizedNumber = parseFloat(attr).toString();
          if (optimizedNumber !== attr) {
            element.setAttribute(attrName, optimizedNumber);
          }
        }
      });
    });

    // Ensure proper namespace
    if (!svg.getAttribute('xmlns')) {
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    // Convert back to string and clean up whitespace
    const serializer = new XMLSerializer();
    let optimized = serializer.serializeToString(doc);

    // Remove unnecessary whitespace
    optimized = optimized.replace(/>\s+</g, '><');
    optimized = optimized.replace(/\s+/g, ' ');
    optimized = optimized.trim();

    return optimized;
  } catch (error) {
    // console.error('SVG optimization error:', error);
    Swal.fire({
      title: 'SVG optimization error:',
      icon: 'warning',
      timer: 1500,
      showConfirmButton: false,
      showCancelButton: false,
    });
    return svgContent;
  }
}

// Optimize color values
function optimizeColor(color) {
  if (!color) return color;

  // Convert color names to hex
  const colorMap = {
    'black': '#000',
    'white': '#fff',
    'red': '#f00',
    'green': '#0f0',
    'blue': '#00f',
    'yellow': '#ff0',
    'cyan': '#0ff',
    'magenta': '#f0f',
    'gray': '#808080',
    'grey': '#808080',
    'silver': '#c0c0c0',
    'maroon': '#800000',
    'olive': '#808000',
    'purple': '#800080',
    'teal': '#008080',
    'navy': '#000080',
    'orange': '#ffa500',
    'pink': '#ffc0cb',
    'brown': '#a52a2a',
    'violet': '#ee82ee',
    'indigo': '#4b0082',
    'gold': '#ffd700',
    'coral': '#ff7f50',
    'khaki': '#f0e68c',
    'lavender': '#e6e6fa',
    'plum': '#dda0dd',
    'salmon': '#fa8072',
    'tan': '#d2b48c',
    'turquoise': '#40e0d0',
    'wheat': '#f5deb3'
  };

  const lowerColor = color.toLowerCase().trim();
  if (colorMap[lowerColor]) {
    return colorMap[lowerColor];
  }

  // Optimize hex colors
  if (color.startsWith('#')) {
    // Convert 6-digit hex to 3-digit if possible
    if (color.length === 7) {
      const r = color[1];
      const g = color[3];
      const b = color[5];
      if (r === color[2] && g === color[4] && b === color[6]) {
        return `#${r}${g}${b}`;
      }
    }
  }

  return color;
}

// Optimize SVG with custom configuration
export function optimizeSVGWithConfig(svgContent, customConfig = {}) {
  // For now, just use the default optimization
  // In the future, this could be extended to support custom configurations
  return optimizeSVG(svgContent);
}

// Get optimization statistics
export function getOptimizationStats(originalSVG, optimizedSVG) {
  const originalSize = new Blob([originalSVG]).size;
  const optimizedSize = new Blob([optimizedSVG]).size;
  const reduction = originalSize - optimizedSize;
  const reductionPercent = ((reduction / originalSize) * 100).toFixed(2);

  return {
    originalSize,
    optimizedSize,
    reduction,
    reductionPercent
  };
}

// Comprehensive SVG security sanitizer
export function sanitizeSVG(svgContent) {
  let sanitized = svgContent;
  // Remove all script tags and their content
  sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  // Remove onclick, onload, onerror, and other event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  // Remove data: URLs (potential for malicious content)
  sanitized = sanitized.replace(/data:/gi, '');
  // Remove external references that could be malicious
  sanitized = sanitized.replace(/xlink:href\s*=\s*["'](?!data:)[^"']*["']/gi, '');
  // Remove foreignObject elements (can contain HTML/scripts)
  sanitized = sanitized.replace(/<foreignObject[^>]*>[\s\S]*?<\/foreignObject>/gi, '');
  // Remove any element with potentially dangerous attributes
  sanitized = sanitized.replace(/<[^>]*\s+(?:href|src)\s*=\s*["'](?:javascript|data|vbscript):[^"']*["'][^>]*>/gi, '');
  // Remove any element with style attributes containing javascript
  sanitized = sanitized.replace(/<[^>]*\s+style\s*=\s*["'][^"']*javascript[^"']*["'][^>]*>/gi, '');
  // Ensure SVG has proper namespace
  if (!sanitized.includes('xmlns="http://www.w3.org/2000/svg"')) {
    sanitized = sanitized.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return sanitized;
}

// Optimize SVG for A4 printing
export function optimizeSVGForA4(svgContent) {
  try {
    // Parse the SVG content
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svg = doc.querySelector('svg');

    if (!svg) {
      // console.warn('No SVG element found in content');
      Swal.fire({
        title: 'No SVG element found in content',
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      return svgContent;
    }

    // Set A4 dimensions (210mm x 297mm in pixels at 96 DPI)
    const a4Width = 794; // 210mm * 96 DPI / 25.4mm
    const a4Height = 1123; // 297mm * 96 DPI / 25.4mm

    // Set viewBox and dimensions for A4
    svg.setAttribute('width', a4Width);
    svg.setAttribute('height', a4Height);
    svg.setAttribute('viewBox', `0 0 ${a4Width} ${a4Height}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Ensure proper namespace
    if (!svg.getAttribute('xmlns')) {
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    // Convert back to string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  } catch (error) {
    // console.error('Error optimizing SVG for A4:', error);
    Swal.fire({
      title: 'Error optimizing SVG for A4:',
      icon: 'warning',
      timer: 1500,
      showConfirmButton: false,
      showCancelButton: false,
    });
    // Return original content if optimization fails
    return svgContent;
  }
}

// Base64 encoding function that handles Unicode characters
export function encodeSVGToBase64(svgString) {
  try {
    // Convert string to UTF-8 bytes
    const bytes = new TextEncoder().encode(svgString);
    // Convert bytes to base64
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (error) {
    // console.error('Error encoding SVG:', error);
    Swal.fire({
      title: 'Error encoding SVG:',
      icon: 'warning',
      timer: 1500,
      showConfirmButton: false,
      showCancelButton: false,
    });
    // Fallback to simple encoding if TextEncoder is not available
    return btoa(unescape(encodeURIComponent(svgString)));
  }
}

// Get all SVGs in subfolders of design/
export async function getTemplateSets() {
  try {
    // Use Vite's import.meta.glob for dynamic imports
    const modules = import.meta.glob('../components/design/**/*.svg', { eager: true });

    const sets = {};

    Object.keys(modules).forEach((key) => {
      const match = key.match(/\.\.\/components\/design\/([^/]+)\//);
      if (!match) return;

      const folder = match[1];
      if (!sets[folder]) sets[folder] = [];

      // Extract the default export or the module itself
      const module = modules[key];
      const svgPath = module.default || module;
      sets[folder].push(svgPath);
    });

    // Sort each set
    Object.values(sets).forEach(arr => arr.sort());

    return sets;
  } catch (error) {
    // console.error('Error loading template sets:', error);
    Swal.fire({
      title: 'Error loading template sets:',
      icon: 'warning',
      timer: 1500,
      showConfirmButton: false,
      showCancelButton: false,
    });
    return {};
  }
}

// Function to scale SVG template to fit page dimensions
export function scaleSVGToFitPage(svgContent, pageWidth, pageHeight) {
  try {
    // Parse the SVG to get its original dimensions
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');

    if (!svgElement) {
      // console.warn('No SVG element found in template');
      Swal.fire({
        title: 'No SVG element found in template',
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      return svgContent;
    }

    // Get original dimensions
    const originalWidth = parseFloat(svgElement.getAttribute('width') || svgElement.getAttribute('viewBox')?.split(' ')[2] || 794);
    const originalHeight = parseFloat(svgElement.getAttribute('height') || svgElement.getAttribute('viewBox')?.split(' ')[3] || 1123);

    // Calculate scale to fit the page
    const scaleX = pageWidth / originalWidth;
    const scaleY = pageHeight / originalHeight;
    const scale = Math.min(scaleX, scaleY); // Use the smaller scale to ensure it fits

    // Apply scaling transformation
    const transform = `scale(${scale})`;

    // Create a wrapper group with the transformation
    const wrapperGroup = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
    wrapperGroup.setAttribute('transform', transform);

    // Move all child elements to the wrapper group
    const children = Array.from(svgElement.children);
    children.forEach(child => {
      svgElement.removeChild(child);
      wrapperGroup.appendChild(child);
    });

    // Add the wrapper group back to the SVG
    svgElement.appendChild(wrapperGroup);

    // Update SVG dimensions to match page
    svgElement.setAttribute('width', pageWidth);
    svgElement.setAttribute('height', pageHeight);
    svgElement.setAttribute('viewBox', `0 0 ${pageWidth} ${pageHeight}`);

    // Center the content if it doesn't fill the entire page
    if (scaleX !== scaleY) {
      const scaledWidth = originalWidth * scale;
      const scaledHeight = originalHeight * scale;
      const translateX = (pageWidth - scaledWidth) / 2;
      const translateY = (pageHeight - scaledHeight) / 2;

      wrapperGroup.setAttribute('transform', `translate(${translateX}, ${translateY}) scale(${scale})`);
    }

    // Convert back to string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);

  } catch (error) {
    // console.error('Error scaling SVG template:', error);
    Swal.fire({
      title: 'Error scaling SVG template:',
      icon: 'warning',
      timer: 1500,
      showConfirmButton: false,
      showCancelButton: false,
    });
    return svgContent; // Return original if scaling fails
  }
} 