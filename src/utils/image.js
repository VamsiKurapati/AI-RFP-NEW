// Image-related utility functions

export function handleImageUpload(event, addImageElement) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      addImageElement(e.target.result);
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  }
}

export function addImageElement(project, setProject, currentEditingPage, src) {
  const page = project.pages[currentEditingPage];
  const newElement = {
    id: Math.random().toString(36).substr(2, 9),
    type: 'image',
    x: 150,
    y: 150,
    width: Math.min(200, page.pageSettings.width),
    height: Math.min(200, page.pageSettings.height),
    rotation: 0,
    zIndex: page.elements.length + 1,
    properties: {
      src: src,
      fit: 'contain'
    }
  };
  setProject(prev => ({
    ...prev,
    pages: prev.pages.map((p, idx) =>
      idx === currentEditingPage
        ? { ...p, elements: [...p.elements, newElement] }
        : p
    )
  }));
} 