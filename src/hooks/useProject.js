import { useState, useEffect } from 'react';
import { DEFAULT_PAGE_SETTINGS } from '../constants';

export const useProject = () => {
  const [project, setProject] = useState({
    pages: [{
      id: 1,
      pageSettings: DEFAULT_PAGE_SETTINGS,
      elements: []
    }],
    currentPage: 0
  });

  const [selectedElement, setSelectedElement] = useState({ pageIndex: 0, elementId: null });

  // Wrapper function to ensure selectedElement always has valid structure
  const safeSetSelectedElement = (newValue) => {
    if (newValue && typeof newValue === 'object' && newValue.pageIndex !== undefined) {
      setSelectedElement(newValue);
    } else {
      // Fallback to safe default
      setSelectedElement({ pageIndex: 0, elementId: null });
    }
  };
  const [currentEditingPage, setCurrentEditingPage] = useState(0);

  // Auto-save to localStorage
  useEffect(() => {
    // Only auto-save if not in the middle of a history restoration
    if (!project._isHistoryRestoration) {
      localStorage.setItem('canva-project', JSON.stringify(project));
    }
  }, [project]);

  // Validate project structure whenever pages change
  useEffect(() => {
    const hasInvalidPages = project.pages.some(page => !page.pageSettings || !page.elements);
    if (hasInvalidPages) {
      console.warn('Invalid page structure detected, fixing...');
      setProject(prev => ({
        ...prev,
        pages: ensurePageStructure(prev.pages)
      }));
    }
  }, [project.pages]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('canva-project');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration for old format
        if (parsed.pageSettings && parsed.elements) {
          const migratedProject = {
            pages: [{
              id: 1,
              pageSettings: parsed.pageSettings,
              elements: parsed.elements
            }],
            currentPage: 0
          };
          setProject(migratedProject);
        } else {
          // Ensure all pages have proper pageSettings
          const validatedProject = {
            ...parsed,
            pages: parsed.pages.map(page => ({
              ...page,
              pageSettings: page.pageSettings || DEFAULT_PAGE_SETTINGS,
              elements: page.elements || []
            }))
          };
          setProject(validatedProject);
        }
      } catch (e) {
        console.error('Error loading saved project:', e);
      }
    }
  }, []);

  const getCurrentPage = () => {
    const currentPage = project.pages[project.currentPage];
    if (!currentPage || !currentPage.pageSettings) {
      console.warn('Invalid current page structure detected, fixing...');
      // Fix the page structure
      const fixedPages = ensurePageStructure(project.pages);
      setProject(prev => ({
        ...prev,
        pages: fixedPages
      }));
      return null; // Return null until the structure is fixed
    }
    return currentPage;
  };

  // Utility function to ensure all pages have proper structure
  const ensurePageStructure = (pages) => {
    return pages.map(page => ({
      ...page,
      pageSettings: page.pageSettings || DEFAULT_PAGE_SETTINGS,
      elements: page.elements || []
    }));
  };

  // Function to validate and fix entire project structure
  const validateProjectStructure = () => {
    setProject(prev => ({
      ...prev,
      pages: ensurePageStructure(prev.pages)
    }));
  };

  // Getter for pages that ensures structure is valid
  const getValidatedPages = () => {
    const hasInvalidPages = project.pages.some(page => !page.pageSettings || !page.elements);
    if (hasInvalidPages) {
      console.warn('Invalid page structure detected, fixing...');
      const fixedPages = ensurePageStructure(project.pages);
      setProject(prev => ({
        ...prev,
        pages: fixedPages
      }));
      return fixedPages;
    }
    return project.pages;
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Optionally accepts an insertion index (insert after this index)
  const addPage = (onComplete, insertAfterIndexParam) => {
    if (project.pages.length >= 50) {
      alert('Maximum page limit reached. You can only have up to 50 pages.');
      return;
    }

    const newPage = {
      id: Date.now(),
      pageSettings: DEFAULT_PAGE_SETTINGS,
      elements: []
    };

    // Ensure the new page has proper structure
    const validatedNewPage = ensurePageStructure([newPage])[0];

    // Allow caller to specify the insertion base index; default to currentEditingPage
    let insertAfterIndex = currentEditingPage;
    if (typeof onComplete === 'number' && insertAfterIndexParam === undefined) {
      // Backward-compatible overload: addPage(insertAfterIndex)
      insertAfterIndex = onComplete;
      onComplete = undefined;
    } else if (typeof insertAfterIndexParam === 'number') {
      insertAfterIndex = insertAfterIndexParam;
    }
    const safeAfterIndex = Math.max(-1, Math.min(insertAfterIndex, project.pages.length - 1));
    const insertionIndex = safeAfterIndex + 1;
    setProject(prev => {
      const pagesBefore = prev.pages.slice(0, insertionIndex);
      const pagesAfter = prev.pages.slice(insertionIndex);
      const updatedPages = [...pagesBefore, validatedNewPage, ...pagesAfter];

      const newProject = {
        ...prev,
        pages: updatedPages,
        currentPage: insertionIndex
      };

      // Call onComplete with the updated project if provided
      if (onComplete) {
        setTimeout(() => onComplete(newProject), 0);
      }

      return newProject;
    });

    // Update currentEditingPage to the inserted page
    setTimeout(() => {
      setCurrentEditingPage(insertionIndex);
      setSelectedElement({ pageIndex: insertionIndex, elementId: null });
    }, 0);
  };

  const goToPage = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < project.pages.length) {
      // Validate page structure before navigation
      const targetPage = project.pages[pageIndex];
      if (!targetPage || !targetPage.pageSettings) {
        console.warn('Invalid page structure detected before navigation, fixing...');
        const fixedPages = ensurePageStructure(project.pages);
        setProject(prev => ({
          ...prev,
          pages: fixedPages
        }));
        return; // Exit early, the navigation will be retried on next render
      }

      setProject(prev => ({
        ...prev,
        currentPage: pageIndex
      }));
      setSelectedElement({ pageIndex: pageIndex, elementId: null });
    }
  };

  const deletePage = (pageIndex, onComplete) => {
    if (project.pages.length <= 1) {
      alert('Cannot delete the only page. At least one page must remain.');
      return;
    }

    // Validate page structure before deletion
    const hasInvalidPages = project.pages.some(page => !page.pageSettings);
    if (hasInvalidPages) {
      console.warn('Invalid page structure detected before deletion, fixing...');
      const fixedPages = ensurePageStructure(project.pages);
      setProject(prev => ({
        ...prev,
        pages: fixedPages
      }));
      return; // Exit early, the deletion will be retried on next render
    }

    // Calculate the new current page before the setProject call
    let newCurrentPage = project.currentPage;
    if (pageIndex <= project.currentPage) {
      newCurrentPage = Math.max(0, project.currentPage - 1);
    }

    setProject(prev => {
      const newPages = prev.pages.filter((_, index) => index !== pageIndex);

      const newProject = {
        ...prev,
        pages: newPages,
        currentPage: newCurrentPage
      };

      // Call onComplete with the updated project if provided
      if (onComplete) {
        setTimeout(() => onComplete(newProject), 0);
      }

      return newProject;
    });

    // Update currentEditingPage to match the new current page
    setCurrentEditingPage(prev => {
      if (pageIndex <= prev) {
        return Math.max(0, prev - 1);
      }
      return prev;
    });

    // Clear selected element and set to the new current page
    setSelectedElement({ pageIndex: newCurrentPage, elementId: null });
  };

  const clearCurrentPage = (onComplete) => {
    setProject(prev => {
      const currentPage = prev.pages[prev.currentPage];
      if (!currentPage || !currentPage.pageSettings) {
        // Fix the page structure first
        const fixedPages = ensurePageStructure(prev.pages);
        const newProject = {
          ...prev,
          pages: fixedPages
        };

        if (onComplete) {
          onComplete(newProject);
        }

        return newProject;
      }

      const newProject = {
        ...prev,
        pages: prev.pages.map((page, index) =>
          index === currentEditingPage
            ? { ...page, elements: [] }
            : page
        )
      };

      // Call onComplete with the updated project if provided
      if (onComplete) {
        setTimeout(() => onComplete(newProject), 0);
      }

      return newProject;
    });
    setSelectedElement({ pageIndex: prev.currentPage, elementId: null });
  };

  const clearAllPages = (onComplete) => {
    setProject(prev => {
      const newProject = {
        pages: ensurePageStructure([{
          id: 1,
          pageSettings: DEFAULT_PAGE_SETTINGS,
          elements: []
        }]),
        currentPage: 0
      };

      // Call onComplete with the updated project if provided
      if (onComplete) {
        setTimeout(() => onComplete(newProject), 0);
      }

      return newProject;
    });
    setSelectedElement({ pageIndex: 0, elementId: null });
  };

  const setBackground = (type, value, onComplete) => {
    // console.log("Current editing page in setBackground:", currentEditingPage);
    setProject(prev => {
      const currentPage = prev.pages[prev.currentPage];
      // console.log("Current page in setBackground:", currentPage);
      if (!currentPage || !currentPage.pageSettings) {
        console.error('Page or pageSettings not found in setBackground');
        // Fix the page structure first
        const fixedPages = ensurePageStructure(prev.pages);
        // console.log("Fixed pages in setBackground:", fixedPages);
        const newProject = {
          ...prev,
          pages: fixedPages
        };

        // Now set the background on the fixed page
        const updatedProject = {
          ...newProject,
          pages: newProject.pages.map((page, index) =>
            index === currentEditingPage
              ? {
                ...page,
                pageSettings: {
                  ...page.pageSettings,
                  background: { type, value }
                }
              }
              : page
          )
        };

        if (onComplete) {
          // console.log("Updated project in setBackground");
          onComplete(updatedProject);
        }

        return updatedProject;
      }

      const newProject = {
        ...prev,
        pages: prev.pages.map((page, index) =>
          index === currentEditingPage
            ? {
              ...page,
              pageSettings: {
                ...page.pageSettings,
                background: { type, value }
              }
            }
            : page
        )
      };

      // Provide the updated project to a callback for history saving, similar to other actions
      if (onComplete) {
        // console.log("Updated project in setBackground");
        onComplete(newProject);
      }

      return newProject;
    });
    // console.log("Project:", project);
  };

  const duplicatePage = (pageIndex, onComplete) => {
    if (project.pages.length >= 50) {
      alert('Maximum page limit reached. You can only have up to 50 pages.');
      return;
    }

    const pageToDuplicate = project.pages[pageIndex];
    if (!pageToDuplicate) {
      console.error('Page to duplicate not found');
      return;
    }

    if (!pageToDuplicate.pageSettings) {
      console.error('Page settings not found for page to duplicate');
      // Fix the page structure first
      const fixedPages = ensurePageStructure(project.pages);
      setProject(prev => ({
        ...prev,
        pages: fixedPages
      }));
      return; // Exit early, the duplicate will be retried on next render
    }

    // Create a deep copy of the page with new IDs for all elements
    const duplicatedPage = {
      ...pageToDuplicate,
      id: Date.now(),
      elements: pageToDuplicate.elements.map(element => ({
        ...element,
        id: generateId()
      }))
    };

    // Insert the duplicated page right after the original page
    const insertionIndex = pageIndex + 1;
    setProject(prev => {
      const pagesBefore = prev.pages.slice(0, insertionIndex);
      const pagesAfter = prev.pages.slice(insertionIndex);
      const updatedPages = [...pagesBefore, duplicatedPage, ...pagesAfter];

      const newProject = {
        ...prev,
        pages: updatedPages,
        currentPage: insertionIndex
      };

      // Call onComplete with the updated project if provided
      if (onComplete) {
        setTimeout(() => onComplete(newProject), 0);
      }

      return newProject;
    });

    // Update currentEditingPage to the duplicated page
    setTimeout(() => {
      setCurrentEditingPage(insertionIndex);
      setSelectedElement({ pageIndex: insertionIndex, elementId: null });
    }, 0);
  };

  const reorderPages = (fromIndex, toIndex, onComplete) => {
    if (fromIndex === toIndex) return;

    // Validate page structure before reordering
    const hasInvalidPages = project.pages.some(page => !page.pageSettings);
    if (hasInvalidPages) {
      console.warn('Invalid page structure detected before reordering, fixing...');
      const fixedPages = ensurePageStructure(project.pages);
      setProject(prev => ({
        ...prev,
        pages: fixedPages
      }));
      return; // Exit early, the reorder will be retried on next render
    }

    // Calculate new currentEditingPage before the setProject call
    let newCurrentEditingPage = currentEditingPage;
    if (fromIndex === currentEditingPage) {
      newCurrentEditingPage = toIndex;
    } else if (fromIndex < currentEditingPage && toIndex >= currentEditingPage) {
      newCurrentEditingPage = currentEditingPage - 1;
    } else if (fromIndex > currentEditingPage && toIndex <= currentEditingPage) {
      newCurrentEditingPage = currentEditingPage + 1;
    }

    setProject(prev => {
      const newPages = [...prev.pages];
      const [movedPage] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, movedPage);

      // Update currentPage if it was affected
      let newCurrentPage = prev.currentPage;
      if (fromIndex === prev.currentPage) {
        newCurrentPage = toIndex;
      } else if (fromIndex < prev.currentPage && toIndex >= prev.currentPage) {
        newCurrentPage = prev.currentPage - 1;
      } else if (fromIndex > prev.currentPage && toIndex <= prev.currentPage) {
        newCurrentPage = prev.currentPage + 1;
      }

      const newProject = {
        ...prev,
        pages: newPages,
        currentPage: newCurrentPage
      };

      // Call onComplete with the updated project if provided
      if (onComplete) {
        setTimeout(() => onComplete(newProject), 0);
      }

      return newProject;
    });

    // Update currentEditingPage
    setTimeout(() => {
      setCurrentEditingPage(newCurrentEditingPage);
    }, 0);
  };

  return {
    project,
    setProject,
    selectedElement,
    setSelectedElement: safeSetSelectedElement,
    currentEditingPage,
    setCurrentEditingPage,
    getCurrentPage,
    generateId,
    addPage,
    goToPage,
    deletePage,
    duplicatePage,
    reorderPages,
    clearCurrentPage,
    clearAllPages,
    setBackground,
    validateProjectStructure,
    getValidatedPages
  };
};