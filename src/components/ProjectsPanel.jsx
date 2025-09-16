import React from 'react';

const ProjectsPanel = ({ show, onClose }) => {
  const handleContactAdmin = () => {
    window.open('mailto:admin@example.com?subject=Project Assignment Request', '_blank');
  };

  if (!show) return null;

  return (
    <div className="fixed left-[72px] top-0 w-80 bg-white border-r border-gray-200 shadow-lg overflow-y-auto z-20 sidebar-panel" style={{ height: 'calc(100vh - 32px)' }}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Projects Logo */}
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Projects</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {/* Projects Info */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-700">Projects Status</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
              No Projects
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Currently no projects assigned to your account
          </p>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Projects Currently Assigned</h4>

          {/* Empty State */}
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">No Projects Found</h5>
            <p className="text-xs text-gray-500 mb-4">
              You don't have any projects assigned to your account at the moment.
            </p>
          </div>
        </div>

        {/* Contact Admin Section */}
        <div className="border-t pt-4 mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Need Help?</h4>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-3">
                Not finding your projects? Contact admin for assistance.
              </p>
              <button
                onClick={handleContactAdmin}
                className="w-full px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Admin
              </button>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default ProjectsPanel; 