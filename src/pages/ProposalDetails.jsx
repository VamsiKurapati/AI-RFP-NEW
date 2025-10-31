import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import NavbarComponent from './NavbarComponent';
import { MdOutlineArrowBack, MdOutlineOpenInNew } from 'react-icons/md';

const statusBadge = (status) => {
    const statusStyles = {
        "In Progress": "bg-[#DBEAFE] text-[#2563EB]",
        "Won": "bg-[#FEF9C3] text-[#CA8A04]",
        "Submitted": "bg-[#DCFCE7] text-[#16A34A]",
        "Rejected": "bg-[#FEE2E2] text-[#DC2626]",
        "Posted": "bg-[#DBEAFE] text-[#2563EB]",
        "Forecasted": "bg-[#FEF3C7] text-[#F59E42]",
        "Closed": "bg-[#FEE2E2] text-[#DC2626]",
        "Archived": "bg-[#F3F4F6] text-[#6B7280]",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap inline-block ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

const ProposalDetails = () => {
    const { proposalId } = useParams();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'rfp';
    const navigate = useNavigate();
    const [proposal, setProposal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isRFP = type === 'rfp';
    const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/dashboard`;

    useEffect(() => {
        const fetchProposalDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                
                // First try dedicated endpoint (if it exists)
                try {
                    const endpoint = isRFP 
                        ? `${BASE_URL}/getProposalDetails/${proposalId}`
                        : `${BASE_URL}/getGrantProposalDetails/${proposalId}`;
                    
                    const res = await axios.get(endpoint, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (res.status === 200 && res.data) {
                        setProposal(res.data);
                        setLoading(false);
                        return;
                    }
                } catch (dedicatedErr) {
                    // If dedicated endpoint doesn't exist, fall back to dashboard data
                    console.log('Dedicated endpoint not available, using dashboard data');
                }

                // Fallback: Fetch from dashboard and find the proposal
                const dashboardRes = await axios.get(`${BASE_URL}/getDashboardData`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (dashboardRes.status === 200) {
                    const data = dashboardRes.data;
                    let foundProposal = null;

                    if (isRFP) {
                        const allProposals = [
                            ...(data.proposals?.proposals || []),
                            ...(data.deletedProposals?.proposals || [])
                        ];
                        foundProposal = allProposals.find(p => p._id === proposalId);
                    } else {
                        const allGrantProposals = [
                            ...(data.proposals?.grantProposals || []),
                            ...(data.deletedProposals?.grantProposals || [])
                        ];
                        foundProposal = allGrantProposals.find(p => p._id === proposalId);
                    }

                    if (foundProposal) {
                        setProposal(foundProposal);
                    } else {
                        setError('Proposal not found');
                    }
                } else {
                    setError('Failed to load proposal details');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load proposal details');
            } finally {
                setLoading(false);
            }
        };

        if (proposalId) {
            fetchProposalDetails();
        }
    }, [proposalId, type, isRFP, BASE_URL]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                    <p className="text-gray-500 mt-4">Loading proposal details...</p>
                </div>
            </div>
        );
    }

    if (error || !proposal) {
        return (
            <div className="min-h-screen">
                <NavbarComponent />
                <main className="w-full mx-auto py-8 px-4 md:px-12 mt-20">
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-red-600">{error || 'Proposal not found'}</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-4 px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1D4ED8]"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const title = isRFP 
        ? (proposal.title || proposal.OPPORTUNITY_TITLE || 'Not Provided')
        : (proposal.title || proposal.OPPORTUNITY_TITLE || 'Not Provided');
    const clientOrAgency = isRFP 
        ? (proposal.client || 'Not Provided')
        : (proposal.AGENCY_NAME || proposal.client || 'Not Provided');
    const deadline = isRFP 
        ? (proposal.deadline || proposal.CLOSE_DATE)
        : (proposal.CLOSE_DATE || proposal.deadline);
    const status = isRFP 
        ? proposal.status 
        : (proposal.OPPORTUNITY_STATUS || proposal.status);
    const submittedAt = proposal.submittedAt;
    const externalUrl = isRFP 
        ? (proposal.url || proposal.urlLink || proposal.link)
        : (proposal.url || proposal.urlLink || proposal.OPPORTUNITY_NUMBER_LINK);
    const currentEditor = proposal.currentEditor 
        ? (proposal.currentEditor.fullName || proposal.currentEditor.email || proposal.currentEditor.name)
        : 'No Editor Assigned';

    const handleExternalLink = () => {
        if (externalUrl && externalUrl !== '#') {
            window.open(externalUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavbarComponent />
            <main className="w-full mx-auto py-8 px-4 md:px-12 mt-20 max-w-6xl">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <MdOutlineArrowBack className="w-5 h-5" />
                    <span>Back to Dashboard</span>
                </button>

                {/* Proposal Details Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                    <div className="border-b border-gray-200 pb-6 mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h1>
                        <div className="flex items-center gap-3">
                            {statusBadge(status)}
                            <span className="text-sm text-gray-500">
                                {isRFP ? 'RFP Proposal' : 'Grant Proposal'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                {isRFP ? 'Client Name' : 'Agency Name'}
                            </label>
                            <p className="text-lg text-gray-900">{clientOrAgency}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                Current Editor
                            </label>
                            <p className="text-lg text-gray-900">{currentEditor}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                {isRFP ? 'Deadline' : 'Close Date'}
                            </label>
                            <p className="text-lg text-gray-900">
                                {deadline
                                    ? new Date(deadline).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                      })
                                    : isRFP
                                    ? 'No deadline set'
                                    : 'No close date set'}
                            </p>
                        </div>

                        {submittedAt && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">
                                    Submission Date
                                </label>
                                <p className="text-lg text-gray-900">
                                    {new Date(submittedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Additional Details Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                        <div className="space-y-4">
                            {proposal.description && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">
                                        Description
                                    </label>
                                    <p className="text-gray-900 whitespace-pre-wrap">{proposal.description}</p>
                                </div>
                            )}

                            {proposal.OPPORTUNITY_NUMBER && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">
                                        Opportunity Number
                                    </label>
                                    <p className="text-gray-900">{proposal.OPPORTUNITY_NUMBER}</p>
                                </div>
                            )}

                            {proposal.budget && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">
                                        Budget
                                    </label>
                                    <p className="text-gray-900">{proposal.budget}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* External Link Section */}
                    {externalUrl && externalUrl !== '#' && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <button
                                onClick={handleExternalLink}
                                className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-md hover:bg-[#1D4ED8] transition-colors font-medium"
                            >
                                <span>View on External Website</span>
                                <MdOutlineOpenInNew className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProposalDetails;

