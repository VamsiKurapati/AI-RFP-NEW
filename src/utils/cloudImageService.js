import axios from 'axios';
import Swal from 'sweetalert2';

// Cloud Image Service for handling image uploads and lazy loading
class CloudImageService {
  constructor() {
    // Use environment variables from .env file
    this.baseUrl = `${import.meta.env.VITE_API_BASE_URL}/image`;
    this.maxFileSize = 1024 * 1024; // 1MB
    this.maxImages = 15;
    this.uploadedImages = this.loadUploadedImages();
  }

  // Load uploaded images from localStorage
  loadUploadedImages() {
    try {
      const saved = localStorage.getItem('canva-cloud-images');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      // console.error('Error loading cloud images:', error);
      Swal.fire({
        title: 'Error loading cloud images:',
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      return [];
    }
  }

  // Save uploaded images to localStorage
  saveUploadedImages() {
    try {
      localStorage.setItem('canva-cloud-images', JSON.stringify(this.uploadedImages));
    } catch (error) {
      // console.error('Error saving cloud images:', error);
      Swal.fire({
        title: 'Error saving cloud images:',
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
    }
  }

  // Validate file before upload
  validateFile(file) {
    // Check file size (configurable from .env)
    const maxSizeMB = this.maxFileSize / (1024 * 1024);
    if (file.size > this.maxFileSize) {
      Swal.fire({
        title: `File size must be less than ${maxSizeMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      throw new Error(`File size must be less than ${maxSizeMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    // Check file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        title: 'Only PNG, JPG, JPEG, and SVG files are allowed.',
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      throw new Error('Only PNG, JPG, JPEG, and SVG files are allowed.');
    }

    if (this.uploadedImages.length >= this.maxImages) {
      Swal.fire({
        title: `Maximum ${this.maxImages} images allowed. Please delete some images first.`,
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      throw new Error(`Maximum ${this.maxImages} images allowed. Please delete some images first.`);
    }

    return true;
  }

  // Compress image if needed
  async compressImage(file) {
    return new Promise((resolve) => {
      if (file.size <= this.maxFileSize) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions to fit within 1MB
          let { width, height } = img;
          const maxDimension = 1200; // Max width/height

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          }, file.type, 0.8); // 80% quality
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Upload image to cloud
  async uploadImage(file) {
    try {
      // Validate file
      this.validateFile(file);

      // Compress if needed
      const processedFile = await this.compressImage(file);

      // Create form data
      const formData = new FormData();
      formData.append('image', processedFile);

      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Upload to cloud
      const response = await axios.post(`${this.baseUrl}/upload_image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Check response status
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = response.data;

      // Check for success based on your API response format
      if (!result.message || !result.message.includes('Image uploaded successfully')) {
        throw new Error(result.error || result.message || 'Upload failed');
      }

      // Add to local storage
      const imageData = {
        id: result.fileId,
        name: result.originalName || file.name,
        filename: result.filename,
        fileId: result.fileId,
        type: file.type,
        size: processedFile.size,
        cloudUrl: `${this.baseUrl}/get_image_by_id/${result.fileId}`,
        uploadedAt: new Date().toISOString()
      };

      this.uploadedImages.unshift(imageData);
      this.saveUploadedImages();

      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('cloudImagesUpdated', {
        detail: { action: 'uploaded', image: imageData }
      }));

      return imageData;
    } catch (error) {
      // console.error('Upload error:', error);
      Swal.fire({
        title: 'Upload error:',
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      throw error;
    }
  }

  async uploadTemplateImage(file) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${this.baseUrl}/upload_template_image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const result = response.data;

      if (!result.message || !result.message.includes('Image uploaded successfully')) {
        throw new Error(result.error || result.message || 'Upload failed');
      }

      const imageData = {
        id: result.fileId,
        name: result.originalName || file.name,
        filename: result.filename,
        fileId: result.fileId,
        type: file.type,
        size: file.size,
        cloudUrl: `${this.baseUrl}/get_template_image/${result.filename}`,
        uploadedAt: new Date().toISOString(),
        isTemplate: true,
        isDeletable: false
      };

      this.uploadedImages.unshift(imageData);
      this.saveUploadedImages();

      window.dispatchEvent(new CustomEvent('cloudImagesUpdated', {
        detail: { action: 'uploaded', image: imageData }
      }));

      return imageData;
    } catch (error) {
      // console.error('Upload template image error:', error);
      Swal.fire({
        title: 'Upload template image error:',
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      throw error;
    }
  }

  // Delete image from cloud
  async deleteImage(filename) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await axios.delete(`${this.baseUrl}/delete_image/${filename}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = response.data;

      // Remove from local storage
      this.uploadedImages = this.uploadedImages.filter(img =>
        img.filename !== filename && img.name !== filename
      );
      this.saveUploadedImages();

      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('cloudImagesUpdated', {
        detail: { action: 'deleted', filename }
      }));

      // Check if server deletion was successful
      if (response.status === 200 && result && result.message && result.message.includes('deleted successfully')) {
        return true;
      }

      throw new Error(result.message || 'Delete failed');

    } catch (error) {
      // console.error('Delete error:', error);
      Swal.fire({
        title: 'Delete error:',
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      throw error;
    }
  }

  // Get all uploaded images
  getUploadedImages() {
    return [...this.uploadedImages];
  }

  // Clear all uploaded images from local storage
  async clearUploadedImages() {
    try {
      const deletePromises = this.uploadedImages.map(img => this.deleteImage(img.filename || img.fileId));

      await Promise.allSettled(deletePromises);

      // Clear local storage
      this.uploadedImages = [];
      this.saveUploadedImages();

      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('cloudImagesUpdated', {
        detail: { action: 'cleared' }
      }));

    } catch (error) {
      console.error('Error clearing images:', error);
      Swal.fire({
        title: 'Error clearing images',
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
    }
  }

  // Check if image is cloud-based (uploaded images)
  isCloudImage(src) {
    return src && src.startsWith('cloud://');
  }

  // Check if image is a template image
  isTemplateImage(src) {
    return src && src.startsWith('template://');
  }

  // Get cloud URL for uploaded image (prefer ID-based URLs)
  getCloudUrl(src) {
    if (src.startsWith('cloud://')) {
      const imageName = src.replace('cloud://', '');
      // Try to find the image by name to get fileId
      const image = this.uploadedImages.find(img =>
        img.name === imageName || img.filename === imageName
      );
      if (image && image.fileId) {
        return `${this.baseUrl}/get_image_by_id/${image.fileId}`;
      }
      // Fallback to filename-based URL
      return `${this.baseUrl}/get_image/${imageName}`;
    }
    return src;
  }

  // Get template URL for template image
  getTemplateUrl(src) {
    if (src.startsWith('template://')) {
      const imageName = src.replace('template://', '');
      return `${this.baseUrl}/get_template_image/${imageName}`;
    }
    return src;
  }

  // Process image element for JSON export
  processImageForExport(element) {
    if (element.type === 'image' && element.properties.src) {
      const src = element.properties.src;

      // If it's a data URL, we need to upload it first
      if (src.startsWith('data:')) {
        // For now, keep data URLs in export (they'll be compressed)
        // In a real implementation, you'd upload them to cloud first
        return element;
      }

      // If it's already a cloud URL or template URL, keep it
      if (this.isCloudImage(src) || this.isTemplateImage(src)) {
        return element;
      }

      // For other URLs, keep as is
      return element;
    }
    return element;
  }

  // Get the actual fileId from cloud URL for export
  getCloudFileId(src) {
    if (src.startsWith('cloud://')) {
      const imageName = src.replace('cloud://', '');
      // Try to find the image by name to get fileId
      const image = this.uploadedImages.find(img =>
        img.name === imageName || img.filename === imageName
      );
      return image ? image.fileId : imageName;
    }
    return null;
  }

  // Process image element for JSON import
  processImageForImport(element) {
    if (element.type === 'image' && element.properties.src) {
      const src = element.properties.src;

      // If it's a cloud URL or template URL, keep it as is
      if (this.isCloudImage(src) || this.isTemplateImage(src)) {
        return element;
      }

      // For data URLs, keep them (they'll be loaded lazily)
      if (src.startsWith('data:')) {
        return element;
      }

      // For other URLs, keep as is
      return element;
    }
    return element;
  }

  // Extract images from JSON and add to uploads panel
  extractImagesFromJSON(project) {
    const extractedImages = [];
    const uniqueImageLinks = new Set(); // Track unique image links during extraction

    project.pages?.forEach((page, pageIndex) => {
      page.elements?.forEach((element, elementIndex) => {
        if (element.type === 'image' && element.properties?.src) {
          const src = element.properties.src;

          // Skip if this image link is already processed in this extraction
          if (uniqueImageLinks.has(src)) {
            return;
          }

          // Handle uploaded images (cloud://)
          if (this.isCloudImage(src)) {
            const filename = this.getCloudFilename(src);
            if (filename) {
              // Check if already exists in uploads
              const exists = this.uploadedImages.find(img =>
                img.filename === filename || img.name === filename
              );

              if (!exists) {
                uniqueImageLinks.add(src); // Mark as processed
                extractedImages.push({
                  id: Date.now() + Math.random(),
                  name: filename,
                  filename: filename,
                  fileId: filename, // Use filename as fileId for extracted images
                  type: 'image/png', // Default type
                  size: 1024 * 1024, // Default 1MB size for extracted images
                  cloudUrl: `${this.baseUrl}/get_image/${filename}`,
                  uploadedAt: new Date().toISOString(),
                  isFromJSON: true,
                  isDeletable: true
                });
              }
            }
          }

          // Handle template images (template://)
          else if (this.isTemplateImage(src)) {
            const templateName = src.replace('template://', '');

            // Check if already exists in uploads
            const exists = this.uploadedImages.find(img =>
              img.name === templateName && img.isTemplate
            );

            if (!exists) {
              uniqueImageLinks.add(src); // Mark as processed
              extractedImages.push({
                id: Date.now() + Math.random(),
                name: templateName,
                filename: templateName,
                fileId: templateName, // Use template name as fileId
                type: 'image/png', // Default type
                size: 1024 * 1024, // Default 1MB size for extracted images
                cloudUrl: `${this.baseUrl}/get_template_image/${templateName}`,
                uploadedAt: new Date().toISOString(),
                isFromJSON: true,
                isTemplate: true,
                isDeletable: false // Template images cannot be deleted
              });
            }
          }
        }
      });
    });

    // Add extracted images to uploads
    if (extractedImages.length > 0) {
      this.uploadedImages.unshift(...extractedImages);
      this.saveUploadedImages();

      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('cloudImagesUpdated', {
        detail: { action: 'extracted', count: extractedImages.length }
      }));
    }

    return extractedImages;
  }

  // Helper method to get filename from cloud URL (for backward compatibility)
  getCloudFilename(src) {
    if (src.startsWith('cloud://')) {
      return src.replace('cloud://', '');
    }
    return null;
  }
}

// Create singleton instance
const cloudImageService = new CloudImageService();

export default cloudImageService;