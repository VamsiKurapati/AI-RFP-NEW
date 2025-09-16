import React from 'react';
import helpIcon from './icons/help.svg';
import fullscreenIcon from './icons/fullscreen.svg';
import gridIcon from './icons/grid.svg';
import './Footer.css';

const Footer = ({
  onHelpClick,
  onFullscreenClick,
  onGridClick,
  currentPage = 1,
  totalPages = 1,
  zoom = 100,
  onZoomChange,
  isGridView = false
}) => {
  return (
    <div className="h-8 bg-white border-t border-gray-200 shadow-sm flex items-center justify-end px-4 space-x-4">
      {/* Zoom slider */}
      <div className="flex items-center space-x-2">
        <input
          type="range"
          min="25"
          max="200"
          value={zoom}
          onChange={(e) => onZoomChange(parseInt(e.target.value))}
          className="w-48 footer-zoom-slider"
          style={{
            background: '#6b7280',
            height: '1px',
            borderRadius: '3px',
            border: '1px solid #4b5563'
          }}
        />
        <span className="text-sm text-gray-600 min-w-[3rem]">{zoom}%</span>
      </div>

      {/* Page number */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Pages</span>
        <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
        <span className="text-xs text-gray-400">(max 50)</span>
      </div>

      {/* Grid, Fullscreen, Help */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onGridClick}
          className={`p-2 rounded-md transition-colors ${isGridView
            ? 'bg-blue-100 text-blue-600'
            : 'hover:bg-gray-100 text-gray-600'
            }`}
          title={isGridView ? "Exit Grid View" : "Grid View"}
        >
          <img src={gridIcon} alt="Grid View" className="w-5 h-5" />
        </button>

        <button
          onClick={onFullscreenClick}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="Fullscreen"
        >
          <img src={fullscreenIcon} alt="Fullscreen" className="w-5 h-5 text-gray-600" />
        </button>

        <button
          onClick={onHelpClick}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="Help"
        >
          <img src={helpIcon} alt="Help" className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default Footer; 