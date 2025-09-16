import React, { useState, useCallback } from 'react';

const TextPanel = ({
  show,
  onClose,
  addTextElement,
  addCustomTextElement,
  currentPage,
  totalPages,
  project,
  updateElement,
  deleteElement
}) => {
  const [selectedFormat, setSelectedFormat] = useState('Page + number');
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);

  const getPageNumberText = useCallback((pageIndex) => {
    switch (selectedFormat) {
      case 'Numbers only':
        return `${pageIndex + 1}`;
      case 'Page + number':
        return `Page ${pageIndex + 1}`;
      case 'Page X of Y':
        return `Page ${pageIndex + 1} of ${totalPages}`;
      default:
        return `Page ${pageIndex + 1}`;
    }
  }, [selectedFormat, totalPages]);



  if (!show) return null;

  const formatOptions = [
    { label: 'Numbers only', example: 'E.g. 1' },
    { label: 'Page + number', example: 'E.g. Page 1' },
    { label: 'Page X of Y', example: 'E.g. Page 1 of 10' }
  ];

  const addHeading = () => {
    // Create a custom text element with heading properties
    const headingElement = {
      type: 'text',
      x: 100,
      y: 330,
      width: 450,
      height: 70, // Preset height for heading
      rotation: 0,
      properties: {
        text: 'Add a heading...',
        fontSize: 55,
        fontFamily: 'Arial',
        color: '#000000',
        bold: true,
        italic: false,
        underline: false,
        textAlign: 'left',
        listStyle: 'none',
        lineHeight: 1.2,
        letterSpacing: 0
      }
    };

    // Call the custom text element function
    addCustomTextElement(headingElement);
  };

  const addSubheading = () => {
    // Create a custom text element with subheading properties
    const subheadingElement = {
      type: 'text',
      x: 100,
      y: 400,
      width: 350,
      height: 40, // Preset height for subheading
      rotation: 0,
      properties: {
        text: 'Add a subheading...',
        fontSize: 35, // Medium font size for subheading
        fontFamily: 'Arial',
        color: '#000000',
        bold: true,
        italic: false,
        underline: false,
        textAlign: 'left',
        listStyle: 'none',
        lineHeight: 1.2,
        letterSpacing: 0
      }
    };

    addCustomTextElement(subheadingElement);
  };

  const addBodyText = () => {
    // Create a custom text element with body text properties
    const bodyElement = {
      type: 'text',
      x: 100,
      y: 460,
      width: 375,
      height: 180, // Preset height for body text
      rotation: 0,
      properties: {
        text: 'Add a little bit of body text...',
        fontSize: 18, // Regular font size for body text
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

    addCustomTextElement(bodyElement);
  };

  const addPageNumber = () => {
    const pageNumberText = getPageNumberText(currentPage);

    const pageNumberElement = {
      type: 'text',
      x: 660,
      y: 40,
      width: Math.min(100, project.pages[currentPage].pageSettings.width),
      height: Math.min(40, project.pages[currentPage].pageSettings.height),
      rotation: 0,
      properties: {
        text: pageNumberText,
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
        // Removed special pageNumber properties to make it a normal text element
      }
    };

    addCustomTextElement(pageNumberElement);
  };

  return (
    <div className="fixed left-[70px] top-16 w-80 bg-white border-r border-gray-200 shadow-lg overflow-y-auto z-20 sidebar-panel mb-16 max-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Text Logo */}
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Text</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {/* Text Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">Text Elements</span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Headings & Body
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Add text elements and page numbers to your design
          </p>
        </div>

        <div className="space-y-6">
          {/* Add Text Box */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Text Elements</label>
            <div className="space-y-3">
              <button
                onClick={addTextElement}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Add Text Box
              </button>
            </div>
          </div>

          {/* Default text styles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Default text styles</label>
            <div className="space-y-3">
              <button
                onClick={addHeading}
                className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-lg font-bold text-gray-900">Add a heading</div>
              </button>
              <button
                onClick={addSubheading}
                className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-base font-bold text-gray-900">Add a subheading</div>
              </button>
              <button
                onClick={addBodyText}
                className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-sm text-gray-900">Add a little bit of body text</div>
              </button>
            </div>
          </div>

          {/* Page Numbers Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Page Numbers</label>

            {/* Format Selection */}
            <div className="mb-4">
              <div className="relative">
                <button
                  onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                  className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <span>{selectedFormat}</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showFormatDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {formatOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedFormat(option.label);
                          setShowFormatDropdown(false);
                        }}
                        className={`w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between ${selectedFormat === option.label ? 'bg-gray-100' : ''
                          } ${index === 0 ? 'rounded-t-lg' : ''} ${index === formatOptions.length - 1 ? 'rounded-b-lg' : ''}`}
                      >
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.example}</div>
                        </div>
                        {selectedFormat === option.label && (
                          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Add Page Number Button */}
            <div>
              <button
                onClick={addPageNumber}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Add Page Number Text
              </button>
              <div className="text-xs text-gray-500 mt-2">
                Adds a text element with the current page number. You can edit it like any other text element.
              </div>
            </div>
          </div>




        </div>
      </div>
    </div>
  );
};

export default TextPanel; 