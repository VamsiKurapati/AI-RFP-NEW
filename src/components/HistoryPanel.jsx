import React from 'react';

const HistoryPanel = ({ show, onClose, project, historyList, onRestoreHistoryEntry }) => {

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const restoreVersion = (entryId) => {
    if (onRestoreHistoryEntry) {
      onRestoreHistoryEntry(entryId);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed left-[70px] top-16 w-80 bg-white border-r border-gray-200 shadow-lg overflow-y-auto z-20 sidebar-panel mb-16 max-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* New Logo */}
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Project History</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {/* Current Version Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">Current Version</span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              {historyList.length > 0
                ? (() => {
                  const currentEntry = historyList.find(entry => entry.isCurrent);
                  return currentEntry && currentEntry.version !== undefined ? `v${currentEntry.version}` : 'v0';
                })()
                : 'v0'
              }
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {historyList.length > 0
              ? (() => {
                const currentEntry = historyList.find(entry => entry.isCurrent);
                return currentEntry
                  ? `Last saved ${formatTime(currentEntry.timestamp)}`
                  : `Last saved ${formatTime(historyList[historyList.length - 1]?.timestamp || new Date())}`;
              })()
              : 'No history available'
            }
          </p>
        </div>

        {/* History List */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Changes</h4>

          {historyList.map((item, index) => (
            <div key={item.id} className={`border rounded-lg p-3 transition-colors ${item.isCurrent
              ? 'border-purple-300 bg-purple-50'
              : 'border-gray-200 hover:bg-gray-50'
              }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.isCurrent ? 'bg-purple-500' : index === 0 ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  <span className="text-sm font-medium text-gray-800">{item.action}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {`v${item.version !== undefined ? item.version : index}`}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{formatTime(item.timestamp)}</span>
                {!item.isCurrent && (
                  <button
                    onClick={() => restoreVersion(item.id)}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="border-t pt-4 mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Actions</h4>
          <div className="space-y-3">
            <button
              onClick={() => alert('Creating new version...')}
              className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Version
            </button>
            <button
              onClick={() => alert('Exporting history...')}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel; 