import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaRegBookmark } from "react-icons/fa";
import PropTypes from "prop-types";
import Swal from 'sweetalert2';
import {
  MdOutlineShare,
  MdOutlineBookmark,
  MdOutlinePayments,
  MdOutlineCalendarMonth,
  MdOutlineAccountBalance,
  MdOutlineSearch,
  MdOutlineUpload,
  MdOutlineClose,
  MdOutlineExpandMore,
  MdOutlineCheck,
} from "react-icons/md";
import NavbarComponent from "./NavbarComponent";
import { useUser } from "../context/UserContext";
import GrantProposalForm from "../components/GrantProposalForm";
import Subscription from "../components/Subscription";

// Constants
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/rfp`;
const STATUS_STYLES = {
  "In Progress": "bg-blue-100 text-blue-600",
  Submitted: "bg-green-100 text-green-600",
  Rejected: "bg-red-100 text-red-600",
  Won: "bg-yellow-100 text-yellow-600",
};

// Sidebar Component
const LeftSidebar = ({ isOpen, onClose, filters, setFilters }) => {
  const categories = {
    category: ["Infrastructure", "Education", "Healthcare", "Research & Development", "Government", "Non-Profit", "Private Sector"],
    deadline: ["This Week", "This Month", "Next 3 Months", "Next 6 Months"],
  };

  const handleChange = (type, value) => {
    setFilters((prev) => {
      const updated = { ...prev };
      updated[type] = prev[type]?.includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...(prev[type] || []), value];
      return updated;
    });
  };

  const content = (
    <div className="p-4 w-64 bg-white h-full overflow-y-auto border-r">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[22px] font-semibold text-[#000000]">Filters</h3>
        <button
          onClick={onClose}
          className="hover:cursor-pointer"
          aria-label="Close filters"
          title="Close filters"
        >
          <MdOutlineClose className="w-6 h-6 text-[#4B5563] hover:text-[#111827] shrink-0" />
        </button>
      </div>

      {Object.entries(categories).map(([category, values]) => (
        <div key={category} className="mb-4">
          <h3 className="text-[16px] font-medium text-[#111827] capitalize mb-2">
            {category.replace(/([A-Z])/g, " $1")}
          </h3>
          {values.map((value) => (
            <div key={value} className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2 text-[#4B5563] mt-1 w-3 h-3"
                checked={filters[category]?.includes(value) || false}
                onChange={() => handleChange(category, value)}
              />
              <label className="text-[16px] text-[#6B7280]">{value}</label>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] z-40">
      {isOpen && content}
    </div>
  );
};

// Grants Filter Sidebar Component
const GrantsFilterSidebar = ({ isOpen, onClose, grantFilters, setGrantFilters }) => {
  const fundingInstrumentTypes = ['Grant', 'Cooperative Agreement', 'Procurement Contract', 'Other'];
  const expectedNumberOfAwards = ['0-10', '10-25', '25-50', '50-100', '>100'];
  const awardCeiling = ['0-10000', '10000-50000', '50000-100000', '>100000'];
  const costSharingMatchRequirement = ['Yes', 'No'];
  const opportunityStatus = ['Posted', 'Forecasted'];
  const deadlineRange = ['30', '90', '180'];

  const handleChange = (type, value) => {
    setGrantFilters((prev) => {
      const updated = { ...prev };
      updated[type] = prev[type]?.includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...(prev[type] || []), value];
      return updated;
    });
  };

  const resetFilters = () => {
    setGrantFilters({
      fundingInstrumentType: [],
      expectedNumberOfAwards: [],
      awardCeiling: [],
      costSharingMatchRequirement: [],
      opportunityStatus: [],
      deadlineRange: []
    });
  };

  const content = (
    <div className="p-4 w-64 bg-white h-full overflow-y-auto border-r">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[22px] font-semibold text-[#000000]">Grants Filters</h3>
        <button
          onClick={onClose}
          className="hover:cursor-pointer"
          aria-label="Close filters"
          title="Close filters"
        >
          <MdOutlineClose className="w-6 h-6 text-[#4B5563] hover:text-[#111827] shrink-0" />
        </button>
      </div>

      {/* Funding Instrument Type */}
      <div className="mb-4">
        <h3 className="text-[16px] font-medium text-[#111827] mb-2">Funding Instrument Type</h3>
        {fundingInstrumentTypes.map((value) => (
          <div key={value} className="flex items-center mb-2">
            <input
              type="checkbox"
              className="mr-2 text-[#4B5563] mt-1 w-3 h-3"
              checked={grantFilters.fundingInstrumentType?.includes(value) || false}
              onChange={() => handleChange('fundingInstrumentType', value)}
            />
            <label className="text-[16px] text-[#6B7280]">{value}</label>
          </div>
        ))}
      </div>

      {/* Expected Number of Awards */}
      <div className="mb-4">
        <h3 className="text-[16px] font-medium text-[#111827] mb-2">Expected Number of Awards</h3>
        {expectedNumberOfAwards.map((value) => (
          <div key={value} className="flex items-center mb-2">
            <input
              type="checkbox"
              className="mr-2 text-[#4B5563] mt-1 w-3 h-3"
              checked={grantFilters.expectedNumberOfAwards?.includes(value) || false}
              onChange={() => handleChange('expectedNumberOfAwards', value)}
            />
            <label className="text-[16px] text-[#6B7280]">{value}</label>
          </div>
        ))}
      </div>

      {/* Award Ceiling */}
      <div className="mb-4">
        <h3 className="text-[16px] font-medium text-[#111827] mb-2">Award Ceiling</h3>
        {awardCeiling.map((value) => (
          <div key={value} className="flex items-center mb-2">
            <input
              type="checkbox"
              className="mr-2 text-[#4B5563] mt-1 w-3 h-3"
              checked={grantFilters.awardCeiling?.includes(value) || false}
              onChange={() => handleChange('awardCeiling', value)}
            />
            <label className="text-[16px] text-[#6B7280]">{value}</label>
          </div>
        ))}
      </div>

      {/* Cost Sharing Match Requirement */}
      <div className="mb-4">
        <h3 className="text-[16px] font-medium text-[#111827] mb-2">Cost Sharing Match Requirement</h3>
        {costSharingMatchRequirement.map((value) => (
          <div key={value} className="flex items-center mb-2">
            <input
              type="checkbox"
              className="mr-2 text-[#4B5563] mt-1 w-3 h-3"
              checked={grantFilters.costSharingMatchRequirement?.includes(value) || false}
              onChange={() => handleChange('costSharingMatchRequirement', value)}
            />
            <label className="text-[16px] text-[#6B7280]">{value}</label>
          </div>
        ))}
      </div>

      {/* Opportunity Status */}
      <div className="mb-4">
        <h3 className="text-[16px] font-medium text-[#111827] mb-2">Opportunity Status</h3>
        {opportunityStatus.map((value) => (
          <div key={value} className="flex items-center mb-2">
            <input
              type="checkbox"
              className="mr-2 text-[#4B5563] mt-1 w-3 h-3"
              checked={grantFilters.opportunityStatus?.includes(value) || false}
              onChange={() => handleChange('opportunityStatus', value)}
            />
            <label className="text-[16px] text-[#6B7280]">{value}</label>
          </div>
        ))}
      </div>

      {/* Deadline Range */}
      <div className="mb-4">
        <h3 className="text-[16px] font-medium text-[#111827] mb-2">Deadline Range (Days)</h3>
        {deadlineRange.map((value) => (
          <div key={value} className="flex items-center mb-2">
            <input
              type="checkbox"
              className="mr-2 text-[#4B5563] mt-1 w-3 h-3"
              checked={grantFilters.deadlineRange?.includes(value) || false}
              onChange={() => handleChange('deadlineRange', value)}
            />
            <label className="text-[16px] text-[#6B7280]">≤ {value} days</label>
          </div>
        ))}
      </div>

      {/* Reset Button */}
      <div className="mt-6">
        <button
          onClick={resetFilters}
          className="w-full px-4 py-2 bg-[#EF4444] text-white rounded-md hover:bg-[#DC2626] transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] z-40">
      {isOpen && content}
    </div>
  );
};

// PropTypes for LeftSidebar
LeftSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
};

// PropTypes for GrantsFilterSidebar
GrantsFilterSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  grantFilters: PropTypes.object.isRequired,
  setGrantFilters: PropTypes.func.isRequired,
};

// Custom MultiSelect Component for Industries
const IndustryMultiSelect = ({ selectedIndustries, onIndustryChange, industries }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredIndustries = industries.filter(industry =>
    industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleIndustry = (industry) => {
    if (selectedIndustries.includes(industry)) {
      onIndustryChange(selectedIndustries.filter(i => i !== industry));
    } else {
      onIndustryChange([...selectedIndustries, industry]);
    }
  };

  const handleRemoveIndustry = (industry) => {
    onIndustryChange(selectedIndustries.filter(i => i !== industry));
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedIndustries.map((industry) => (
          <span
            key={industry}
            className="inline-flex items-center gap-1 px-2 py-1 bg-[#2563EB] text-white text-xs rounded-full"
          >
            {industry}
            <button
              onClick={() => handleRemoveIndustry(industry)}
              className="ml-1 hover:text-red-200"
              aria-label={`Remove ${industry}`}
              title={`Remove ${industry}`}
            >
              <MdOutlineClose className="w-3 h-3 shrink-0" />
            </button>
          </span>
        ))}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-[#E5E7EB] rounded-md bg-white text-left hover:border-[#2563EB] focus:outline-none focus:ring-[2px] focus:ring-[#2563EB]"
      >
        <span className={selectedIndustries.length > 0 ? "text-[#111827]" : "text-[#9CA3AF]"}>
          {selectedIndustries.length > 0
            ? `${selectedIndustries.length} industr${selectedIndustries.length > 1 ? 'ies' : 'y'} selected`
            : "Select industries..."
          }
        </span>
        <MdOutlineExpandMore className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''} shrink-0`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E5E7EB] rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search industries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 border border-[#E5E7EB] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredIndustries.map((industry) => (
              <div
                key={industry}
                onClick={() => handleToggleIndustry(industry)}
                className="flex items-center justify-between px-3 py-2 hover:bg-[#F3F4F6] cursor-pointer"
              >
                <span className="text-sm text-[#111827]">{industry}</span>
                {selectedIndustries.includes(industry) && (
                  <MdOutlineCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes for IndustryMultiSelect
IndustryMultiSelect.propTypes = {
  selectedIndustries: PropTypes.arrayOf(PropTypes.string).isRequired,
  onIndustryChange: PropTypes.func.isRequired,
  industries: PropTypes.arrayOf(PropTypes.string).isRequired,
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, className = "" }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' ? onPageChange(page) : null}
          disabled={page === '...'}
          className={`px-3 py-2 text-sm font-medium rounded-md ${page === currentPage
            ? 'bg-[#2563EB] text-white'
            : page === '...'
              ? 'text-gray-400 cursor-default'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

// PropTypes for Pagination
Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

// PropTypes for Card Components
const RFPCardPropTypes = {
  rfp: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    budget: PropTypes.string,
    deadline: PropTypes.string,
    organization: PropTypes.string,
    logo: PropTypes.string,
    link: PropTypes.string,
    match: PropTypes.number,
    fundingType: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  isSaved: PropTypes.bool.isRequired,
  handleGenerateProposal: PropTypes.func.isRequired,
};

const RecentRFPCardPropTypes = {
  rfp: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    budget: PropTypes.string,
    deadline: PropTypes.string,
    organization: PropTypes.string,
    link: PropTypes.string,
    fundingType: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  isSaved: PropTypes.bool.isRequired,
};

const SavedRFPCardPropTypes = {
  rfp: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    organization: PropTypes.string,
    budget: PropTypes.string,
    deadline: PropTypes.string,
    link: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  isSaved: PropTypes.bool.isRequired,
};

const GrantCardPropTypes = {
  grant: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    OPPORTUNITY_TITLE: PropTypes.string.isRequired,
    FUNDING_DESCRIPTION: PropTypes.string.isRequired,
    AWARD_CEILING: PropTypes.string,
    ESTIMATED_APPLICATION_DUE_DATE: PropTypes.string,
    AGENCY_NAME: PropTypes.string,
    CATEGORY_OF_FUNDING_ACTIVITY: PropTypes.string,
    OPPORTUNITY_NUMBER_LINK: PropTypes.string,
    matchScore: PropTypes.number,
  }).isRequired,
  isSaved: PropTypes.bool.isRequired,
  handleGenerateProposal: PropTypes.func.isRequired,
};

const RecentGrantCardPropTypes = {
  grant: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    OPPORTUNITY_TITLE: PropTypes.string.isRequired,
    FUNDING_DESCRIPTION: PropTypes.string.isRequired,
    AWARD_CEILING: PropTypes.string,
    ESTIMATED_APPLICATION_DUE_DATE: PropTypes.string,
    CATEGORY_OF_FUNDING_ACTIVITY: PropTypes.string,
    OPPORTUNITY_NUMBER_LINK: PropTypes.string,
  }).isRequired,
  isSaved: PropTypes.bool.isRequired,
};

const SavedGrantCardPropTypes = {
  grant: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    OPPORTUNITY_TITLE: PropTypes.string.isRequired,
    AGENCY_NAME: PropTypes.string,
    AWARD_CEILING: PropTypes.string,
    ESTIMATED_APPLICATION_DUE_DATE: PropTypes.string,
    OPPORTUNITY_STATUS: PropTypes.string,
    OPPORTUNITY_NUMBER_LINK: PropTypes.string,
  }).isRequired,
  isSaved: PropTypes.bool.isRequired,
};

// Main Component
const Discover = () => {
  const [filters, setFilters] = useState({ category: [], deadline: [] });
  const [recommended, setRecommended] = useState([]);
  const [otherRFPs, setOtherRFPs] = useState([]);
  const [saved, setSaved] = useState([]);
  const [originalRecommended, setOriginalRecommended] = useState([]);
  const [originalOtherRFPs, setOriginalOtherRFPs] = useState([]);
  const [originalSaved, setOriginalSaved] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadGrantModalOpen, setUploadGrantModalOpen] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [availableIndustries, setAvailableIndustries] = useState([]);

  const [availableGrants, setAvailableGrants] = useState([]);
  const [selectedGrants, setSelectedGrants] = useState([]);
  const [loadingOtherRFPs, setLoadingOtherRFPs] = useState(false);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [loadingSave, setLoadingSave] = useState({});
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  // Add this state for upload loading
  const [isUploading, setIsUploading] = useState(false);
  const [fetchedRFPs, setFetchedRFPs] = useState(false);
  const { role } = useUser();

  // Grant-specific state variables
  const [recentGrants, setRecentGrants] = useState([]);
  const [otherGrants, setOtherGrants] = useState([]);
  const [savedGrants, setSavedGrants] = useState([]);
  const [originalRecentGrants, setOriginalRecentGrants] = useState([]);
  const [originalOtherGrants, setOriginalOtherGrants] = useState([]);
  const [originalSavedGrants, setOriginalSavedGrants] = useState([]);
  const [loadingRecentGrants, setLoadingRecentGrants] = useState(true);
  const [loadingOtherGrants, setLoadingOtherGrants] = useState(false);
  const [loadingSaveGrant, setLoadingSaveGrant] = useState({});
  const [fetchedGrants, setFetchedGrants] = useState(false);

  // Grant proposal modal state
  const [showGrantProposalModal, setShowGrantProposalModal] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);


  // Pagination state variables
  const [itemsPerPage] = useState(6); // 6 items per page for cards
  const [tableItemsPerPage] = useState(10); // 10 items per page for tables
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [currentGrantTablePage, setCurrentGrantTablePage] = useState(1);
  const [currentOtherRFPsPage, setCurrentOtherRFPsPage] = useState(1);
  const [currentOtherGrantsPage, setCurrentOtherGrantsPage] = useState(1);

  // Active tab state
  const [activeTab, setActiveTab] = useState("rfp");

  // Grant filters state
  const [grantFilters, setGrantFilters] = useState({
    fundingInstrumentType: [],
    expectedNumberOfAwards: [],
    awardCeiling: [],
    costSharingMatchRequirement: [],
    opportunityStatus: [],
    deadlineRange: []
  });

  //Generating State
  const [isGeneratingGrantProposal, setIsGeneratingGrantProposal] = useState(false);

  // Pagination functions
  const getCurrentPageItems = (items, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems, itemsPerPage) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  const handlePageChange = (page, setter) => {
    setter(page);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentTablePage(1);
    setCurrentGrantTablePage(1);
    setCurrentOtherRFPsPage(1);
    setCurrentOtherGrantsPage(1);
  }, [searchQuery, filters, selectedIndustries, grantFilters]);

  // Close filter sidebar when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsSearchFocused(false); // Close filter sidebar when switching tabs

    // Reset filters when switching tabs
    if (tab === "rfp") {
      setFilters({ category: [], deadline: [] });
    } else if (tab === "grants") {
      setGrantFilters({
        fundingInstrumentType: [],
        expectedNumberOfAwards: [],
        awardCeiling: [],
        costSharingMatchRequirement: [],
        opportunityStatus: [],
        deadlineRange: []
      });
    }
  };

  // Set available industries  and grants statically
  useEffect(() => {
    setAvailableIndustries([
      "Information Technology",
      "Healthcare",
      "Finance",
      "Education",
      "Manufacturing",
      "Retail",
      "Construction",
      "Consulting",
      "Marketing",
      "Legal",
      "Real Estate",
      "Transportation",
      "Hospitality",
      "Government",
      "Non-Profit",
      "Research & Development",
    ]);

    setAvailableGrants([
      "Agriculture",
      "Arts",
      "Business and Commerce ",
      "Community Development ",
      "Consumer Protection",
      "Disaster Prevention and Relief",
      "Education",
      "Employment, Labor and Training",
      "Energy",
      "Environment",
      "Food and Nutrition",
      "Health",
      "Housing",
      "Humanities",
      "Income Security and Social Services",
      "Information and Statistics",
      "Infrastructure Investment and Jobs Act (IIJA)",
      "Law, Justice and Legal Services",
      "Natural Resources",
      "Opportunity Zone Benefits",
      "Other",
      "Regional Development",
      "Science and Technology and other Research and Development",
      "Transportation",
    ]);
  }, []);

  // Function to fetch other RFPs based on selected industries
  const fetchOtherRFPs = async () => {
    if (selectedIndustries.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Industries Selected',
        text: 'Please select at least one industry to search for RFPs.',
        confirmButtonColor: '#2563EB'
      });
      return;
    }

    setLoadingOtherRFPs(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/getOtherRFPs`, {
        industries: selectedIndustries
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const rfps = res.data.otherRFPs || [];
      setOtherRFPs(rfps);
      setOriginalOtherRFPs(rfps);
    } catch (err) {
      //console.error("Failed to fetch other RFPs, using dummy data...");
      setOtherRFPs([]);
      setOriginalOtherRFPs([]);
    } finally {
      setLoadingOtherRFPs(false);
    }
  };

  const fetchRFPs = async () => {
    setLoadingRecommended(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/getRecommendedAndSavedRFPs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const { recommendedRFPs, savedRFPs } = res.data;

      setRecommended(recommendedRFPs ?? []);
      setOriginalRecommended(recommendedRFPs ?? []);
      setSaved(savedRFPs ?? []);
      setOriginalSaved(savedRFPs ?? []);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      //console.error("Backend failed, loading dummy data...");
      setError("Failed to load recommended and saved RFPs. Please try again later.");
    } finally {
      setLoadingRecommended(false);
    }
  };

  // Grant-specific functions
  const fetchGrants = async () => {
    setLoadingRecentGrants(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/getRecentAndSavedGrants`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const { recentGrants, savedGrants } = res.data;

      setRecentGrants(recentGrants ?? []);
      setOriginalRecentGrants(recentGrants ?? []);
      setSavedGrants(savedGrants ?? []);
      setOriginalSavedGrants(savedGrants ?? []);
      setRetryCount(0);
    } catch (err) {
      // console.error("Failed to load grants:", err);
      setError("Failed to load recent and saved grants. Please try again later.");
    } finally {
      setLoadingRecentGrants(false);
    }
  };

  const fetchOtherGrants = async () => {
    if (selectedGrants.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Industries Selected',
        text: 'Please select at least one industry to search for grants.',
        confirmButtonColor: '#2563EB'
      });
      return;
    }

    setLoadingOtherGrants(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/getOtherGrants`, {
        category: selectedGrants
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const grants = res.data || [];
      setOtherGrants(grants);
      setOriginalOtherGrants(grants);
    } catch (err) {
      // console.error("Failed to fetch other grants:", err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to fetch other grants',
        text: err.response?.data?.message || 'Failed to fetch other grants. Please try again.',
        confirmButtonColor: '#2563EB'
      });
      setOtherGrants([]);
      setOriginalOtherGrants([]);
    } finally {
      setLoadingOtherGrants(false);
    }
  };

  const handleSaveGrant = async (grant) => {
    setLoadingSaveGrant(prev => ({ ...prev, [grant._id]: true }));
    try {
      const res = await axios.post(`${API_BASE_URL}/saveGrant`, { grantId: grant._id }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.status === 200) {
        // Update saved grants
        setSavedGrants((prev) => [...prev, grant]);

        // Update recent grants to show as saved
        setRecentGrants((prev) =>
          prev.map(g => g._id === grant._id ? { ...g, isSaved: true } : g)
        );

        // Update other grants to show as saved
        setOtherGrants((prev) =>
          prev.map(g => g._id === grant._id ? { ...g, isSaved: true } : g)
        );

        // Update original arrays to maintain consistency
        setOriginalRecentGrants((prev) =>
          prev.map(g => g._id === grant._id ? { ...g, isSaved: true } : g)
        );
        setOriginalOtherGrants((prev) =>
          prev.map(g => g._id === grant._id ? { ...g, isSaved: true } : g)
        );

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Grant saved successfully!',
          confirmButtonColor: '#2563EB'
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      // console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.response?.data?.message || err.response?.data?.error || 'Failed to save grant. Please try again.',
        confirmButtonColor: '#2563EB'
      });
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.response?.data?.message || err.response?.data?.error || 'Failed to save grant. Please try again.',
        confirmButtonColor: '#2563EB'
      });
    } finally {
      setLoadingSaveGrant(prev => ({ ...prev, [grant._id]: false }));
    }
  };

  const handleUnsaveGrant = async (grantId) => {
    setLoadingSaveGrant(prev => ({ ...prev, [grantId]: true }));
    try {
      const res = await axios.post(`${API_BASE_URL}/unsaveGrant`, { grantId: grantId }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.status === 200) {
        // Remove from saved grants
        setSavedGrants((prev) => prev.filter((g) => g._id !== grantId));

        // Update recent grants to show as not saved
        setRecentGrants((prev) =>
          prev.map(g => g._id === grantId ? { ...g, isSaved: false } : g)
        );

        // Update other grants to show as not saved
        setOtherGrants((prev) =>
          prev.map(g => g._id === grantId ? { ...g, isSaved: false } : g)
        );

        // Update original arrays to maintain consistency
        setOriginalRecentGrants((prev) =>
          prev.map(g => g._id === grantId ? { ...g, isSaved: false } : g)
        );
        setOriginalOtherGrants((prev) =>
          prev.map(g => g._id === grantId ? { ...g, isSaved: false } : g)
        );

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Grant unsaved successfully!',
          confirmButtonColor: '#2563EB'
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      // console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Unsave Failed',
        text: err.response?.data?.message || err.response?.data?.error || 'Failed to unsave grant. Please try again.',
        confirmButtonColor: '#2563EB'
      });
      Swal.fire({
        icon: 'error',
        title: 'Unsave Failed',
        text: err.response?.data?.message || err.response?.data?.error || 'Failed to unsave grant. Please try again.',
        confirmButtonColor: '#2563EB'
      });
    } finally {
      setLoadingSaveGrant(prev => ({ ...prev, [grantId]: false }));
    }
  };



  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      fetchRFPs();
    } else {
      setError("Maximum retry attempts reached. Please refresh the page.");
    }
  };

  useEffect(() => {
    if (!fetchedRFPs) {
      fetchRFPs();
      setFetchedRFPs(true);
    }
  }, [fetchedRFPs, fetchRFPs]);

  // Fetch grants when grants tab is active
  useEffect(() => {
    if (activeTab === "grants" && !fetchedGrants) {
      fetchGrants();
      setFetchedGrants(true);
    }
  }, [activeTab, fetchedGrants, fetchGrants]);

  // Inject CSS styles for line-clamp and custom scrollbars
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .custom-scroll {
        scrollbar-width: thin;
        scrollbar-color: #CBD5E1 #F1F5F9;
      }
      
      .custom-scroll::-webkit-scrollbar {
        height: 8px;
      }
      
      .custom-scroll::-webkit-scrollbar-track {
        background: #F1F5F9;
        border-radius: 4px;
      }
      
      .custom-scroll::-webkit-scrollbar-thumb {
        background: #CBD5E1;
        border-radius: 4px;
      }
      
      .custom-scroll::-webkit-scrollbar-thumb:hover {
        background: #94A3B8;
      }
      
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #CBD5E1 #F1F5F9;
      }
      
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #F1F5F9;
        border-radius: 4px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #CBD5E1;
        border-radius: 4px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94A3B8;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const applyFilters = (rfps) => {
    return rfps.filter((rfp) => {
      if (
        filters.category.length &&
        (filters.category.includes("None") ? false : !filters.category.includes(rfp.fundingType))
      )
        return false;

      // Handle deadline filtering based on the deadline values
      if (filters.deadline.length) {
        const now = new Date();
        const deadlineDate = rfp.deadline === "Not Disclosed" ? new Date(now.getFullYear(), now.getMonth() + 6, now.getDate()) : new Date(rfp.deadline);
        if (isNaN(deadlineDate.getTime())) return true; // Skip invalid dates
        const hasMatchingDeadline = filters.deadline.some(filter => {
          switch (filter) {
            case "This Week":
              const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
              return deadlineDate <= weekFromNow;
            case "This Month":
              const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
              return deadlineDate <= monthFromNow;
            case "Next 3 Months":
              const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
              return deadlineDate <= threeMonthsFromNow;
            case "Next 6 Months":
              const sixMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
              return deadlineDate <= sixMonthsFromNow;
            case "Not Disclosed":
              return deadlineDate <= now;
            default:
              return true;
          }
        });
        if (!hasMatchingDeadline) return false;
      }

      return true;
    });
  };

  // Grant filtering function
  const applyGrantFilters = (grants) => {
    const filtered = grants.filter((grant) => {
      // Apply funding instrument type filter
      if (grantFilters.fundingInstrumentType.length > 0) {
        const fundingType = grant.FUNDING_INSTRUMENT_TYPE || 'Other';
        if (!grantFilters.fundingInstrumentType.includes(fundingType)) {
          return false;
        }
      }

      // Apply expected number of awards filter
      if (grantFilters.expectedNumberOfAwards.length > 0) {
        const expectedAwards = parseInt(grant.EXPECTED_NUMBER_OF_AWARDS) || 0;
        const hasMatchingRange = grantFilters.expectedNumberOfAwards.some(range => {
          switch (range) {
            case '0-10':
              return expectedAwards >= 0 && expectedAwards <= 10;
            case '10-25':
              return expectedAwards > 10 && expectedAwards <= 25;
            case '25-50':
              return expectedAwards > 25 && expectedAwards <= 50;
            case '50-100':
              return expectedAwards > 50 && expectedAwards <= 100;
            case '>100':
              return expectedAwards > 100;
            default:
              return true;
          }
        });
        if (!hasMatchingRange) return false;
      }

      // Apply award ceiling filter
      if (grantFilters.awardCeiling.length > 0) {
        const awardCeiling = parseInt(grant.AWARD_CEILING?.replace(/[^0-9]/g, '')) || 0;
        const hasMatchingRange = grantFilters.awardCeiling.some(range => {
          switch (range) {
            case '0-10000':
              return awardCeiling >= 0 && awardCeiling <= 10000;
            case '10000-50000':
              return awardCeiling > 10000 && awardCeiling <= 50000;
            case '50000-100000':
              return awardCeiling > 50000 && awardCeiling <= 100000;
            case '>100000':
              return awardCeiling > 100000;
            default:
              return true;
          }
        });
        if (!hasMatchingRange) return false;
      }

      // Apply cost sharing match requirement filter
      if (grantFilters.costSharingMatchRequirement.length > 0) {
        const costSharing = grant.COST_SHARING_MATCH_REQUIRMENT || 'No';
        if (!grantFilters.costSharingMatchRequirement.includes(costSharing)) {
          return false;
        }
      }

      // Apply opportunity status filter
      if (grantFilters.opportunityStatus.length > 0) {
        const status = grant.OPPORTUNITY_STATUS || 'Posted';
        if (!grantFilters.opportunityStatus.includes(status)) {
          return false;
        }
      }

      // Apply deadline range filter
      if (grantFilters.deadlineRange.length > 0) {
        const now = new Date();
        const deadlineDate = grant.ESTIMATED_APPLICATION_DUE_DATE === "Not Provided" || grant.ESTIMATED_APPLICATION_DUE_DATE === "Not Disclosed" ?
          new Date(now.getFullYear(), now.getMonth() + 6, now.getDate()) :
          new Date(grant.ESTIMATED_APPLICATION_DUE_DATE);

        if (isNaN(deadlineDate.getTime())) return true; // Skip invalid dates

        const hasMatchingRange = grantFilters.deadlineRange.some(range => {
          const daysDiff = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
          switch (range) {
            case '30':
              return daysDiff <= 30;
            case '90':
              return daysDiff <= 90;
            case '180':
              return daysDiff <= 180;
            default:
              return true;
          }
        });
        if (!hasMatchingRange) return false;
      }

      // Apply existing category and deadline filters
      if (
        filters.category.length &&
        (filters.category.includes("None") ? false : !filters.category.includes(grant.CATEGORY_OF_FUNDING_ACTIVITY))
      )
        return false;

      // Handle deadline filtering for grants
      if (filters.deadline.length) {
        const now = new Date();
        const deadlineDate = grant.ESTIMATED_APPLICATION_DUE_DATE === "Not Provided" ?
          new Date(now.getFullYear(), now.getMonth() + 6, now.getDate()) :
          new Date(grant.ESTIMATED_APPLICATION_DUE_DATE);
        if (isNaN(deadlineDate.getTime())) return true; // Skip invalid dates

        const hasMatchingDeadline = filters.deadline.some(filter => {
          switch (filter) {
            case "This Week":
              const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
              return deadlineDate <= weekFromNow;
            case "This Month":
              const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
              return deadlineDate <= monthFromNow;
            case "Next 3 Months":
              const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
              return deadlineDate <= threeMonthsFromNow;
            case "Next 6 Months":
              const sixMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
              return deadlineDate <= sixMonthsFromNow;
            default:
              return true;
          }
        });
        if (!hasMatchingDeadline) return false;
      }

      return true;
    });

    return filtered;
  };

  const handleSave = async (rfp) => {
    setLoadingSave(prev => ({ ...prev, [rfp._id]: true }));
    try {
      const res = await axios.post(`${API_BASE_URL}/saveRFP`, { rfpId: rfp._id, rfp: rfp }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.status === 201 || res.status === 200) {
        // Update saved RFPs
        setSaved((prev) => [...prev, rfp]);

        // Update recommended RFPs to show as saved
        setRecommended((prev) =>
          prev.map(r => r._id === rfp._id ? { ...r, isSaved: true } : r)
        );

        // Update other RFPs to show as saved
        setOtherRFPs((prev) =>
          prev.map(r => r._id === rfp._id ? { ...r, isSaved: true } : r)
        );

        // Update original arrays to maintain consistency
        setOriginalRecommended((prev) =>
          prev.map(r => r._id === rfp._id ? { ...r, isSaved: true } : r)
        );
        setOriginalOtherRFPs((prev) =>
          prev.map(r => r._id === rfp._id ? { ...r, isSaved: true } : r)
        );
        setOriginalSaved((prev) =>
          prev.map(r => r._id === rfp._id ? { ...r, isSaved: true } : r)
        );
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'RFP saved successfully!',
          confirmButtonColor: '#2563EB'
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        //console.log("RFP data:", rfp);
      }
    } catch (err) {
      //console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.response?.data?.message || err.response?.data?.error || 'Failed to save RFP. Please try again.',
        confirmButtonColor: '#2563EB'
      });
    } finally {
      setLoadingSave(prev => ({ ...prev, [rfp._id]: false }));
    }
  };

  const handleUnsave = async (rfpId) => {
    setLoadingSave(prev => ({ ...prev, [rfpId]: true }));
    try {
      //console.log("sending request...");
      const res = await axios.post(`${API_BASE_URL}/unsaveRFP`, { rfpId: rfpId }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.status === 200) {
        //console.log("Handling Unsave...");
        // Remove from saved RFPs
        setSaved((prev) => prev.filter((r) => r._id !== rfpId));

        // Update recommended RFPs to show as not saved
        setRecommended((prev) =>
          prev.map(r => r._id === rfpId ? { ...r, isSaved: false } : r)
        );

        // Update other RFPs to show as not saved
        setOtherRFPs((prev) =>
          prev.map(r => r._id === rfpId ? { ...r, isSaved: false } : r)
        );

        // Update original arrays to maintain consistency
        setOriginalRecommended((prev) =>
          prev.map(r => r._id === rfpId ? { ...r, isSaved: false } : r)
        );
        setOriginalOtherRFPs((prev) =>
          prev.map(r => r._id === rfpId ? { ...r, isSaved: false } : r)
        );
        setOriginalSaved((prev) =>
          prev.filter((r) => r._id !== rfpId)
        );
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'RFP unsaved successfully!',
          confirmButtonColor: '#2563EB'
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      //console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Unsave Failed',
        text: err.response?.data?.message || err.response?.data?.error || 'Failed to unsave RFP. Please try again.',
        confirmButtonColor: '#2563EB'
      });
    } finally {
      setLoadingSave(prev => ({ ...prev, [rfpId]: false }));
    }
  };

  const handleShare = (link) => {
    navigator.clipboard.writeText(link).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Link copied to clipboard!',
        confirmButtonColor: '#2563EB',
        timer: 2000,
        showConfirmButton: false
      });
    }).catch((err) => {
      //console.error("Failed to copy link:", err);
      Swal.fire({
        icon: 'error',
        title: 'Copy Failed',
        text: err.response?.data?.message || err.response?.data?.error || 'Failed to copy link to clipboard',
        confirmButtonColor: '#2563EB'
      });
    });
  };

  const handleGenerateProposal = (rfp) => {
    //console.log("Generating proposal for:", rfp.title);
    // navigate, open modal, or call backend here
    navigate("/proposal_page", { state: { proposal: rfp } });
  };

  const handleGenerateGrantProposal = (grant) => {
    //console.log("Generating grant proposal for:", grant.OPPORTUNITY_TITLE);
    // Open the grant proposal modal
    setSelectedGrant(grant);

    // // Reset form data to empty
    // setGrantProposalData({
    //   summary: "",
    //   objectives: "",
    //   activities: "",
    //   beneficiaries: "",
    //   geography: "",
    //   start_date: "",
    //   estimated_duration: "",
    //   budget: {
    //     total_project_cost: "",
    //     total_requested_amount: "",
    //     cost_share_required: "",
    //     budget_breakdown: ""
    //   },
    //   methods_for_measuring_success: ""
    // });

    setShowGrantProposalModal(true);
  };





  const handleSubmitGrantProposal = async (proposalData) => {
    // Set generating state to true
    setIsGeneratingGrantProposal(true);

    try {
      // Validate required fields
      const requiredFields = [
        'summary',
        'objectives',
        'activities',
        'beneficiaries',
        'geography',
        'start_date',
        'estimated_duration',
        'total_project_cost',
        'total_requested_amount',
        'cost_share_required',
        'budget_breakdown',
        'methods_for_measuring_success'
      ];

      const missingFields = requiredFields.filter(field => {
        if (field === 'summary' || field === 'geography' || field === 'estimated_duration' || field === 'objectives' || field === 'activities' || field === 'beneficiaries' || field === 'methods_for_measuring_success') {
          return !proposalData[field] || proposalData[field].trim() === '';
        }

        if (field === 'total_project_cost' || field === 'total_requested_amount' || field === 'cost_share_required' || field === 'budget_breakdown') {
          return !proposalData.budget[field] || proposalData.budget[field].toString().trim() === '';
        }

        return !proposalData[field] || proposalData[field].toString().trim() === '';
      });

      if (missingFields.length > 0) {
        // Set generating state to false
        setIsGeneratingGrantProposal(false);
        Swal.fire({
          icon: 'warning',
          title: 'Required Fields Missing',
          text: `Please fill in the following required fields: ${missingFields.join(', ')}`,
          confirmButtonColor: '#2563EB'
        });
        return;
      }

      // Validate budget fields
      const totalProjectCost = parseFloat(proposalData.budget.total_project_cost);
      const totalRequestedAmount = parseFloat(proposalData.budget.total_requested_amount);

      if (isNaN(totalProjectCost) || totalProjectCost <= 0) {
        setIsGeneratingGrantProposal(false);
        Swal.fire({
          icon: 'error',
          title: 'Invalid Budget',
          text: err.response?.data?.message || err.response?.data?.error || 'Total project cost must be a positive number.',
          confirmButtonColor: '#2563EB'
        });
        return;
      }

      if (isNaN(totalRequestedAmount) || totalRequestedAmount <= 0) {
        setIsGeneratingGrantProposal(false);
        Swal.fire({
          icon: 'error',
          title: 'Invalid Budget',
          text: err.response?.data?.message || err.response?.data?.error || 'Total requested amount must be a positive number.',
          confirmButtonColor: '#2563EB'
        });
        return;
      }

      // Check if total requested amount exceeds grant award ceiling
      if (selectedGrant.AWARD_CEILING && selectedGrant.AWARD_CEILING !== "Not Provided") {
        const awardCeiling = parseFloat(selectedGrant.AWARD_CEILING.replace(/[^0-9.]/g, ''));
        if (!isNaN(awardCeiling) && totalRequestedAmount > awardCeiling) {
          setIsGeneratingGrantProposal(false);
          Swal.fire({
            icon: 'error',
            title: 'Budget Exceeds Limit',
            text: err.response?.data?.message || err.response?.data?.error || `Total requested amount (${totalRequestedAmount}) cannot exceed the grant award ceiling (${awardCeiling}).`,
            confirmButtonColor: '#2563EB'
          });
          return;
        }
      }

      if (totalRequestedAmount > totalProjectCost) {
        setIsGeneratingGrantProposal(false);
        Swal.fire({
          icon: 'error',
          title: 'Invalid Budget',
          text: err.response?.data?.message || err.response?.data?.error || 'Total requested amount cannot exceed total project cost.',
          confirmButtonColor: '#2563EB'
        });
        return;
      }

      // Here you can handle the submission of the grant proposal data
      const res = await axios.post(`${API_BASE_URL}/sendGrantDataForProposalGeneration`, {
        formData: proposalData,
        grant: selectedGrant
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.status === 200) {
        if (res.data.message === "Grant Proposal Generation completed successfully.") {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: res.data.message || 'Grant proposal generated successfully!',
            confirmButtonColor: '#2563EB'
          });
          setTimeout(() => {
            localStorage.setItem('proposalType', "GRANT");
            navigate('/editor', {
              state: {
                jsonData: res.data.proposal, proposalId: res.data.proposalId
              }
            });
          }, 1000);
        } else if (res.data.message === "Grant Proposal Generation is in Progress. Please visit again after some time.") {
          Swal.fire({
            icon: 'info',
            title: 'In Progress',
            text: res.data.message || 'Grant proposal is being generated. Please visit again after some time.',
            confirmButtonColor: '#2563EB'
          });
        } else if (res.data.message === "Grant Proposal Generation is still in progress. Please wait for it to complete.") {
          Swal.fire({
            icon: 'info',
            title: 'In Progress',
            text: res.data.message || 'Grant proposal is still being generated. Please visit again after some time.',
            confirmButtonColor: '#2563EB'
          });
        } else if (res.data.message === "A proposal with the same Grant ID already exists in draft. Please edit the draft proposal instead of generating a new one.") {
          Swal.fire({
            icon: 'warning',
            title: 'Duplicate Proposal',
            text: res.data.message || 'A proposal with the same Grant ID already exists in draft. Please edit the draft proposal instead of generating a new one.',
            confirmButtonColor: '#2563EB'
          });
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Failed',
            text: res.data.message || res.data.error || 'Failed to generate Grant proposal. Please try again.',
            confirmButtonColor: '#2563EB'
          });
        }
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Failed',
          text: res.data.message || res.data.error || 'Failed to generate Grant proposal. Please try again.',
          confirmButtonColor: '#2563EB'
        });
      }

      // Close the modal
      setShowGrantProposalModal(false);
      setSelectedGrant(null);

      // You can add navigation or other logic here
      // navigate("/grant_proposal_page", { state: { grant: selectedGrant, proposalData: proposalData } });
      // console.log("Grant proposal Data:", proposalData);
      // console.log("Selected Grant:", selectedGrant);

    } catch (error) {
      // console.error("Error generating Grant proposal:", error);
      Swal.fire({
        icon: 'warning',
        title: 'Failed',
        text: error.response?.data?.message || error.response?.data?.error || 'Failed to generate Grant proposal. Please try again.',
        confirmButtonColor: '#2563EB'
      });
    } finally {
      // Always set loading to false
      setIsGeneratingGrantProposal(false);
    }
  };

  const RFPCard = ({ rfp, isSaved, handleGenerateProposal }) => (
    <div className="bg-[#F8FAFC] rounded-xl p-4 shadow w-[355px] mr-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          {(rfp.logo && rfp.logo !== "None") && <img src={rfp.logo} alt="Logo" className="w-12 h-12 rounded-full object-cover object-center" />}
          {(!rfp.logo || rfp.logo === "None") && <div className="w-12 h-12 rounded-full bg-[#2563EB] flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>}
          <span className="text-[10px] text-[#15803D] bg-[#DCFCE7] px-2 py-1 rounded-full">
            {rfp.match}% Match
          </span>
        </div>
        <h3 className="font-semibold text-[#111827] text-[18px] mb-1">{rfp.title || "Not Disclosed"}</h3>
        <p className="text-[16px] text-[#4B5563] mb-2 truncate overflow-hidden whitespace-nowrap">{rfp.description || "Not Disclosed"}</p>
        <div className="text-[14px] text-[#4B5563CC] space-y-1">
          <div className="flex items-center gap-2">
            <MdOutlinePayments className="text-[16px] text-[#2563EB] shrink-0" /> {rfp.budget === "Not found" ? "Not Disclosed" : rfp.budget}
          </div>
          <div className="flex items-center gap-2">
            <MdOutlineCalendarMonth className="text-[16px] text-[#4B5563] shrink-0" /> Deadline: {rfp.deadline || "Not Disclosed"}
          </div>
          <div className="flex items-center gap-2">
            <MdOutlineAccountBalance className="text-[16px] text-[#4B5563] shrink-0" />
            <p className="truncate overflow-hidden whitespace-nowrap"> {rfp.organization || "Not Disclosed"} </p>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-3 text-[#111827] text-lg">
            {loadingSave[rfp._id] ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#111827]"></div>
            ) : isSaved ? (
              <MdOutlineBookmark
                onClick={role === "Viewer" ? undefined : () => handleUnsave(rfp._id)}
                className={`${role === "Viewer" ? "cursor-not-allowed opacity-50" : "cursor-pointer"} text-[#111827]`}
                title={role === "Viewer" ? "Viewer cannot unsave" : "Unsave"}
              />
            ) : (
              <FaRegBookmark onClick={() => handleSave(rfp)} className="cursor-pointer" title="Save" />
            )}
            <MdOutlineShare onClick={() => handleShare(rfp.link)} className="cursor-pointer text-[#111827]" title="Share" />
          </div>

          <div className="flex justify-center mt-3 gap-2">
            <button
              onClick={() => handleGenerateProposal(rfp)}
              className="text-[#2563EB] text-[14px] font-medium hover:underline"
            >
              Generate
            </button>

            <a href={rfp.link}
              className="text-[14px] text-white bg-[#2563EB] px-2 py-1 rounded-md"
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const RecentRFPCard = ({ rfp, isSaved }) => (
    <div className={`bg-white rounded-xl p-4 shadow-sm w-full mr-4 flex flex-col justify-between border border-[#E5E7EB] flex-shrink-0`}>
      {/* Top Row: Title and Actions */}
      <div>
        <div className="flex justify-between items-center gap-8 mb-2">
          <h3 className="font-semibold text-[#111827] text-[18px]">{rfp.title || "Not Disclosed"}</h3>
          <div className="flex top-2 gap-2 text-lg text-[#111827]">
            {loadingSave[rfp._id] ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#111827] shrink-0"></div>
            ) : isSaved ? (
              <MdOutlineBookmark
                onClick={role === "Viewer" ? undefined : () => handleUnsave(rfp._id)}
                className={`${role === "Viewer" ? "cursor-not-allowed opacity-50" : "cursor-pointer"} shrink-0`}
                title={role === "Viewer" ? "Viewer cannot unsave" : "Unsave"}
              />
            ) : (
              <FaRegBookmark
                onClick={() => handleSave(rfp)}
                className="cursor-pointer shrink-0"
                title="Save"
              />
            )}
            <MdOutlineShare
              onClick={() => handleShare(rfp.link)}
              className="cursor-pointer shrink-0"
              title="Share"
            />
          </div>
        </div>

        {/* Description */}
        <p className="text-[14px] text-[#4B5563] mb-3 line-clamp-2">
          {rfp.description || "Not Disclosed"}
        </p>

        {/* Meta Info */}
        <div className="text-[14px] text-[#6B7280] mb-4 space-y-1">
          <div className="flex items-center gap-2">
            <MdOutlineCalendarMonth className="text-[16px] shrink-0" />
            <span>Deadline: {rfp.deadline || "Not Disclosed"}</span>
          </div>
          {/* <div className="flex items-center gap-2">
              <MdOutlineAccountBalance className="text-[16px]" />
              <span>{rfp.organization || "Not Disclosed"}</span>
            </div> */}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <span className="font-semibold text-[#2563EB] shrink-0">{rfp.budget === "Not found" ? "Not Disclosed" : rfp.budget || "Not Disclosed"}</span>
        <a
          href={rfp.link}
          className="text-[14px] text-[#2563EB]"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Details
        </a>
      </div>
    </div>
  );

  const SavedRFPCard = ({ rfp, isSaved }) => {
    return (
      <tr className="border-b last:border-none hover:bg-gray-50">
        <td className="px-4 py-3 text-left">
          <div className="font-medium text-[#111827] text-[14px] max-w-[200px] truncate" title={rfp.title}>
            {rfp.title || "Not Disclosed"}
          </div>
        </td>
        <td className="px-4 py-3 text-left">
          <div className="text-[#4B5563] text-[14px] max-w-[150px] truncate" title={rfp.organization}>
            {rfp.organization || "Not Disclosed"}
          </div>
        </td>
        <td className="px-4 py-3 text-left">
          <span className="text-[#2563EB] text-[14px] font-semibold">
            {rfp.budget === "Not found" ? "Not Disclosed" : rfp.budget || "Not Disclosed"}
          </span>
        </td>
        <td className="px-4 py-3 text-left">
          <div className="text-[#4B5563] text-[14px]">
            {rfp.deadline || "Not Disclosed"}
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <span
            className={`text-[12px] px-3 py-1 rounded-full font-medium ${STATUS_STYLES[rfp.status] || "bg-gray-100 text-gray-600"
              }`}
          >
            {rfp.status || "None"}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <div className="flex gap-2 text-xl justify-center text-[#4B5563]">
            <MdOutlineShare
              title="Share"
              className="cursor-pointer hover:text-[#2563EB] transition-colors shrink-0"
              onClick={() => handleShare(rfp.link)}
            />
            {loadingSave[rfp._id] ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#4B5563] shrink-0"></div>
            ) : isSaved ? (
              <MdOutlineBookmark
                onClick={role === "Viewer" ? undefined : () => handleUnsave(rfp._id)}
                className={`${role === "Viewer" ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-[#2563EB] transition-colors"} shrink-0`}
                title={role === "Viewer" ? "Viewer cannot unsave" : "Unsave"}
              />
            ) : (
              <FaRegBookmark
                onClick={() => handleSave(rfp)}
                className="cursor-pointer hover:text-[#2563EB] transition-colors shrink-0"
                title="Save"
              />
            )}
          </div>
        </td>
      </tr>
    );
  };

  // Grant Card Components
  const GrantCard = ({ grant, isSaved, handleGenerateProposal }) => (
    <div className="bg-[#F8FAFC] rounded-xl p-4 shadow w-[355px] mr-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-[#15803D] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          {grant.matchScore && (
            <span className="text-[10px] text-[#15803D] bg-[#DCFCE7] px-2 py-1 rounded-full">
              {grant.matchScore}% Match
            </span>
          )}
        </div>
        <h3 className="font-semibold text-[#111827] text-[18px] mb-1 line-clamp-2">{grant.OPPORTUNITY_TITLE}</h3>
        <p className="text-[16px] text-[#4B5563] mb-2 line-clamp-3">{grant.FUNDING_DESCRIPTION}</p>
        <div className="text-[14px] text-[#4B5563CC] space-y-1">
          <div className="flex items-center gap-2">
            <MdOutlinePayments className="text-[16px] text-[#4B5563]" />
            {grant.AWARD_CEILING === "Not Provided" ? "Not Disclosed" : grant.AWARD_CEILING}
          </div>
          <div className="flex items-center gap-2">
            <MdOutlineCalendarMonth className="text-[16px] text-[#4B5563]" />
            Deadline: {grant.ESTIMATED_APPLICATION_DUE_DATE === "Not Provided" ? "Not Disclosed" : grant.ESTIMATED_APPLICATION_DUE_DATE}
          </div>
          <div className="flex items-center gap-2">
            <MdOutlineAccountBalance className="text-[16px] text-[#4B5563] shrink-0" />
            <p className="truncate overflow-hidden whitespace-nowrap"> {grant.AGENCY_NAME} </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded">
              {grant.CATEGORY_OF_FUNDING_ACTIVITY}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-3 text-[#111827] text-lg">
            {loadingSaveGrant[grant._id] ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#111827] shrink-0"></div>
            ) : isSaved ? (
              <MdOutlineBookmark
                onClick={role === "Viewer" ? undefined : () => handleUnsaveGrant(grant._id)}
                className={`${role === "Viewer" ? "cursor-not-allowed opacity-50" : "cursor-pointer"} text-[#111827] shrink-0`}
                title={role === "Viewer" ? "Viewer cannot unsave" : "Unsave"}
              />
            ) : (
              <FaRegBookmark onClick={() => handleSaveGrant(grant)} className="cursor-pointer shrink-0" title="Save" />
            )}
            <MdOutlineShare onClick={() => handleShare(grant.OPPORTUNITY_NUMBER_LINK)} className="cursor-pointer text-[#111827] shrink-0" title="Share" />
          </div>

          <div className="flex justify-center mt-3 gap-2">
            <button
              onClick={() => handleGenerateGrantProposal(grant)}
              className="text-[#2563EB] text-[14px] font-medium hover:underline"
            >
              Generate
            </button>

            <a href={grant.OPPORTUNITY_NUMBER_LINK}
              className="text-[14px] text-white bg-[#2563EB] px-2 py-1 rounded-md"
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const RecentGrantCard = ({ grant, isSaved, width }) => (
    <div className={`bg-white rounded-xl p-4 shadow-sm ${width === "355px" ? "w-[355px]" : "w-full"} mr-4 flex flex-col justify-between border border-[#E5E7EB] flex-shrink-0`}>
      <div>
        <div className="flex justify-between items-center gap-8 mb-2">
          <h3 className="font-semibold text-[#111827] text-[18px] line-clamp-2">{grant.OPPORTUNITY_TITLE}</h3>
          <div className="flex top-2 gap-2 text-lg text-[#111827]">
            {loadingSaveGrant[grant._id] ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B5563] shrink-0"></div>
            ) : isSaved ? (
              <MdOutlineBookmark
                onClick={role === "Viewer" ? undefined : () => handleUnsaveGrant(grant._id)}
                className={`${role === "Viewer" ? "cursor-not-allowed opacity-50" : "cursor-pointer"} shrink-0`}
                title={role === "Viewer" ? "Viewer cannot unsave" : "Unsave"}
              />
            ) : (
              <FaRegBookmark
                onClick={() => handleSaveGrant(grant)}
                className="cursor-pointer shrink-0"
                title="Save"
              />
            )}
            <MdOutlineShare
              onClick={() => handleShare(grant.OPPORTUNITY_NUMBER_LINK)}
              className="cursor-pointer shrink-0"
              title="Share"
            />
          </div>
        </div>

        <p className="text-[14px] text-[#4B5563] mb-3 line-clamp-2">
          {grant.FUNDING_DESCRIPTION}
        </p>

        <div className="text-[14px] text-[#6B7280] mb-4 space-y-1">
          <div className="flex items-center gap-2">
            <MdOutlineCalendarMonth className="text-[16px] shrink-0" />
            <span>Deadline: {grant.ESTIMATED_APPLICATION_DUE_DATE === "Not Provided" ? "Not Disclosed" : grant.ESTIMATED_APPLICATION_DUE_DATE}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded">
              {grant.CATEGORY_OF_FUNDING_ACTIVITY}
            </span>
            {grant.matchScore && (
              <span className="text-[10px] text-[#15803D] bg-[#DCFCE7] px-2 py-1 rounded-full">
                {grant.matchScore}% Match
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="font-semibold text-[#111827]">{grant.AWARD_CEILING === "none" ? "Not Disclosed" : `$${grant.AWARD_CEILING}`}</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleGenerateGrantProposal(grant)}
            className="text-[#2563EB] text-[14px] font-medium hover:underline"
          >
            Generate
          </button>
          <a
            href={grant.OPPORTUNITY_NUMBER_LINK}
            className="text-[14px] text-white bg-[#2563EB] px-2 py-1 rounded-md"
            target="_blank"
            rel="noopener noreferrer"
          >
            View
          </a>
        </div>
      </div>
    </div>
  );

  const SavedGrantCard = ({ grant, isSaved }) => {
    return (
      <tr className="border-b last:border-none hover:bg-gray-50">
        <td className="px-4 py-3 text-left">
          <div className="font-medium text-[#111827] text-[14px] max-w-[200px] truncate" title={grant.OPPORTUNITY_TITLE}>
            {grant.OPPORTUNITY_TITLE}
          </div>
        </td>
        <td className="px-4 py-3 text-left">
          <div className="text-[#4B5563] text-[14px] max-w-[150px] truncate" title={grant.AGENCY_NAME}>
            {grant.AGENCY_NAME}
          </div>
        </td>
        <td className="px-4 py-3 text-left">
          <span className="text-[#2563EB] text-[14px] font-semibold">
            {grant.AWARD_CEILING === "none" ? "Not Disclosed" : `$${grant.AWARD_CEILING}`}
          </span>
        </td>
        <td className="px-4 py-3 text-left">
          <div className="text-[#4B5563] text-[14px]">
            {grant.ESTIMATED_APPLICATION_DUE_DATE === "Not Provided" ? "Not Disclosed" : grant.ESTIMATED_APPLICATION_DUE_DATE}
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <span
            className={`text-[12px] px-3 py-1 rounded-full font-medium ${grant.OPPORTUNITY_STATUS === "Posted" ? "bg-green-100 text-green-600" :
              grant.OPPORTUNITY_STATUS === "Forecasted" ? "bg-blue-100 text-blue-600" :
                grant.OPPORTUNITY_STATUS === "Closed" ? "bg-red-100 text-red-600" :
                  grant.OPPORTUNITY_STATUS === "Archived" ? "bg-gray-100 text-gray-600" :
                    "bg-gray-100 text-gray-600"
              }`}
          >
            {grant.OPPORTUNITY_STATUS || "None"}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <div className="flex gap-2 text-xl justify-center text-[#4B5563]">
            <MdOutlineShare
              title="Share"
              className="cursor-pointer hover:text-[#2563EB] transition-colors shrink-0"
              onClick={() => handleShare(grant.OPPORTUNITY_NUMBER_LINK)}
            />
            {loadingSaveGrant[grant._id] ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#4B5563] shrink-0"></div>
            ) : isSaved ? (
              <MdOutlineBookmark
                onClick={role === "Viewer" ? undefined : () => handleUnsaveGrant(grant._id)}
                className={`${role === "Viewer" ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-[#2563EB] transition-colors"} shrink-0`}
                title={role === "Viewer" ? "Viewer cannot unsave" : "Unsave"}
              />
            ) : (
              <FaRegBookmark
                onClick={() => handleSaveGrant(grant)}
                className="cursor-pointer hover:text-[#2563EB] transition-colors shrink-0"
                title="Save"
              />
            )}
          </div>
        </td>
      </tr>
    );
  };

  const UploadRFPModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
      file: null,
    });

    const [filePreview, setFilePreview] = useState(null);

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Check if file is PDF or TXT
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.txt')) {
          setFormData({ ...formData, file: file });
          setFilePreview(file.name);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Invalid File Type',
            text: err.response?.data?.message || 'Please upload only PDF or TXT files.',
            confirmButtonColor: '#2563EB'
          });
          e.target.value = '';
        }
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.file) {
        Swal.fire({
          icon: 'warning',
          title: 'No File Selected',
          text: err.response?.data?.message || 'Please upload a file.',
          confirmButtonColor: '#2563EB'
        });
        return;
      }

      setIsUploading(true);

      try {
        const formDataToSend = new FormData();
        formDataToSend.append('file', formData.file);

        const response = await axios.post(`${API_BASE_URL}/uploadRFP`, formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              'Content-Type': 'multipart/form-data'
            }
          });

        if (response.status === 200) {
          //Save the RFP to the useState array
          const rfp = response.data.rfp;
          //Add the RFP to the recommended array
          setRecommended(prev => [rfp, ...prev]);

          //Add the RFP to the originalRecommended array
          setOriginalRecommended(prev => [rfp, ...prev]);

          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: response.data.message,
            confirmButtonColor: '#2563EB'
          });
          onClose();
          // Optionally refresh the RFP list after successful upload
          // window.location.reload();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: 'Failed to add document. Please try again.',
            confirmButtonColor: '#2563EB'
          });
        }
      } catch (error) {
        // console.error('Error adding document:', error);
        const errorMessage = error.response?.data?.message || 'Failed to add document. Please try again.';
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: errorMessage,
          confirmButtonColor: '#2563EB'
        });
      } finally {
        setIsUploading(false);
      }
    };

    if (!isOpen) return null;

    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}></div>
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-96 max-w-[90vw] z-50 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Upload RFP File</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <MdOutlineClose className="w-6 h-6 shrink-0" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload RFP</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#2563EB] transition-colors">
                <input
                  type="file"
                  accept=".pdf, .txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="document-upload"
                  required
                />
                <label htmlFor="document-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <div className="text-gray-600">
                      <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-[#2563EB] hover:text-[#1d4ed8]">Click to upload</span> or drag and drop
                    </div>
                    <div className="text-xs text-gray-500">PDF or TXT file only</div>
                  </div>
                </label>
              </div>
              {filePreview && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">{filePreview}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, file: null });
                        setFilePreview(null);
                        document.getElementById('document-upload').value = '';
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <MdOutlineClose className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="flex-1 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </div>
          </form>
        </div>
      </>
    );
  };

  const UploadGrantModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
      file: null,
    });

    const [filePreview, setFilePreview] = useState(null);

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Check if file is PDF or TXT
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.txt')) {
          setFormData({ ...formData, file: file });
          setFilePreview(file.name);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Invalid File Type',
            text: 'Please upload only PDF or TXT files.',
            confirmButtonColor: '#2563EB'
          });
          e.target.value = '';
        }
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.file) {
        Swal.fire({
          icon: 'warning',
          title: 'No File Selected',
          text: 'Please upload a file.',
          confirmButtonColor: '#2563EB'
        });
        return;
      }

      setIsUploading(true);

      try {
        const formDataToSend = new FormData();
        formDataToSend.append('file', formData.file);

        const response = await axios.post(`${API_BASE_URL}/uploadGrant`, formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              'Content-Type': 'multipart/form-data'
            }
          });

        if (response.status === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: response.data.message,
            confirmButtonColor: '#2563EB'
          });
          onClose();
          // Optionally refresh the grant list after successful upload
          // window.location.reload();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: 'Failed to add document. Please try again.',
            confirmButtonColor: '#2563EB'
          });
        }
      } catch (error) {
        // console.error('Error adding document:', error);
        const errorMessage = error.response?.data?.message || 'Failed to add document. Please try again.';
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: errorMessage,
          confirmButtonColor: '#2563EB'
        });
      } finally {
        setIsUploading(false);
      }
    };

    if (!isOpen) return null;

    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}></div>
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-96 max-w-[90vw] z-50 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Upload Grant File</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <MdOutlineClose className="w-6 h-6 shrink-0" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Grant</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#2563EB] transition-colors">
                <input
                  type="file"
                  accept=".pdf, .txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="grant-document-upload"
                  required
                />
                <label htmlFor="grant-document-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <div className="text-gray-600">
                      <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-[#2563EB] hover:text-[#1d4ed8]">Click to upload</span> or drag and drop
                    </div>
                    <div className="text-xs text-gray-500">PDF or TXT file only</div>
                  </div>
                </label>
              </div>
              {filePreview && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">{filePreview}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, file: null });
                        setFilePreview(null);
                        document.getElementById('grant-document-upload').value = '';
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <MdOutlineClose className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="flex-1 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </div>
          </form>
        </div>
      </>
    );
  };

  // Filter data based on search query with memoization
  const getFilteredData = useCallback((originalData) => {
    if (!searchQuery.trim()) return originalData;

    return originalData.filter((rfp) => {
      const pattern = new RegExp(`\\b${searchQuery.toLowerCase()}`, "i");
      return pattern.test(rfp.title?.toLowerCase() || "") ||
        pattern.test(rfp.organization?.toLowerCase() || "") ||
        pattern.test(rfp.fundingType?.toLowerCase() || "");
    });
  }, [searchQuery]);

  // Grant search filtering
  const getFilteredGrantData = useCallback((originalData) => {
    if (!searchQuery.trim()) return originalData;

    return originalData.filter((grant) => {
      const pattern = new RegExp(`\\b${searchQuery.toLowerCase()}`, "i");
      return pattern.test(grant.OPPORTUNITY_TITLE?.toLowerCase() || "") ||
        pattern.test(grant.AGENCY_NAME?.toLowerCase() || "") ||
        pattern.test(grant.CATEGORY_OF_FUNDING_ACTIVITY?.toLowerCase() || "");
    });
  }, [searchQuery]);

  // Get filtered data for rendering with memoization
  const filteredRecommended = useMemo(() => getFilteredData(originalRecommended), [getFilteredData, originalRecommended]);
  const filteredOtherRFPs = useMemo(() => getFilteredData(originalOtherRFPs), [getFilteredData, originalOtherRFPs]);
  const filteredSaved = useMemo(() => getFilteredData(originalSaved), [getFilteredData, originalSaved]);

  // Get filtered grant data for rendering
  const filteredRecentGrants = useMemo(() => getFilteredGrantData(originalRecentGrants), [getFilteredGrantData, originalRecentGrants]);
  const filteredOtherGrants = useMemo(() => getFilteredGrantData(originalOtherGrants), [getFilteredGrantData, originalOtherGrants]);
  const filteredSavedGrants = useMemo(() => getFilteredGrantData(originalSavedGrants), [getFilteredGrantData, originalSavedGrants]);

  // Clear all filters function
  const clearAllFilters = () => {
    setFilters({ category: [], deadline: [] });
    setGrantFilters({
      fundingInstrumentType: [],
      expectedNumberOfAwards: [],
      awardCeiling: [],
      costSharingMatchRequirement: [],
      opportunityStatus: [],
      deadlineRange: []
    });
    setSelectedIndustries([]);
    setSearchQuery("");
  };

  // Check if any grant filters are active
  const hasActiveGrantFilters = () => {
    return Object.values(grantFilters).some(filterArray => filterArray.length > 0);
  };

  // Check if any RFP filters are active
  const hasActiveRFPFilters = () => {
    return Object.values(filters).some(filterArray => filterArray.length > 0);
  };

  // Check if any filters are active (including search and industries)
  const hasAnyActiveFilters = () => {
    return hasActiveRFPFilters() || hasActiveGrantFilters() || searchQuery.trim() !== "";
  };

  const flag = JSON.parse(localStorage.getItem("subscription"));

  return (
    <>
      {(flag && flag.plan_name == "None") ? (
        <div className="fixed inset-0 flex justify-center items-center bg-black/20 backdrop-blur-sm z-50">
          <div className="">
            <Subscription />

          </div>
        </div>
      ) : null}

      <div className="min-h-screen bg-[#FFFFFF]">
        {/* Loading Overlay */}
        {isGeneratingProposal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2563EB] mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Generating Your Proposal</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Please wait while we generate your proposal. This process may take a few moments as we analyze your data and generate a proposal.
              </p>
              <br />
              <p className="text-[#EF4444] text-sm leading-relaxed">
                Note: Do not refresh the page while the proposal is generating.
              </p>
            </div>
          </div>
        )}

        {error && !isGeneratingProposal && (
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to generate proposal. Please try again.',
            confirmButtonColor: '#2563EB'
          }).then(() => {
            setError(null);
          })
        )}

        <NavbarComponent />

        <LeftSidebar
          isOpen={isSearchFocused && activeTab === "rfp"}
          onClose={() => setIsSearchFocused(false)}
          filters={filters}
          setFilters={setFilters}
        />

        <GrantsFilterSidebar
          isOpen={isSearchFocused && activeTab === "grants"}
          onClose={() => setIsSearchFocused(false)}
          grantFilters={grantFilters}
          setGrantFilters={setGrantFilters}
        />
        <main className="pt-20 px-8 md:px-12 py-6 ml-0">
          {/* Search Bar Section */}
          <div className="flex  justify-center mx-auto text-lg space-x-6 border-b border-gray-200 p-4">
            <button
              className={`pb-2 px-6 rounded-t-lg transition-all duration-200 focus:outline-none ${activeTab === "rfp"
                ? "text-[#2563EB] font-bold border-b-2 border-[#2563EB] bg-[#E5E7EB] shadow"
                : "font-bold text-[#4B5563] hover:text-[#2563EB] hover:bg-[#E5E7EB]"
                }`}
              onClick={() => handleTabChange("rfp")}
            >
              RFP's
            </button>

            <button
              className={`pb-2 px-6 rounded-t-lg transition-all duration-200 focus:outline-none ${activeTab === "grants"
                ? "text-[#2563EB] font-bold border-b-2 border-[#2563EB] bg-[#E5E7EB] shadow"
                : "font-bold text-[#4B5563] hover:text-[#2563EB] hover:bg-[#E5E7EB]"
                }`}
              onClick={() => handleTabChange("grants")}
            >
              Grant's
            </button>
          </div>

          {activeTab === "rfp" && (
            <div className="mt-4">
              <div className="mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  {/* Search Input with Advanced Search Button */}
                  <div className="relative flex-1 w-full md:max-w-[90%]">
                    <div className="relative">
                      <MdOutlineSearch className="absolute w-6 h-6 left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] shrink-0" />
                      <input
                        type="text"
                        placeholder={activeTab === "rfp" ? "Search RFPs by title, organization or category" : "Search Grants by title, agency or category"}
                        className="w-full text-[18px] text-[#9CA3AF] bg-[#FFFFFF] pl-12 pr-32 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button
                        className={`absolute right-2 top-1/2 px-4 py-2 rounded-xl transform -translate-y-1/2 text-[14px] transition-colors ${activeTab === "rfp"
                          ? hasAnyActiveFilters()
                            ? "bg-[#2563EB] text-white"
                            : "bg-[#F3F4F6] text-[#111827] hover:bg-[#2563EB] hover:text-white"
                          : hasActiveGrantFilters()
                            ? "bg-[#2563EB] text-white"
                            : "bg-[#F3F4F6] text-[#111827] hover:bg-[#2563EB] hover:text-white"
                          }`}
                        onClick={() => setIsSearchFocused(true)}
                      >
                        {activeTab === "rfp"
                          ? hasAnyActiveFilters() ? "Filters Active" : "Advanced Search"
                          : hasActiveGrantFilters() ? "Filters Active" : "Grants Filters"
                        }
                      </button>
                    </div>

                    {/* Clear Filters Button */}
                    {hasAnyActiveFilters() && (
                      <button
                        onClick={clearAllFilters}
                        className="mt-2 px-4 py-2 text-sm text-[#EF4444] hover:text-[#DC2626] font-medium hover:underline flex items-center gap-1"
                      >
                        <MdOutlineClose className="w-4 h-4 shrink-0" title="Clear All Filters" />
                        Clear All Filters
                      </button>
                    )}
                  </div>

                  {/* Upload RFP Button */}
                  <button className="flex items-center gap-2 text-[16px] text-white bg-[#2563EB] px-4 py-3 rounded-md hover:cursor-pointer transition-colors"
                    onClick={() => setUploadModalOpen(true)}
                  >
                    <MdOutlineUpload className="w-5 h-5 shrink-0" title="Upload RFP" />
                    Upload RFP
                  </button>
                </div>
              </div>

              <h2 className="text-[24px] text-[#000000] font-semibold mb-4">AI Recommended RFPs</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-center">
                  <p className="text-red-700">{error}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-2 text-red-600 hover:text-red-800 underline"
                  >
                    {retryCount > 0 ? `Try again (${retryCount}/3)` : "Try again"}
                  </button>
                </div>
              )}
              {loadingRecommended ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
                  <span className="ml-3 text-[16px] text-[#4B5563]">Loading recommended RFPs...</span>
                </div>
              ) : filteredRecommended.length ? (
                <div className="flex overflow-x-auto pb-2 custom-scroll">
                  {applyFilters(filteredRecommended).map((rfp) => (
                    <RFPCard
                      key={rfp._id}
                      rfp={rfp}
                      isSaved={!!saved.find((s) => s._id === rfp._id)}
                      handleGenerateProposal={handleGenerateProposal}
                    />
                  ))}
                </div>
              ) : (
                (!error && (
                  <p className="text-[16px] text-[#4B5563]">Oops! Nothing here. Please fill the profile to get recommended RFPs.</p>
                ))
              )}

              <h2 className="text-[24px] text-[#000000] font-semibold mt-10 mb-4">Other RFPs</h2>
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  {/* Industry Selection */}
                  <div>
                    <label className="block text-[16px] font-medium text-[#111827] mb-2">
                      Select Industries to Filter RFPs
                    </label>
                    <IndustryMultiSelect
                      selectedIndustries={selectedIndustries}
                      onIndustryChange={setSelectedIndustries}
                      industries={availableIndustries}
                    />
                  </div>

                  {/* Search Button */}
                  <div className="flex justify-start md:justify-end">
                    <button
                      onClick={fetchOtherRFPs}
                      disabled={selectedIndustries.length === 0 || loadingOtherRFPs}
                      className={`flex items-center gap-2 px-6 py-3 rounded-md text-[16px] font-medium transition-colors ${selectedIndustries.length === 0 || loadingOtherRFPs
                        ? "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
                        : "bg-[#2563EB] text-white hover:bg-[#1d4ed8] cursor-pointer"
                        }`}
                    >
                      {loadingOtherRFPs ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Searching...</span>
                        </>
                      ) : (
                        <>
                          <MdOutlineSearch className="w-5 h-5 shrink-0" title="Search RFPs" />
                          <span>Search RFPs</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {loadingOtherRFPs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
                  <span className="ml-3 text-[16px] text-[#4B5563]">Loading RFPs...</span>
                </div>
              ) : filteredOtherRFPs.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pb-2 ">
                    {getCurrentPageItems(applyFilters(filteredOtherRFPs), currentOtherRFPsPage, itemsPerPage).map((rfp) => (
                      <RecentRFPCard
                        key={rfp._id}
                        rfp={rfp}
                        isSaved={!!saved.find((s) => s._id === rfp._id)}
                      />
                    ))}
                  </div>
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentOtherRFPsPage}
                      totalPages={getTotalPages(applyFilters(filteredOtherRFPs).length, itemsPerPage)}
                      onPageChange={(page) => handlePageChange(page, setCurrentOtherRFPsPage)}
                    />
                  </div>
                </>
              ) : filteredOtherRFPs.length === 0 && selectedIndustries.length > 0 ? (
                <div className="text-center py-8">
                  <p className="text-[16px] text-[#4B5563] mb-2">No RFPs found for the selected industries.</p>
                  <p className="text-[14px] text-[#6B7280]">Try selecting different industries or check back later for new opportunities.</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[16px] text-[#4B5563] mb-2">Select industries and click "Search RFPs" to discover relevant opportunities.</p>
                  <p className="text-[14px] text-[#6B7280]">Choose from the available industries to filter and find RFPs that match your expertise.</p>
                </div>
              )}

              <h2 className="text-[24px] text-[#000000] font-semibold mt-10 mb-4">Saved RFPs</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-center">
                  <p className="text-red-700">{error}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-2 text-red-600 hover:text-red-800 underline"
                  >
                    {retryCount > 0 ? `Try again (${retryCount}/3)` : "Try again"}
                  </button>
                </div>
              )}

              {!error && (
                filteredSaved.length > 0 ? (
                  <>
                    <div className="w-full bg-white rounded-xl shadow-sm border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-[#F8FAFC]">
                            <tr className="text-[#374151] text-[14px] font-medium">
                              <th className="px-4 py-3 text-left">RFP Title</th>
                              <th className="px-4 py-3 text-left">Organisation</th>
                              <th className="px-4 py-3 text-left">Amount</th>
                              <th className="px-4 py-3 text-left">Deadline</th>
                              <th className="px-4 py-3 text-center">Status</th>
                              <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getCurrentPageItems(filteredSaved, currentTablePage, tableItemsPerPage).map((rfp) => (
                              <SavedRFPCard
                                key={rfp._id}
                                rfp={rfp}
                                isSaved={true}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Pagination
                        currentPage={currentTablePage}
                        totalPages={getTotalPages(filteredSaved.length, tableItemsPerPage)}
                        onPageChange={(page) => handlePageChange(page, setCurrentTablePage)}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-[16px] text-[#4B5563]">Oops! Nothing here. Discover & save some RFPs to view them!</p>
                )
              )}
            </div>
          )}

          {activeTab === "grants" && (
            <div className="mt-4">
              <div className="mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  {/* Search Input with Advanced Search Button */}
                  <div className="relative flex-1 w-full md:max-w-[90%]">
                    <div className="relative">
                      <MdOutlineSearch className="absolute w-6 h-6 left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] shrink-0" />
                      <input
                        type="text"
                        placeholder={activeTab === "rfp" ? "Search RFPs by title, organization or category" : "Search Grants by title, agency or category"}
                        className="w-full text-[18px] text-[#9CA3AF] bg-[#FFFFFF] pl-12 pr-32 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button
                        className={`absolute right-2 top-1/2 px-4 py-2 rounded-xl transform -translate-y-1/2 text-[14px] transition-colors ${activeTab === "rfp"
                          ? hasAnyActiveFilters()
                            ? "bg-[#2563EB] text-white"
                            : "bg-[#F3F4F6] text-[#111827] hover:bg-[#2563EB] hover:text-white"
                          : hasActiveGrantFilters()
                            ? "bg-[#2563EB] text-white"
                            : "bg-[#F3F4F6] text-[#111827] hover:bg-[#2563EB] hover:text-white"
                          }`}
                        onClick={() => setIsSearchFocused(true)}
                      >
                        {activeTab === "rfp"
                          ? hasAnyActiveFilters() ? "Filters Active" : "Advanced Search"
                          : hasActiveGrantFilters() ? "Filters Active" : "Grants Filters"
                        }
                      </button>
                    </div>

                    {/* Clear Filters Button */}
                    {hasAnyActiveFilters() && (
                      <button
                        onClick={clearAllFilters}
                        className="mt-2 px-4 py-2 text-sm text-[#EF4444] hover:text-[#DC2626] font-medium hover:underline flex items-center gap-1"
                      >
                        <MdOutlineClose className="w-4 h-4 shrink-0" title="Clear All Filters" />
                        Clear All Filters
                      </button>
                    )}
                  </div>

                  {/* Upload Grant Button */}
                  <button className="flex items-center gap-2 text-[16px] text-white bg-[#2563EB] px-4 py-3 rounded-md hover:cursor-pointer transition-colors"
                    onClick={() => setUploadGrantModalOpen(true)}
                  >
                    <MdOutlineUpload className="w-5 h-5 shrink-0" title="Upload Grant" />
                    Upload Grant
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[24px] text-[#000000] font-semibold">Recent Grants</h2>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-center">
                  <p className="text-red-700">{error}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-2 text-red-600 hover:text-red-800 underline"
                  >
                    {retryCount > 0 ? `Try again (${retryCount}/3)` : "Try again"}
                  </button>
                </div>
              )}
              {loadingRecentGrants ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
                  <span className="ml-3 text-[16px] text-[#4B5563]">Loading recent grants...</span>
                </div>
              ) : filteredRecentGrants.length ? (
                <div className="flex overflow-x-auto pb-2 custom-scroll">
                  {applyGrantFilters(filteredRecentGrants).map((grant) => (
                    <RecentGrantCard
                      key={grant._id}
                      grant={grant}
                      isSaved={!!savedGrants.find((s) => s._id === grant._id)}
                      handleGenerateProposal={handleGenerateGrantProposal}
                      width="355px"
                    />
                  ))}
                </div>
              ) : (
                (!error && (
                  <p className="text-[16px] text-[#4B5563]">Oops! Nothing here. Please fill the profile to get recent grants.</p>
                ))
              )}

              <h2 className="text-[24px] text-[#000000] font-semibold mt-10 mb-4">Other Grants</h2>
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  {/* Grant Category Selection */}
                  <div>
                    <label className="block text-[16px] font-medium text-[#111827] mb-2">
                      Select Categories to Filter Grants
                    </label>
                    <IndustryMultiSelect
                      selectedIndustries={selectedGrants}
                      onIndustryChange={setSelectedGrants}
                      industries={availableGrants}
                    />
                  </div>

                  {/* Search Button */}
                  <div className="flex justify-start md:justify-end">
                    <button
                      onClick={fetchOtherGrants}
                      disabled={selectedGrants.length === 0 || loadingOtherGrants}
                      className={`flex items-center gap-2 px-6 py-3 rounded-md text-[16px] font-medium transition-colors ${selectedGrants.length === 0 || loadingOtherGrants
                        ? "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
                        : "bg-[#2563EB] text-white hover:bg-[#1d4ed8] cursor-pointer"
                        }`}
                    >
                      {loadingOtherGrants ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Searching...</span>
                        </>
                      ) : (
                        <>
                          <MdOutlineSearch className="w-5 h-5 shrink-0" title="Search Grants" />
                          <span>Search Grants</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {loadingOtherGrants ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
                  <span className="ml-3 text-[16px] text-[#4B5563]">Loading grants...</span>
                </div>
              ) : filteredOtherGrants.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pb-2 ">
                    {getCurrentPageItems(applyGrantFilters(filteredOtherGrants), currentOtherGrantsPage, itemsPerPage).map((grant) => (
                      <RecentGrantCard
                        key={grant._id}
                        grant={grant}
                        isSaved={!!savedGrants.find((s) => s._id === grant._id)}
                        handleGenerateProposal={handleGenerateGrantProposal}
                        width="full"
                      />
                    ))}
                  </div>
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentOtherGrantsPage}
                      totalPages={getTotalPages(applyGrantFilters(filteredOtherGrants).length, itemsPerPage)}
                      onPageChange={(page) => handlePageChange(page, setCurrentOtherGrantsPage)}
                    />
                  </div>
                </>
              ) : filteredOtherGrants.length === 0 && selectedGrants.length > 0 ? (
                <div className="text-center py-8">
                  <p className="text-[16px] text-[#4B5563] mb-2">No grants found for the selected industries.</p>
                  <p className="text-[14px] text-[#6B7280]">Try selecting different industries or check back later for new opportunities.</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[16px] text-[#4B5563] mb-2">Select industries and click "Search Grants" to discover relevant opportunities.</p>
                  <p className="text-[14px] text-[#6B7280]">Choose from the available industries to filter and find grants that match your expertise.</p>
                </div>
              )}

              <h2 className="text-[24px] text-[#000000] font-semibold mt-10 mb-4">Saved Grants</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-center">
                  <p className="text-red-700">{error}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-2 text-red-600 hover:text-red-800 underline"
                  >
                    {retryCount > 0 ? `Try again (${retryCount}/3)` : "Try again"}
                  </button>
                </div>
              )}

              {!error && (
                filteredSavedGrants.length > 0 ? (
                  <>
                    <div className="w-full bg-white rounded-xl shadow-sm border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-[#F8FAFC]">
                            <tr className="text-[#374151] text-[14px] font-medium">
                              <th className="px-4 py-3 text-left">Grant Title</th>
                              <th className="px-4 py-3 text-left">Agency</th>
                              <th className="px-4 py-3 text-left">Amount</th>
                              <th className="px-4 py-3 text-left">Deadline</th>
                              <th className="px-4 py-3 text-center">Status</th>
                              <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getCurrentPageItems(applyGrantFilters(filteredSavedGrants), currentGrantTablePage, tableItemsPerPage).map((grant) => (
                              <SavedGrantCard
                                key={grant._id}
                                grant={grant.grant_data}
                                isSaved={true}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Pagination
                        currentPage={currentGrantTablePage}
                        totalPages={getTotalPages(applyGrantFilters(filteredSavedGrants).length, tableItemsPerPage)}
                        onPageChange={(page) => handlePageChange(page, setCurrentGrantTablePage)}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-[16px] text-[#4B5563]">Oops! Nothing here. Discover & save some grants to view them!</p>
                )
              )}
            </div>
          )}

        </main>

        <UploadRFPModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
        />

        <UploadGrantModal
          isOpen={uploadGrantModalOpen}
          onClose={() => setUploadGrantModalOpen(false)}
        />

        {/* Grant Proposal Modal */}
        <GrantProposalForm
          selectedGrant={selectedGrant}
          isOpen={showGrantProposalModal}
          onClose={() => setShowGrantProposalModal(false)}
          onSubmit={handleSubmitGrantProposal}
          isGenerating={isGeneratingProposal}
        />

      </div>
    </>
  );
};

export default Discover;