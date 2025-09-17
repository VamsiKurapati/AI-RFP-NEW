import React, { useState, useEffect } from "react";
import NavbarComponent from "./NavbarComponent";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosArrowBack, IoMdCloudUpload } from "react-icons/io";
import { FiUpload, FiFile, FiX } from "react-icons/fi";
import axios from "axios";
import Swal from "sweetalert2";

const Compliance = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState(null);

    // State for file upload
    const [uploadedFile, setUploadedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);

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

    const handleFileUpload = (file) => {
        // Validate file type
        const allowedTypes = ['.pdf'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

        if (!allowedTypes.includes(fileExtension)) {
            Swal.fire({
                title: "Invalid File Type",
                text: "Please upload a PDF file.",
                icon: "error",
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: false,
            });
            return;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            Swal.fire({
                title: "File Too Large",
                text: "Please upload a file smaller than 10MB.",
                icon: "error",
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: false,
            });
            return;
        }

        setUploadedFile(file);
    };

    const removeFile = () => {
        setUploadedFile(null);
    };

    const handleCheckCompliance = async () => {
        if (!data || !uploadedFile) {
            Swal.fire({
                title: "Error",
                text: "Please upload a proposal document and select an RFP.",
                icon: "error",
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: false,
            });
            return;
        }

        //Based on the plan send the request to the API
        if (userSubscription?.plan_name === "Basic") {
            const formData = new FormData();
            formData.append('file', uploadedFile);
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/proposals/basicComplianceCheckPdf`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            });
            if (res.status === 200) {
                Swal.fire({
                    title: "Success",
                    text: "Compliance check completed successfully.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                    showCancelButton: false,
                });
                setTimeout(() => {
                    navigate('/basic-compliance-check', { state: { data: res.data } });
                }, 1500);
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Failed to check compliance.",
                    icon: "error",
                    timer: 1500,
                });
                return;
            }
            return;
        } else if (userSubscription?.plan_name === "Pro") {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/proposals/advancedComplianceCheckPdf`, {
                data,
                uploadedFile,
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (res.status === 200) {
                Swal.fire({
                    title: "Success",
                    text: "Compliance check completed successfully.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                    showCancelButton: false,
                });
                setTimeout(() => {
                    navigate('/advanced-compliance-check', { state: { data: res.data } });
                }, 1500);
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Failed to check compliance.",
                    icon: "error",
                    timer: 1500,
                });
                return;
            }
            return;
        } else if (userSubscription?.plan_name === "Enterprise") {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/proposals/advancedComplianceCheckPdf`, {
                data,
                uploadedFile,
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (res.status === 200) {
                Swal.fire({
                    title: "Success",
                    text: "Compliance check completed successfully.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                    showCancelButton: false,
                });
                setTimeout(() => {
                    navigate('/advanced-compliance-check', { state: { data: res.data } });
                }, 1500);
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Failed to check compliance.",
                    icon: "error",
                    timer: 1500,
                });
                return;
            }
            return;
        }
        else if (userSubscription?.plan_name === "Custom Enterprise Plan") {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/proposals/advancedComplianceCheckPdf`, {
                data,
                uploadedFile,
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (res.status === 200) {
                Swal.fire({
                    title: "Success",
                    text: "Compliance check completed successfully.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                    showCancelButton: false,
                });
                setTimeout(() => {
                    navigate('/advanced-compliance-check', { state: { data: res.data } });
                }, 1500);
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Failed to check compliance.",
                    icon: "error",
                    timer: 1500,
                });
                return;
            }
            return;
        }
        else {
            Swal.fire({
                title: "Error",
                text: "Please upgrade your plan to check compliance.",
                icon: "error",
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: false,
            });
            return;
        }
    };

    const currentPlan = userSubscription;

    return (
        <div className="min-h-screen overflow-y-auto bg-gray-50">
            <NavbarComponent />
            <div className="w-full max-w-6xl mx-auto p-8 mt-16">
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
                            <div className="flex items-center gap-3">
                                <button className="text-[#2563EB] hover:text-[#2563EB] rounded-full p-1 shrink-0 transition-colors" onClick={() => window.open(data.link, '_blank')}>
                                    <FiFile className="text-2xl text-[#2563EB] shrink-0" />
                                </button>
                                <div className="flex flex-col truncate">
                                    <p className="font-medium text-[#111827] truncate max-w-[200px]">{data.title}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* File Upload Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Upload Proposal Document</h2>

                    {!uploadedFile ? (
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
                                Supported formats: PDF (Max 10MB)
                            </p>
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FiFile className="text-2xl text-[#2563EB] shrink-0" />
                                    <div className="flex flex-col truncate">
                                        <p className="font-medium text-[#111827] truncate max-w-[200px]">{uploadedFile.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
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
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors w-auto mx-auto"
                    >
                        <IoIosArrowBack className="text-xl" />
                        Back
                    </button>
                    <button className="bg-[#2563EB] text-white px-8 py-2 rounded-lg font-medium text-lg hover:bg-[#1d4ed8] w-auto mx-auto" onClick={() => handleCheckCompliance()}>Check Compliance</button>
                </div>
            </div>
        </div>
    );
};

export default Compliance;
