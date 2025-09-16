import React from 'react';

const CanvasArea = ({
  project,
  currentEditingPage,
  canvasRefs,
  scrollContainerRef,
  zoom,
  handleMouseDown,
  handleResizeMouseDown,
  selectedElement,
  setSelectedElement,
  setCurrentEditingPage,
  getCurrentPage,
  getSelectedElement,
  isEditing,
  setIsEditing,
  updateElement,
  deleteElement,
  duplicateElement,
  handleZoomChange,
  scrollToPage,
  TOOLBAR_HEIGHT,
  ...rest
}) => {
  const currentPage = getCurrentPage();
  const selectedEl = getSelectedElement();

  return (
    <div ref={scrollContainerRef} className="h-[calc(100vh-4rem)] overflow-hidden bg-gray-200 relative" style={{ overscrollBehavior: 'contain' }}>
      <div className="flex flex-col items-center w-full bg-gray-200" style={{ minHeight: '100%' }}>
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s',
            width: 'fit-content',
          }}
        >
          {project.pages.map((page, pageIndex) => (
            <div
              key={page.id}
              ref={el => canvasRefs.current[pageIndex] = el}
              className={`mx-auto mb-12 relative shadow-lg bg-white transition-all duration-200 ${currentEditingPage === pageIndex ? 'border-4 border-blue-500' : 'border-2 border-gray-300'}`}
              style={{
                width: `${page.pageSettings.width}px`,
                height: `${page.pageSettings.height}px`,
                backgroundColor: page.pageSettings.background.type === 'color'
                  ? page.pageSettings.background.value
                  : '#ffffff',
                backgroundImage: page.pageSettings.background.type === 'gradient'
                  ? page.pageSettings.background.value
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                boxSizing: 'border-box',
              }}
              onClick={e => {
                if (e.target === e.currentTarget) {
                  setSelectedElement({ pageIndex: 0, elementId: null });
                }
                setCurrentEditingPage(pageIndex);
              }}
            >
              {/* SVG Background Layer */}
              {page.pageSettings.background.type === 'svg' && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ width: '100%', height: '100%', zIndex: 0 }}
                  dangerouslySetInnerHTML={{ __html: page.pageSettings.background.value }}
                />
              )}
              {/* Render elements */}
              <>
                {page.elements.map((element) => (
                  <div
                    key={element.id}
                    className="element absolute cursor-move"
                    style={{
                      left: `${element.x}px`,
                      top: `${element.y}px`,
                      width: `${element.width}px`,
                      height: `${element.height}px`,
                      transform: `rotate(${element.rotation}deg)`
                    }}
                    onMouseDown={(e) => handleMouseDown(e, pageIndex, element.id)}
                  >
                    {element.type === 'text' && (
                      <div
                        className="w-full h-full"
                        style={{
                          fontSize: `${element.properties.fontSize}px`,
                          fontFamily: element.properties.fontFamily,
                          color: element.properties.color,
                          fontWeight: element.properties.bold ? 'bold' : 'normal',
                          fontStyle: element.properties.italic ? 'italic' : 'normal',
                          textAlign: element.properties.textAlign,
                          textDecoration: element.properties.underline ? 'underline' : 'none',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          lineHeight: element.properties.lineHeight || 1.2,
                          letterSpacing: (element.properties.letterSpacing || 0) + 'px',
                        }}
                        onDoubleClick={() => setIsEditing(element.id)}
                      >
                        {isEditing === element.id ? (
                          <textarea
                            value={element.properties.text}
                            onChange={(e) => updateElement(pageIndex, element.id, {
                              properties: { ...element.properties, text: e.target.value }
                            })}
                            onBlur={() => setIsEditing(false)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.shiftKey) {
                                return;
                              }
                              if (e.key === 'Escape') {
                                setIsEditing(false);
                              }
                            }}
                            className="w-full h-full resize-none border-none outline-none bg-transparent"
                            style={{
                              fontSize: `${element.properties.fontSize}px`,
                              fontFamily: element.properties.fontFamily,
                              color: element.properties.color,
                              fontWeight: element.properties.bold ? 'bold' : 'normal',
                              fontStyle: element.properties.italic ? 'italic' : 'normal',
                              textAlign: element.properties.textAlign
                            }}
                            autoFocus
                          />
                        ) : (
                          element.properties.listStyle === 'bullet' ? (
                            <div className="w-full h-full">
                              <ul style={{
                                margin: 0,
                                paddingLeft: '1.2em',
                                width: '100%',
                                color: element.properties.color,
                                listStyleType: 'disc',
                                listStylePosition: 'inside',
                                fontSize: `${element.properties.fontSize}px`,
                                fontFamily: element.properties.fontFamily,
                                fontWeight: element.properties.bold ? 'bold' : 'normal',
                                fontStyle: element.properties.italic ? 'italic' : 'normal',
                                textAlign: element.properties.textAlign,
                                textDecoration: element.properties.underline ? 'underline' : 'none',
                                lineHeight: element.properties.lineHeight || 1.2,
                                letterSpacing: (element.properties.letterSpacing || 0) + 'px',
                              }}>
                                {element.properties.text.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                                  <li key={idx} style={{ textAlign: element.properties.textAlign, color: element.properties.color }}>{line}</li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{
                                fontSize: `${element.properties.fontSize}px`,
                                fontFamily: element.properties.fontFamily,
                                color: element.properties.color,
                                fontWeight: element.properties.bold ? 'bold' : 'normal',
                                fontStyle: element.properties.italic ? 'italic' : 'normal',
                                textAlign: element.properties.textAlign,
                                textDecoration: element.properties.underline ? 'underline' : 'none',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                lineHeight: element.properties.lineHeight || 1.2,
                                letterSpacing: (element.properties.letterSpacing || 0) + 'px',
                              }}
                              dangerouslySetInnerHTML={{ __html: element.properties.text.replace(/\n/g, '<br>') }}
                            />
                          )
                        )}
                      </div>
                    )}
                    {element.type === 'image' && (
                      <img
                        src={element.properties.src}
                        alt=""
                        className="w-full h-full"
                        style={{
                          objectFit: element.properties.fit === 'stretch' ? 'fill' : element.properties.fit
                        }}
                        draggable={false}
                      />
                    )}
                    {element.type === 'svg' && element.properties?.svgContent && (
                      <div
                        className="w-full h-full"
                        dangerouslySetInnerHTML={{ __html: element.properties.svgContent }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    )}
                    {/* Render shape elements (copy the shape rendering logic from App.js) */}
                    {/* ... shape rendering logic ... */}
                    {/* Selection outline and resize handles (copy from App.js) */}
                  </div>
                ))}
              </>
            </div>
          ))}
        </div>
        {/* Footer/Zoom controls and navigation bar can be moved here if desired */}
      </div>
    </div>
  );
};

export default CanvasArea; 