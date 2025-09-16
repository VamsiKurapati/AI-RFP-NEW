import React from 'react';

const GridTextElement = ({ element }) => {
  // For grid view, we want smaller, more readable text
  const textStyle = {
    fontSize: `${Math.max(8, element.properties.fontSize * 0.2)}px`, // Minimum 8px, scale down by 0.2
    fontFamily: element.properties.fontFamily,
    color: element.properties.color,
    fontWeight: element.properties.bold ? 'bold' : 'normal',
    fontStyle: element.properties.italic ? 'italic' : 'normal',
    textAlign: element.properties.textAlign,
    textDecoration: element.properties.underline ? 'underline' : 'none',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    lineHeight: Math.max(1.1, (element.properties.lineHeight || 1.2) * 0.8), // Scale down line height
    letterSpacing: (element.properties.letterSpacing || 0) + 'px',
    overflow: 'hidden', // Prevent text overflow
  };

  // Helper to render bullet list
  const renderBulletList = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return (
      <ul style={{
        margin: 0,
        paddingLeft: '0.8em', // Smaller padding for grid view
        width: '100%',
        color: element.properties.color,
        listStyleType: 'disc',
        listStylePosition: 'inside',
        fontSize: textStyle.fontSize,
      }}>
        {lines.map((line, idx) => (
          <li key={idx} style={{
            textAlign: element.properties.textAlign,
            color: element.properties.color,
            fontSize: textStyle.fontSize,
            lineHeight: textStyle.lineHeight
          }}>
            {line}
          </li>
        ))}
      </ul>
    );
  };

  const isPageNumber = element.properties?.elementType === 'pageNumber';

  return (
    <div
      className={`w-full h-full relative ${isPageNumber ? 'page-number-element' : ''}`}
      style={textStyle}
    >
      {isPageNumber && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          #
        </div>
      )}
      {element.properties.listStyle === 'bullet' ? (
        <div className="w-full h-full overflow-hidden">
          {renderBulletList(element.properties.text)}
        </div>
      ) : (
        <div
          className="w-full h-full overflow-hidden"
          style={textStyle}
          dangerouslySetInnerHTML={{ __html: element.properties.text.replace(/\n/g, '<br>') }}
        />
      )}
    </div>
  );
};

export default GridTextElement; 