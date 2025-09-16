import { useCallback } from 'react';
import Swal from 'sweetalert2';

export const useElements = (project, setProject, generateId, currentEditingPage, setSelectedElement) => {
  const updateElement = useCallback((pageIndex, elementId, updates) => {
    const page = project.pages[pageIndex];
    if (!page) return;

    // Check if pageSettings exists, if not use fallback values
    if (!page.pageSettings) {
      // console.error('Page settings not found for page at index:', pageIndex);
      Swal.fire({
        title: "Page settings not found for page at index:",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      // Update the page to include pageSettings if missing
      const defaultSettings = { width: 794, height: 1123 };
      setProject(prev => {
        const newProject = {
          ...prev,
          pages: prev.pages.map((p, idx) =>
            idx === pageIndex
              ? { ...p, pageSettings: defaultSettings }
              : p
          )
        };
        return newProject;
      });
      return; // Exit early, the update will be retried on next render
    }

    // Also check if elements array exists
    if (!page.elements) {
      // console.error('Elements array not found for page at index:', pageIndex);
      Swal.fire({
        title: "Elements array not found for page at index:",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      // Update the page to include elements array if missing
      setProject(prev => {
        const newProject = {
          ...prev,
          pages: prev.pages.map((p, idx) =>
            idx === pageIndex
              ? { ...p, elements: [] }
              : p
          )
        };
        return newProject;
      });
      return; // Exit early, the update will be retried on next render
    }

    // Check if element is being moved or resized
    if (updates.x !== undefined || updates.y !== undefined || updates.width !== undefined || updates.height !== undefined) {
      const element = page.elements.find(el => el.id === elementId);
      const newX = updates.x !== undefined ? updates.x : element.x;
      const newY = updates.y !== undefined ? updates.y : element.y;
      const newWidth = updates.width !== undefined ? updates.width : element.width;
      const newHeight = updates.height !== undefined ? updates.height : element.height;

      // Check if element is fully outside the canvas bounds
      const isFullyOutside =
        newX + newWidth < 0 ||
        newY + newHeight < 0 ||
        newX > page.pageSettings.width ||
        newY > page.pageSettings.height;

      // If element is fully outside, don't update it (let useInteraction handle deletion)
      if (isFullyOutside) {
        return;
      }

      // Apply updates without boundary constraints
      updates.x = newX;
      updates.y = newY;
      updates.width = Math.max(5, Math.min(page.pageSettings.width, newWidth));
      updates.height = Math.max(5, Math.min(page.pageSettings.height, newHeight));
    }

    setProject(prev => {
      const newProject = {
        ...prev,
        pages: prev.pages.map((p, idx) =>
          idx === pageIndex
            ? {
              ...p,
              elements: p.elements.map(el =>
                el.id === elementId
                  ? { ...el, ...updates }
                  : el
              )
            }
            : p
        )
      };

      return newProject;
    });
  }, [project, setProject]);

  const deleteElement = useCallback((pageIndex, elementId, onComplete) => {
    const page = project.pages[pageIndex];
    if (!page) return;

    if (!page.pageSettings || !page.elements) {
      // console.error('Page structure invalid in deleteElement, fixing...');
      Swal.fire({
        title: "Page structure invalid in deleteElement, fixing...",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      // Fix the page structure first
      const defaultSettings = { width: 794, height: 1123 };
      setProject(prev => {
        const newProject = {
          ...prev,
          pages: prev.pages.map((p, idx) =>
            idx === pageIndex
              ? {
                ...p,
                pageSettings: p.pageSettings || defaultSettings,
                elements: p.elements || []
              }
              : p
          )
        };
        return newProject;
      });
      return; // Exit early, the deletion will be retried on next render
    }

    setProject(prev => {
      const newProject = {
        ...prev,
        pages: prev.pages.map((p, idx) =>
          idx === pageIndex
            ? { ...p, elements: p.elements.filter(el => el.id !== elementId) }
            : p
        )
      };

      // Call onComplete with the updated project if provided
      if (onComplete) {
        setTimeout(() => onComplete(newProject), 0);
      }

      return newProject;
    });
    setSelectedElement({ pageIndex: 0, elementId: null });
  }, [setProject, setSelectedElement]);

  const addTextElement = useCallback((onComplete) => {
    const pageIndex = currentEditingPage;
    const page = project.pages[pageIndex];

    // Add defensive checks to prevent the error
    if (!page) {
      // console.error('Page not found at index:', pageIndex);
      Swal.fire({
        title: "Page not found at index:",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      return;
    }

    if (!page.pageSettings) {
      // console.error('Page settings not found for page at index:', pageIndex);
      Swal.fire({
        title: "Page settings not found for page at index:",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      // Fallback to default page settings
      const defaultSettings = { width: 794, height: 1123 };
      const newElement = {
        id: generateId(),
        type: 'text',
        x: 100,
        y: 100,
        width: Math.min(200, defaultSettings.width),
        height: Math.min(50, defaultSettings.height),
        rotation: 0,
        zIndex: (page.elements || []).length + 1,
        properties: {
          text: 'Click to edit text',
          fontSize: 16,
          fontFamily: 'Arial',
          color: '#000000',
          bold: false,
          italic: false,
          underline: false,
          textAlign: 'left',
          listStyle: 'none',
          lineHeight: 1.2,
          letterSpacing: 0
        }
      };

      // Update the page to include pageSettings if missing
      setProject(prev => {
        const newProject = {
          ...prev,
          pages: prev.pages.map((p, idx) =>
            idx === pageIndex
              ? {
                ...p,
                pageSettings: defaultSettings,
                elements: [...(p.elements || []), newElement]
              }
              : p
          )
        };

        if (onComplete) {
          onComplete(newProject);
        }

        return newProject;
      });
      setSelectedElement({ pageIndex, elementId: newElement.id });
      return;
    }

    const newElement = {
      id: generateId(),
      type: 'text',
      x: 100,
      y: 100,
      width: Math.min(200, page.pageSettings.width),
      height: Math.min(50, page.pageSettings.height),
      rotation: 0,
      zIndex: (page.elements || []).length + 1,
      properties: {
        text: 'Click to edit text',
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#000000',
        bold: false,
        italic: false,
        underline: false,
        textAlign: 'left',
        listStyle: 'none',
        lineHeight: 1.2,
        letterSpacing: 0
      }
    };

    setProject(prev => {
      const newProject = {
        ...prev,
        pages: prev.pages.map((p, idx) =>
          idx === pageIndex
            ? { ...p, elements: [...(p.elements || []), newElement] }
            : p
        )
      };

      // Call the callback with the updated state immediately
      if (onComplete) {
        onComplete(newProject);
      }

      return newProject;
    });
    setSelectedElement({ pageIndex, elementId: newElement.id });
  }, [currentEditingPage, project, generateId, setProject, setSelectedElement]);

  const addCustomTextElement = useCallback((customElement, onComplete) => {
    const pageIndex = currentEditingPage;
    const page = project.pages[pageIndex];

    // Add defensive checks to prevent the error
    if (!page) {
      // console.error('Page not found at index:', pageIndex);
      Swal.fire({
        title: "Page not found at index:",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      return;
    }

    if (!page.pageSettings) {
      // console.error('Page settings not found for page at index:', pageIndex);
      Swal.fire({
        title: "Page settings not found for page at index:",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      // Fallback to default page settings
      const defaultSettings = { width: 794, height: 1123 };
      const newElement = {
        ...customElement,
        id: generateId(),
        zIndex: (page.elements || []).length + 1,
      };

      // Update the page to include pageSettings if missing
      setProject(prev => {
        const newProject = {
          ...prev,
          pages: prev.pages.map((p, idx) =>
            idx === pageIndex
              ? {
                ...p,
                pageSettings: defaultSettings,
                elements: [...(p.elements || []), newElement]
              }
              : p
          )
        };

        if (onComplete) {
          onComplete(newProject);
        }

        return newProject;
      });
      setSelectedElement({ pageIndex, elementId: newElement.id });
      return newElement.id;
    }

    const newElement = {
      ...customElement,
      id: generateId(),
      zIndex: (page.elements || []).length + 1,
    };

    setProject(prev => {
      const newProject = {
        ...prev,
        pages: prev.pages.map((p, idx) =>
          idx === pageIndex
            ? { ...p, elements: [...(p.elements || []), newElement] }
            : p
        )
      };

      // Call the callback with the updated state immediately
      if (onComplete) {
        onComplete(newProject);
      }

      return newProject;
    });
    setSelectedElement({ pageIndex, elementId: newElement.id });

    return newElement.id; // Return the element ID
  }, [currentEditingPage, project, generateId, setProject, setSelectedElement]);

  const addImageElement = useCallback((src, onComplete) => {
    const pageIndex = currentEditingPage;
    const page = project.pages[pageIndex];

    // Add defensive checks to prevent the error
    if (!page) {
      // console.error('Page not found at index:', pageIndex);
      Swal.fire({
        title: "Page not found at index:",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      return;
    }

    if (!page.pageSettings) {
      // console.error('Page settings not found for page at index:', pageIndex);
      Swal.fire({
        title: "Page settings not found for page at index:",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      // Fallback to default page settings
      const defaultSettings = { width: 794, height: 1123 };
      const newElement = {
        id: generateId(),
        type: 'image',
        x: 150,
        y: 150,
        width: Math.min(200, defaultSettings.width),
        height: Math.min(200, defaultSettings.height),
        rotation: 0,
        zIndex: (page.elements || []).length + 1,
        properties: {
          src: src,
          fit: 'contain'
        }
      };

      // Update the page to include pageSettings if missing
      setProject(prev => {
        const newProject = {
          ...prev,
          pages: prev.pages.map((p, idx) =>
            idx === pageIndex
              ? {
                ...p,
                pageSettings: defaultSettings,
                elements: [...(p.elements || []), newElement]
              }
              : p
          )
        };

        if (onComplete) {
          onComplete(newProject);
        }

        return newProject;
      });
      setSelectedElement({ pageIndex, elementId: newElement.id });
      return;
    }

    const newElement = {
      id: generateId(),
      type: 'image',
      x: 150,
      y: 150,
      width: Math.min(200, page.pageSettings.width),
      height: Math.min(200, page.pageSettings.height),
      rotation: 0,
      zIndex: (page.elements || []).length + 1,
      properties: {
        src: src,
        fit: 'contain'
      }
    };

    setProject(prev => {
      const newProject = {
        ...prev,
        pages: prev.pages.map((p, idx) =>
          idx === pageIndex
            ? { ...p, elements: [...(p.elements || []), newElement] }
            : p
        )
      };

      // Call the callback with the updated state immediately
      if (onComplete) {
        onComplete(newProject);
      }

      return newProject;
    });
    setSelectedElement({ pageIndex, elementId: newElement.id });
  }, [currentEditingPage, project, generateId, setProject, setSelectedElement]);

  const addShapeElement = useCallback((shapeType, onComplete) => {
    const pageIndex = currentEditingPage;
    const page = project.pages[pageIndex];

    // Add defensive checks to prevent the error
    if (!page) {
      // console.error('Page not found at index:', pageIndex);
      Swal.fire({
        title: "Page not found at index:",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      return;
    }

    if (!page.pageSettings) {
      // console.error('Page settings not found for page at index:', pageIndex);
      Swal.fire({
        title: "Page settings not found for page at index:",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      // Fallback to default page settings
      const defaultSettings = { width: 794, height: 1123 };
      let newElement = null;
      const base = {
        id: generateId(),
        type: 'shape',
        shapeType,
        x: 120,
        y: 120,
        width: Math.min(120, defaultSettings.width),
        height: Math.min(80, defaultSettings.height),
        rotation: 0,
        zIndex: (page.elements || []).length + 1,
        properties: {
          fill: '#f3f4f6',
          stroke: '#111827',
          strokeWidth: 2
        }
      };

      // Shape-specific dimensions with page boundary constraints
      const shapeConfig = {
        rectangle: { width: Math.min(120, defaultSettings.width), height: Math.min(80, defaultSettings.height) },
        ellipse: { width: Math.min(100, defaultSettings.width), height: Math.min(100, defaultSettings.height) },
        line: { width: Math.min(120, defaultSettings.width), height: Math.min(20, defaultSettings.height) },
        triangle: { width: Math.min(100, defaultSettings.width), height: Math.min(90, defaultSettings.height) },
        pentagon: { width: Math.min(100, defaultSettings.width), height: Math.min(100, defaultSettings.height) },
        diamond: { width: Math.min(100, defaultSettings.width), height: Math.min(100, defaultSettings.height) },
        hexagon: { width: Math.min(100, defaultSettings.width), height: Math.min(100, defaultSettings.height) },
        octagon: { width: Math.min(100, defaultSettings.width), height: Math.min(100, defaultSettings.height) },
        star: { width: Math.min(100, defaultSettings.width), height: Math.min(100, defaultSettings.height) },
        heart: { width: Math.min(100, defaultSettings.width), height: Math.min(100, defaultSettings.height) },
        cloud: { width: Math.min(120, defaultSettings.width), height: Math.min(80, defaultSettings.height) },
        arrow: { width: Math.min(120, defaultSettings.width), height: Math.min(40, defaultSettings.height) },
        rightArrow: { width: Math.min(120, defaultSettings.width), height: Math.min(40, defaultSettings.height) },
        leftArrow: { width: Math.min(120, defaultSettings.width), height: Math.min(40, defaultSettings.height) },
        upArrow: { width: Math.min(40, defaultSettings.width), height: Math.min(120, defaultSettings.height) },
        downArrow: { width: Math.min(40, defaultSettings.width), height: Math.min(120, defaultSettings.height) },
        parallelogram: { width: Math.min(120, defaultSettings.width), height: Math.min(80, defaultSettings.height) },
        trapezoid: { width: Math.min(120, defaultSettings.width), height: Math.min(80, defaultSettings.height) },
        chevron: { width: Math.min(120, defaultSettings.width), height: Math.min(40, defaultSettings.height) },
        bookmark: { width: Math.min(80, defaultSettings.width), height: Math.min(120, defaultSettings.height) },
        lightning: { width: Math.min(80, defaultSettings.width), height: Math.min(120, defaultSettings.height) },
        sun: { width: Math.min(100, defaultSettings.width), height: Math.min(100, defaultSettings.height) },
        crescent: { width: Math.min(100, defaultSettings.width), height: Math.min(100, defaultSettings.height) },
        speechBubble: { width: Math.min(120, defaultSettings.width), height: Math.min(80, defaultSettings.height) },
        cross: { width: Math.min(80, defaultSettings.width), height: Math.min(80, defaultSettings.height) },
        checkmark: { width: Math.min(80, defaultSettings.width), height: Math.min(80, defaultSettings.height) },
        plus: { width: Math.min(80, defaultSettings.width), height: Math.min(80, defaultSettings.height) },
        minus: { width: Math.min(80, defaultSettings.width), height: Math.min(40, defaultSettings.height) },
        exclamation: { width: Math.min(40, defaultSettings.width), height: Math.min(80, defaultSettings.height) },
        // ... add more shapes as needed
      };

      if (shapeConfig[shapeType]) {
        newElement = { ...base, ...shapeConfig[shapeType] };
      } else {
        newElement = base;
      }

      // Update the page to include pageSettings if missing
      setProject(prev => {
        const newProject = {
          ...prev,
          pages: prev.pages.map((p, idx) =>
            idx === pageIndex
              ? {
                ...p,
                pageSettings: defaultSettings,
                elements: [...(p.elements || []), newElement]
              }
              : p
          )
        };

        if (onComplete) {
          onComplete(newProject);
        }

        return newProject;
      });
      setSelectedElement({ pageIndex, elementId: newElement.id });
      return;
    }

    let newElement = null;
    const base = {
      id: generateId(),
      type: 'shape',
      shapeType,
      x: 120,
      y: 120,
      width: Math.min(120, page.pageSettings.width),
      height: Math.min(80, page.pageSettings.height),
      rotation: 0,
      zIndex: (page.elements || []).length + 1,
      properties: {
        fill: '#f3f4f6',
        stroke: '#111827',
        strokeWidth: 2
      }
    };

    // Shape-specific dimensions with page boundary constraints
    const shapeConfig = {
      rectangle: { width: Math.min(120, page.pageSettings.width), height: Math.min(80, page.pageSettings.height) },
      ellipse: { width: Math.min(100, page.pageSettings.width), height: Math.min(100, page.pageSettings.height) },
      line: { width: Math.min(120, page.pageSettings.width), height: Math.min(20, page.pageSettings.height) },
      triangle: { width: Math.min(100, page.pageSettings.width), height: Math.min(90, page.pageSettings.height) },
      pentagon: { width: Math.min(100, page.pageSettings.width), height: Math.min(100, page.pageSettings.height) },
      diamond: { width: Math.min(100, page.pageSettings.width), height: Math.min(100, page.pageSettings.height) },
      hexagon: { width: Math.min(100, page.pageSettings.width), height: Math.min(100, page.pageSettings.height) },
      octagon: { width: Math.min(100, page.pageSettings.width), height: Math.min(100, page.pageSettings.height) },
      star: { width: Math.min(100, page.pageSettings.width), height: Math.min(100, page.pageSettings.height) },
      heart: { width: Math.min(100, page.pageSettings.width), height: Math.min(100, page.pageSettings.height) },
      cloud: { width: Math.min(120, page.pageSettings.width), height: Math.min(80, page.pageSettings.height) },
      arrow: { width: Math.min(120, page.pageSettings.width), height: Math.min(40, page.pageSettings.height) },
      rightArrow: { width: Math.min(120, page.pageSettings.width), height: Math.min(40, page.pageSettings.height) },
      leftArrow: { width: Math.min(120, page.pageSettings.width), height: Math.min(40, page.pageSettings.height) },
      upArrow: { width: Math.min(40, page.pageSettings.width), height: Math.min(120, page.pageSettings.height) },
      downArrow: { width: Math.min(40, page.pageSettings.width), height: Math.min(120, page.pageSettings.height) },
      parallelogram: { width: Math.min(120, page.pageSettings.width), height: Math.min(80, page.pageSettings.height) },
      trapezoid: { width: Math.min(120, page.pageSettings.width), height: Math.min(80, page.pageSettings.height) },
      chevron: { width: Math.min(120, page.pageSettings.width), height: Math.min(40, page.pageSettings.height) },
      bookmark: { width: Math.min(80, page.pageSettings.width), height: Math.min(120, page.pageSettings.height) },
      lightning: { width: Math.min(80, page.pageSettings.width), height: Math.min(120, page.pageSettings.height) },
      sun: { width: Math.min(100, page.pageSettings.width), height: Math.min(100, page.pageSettings.height) },
      crescent: { width: Math.min(100, page.pageSettings.width), height: Math.min(100, page.pageSettings.height) },
      speechBubble: { width: Math.min(120, page.pageSettings.width), height: Math.min(80, page.pageSettings.height) },
      cross: { width: Math.min(80, page.pageSettings.width), height: Math.min(80, page.pageSettings.width) },
      checkmark: { width: Math.min(80, page.pageSettings.width), height: Math.min(80, page.pageSettings.height) },
      plus: { width: Math.min(80, page.pageSettings.width), height: Math.min(80, page.pageSettings.height) },
      minus: { width: Math.min(80, page.pageSettings.width), height: Math.min(40, page.pageSettings.height) },
      exclamation: { width: Math.min(40, page.pageSettings.width), height: Math.min(80, page.pageSettings.height) },
      // ... add more shapes as needed
    };

    if (shapeConfig[shapeType]) {
      newElement = { ...base, ...shapeConfig[shapeType] };
    } else {
      newElement = base;
    }

    // Special handling for line shape to ensure proper stroke width
    if (shapeType === 'line') {
      newElement.properties = {
        ...newElement.properties,
        strokeWidth: 3
      };
    }

    setProject(prev => {
      const newProject = {
        ...prev,
        pages: prev.pages.map((p, idx) =>
          idx === pageIndex
            ? { ...p, elements: [...p.elements, newElement] }
            : p
        )
      };

      // Call the callback with the updated state immediately
      if (onComplete) {
        onComplete(newProject);
      }

      return newProject;
    });
    setSelectedElement({ pageIndex, elementId: newElement.id });
  }, [currentEditingPage, project, generateId, setProject, setSelectedElement]);

  const duplicateElement = useCallback((selectedEl, selectedElement, onComplete) => {
    if (!selectedEl) return;
    const pageIndex = selectedElement.pageIndex;
    const page = project.pages[pageIndex];

    if (!page || !page.pageSettings || !page.elements) {
      console.error('Page structure invalid in duplicateElement, fixing...');
      // Fix the page structure first
      const defaultSettings = { width: 794, height: 1123 };
      setProject(prev => {
        const newProject = {
          ...prev,
          pages: prev.pages.map((p, idx) =>
            idx === pageIndex
              ? {
                ...p,
                pageSettings: p.pageSettings || defaultSettings,
                elements: p.elements || []
              }
              : p
          )
        };
        return newProject;
      });
      return; // Exit early, the duplication will be retried on next render
    }

    const orig = selectedEl;
    const offset = 20;

    const newElement = {
      ...orig,
      id: generateId(),
      x: orig.x + offset,
      y: orig.y + offset,
      zIndex: page.elements.length + 1,
    };

    setProject(prev => {
      const newProject = {
        ...prev,
        pages: prev.pages.map((p, idx) =>
          idx === pageIndex
            ? { ...p, elements: [...p.elements, newElement] }
            : p
        )
      };

      // Call the callback with the updated state immediately
      if (onComplete) {
        onComplete(newProject);
      }

      return newProject;
    });
    setSelectedElement({ pageIndex, elementId: newElement.id });
  }, [project, generateId, setProject, setSelectedElement]);

  return {
    updateElement,
    deleteElement,
    addTextElement,
    addCustomTextElement,
    addImageElement,
    addShapeElement,
    duplicateElement
  };
};