import React, { useState, useEffect } from "react";
import NavbarComponent from "./NavbarComponent";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosArrowBack, IoMdCloudUpload } from "react-icons/io";
import { FiUpload, FiFile, FiX, FiLoader } from "react-icons/fi";
import axios from "axios";
import Swal from "sweetalert2";

// SweetAlert configurations
const ALERT_CONFIGS = {
    invalidFileType: {
        title: "Invalid File Type",
        text: "Please upload a PDF file only.",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
    },
    fileTooLarge: {
        title: "File Too Large",
        text: "Please upload a file smaller than 5MB.",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
    },
    missingRequirements: {
        title: "Error",
        text: "Please upload a proposal document and select an RFP.",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
    },
    success: {
        title: "Success",
        text: "Compliance check completed successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
    },
    error: {
        title: "Error",
        text: "Failed to check compliance.",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
    },
    upgradeRequired: {
        title: "Error",
        text: "Please upgrade your plan to check compliance.",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
    },
    fileUploadSuccess: {
        title: "Success",
        text: "File uploaded successfully.",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
        showCancelButton: false,
    }
};

const Compliance = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState(null);

    // State for file upload
    const [uploadedFile, setUploadedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [complianceCheck, setComplianceCheck] = useState(false);

    const userSubscription = localStorage.getItem('subscription') ? JSON.parse(localStorage.getItem('subscription')) : null;

    useEffect(() => {
        // Get RFP data from location state (from Generate Proposal page)
        if (location.state && location.state.data) {
            setData(location.state.data);
        }
    }, []);

    // File upload handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const handleFileUpload = async (file) => {
        // Validate file type
        const allowedTypes = ['.pdf'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

        if (!allowedTypes.includes(fileExtension)) {
            Swal.fire(ALERT_CONFIGS.invalidFileType);
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            Swal.fire(ALERT_CONFIGS.fileTooLarge);
            return;
        }

        // Simulate file processing with progress for larger files (>1MB)
        if (file.size > 1 * 1024 * 1024) {
            setFileUploading(true);
            setUploadProgress(0);

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + Math.random() * 15;
                });
            }, 100);

            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 1000));

            setUploadProgress(100);
            setTimeout(() => {
                setFileUploading(false);
                setUploadProgress(0);
                setUploadedFile(file);
                Swal.fire(ALERT_CONFIGS.fileUploadSuccess);
            }, 300);
        } else {
            setUploadedFile(file);
        }
    };

    const removeFile = () => {
        setUploadedFile(null);
    };

    const handleCheckCompliance = async () => {
        if (!data || !uploadedFile) {
            Swal.fire(ALERT_CONFIGS.missingRequirements);
            return;
        }

        // check if file type is PDF
        if (uploadedFile.type !== "application/pdf") {
            Swal.fire(ALERT_CONFIGS.invalidFileType);
            return;
        }

        // check if file size is greater than 5MB
        if (uploadedFile.size > 5 * 1024 * 1024) {
            Swal.fire(ALERT_CONFIGS.fileTooLarge);
            return;
        }

        //Based on the plan send the request to the API
        if (userSubscription?.plan_name === "Basic") {
            const formData = new FormData();
            formData.append('file', uploadedFile);
            try {
                setComplianceCheck(true);

                const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/proposals/basicComplianceCheckPdf`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    }
                });

                if (res.status === 200) {
                    Swal.fire(ALERT_CONFIGS.success);
                    setTimeout(() => {
                        navigate('/basic-compliance-check', { state: { data: res.data } });
                    }, 1500);
                } else {
                    Swal.fire(ALERT_CONFIGS.error);
                }
            } catch (error) {
                Swal.fire(ALERT_CONFIGS.error);
            } finally {
                setComplianceCheck(false);
                return;
            }
        } else if (userSubscription?.plan_name === "Pro" || userSubscription?.plan_name === "Enterprise" || userSubscription?.plan_name === "Custom Enterprise Plan") {
            try {
                setComplianceCheck(true);

                const formData = new FormData();
                formData.append('file', uploadedFile);
                formData.append('rfpId', data.rfpId || data._id);

                const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/proposals/advancedComplianceCheckPdf`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    }
                });

                if (res.status === 200) {
                    Swal.fire(ALERT_CONFIGS.success);
                    setTimeout(() => {
                        navigate('/advanced-compliance-check', { state: { data: res.data } });
                    }, 1500);
                } else {
                    Swal.fire(ALERT_CONFIGS.error);
                }
            } catch (error) {
                Swal.fire(ALERT_CONFIGS.error);
            } finally {
                setComplianceCheck(false);
                return;
            }
        } else {
            Swal.fire(ALERT_CONFIGS.upgradeRequired);
            return;
        }
    };

    const currentPlan = userSubscription;

    return (
        <div className="min-h-screen overflow-y-auto bg-gray-50">
            <NavbarComponent />

            {complianceCheck && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
                        <div className="flex justify-center mb-6 space-x-2">
                            <span className="w-3 h-3 bg-[#2563EB] rounded-full animate-bounce"></span>
                            <span className="w-3 h-3 bg-[#2563EB] rounded-full animate-bounce delay-150"></span>
                            <span className="w-3 h-3 bg-[#2563EB] rounded-full animate-bounce delay-300"></span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Checking Compliance</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Please wait while we check the compliance of your proposal document. It may take a few minutes.
                        </p>
                    </div>
                </div>
            )}
            <div className="w-full max-w-6xl mx-auto p-8 mt-20">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                        RFP Compliance Check
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Upload your proposal document and check compliance against RFP requirements.
                    </p>
                </div>



                {/* Current Plan Banner */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <span className="text-lg font-medium text-gray-900">
                                Current Plan: <span className="text-blue-600">{currentPlan?.plan_name || "Free"}</span>
                            </span>
                        </div>
                        {(currentPlan?.plan_name === "Free" || !currentPlan) && (
                            <button
                                onClick={() => navigate('/payment')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Upgrade Plan
                            </button>
                        )}
                    </div>
                </div>

                {/* RFP Data Section */}
                {data && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">RFP Data</h2>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                    className="text-[#2563EB] hover:text-[#2563EB] rounded-full p-1 shrink-0 transition-colors"
                                    onClick={() => window.open(data.link, '_blank')}
                                >
                                    <FiFile className="text-2xl text-[#2563EB] shrink-0" />
                                </button>

                                <div className="flex flex-col flex-1 min-w-0">
                                    <p className="font-medium text-[#111827] truncate w-full overflow-hidden"
                                        title={data.title}
                                    >
                                        {data.title}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* File Upload Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Upload Proposal Document</h2>

                    {!uploadedFile && !fileUploading ? (
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <IoMdCloudUpload className="text-6xl text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Drop your proposal document here
                            </h3>
                            <p className="text-gray-600 mb-4">
                                or click to browse your files
                            </p>
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept=".pdf"
                                onChange={handleFileSelect}
                            />
                            <label
                                htmlFor="file-upload"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors"
                            >
                                <FiUpload />
                                Choose File
                            </label>
                            <p className="text-sm text-gray-500 mt-4">
                                Supported formats: PDF (Max 5MB)
                            </p>
                        </div>
                    ) : fileUploading ? (
                        <div className="border border-gray-200 rounded-lg p-8 text-center">
                            <FiLoader className="text-4xl text-blue-600 mx-auto mb-4 animate-spin" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Processing File...
                            </h3>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-600">
                                {Math.round(uploadProgress)}% complete
                            </p>
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">

                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FiFile className="text-2xl text-[#2563EB] shrink-0" />

                                    <div className="flex flex-col flex-1 min-w-0">
                                        <p
                                            className="font-medium text-[#111827] truncate w-full overflow-hidden"
                                            title={uploadedFile.name}  // Native browser tooltip
                                        >
                                            {uploadedFile.name}
                                        </p>

                                        <p
                                            className="text-sm text-gray-500 truncate w-full overflow-hidden"
                                            title={
                                                (uploadedFile.size / 1024 > 1024)
                                                    ? ((uploadedFile.size / 1024 / 1024).toFixed(2) + " MB")
                                                    : ((uploadedFile.size / 1024).toFixed(2) + " KB")
                                            }
                                        >
                                            {(uploadedFile.size / 1024 > 1024)
                                                ? ((uploadedFile.size / 1024 / 1024).toFixed(2) + " MB")
                                                : ((uploadedFile.size / 1024).toFixed(2) + " KB")}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={removeFile}
                                    className="text-red-500 hover:text-red-700 p-1"
                                >
                                    <FiX className="text-xl" />
                                </button>

                            </div>
                        </div>
                    )}
                </div>

                {/* Buttons Section */}
                <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors w-auto mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={complianceCheck || fileUploading}
                    >
                        <IoIosArrowBack className="text-xl" />
                        Back
                    </button>
                    <button
                        className="bg-[#2563EB] text-white px-8 py-2 rounded-lg font-medium text-lg hover:bg-[#1d4ed8] w-auto mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleCheckCompliance()}
                        disabled={complianceCheck || fileUploading}
                    >
                        {complianceCheck ? (
                            <div className="flex items-center gap-2">
                                <FiLoader className="text-xl animate-spin" />
                                <span>Checking Compliance...</span>
                            </div>
                        ) : (
                            "Check Compliance"
                        )}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default Compliance;
