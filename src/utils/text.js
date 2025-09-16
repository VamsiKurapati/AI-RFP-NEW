// Text-related utility functions
import Swal from 'sweetalert2';

// Debounce timer for text changes
let textChangeTimerRef = null;

// Example: updateTextContent
export function updateTextContent(updateElement, project, pageIndex, elementId, newText) {
  if (!updateElement || !project || pageIndex === undefined || !elementId) {
    // console.error('updateTextContent: Invalid parameters', { updateElement, project, pageIndex, elementId });
    Swal.fire({
      title: 'updateTextContent: Invalid parameters',
      icon: 'warning',
      timer: 1500,
      showConfirmButton: false,
      showCancelButton: false,
    });
    return;
  }

  const currentPage = project.pages[pageIndex];
  if (!currentPage) {
    // console.error('updateTextContent: Current page not found', { pageIndex, project });
    Swal.fire({
      title: 'updateTextContent: Current page not found',
      icon: 'warning',
      timer: 1500,
      showConfirmButton: false,
      showCancelButton: false,
    });
    return;
  }

  const element = currentPage.elements.find(el => el.id === elementId);
  if (!element) {
    // console.error('updateTextContent: Element not found', { elementId, pageIndex });
    Swal.fire({
      title: 'updateTextContent: Element not found',
      icon: 'warning',
      timer: 1500,
      showConfirmButton: false,
      showCancelButton: false,
    });
    return;
  }

  try {
    // Always update immediately for visual feedback
    updateElement(pageIndex, elementId, {
      properties: {
        ...element.properties,
        text: newText
      }
    });

    // Clear existing timer
    if (textChangeTimerRef) {
      clearTimeout(textChangeTimerRef);
    }

    // Set a timer to save history after user stops typing
    textChangeTimerRef = setTimeout(() => {
      // The history will be saved by the debounced updateElementTextOnly function
      // This is just for immediate visual feedback
    }, 1000); // Wait 1 second after last text change
  } catch (error) {
    // console.error('updateTextContent: Error calling updateElement', error);
    Swal.fire({
      title: 'updateTextContent: Error calling updateElement',
      icon: 'warning',
      timer: 1500,
      showConfirmButton: false,
      showCancelButton: false,
    });
  }
}

/**
 * Truncates text to a specified character limit or until the first newline
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum number of characters to show
 * @returns {string} - Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';

  // Find the first newline
  const newlineIndex = text.indexOf('\n');

  if (newlineIndex !== -1 && newlineIndex < maxLength) {
    // Truncate at newline
    return text.substring(0, newlineIndex) + (text.length > newlineIndex ? '...' : '');
  }

  // Truncate at character limit
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength) + '...';
};

// Add any other text-related helpers here 