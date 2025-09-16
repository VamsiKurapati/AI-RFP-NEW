import React, { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const GrantProposalForm = ({
    selectedGrant,
    isOpen,
    onClose,
    onSubmit,
    isGenerating = false,
    initialData = null
}) => {
    const navigate = useNavigate();
    const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/rfp`;
    const [grantProposalData, setGrantProposalData] = useState(initialData || {
        summary: "",
        objectives: "",
        activities: "",
        beneficiaries: "",
        geography: "",
        start_date: "",
        estimated_duration: "",
        budget: {
            total_project_cost: "",
            total_requested_amount: "",
            cost_share_required: "",
            budget_breakdown: ""
        },
        methods_for_measuring_success: ""
    });

    const updateBudgetField = (field, value) => {
        setGrantProposalData(prev => ({
            ...prev,
            budget: {
                ...prev.budget,
                [field]: value
            }
        }));
    };

    const handleClearForm = () => {
        setGrantProposalData({
            summary: "",
            objectives: "",
            activities: "",
            beneficiaries: "",
            geography: "",
            start_date: "",
            estimated_duration: "",
            budget: {
                total_project_cost: "",
                total_requested_amount: "",
                cost_share_required: "",
                budget_breakdown: ""
            },
            methods_for_measuring_success: ""
        });
    };

    const handleFetchGrantProposal = async (grant) => {
        try {
            const res = await axios.post(`${BASE_URL}/getGrantProposal`, {
                grant: grant,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (res.status === 200) {
                if (res.data.message === "Grant Proposal Generated successfully.") {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: res.data.message || 'Grant proposal generated successfully.',
                    });
                    setTimeout(() => {
                        localStorage.setItem('proposalType', "GRANT");
                        navigate('/editor', { state: { jsonData: res.data.proposal, proposalId: res.data.proposalId } });
                    }, 1000);
                } else if (res.data.message === "Grant Proposal Generation is still in Progress. Please wait for it to complete.") {
                    Swal.fire({
                        icon: 'info',
                        title: 'In Progress',
                        text: res.data.message || 'Grant proposal is still being generated. Please wait for it to complete.',
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: res.data.message || 'Failed to fetch Grant proposal.',
                    });
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: res.data.message || 'Failed to fetch Grant proposal.',
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'Failed to fetch Grant proposal.',
            });
            // console.error("Error fetching Grant proposal:", err);
        }
    };

    const handleSubmit = () => {
        onSubmit(grantProposalData);
    };

    if (!isOpen || !selectedGrant) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Grant Proposal Form</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    <p className="text-gray-600 mt-2">{selectedGrant.OPPORTUNITY_TITLE}</p>
                </div>

                <div className="p-6 space-y-8">
                    {/* Sample Data Note */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 text-sm">
                            <strong>Note:</strong> Please fill in all required fields marked with <span className="text-red-500">*</span>. You can use the "Clear Form" button to reset all fields.
                        </p>
                    </div>

                    {/* Summary */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Summary <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={grantProposalData.summary}
                            onChange={(e) => setGrantProposalData(prev => ({ ...prev, summary: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            placeholder="Provide a comprehensive summary of your proposed project..."
                        />
                    </div>

                    {/* Objectives */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Objectives <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={grantProposalData.objectives}
                            onChange={(e) => setGrantProposalData(prev => ({ ...prev, objectives: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            placeholder="Describe the main objectives of your proposed project..."
                        />
                    </div>

                    {/* Activities */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Activities <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={grantProposalData.activities}
                            onChange={(e) => setGrantProposalData(prev => ({ ...prev, activities: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            placeholder="Describe the key activities and tasks of your proposed project..."
                        />
                    </div>

                    {/* Beneficiaries */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Beneficiaries <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={grantProposalData.beneficiaries}
                            onChange={(e) => setGrantProposalData(prev => ({ ...prev, beneficiaries: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            placeholder="Describe the beneficiaries and target population of your proposed project..."
                        />
                    </div>

                    {/* Geography */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Geography <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={grantProposalData.geography}
                            onChange={(e) => setGrantProposalData(prev => ({ ...prev, geography: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Describe the geographic scope of your project..."
                        />
                    </div>

                    {/* Start Date and Duration */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={grantProposalData.start_date}
                                onChange={(e) => setGrantProposalData(prev => ({ ...prev, start_date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estimated Duration <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={grantProposalData.estimated_duration}
                                onChange={(e) => setGrantProposalData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="e.g., 24 months, 3 years..."
                            />
                        </div>
                    </div>

                    {/* Budget */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Budget <span className="text-red-500 text-xs">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Total Project Cost <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={grantProposalData.budget.total_project_cost}
                                    onChange={(e) => updateBudgetField('total_project_cost', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter total project cost..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Total Requested Amount <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={grantProposalData.budget.total_requested_amount}
                                    onChange={(e) => updateBudgetField('total_requested_amount', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter amount requesting from funder..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Cost Share Required <span className="text-red-500 text-xs">*</span>
                                </label>
                                <textarea
                                    value={grantProposalData.budget.cost_share_required}
                                    onChange={(e) => updateBudgetField('cost_share_required', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Describe your cost share contribution and any partner contributions..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Budget Breakdown <span className="text-red-500 text-xs">*</span>
                                </label>
                                <textarea
                                    value={grantProposalData.budget.budget_breakdown}
                                    onChange={(e) => updateBudgetField('budget_breakdown', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Provide detailed budget breakdown with amounts, reasons, and justifications..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Methods for Measuring Success */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Methods for Measuring Success <span className="text-red-500 text-xs">*</span>
                        </label>
                        <textarea
                            value={grantProposalData.methods_for_measuring_success}
                            onChange={(e) => setGrantProposalData(prev => ({ ...prev, methods_for_measuring_success: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            placeholder="Describe the methods and metrics you will use to measure the success of your project..."
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isGenerating}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleClearForm}
                        disabled={isGenerating}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Clear Form
                    </button>
                    <button
                        disabled={isGenerating}
                        onClick={() => handleFetchGrantProposal(selectedGrant)}
                        className="px-6 py-2 text-white rounded-md flex items-center gap-2 transition-colors bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Fetch Grant Proposal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isGenerating}
                        className={`px-6 py-2 text-white rounded-md flex items-center gap-2 transition-colors ${isGenerating
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isGenerating && (
                            <FaSpinner className="animate-spin h-4 w-4" />
                        )}
                        {isGenerating ? 'Generating...' : 'Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GrantProposalForm;
