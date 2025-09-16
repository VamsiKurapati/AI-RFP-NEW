import React, { useState, useEffect } from 'react';
import { getStorageUsage, getAvailableStorage, clearOldData, STORAGE_KEYS } from '../utils/storage';
import Swal from 'sweetalert2';

const StorageManager = ({ show, onClose }) => {
    const [storageInfo, setStorageInfo] = useState({
        used: 0,
        available: 0,
        percentage: 0
    });

    useEffect(() => {
        if (show) {
            updateStorageInfo();
        }
    }, [show]);

    const updateStorageInfo = () => {
        const used = getStorageUsage();
        const available = getAvailableStorage();
        const percentage = Math.round((used / (used + available)) * 100);

        setStorageInfo({ used, available, percentage });
    };

    const handleClearHistory = () => {
        try {
            localStorage.removeItem(STORAGE_KEYS.HISTORY);
            updateStorageInfo();
            Swal.fire({
                title: 'History cleared successfully!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: false,
            });
        } catch (error) {
            // console.error('Error clearing history:', error);
            Swal.fire({
                title: 'Failed to clear history',
                icon: 'error',
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: false,
            });
        }
    };

    const handleClearAll = () => {
        if (confirm('This will clear all saved data including your project and images. Are you sure?')) {
            try {
                localStorage.clear();
                updateStorageInfo();
                Swal.fire({
                    title: 'All data cleared successfully!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    showCancelButton: false,
                });
                onClose();
            } catch (error) {
                // console.error('Error clearing all data:', error);
                Swal.fire({
                    title: 'Failed to clear data',
                    icon: 'error',
                    timer: 1500,
                    showConfirmButton: false,
                    showCancelButton: false,
                });
            }
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Storage Management</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Storage Usage Bar */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span>Storage Usage</span>
                            <span>{formatBytes(storageInfo.used)} / {formatBytes(storageInfo.used + storageInfo.available)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all ${storageInfo.percentage > 80 ? 'bg-red-500' :
                                    storageInfo.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                style={{ width: `${storageInfo.percentage}%` }}
                            ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {storageInfo.percentage}% used
                        </div>
                    </div>

                    {/* Warning if storage is high */}
                    {storageInfo.percentage > 80 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                                ⚠️ Storage usage is high. Consider clearing some data to prevent issues.
                            </p>
                        </div>
                    )}

                    {/* Available Space */}
                    <div className="text-sm">
                        <span className="font-medium">Available Space:</span> {formatBytes(storageInfo.available)}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                        <button
                            onClick={handleClearHistory}
                            className="w-full px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Clear History
                        </button>

                        <button
                            onClick={handleClearAll}
                            className="w-full px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            Clear All Data
                        </button>
                    </div>

                    {/* Info */}
                    <div className="text-xs text-gray-500">
                        <p>• Clearing history will free up space but keep your current project</p>
                        <p>• Clearing all data will remove everything including your project</p>
                        <p>• Large images and complex projects can use significant storage</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StorageManager; 