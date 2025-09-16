import React from 'react';
import { updateTextContent } from '../../../utils/text';

const TextElement = ({ element, isEditing, setIsEditing, updateElement, pageIndex, project }) => {
  const textStyle = {
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
  };

  // Helper to render bullet list
  const renderBulletList = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return (
      <ul style={{
        margin: 0,
        paddingLeft: '1.2em',
        width: '100%',
        color: element.properties.color,
        listStyleType: 'disc',
        listStylePosition: 'inside',
      }}>
        {lines.map((line, idx) => (
          <li key={idx} style={{ textAlign: element.properties.textAlign, color: element.properties.color }}>{line}</li>
        ))}
      </ul>
    );
  };

  // Helper function to handle text pasting with selection support
  const handlePaste = (textareaRef, clipboardText) => {
    if (!textareaRef.current || !clipboardText) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = element.properties.text;

    let newText;
    if (start !== end) {
      // Text is selected - replace selected text
      newText = currentText.substring(0, start) + clipboardText + currentText.substring(end);
    } else {
      // No text selected - insert at cursor position
      newText = currentText.substring(0, start) + clipboardText + currentText.substring(start);
    }

    // Update the text content
    updateTextContent(updateElement, project, pageIndex, element.id, newText);

    // Set cursor position after the pasted text
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = start + clipboardText.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  return (
    <div
      className="w-full h-full relative"
      style={textStyle}
      onDoubleClick={() => setIsEditing(element.id)}
    >
      {isEditing === element.id ? (
        <textarea
          ref={(el) => {
            // Store reference for paste handling
            if (el) el._textareaRef = { current: el };
          }}
          value={element.properties.text}
          onChange={(e) => updateTextContent(updateElement, project, pageIndex, element.id, e.target.value)}
          onBlur={() => setIsEditing(false)}
          onMouseDown={(e) => {
            // Prevent bubbling to parent draggable container while selecting text
            e.stopPropagation();
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.shiftKey) {
              return;
            }
            if (e.key === 'Escape') {
              setIsEditing(false);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
              e.preventDefault();
              // Handle paste in text element with selection support
              navigator.clipboard.readText().then(externalText => {
                if (externalText && externalText.trim()) {
                  const textareaRef = e.target._textareaRef;
                  handlePaste(textareaRef, externalText);
                }
              }).catch(() => {
                // If clipboard API fails, do nothing
              });
            }
          }}
          onPaste={(e) => {
            // Handle paste event for better compatibility
            e.preventDefault();
            const clipboardText = e.clipboardData.getData('text');
            if (clipboardText) {
              const textareaRef = e.target._textareaRef;
              handlePaste(textareaRef, clipboardText);
            }
          }}
          className="w-full h-full resize-none border-none outline-none bg-transparent"
          style={textStyle}
          autoFocus
        />
      ) : (
        element.properties.listStyle === 'bullet' ? (
          <div className="w-full h-full">
            {renderBulletList(element.properties.text)}
          </div>
        ) : (
          <div
            className="w-full h-full"
            style={textStyle}
            dangerouslySetInnerHTML={{ __html: element.properties.text.replace(/\n/g, '<br>') }}
          />
        )
      )}
    </div>
  );
};

export default TextElement;