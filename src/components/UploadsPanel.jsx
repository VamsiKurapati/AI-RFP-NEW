import React, { useState, useEffect, useRef } from 'react';
import cloudImageService from '../utils/cloudImageService';
import Swal from 'sweetalert2';

const UploadsPanel = ({ show, onClose, onImageSelect }) => {
  const [uploads, setUploads] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Load uploads from cloud service on component mount
  useEffect(() => {
    const loadUploads = async () => {
      try {
        const cloudUploads = cloudImageService.getUploadedImages();
        setUploads(cloudUploads);
      } catch (error) {
        // console.error('Error loading uploads:', error);
        setUploads([]);
      }
    };
    loadUploads();
  }, []);

  // Listen for uploads changes
  useEffect(() => {
    const handleStorageChange = () => {
      const cloudUploads = cloudImageService.getUploadedImages();
      setUploads(cloudUploads);
    };

    const handleCloudImagesUpdate = (event) => {
      const cloudUploads = cloudImageService.getUploadedImages();
      setUploads(cloudUploads);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cloudImagesUpdated', handleCloudImagesUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cloudImagesUpdated', handleCloudImagesUpdate);
    };
  }, []);

  const validateFile = (file) => {
    try {
      cloudImageService.validateFile(file);
      return true;
    } catch (error) {
      Swal.fire({
        title: error.message,
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      return false;
    }
  };

  const processFile = async (file) => {
    try {
      const upload = await cloudImageService.uploadImage(file);
      return upload;
    } catch (error) {
      throw error;
    }
  };

  const handleFileUpload = async (files) => {
    const fileArray = Array.from(files);

    if (fileArray.length === 0) return;

    setIsUploading(true);
    let uploadedCount = 0;
    let skippedCount = 0;

    try {
      // Process files sequentially to respect the upload limit
      for (const file of fileArray) {
        try {
          // Validate each file individually (this checks the current limit)
          if (validateFile(file)) {
            await processFile(file);
            uploadedCount++;
          } else {
            skippedCount++;
          }
        } catch (error) {
          // If it's a limit error, increment skipped count
          if (error.message && error.message.includes('Maximum')) {
            skippedCount++;
          } else {
            // For other errors, still increment skipped count
            skippedCount++;
            console.error('Upload error for file:', file.name, error);
          }
        }
      }

      // Refresh uploads from cloud service
      const cloudUploads = cloudImageService.getUploadedImages();
      setUploads(cloudUploads);

      // Show summary if some files were skipped
      if (skippedCount > 0) {
        Swal.fire({
          title: `Upload Complete`,
          html: `Successfully uploaded: ${uploadedCount} images<br/>Skipped: ${skippedCount} images`,
          icon: 'info',
          timer: 3000,
          showConfirmButton: false,
          showCancelButton: false,
        });
      }
    } catch (error) {
      // console.error('Error processing files:', error);
      Swal.fire({
        title: 'Error uploading files. Please try again.',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input value to allow re-uploading the same file
    event.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleImageClick = (upload) => {
    if (onImageSelect) {
      // Use the actual filename from the API response, or fall back to original name
      const filename = upload.filename || upload.name;

      // Use appropriate prefix based on image type
      const imageUrl = upload.isTemplate ? `template://${filename}` : `cloud://${filename}`;
      onImageSelect(imageUrl);
    }
  };

  const handleDeleteUpload = async (upload) => {
    // Don't allow deletion of template images
    if (upload.isTemplate) {
      Swal.fire({
        title: 'Template images cannot be deleted.',
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
      return;
    }

    try {
      await cloudImageService.deleteImage(upload.filename || upload.name);
      // Refresh uploads from cloud service
      const cloudUploads = cloudImageService.getUploadedImages();
      setUploads(cloudUploads);
    } catch (error) {
      // console.error('Error deleting upload:', error);
      // Even if there's an error, refresh the list
      const cloudUploads = cloudImageService.getUploadedImages();
      setUploads(cloudUploads);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!show) return null;

  return (
    <div className="fixed left-[70px] top-16 w-80 bg-white border-r border-gray-200 shadow-lg overflow-y-auto z-20 sidebar-panel mb-16 max-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Uploads</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {/* Upload Area */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${isDragging
              ? 'border-blue-500 bg-blue-100'
              : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <svg className="w-8 h-8 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop images here, or
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              browse files
            </button>
            <p className="text-xs text-gray-500 mt-2">
              PNG, JPG, JPEG, SVG • Max {process.env.REACT_APP_MAX_IMAGES || 15} images
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Uploads List */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Uploaded Images ({uploads.length})
          </h4>

          {uploads.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">No uploads yet</p>
              <p className="text-xs text-gray-400">Upload images to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className={`border rounded-lg p-3 transition-colors hover:bg-gray-50`}
                >
                  <div className="flex items-start gap-3">
                    {/* Image Preview */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 border rounded overflow-hidden bg-gray-100">
                        {upload.type === 'image/svg+xml' ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <img
                            src={upload.cloudUrl || upload.dataUrl}
                            alt={upload.name}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => handleImageClick(upload)}
                          />
                        )}
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-800 truncate">
                          {upload.name}
                        </h3>
                        <button
                          onClick={() => handleDeleteUpload(upload)}
                          className={`transition-colors ${upload.isTemplate
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-400 hover:text-red-500'
                            }`}
                          title={upload.isTemplate ? 'Template images cannot be deleted' : 'Delete image'}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {formatDate(upload.uploadedAt)}
                      </p>
                      <button
                        onClick={() => handleImageClick(upload)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Use in canvas
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t pt-4 mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Actions</h4>
          <div className="space-y-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`w-full px-4 py-3 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${isUploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
                }`}
            >
              {isUploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Images
                </>
              )}
            </button>
            <button
              onClick={async () => {
                if (uploads.length > 0) {
                  const result = await Swal.fire({
                    title: 'Are you sure you want to clear all uploads?',
                    icon: 'warning',
                    showConfirmButton: true,
                    showCancelButton: true,
                  });
                  if (result.isConfirmed) {
                    cloudImageService.clearUploadedImages();
                    setUploads([]);
                  }
                } else {
                  const result = await Swal.fire({
                    title: 'No uploads to clear',
                    icon: 'warning',
                    timer: 1500,
                    showConfirmButton: false,
                    showCancelButton: false,
                  });
                  // no action
                }
              }}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadsPanel; 