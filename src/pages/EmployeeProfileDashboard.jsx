import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdOutlineEdit, MdOutlineAddAPhoto, MdOutlineBusinessCenter, MdOutlineLocationOn, MdOutlineMail, MdOutlineCall, MdOutlineClose, MdOutlineCheck, MdOutlineCalendarToday, MdOutlineVisibility } from "react-icons/md";
import NavbarComponent from "./NavbarComponent";
import { useEmployeeProfile } from "../context/EmployeeProfileContext";
import { useUser } from "../context/UserContext";
import handlePDFGeneration from "../components/Generate_PDF";

const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/profile`;

// Main component for Employee Profile Dashboard
const EmployeeProfileDashboard = () => {
  const navigate = useNavigate();
  // Use context
  const { employeeData, loading, error, refreshProfile, proposalsInProgress, completedProposals, refreshProposals } = useEmployeeProfile();
  const { role } = useUser();
  // Logo upload state and ref
  const [logoUrl, setLogoUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // console.log("Completed Proposals : ", completedProposals);
  // console.log("Proposals In Progress : ", proposalsInProgress);

  // Set logoUrl from employeeData
  useEffect(() => {
    if (employeeData && employeeData.logoUrl_1) {
      setLogoUrl(employeeData.logoUrl_1);
    } else if (employeeData && employeeData.logoUrl) {
      setLogoUrl(employeeData.logoUrl);
    }
  }, [employeeData]);

  const handleGeneratePDF = async (proposal) => {
    await handlePDFGeneration(proposal);
  };

  // Updated Button handlers
  const handleEditProfile = () => {
    navigate('/employee-profile-update', {
      state: {
        employeeData: employeeData
      }
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-[#6B7280]">Loading employee profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !employeeData && !proposalsInProgress && !completedProposals) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading company profile: {error}</p>
          <button
            onClick={() => {
              refreshProfile();
              refreshProposals();
            }}
            className="bg-[#2563EB] text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setEditMode(true); // Ensure editMode stays true after file selection
  };

  const handleSaveLogo = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('logo', selectedFile);

    try {
      const response = await axios.post(
        `${baseUrl}/uploadLogo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setLogoUrl(`${baseUrl}/getProfileImage/file/${response.data.logoUrl}`);
      // //console.log(logoUrl);
      setEditMode(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      alert('Logo updated!');
    } catch (err) {
      alert('Failed to upload image');
    }
  };

  // Image/logo hover and edit handlers
  const handleLogoMouseEnter = () => setIsHoveringLogo(true);

  const handleLogoMouseLeave = () => {
    setIsHoveringLogo(false);
    // Only reset editMode if not editing (no preview/file selected)
    if (!previewUrl) {
      setEditMode(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleEditLogo = (e) => {
    e.stopPropagation();
    setEditMode(true);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleCancelLogo = () => {
    setEditMode(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-[#DBEAFE] text-[#2563EB]';
      case 'Submitted':
        return 'bg-[#DCFCE7] text-[#15803D]';
      case 'Rejected':
        return 'bg-[#FEE2E2] text-[#DC2626]';
      case 'Won':
        return 'bg-[#FEF9C3] text-[#CA8A04]';
      default:
        return 'bg-[#F3F4F6] text-[#4B5563]';
    }
  };

  return (
    <div className="h-full relative">
      <NavbarComponent />

      <div className="bg-[#F8F9FA] w-full mt-16 md:top-16 left-0 right-0 z-10 px-8 md:px-12 py-[14px] border-b border-[#2563EB]">
        {/* Profile image and info */}
        <div className="w-full">
          {/* For <lg: Row 1 - image and edit button */}
          <div className="flex flex-row items-center justify-between gap-4 mb-2">
            {/* Profile Image */}
            <div className="flex items-center">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
              />
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 bg-[#E0E0E0] rounded-lg flex items-center justify-center cursor-pointer overflow-hidden relative group"
                onMouseEnter={handleLogoMouseEnter}
                onMouseLeave={handleLogoMouseLeave}
                title="Upload company logo"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : logoUrl ? (
                  <img src={logoUrl} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <MdOutlineAddAPhoto className="w-6 h-6 text-[#6B7280]" />
                )}
                {(isHoveringLogo || editMode) && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center gap-2 transition-opacity">
                    {!editMode ? (
                      <button
                        className="bg-white p-2 rounded-full hover:bg-[#EFF6FF] flex items-center justify-center"
                        onClick={handleEditLogo}
                        title="Edit"
                      >
                        <MdOutlineEdit className="w-6 h-6 text-[#2563EB]" />
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          className="bg-[#2563EB] p-2 rounded-full flex items-center justify-center hover:bg-[#1d4ed8]"
                          onClick={handleSaveLogo}
                          title="Save"
                        >
                          <MdOutlineCheck className="w-6 h-6 text-white" />
                        </button>
                        <button
                          className="bg-white p-2 rounded-full flex items-center justify-center hover:bg-[#EFF6FF]"
                          onClick={handleCancelLogo}
                          title="Cancel"
                        >
                          <MdOutlineClose className="w-6 h-6 text-[#2563EB]" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Edit Button */}
            <button
              className="text-[#2563EB] text-[15px] sm:text-[16px] flex items-center gap-1 hover:bg-[#EFF6FF] px-2 sm:px-3 py-2 rounded-lg transition-colors"
              onClick={() => handleEditProfile()}
            >
              <MdOutlineEdit className="w-5 h-5 shrink-0" /> Edit Profile
            </button>
          </div>
          {/* For <lg: Row 2 - company info */}
          <div className="w-full">
            {/* Company Info */}
            <div className="flex items-center text-center gap-2 mb-2">
              <h2 className="text-[20px] sm:text-[22px] font-semibold mb-2 break-words truncate">{employeeData?.name || 'Loading...'}</h2>
              <div className={`text-[14px] sm:text-[15px] text-[#6B7280] rounded-lg px-3 py-1 ${employeeData?.accessLevel ? (employeeData.accessLevel === "Editor" ? "bg-[#FEF9C3] text-[#CA8A04]" : "bg-[#F3F4F6] text-[#4B5563]") : "bg-[#F3F4F6] text-[#4B5563]"}`}>
                <span> {employeeData?.accessLevel || 'Loading...'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <MdOutlineBusinessCenter className="w-5 h-5 shrink-0 text-[#2563EB]" />
              <p className="text-[14px] sm:text-[16px] md:text-[20px] text-[#2563EB]">{employeeData?.jobTitle || 'Loading...'}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
              <div className="flex items-center gap-2">
                <MdOutlineBusinessCenter className="w-5 h-5 shrink-0 text-[#111827]" />
                <p className="text-[14px] sm:text-[16px] md:text-[20px] text-[#111827]">{employeeData?.companyName || 'Loading...'}</p>
              </div>
              <div className="ml-1 w-[2px] h-6 bg-[#111827] hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <MdOutlineLocationOn className="w-5 h-5 shrink-0 text-[#111827]" />
                <p className="text-[14px] sm:text-[16px] md:text-[20px] text-[#111827]">{employeeData?.location || 'Loading...'}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="flex items-center gap-2 bg-[#EFF6FF] text-[#2563EB] px-8 py-4 rounded-lg">
                <MdOutlineMail className="w-5 h-5 shrink-0 mt-[2px]" />
                <p className="text-[14px] sm:text-[16px]">{employeeData?.email || 'Loading...'}</p>
              </div>
              <div className="flex items-center gap-2 bg-[#EFF6FF] text-[#2563EB] px-8 py-4 rounded-lg">
                <MdOutlineCall className="w-5 h-5 shrink-0 mt-[2px]" />
                <p className="text-[14px] sm:text-[16px]">{employeeData?.phone || 'Loading...'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proposals Sections */}
      <div className="mt-4 px-8 md:px-12 pb-8">
        {/* Proposals in Progress Section */}
        <div className="mb-8">
          <h3 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] mb-4">Proposals in Progress</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {proposalsInProgress.length > 0 ? (
              proposalsInProgress.map((proposal) => (
                <div key={proposal.id} className="bg-white rounded-lg p-4 shadow-sm border border-[#E5E7EB] hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[12px] px-2 py-1 rounded-full ${getStatusColor(proposal.status)}`}>
                      {proposal.status || "Not Disclosed"}
                    </span>
                  </div>
                  <h4 className="text-[#111827] text-[16px] mb-2">{proposal.title || "Not Disclosed"}</h4>
                  <p className="text-[#4B5563] text-[13px] mb-2">{proposal.clientName || "Not Disclosed"}</p>
                  <div className="flex items-center gap-1 text-[#6B7280] text-[12px] mb-4">
                    <MdOutlineCalendarToday className="w-4 h-4 shrink-0" />
                    <span>{proposal.deadline || "Not Disclosed"}</span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="text-[#2563EB] text-[14px] font-medium hover:text-[#1d4ed8] transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                      disabled={role === "Viewer" || (role !== "company" && !(proposal.currentEditor && proposal.currentEditor.email === employeeData.email))}
                      title={role === "Viewer" ? "Viewer cannot edit proposals" : (role !== "company" && !(proposal.currentEditor && proposal.currentEditor.email === employeeData.email)) ? "Only current editor can edit this proposal" : "Edit Details"}
                      onClick={() => navigate('/proposal_page', { state: { proposal: proposal.generatedProposal, proposalType: `${proposal.rfpId ? "RFP" : proposal.grantId ? "GRANT" : "No"}`, proposalId: proposal._id } })}>
                      <MdOutlineEdit className="w-4 h-4 shrink-0" title="Edit Details" />
                      Edit
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4">No proposals found</td>
              </tr>
            )}
          </div>
        </div>

        {/* Completed Proposals Section */}
        <div>
          <h3 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] mb-4">Completed Proposals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {completedProposals.length > 0 ? (
              completedProposals.map((proposal) => (
                <div key={proposal.id} className="bg-white rounded-lg p-4 shadow-sm border border-[#E5E7EB] hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[12px] px-2 py-1 rounded-full ${getStatusColor(proposal.status)}`}>
                      {proposal.status || "Not Disclosed"}
                    </span>
                  </div>
                  <h4 className="text-[#111827] text-[16px] mb-2">{proposal.title || "Not Disclosed"}</h4>
                  <p className="text-[#4B5563] text-[13px] mb-2">{proposal.clientName || "Not Disclosed"}</p>
                  <div className="flex items-center gap-1 text-[#6B7280] text-[12px] mb-4">
                    <MdOutlineCalendarToday className="w-4 h-4 shrink-0" />
                    <span>{proposal.deadline || "Not Disclosed"}</span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="text-[#2563EB] text-[14px] font-medium hover:text-[#1d4ed8] transition-colors flex items-center gap-1 cursor-pointer"
                      title="View Details"
                      onClick={() => handleGeneratePDF(proposal.generatedProposal)}>
                      <MdOutlineVisibility className="w-4 h-4 shrink-0" title="View Details" />
                      View
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4">No proposals found</td>
              </tr>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileDashboard;