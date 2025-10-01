import React, { useEffect, useState } from "react";
import NavbarComponent from "./NavbarComponent";
import { IoIosArrowBack, IoMdCloseCircle } from "react-icons/io";
import { MdOutlineError, MdOutlineArrowBack } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

const AdvancedComplianceCheck = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [basicComplianceCheck, setBasicComplianceCheck] = useState(null);
    const [advancedComplianceCheck, setAdvancedComplianceCheck] = useState(null);
    const [rfpTitle, setRfpTitle] = useState("");

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const formatSection = (str) =>
        str
            .split(/[_\s]+/) // split by underscore OR whitespace
            .filter(Boolean) // remove empty strings
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");

    useEffect(() => {
        const incoming = location.state && location.state.data;
        if (incoming) {
            setBasicComplianceCheck({
                missing_sections: incoming?.compliance_dataBasicCompliance?.missing_sections || [],
                empty_sections: incoming?.compliance_dataBasicCompliance?.empty_sections || [],
                format_issues: incoming?.compliance_dataBasicCompliance?.format_issues || {},
            });
            setAdvancedComplianceCheck(incoming?.dataAdvancedCompliance || {});
            setRfpTitle(incoming.rfpTitle ? incoming.rfpTitle : "");
        } else {
            setBasicComplianceCheck({
                missing_sections: [],
                empty_sections: [],
                format_issues: {},
            });
            setAdvancedComplianceCheck({});
            setRfpTitle("");
        }
    }, []);

    return (
        <div className="min-h-screen overflow-y-auto">
            <NavbarComponent />
            <div className="w-full mx-auto p-8 mt-20">
                {/* Compliance Check Title */}
                <h1 className="text-[24px] font-semibold mb-4 text-center">Compliance Check</h1>

                {/* RFP Title */}
                <div className="w-full flex items-center mb-6">
                    <button className="bg-white rounded-lg p-2 mr-4 text-[#2563EB]" onClick={() => navigate(-1)}><MdOutlineArrowBack className="w-5 h-5 shrink-0" /></button>
                    <h1 className="text-[32px] font-semibold">{rfpTitle}</h1>
                </div>

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
                                        <MdOutlineError className="text-[20px] text-[#EAB308] shrink-0" />
                                        <span className="text-[#111827] text-[16px]">{formatSection(section)}</span>
                                    </li>
                                ))}
                                {basicComplianceCheck && basicComplianceCheck.missing_sections && basicComplianceCheck.missing_sections.length === 0 && (
                                    <li className="flex items-center justify-start gap-2">
                                        <MdOutlineError className="text-[20px] text-[#EAB308] shrink-0" />
                                        <span className="text-[#111827] text-[16px]">No missing sections</span>
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
                                                <span className="text-[#111827] text-[16px] font-medium">{formatSection(section)}</span>
                                                {issues.map((issue, issueIdx) => (
                                                    <span key={issueIdx} className="text-[#713F12] text-[14px] ml-2">• {capitalize(issue)}</span>
                                                ))}
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="flex items-center justify-start gap-2">
                                        <MdOutlineError className="text-[20px] text-[#EAB308] shrink-0" />
                                        <span className="text-[#111827] text-[16px]">No format issues</span>
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
                                        <IoMdCloseCircle className="text-[20px] text-[#EF4444] shrink-0" />
                                        <span className="text-[#111827] text-[16px]">{formatSection(section)}</span>
                                    </li>
                                ))}
                                {basicComplianceCheck && basicComplianceCheck.empty_sections && basicComplianceCheck.empty_sections.length === 0 && (
                                    <li className="flex items-center justify-start gap-2">
                                        <IoMdCloseCircle className="text-[20px] text-[#EF4444] shrink-0" />
                                        <span className="text-[#111827] text-[16px]">No empty sections</span>
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

                    {/* Single div displaying all compliance data */}
                    <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6 mb-10">
                        <h2 className="text-[18px] font-semibold text-[#111827] mb-6">Compliance Analysis Results</h2>
                        <div className="space-y-4">
                            {advancedComplianceCheck && Object.keys(advancedComplianceCheck).length > 0 ? (
                                Object.entries(advancedComplianceCheck)
                                    .filter(([key]) => key !== "Suggest Pricing" && key !== "Winning Probability")
                                    .map(([key, value], idx) => (
                                        <div key={idx} className="border-b border-[#E5E7EB] pb-4 last:border-b-0">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    <h3 className="text-[16px] font-semibold text-[#111827] mb-2 text-left">
                                                        {formatSection(key)}
                                                    </h3>
                                                    <p className="text-[14px] text-[#6B7280] leading-relaxed text-left ml-4">
                                                        {value}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-[#6B7280] text-[16px]">No compliance data available</p>
                                </div>
                            )}

                            {/* Show message if only bid strategy insights are available */}
                            {advancedComplianceCheck &&
                                Object.keys(advancedComplianceCheck).length > 0 &&
                                Object.entries(advancedComplianceCheck)
                                    .filter(([key]) => key !== "Suggest Pricing" && key !== "Winning Probability")
                                    .length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-[#6B7280] text-[16px]">No additional compliance data available</p>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>

                {/* Bid Strategy Insights Section */}
                <div className="flex flex-col gap-4">
                    <span className="text-black text-[20px] font-semibold mt-4 mb-4">
                        Bid Strategy Insights
                    </span>

                    <div className="grid grid-cols-1 gap-6 mb-10">
                        {/* Suggest Pricing */}
                        {advancedComplianceCheck && advancedComplianceCheck["Suggest Pricing"] && (
                            <div className="bg-[#F0F9FF] border-2 border-[#BAE6FD] rounded-lg p-6">
                                <h2 className="text-[16px] font-semibold text-[#0369A1] mb-4">Suggested Pricing</h2>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-[#0284C7] rounded-full"></div>
                                    <p className="text-[#0F172A] text-[16px] font-medium">
                                        {advancedComplianceCheck["Suggest Pricing"]}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Winning Probability */}
                        {advancedComplianceCheck && advancedComplianceCheck["Winning Probability"] && (
                            <div className="bg-[#F0FDF4] border-2 border-[#BBF7D0] rounded-lg p-6">
                                <h2 className="text-[16px] font-semibold text-[#166534] mb-4">Winning Probability</h2>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-[#16A34A] rounded-full"></div>
                                    <p className="text-[#0F172A] text-[16px] font-medium">
                                        {advancedComplianceCheck["Winning Probability"]}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Show message if no bid strategy insights available */}
                    {(!advancedComplianceCheck ||
                        (!advancedComplianceCheck["Suggest Pricing"] && !advancedComplianceCheck["Winning Probability"])) && (
                            <div className="bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-lg p-6 mb-10">
                                <div className="text-center py-4">
                                    <p className="text-[#6B7280] text-[16px]">No bid strategy insights available</p>
                                </div>
                            </div>
                        )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
                    <button className="border border-[#4B5563] text-[#4B5563] px-6 py-2 rounded transition text-[16px] flex items-center gap-2"
                        onClick={() => navigate(-1)}>
                        <IoIosArrowBack className="text-[20px] text-[#4B5563] shrink-0" />
                        Back
                    </button>
                    <button className="bg-[#2563EB] text-white px-8 py-2 rounded transition text-[16px]"
                        onClick={() => navigate('/dashboard')}>
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdvancedComplianceCheck;
