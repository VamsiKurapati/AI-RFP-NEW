import { useNavigate } from 'react-router-dom';
import { MdOutlineClose } from 'react-icons/md';

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

const ProposalModal = ({ proposal, type, isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen || !proposal) return null;

    const isRFP = type === 'rfp';
    const title = isRFP ? (proposal.title || proposal.OPPORTUNITY_TITLE || 'Not Provided') : (proposal.title || proposal.OPPORTUNITY_TITLE || 'Not Provided');
    const clientOrAgency = isRFP ? (proposal.client || 'Not Provided') : (proposal.AGENCY_NAME || proposal.client || 'Not Provided');
    const deadline = isRFP ? (proposal.deadline || proposal.CLOSE_DATE) : (proposal.CLOSE_DATE || proposal.deadline);
    const status = isRFP ? proposal.status : (proposal.OPPORTUNITY_STATUS || proposal.status);
    const submittedAt = proposal.submittedAt;
    const externalUrl = isRFP ? (proposal.url || proposal.urlLink || proposal.link) : (proposal.url || proposal.urlLink || proposal.OPPORTUNITY_NUMBER_LINK);
    const currentEditor = proposal.currentEditor ? (proposal.currentEditor.fullName || proposal.currentEditor.email || proposal.currentEditor.name) : 'No Editor Assigned';

    const handleMoreInfo = () => {
        const proposalId = proposal._id;
        navigate(`/proposal-details/${proposalId}?type=${type}`);
        onClose();
    };

    const handleExternalLink = (e) => {
        e.stopPropagation();
        if (externalUrl && externalUrl !== '#') {
            window.open(externalUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label="Close modal"
                    >
                        <MdOutlineClose className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            {isRFP ? 'Client Name' : 'Agency Name'}
                        </label>
                        <p className="text-lg text-gray-900 mt-1">{clientOrAgency}</p>
                    </div>

                    {currentEditor && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Current Editor</label>
                            <p className="text-lg text-gray-900 mt-1">{currentEditor}</p>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            {isRFP ? 'Deadline' : 'Close Date'}
                        </label>
                        <p className="text-lg text-gray-900 mt-1">
                            {deadline
                                ? new Date(deadline).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                  })
                                : isRFP
                                ? 'No deadline'
                                : 'No close date'}
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <div className="mt-1">{statusBadge(status)}</div>
                    </div>

                    {submittedAt && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Submission Date</label>
                            <p className="text-lg text-gray-900 mt-1">
                                {new Date(submittedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    )}

                    {externalUrl && externalUrl !== '#' && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">External Link</label>
                            <button
                                onClick={handleExternalLink}
                                className="mt-1 text-blue-600 hover:text-blue-800 underline text-lg"
                            >
                                Open External Link →
                            </button>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
                    <button
                        onClick={handleExternalLink}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        disabled={!externalUrl || externalUrl === '#'}
                    >
                        View External Link
                    </button>
                    <button
                        onClick={handleMoreInfo}
                        className="px-6 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1D4ED8] transition-colors font-medium"
                    >
                        More Info
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProposalModal;

