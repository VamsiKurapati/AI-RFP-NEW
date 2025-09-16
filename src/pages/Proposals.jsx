import React, { useEffect, useState, useCallback, useMemo } from 'react';
import NavbarComponent from './NavbarComponent';
import { MdOutlineBookmark, MdOutlineBookmarkBorder, MdOutlineShare, MdOutlineCalendarMonth, MdOutlineChevronLeft, MdOutlineChevronRight } from 'react-icons/md';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Swal from 'sweetalert2';
import GrantProposalForm from '../components/GrantProposalForm';

// Constants
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;
const API_ENDPOINTS = {
    GET_SAVED_AND_DRAFT_RFPS: `${API_BASE_URL}/rfp/getSavedAndDraftRFPs`,
    SAVE_RFP: `${API_BASE_URL}/rfp/saveRFP`,
    UNSAVE_RFP: `${API_BASE_URL}/rfp/unsaveRFP`,
    GET_SAVED_AND_DRAFT_GRANTS: `${API_BASE_URL}/rfp/getSavedAndDraftGrants`,
    SAVE_GRANT: `${API_BASE_URL}/rfp/saveGrant`,
    UNSAVE_GRANT: `${API_BASE_URL}/rfp/unsaveGrant`,
};

const ProposalCard = ({ proposal_info, onBookmark, onShare, onGenerate, userRole, buttonText = "Generate", isCurrentEditor = true, isLoading = false }) => (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex flex-col justify-between relative">
        <div>
            <div className="flex items-start justify-between">
                <h3 className="font-semibold text-[18px] mb-1 text-[#111827]">{proposal_info.title}</h3>
                <div className="flex gap-2">
                    <button
                        title={proposal_info.bookmarked ? (userRole === "Viewer" ? "Viewer cannot unsave" : "Unsave") : "Save"}
                        onClick={proposal_info.bookmarked && userRole === "Viewer" ? undefined : onBookmark}
                        disabled={isLoading || (proposal_info.bookmarked && userRole === "Viewer")}
                        aria-label={proposal_info.bookmarked ? (userRole === "Viewer" ? "Viewer cannot unsave" : "Unsave proposal") : "Save proposal"}
                        className={`${proposal_info.bookmarked && userRole === "Viewer" ? "cursor-not-allowed opacity-50" : isLoading ? "cursor-wait opacity-75" : "cursor-pointer"} text-[#111827]`}
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#111827]" aria-hidden="true"></div>
                        ) : proposal_info.bookmarked ? (
                            <MdOutlineBookmark className="w-5 h-5 shrink-0" />
                        ) : (
                            <MdOutlineBookmarkBorder className="w-5 h-5 shrink-0" />
                        )}
                    </button>
                    <button
                        title="Share"
                        onClick={onShare}
                        aria-label="Share proposal"
                        className="text-[#111827]"
                    >
                        <MdOutlineShare className="w-5 h-5 shrink-0" />
                    </button>
                </div>
            </div>
            <p className="text-[#4B5563] text-[16px] mb-2">{proposal_info.description}</p>
            <div className="flex items-center text-[14px] text-[#4B5563CC] mb-2">
                <MdOutlineCalendarMonth className="w-4 h-4 mr-1 text-[#4B5563] shrink-0" />
                Deadline: {proposal_info.deadline}
            </div>
        </div>
        <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
                <span className="text-[#2563EB] text-[14px] font-semibold">{proposal_info.budget}</span>
            </div>
            <div>
                <button
                    onClick={onGenerate}
                    disabled={userRole === "Viewer" || (buttonText === "Continue" && !isCurrentEditor)}
                    aria-label={`${buttonText.toLowerCase()} proposal`}
                    className={`self-end px-5 py-1.5 rounded-lg text-[16px] font-medium ${userRole === "Viewer" || (buttonText === "Continue" && !isCurrentEditor)
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]'
                        }`}
                    title={
                        userRole === "Viewer"
                            ? "Viewer cannot generate/edit proposals"
                            : buttonText === "Continue" && !isCurrentEditor
                                ? "Only the current editor can continue this proposal"
                                : `Click to ${buttonText.toLowerCase()}`
                    }
                >
                    {buttonText}
                </button>
                {buttonText === "Continue" && !isCurrentEditor && (
                    <div className="text-xs text-gray-500 mt-1 text-center">
                        Current editor: {proposal_info.currentEditor?.fullName || proposal_info.currentEditor?.email || 'Unknown'}
                    </div>
                )}
            </div>
        </div>

    </div>
);

const GrantCard = ({ grant_info, onBookmark, onShare, onGenerate, userRole, buttonText = "Generate", isCurrentEditor = true, isLoading = false }) => (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex flex-col justify-between relative">
        <div>
            <div className="flex items-start justify-between">
                <h3 className="font-semibold text-[18px] mb-1 text-[#111827]">{grant_info.OPPORTUNITY_TITLE || "Untitled Grant"}</h3>
                <div className="flex gap-2">
                    <button
                        title={grant_info.bookmarked ? (userRole === "Viewer" ? "Viewer cannot unsave" : "Unsave") : "Save"}
                        onClick={grant_info.bookmarked && userRole === "Viewer" ? undefined : onBookmark}
                        disabled={isLoading || (grant_info.bookmarked && userRole === "Viewer")}
                        aria-label={grant_info.bookmarked ? (userRole === "Viewer" ? "Viewer cannot unsave" : "Unsave grant") : "Save grant"}
                        className={`${grant_info.bookmarked && userRole === "Viewer" ? "cursor-not-allowed opacity-50" : isLoading ? "cursor-wait opacity-75" : "cursor-pointer"} text-[#111827]`}
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#111827]" aria-hidden="true"></div>
                        ) : grant_info.bookmarked ? (
                            <MdOutlineBookmark className="w-5 h-5 shrink-0" />
                        ) : (
                            <MdOutlineBookmarkBorder className="w-5 h-5 shrink-0" />
                        )}
                    </button>
                    <button
                        title="Share"
                        onClick={onShare}
                        aria-label="Share grant"
                        className="text-[#111827]"
                    >
                        <MdOutlineShare className="w-5 h-5 shrink-0" />
                    </button>
                </div>
            </div>

            <div className="mb-3">
                <p className="text-[#4B5563] text-[14px] mb-1">
                    <span className="font-medium">Agency:</span> {grant_info.AGENCY_NAME || "Not Provided"}
                </p>
                <p className="text-[#4B5563] text-[14px] mb-1">
                    <span className="font-medium">Category:</span> {grant_info.CATEGORY_OF_FUNDING_ACTIVITY || "Not Provided"}
                </p>
                <p className="text-[#4B5563] text-[14px] mb-1">
                    <span className="font-medium">Funding Type:</span> {grant_info.FUNDING_INSTRUMENT_TYPE || "Not Provided"}
                </p>
            </div>

            <div className="flex items-center text-[14px] text-[#4B5563CC] mb-2">
                <MdOutlineCalendarMonth className="w-4 h-4 mr-1 text-[#4B5563] shrink-0" />
                {grant_info.CLOSE_DATE ? `Close Date: ${grant_info.CLOSE_DATE}` :
                    grant_info.ESTIMATED_APPLICATION_DUE_DATE ? `Due Date: ${grant_info.ESTIMATED_APPLICATION_DUE_DATE}` :
                        "Deadline: Not Provided"}
            </div>

            <div className="flex items-center text-[14px] text-[#4B5563CC] mb-2">
                <span className="text-[#059669] text-[12px] font-medium px-2 py-1 bg-[#D1FAE5] rounded-full">
                    {grant_info.OPPORTUNITY_STATUS || "Unknown Status"}
                </span>
            </div>
        </div>

        <div className="flex justify-between items-center mt-2">
            <div className="flex flex-col">
                <span className="text-[#2563EB] text-[14px] font-semibold">
                    {grant_info.AWARD_CEILING ? `Up to $${grant_info.AWARD_CEILING}` :
                        grant_info.ESTIMATED_TOTAL_FUNDING ? `Total: $${grant_info.ESTIMATED_TOTAL_FUNDING}` :
                            "Funding: Not Specified"}
                </span>
                {grant_info.EXPECTED_NUMBER_OF_AWARDS && (
                    <span className="text-[#6B7280] text-[12px]">
                        Expected Awards: {grant_info.EXPECTED_NUMBER_OF_AWARDS}
                    </span>
                )}
            </div>
            <div>
                <button
                    onClick={onGenerate}
                    disabled={userRole === "Viewer" || (buttonText === "Continue" && !isCurrentEditor)}
                    aria-label={`${buttonText.toLowerCase()} grant proposal`}
                    className={`self-end px-5 py-1.5 rounded-lg text-[16px] font-medium ${userRole === "Viewer" || (buttonText === "Continue" && !isCurrentEditor)
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]'
                        }`}
                    title={
                        userRole === "Viewer"
                            ? "Viewer cannot generate/edit grant proposals"
                            : buttonText === "Continue" && !isCurrentEditor
                                ? "Only the current editor can continue this grant proposal"
                                : `Click to ${buttonText.toLowerCase()}`
                    }
                >
                    {buttonText}
                </button>
                {buttonText === "Continue" && !isCurrentEditor && (
                    <div className="text-xs text-gray-500 mt-1 text-center">
                        Current editor: {grant_info.currentEditor?.fullName || grant_info.currentEditor?.email || 'Unknown'}
                    </div>
                )}
            </div>
        </div>
    </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        const earlyPageThreshold = 3;
        const latePageThreshold = 2;
        const pageRangeSize = 4;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= earlyPageThreshold) {
                for (let i = 1; i <= pageRangeSize; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - latePageThreshold) {
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

    return (
        <div className="flex justify-center items-center gap-2 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium ${currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-[#2563EB] hover:bg-[#2563EB] hover:text-white'
                    }`}
            >
                <MdOutlineChevronLeft className="w-4 h-4 shrink-0" />
                Previous
            </button>

            {getPageNumbers().map((page, index) => (
                <button
                    key={index}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === '...'}
                    aria-label={page === '...' ? 'Page separator' : `Go to page ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${page === '...'
                        ? 'text-gray-400 cursor-default'
                        : page === currentPage
                            ? 'bg-[#2563EB] text-white'
                            : 'text-[#6B7280] hover:bg-gray-100'
                        }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium ${currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-[#2563EB] hover:bg-[#2563EB] hover:text-white'
                    }`}
            >
                Next
                <MdOutlineChevronRight className="w-4 h-4 shrink-0" />
            </button>
        </div>
    );
};

const Proposals = () => {
    const [savedProposals, setSavedProposals] = useState([]);
    const [draftProposals, setDraftProposals] = useState([]);
    const [savedGrants, setSavedGrants] = useState([]);
    const [draftGrants, setDraftGrants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentSavedPage, setCurrentSavedPage] = useState(1);
    const [currentDraftPage, setCurrentDraftPage] = useState(1);
    const [currentSavedGrantsPage, setCurrentSavedGrantsPage] = useState(1);
    const [currentDraftGrantsPage, setCurrentDraftGrantsPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(4);
    const [fetchedProposals, setFetchedProposals] = useState(false);
    const [fetchedGrants, setFetchedGrants] = useState(false);
    const [savingStates, setSavingStates] = useState({}); // Track saving state for each proposal/grant

    // Grant proposal form state
    const [showGrantProposalModal, setShowGrantProposalModal] = useState(false);
    const [selectedGrant, setSelectedGrant] = useState(null);
    const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);

    const navigate = useNavigate();

    // Calculate items per page based on screen size
    const calculateItemsPerPage = useCallback(() => {
        const width = window.innerWidth;
        if (width < 640) return 1;
        if (width < 768) return 2;
        return 4;
    }, []);

    // Get grid layout class based on items per page
    const getGridLayoutClass = () => {
        if (itemsPerPage === 1) return "grid-cols-1";
        if (itemsPerPage === 2) return "grid-cols-1 md:grid-cols-2";
        return "grid-cols-1 md:grid-cols-2";
    };

    // Calculate pagination for saved proposals
    const savedProposalsStartIndex = (currentSavedPage - 1) * itemsPerPage;
    const savedProposalsEndIndex = Math.min(savedProposalsStartIndex + itemsPerPage, savedProposals.length);
    const currentSavedProposals = savedProposals.slice(savedProposalsStartIndex, savedProposalsEndIndex);
    const totalSavedPages = Math.max(1, Math.ceil(savedProposals.length / itemsPerPage));

    // Calculate pagination for draft proposals
    const draftProposalsStartIndex = (currentDraftPage - 1) * itemsPerPage;
    const draftProposalsEndIndex = Math.min(draftProposalsStartIndex + itemsPerPage, draftProposals.length);
    const currentDraftProposals = draftProposals.slice(draftProposalsStartIndex, draftProposalsEndIndex);
    const totalDraftPages = Math.max(1, Math.ceil(draftProposals.length / itemsPerPage));

    // Calculate pagination for saved grants
    const savedGrantsStartIndex = (currentSavedGrantsPage - 1) * itemsPerPage;
    const savedGrantsEndIndex = Math.min(savedGrantsStartIndex + itemsPerPage, savedGrants.length);
    const currentSavedGrants = savedGrants.slice(savedGrantsStartIndex, savedGrantsEndIndex);
    const totalSavedGrantsPages = Math.max(1, Math.ceil(savedGrants.length / itemsPerPage));

    // Calculate pagination for draft grants
    const draftGrantsStartIndex = (currentDraftGrantsPage - 1) * itemsPerPage;
    const draftGrantsEndIndex = Math.min(draftGrantsStartIndex + itemsPerPage, draftGrants.length);
    const currentDraftGrants = draftGrants.slice(draftGrantsStartIndex, draftGrantsEndIndex);
    const totalDraftGrantsPages = Math.max(1, Math.ceil(draftGrants.length / itemsPerPage));

    // Validate that we're not showing more items than expected
    const validatePagination = () => {
        if (currentSavedProposals.length > itemsPerPage) {
            console.warn('Saved proposals showing more items than expected:', currentSavedProposals.length, 'expected:', itemsPerPage);
        }
        if (currentDraftProposals.length > itemsPerPage) {
            console.warn('Draft proposals showing more items than expected:', currentDraftProposals.length, 'expected:', itemsPerPage);
        }
        if (currentSavedGrants.length > itemsPerPage) {
            console.warn('Saved grants showing more items than expected:', currentSavedGrants.length, 'expected:', itemsPerPage);
        }
        if (currentDraftGrants.length > itemsPerPage) {
            console.warn('Draft grants showing more items than expected:', currentDraftGrants.length, 'expected:', itemsPerPage);
        }
    };

    // Run validation on every render
    useEffect(() => {
        validatePagination();
    }, []); // Add empty dependency array to run only once

    // Ensure current page doesn't exceed total pages
    useEffect(() => {
        if (currentSavedPage > totalSavedPages && totalSavedPages > 0) {
            setCurrentSavedPage(totalSavedPages);
        }
        if (currentDraftPage > totalDraftPages && totalDraftPages > 0) {
            setCurrentDraftPage(totalDraftPages);
        }
        if (currentSavedGrantsPage > totalSavedGrantsPages && totalSavedGrantsPages > 0) {
            setCurrentSavedGrantsPage(totalSavedGrantsPages);
        }
        if (currentDraftGrantsPage > totalDraftGrantsPages && totalDraftGrantsPages > 0) {
            setCurrentDraftGrantsPage(totalDraftGrantsPages);
        }
    }, [currentSavedPage, currentDraftPage, currentSavedGrantsPage, currentDraftGrantsPage, totalSavedPages, totalDraftPages, totalSavedGrantsPages, totalDraftGrantsPages]);

    const { role } = useUser();

    // Get user email from localStorage with memoization
    const userEmail = useMemo(() => {
        try {
            // Try to get email from userEmail key first
            const directEmail = localStorage.getItem("userEmail");
            if (directEmail && typeof directEmail === 'string' && directEmail.includes('@')) {
                return directEmail;
            }

            // Fallback to parsing user object
            const user = localStorage.getItem("user");
            if (user && typeof user === 'string') {
                const parsed = JSON.parse(user);
                if (parsed && typeof parsed === 'object' && parsed.email && typeof parsed.email === 'string' && parsed.email.includes('@')) {
                    return parsed.email;
                }
            }
            return null;
        } catch (error) {
            return null;
        }
    }, []); // Empty dependency array since localStorage doesn't change during component lifecycle

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const newItemsPerPage = calculateItemsPerPage();
            if (newItemsPerPage !== itemsPerPage) {
                setItemsPerPage(newItemsPerPage);
                // Reset to first page when items per page changes
                setCurrentSavedPage(1);
                setCurrentDraftPage(1);
                setCurrentSavedGrantsPage(1);
                setCurrentDraftGrantsPage(1);
            }
        };

        // Set initial items per page
        setItemsPerPage(calculateItemsPerPage());

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [calculateItemsPerPage]); // Remove itemsPerPage from dependencies

    const fetchProposals = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(API_ENDPOINTS.GET_SAVED_AND_DRAFT_RFPS, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setSavedProposals(res.data.savedRFPs || []);
            setDraftProposals(res.data.draftRFPs || []);

            // Reset pagination to first page when new data is fetched
            setCurrentSavedPage(1);
            setCurrentDraftPage(1);

        } catch (error) {

            // More specific error messages based on error type
            let errorMessage = "Error fetching proposals";
            if (error.response?.status === 401) {
                errorMessage = "Authentication failed. Please log in again.";
            } else if (error.response?.status === 403) {
                errorMessage = "Access denied. You don't have permission to view proposals.";
            } else if (error.response?.status >= 500) {
                errorMessage = "Server error. Please try again later.";
            } else if (!navigator.onLine) {
                errorMessage = "No internet connection. Please check your network.";
            }

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || errorMessage,
                confirmButtonColor: '#2563EB',
            });

            // Reset to empty arrays on error
            setSavedProposals([]);
            setDraftProposals([]);
            setCurrentSavedPage(1);
            setCurrentDraftPage(1);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!fetchedProposals) {
            fetchProposals();
            setFetchedProposals(true);
        }
    }, [fetchedProposals]);

    useEffect(() => {
        if (!fetchedGrants) {
            fetchGrants();
            setFetchedGrants(true);
        }
    }, [fetchedGrants]);

    const handleSave = async (rfp) => {
        const proposalId = rfp._id;
        setSavingStates(prev => ({ ...prev, [proposalId]: true }));

        try {
            const cleanedRFP = {
                ...rfp,
                generatedProposal: null
            };
            const res = await axios.post(API_ENDPOINTS.SAVE_RFP, { rfpId: rfp._id, rfp: cleanedRFP }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (res.status === 201 || res.status === 200) {
                setSavedProposals((prev) => [...prev, cleanedRFP]);
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'Failed to save RFP',
                confirmButtonColor: '#2563EB',
            });
        } finally {
            setSavingStates(prev => ({ ...prev, [proposalId]: false }));
        }
    };

    const handleUnsave = async (rfpId) => {
        setSavingStates(prev => ({ ...prev, [rfpId]: true }));

        try {
            const res = await axios.post(API_ENDPOINTS.UNSAVE_RFP, { rfpId: rfpId }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (res.status === 200) {
                setSavedProposals((prev) => prev.filter((r) => r.rfpId !== rfpId));
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'Failed to unsave RFP',
                confirmButtonColor: '#2563EB',
            });
        } finally {
            setSavingStates(prev => ({ ...prev, [rfpId]: false }));
        }
    };

    const handleShare = (link) => {
        navigator.clipboard.writeText(link).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: "Link copied to clipboard!",
                confirmButtonColor: '#2563EB',
            });
        }).catch(() => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || "Failed to copy link to clipboard.",
                confirmButtonColor: '#2563EB',
            });
        });
    };

    const handleGenerate = (proposal) => {
        navigate('/proposal_page', { state: { proposal } });
    };

    const handleContinue = (proposal) => {
        localStorage.setItem('proposalId', proposal.proposalId);
        localStorage.setItem('proposalType', "RFP");
        navigate('/editor', { state: { jsonData: proposal.generatedProposal || null } });
    };

    const isSaved = (rfpId) => {
        return savedProposals.some((rfp) => rfp.rfpId === rfpId);
    };

    const handleSavedPageChange = (page) => {
        if (page >= 1 && page <= totalSavedPages) {
            setCurrentSavedPage(page);
        }
    };

    const handleDraftPageChange = (page) => {
        if (page >= 1 && page <= totalDraftPages) {
            setCurrentDraftPage(page);
        }
    };

    // Grant-specific functions
    const fetchGrants = async () => {
        try {
            const res = await axios.get(API_ENDPOINTS.GET_SAVED_AND_DRAFT_GRANTS, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setSavedGrants(res.data.savedGrants || []);
            setDraftGrants(res.data.draftGrants || []);

            // Reset pagination to first page when new data is fetched
            setCurrentSavedGrantsPage(1);
            setCurrentDraftGrantsPage(1);
        } catch (error) {
            // Reset to empty arrays on error
            setSavedGrants([]);
            setDraftGrants([]);
            setCurrentSavedGrantsPage(1);
            setCurrentDraftGrantsPage(1);
        }
    };

    const handleSaveGrant = async (grant) => {
        const grantId = grant._id;
        setSavingStates(prev => ({ ...prev, [grantId]: true }));

        try {
            const cleanedGrant = {
                ...grant,
                generatedProposal: null
            };
            const res = await axios.post(API_ENDPOINTS.SAVE_GRANT, { grantId: grant._id, grant: cleanedGrant }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (res.status === 201 || res.status === 200) {
                setSavedGrants((prev) => [...prev, cleanedGrant]);
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'Failed to save Grant',
                confirmButtonColor: '#2563EB',
            });
        } finally {
            setSavingStates(prev => ({ ...prev, [grantId]: false }));
        }
    };

    const handleUnsaveGrant = async (grantId) => {
        setSavingStates(prev => ({ ...prev, [grantId]: true }));

        try {
            const res = await axios.post(API_ENDPOINTS.UNSAVE_GRANT, { grantId: grantId }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (res.status === 200) {
                setSavedGrants((prev) => prev.filter((grant) => grant.grantId !== grantId));
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'Failed to unsave Grant',
                confirmButtonColor: '#2563EB',
            });
        } finally {
            setSavingStates(prev => ({ ...prev, [grantId]: false }));
        }
    };

    const handleGenerateGrant = (grant) => {
        setSelectedGrant(grant);
        setShowGrantProposalModal(true);
    };

    const handleContinueGrant = (grant) => {
        localStorage.setItem('proposalId', grant.proposalId);
        localStorage.setItem('proposalType', "GRANT");
        navigate('/editor', { state: { jsonData: grant.generatedProposal || null } });
    };

    const handleSubmitGrantProposal = async (proposalData) => {
        setIsGeneratingProposal(true);

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
                setIsGeneratingProposal(false);
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
                setIsGeneratingProposal(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Budget',
                    text: 'Total project cost must be a positive number.',
                    confirmButtonColor: '#2563EB'
                });
                return;
            }

            if (isNaN(totalRequestedAmount) || totalRequestedAmount <= 0) {
                setIsGeneratingProposal(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Budget',
                    text: 'Total requested amount must be a positive number.',
                    confirmButtonColor: '#2563EB'
                });
                return;
            }

            // Check if total requested amount exceeds grant award ceiling
            if (selectedGrant.AWARD_CEILING && selectedGrant.AWARD_CEILING !== "Not Provided") {
                const awardCeiling = parseFloat(selectedGrant.AWARD_CEILING.replace(/[^0-9.]/g, ''));
                if (!isNaN(awardCeiling) && totalRequestedAmount > awardCeiling) {
                    setIsGeneratingProposal(false);
                    Swal.fire({
                        icon: 'error',
                        title: 'Budget Exceeds Limit',
                        text: `Total requested amount (${totalRequestedAmount}) cannot exceed the grant award ceiling (${awardCeiling}).`,
                        confirmButtonColor: '#2563EB'
                    });
                    return;
                }
            }

            if (totalRequestedAmount > totalProjectCost) {
                setIsGeneratingProposal(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Budget',
                    text: 'Total requested amount cannot exceed total project cost.',
                    confirmButtonColor: '#2563EB'
                });
                return;
            }

            // Submit the grant proposal data
            const res = await axios.post(`${API_BASE_URL}/rfp/sendGrantDataForProposalGeneration`, {
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
                        title: 'Success',
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
                        text: res.data.message || 'Failed to generate Grant proposal. Please try again after some time.',
                        confirmButtonColor: '#2563EB'
                    });
                }
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Failed',
                    text: res.data.message || 'Failed to generate Grant proposal. Please try again after some time.',
                    confirmButtonColor: '#2563EB'
                });
            }

            // Close the modal
            setShowGrantProposalModal(false);
            setSelectedGrant(null);

        } catch (error) {
            // console.error("Error generating Grant proposal:", error);
            Swal.fire({
                icon: 'warning',
                title: 'Failed',
                text: error.response?.data?.message || 'Failed to generate Grant proposal. Please try again after some time.',
                confirmButtonColor: '#2563EB'
            });
        } finally {
            setIsGeneratingProposal(false);
        }
    };

    const isGrantSaved = (grantId) => {
        return savedGrants.some((grant) => grant.grantId === grantId);
    };

    const handleSavedGrantsPageChange = (page) => {
        if (page >= 1 && page <= totalSavedGrantsPages) {
            setCurrentSavedGrantsPage(page);
        }
    };

    const handleDraftGrantsPageChange = (page) => {
        if (page >= 1 && page <= totalDraftGrantsPages) {
            setCurrentDraftGrantsPage(page);
        }
    };

    return (
        <>
            <div>
                <NavbarComponent />
            </div>
            <div className="w-full mx-auto mt-16 px-8 py-8">
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-full gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563EB]">
                        </div>
                        <div className="text-center text-[#4B5563]">
                            Please wait while we fetch your proposals...
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-[24px] font-semibold mb-2">Saved Proposals</h2>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-600">
                                Showing {savedProposals.length > 0 ? savedProposalsStartIndex + 1 : 0} to {Math.min(savedProposalsEndIndex, savedProposals.length)} of {savedProposals.length} proposals
                            </span>
                        </div>
                        <div className={`grid ${getGridLayoutClass()} gap-5 mb-6`}>
                            {currentSavedProposals.length > 0 ? (
                                <>
                                    {currentSavedProposals.length > itemsPerPage && (
                                        <div className="col-span-full text-red-500 text-sm mb-2">
                                            Warning: Showing {currentSavedProposals.length} items (expected max: {itemsPerPage})
                                        </div>
                                    )}
                                    {currentSavedProposals.map((proposal, idx) => (
                                        <ProposalCard
                                            key={proposal._id}
                                            proposal_info={{
                                                ...proposal,
                                                bookmarked: true
                                            }}
                                            onBookmark={() => handleUnsave(proposal._id)}
                                            onShare={() => handleShare(proposal.link)}
                                            onGenerate={() => handleGenerate(proposal)}
                                            userRole={role}
                                            buttonText="Generate"
                                            isCurrentEditor={true}
                                            isLoading={savingStates[proposal._id] || false}
                                        />
                                    ))}
                                </>
                            ) : <div className="col-span-full text-center text-[#4B5563] py-8">
                                No saved proposals yet
                            </div>}
                        </div>

                        {totalSavedPages > 1 && (
                            <Pagination
                                currentPage={currentSavedPage}
                                totalPages={totalSavedPages}
                                onPageChange={handleSavedPageChange}
                            />
                        )}

                        <h2 className="text-[24px] font-semibold mb-2 mt-10">Draft Proposals</h2>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-600">
                                Showing {draftProposals.length > 0 ? draftProposalsStartIndex + 1 : 0} to {Math.min(draftProposalsEndIndex, draftProposals.length)} of {draftProposals.length} proposals
                            </span>
                        </div>
                        <div className={`grid ${getGridLayoutClass()} gap-5 mb-6`}>
                            {currentDraftProposals.length > 0 ? (
                                <>
                                    {currentDraftProposals.length > itemsPerPage && (
                                        <div className="col-span-full text-red-500 text-sm mb-2">
                                            Warning: Showing {currentDraftProposals.length} items (expected max: {itemsPerPage})
                                        </div>
                                    )}
                                    {currentDraftProposals.map((proposal, idx) => {
                                        return (
                                            <ProposalCard
                                                key={proposal._id}
                                                proposal_info={{
                                                    ...proposal,
                                                    bookmarked: false
                                                }}
                                                onBookmark={() => isSaved(proposal._id) ? handleUnsave(proposal._id) : handleSave(proposal)}
                                                onShare={() => handleShare(proposal.link)}
                                                onGenerate={() => handleContinue(proposal)}
                                                userRole={role}
                                                buttonText="Continue"
                                                isCurrentEditor={proposal.currentEditor?.email === userEmail || role === "company"}
                                                isLoading={savingStates[proposal._id] || false}
                                            />
                                        );
                                    })}
                                </>
                            ) : <div className="col-span-full text-center text-[#4B5563] py-8">
                                No draft proposals yet
                            </div>}
                        </div>

                        {totalDraftPages > 1 && (
                            <Pagination
                                currentPage={currentDraftPage}
                                totalPages={totalDraftPages}
                                onPageChange={handleDraftPageChange}
                            />
                        )}

                        <h2 className="text-[24px] font-semibold mb-2 mt-10">Saved Grants</h2>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-600">
                                Showing {savedGrants.length > 0 ? savedGrantsStartIndex + 1 : 0} to {Math.min(savedGrantsEndIndex, savedGrants.length)} of {savedGrants.length} grants
                            </span>
                        </div>
                        <div className={`grid ${getGridLayoutClass()} gap-5 mb-6`}>
                            {currentSavedGrants.length > 0 ? (
                                currentSavedGrants.map((grant, idx) => (
                                    <GrantCard
                                        key={grant._id}
                                        grant_info={{
                                            ...grant,
                                            bookmarked: true
                                        }}
                                        onBookmark={() => handleUnsaveGrant(grant._id)}
                                        onShare={() => handleShare(grant.OPPORTUNITY_NUMBER_LINK || '#')}
                                        onGenerate={() => handleGenerateGrant(grant)}
                                        userRole={role}
                                        buttonText="Generate"
                                        isCurrentEditor={true}
                                        isLoading={savingStates[grant._id] || false}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center text-[#4B5563] py-8">
                                    No saved grants yet
                                </div>
                            )}
                        </div>

                        {totalSavedGrantsPages > 1 && (
                            <Pagination
                                currentPage={currentSavedGrantsPage}
                                totalPages={totalSavedGrantsPages}
                                onPageChange={handleSavedGrantsPageChange}
                            />
                        )}

                        <h2 className="text-[24px] font-semibold mb-2 mt-10">Draft Grant Proposals</h2>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-600">
                                Showing {draftGrants.length > 0 ? draftGrantsStartIndex + 1 : 0} to {Math.min(draftGrantsEndIndex, draftGrants.length)} of {draftGrants.length} grant proposals
                            </span>
                        </div>
                        <div className={`grid ${getGridLayoutClass()} gap-5 mb-6`}>
                            {currentDraftGrants.length > 0 ? (
                                currentDraftGrants.map((grant, idx) => {
                                    return (
                                        <GrantCard
                                            key={grant._id}
                                            grant_info={{
                                                ...grant,
                                                bookmarked: false
                                            }}
                                            onBookmark={() => isGrantSaved(grant._id) ? handleUnsaveGrant(grant._id) : handleSaveGrant(grant)}
                                            onShare={() => handleShare(grant.OPPORTUNITY_NUMBER_LINK || '#')}
                                            onGenerate={() => handleContinueGrant(grant)}
                                            userRole={role}
                                            buttonText="Continue"
                                            isCurrentEditor={grant.currentEditor?.email === userEmail || role === "company"}
                                            isLoading={savingStates[grant._id] || false}
                                        />
                                    );
                                })
                            ) : (
                                <div className="col-span-full text-center text-[#4B5563] py-8">
                                    No draft grant proposals yet
                                </div>
                            )}
                        </div>

                        {totalDraftGrantsPages > 1 && (
                            <Pagination
                                currentPage={currentDraftGrantsPage}
                                totalPages={totalDraftGrantsPages}
                                onPageChange={handleDraftGrantsPageChange}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Grant Proposal Form Modal */}
            <GrantProposalForm
                selectedGrant={selectedGrant}
                isOpen={showGrantProposalModal}
                onClose={() => setShowGrantProposalModal(false)}
                onSubmit={handleSubmitGrantProposal}
                isGenerating={isGeneratingProposal}
            />
        </>
    );
};

export default Proposals;
