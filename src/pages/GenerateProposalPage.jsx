import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavbarComponent from './NavbarComponent';
import { MdOutlineEdit, MdOutlineAdd, MdOutlineAssignment, MdOutlineArrowBack } from 'react-icons/md';
import { useProfile } from '../context/ProfileContext';
import { useUser } from '../context/UserContext';
import { AddTeamMemberModal, AddCaseStudyModal } from './CompanyProfileDashboard';
import axios from 'axios';
import Swal from 'sweetalert2';

const GenerateProposalPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const proposal = location.state?.proposal;
  const { companyData, loading, error, setCompanyData } = useProfile();
  const { role } = useUser();

  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showViewAllTeam, setShowViewAllTeam] = useState(false);
  const [showAddCaseStudy, setShowAddCaseStudy] = useState(false);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);

  const handleSaveAndNext = async () => {
    setIsGeneratingProposal(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/rfp/sendDataForProposalGeneration`, {
        proposal,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        //console.log(res.data);
        setIsGeneratingProposal(false);
        if (res.data.message === "Proposal Generation completed successfully.") {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: res.data.message || 'Proposal generated successfully. Redirecting to editor.',
          });
          setTimeout(() => {
            localStorage.setItem('proposalType', "RFP");
            navigate('/editor', {
              state: {
                jsonData: res.data.proposal, proposalId: res.data.proposalId
              }
            });
          }, 1500);
        } else if (res.data.message === "Proposal Generation is in Progress. Please visit again after some time.") {
          Swal.fire({
            icon: 'info',
            title: 'In Progress',
            text: res.data.message || 'Your proposal is being generated. Please visit again after some time.',
          });
        } else if (res.data.message === "Proposal Generation is still in progress. Please wait for it to complete.") {
          Swal.fire({
            icon: 'info',
            title: 'In Progress',
            text: res.data.message || 'Your proposal is still being generated. Please visit again after some time.',
          });
        } else if (res.data.message === "A proposal with the same RFP ID already exists in draft. Please edit the draft proposal instead of generating a new one.") {
          Swal.fire({
            icon: 'warning',
            title: 'Duplicate Proposal',
            text: res.data.message || 'A proposal with the same RFP ID already exists in draft. Please edit the draft proposal instead of generating a new one.',
          });
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Failed',
            text: res.data.message || res.data.error || 'Failed to generate proposal. Please try again after some time.',
          });
        }
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Failed',
          text: res.data.message || res.data.error || 'Failed to generate proposal. Please try again after some time.',
        });
      }
    } catch (error) {
      // console.error("Error generating proposal:", error);
      setIsGeneratingProposal(false);
      Swal.fire({
        icon: 'warning',
        title: 'Failed',
        text: error.response?.data?.message || error.response?.data?.error || 'Failed to generate proposal. Please try again after some time.',
      });
      return;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-10">
      <NavbarComponent />

      {/* Loading Overlay */}
      {isGeneratingProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="flex justify-center mb-6 space-x-2">
              <span className="w-3 h-3 bg-[#2563EB] rounded-full animate-bounce"></span>
              <span className="w-3 h-3 bg-[#2563EB] rounded-full animate-bounce delay-150"></span>
              <span className="w-3 h-3 bg-[#2563EB] rounded-full animate-bounce delay-300"></span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Generating Your Proposal</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Please wait while we generate your proposal. This may take a few moments as we analyze your profile and generate a proposal.
            </p>
          </div>
        </div>
      )}

      <div className="w-full mx-auto px-8 md:px-12 mt-16">
        <div className="w-full flex justify-between items-center mb-6">
          <button className="bg-white rounded-lg p-2 mr-4 text-[#2563EB]" onClick={() => navigate(-1)}><MdOutlineArrowBack className="w-5 h-5 shrink-0" /></button>
          <h1 className="text-left text-[32px] font-semibold">{proposal?.title}</h1>
        </div>

        <p className="text-[#4B5563] text-[20px] mb-6">1. Edit & preview user information</p>

        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">Error loading company data</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Company Details */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold text-[24px]">Company Details</h2>
                  <button className="text-[#2563EB] font-medium text-[16px] flex items-center gap-1" onClick={() => navigate('/company-profile-update')}>
                    <MdOutlineEdit className="w-4 h-4 text-[#2563EB]" />
                    Edit</button>
                </div>
                <div className="mb-1">
                  <div className="text-[16px] font-medium text-[#6B7280]">Company Name</div>
                  <div className=" text-[20px] font-medium text-[#111827]">{companyData?.companyName}</div>
                </div>
                <div className="mb-1">
                  <div className="text-[16px] font-medium text-[#6B7280]">Industry</div>
                  <div className="text-[20px] font-medium text-[#111827]">{companyData?.industry}</div>
                </div>
                <div className="mb-1">
                  <div className="text-[16px] font-medium text-[#6B7280]">Total no. of employees</div>
                  <div className="text-[20px] font-medium text-[#111827]">{companyData?.companyDetails?.["No.of employees"]?.value}</div>
                </div>
                <div className="mb-1">
                  <div className="text-[16px] font-medium text-[#6B7280]">About</div>
                  <div className="text-[#111827] text-[20px] leading-snug">{companyData?.profile?.bio}</div>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold text-[24px]">Team Members</h2>
                  <button className="text-[#2563EB] font-medium text-[16px] flex items-center gap-1" onClick={() => setShowAddTeam(true)}>
                    <MdOutlineAdd className="w-4 h-4 text-[#2563EB]" />
                    Add</button>
                </div>
                {companyData?.employees && companyData?.employees.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {showViewAllTeam === false && companyData?.employees && companyData?.employees.slice(0, 9).map((member, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-[#F8F9FA] rounded-lg px-2 py-1">
                          <div className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center text-xl font-bold text-gray-500 overflow-hidden">
                            {member.avatar ? (
                              <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover min-w-[40px] min-h-[40px]" />
                            ) : (
                              member.name.split(' ').map(n => n[0]).join('')
                            )}
                          </div>
                          <div>
                            <div className="text-[16px] font-medium text-[#111827]">{member.name}</div>
                            <div className="text-[14px] text-[#4B5563]">{member.jobTitle}</div>
                          </div>
                        </div>
                      ))}
                      {showViewAllTeam === true && companyData?.employees && companyData?.employees.map((member, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-[#F8F9FA] rounded-lg px-2 py-1">
                          <div className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center text-xl font-bold text-gray-500 overflow-hidden">
                            {member.avatar ? (
                              <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover min-w-[40px] min-h-[40px]" />
                            ) : (
                              member.name.split(' ').map(n => n[0]).join('')
                            )}
                          </div>
                          <div>
                            <div className="text-[16px] font-medium text-[#111827]">{member.name}</div>
                            <div className="text-[14px] text-[#4B5563]">{member.jobTitle}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="text-[#2563EB] text-[16px] self-end" onClick={() => setShowViewAllTeam(!showViewAllTeam)}> {showViewAllTeam ? "View Less" : "View All"}</button>
                  </>
                ) : (
                  <div className="text-[16px] text-[#4B5563]">No team members found</div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Previous Proposals */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-[24px]">Previous Proposals</h2>
            </div>
            {companyData?.proposalsList && companyData?.proposalsList.length > 0 ? (
              <div className="flex flex-col gap-2">
                {companyData?.proposalsList && companyData?.proposalsList.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white rounded-lg px-2 py-1">
                    <MdOutlineAssignment className="w-6 h-6 text-[#2563EB] shrink-0" />
                    <div className='w-full flex flex-col truncate'>
                      <div className="text-[20px] font-medium text-[#111827]">{p.title || p.OPPORTUNITY_TITLE}</div>
                      <div className="text-[16px] text-[#9CA3AF]">{p.company || p.CLIENT_NAME}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[16px] text-[#4B5563]">No previous proposals found</div>
            )}
          </div>

          {/* Case Studies */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-[24px]">Case Studies</h2>
              <button className="text-[#2563EB] font-medium text-[16px] flex items-center gap-1" onClick={() => setShowAddCaseStudy(true)}>
                <MdOutlineAdd className="w-4 h-4 text-[#2563EB]" />
                Add</button>
            </div>
            {companyData?.caseStudiesList && companyData?.caseStudiesList.length > 0 ? (
              <div className="flex flex-col gap-2">
                {companyData?.caseStudiesList && companyData?.caseStudiesList.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white rounded-lg px-2 py-1">
                    <MdOutlineAssignment className="w-6 h-6 text-[#2563EB] shrink-0" />
                    <div className='w-full flex flex-col truncate'>
                      <div className="text-[16px] font-medium text-[#111827] truncate">{c.title}</div>
                      <div className="text-[14px] text-[#9CA3AF]">{c.company}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[16px] text-[#4B5563]">No case studies found</div>
            )}
          </div>
        </div>

        {/* Save & Next Button */}
        <div className="flex justify-end">
          <button className="bg-[#2563EB] text-white px-8 py-2 rounded-lg font-medium text-lg hover:bg-[#1d4ed8]" onClick={handleSaveAndNext}>Save & Next</button>
        </div>
      </div>

      <AddTeamMemberModal isOpen={showAddTeam} onClose={() => setShowAddTeam(false)} />
      <AddCaseStudyModal isOpen={showAddCaseStudy} onClose={() => setShowAddCaseStudy(false)} />

    </div>
  );
};

export default GenerateProposalPage;
