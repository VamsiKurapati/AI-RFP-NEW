import React, { useState } from 'react';
import exportIcon from './icons/export.svg';
import importIcon from './icons/import.svg';
import accountIcon from './icons/account.svg';
import historyIcon from './icons/history.svg';
import settingsIcon from './icons/settings.svg';
import undoIcon from './icons/undo.svg';
import redoIcon from './icons/redo.svg';

const TopRightPanel = ({
  onExportJSON,
  onExportPDF,
  onExportSVG,
  onImportJSON,
  onShowHistory,
  onShowAccount,
  onShowSettings,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  return (
    <div className="fixed top-0 right-0 h-12 bg-white border-b border-gray-200 shadow-sm z-30 flex items-center px-3 gap-1 top-right-panel">
      {/* Undo Button */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${canUndo
            ? 'text-gray-700 hover:bg-gray-100'
            : 'text-gray-400 cursor-not-allowed'
          }`}
        title="Undo (Ctrl+Z)"
      >
        <img src={undoIcon} alt="Undo" className="w-4 h-4" />
        <span className="text-xs font-medium">Undo</span>
      </button>

      {/* Redo Button */}
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${canRedo
            ? 'text-gray-700 hover:bg-gray-100'
            : 'text-gray-400 cursor-not-allowed'
          }`}
        title="Redo (Ctrl+Y)"
      >
        <img src={redoIcon} alt="Redo" className="w-4 h-4" />
        <span className="text-xs font-medium">Redo</span>
      </button>

      {/* Import Button */}
      <button
        onClick={onImportJSON}
        className="flex items-center gap-1 px-2 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors"
        title="Import Project"
      >
        <img src={importIcon} alt="Import" className="w-4 h-4" />
        <span className="text-xs font-medium">Import</span>
      </button>

      {/* Export Button */}
      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="flex items-center gap-1 px-2 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          <img src={exportIcon} alt="Export" className="w-4 h-4" />
          <span className="text-xs font-medium">Export</span>
        </button>

        {showExportMenu && (
          <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div className="py-1">
              <button
                onClick={() => {
                  onExportJSON();
                  setShowExportMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <span className="text-blue-600 font-medium">JSON</span>
                <span className="text-xs text-gray-500">Project file</span>
              </button>
              <button
                onClick={() => {
                  onExportPDF();
                  setShowExportMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <span className="text-red-600 font-medium">PDF</span>
                <span className="text-xs text-gray-500">Document</span>
              </button>
              <button
                onClick={() => {
                  onExportSVG();
                  setShowExportMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <span className="text-green-600 font-medium">SVG</span>
                <span className="text-xs text-gray-500">Optimized vector</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History Button */}
      <button
        onClick={onShowHistory}
        className="flex items-center gap-1 px-2 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors"
        title="History"
      >
        <img src={historyIcon} alt="History" className="w-4 h-4" />
        <span className="text-xs font-medium">History</span>
      </button>

      {/* Account Button */}
      <div className="relative">
        <button
          onClick={() => setShowAccountMenu(!showAccountMenu)}
          className="flex items-center gap-1 px-2 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          <img src={accountIcon} alt="Account" className="w-4 h-4" />
          <span className="text-xs font-medium">Account</span>
        </button>

        {showAccountMenu && (
          <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div className="py-1">
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="text-sm font-medium text-gray-900">John Doe</div>
                <div className="text-xs text-gray-500">john.doe@example.com</div>
              </div>
              <button
                onClick={() => {
                  onShowAccount();
                  setShowAccountMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile Settings
              </button>
              <button
                onClick={() => {
                  onShowSettings();
                  setShowAccountMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <img src={settingsIcon} alt="Settings" className="w-4 h-4" />
                Settings
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => {
                  alert('Logout functionality coming soon!');
                  setShowAccountMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Close dropdowns when clicking outside */}
      {showExportMenu || showAccountMenu ? (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowExportMenu(false);
            setShowAccountMenu(false);
          }}
        />
      ) : null}
    </div>
  );
};

export default TopRightPanel; 