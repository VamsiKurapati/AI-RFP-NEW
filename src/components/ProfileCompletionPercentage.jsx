import React, { useMemo } from 'react';
import { useProfile } from '../context/ProfileContext';
import { MdOutlineCheckCircle, MdOutlineRadioButtonUnchecked } from 'react-icons/md';

const ProfileCompletionPercentage = () => {
    const { companyData } = useProfile();

    const completionData = useMemo(() => {
        if (!companyData) {
            return { percentage: 0, completed: 0, total: 10, items: [] };
        }

        const items = [
            {
                label: 'Company Name',
                completed: !!companyData.companyName,
            },
            {
                label: 'Industry',
                completed: !!companyData.industry,
            },
            {
                label: 'Location',
                completed: !!companyData.location,
            },
            {
                label: 'Email',
                completed: !!companyData.email,
            },
            {
                label: 'Phone',
                completed: !!companyData.phone,
            },
            {
                label: 'Website',
                completed: !!companyData.website,
            },
            {
                label: 'Company Bio',
                completed: !!(companyData.profile?.bio && companyData.profile.bio.trim().length > 0),
            },
            {
                label: 'Company Logo',
                completed: !!(companyData.logoUrl_1 || companyData.logoUrl),
            },
            {
                label: 'Documents',
                completed: !!(companyData.documentList && companyData.documentList.length > 0),
            },
            {
                label: 'Team Members',
                completed: !!(companyData.employees && companyData.employees.length > 0),
            },
            {
                label: 'Services',
                completed: !!(companyData.profile?.services && companyData.profile.services.length > 0 && companyData.profile.services[0] !== ''),
            },
            {
                label: 'Case Studies',
                completed: !!(companyData.caseStudiesList && companyData.caseStudiesList.length > 0),
            },
            {
                label: 'Certifications',
                completed: !!(companyData.certificationsList && companyData.certificationsList.length > 0),
            },
        ];

        const completed = items.filter(item => item.completed).length;
        const total = items.length;
        const percentage = Math.round((completed / total) * 100);

        return { percentage, completed, total, items };
    }, [companyData]);

    const getProgressColor = (percentage) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 50) return 'bg-blue-500';
        if (percentage >= 25) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const [showDetails, setShowDetails] = React.useState(false);

    if (!companyData) {
        return null;
    }

    return (
        <div
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
            data-tour="profile-completion"
        >
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Profile Completion</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {completionData.completed} of {completionData.total} items completed
                    </p>
                </div>
                <div className="text-right">
                    <div className={`text-2xl font-bold ${getProgressColor(completionData.percentage).replace('bg-', 'text-').replace('-500', '-600')}`}>
                        {completionData.percentage}%
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${getProgressColor(completionData.percentage)}`}
                    style={{ width: `${completionData.percentage}%` }}
                />
            </div>

            {/* Toggle Details Button */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-[#2563EB] hover:text-[#1d4ed8] font-medium flex items-center gap-1"
            >
                {showDetails ? 'Hide Details' : 'Show Details'}
                <svg
                    className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Details List */}
            {showDetails && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <ul className="space-y-2">
                        {completionData.items.map((item, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                                {item.completed ? (
                                    <MdOutlineCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                ) : (
                                    <MdOutlineRadioButtonUnchecked className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                                <span className={item.completed ? 'text-gray-700' : 'text-gray-500'}>
                                    {item.label}
                                </span>
                            </li>
                        ))}
                    </ul>
                    {completionData.percentage < 100 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                💡 <strong>Tip:</strong> Complete your profile to improve RFP matching and increase your chances of winning proposals!
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfileCompletionPercentage;

