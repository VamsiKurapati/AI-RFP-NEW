import React, { useEffect, useState } from "react";
import NavbarComponent from "./NavbarComponent";
import { IoIosArrowBack, IoMdCloseCircle } from "react-icons/io";
import { MdOutlineError } from "react-icons/md";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import handlePDFGeneration from "../components/Generate_PDF";

const AdvancedComplianceCheck = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [basicComplianceCheck, setBasicComplianceCheck] = useState(null);
    const [advancedComplianceCheck, setAdvancedComplianceCheck] = useState(null);


    useEffect(() => {
        const incoming = location.state && location.state.data;
        if (incoming) {
            setData(incoming);
            setBasicComplianceCheck({
                missing_sections: incoming?.compliance_dataBasicCompliance?.missing_sections || [],
                empty_sections: incoming?.compliance_dataBasicCompliance?.empty_sections || [],
                format_issues: incoming?.compliance_dataBasicCompliance?.format_issues || {},
            });
            setAdvancedComplianceCheck({
                rfp_title: incoming?.dataAdvancedCompliance?.rfp_title || "",
                requested_information: incoming?.dataAdvancedCompliance?.requested_information || [],
                present_information: incoming?.dataAdvancedCompliance?.present_information || [],
                missing_information: incoming?.dataAdvancedCompliance?.missing_information || [],
                status: incoming?.dataAdvancedCompliance?.status || "",
            });
            //Delete the location.state.data
            delete location.state.data;
        } else {
            setData(null);
            setBasicComplianceCheck({
                missing_sections: [],
                empty_sections: [],
                format_issues: {},
            });
            setAdvancedComplianceCheck({
                rfp_title: "",
                requested_information: [],
                present_information: [],
                missing_information: [],
                status: "",
            });
        }
    }, []);

    const handleGeneratePDF = async () => {
        await handlePDFGeneration();
    };

    return (
        <div className="min-h-screen overflow-y-auto">
            <NavbarComponent />
            <div className="w-full mx-auto p-8 mt-16">
                {/* Compliance Check Title */}
                <h1 className="text-[24px] font-semibold mb-4">Compliance Check</h1>

                {/* RFP Title */}
                <h1 className="text-[24px] font-semibold mb-4">{advancedComplianceCheck && advancedComplianceCheck.rfp_title}</h1>

                {/* Basic Compliance Check */}
                <div className="flex flex-col gap-4">
                    <span className="text-black text-[20px] font-semibold mt-4 mb-4">
                        Basic Compliance Check
                    </span>
                    {/* Compliance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        {/* Missing Sections */}
                        <div className="bg-[#FEFCE8] border-2 border-[#FEF0C7] rounded-lg p-6">
                            <h2 className="text-[16px] font-semibold text-[#713F12]">Missing Sections</h2>
                            <p className="text-[#713F12] text-[14px] mb-4">Please address these items before submission</p>
                            <ul className="space-y-3">
                                {basicComplianceCheck && basicComplianceCheck.missing_sections && basicComplianceCheck.missing_sections.map((section, idx) => (
                                    <li key={idx} className="flex items-center justify-start gap-2">
                                        <MdOutlineError className="text-[20px] text-[#EAB308]" />
                                        <span className="text-[#111827] text-[16px]">{section}</span>
                                    </li>
                                ))}
                                {basicComplianceCheck && basicComplianceCheck.missing_sections && basicComplianceCheck.missing_sections.length === 0 && (
                                    <li className="flex items-center justify-start gap-2">
                                        <MdOutlineError className="text-[20px] text-[#EAB308]" />
                                        <span className="text-[#111827] text-[16px]">No missing sections found</span>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Format Issues */}
                        <div className="bg-[#FEFCE8] border-2 border-[#FEF0C7] rounded-lg p-6">
                            <h2 className="text-[16px] font-semibold text-[#713F12]">Format Issues</h2>
                            <p className="text-[#713F12] text-[14px] mb-4">Sections with formatting problems</p>
                            <ul className="space-y-3">
                                {basicComplianceCheck && basicComplianceCheck.format_issues && Object.keys(basicComplianceCheck.format_issues).length > 0 ? (
                                    Object.entries(basicComplianceCheck.format_issues).map(([section, issues], idx) => (
                                        <li key={idx} className="flex items-start justify-start gap-2">
                                            <MdOutlineError className="text-[20px] text-[#EAB308] mt-1 flex-shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="text-[#111827] text-[16px] font-medium">{section}</span>
                                                {issues.map((issue, issueIdx) => (
                                                    <span key={issueIdx} className="text-[#713F12] text-[14px] ml-2">• {issue}</span>
                                                ))}
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="flex items-center justify-start gap-2">
                                        <MdOutlineError className="text-[20px] text-[#EAB308]" />
                                        <span className="text-[#111827] text-[16px]">No format issues found</span>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Empty Sections */}
                        <div className="bg-[#FEF2F2] border-2 border-[#FECACA] rounded-lg p-6">
                            <h2 className="text-[16px] font-semibold text-[#14532D]">Empty Sections</h2>
                            <p className="text-[#14532D] text-[14px] mb-4">These sections are present but empty</p>
                            <ul className="space-y-3">
                                {basicComplianceCheck && basicComplianceCheck.empty_sections && basicComplianceCheck.empty_sections.map((section, idx) => (
                                    <li key={idx} className="flex items-center justify-start gap-2">
                                        <IoMdCloseCircle className="text-[20px] text-[#EF4444]" />
                                        <span className="text-[#111827] text-[16px]">{section}</span>
                                    </li>
                                ))}
                                {basicComplianceCheck && basicComplianceCheck.empty_sections && basicComplianceCheck.empty_sections.length === 0 && (
                                    <li className="flex items-center justify-start gap-2">
                                        <IoMdCloseCircle className="text-[20px] text-[#EF4444]" />
                                        <span className="text-[#111827] text-[16px]">No empty sections found</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
                {/* Advanced Compliance Check Section */}
                <div className="flex flex-col gap-4">
                    <span className="text-black text-[20px] font-semibold mt-4 mb-4">
                        Advanced Compliance Check
                    </span>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-lg p-4 flex flex-col items-start">
                            <span className="text-[#6B7280] text-[18px]">Overall Compliance Status</span>
                            <span className="text-[#2563EB] text-[28px] font-semibold">{advancedComplianceCheck && advancedComplianceCheck.status}</span>
                        </div>
                    </div>
                    {/* Compliance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {/* Requested Information */}
                        <div className="bg-[#FEF2F2] border-2 border-[#FECACA] rounded-lg p-6">
                            <h2 className="text-[16px] font-semibold text-[#7F1D1D]">Requested Information</h2>
                            <p className="text-[#B91C1C] text-[14px] mb-4">As specified in the RFP</p>
                            <ul className="space-y-3">
                                {advancedComplianceCheck && advancedComplianceCheck.requested_information && advancedComplianceCheck.requested_information.map((item, idx) => (
                                    <li key={idx} className="flex items-center justify-start gap-2">
                                        <IoMdCloseCircle className="text-[20px] text-[#EF4444]" />
                                        <span className="text-[#111827] text-[16px]">{item}</span>
                                    </li>
                                ))}
                                {advancedComplianceCheck && advancedComplianceCheck.requested_information && advancedComplianceCheck.requested_information.length === 0 && (
                                    <li className="flex items-center justify-start gap-2">
                                        <IoMdCloseCircle className="text-[20px] text-[#EF4444]" />
                                        <span className="text-[#111827] text-[16px]">No items specified</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                        {/* Present Information */}
                        <div className="bg-[#FEFCE8] border-2 border-[#FEF0C7] rounded-lg p-6">
                            <h2 className="text-[16px] font-semibold text-[#713F12]">Present Information</h2>
                            <p className="text-[#713F12] text-[14px] mb-4">Information detected in the proposal</p>
                            <ul className="space-y-3">
                                {advancedComplianceCheck && advancedComplianceCheck.present_information && advancedComplianceCheck.present_information.map((item, idx) => (
                                    <li key={idx} className="flex items-center justify-start gap-2">
                                        <BsFillCheckCircleFill className="text-[20px] text-[#EAB308]" />
                                        <span className="text-[#111827] text-[16px]">{item}</span>
                                    </li>
                                ))}
                                {advancedComplianceCheck && advancedComplianceCheck.present_information && advancedComplianceCheck.present_information.length === 0 && (
                                    <li className="flex items-center justify-start gap-2">
                                        <BsFillCheckCircleFill className="text-[20px] text-[#EAB308]" />
                                        <span className="text-[#111827] text-[16px]">No present information found</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                        {/* Missing Information */}
                        <div className="bg-[#FEF2F2] border-2 border-[#FECACA] rounded-lg p-6">
                            <h2 className="text-[16px] font-semibold text-[#14532D]">Missing Information</h2>
                            <p className="text-[#14532D] text-[14px] mb-4">Requested but not found</p>
                            <ul className="space-y-3">
                                {advancedComplianceCheck && advancedComplianceCheck.missing_information && advancedComplianceCheck.missing_information.map((item, idx) => (
                                    <li key={idx} className="flex items-center justify-start gap-2">
                                        <IoMdCloseCircle className="text-[20px] text-[#EF4444]" />
                                        <span className="text-[#111827] text-[16px]">{item}</span>
                                    </li>
                                ))}
                                {advancedComplianceCheck && advancedComplianceCheck.missing_information && advancedComplianceCheck.missing_information.length === 0 && (
                                    <li className="flex items-center justify-start gap-2">
                                        <IoMdCloseCircle className="text-[20px] text-[#EF4444]" />
                                        <span className="text-[#111827] text-[16px]">No missing information</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                    {/* Navigation Buttons */}
                    <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-4">
                        <button className="border border-[#4B5563] text-[#4B5563] px-6 py-2 rounded transition text-[16px] flex items-center gap-2"
                            onClick={() => navigate(-1)}>
                            <IoIosArrowBack className="text-[20px] text-[#4B5563]" />
                            Back
                        </button>
                        <button className="bg-[#2563EB] text-white px-8 py-2 rounded transition text-[16px]"
                            onClick={() => handleGeneratePDF()}>
                            Generate PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedComplianceCheck;
