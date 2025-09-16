import { useState, useEffect, useCallback } from 'react';
import NavbarComponent from './NavbarComponent';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { MdOutlineEdit, MdOutlineSearch, MdOutlineRotateLeft, MdOutlineDeleteForever, MdPersonAddAlt1, MdOutlineClose } from "react-icons/md";
import axios from 'axios';
import { useUser } from '../context/UserContext';
import Swal from 'sweetalert2';
import PaymentButton from '../components/PaymentButton';

const localizer = momentLocalizer(moment);

const statusStyles = {
    "In Progress": "bg-[#DBEAFE] text-[#2563EB]",
    "Won": "bg-[#FEF9C3] text-[#CA8A04]",
    "Submitted": "bg-[#DCFCE7] text-[#15803D]",
    "Rejected": "bg-[#FEE2E2] text-[#DC2626]",
    "Posted": "bg-[#DBEAFE] text-[#2563EB]",
    "Forecasted": "bg-[#FEF3C7] text-[#F59E42]",
    "Closed": "bg-[#FEE2E2] text-[#DC2626]",
    "Archived": "bg-[#F3F4F6] text-[#6B7280]",
};

// Helper: bg color map for calendar
const bgColor = {
    'In Progress': 'bg-[#DBEAFE] bg-opacity-50',
    'Submitted': 'bg-[#DCFCE7] bg-opacity-50',
    'Won': 'bg-[#FEF9C3] bg-opacity-50',
    'Rejected': 'bg-[#FEE2E2] bg-opacity-50',
    'Deadline': 'bg-[#FEF3C7] bg-opacity-50',
    'Posted': 'bg-[#DBEAFE] bg-opacity-50',
    'Forecasted': 'bg-[#FEF3C7] bg-opacity-50',
    'Closed': 'bg-[#FEE2E2] bg-opacity-50',
    'Archived': 'bg-[#F3F4F6] bg-opacity-50',
}

// Helper: status color map for bg and text, dot
const statusBgMap = {
    'In Progress': 'bg-[#DBEAFE] text-[#2563EB]',
    'Submitted': 'bg-[#DCFCE7] text-[#16A34A]',
    'Won': 'bg-[#FEF9C3] text-[#CA8A04]',
    'Rejected': 'bg-[#FEE2E2] text-[#DC2626]',
    'Deadline': 'bg-[#FEF3C7] text-[#F59E42]',
    'Posted': 'bg-[#DBEAFE] text-[#2563EB]',
    'Forecasted': 'bg-[#FEF3C7] text-[#F59E42]',
    'Closed': 'bg-[#FEE2E2] text-[#DC2626]',
    'Archived': 'bg-[#F3F4F6] text-[#6B7280]',
};

const statusDotMap = {
    'In Progress': 'bg-[#2563EB]',
    'Submitted': 'bg-[#16A34A]',
    'Won': 'bg-[#CA8A04]',
    'Rejected': 'bg-[#DC2626]',
    'Deadline': 'bg-[#F59E42]',
    'Posted': 'bg-[#2563EB]',
    'Forecasted': 'bg-[#F59E42]',
    'Closed': 'bg-[#DC2626]',
    'Archived': 'bg-[#6B7280]',
};

function statusBadge(status) {
    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap inline-block ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
}

const getSummaryCardBgColor = (label) => {
    switch (label) {
        case "All Proposals":
            return "linear-gradient(180deg, #EFF6FF 0%, #99B9FF 100%)";
        case "In Progress":
            return "linear-gradient(180deg, #EEF2FF 0%, #C1BDFF 100%)";
        case "Submitted":
            return "linear-gradient(180deg, #F0FDF4 0%, #A0FFC3 100%)";
        case "Won":
            return "linear-gradient(180deg, #FEFCE8 0%, #FFD171 100%)";
        default:
            return "linear-gradient(180deg, #F3F4F6 0%, #F3F4F6 100%)";
    }
};

const getSummaryCardTextColor = (label) => {
    switch (label) {
        case "All Proposals":
            return "#2563EB";
        case "In Progress":
            return "#4F46E5";
        case "Submitted":
            return "#16A34A";
        case "Won":
            return "#CA8A04";
        default:
            return "#000000";
    }
};

const PAGE_SIZE = 5;
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/dashboard`;

const Dashboard = () => {
    const user = localStorage.getItem("user");
    const userName = user ? (JSON.parse(user).fullName) : "Unknown User";
    const userEmail = user ? (JSON.parse(user).email) : "No email found";
    const { role } = useUser();

    // State for backend data
    const [proposalsState, setProposalsState] = useState([]);
    const [deletedProposals, setDeletedProposals] = useState([]);
    const [grantProposals, setGrantProposals] = useState([]);
    const [deletedGrantProposals, setDeletedGrantProposals] = useState([]);
    const [summaryStats, setSummaryStats] = useState([]);
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState('');
    const [grantSearch, setGrantSearch] = useState('');
    const [showAddPersonIdx, setShowAddPersonIdx] = useState(null);
    const [showAddGrantPersonIdx, setShowAddGrantPersonIdx] = useState(null);
    const [selectedProposals, setSelectedProposals] = useState([]);
    const [selectedGrantProposals, setSelectedGrantProposals] = useState([]);
    const [showDeleteOptions, setShowDeleteOptions] = useState(false);
    const [showGrantDeleteOptions, setShowGrantDeleteOptions] = useState(false);
    const [currentProposalPage, setCurrentProposalPage] = useState(1);
    const [currentDeletedPage, setCurrentDeletedPage] = useState(1);
    const [currentGrantPage, setCurrentGrantPage] = useState(1);
    const [currentDeletedGrantPage, setCurrentDeletedGrantPage] = useState(1);
    const [calendarMonth, setCalendarMonth] = useState(moment().month());
    const [calendarYear, setCalendarYear] = useState(moment().year());
    const [openDropdownDate, setOpenDropdownDate] = useState(null);
    const [addEventModalOpen, setAddEventModalOpen] = useState(false);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [fetchedDashboardData, setFetchedDashboardData] = useState(false);

    const [editIdx, setEditIdx] = useState(null);
    const [editForm, setEditForm] = useState({ deadline: "", submittedAt: "", status: "" });

    const [editGrantIdx, setEditGrantIdx] = useState(null);
    const [editGrantForm, setEditGrantForm] = useState({ deadline: "", status: "" });

    const handleEditClick = (idx, proposal) => {
        setEditIdx(idx);
        setEditForm({
            deadline: proposal.deadline ? new Date(proposal.deadline).toISOString().split('T')[0] : "",
            submittedAt: proposal.submittedAt ? new Date(proposal.submittedAt).toISOString().split('T')[0] : "",
            status: proposal.status
        });
    };

    const handleEditChange = (field, value) => {
        // console.log(field, value);
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProposal = async (proposalId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.put(
                `${BASE_URL}/updateProposal`,
                { proposalId, updates: editForm },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (res.status === 200) {
                setEditIdx(null);
                Swal.fire({
                    title: 'Success!',
                    text: 'Proposal updated!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    showCancelButton: false
                });

                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (err) {
            // console.error("Error updating proposal:", err);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update proposal',
                icon: 'error',
                timer: 1500,
                showConfirmButton: true
            });
        }
    };

    // Grant Proposal handlers
    const handleEditGrantClick = (idx, proposal) => {
        setEditGrantIdx(idx);
        setEditGrantForm({
            deadline: proposal.CLOSE_DATE ? new Date(proposal.CLOSE_DATE).toISOString().split('T')[0] : "",
            status: proposal.OPPORTUNITY_STATUS || proposal.status
        });
    };

    const handleEditGrantChange = (field, value) => {
        setEditGrantForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveGrantProposal = async (proposalId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.put(
                `${BASE_URL}/updateGrantProposal`,
                { proposalId, updates: editGrantForm },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (res.status === 200) {
                setEditGrantIdx(null);
                Swal.fire({
                    title: 'Success!',
                    text: 'Grant proposal updated!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    showCancelButton: false
                });

                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (err) {
            // console.error("Error updating grant proposal:", err);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update grant proposal',
                icon: 'error',
                timer: 1500,
                showConfirmButton: true
            });
        }
    };

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token'); // Adjust if you store token differently
            const res = await axios.get(`${BASE_URL}/getDashboardData`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = res.data;
            setProposalsState(data.proposals?.proposals || []);
            setDeletedProposals(data.deletedProposals?.proposals || []);
            setGrantProposals(data.proposals?.grantProposals || []);
            setDeletedGrantProposals(data.deletedProposals?.grantProposals || []);
            setSummaryStats([
                { label: 'All Proposals', value: data.totalProposals || 0 },
                { label: 'In Progress', value: data.inProgressProposals || 0 },
                { label: 'Submitted', value: data.submittedProposals || 0 },
                { label: 'Won', value: data.wonProposals || 0 },
            ]);
            setCalendarEvents(data.calendarEvents || []);
            setEmployees(data.employees || []);
            setSubscriptionData(data.subscription || null);
        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!fetchedDashboardData) {
            fetchDashboardData();
            setFetchedDashboardData(true);
        }
    }, [fetchedDashboardData]);

    const handleSetCurrentEditor = async (idx, editorId) => {
        const editor = employees.find(emp => emp.employeeId === editorId);

        const result = await Swal.fire({
            title: 'Assign Editor',
            text: `Are you sure you want to assign ${editor.name} as the current editor for this proposal?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563EB',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, assign editor!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.put(`${BASE_URL}/setCurrentEditor`, {
                    proposalId: proposalsState[idx]._id,
                    editorId: editorId
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (res.status === 200) {
                    setProposalsState(prev => prev.map((p, i) => i === idx ? { ...p, currentEditor: { _id: editor.employeeId, fullName: editor.name, email: editor.email } } : p));
                    setShowAddPersonIdx(null);

                    Swal.fire(
                        'Editor Assigned!',
                        `${editor.name} has been assigned as the current editor.`,
                        'success'
                    );
                } else {
                    Swal.fire(
                        'Error!',
                        'Failed to assign editor.',
                        'error'
                    );
                }
            } catch (error) {
                Swal.fire(
                    'Error!',
                    'Failed to assign editor.',
                    'error'
                );
            }
        }
    };

    const handleSetGrantCurrentEditor = async (idx, editorId) => {
        const editor = employees.find(emp => emp.employeeId === editorId);

        const result = await Swal.fire({
            title: 'Assign Editor',
            text: `Are you sure you want to assign ${editor.name} as the current editor for this grant proposal?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563EB',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, assign editor!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.put(`${BASE_URL}/setGrantCurrentEditor`, {
                    proposalId: grantProposals[idx]._id,
                    editorId: editorId
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (res.status === 200) {
                    setGrantProposals(prev => prev.map((p, i) => i === idx ? { ...p, currentEditor: { _id: editor.employeeId, fullName: editor.name, email: editor.email } } : p));
                    setShowAddPersonIdx(null);

                    Swal.fire(
                        'Editor Assigned!',
                        `${editor.name} has been assigned as the current editor for this grant proposal.`,
                        'success'
                    );
                } else {
                    Swal.fire(
                        'Error!',
                        'Failed to assign editor.',
                        'error'
                    );
                }
            } catch (error) {
                Swal.fire(
                    'Error!',
                    'Failed to assign editor.',
                    'error'
                );
            }
        }
    };

    const handleSelectProposal = (idx) => {
        setSelectedProposals(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
    };

    const handleSelectGrantProposal = (idx) => {
        setSelectedGrantProposals(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
    };

    const handleDeleteProposals = async () => {
        const result = await Swal.fire({
            title: 'Delete Proposals',
            text: `Are you sure you want to delete ${selectedProposals.length} proposal(s)? They will be moved to deleted proposals and can be restored within 15 days.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete them!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.put(`${BASE_URL}/deleteProposals`, {
                    proposalIds: selectedProposals.map(idx => proposalsState[idx]._id)
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (res.status === 200) {
                    // Add restoreIn field to proposals being moved to deletedProposals
                    const proposalsToDelete = proposalsState.filter((_, idx) => selectedProposals.includes(idx));
                    // console.log("proposalsToDelete", proposalsToDelete);
                    const proposalsWithRestoreIn = proposalsToDelete.map(proposal => ({
                        ...proposal,
                        restoreIn: "15 days"
                    }));

                    // console.log("proposalsWithRestoreIn", proposalsWithRestoreIn);

                    // Update summary stats when proposals are moved to deleted
                    setSummaryStats(prev => {
                        let newStats = [...prev];
                        proposalsToDelete.forEach(proposal => {
                            // Subtract from All Proposals
                            newStats = newStats.map(stat =>
                                stat.label === "All Proposals"
                                    ? { ...stat, value: Math.max(0, stat.value - 1) }
                                    : stat
                            );
                            // Subtract from specific status
                            newStats = newStats.map(stat =>
                                stat.label === proposal.status
                                    ? { ...stat, value: Math.max(0, stat.value - 1) }
                                    : stat
                            );
                        });
                        return newStats;
                    });

                    setDeletedProposals(prev => [...prev, ...proposalsWithRestoreIn]);
                    setProposalsState(prev => prev.filter((_, idx) => !selectedProposals.includes(idx)));
                    setSelectedProposals([]);
                    setShowDeleteOptions(false);

                    Swal.fire(
                        'Deleted!',
                        'Proposals have been moved to deleted proposals.',
                        'success'
                    );
                } else {
                    setError('Failed to delete proposals');
                    Swal.fire(
                        'Error!',
                        'Failed to delete proposals.',
                        'error'
                    );
                }
            } catch (error) {
                setError('Failed to delete proposals');
                Swal.fire(
                    'Error!',
                    'Failed to delete proposals.',
                    'error'
                );
            }
        }
    };

    const handleDeleteGrantProposals = async () => {
        const result = await Swal.fire({
            title: 'Delete Grant Proposals',
            text: `Are you sure you want to delete ${selectedGrantProposals.length} grant proposal(s)? They will be moved to deleted grant proposals and can be restored within 15 days.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete them!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.put(`${BASE_URL}/deleteGrantProposals`, {
                    proposalIds: selectedGrantProposals.map(idx => grantProposals[idx]._id)
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`

                    }
                });
                if (res.status === 200) {
                    const grantProposalsToDelete = grantProposals.filter((_, idx) => selectedGrantProposals.includes(idx));
                    const grantProposalsWithRestoreIn = grantProposalsToDelete.map(proposal => ({
                        ...proposal,
                        restoreIn: "15 days"
                    }));

                    setDeletedGrantProposals(prev => [...prev, ...grantProposalsWithRestoreIn]);
                    setGrantProposals(prev => prev.filter((_, idx) => !selectedGrantProposals.includes(idx)));
                    setSelectedGrantProposals([]);
                    setShowGrantDeleteOptions(false);

                    Swal.fire(
                        'Deleted!',
                        'Grant proposals have been moved to deleted grant proposals.',
                        'success'
                    );
                } else {
                    setError('Failed to delete grant proposals');
                    Swal.fire(
                        'Error!',
                        'Failed to delete grant proposals.',
                        'error'
                    );
                }
            } catch (error) {
                setError('Failed to delete grant proposals');
                Swal.fire(
                    'Error!',
                    'Failed to delete grant proposals.',
                    'error'
                );
            }
        }
    };

    const handleRestoreProposal = async (idx) => {
        const result = await Swal.fire({
            title: 'Restore Proposal',
            text: 'Are you sure you want to restore this proposal?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16A34A',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, restore it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.put(`${BASE_URL}/restoreProposal`, {
                    proposalId: deletedProposals[idx]._id
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (res.status === 200) {
                    // Remove restoreIn field when restoring proposal
                    const { restoreIn, ...proposalWithoutRestoreIn } = deletedProposals[idx];

                    // Update summary stats when proposal is restored
                    setSummaryStats(prev => {
                        let newStats = [...prev];
                        // Add 1 to All Proposals
                        newStats = newStats.map(stat =>
                            stat.label === "All Proposals"
                                ? { ...stat, value: stat.value + 1 }
                                : stat
                        );
                        // Add 1 to specific status
                        newStats = newStats.map(stat =>
                            stat.label === proposalWithoutRestoreIn.status
                                ? { ...stat, value: stat.value + 1 }
                                : stat
                        );
                        return newStats;
                    });

                    setProposalsState(prev => [...prev, proposalWithoutRestoreIn]);
                    setDeletedProposals(prev => prev.filter((_, i) => i !== idx));

                    Swal.fire(
                        'Restored!',
                        'Proposal has been restored successfully.',
                        'success'
                    );
                } else {
                    setError('Failed to restore proposal');
                    Swal.fire(
                        'Error!',
                        'Failed to restore proposal.',
                        'error'
                    );
                }
            } catch (error) {
                setError('Failed to restore proposal');
                Swal.fire(
                    'Error!',
                    'Failed to restore proposal.',
                    'error'
                );
            }
        }
    };

    const handleRestoreGrantProposal = async (idx) => {
        const result = await Swal.fire({
            title: 'Restore Grant Proposal',
            text: 'Are you sure you want to restore this grant proposal?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16A34A',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, restore it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.put(`${BASE_URL}/restoreGrantProposal`, {
                    proposalId: deletedGrantProposals[idx]._id
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (res.status === 200) {
                    const { restoreIn, ...proposalWithoutRestoreIn } = deletedGrantProposals[idx];

                    setGrantProposals(prev => [...prev, proposalWithoutRestoreIn]);
                    setDeletedGrantProposals(prev => prev.filter((_, i) => i !== idx));

                    Swal.fire(
                        'Restored!',
                        'Grant proposal has been restored successfully.',
                        'success'
                    );
                } else {
                    setError('Failed to restore grant proposal');
                    Swal.fire(
                        'Error!',
                        'Failed to restore grant proposal.',
                        'error'
                    );
                }
            } catch (error) {
                setError('Failed to restore grant proposal');
                Swal.fire(
                    'Error!',
                    'Failed to restore grant proposal.',
                    'error'
                );
            }
        }
    };

    const handleDeletePermanently = async (idx) => {
        const result = await Swal.fire({
            title: 'Delete Permanently',
            text: 'Are you sure you want to delete this proposal permanently? This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete permanently!',
            cancelButtonText: 'Cancel',
            dangerMode: true
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.put(`${BASE_URL}/deletePermanently`, {
                    proposalId: deletedProposals[idx]._id
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (res.status === 200) {
                    setDeletedProposals(prev => prev.filter((_, i) => i !== idx));

                    Swal.fire(
                        'Deleted Permanently!',
                        'Proposal has been permanently deleted.',
                        'success'
                    );
                } else {
                    setError('Failed to delete proposal permanently');
                    Swal.fire(
                        'Error!',
                        'Failed to delete proposal permanently.',
                        'error'
                    );
                }
            } catch (error) {
                setError('Failed to delete proposal permanently');
                Swal.fire(
                    'Error!',
                    'Failed to delete proposal permanently.',
                    'error'
                );
            }
        }
    };

    const handleDeleteGrantPermanently = async (idx) => {
        const result = await Swal.fire({
            title: 'Delete Grant Proposal Permanently',
            text: 'Are you sure you want to delete this grant proposal permanently? This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete permanently!',
            cancelButtonText: 'Cancel',
            dangerMode: true
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.put(`${BASE_URL}/deleteGrantPermanently`, {
                    proposalId: deletedGrantProposals[idx]._id
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (res.status === 200) {
                    setDeletedGrantProposals(prev => prev.filter((_, i) => i !== idx));

                    Swal.fire(
                        'Deleted Permanently!',
                        'Grant proposal has been permanently deleted.',
                        'success'
                    );
                } else {
                    setError('Failed to delete grant proposal permanently');
                    Swal.fire(
                        'Error!',
                        'Failed to delete grant proposal permanently.',
                        'error'
                    );
                }
            } catch (error) {
                setError('Failed to delete grant proposal permanently');
                Swal.fire(
                    'Error!',
                    'Failed to delete grant proposal permanently.',
                    'error'
                );
            }
        }
    };

    const AddEventModal = ({ isOpen, onClose }) => {
        const [formData, setFormData] = useState({
            title: '',
            start: '',
            end: '',
        });

        const [errors, setErrors] = useState({});
        const [calendarError, setCalendarError] = useState('');

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            // Handle form submission logic here
            // console.log('Event Data:', formData);
            if (!formData.title) {
                setErrors({ title: 'Title is required' });
                return;
            }
            if (!formData.start) {
                setErrors({ start: 'Start date is required' });
                return;
            }
            if (!formData.end) {
                setErrors({ end: 'End date is required' });
                return;
            }
            setErrors({});
            // console.log('Event Data:', formData);
            try {
                const token = localStorage.getItem('token');

                const res = await axios.post(`${BASE_URL}/addCalendarEvent`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (res.status === 201) {
                    setFormData({ title: '', start: '', end: '' });
                    setCalendarError('');
                    setErrors({});
                    Swal.fire(
                        'Success!',
                        'Event added successfully',
                        'success'
                    );
                    setCalendarEvents(prev => [...prev, res.data.event]);
                    onClose();
                } else {
                    setCalendarError('Failed to add event');
                }
            } catch (error) {
                setCalendarError('Failed to add event');
            }
        };

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Add Event</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <MdOutlineClose className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <input
                                type="text"
                                placeholder="Event Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg p-2 w-full"
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Start Date</label>
                            <input
                                type="date"
                                name="start"
                                value={formData.start}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg p-2 w-full"
                            />
                            {errors.start && <p className="text-red-500 text-sm">{errors.start}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">End Date</label>
                            <input
                                type="date"
                                name="end"
                                value={formData.end}
                                min={formData.start}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg p-2 w-full"
                            />
                            {errors.end && <p className="text-red-500 text-sm">{errors.end}</p>}
                        </div>
                        <button
                            type="submit"
                            className="bg-[#2563EB] text-white px-4 py-2 rounded-lg hover:bg-[#1D4ED8] transition"
                        >
                            Add Event
                        </button>
                    </form>
                    {calendarError && <p className="text-red-500 mt-4">{calendarError}</p>}
                </div>
            </div>
        );
    };

    const handleAddEvent = () => {
        setAddEventModalOpen(true);
    };

    // Pagination logic for proposals
    const filteredProposals = proposalsState.filter(p => (p.name || p.title || '').toLowerCase().includes(search.toLowerCase()));
    const totalProposalPages = Math.ceil(filteredProposals.length / PAGE_SIZE);
    const paginatedProposals = filteredProposals.slice((currentProposalPage - 1) * PAGE_SIZE, currentProposalPage * PAGE_SIZE);

    // Pagination logic for deleted proposals
    const totalDeletedPages = Math.ceil(deletedProposals.length / PAGE_SIZE);
    const paginatedDeletedProposals = deletedProposals.slice((currentDeletedPage - 1) * PAGE_SIZE, currentDeletedPage * PAGE_SIZE);

    // Pagination logic for grant proposals
    const filteredGrantProposals = grantProposals.filter(p => (p.name || p.title || '').toLowerCase().includes(grantSearch.toLowerCase()));
    const totalGrantPages = Math.ceil(filteredGrantProposals.length / PAGE_SIZE);
    const paginatedGrantProposals = filteredGrantProposals.slice((currentGrantPage - 1) * PAGE_SIZE, currentGrantPage * PAGE_SIZE);

    // Pagination logic for deleted grant proposals
    const totalDeletedGrantPages = Math.ceil(deletedGrantProposals.length / PAGE_SIZE);
    const paginatedDeletedGrantProposals = deletedGrantProposals.slice((currentDeletedGrantPage - 1) * PAGE_SIZE, currentDeletedGrantPage * PAGE_SIZE);

    // Helper: get all years in a reasonable range
    // Get 5 years before and after the current year
    const currentYear = moment().year();
    const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
    const monthOptions = moment.months();

    // Helper: get events for a specific date
    function getEventsForDate(date) {
        return calendarEvents.filter(ev =>
            moment(ev.startDate).isSameOrBefore(date, 'day') && moment(ev.endDate).isSameOrAfter(date, 'day')
        );
    }

    // Custom date cell for calendar
    function CustomDateCellWrapper({ value }) {
        const events = getEventsForDate(value);
        const isEmpty = events.length === 0;

        // Sort: Deadline first, then others
        const sortedEvents = [...events].sort((a, b) => {
            if (a.status === "Deadline") return -1;
            if (b.status === "Deadline") return 1;
            return 0;
        });

        // For dropdown toggle
        const dateKey = moment(value).format("YYYY-MM-DD");
        const isDropdownOpen = openDropdownDate === dateKey;

        // Check if this is a rightmost cell to prevent dropdown overflow
        // For rightmost cells (Thursday, Friday, Saturday), position dropdown to the left
        const dayOfWeek = moment(value).day(); // 0 = Sunday, 6 = Saturday
        const isRightmostCell = dayOfWeek >= 4; // Thursday, Friday, Saturday (last 3 days)

        return (
            <div
                className={`relative h-full w-full min-h-[56px] min-w-[56px] p-1 sm:min-h-[80px] sm:min-w-[80px] sm:p-2 ${isEmpty ? 'bg-[#F3F4F6]' : bgColor[sortedEvents[0]?.status]} border border-[#E5E7EB] flex flex-col justify-start items-start transition`}
                style={{ fontSize: '12px' }}
            >
                <div className="absolute top-1 left-2 text-[18px] text-[#9CA3AF] font-medium">{moment(value).date()}</div>
                {sortedEvents.length > 0 && (
                    <>
                        {/* Show the most important event */}
                        <div className="absolute bottom-6 left-2 mb-1 flex flex-col items-start w-full">
                            <span className="font-medium text-[13px] sm:text-[17px] line-clamp-4 w-full pr-2">{sortedEvents[0].title}</span>
                            <span className={`flex items-center gap-1 mt-1 px-2 py-[2px] rounded-full text-[10px] sm:text-xs font-medium ${statusBgMap[sortedEvents[0].status]}`}>
                                <span className={`inline-block w-2 h-2 rounded-full ${statusDotMap[sortedEvents[0].status]}`}></span>
                                {sortedEvents[0].status}
                            </span>
                        </div>
                        {/* Show "+X more" if more events */}
                        {sortedEvents.length > 1 && (
                            <div
                                className="absolute bottom-1 left-2 text-[10px] sm:text-[11px] text-[#2563EB] cursor-pointer font-medium"
                                onClick={() => setOpenDropdownDate(isDropdownOpen ? null : dateKey)}
                            >
                                {isDropdownOpen ? 'Hide' : `+${sortedEvents.length - 1} more`}
                            </div>
                        )}
                        {/* Dropdown with all events */}
                        {isDropdownOpen && (
                            <div className={`absolute z-[9999] top-0 p-3 w-64 h-full rounded-lg border border-[#E5E7EB] shadow-lg overflow-y-auto custom-scrollbar ${isRightmostCell
                                ? 'right-full mr-2'
                                : 'left-full ml-2'
                                }`}
                                style={{
                                    background: "linear-gradient(135deg, rgb(100, 149, 237) 30%, rgb(147, 112, 219) 100%)"
                                }}>
                                <div className="text-sm font-medium text-white mb-3">All Events for {moment(value).format('MMM DD, YYYY')}</div>
                                {sortedEvents.map((ev, i) => (
                                    <div key={i} className="flex flex-col justify-between items-start mb-3 last:mb-0 p-2 bg-gray-50 rounded custom-scrollbar">
                                        <span className="font-medium text-sm mb-1 break-words">{ev.title}</span>
                                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBgMap[ev.status]}`}>
                                            <span className={`inline-block w-2 h-2 rounded-full ${statusDotMap[ev.status]}`}></span>
                                            {ev.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    }

    if (loading) {
        return <>
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                    <p className="text-gray-500 mt-4">Please wait while we fetch the Dashboard data...</p>
                </div>
            </div>
        </>;
    }

    return (
        <div className="min-h-screen">
            <NavbarComponent />
            <main className="w-full mx-auto py-8 px-4 md:px-12 mt-12">

                {/* Proposals Data */}
                <div className="rounded-lg p-6 mb-6" style={{ background: "url('/dashboard-bg.png') no-repeat center center", backgroundSize: "cover" }}>
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <h1 className="text-[36px] text-[#000000] mb-4">Welcome <span className="font-semibold">{userName}</span>!</h1>

                            {/* Progress Bars */}
                            <div className="grid grid-cols-1 md:grid-cols-2 w-[90%] xs:max-w-[70%] md:max-w-[65%] lg:max-w-[50%] gap-4 mb-4 mt-4">
                                <div className="w-full">
                                    <label className="block text-[18px] text-[#000000] mb-2">Proposals Left</label>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-[#8300AB] h-3 rounded-full"
                                            style={{
                                                width: subscriptionData ? `${Math.max(0, (subscriptionData.maxRFPs - subscriptionData.currentRFPs) / subscriptionData.maxRFPs * 100)}%` : '0%'
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {subscriptionData ? `${Math.max(0, subscriptionData.maxRFPs - subscriptionData.currentRFPs)} out of ${subscriptionData.maxRFPs}` : 'Loading...'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[18px] text-[#000000] mb-2">Grants Left</label>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-[#8300AB] h-3 rounded-full"
                                            style={{
                                                width: subscriptionData ? `${Math.max(0, (subscriptionData.maxGrants - subscriptionData.currentGrants) / subscriptionData.maxGrants * 100)}%` : '0%'
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {subscriptionData ? `${Math.max(0, subscriptionData.maxGrants - subscriptionData.currentGrants)} out of ${subscriptionData.maxGrants}` : 'Loading...'}
                                    </p>
                                </div>
                            </div>

                            <p className="text-[#8300AB] font-medium mb-3">
                                Current plan: {subscriptionData ? subscriptionData.plan_name : 'Loading...'}
                            </p>
                            {subscriptionData && subscriptionData.plan_name !== "Enterprise" && (
                                <PaymentButton
                                    variant="primary"
                                    size="sm"
                                    className="bg-[#8300AB] hover:bg-[#6B0089]"
                                >
                                    Upgrade
                                </PaymentButton>
                            )}
                        </div>
                    </div>
                </div>

                <h2 className="text-[24px] font-semibold mb-4">Tracking Dashboard</h2>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4 mb-4">
                    {summaryStats.map((stat) => (
                        <div key={stat.label} className={`p-3 sm:p-4 rounded shadow text-left`} style={{
                            background: getSummaryCardBgColor(stat.label),
                            color: getSummaryCardTextColor(stat.label)
                        }}>
                            <div className="text-[11px] sm:text-[13px] md:text-[16px] capitalize">{stat.label.replace(/([A-Z])/g, " $1").trim()}</div>
                            <div className={`text-[18px] sm:text-[24px] md:text-[32px] font-semibold`}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Search and Actions for RFP Proposals */}
                <div className="flex flex-row items-center justify-between mb-4 gap-2 mt-2">
                    <div className="flex relative w-full md:w-1/3 items-center gap-2">
                        <MdOutlineSearch className="absolute left-3 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search RFP proposals"
                            className="border rounded px-3 py-2 w-full bg-white border-[#E5E7EB] text-[#9CA3AF] pl-10 focus:outline-none focus:ring-1 focus:ring-[#111827]"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="justify-end group flex gap-2">
                        {paginatedProposals.length > 0 && role !== "Viewer" && (
                            <button
                                className={`flex items-center gap-1 px-4 py-2 border rounded text-[14px] md:text-[16px] ${role === "Viewer"
                                    ? "border-[#D1D5DB] text-[#9CA3AF] cursor-not-allowed opacity-50"
                                    : "text-[#2563EB] border-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white"
                                    }`}
                                onClick={role === "Viewer" ? undefined : () => setShowDeleteOptions(true)}
                                disabled={role === "Viewer" || paginatedProposals.length === 0}
                                title={role === "Viewer" ? "Viewer cannot delete proposals" : "Delete RFP proposals"}
                            >
                                <MdOutlineDeleteForever className={`w-5 h-5 ${role === "Viewer" ? "" : "group-hover:text-white"}`} /> Delete RFP
                            </button>
                        )}
                    </div>
                </div>

                {/* RFP Proposals Table */}
                <h3 className="text-[18px] sm:text-[24px] font-semibold mb-2">RFP Proposals</h3>
                <div className="bg-white rounded-lg shadow overflow-x-auto mb-8">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-[#F8FAFC]">
                                {showDeleteOptions && <th className="px-4 py-2"></th>}
                                <th className="px-4 py-2 text-left font-medium">Proposal Name</th>
                                <th className="px-4 py-2 text-left font-medium">Client Name</th>
                                <th className="px-4 py-2 text-left font-medium">Current Editor</th>
                                <th className="px-4 py-2 text-left font-medium">Deadline</th>
                                <th className="px-4 py-2 text-left font-medium">Status</th>
                                <th className="px-4 py-2 text-left font-medium">Submission Date</th>
                                <th className="px-4 py-2 text-left font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProposals
                                .map((p, idx) => {
                                    const realIdx = (currentProposalPage - 1) * PAGE_SIZE + idx;
                                    return (
                                        <tr key={realIdx} className="border-t">
                                            {showDeleteOptions && (
                                                <td className="px-2 py-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProposals.includes(realIdx)}
                                                        onChange={() => handleSelectProposal(realIdx)}
                                                    />
                                                </td>
                                            )}

                                            <td className="px-4 py-2 font-semibold">
                                                <a
                                                    href={p.url || p.urlLink || p.link || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#2563EB] hover:underline"
                                                >
                                                    {p.title || p.OPPORTUNITY_TITLE || 'Not Provided'}
                                                </a>
                                            </td>

                                            <td className="px-4 py-2">{p.client || "Not Provided"}</td>

                                            {p.currentEditor && p.currentEditor.email === userEmail ? (
                                                <td className="px-4 py-2 relative">
                                                    <div className="flex items-center gap-2">
                                                        <span>{userName.split(" ")[0]} (You)</span>
                                                        <button
                                                            className="text-[#2563EB]"
                                                            title="Assign Editor"
                                                            onClick={() => setShowAddPersonIdx(realIdx)}
                                                        >
                                                            <MdPersonAddAlt1 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    {showAddPersonIdx === realIdx && (
                                                        <>
                                                            {/* Backdrop blur overlay for the table */}
                                                            <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-10" />

                                                            {/* Dropdown with scrollable content */}
                                                            <div className="absolute bg-white border border-[#E5E7EB] rounded-md shadow-lg z-20 mt-4 w-40 max-h-48 overflow-hidden">
                                                                <div className="p-3 border-b border-[#E5E7EB]">
                                                                    <h2 className="text-[14px] font-medium text-gray-800">Assign Editor</h2>
                                                                    <button
                                                                        className="text-gray-500 absolute top-3 right-3 hover:text-gray-700"
                                                                        onClick={() => setShowAddPersonIdx(null)}
                                                                    >
                                                                        <MdOutlineClose className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                                <div className="max-h-32 overflow-y-auto">
                                                                    <ul className="p-1">
                                                                        {/* Only show editors to assign as current editor */}
                                                                        {employees.filter(emp => emp.name !== userName && emp.accessLevel === "Editor").map(emp => (
                                                                            <li key={emp.name} className="mb-1">
                                                                                <button
                                                                                    className="block px-3 py-2 bg-gray-50 rounded-md border border-gray-200 hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] w-full text-left text-[14px] transition-colors"
                                                                                    onClick={() => handleSetCurrentEditor(realIdx, emp.employeeId)}
                                                                                >
                                                                                    {emp.name}
                                                                                </button>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </td>
                                            ) : (
                                                <td className="px-4 py-2 relative">
                                                    <div className="flex items-center gap-2">
                                                        <span>{p.currentEditor ? p.currentEditor.fullName : p.currentEditor ? p.currentEditor.email : p.currentEditor ? p.currentEditor.name : "No Editor Assigned"}</span>
                                                        {role === "company" && (
                                                            <button
                                                                className="text-[#2563EB]"
                                                                title="Assign Editor"
                                                                onClick={() => setShowAddPersonIdx(realIdx)}
                                                            >
                                                                <MdPersonAddAlt1 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    {showAddPersonIdx === realIdx && (
                                                        <>
                                                            {/* Backdrop blur overlay for the table */}
                                                            <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-10" />

                                                            {/* Dropdown with scrollable content */}
                                                            <div className="absolute bg-white border border-[#E5E7EB] rounded-md shadow-lg z-20 mt-4 w-40 max-h-48 overflow-hidden">
                                                                <div className="p-3 border-b border-[#E5E7EB]">
                                                                    <h2 className="text-[14px] font-medium text-gray-800">Assign Editor</h2>
                                                                    <button
                                                                        className="text-gray-500 absolute top-3 right-3 hover:text-gray-700"
                                                                        onClick={() => setShowAddPersonIdx(null)}
                                                                    >
                                                                        <MdOutlineClose className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                                <div className="max-h-32 overflow-y-auto">
                                                                    <ul className="p-1">
                                                                        {/* Only show editors to assign as current editor */}
                                                                        {employees.filter(emp => emp.name !== userName && emp.accessLevel === "Editor").map(emp => (
                                                                            <li key={emp.name} className="mb-1">
                                                                                <button
                                                                                    className="block px-3 py-2 bg-gray-50 rounded-md border border-gray-200 hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] w-full text-left text-[14px] transition-colors"
                                                                                    onClick={() => handleSetCurrentEditor(realIdx, emp.employeeId)}
                                                                                >
                                                                                    {emp.name}
                                                                                </button>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </td>
                                            )}

                                            <td className="px-4 py-2">
                                                {editIdx === realIdx ? (
                                                    <input
                                                        type="date"
                                                        value={editForm.deadline}
                                                        onChange={e => handleEditChange("deadline", e.target.value)}
                                                        className="border border-[#111827] rounded px-2 py-1 text-[#111827] text-[16px] w-full bg-[#F3F4F6] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                                                    />
                                                ) : (
                                                    p.deadline || p.CLOSE_DATE ? new Date(p.deadline || p.CLOSE_DATE).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    }) : 'No deadline'
                                                )}
                                            </td>

                                            <td className="px-4 py-2">
                                                {editIdx === realIdx ? (
                                                    <select className="w-full border border-[#111827] rounded px-3 py-2 text-[#111827] text-[16px] bg-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-w-[140px]" value={editForm.status} onChange={e => handleEditChange("status", e.target.value)}>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Submitted">Submitted</option>
                                                        <option value="Won">Won</option>
                                                        <option value="Rejected">Rejected</option>
                                                    </select>
                                                ) : (
                                                    statusBadge(p.status)
                                                )}
                                            </td>

                                            <td className="px-4 py-2">
                                                {editIdx === realIdx ? (
                                                    <input
                                                        type="date"
                                                        value={editForm.submittedAt}
                                                        onChange={e => handleEditChange("submittedAt", e.target.value)}
                                                        className="border border-[#111827] rounded px-2 py-1 text-[#111827] text-[16px] w-full bg-[#F3F4F6] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                                                    />
                                                ) : (
                                                    p.submittedAt || p.SUBMITTED_AT ? new Date(p.submittedAt || p.SUBMITTED_AT).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    }) : 'Not submitted'
                                                )}
                                            </td>

                                            <td className="px-4 py-2">
                                                {editIdx === realIdx ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            className="flex items-center gap-1 text-[16px] text-[#2563EB] hover:text-white hover:bg-[#2563EB] rounded-md px-2 py-1 transition-colors"
                                                            title="Save"
                                                            onClick={() => handleSaveProposal(p._id)}
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            className="flex items-center gap-1 text-[16px] text-[#111827] hover:text-white hover:bg-[#111827] rounded-md px-2 py-1 transition-colors"
                                                            title="Cancel"
                                                            onClick={() => setEditIdx(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className={`flex items-center gap-1 transition-colors ${role === "Viewer" || (role !== "company" && !(p.currentEditor && p.currentEditor.email === userEmail))
                                                            ? "text-[#9CA3AF] cursor-not-allowed opacity-50"
                                                            : "text-[#2563EB] hover:text-[#1D4ED8]"
                                                            }`}
                                                        title={role === "Viewer" ? "Viewer cannot edit proposals" : (role !== "company" && !(p.currentEditor && p.currentEditor.email === userEmail)) ? "Only current editor can edit this proposal" : "Edit Details"}
                                                        onClick={role === "Viewer" || (role !== "company" && !(p.currentEditor && p.currentEditor.email === userEmail)) ? undefined : () => handleEditClick(realIdx, p)}
                                                        disabled={role === "Viewer" || (role !== "company" && !(p.currentEditor && p.currentEditor.email === userEmail))}
                                                    >
                                                        <MdOutlineEdit className="w-5 h-5" /> Edit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            {/* if no proposals, show a message */}
                            {paginatedProposals.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-4">No proposals found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {/* Pagination controls for proposals */}
                    <div className="flex justify-end gap-2 my-2 px-4">
                        <button
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            onClick={() => setCurrentProposalPage(p => Math.max(1, p - 1))}
                            disabled={currentProposalPage === 1}
                        >Prev</button>
                        {Array.from({ length: totalProposalPages }, (_, i) => (
                            <button
                                key={i}
                                className={`px-2 py-1 border rounded ${currentProposalPage === i + 1 ? 'bg-[#2563EB] text-white' : ''}`}
                                onClick={() => setCurrentProposalPage(i + 1)}
                            >{i + 1}</button>
                        ))}
                        <button
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            onClick={() => setCurrentProposalPage(p => Math.min(totalProposalPages, p + 1))}
                            disabled={currentProposalPage === totalProposalPages}
                        >Next</button>
                    </div>
                    {showDeleteOptions && (
                        <div className="flex gap-4 mt-4 justify-end mb-4 px-4">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded"
                                onClick={handleDeleteProposals}
                            >
                                Delete
                            </button>
                            <button
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                                onClick={() => {
                                    setShowDeleteOptions(false);
                                    setSelectedProposals([]);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* Search and Actions for Grant Proposals */}
                <div className="flex flex-row items-center justify-between mb-4 gap-2">
                    <div className="flex relative w-full md:w-1/3 items-center gap-2">
                        <MdOutlineSearch className="absolute left-3 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search grant proposals"
                            className="border rounded px-3 py-2 w-full bg-white border-[#E5E7EB] text-[#9CA3AF] pl-10 focus:outline-none focus:ring-1 focus:ring-[#111827]"
                            value={grantSearch}
                            onChange={e => setGrantSearch(e.target.value)}
                        />
                    </div>
                    <div className="justify-end group flex gap-2">
                        {paginatedGrantProposals.length > 0 && role !== "Viewer" && (
                            <button
                                className={`flex items-center gap-1 px-4 py-2 border rounded text-[14px] md:text-[16px] ${role === "Viewer"
                                    ? "border-[#D1D5DB] text-[#9CA3AF] cursor-not-allowed opacity-50"
                                    : "text-[#2563EB] border-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white"
                                    }`}
                                onClick={role === "Viewer" ? undefined : () => setShowGrantDeleteOptions(true)}
                                disabled={role === "Viewer" || paginatedGrantProposals.length === 0}
                                title={role === "Viewer" ? "Viewer cannot delete grant proposals" : "Delete grant proposals"}
                            >
                                <MdOutlineDeleteForever className={`w-5 h-5 ${role === "Viewer" ? "" : "group-hover:text-white"}`} /> Delete Grants
                            </button>
                        )}
                    </div>
                </div>

                {/* Grant Proposals Table */}
                <h3 className="text-[18px] sm:text-[24px] font-semibold mb-2">Grant Proposals</h3>
                <div className="bg-white rounded-lg shadow overflow-x-auto mb-8">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-[#F8FAFC]">
                                {showGrantDeleteOptions && <th className="px-4 py-2"></th>}
                                <th className="px-4 py-2 text-left font-medium">Opportunity Title</th>
                                <th className="px-4 py-2 text-left font-medium">Agency Name</th>
                                <th className="px-4 py-2 text-left font-medium">Current Editor</th>
                                <th className="px-4 py-2 text-left font-medium">Close Date</th>
                                <th className="px-4 py-2 text-left font-medium">Status</th>
                                <th className="px-4 py-2 text-left font-medium">Submitted Date</th>
                                <th className="px-4 py-2 text-left font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedGrantProposals
                                .map((p, idx) => {
                                    const realIdx = (currentGrantPage - 1) * PAGE_SIZE + idx;
                                    return (
                                        <tr key={realIdx} className="border-t">
                                            {showGrantDeleteOptions && (
                                                <td className="px-2 py-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedGrantProposals.includes(realIdx)}
                                                        onChange={() => handleSelectGrantProposal(realIdx)}
                                                    />
                                                </td>
                                            )}

                                            <td className="px-4 py-2 font-semibold">
                                                <a href={p.url || p.urlLink || p.OPPORTUNITY_NUMBER_LINK || '#'} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] hover:underline">
                                                    {p.title || p.OPPORTUNITY_TITLE || 'Not Provided'}
                                                </a>
                                            </td>

                                            <td className="px-4 py-2">{p.AGENCY_NAME || p.client || "Not Provided"}</td>

                                            {p.currentEditor && p.currentEditor.email === userEmail ? (
                                                <td className="px-4 py-2 relative">
                                                    <div className="flex items-center gap-2">
                                                        <span>{userName.split(" ")[0]} (You)</span>
                                                        <button
                                                            className="text-[#2563EB]"
                                                            title="Assign Editor"
                                                            onClick={() => setShowAddGrantPersonIdx(realIdx)}
                                                        >
                                                            <MdPersonAddAlt1 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    {showAddGrantPersonIdx === realIdx && (
                                                        <>
                                                            {/* Backdrop blur overlay for the table */}
                                                            <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-10" />

                                                            {/* Dropdown with scrollable content */}
                                                            <div className="absolute bg-white border border-[#E5E7EB] rounded-md shadow-lg z-20 mt-4 w-40 max-h-48 overflow-hidden">
                                                                <div className="p-3 border-b border-[#E5E7EB]">
                                                                    <h2 className="text-[14px] font-medium text-gray-800">Assign Editor</h2>
                                                                    <button
                                                                        className="text-gray-500 absolute top-3 right-3 hover:text-gray-700"
                                                                        onClick={() => setShowAddGrantPersonIdx(null)}
                                                                    >
                                                                        <MdOutlineClose className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                                <div className="max-h-32 overflow-y-auto">
                                                                    <ul className="p-1">
                                                                        {/* Only show editors to assign as current editor */}
                                                                        {employees.filter(emp => emp.name !== userName && emp.accessLevel === "Editor").map(emp => (
                                                                            <li key={emp.name} className="mb-1">
                                                                                <button
                                                                                    className="block px-3 py-2 bg-gray-50 rounded-md border border-gray-200 hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] w-full text-left text-[14px] transition-colors"
                                                                                    onClick={() => handleSetGrantCurrentEditor(realIdx, emp.employeeId)}
                                                                                >
                                                                                    {emp.name}
                                                                                </button>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </td>
                                            ) : (
                                                <td className="px-4 py-2 relative">
                                                    <div className="flex items-center gap-2">
                                                        <span>{p.currentEditor ? p.currentEditor.fullName : p.currentEditor ? p.currentEditor.email : p.currentEditor ? p.currentEditor.name : "No Editor Assigned"}</span>
                                                        {role === "company" && (
                                                            <button
                                                                className="text-[#2563EB]"
                                                                title="Assign Editor"
                                                                onClick={() => setShowAddGrantPersonIdx(realIdx)}
                                                            >
                                                                <MdPersonAddAlt1 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    {showAddGrantPersonIdx === realIdx && (
                                                        <>
                                                            {/* Backdrop blur overlay for the table */}
                                                            <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-10" />

                                                            {/* Dropdown with scrollable content */}
                                                            <div className="absolute bg-white border border-[#E5E7EB] rounded-md shadow-lg z-20 mt-4 w-40 max-h-48 overflow-hidden">
                                                                <div className="p-3 border-b border-[#E5E7EB]">
                                                                    <h2 className="text-[14px] font-medium text-gray-800">Assign Editor</h2>
                                                                    <button
                                                                        className="text-gray-500 absolute top-3 right-3 hover:text-gray-700"
                                                                        onClick={() => setShowAddGrantPersonIdx(null)}
                                                                    >
                                                                        <MdOutlineClose className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                                <div className="p-1">
                                                                    <ul className="max-h-32 overflow-y-auto">
                                                                        {/* Only show editors to assign as current editor */}
                                                                        {employees.filter(emp => emp.name !== userName && emp.accessLevel === "Editor").map(emp => (
                                                                            <li key={emp.name} className="mb-1">
                                                                                <button
                                                                                    className="block px-3 py-2 bg-gray-50 rounded-md border border-gray-200 hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] w-full text-left text-[14px] transition-colors"
                                                                                    onClick={() => handleSetGrantCurrentEditor(realIdx, emp.employeeId)}
                                                                                >
                                                                                    {emp.name}
                                                                                </button>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </td>
                                            )}

                                            <td className="px-4 py-2">
                                                {editGrantIdx === realIdx ? (
                                                    <input
                                                        type="date"
                                                        value={editGrantForm.deadline}
                                                        onChange={e => handleEditGrantChange("deadline", e.target.value)}
                                                        className="border border-[#111827] rounded px-2 py-1 text-[#111827] text-[16px] w-full bg-[#F3F4F6] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                                                    />
                                                ) : (
                                                    p.CLOSE_DATE || p.deadline ? new Date(p.CLOSE_DATE || p.deadline).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    }) : "No close date"
                                                )}
                                            </td>

                                            <td className="px-4 py-2">
                                                {editGrantIdx === realIdx ? (
                                                    <select className="w-full border border-[#111827] rounded px-3 py-2 text-[#111827] text-[16px] bg-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-w-[140px]" value={editGrantForm.status} onChange={e => handleEditGrantChange("status", e.target.value)}>
                                                        <option value="Posted">Posted</option>
                                                        <option value="Forecasted">Forecasted</option>
                                                        <option value="Closed">Closed</option>
                                                        <option value="Archived">Archived</option>
                                                    </select>
                                                ) : (
                                                    statusBadge(p.OPPORTUNITY_STATUS || p.status)
                                                )}
                                            </td>

                                            <td className="px-4 py-2">
                                                {p.submittedAt || p.SUBMITTED_AT ? new Date(p.submittedAt || p.SUBMITTED_AT).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : "Not submitted"}
                                            </td>

                                            <td className="px-4 py-2">
                                                {editGrantIdx === realIdx ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            className="flex items-center gap-1 text-[16px] text-[#2563EB] hover:text-white hover:bg-[#2563EB] rounded-md px-2 py-1 transition-colors"
                                                            title="Save"
                                                            onClick={() => handleSaveGrantProposal(p._id)}
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            className="flex items-center gap-1 text-[16px] text-[#111827] hover:text-white hover:bg-[#111827] rounded-md px-2 py-1 transition-colors"
                                                            title="Cancel"
                                                            onClick={() => setEditGrantIdx(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className={`flex items-center gap-1 transition-colors ${role === "Viewer" || (role !== "company" && !(p.currentEditor && p.currentEditor.email === userEmail))
                                                            ? "text-[#9CA3AF] cursor-not-allowed opacity-50"
                                                            : "text-[#2563EB] hover:text-[#1D4ED8]"
                                                            }`}
                                                        title={role === "Viewer" ? "Viewer cannot edit grant proposals" : (role !== "company" && !(p.currentEditor && p.currentEditor.email === userEmail)) ? "Only current editor can edit this grant proposal" : "Edit Details"}
                                                        onClick={role === "Viewer" || (role !== "company" && !(p.currentEditor && p.currentEditor.email === userEmail)) ? undefined : () => handleEditGrantClick(realIdx, p)}
                                                        disabled={role === "Viewer" || (role !== "company" && !(p.currentEditor && p.currentEditor.email === userEmail))}
                                                    >
                                                        <MdOutlineEdit className="w-5 h-5" /> Edit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            {/* if no grant proposals, show a message */}
                            {paginatedGrantProposals.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-4">"No grant proposals found"</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {/* Pagination controls for grant proposals */}
                    <div className="flex justify-end gap-2 my-2 px-4">
                        <button
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            onClick={() => setCurrentGrantPage(p => Math.max(1, p - 1))}
                            disabled={currentGrantPage === 1}
                        >Prev</button>
                        {Array.from({ length: totalGrantPages }, (_, i) => (
                            <button
                                key={i}
                                className={`px-2 py-1 border rounded ${currentGrantPage === i + 1 ? 'bg-[#2563EB] text-white' : ''}`}
                                onClick={() => setCurrentGrantPage(i + 1)}
                            >{i + 1}</button>
                        ))}
                        <button
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            onClick={() => setCurrentGrantPage(p => Math.min(totalGrantPages, p + 1))}
                            disabled={currentGrantPage === totalGrantPages || paginatedGrantProposals.length === 0}
                        >Next</button>
                    </div>
                    {showGrantDeleteOptions && (
                        <div className="flex gap-4 mt-4 justify-end mb-4 px-4">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded"
                                onClick={handleDeleteGrantProposals}
                                disabled={paginatedGrantProposals.length === 0}
                                title={paginatedGrantProposals.length === 0 ? "No grant proposals to delete" : "Delete grant proposals"}
                            >
                                Delete
                            </button>
                            <button
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                                onClick={() => {
                                    setShowGrantDeleteOptions(false);
                                    setSelectedGrantProposals([]);
                                }}
                                disabled={paginatedGrantProposals.length === 0}
                                title={paginatedGrantProposals.length === 0 ? "No grant proposals to delete" : "Cancel"}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* Calendar Section */}
                <h3 className="text-[18px] sm:text-[24px] font-semibold mt-4 mb-2">Calendar</h3>
                <div className="bg-white rounded-lg shadow p-2 sm:p-4 mb-8 overflow-x-auto">
                    <div className="flex flex-col xs:flex-row items-center justify-between mb-4">
                        <div className="flex gap-2 mb-4">
                            <select value={calendarMonth} onChange={e => setCalendarMonth(Number(e.target.value))} className="bg-[#F3F4F6] border rounded-md px-2 py-1 text-[#111827] text-xs sm:text-base">
                                {monthOptions.map((m, idx) => (
                                    <option key={m} value={idx}>{m}</option>
                                ))}
                            </select>
                            <select value={calendarYear} onChange={e => setCalendarYear(Number(e.target.value))} className="bg-[#F3F4F6] border rounded-md px-2 py-1 text-[#111827] text-xs sm:text-base">
                                {yearOptions.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2 mb-4">
                            <button
                                className="flex items-center gap-1 px-2 py-1 border rounded text-[#2563EB] border-[#2563EB] text-[14px] md:text-[16px] hover:bg-[#2563EB] hover:text-white"
                                onClick={() => handleAddEvent()}
                                disabled={role === "Viewer" || paginatedProposals.length === 0}
                                title={role === "Viewer" || paginatedProposals.length === 0 ? "Viewer cannot add events" : "Add event"}
                            >
                                <MdOutlineEdit className="w-5 h-5" /> Add Event
                            </button>
                        </div>
                    </div>

                    <div className="w-[600px] sm:w-full">
                        <Calendar
                            localizer={localizer}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 1000, width: '100%' }}
                            views={['month']}
                            toolbar={false}
                            date={new Date(calendarYear, calendarMonth, 1)}
                            onNavigate={date => {
                                setCalendarMonth(date.getMonth());
                                setCalendarYear(date.getFullYear());
                            }}
                            components={{
                                month: {
                                    dateCellWrapper: CustomDateCellWrapper,
                                    dateHeader: () => null
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Deleted RFP Proposals Table */}
                <h3 className="text-[18px] sm:text-[24px] font-semibold mb-2">Deleted RFP Proposals</h3>
                <div className="bg-white rounded-lg overflow-x-auto shadow mb-8">
                    <table className="min-w-full text-sm ">
                        <thead>
                            <tr className="bg-[#F8FAFC]">
                                <th className="px-4 py-2 text-left font-medium">Proposal Name</th>
                                <th className="px-4 py-2 text-left font-medium">Client Name</th>
                                <th className="px-4 py-2 text-left font-medium">Deadline</th>
                                <th className="px-4 py-2 text-left font-medium">Status</th>
                                <th className="px-4 py-2 text-left font-medium">Restore in</th>
                                <th className="px-4 py-2 text-left font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedDeletedProposals.map((p, idx) => (
                                <tr key={idx + (currentDeletedPage - 1) * PAGE_SIZE} className="border-t">
                                    <td className="px-4 py-2 font-semibold">{p.title}</td>
                                    <td className="px-4 py-2">{p.client}</td>
                                    <td className="px-4 py-2">{new Date(p.deadline).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}</td>
                                    <td className="px-4 py-2">{statusBadge(p.status)}</td>
                                    <td className="px-4 py-2">{p.restoreIn}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            <button className="text-[#2563EB]" title="Restore" onClick={() => handleRestoreProposal(idx)}>
                                                <MdOutlineRotateLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                className={`${role === "Viewer" ? "text-[#9CA3AF] cursor-not-allowed opacity-50" : "text-[#2563EB]"}`}
                                                title={role === "Viewer" ? "Viewer cannot delete permanently" : "Delete Permanently"}
                                                onClick={role === "Viewer" ? undefined : () => handleDeletePermanently(idx)}
                                                disabled={role === "Viewer" || paginatedDeletedProposals.length === 0}
                                            >
                                                <MdOutlineDeleteForever className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {/* if no deleted proposals, show a message */}
                            {paginatedDeletedProposals.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-4">"No deleted proposals found"</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {/* Pagination controls for deleted proposals */}
                    <div className="flex justify-end gap-2 my-2 px-4">
                        <button
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            onClick={() => setCurrentDeletedPage(p => Math.max(1, p - 1))}
                            disabled={currentDeletedPage === 1 || paginatedDeletedProposals.length === 0}
                        >Prev</button>
                        {Array.from({ length: totalDeletedPages }, (_, i) => (
                            <button
                                key={i}
                                className={`px-2 py-1 border rounded ${currentDeletedPage === i + 1 ? 'bg-[#2563EB] text-white' : ''}`}
                                value={i + 1}
                                onClick={() => setCurrentDeletedPage(i + 1)}
                            >{i + 1}</button>
                        ))}
                        <button
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            onClick={() => setCurrentDeletedPage(p => Math.min(totalDeletedPages, p + 1))}
                            disabled={currentDeletedPage === totalDeletedPages || paginatedDeletedProposals.length === 0}
                        >Next</button>
                    </div>
                </div>

                {/* Deleted Grant Proposals Table */}
                <h3 className="text-[18px] sm:text-[24px] font-semibold mb-2">Deleted Grant Proposals</h3>
                <div className="bg-white rounded-lg overflow-x-auto shadow mb-8">
                    <table className="min-w-full text-sm ">
                        <thead>
                            <tr className="bg-[#F8FAFC]">
                                <th className="px-4 py-2 text-left font-medium">Opportunity Title</th>
                                <th className="px-4 py-2 text-left font-medium">Agency Name</th>
                                <th className="px-4 py-2 text-left font-medium">Close Date</th>
                                <th className="px-4 py-2 text-left font-medium">Status</th>
                                <th className="px-4 py-2 text-left font-medium">Restore in</th>
                                <th className="px-4 py-2 text-left font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedDeletedGrantProposals.map((p, idx) => (
                                <tr key={idx + (currentDeletedGrantPage - 1) * PAGE_SIZE} className="border-t">
                                    <td className="px-4 py-2 font-semibold">{p.OPPORTUNITY_TITLE || 'Not Provided'}</td>
                                    <td className="px-4 py-2">{p.AGENCY_NAME || 'Not Provided'}</td>
                                    <td className="px-4 py-2">{p.CLOSE_DATE ? new Date(p.CLOSE_DATE).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    }) : "No close date"}</td>
                                    <td className="px-4 py-2">{statusBadge(p.OPPORTUNITY_STATUS || p.status)}</td>
                                    <td className="px-4 py-2">{p.restoreIn}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            <button className="text-[#2563EB]" title="Restore" onClick={() => handleRestoreGrantProposal(idx)}>
                                                <MdOutlineRotateLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                className={`${role === "Viewer" ? "text-[#9CA3AF] cursor-not-allowed opacity-50" : "text-[#2563EB]"}`}
                                                title={role === "Viewer" ? "Viewer cannot delete permanently" : "Delete Permanently"}
                                                onClick={role === "Viewer" ? undefined : () => handleDeleteGrantPermanently(idx)}
                                                disabled={role === "Viewer" || paginatedDeletedGrantProposals.length === 0}
                                            >
                                                <MdOutlineDeleteForever className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {/* if no deleted grant proposals, show a message */}
                            {paginatedDeletedGrantProposals.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-4">No deleted grant proposals found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {/* Pagination controls for deleted grant proposals */}
                    <div className="flex justify-end gap-2 my-2 px-4">
                        <button
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            onClick={() => setCurrentDeletedGrantPage(p => Math.max(1, p - 1))}
                            disabled={currentDeletedGrantPage === 1 || paginatedDeletedGrantProposals.length === 0}
                        >Prev</button>
                        {Array.from({ length: totalDeletedGrantPages }, (_, i) => (
                            <button
                                key={i}
                                className={`px-2 py-1 border rounded ${currentDeletedGrantPage === i + 1 ? 'bg-[#2563EB] text-white' : ''}`}
                                onClick={() => setCurrentDeletedGrantPage(i + 1)}
                            >{i + 1}</button>
                        ))}
                        <button
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            onClick={() => setCurrentDeletedGrantPage(p => Math.min(totalDeletedGrantPages, p + 1))}
                            disabled={currentDeletedGrantPage === totalDeletedGrantPages || paginatedDeletedGrantProposals.length === 0}
                        >Next</button>
                    </div>
                </div>

                {/* Add Event Modal */}
                <AddEventModal
                    isOpen={addEventModalOpen}
                    onClose={() => setAddEventModalOpen(false)}
                />
            </main>
        </div>
    );
};

export default Dashboard;
