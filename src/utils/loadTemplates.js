// canva-app/src/utils/loadTemplates.js

import Swal from 'sweetalert2';

// Vite's import.meta.glob to import all SVGs in subfolders
async function importAll() {
  try {
    const modules = import.meta.glob('../components/design/**/*.svg', { eager: true });
    let files = {};

    Object.keys(modules).forEach((key) => {
      // key: '../components/design/Green Modern Project Proposal/Green Simple Company Project Proposal-1.svg'
      const match = key.match(/\.\.\/components\/design\/([^/]+)\/(.+\.svg)$/);
      if (match) {
        const folder = match[1];
        const filename = match[2];
        if (!files[folder]) files[folder] = [];
        files[folder].push({
          filename,
          url: modules[key].default || modules[key]
        });
      }
    });
    return files;
  } catch (error) {
    // console.error('Error importing SVG files:', error);
    Swal.fire({
      title: 'Error importing SVG files:',
      icon: 'warning',
      timer: 1500,
      showConfirmButton: false,
      showCancelButton: false,
    });
    return {};
  }
}

// This will import all SVGs in all subfolders of design/
let svgFiles = {};

// Initialize SVG files
(async () => {
  svgFiles = await importAll();
})();

export async function getTemplateSets() {
  // If svgFiles is not yet loaded, load it
  if (Object.keys(svgFiles).length === 0) {
    svgFiles = await importAll();
  }

  // sets: { folder: [filename, ...] }
  const sets = {};
  // svgPreviews: { folder: [svgUrl, ...] }
  const svgPreviews = {};

  Object.entries(svgFiles).forEach(([folder, files]) => {
    sets[folder] = files.map(f => f.filename);
    svgPreviews[folder] = files.map(f => f.url);
  });

  return { sets, svgPreviews };
} 