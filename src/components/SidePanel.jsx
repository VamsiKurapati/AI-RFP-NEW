import React from 'react';
import designIcon from './icons/design.svg';
import elementsIcon from './icons/elements.svg';
import textIcon from './icons/text.svg';
import uploadsIcon from './icons/uploads.svg';
import toolsIcon from './icons/tools.svg';
import projectsIcon from './icons/projects.svg';
import propertiesIcon from './icons/properties.svg';

const SidePanel = ({
  onDesignClick,
  onElementsClick,
  onTextClick,
  onHistoryClick,
  onUploadsClick,
  onToolsClick,
  onProjectsClick,
  onPropertiesClick,
  onBackgroundClick,
  onLayoutTemplateClick,
  onColorPickerClick,
  onGradientClick,
  onResetBackgroundClick,
  showDesignPanel,
  showElementsPanel,
  showTextPanel,
  showHistoryPanel,
  showUploadsPanel,
  showToolsPanel,
  showProjectsPanel,
  showPropertiesPanel
}) => {
  return (
    <div className="w-[70px] min-w-[70px] max-w-[70px] bg-white border-r flex flex-col items-center shadow-md sidebar-panel">
      {/* Design Button */}
      <div className="mb-[3px] w-full">
        <button
          className={`flex flex-col items-center group w-full justify-center transition-colors ${showDesignPanel ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
          style={{ height: 74 }}
          onClick={() => onDesignClick()}
        >
          <img src={designIcon} alt="Design" className="w-7 h-7 mb-1" />
          <span className={`text-xs font-medium ${showDesignPanel ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
            }`}>Design</span>
        </button>
      </div>

      <button
        className={`mb-[3px] flex flex-col items-center group w-full justify-center transition-colors ${showElementsPanel ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          }`}
        style={{ height: 74 }}
        onClick={onElementsClick}
      >
        <img src={elementsIcon} alt="Elements" className="w-7 h-7 mb-1" />
        <span className={`text-xs font-medium ${showElementsPanel ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
          }`}>Elements</span>
      </button>
      <button
        className={`mb-[3px] flex flex-col items-center group w-full justify-center transition-colors ${showTextPanel ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          }`}
        style={{ height: 74 }}
        onClick={onTextClick}
      >
        <img src={textIcon} alt="Text" className="w-7 h-7 mb-1" />
        <span className={`text-xs font-medium ${showTextPanel ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
          }`}>Text</span>
      </button>
      <button
        className={`mb-[3px] flex flex-col items-center group w-full justify-center transition-colors ${showHistoryPanel ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          }`}
        style={{ height: 74 }}
        onClick={onHistoryClick}
      >
        <svg className="w-7 h-7 mb-1 text-gray-700 group-hover:text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <span className={`text-xs font-medium ${showHistoryPanel ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
          }`}>History</span>
      </button>
      <button
        className={`mb-[3px] flex flex-col items-center group w-full justify-center transition-colors ${showUploadsPanel ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          }`}
        style={{ height: 74 }}
        onClick={onUploadsClick}
      >
        <img src={uploadsIcon} alt="Uploads" className="w-7 h-7 mb-1" />
        <span className={`text-xs font-medium ${showUploadsPanel ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
          }`}>Uploads</span>
      </button>
      <button
        className={`mb-[3px] flex flex-col items-center group w-full justify-center transition-colors ${showToolsPanel ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          }`}
        style={{ height: 74 }}
        onClick={onToolsClick}
      >
        <img src={toolsIcon} alt="Tools" className="w-7 h-7 mb-1" />
        <span className={`text-xs font-medium ${showToolsPanel ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
          }`}>Tools</span>
      </button>
      {/* <button
        className={`mb-[3px] flex flex-col items-center group w-full justify-center transition-colors ${showProjectsPanel ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          }`}
        style={{ height: 74 }}
        onClick={onProjectsClick}
      >
        <img src={projectsIcon} alt="Projects" className="w-7 h-7 mb-1" />
        <span className={`text-xs font-medium ${showProjectsPanel ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
          }`}>Projects</span>
      </button> */}
      <button
        className={`mb-[3px] flex flex-col items-center group w-full justify-center transition-colors ${showPropertiesPanel ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          }`}
        style={{ height: 74 }}
        onClick={onPropertiesClick}
      >
        <img src={propertiesIcon} alt="Properties" className="w-7 h-7 mb-1" />
        <span className={`text-xs font-medium ${showPropertiesPanel ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
          }`}>Properties</span>
      </button>
    </div>
  );
};

export default SidePanel; 