import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    MdOutlineSearch,
    MdOutlineNotifications,
    MdOutlinePerson,
    MdOutlineManageAccounts,
    MdOutlinePayments,
    MdOutlineHeadsetMic,
    MdOutlineFilterList,
    MdOutlineLogout,
    MdOutlineLock,
    MdOutlineDocumentScanner,
    MdOutlineFileUpload,
    MdOutlineMoney,
    MdOutlineKeyboardArrowDown,
    MdOutlineShoppingBag,
    MdOutlineHeadphones,
    MdOutlineAccountCircle,
    MdOutlineMenu,
    MdOutlineVisibility,
    MdOutlineClose,
    MdOutlineEmail,
    MdOutlineFilePresent,
    MdOutlineFileDownload,
    MdLanguage,
    MdOutlinePhone,
    MdOutlinePermContactCalendar
} from 'react-icons/md';
import { IoLogoLinkedin } from "react-icons/io";
import { LuCrown } from "react-icons/lu";
import { FaRegCheckCircle } from "react-icons/fa";

import axios from 'axios';
import { useNavigate } from "react-router-dom";
import ToastContainer from '../pages/ToastContainer';
import { toast } from 'react-toastify';
import Card from '../components/SuperAdminComponents/Card';
import Swal from 'sweetalert2';


import proposalimg from '../assets/superAdmin/proposal.png';
import parrow from '../assets/superAdmin/parrow.png';
import user from '../assets/superAdmin/user.png';
import bluearrow from '../assets/superAdmin/bluearrow.png';
import redarrow from '../assets/superAdmin/redarrow.png';
import licenseimg from '../assets/superAdmin/license.png';
import revenue from '../assets/superAdmin/revenue.png';
import payment from '../assets/superAdmin/payment.png';
import error from '../assets/superAdmin/error.png';
import request from '../assets/superAdmin/request.png';
import other from '../assets/superAdmin/other.png';
import ShowCustomDetails from '../components/SuperAdminComponents/ShowCustomDetails';




const SuperAdmin = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('user-management');
    const [sidebarHoverEnabled, setSidebarHoverEnabled] = useState(true);
    // Search Terms
    const [searchTerm, setSearchTerm] = useState('');
    const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
    const [supportSearchTerm, setSupportSearchTerm] = useState('');
    const [notificationSearchTerm, setNotificationSearchTerm] = useState('');

    // Inner Tabs
    const [supportTab, setSupportTab] = useState('active');
    const [paymentsTab, setPaymentsTab] = useState('payments');

    // Completed Tickets
    const [completedTickets, setCompletedTickets] = useState(false);

    // Profile
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // View Modals
    const [viewUserModal, setViewUserModal] = useState(false);
    const [viewSupportModal, setViewSupportModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedSupport, setSelectedSupport] = useState(null);

    // Invoice modal states for inline display
    const [openInvoiceRows, setOpenInvoiceRows] = useState(new Set());

    // Ref for the resolved description textarea
    const supportResolvedDescriptionRef = useRef(null);

    // Ref for the admin message textarea
    const adminMessageRef = useRef('');

    // Filters
    const [userStatusFilter, setUserStatusFilter] = useState('all');
    const [transactionStatusFilter, setTransactionStatusFilter] = useState('all');
    const [transactionDateFilter, setTransactionDateFilter] = useState('all');
    const [supportStatusFilter, setSupportStatusFilter] = useState('all');
    const [supportPriorityFilter, setSupportPriorityFilter] = useState('all');
    const [supportTypeFilter, setSupportTypeFilter] = useState('all');
    const [notificationTimeFilter, setNotificationTimeFilter] = useState('All Time');
    const [notificationCategoryFilter, setNotificationCategoryFilter] = useState('All Categories');

    // Filter Modals
    const [userFilterModal, setUserFilterModal] = useState(false);
    const [transactionFilterModal, setTransactionFilterModal] = useState(false);
    const [supportFilterModal, setSupportFilterModal] = useState(false);
    const [notificationTimeFilterModal, setNotificationTimeFilterModal] = useState(false);
    const [notificationCategoryFilterModal, setNotificationCategoryFilterModal] = useState(false);



    // Data
    const [usersStats, setUsersStats] = useState({});
    const [companiesData, setCompaniesData] = useState([]);
    const [paymentsStats, setPaymentsStats] = useState({});
    const [paymentsData, setPaymentsData] = useState([]);
    let planManagementStats = { "Active Users": 0, "Revenue This Month": 0 };
    const [supportTicketsStats, setSupportTicketsStats] = useState({});
    const [supportTicketsData, setSupportTicketsData] = useState([]);
    const [notificationsData, setNotificationsData] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPageTransactions, setCurrentPageTransactions] = useState(1);
    const [currentPageSupport, setCurrentPageSupport] = useState(1);
    const [currentPageEnterpriseSupport, setCurrentPageEnterpriseSupport] = useState(1);
    const [currentPageNotifications, setCurrentPageNotifications] = useState(1);

    const [loading, setLoading] = useState(false);

    const baseUrl = `${import.meta.env.VITE_API_BASE_URL}`;


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const userLocale = navigator.language || 'en-US';
        return date.toLocaleDateString(userLocale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // New functions for user blocking/unblocking
    const handleUserBlockToggle = async (userId, currentBlockedStatus) => {
        try {
            const newBlockedStatus = !currentBlockedStatus;
            const res = await axios.put(`${baseUrl}/admin/updateCompanyStatus/${userId}`, {
                blocked: newBlockedStatus
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.status === 200) {
                setCompaniesData(prev => (prev || []).map(u => u._id === userId ? { ...u, blocked: newBlockedStatus } : u));
                setFilteredUsers(prev => (prev || []).map(u => u._id === userId ? { ...u, blocked: newBlockedStatus } : u));
                toast.success(`User ${newBlockedStatus ? 'blocked' : 'unblocked'} successfully`);
            }
        } catch (e) {
            toast.error('Failed to update user status');
        }
    };

    // New functions for support ticket management
    const handleSupportStatusUpdate = useCallback(async (ticketId, newStatus) => {
        try {
            // Prepare update data
            const updateData = {
                status: newStatus
            };

            // Get current ticket data
            const currentTicket = supportTicketsData.find(t => t._id === ticketId) || {};
            const currentAdminMessages = currentTicket.adminMessages || [];

            // Always include resolved description if it exists (regardless of status)
            const resolvedDescription = supportResolvedDescriptionRef.current && supportResolvedDescriptionRef.current.value ? supportResolvedDescriptionRef.current.value.trim() : '';
            if (resolvedDescription) {
                updateData.Resolved_Description = resolvedDescription;
            }

            const res = await axios.put(`${baseUrl}/admin/updateSupportTicket/${ticketId}`, updateData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.status === 200) {
                // Update local state
                const updatedTicket = {
                    ...currentTicket,
                    status: newStatus,
                    adminMessages: currentAdminMessages,
                    resolvedDescription: updateData.Resolved_Description || currentTicket.resolvedDescription
                };

                setSupportTicketsData(prev => (prev || []).map(t => t._id === ticketId ? updatedTicket : t));
                setFilteredSupport(prev => (prev || []).map(t => t._id === ticketId ? updatedTicket : t));

                // Update selectedSupport if it's the current ticket
                if (selectedSupport && selectedSupport._id === ticketId) {
                    setSelectedSupport(updatedTicket);
                }

                // Clear admin message field using ref
                if (adminMessageRef.current) {
                    adminMessageRef.current.value = '';
                }
                // Don't clear resolved description - preserve it for display

                toast.success(`Ticket status updated to ${newStatus}`);
            }
        } catch (e) {
            toast.error('Failed to update ticket status');
        }
    }, [supportTicketsData, selectedSupport]);

    // Function to add messages without changing status
    const handleAddMessage = useCallback(async (ticketId) => {
        try {
            const newAdminMessage = adminMessageRef.current ? adminMessageRef.current.value.trim() : '';

            if (!newAdminMessage) {
                toast.warning('Please enter a message');
                return;
            }
            // Prepare update data
            const updateData = {
                newAdminMessage
            };

            const res = await axios.post(`${baseUrl}/admin/addAdminMessage/${ticketId}`, updateData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.status === 200) {
                // Update local state
                const updatedTicket = {
                    ...selectedSupport,
                    adminMessages: [...(selectedSupport.adminMessages || []), { message: newAdminMessage, createdAt: new Date().toISOString() }],
                    resolvedDescription: selectedSupport.resolvedDescription
                };

                setSupportTicketsData(prev => (prev || []).map(t => t._id === ticketId ? updatedTicket : t));
                setFilteredSupport(prev => (prev || []).map(t => t._id === ticketId ? updatedTicket : t));

                // Update selectedSupport if it's the current ticket
                if (selectedSupport && selectedSupport._id === ticketId) {
                    setSelectedSupport(updatedTicket);
                }

                // Clear admin message field using ref
                if (adminMessageRef.current) {
                    adminMessageRef.current.value = '';
                }
                // Don't clear resolved description - preserve it for display

                toast.success('Message added successfully');
            }
        } catch (e) {
            toast.error('Failed to add message');
        }
    }, [supportTicketsData, selectedSupport]);



    // View modal functions
    const openUserModal = (user) => {
        setSelectedUser(user);
        setViewUserModal(true);
    };

    const openSupportModal = async (support) => {
        try {
            if (support.status !== "In Progress" && support.status !== "Completed") {
                // Always set status to "In Progress" when opening modal
                const res = await axios.put(`${baseUrl}/admin/updateSupportTicket/${support._id}`, {
                    status: 'In Progress'
                }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.status === 200) {
                    const updatedSupport = { ...support, status: 'In Progress' };
                    setSupportTicketsData(prev => (prev || []).map(t => t._id === support._id ? updatedSupport : t));
                    setFilteredSupport(prev => (prev || []).map(t => t._id === support._id ? updatedSupport : t));
                    setSelectedSupport(updatedSupport);
                    // Don't clear admin message here - let user keep their message
                    if (supportResolvedDescriptionRef.current) {
                        supportResolvedDescriptionRef.current.value = updatedSupport.resolvedDescription || '';
                    }



                    setViewSupportModal(true);
                }
            } else {
                // Check if we're switching to a different ticket
                if (selectedSupport && selectedSupport._id !== support._id) {
                    if (adminMessageRef.current) {
                        adminMessageRef.current.value = ''; // Clear message when switching tickets
                    }
                }
                setSelectedSupport(support);
                if (supportResolvedDescriptionRef.current) {
                    supportResolvedDescriptionRef.current.value = support.resolvedDescription || '';
                }

                setViewSupportModal(true);
            }
        } catch (e) {
            toast.error('Failed to update support ticket');
            return;
        }
    };

    // Invoice row toggle functions
    const toggleInvoiceRow = (rowId) => {
        setOpenInvoiceRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(rowId)) {
                newSet.delete(rowId);
            } else {
                newSet.add(rowId);
            }
            return newSet;
        });
    };

    const closeAllInvoiceRows = () => {
        setOpenInvoiceRows(new Set());
    };



    // Close modals when clicking outside
    const handleModalBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) {
            setViewUserModal(false);
            setViewSupportModal(false);
            // Clear admin message when closing
            if (adminMessageRef.current) {
                adminMessageRef.current.value = '';
            }
            if (supportResolvedDescriptionRef.current) {
                supportResolvedDescriptionRef.current.value = '';
            }

        }
    }, []);

    // Close modals with Escape key
    useEffect(() => {
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                setViewUserModal(false);
                setViewSupportModal(false);
                // Clear admin message when closing
                if (adminMessageRef.current) {
                    adminMessageRef.current.value = '';
                }
                if (supportResolvedDescriptionRef.current) {
                    supportResolvedDescriptionRef.current.value = '';
                }

                // Close filter modals
                setNotificationTimeFilterModal(false);
                setNotificationCategoryFilterModal(false);
            }
        };

        document.addEventListener('keydown', handleEscapeKey);

        // Close filter modals when clicking outside
        const handleClickOutside = (e) => {
            if (!e.target.closest('.notification-filter-modal')) {
                setNotificationTimeFilterModal(false);
                setNotificationCategoryFilterModal(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Initialize refs when selectedSupport changes
    useEffect(() => {
        if (selectedSupport) {
            if (supportResolvedDescriptionRef.current) {
                supportResolvedDescriptionRef.current.value = selectedSupport.resolvedDescription || '';
            }
            if (adminMessageRef.current) {
                adminMessageRef.current.value = '';
            }


        }
    }, [selectedSupport]);


    // User filter: single select with toggle back to 'all'
    const handleUserStatusChangeFilter = (value) => {
        setUserStatusFilter(value);
        closeAllInvoiceRows();
    };

    // Transaction filters are split by group
    const handleTransactionStatusChangeFilter = (value) => {
        setTransactionStatusFilter(value);
        closeAllInvoiceRows();
    };

    const handleTransactionDateChangeFilter = (value) => {
        setTransactionDateFilter(value);
        closeAllInvoiceRows();
    };

    // Support filters split by group
    const handleSupportStatusChangeFilter = (value) => {
        setSupportStatusFilter(value);
        closeAllInvoiceRows();
    };

    const handleSupportPriorityChangeFilter = (value) => {
        setSupportPriorityFilter(value);
        closeAllInvoiceRows();
    };

    const handleSupportTypeChangeFilter = (value) => {
        setSupportTypeFilter(value);
        closeAllInvoiceRows();
    };

    // Export helpers
    const exportArrayToCSV = (filename, headers, rows) => {
        const csvContent = [
            headers.join(','),
            ...rows.map(row => headers.map(h => {
                const val = row[h] ?? '';
                const escaped = String(val).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportUsers = () => {
        const headers = ['_id', 'companyName', 'email', 'establishedYear', 'location', 'status'];
        const rows = (filteredUsers || []).map(u => ({
            _id: u._id,
            companyName: u.companyName,
            email: u.email,
            establishedYear: u.establishedYear,
            location: u.location,
            status: u.status
        }));
        exportArrayToCSV('companies.csv', headers, rows);
    };

    const handleExportTransactions = () => {
        const headers = ['plan_name', 'company_name', 'company_email', 'payment_method', 'price', 'status', 'transaction_id', 'paid_at', 'start_date', 'end_date', 'max_editors', 'max_viewers', 'max_rfp', 'max_grants'];
        const rows = (filteredTransactions || []).map(t => ({
            plan_name: t.planName,
            company_name: t.companyName || "Not Disclosed",
            company_email: t.email || "Not Disclosed",
            payment_method: t.payment_method || "Not Disclosed",
            price: t.price || "Not Disclosed",
            status: t.status || "Not Disclosed",
            transaction_id: t.transaction_id || "Not Disclosed",
            paid_at: t.paid_at || "Not Disclosed"
        }));
        exportArrayToCSV('transactions.csv', headers, rows);
    };

    const handleNotificationCategoryFilter = (value) => {
        setNotificationCategoryFilter(value);
    };

    // Format filter values for display
    const formatFilterDisplay = (value, filterType) => {
        if (filterType === 'time') {
            switch (value) {
                case 'last7Days': return 'Last 7 Days';
                case 'last14Days': return 'Last 14 Days';
                case 'last30Days': return 'Last 30 Days';
                case 'today': return 'Today';
                case 'yesterday': return 'Yesterday';
                case 'All Time': return 'All Time';
                default: return value;
            }
        } else if (filterType === 'category') {
            switch (value) {
                case 'account access': return 'Account & Access';
                case 'billing & payments': return 'Billing & Payments';
                case 'technical errors': return 'Technical Errors';
                case 'feature requests': return 'Feature Requests';
                case 'proposal issues': return 'Proposal Issues';
                case 'others': return 'Others';
                case 'All Categories': return 'All Categories';
                default: return value;
            }
        }
        return value;
    };

    // Pagination utility functions
    const paginateData = (data, currentPage, rowsPerPage) => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return data.slice(startIndex, endIndex);
    };

    const getTotalPages = (data, rowsPerPage) => {
        return Math.ceil(data.length / rowsPerPage);
    };

    const PaginationComponent = ({ currentPage, totalPages, onPageChange, totalItems, rowsPerPage, onRowsPerPageChange }) => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 p-4 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[#6B7280]">Rows per page:</span>
                    <select
                        value={rowsPerPage}
                        onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                        className="border border-[#E5E7EB] rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-[#6B7280]">
                        {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, totalItems)} of {totalItems}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-[#E5E7EB] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F3F4F6]"
                    >
                        Previous
                    </button>

                    {startPage > 1 && (
                        <>
                            <button
                                onClick={() => onPageChange(1)}
                                className="px-3 py-1 text-sm border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6]"
                            >
                                1
                            </button>
                            {startPage > 2 && <span className="px-2 text-[#6B7280]">...</span>}
                        </>
                    )}

                    {pageNumbers.map(number => (
                        <button
                            key={number}
                            onClick={() => onPageChange(number)}
                            className={`px-3 py-1 text-sm border rounded-lg ${currentPage === number
                                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                                : 'border-[#E5E7EB] hover:bg-[#F3F4F6]'
                                }`}
                        >
                            {number}
                        </button>
                    ))}

                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && <span className="px-2 text-[#6B7280]">...</span>}
                            <button
                                onClick={() => onPageChange(totalPages)}
                                className="px-3 py-1 text-sm border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6]"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-[#E5E7EB] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F3F4F6]"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-[#DCFCE7] text-[#15803D]';
            case 'Blocked':
                return 'bg-[#FEE2E2] text-[#DC2626]';
            case 'Inactive':
                return 'bg-[#FEF9C3] text-[#CA8A04]';
            case 'Success':
                return 'bg-[#DCFCE7] text-[#15803D]';
            case 'Pending':
                return 'bg-[#FEF9C3] text-[#CA8A04]';
            case 'Failed':
                return 'bg-[#FEE2E2] text-[#DC2626]';
            case 'Pending Refund':
                return 'bg-[#FEF9C3] text-[#CA8A04]';
            case 'Refunded':
                return 'bg-[#FEF9C3] text-[#CA8A04]';
            case 'Completed':
                return 'bg-[#DCFCE7] text-[#15803D]';
            case 'In Progress':
                return 'bg-[#DBEAFE] text-[#2563EB]';
            case 'Re-Opened':
                return 'bg-[#FEE2E2] text-[#DC2626]';
            case 'Withdrawn':
                return 'bg-[#4B5563] text-[#111827]';
            case 'Cancelled':
                return 'bg-[#F3F4F6] text-[#6B7280]';
            case 'Connected':
                return 'bg-[#DCFCE7] text-[#15803D]';
            default:
                return 'bg-[#FEF9C3] text-[#CA8A04]';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Low':
                return 'bg-[#DCFCE7] text-[#15803D]';
            case 'Medium':
                return 'bg-[#FEF9C3] text-[#CA8A04]';
            case 'High':
                return 'bg-[#FEE2E2] text-[#DC2626]';
            default:
                return 'bg-[#F3F4F6] text-[#6B7280]';
        }
    };

    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [filteredSupport, setFilteredSupport] = useState([]);
    const [filteredEnterpriseSupport, setFilteredEnterpriseSupport] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);

    useEffect(() => {
        const fetchCompanyStats = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${baseUrl}/admin/getCompanyStatsAndData`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const stats = response.data.stats;
                setUsersStats(stats);
                const companiesData = response.data.CompanyData;
                setCompaniesData(companiesData);
                setFilteredUsers(companiesData);
                planManagementStats["Active Users"] = stats["Active Users"];
            } catch (error) {
                //console.log("error", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyStats();
    }, []);

    useEffect(() => {
        const fetchPaymentStats = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${baseUrl}/admin/getPaymentStatsAndData`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const paymentsData = response.data.PaymentData;
                setPaymentsData(paymentsData);
                const ps = response.data.PaymentStats || {};
                const { revenueThisMonth, ...otherStats } = ps;
                setPaymentsStats(otherStats);
                planManagementStats["Revenue This Month"] = revenueThisMonth || 0;
                setFilteredTransactions(paymentsData);
            } catch (error) {
                //console.log("error", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentStats();
    }, []);

    useEffect(() => {
        const fetchSupportStats = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${baseUrl}/admin/getSupportStatsAndData`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const supportTicketsData = response.data.TicketData;
                setSupportTicketsData(supportTicketsData);
                const supportTicketsStats = response.data.TicketStats;
                setSupportTicketsStats(supportTicketsStats);
                setFilteredSupport(supportTicketsData);
                setFilteredEnterpriseSupport((supportTicketsData || []).filter(t => (t.plan_name || '').toLowerCase() === 'enterprise'));
            } catch (error) {
                //console.log("error", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSupportStats();
    }, []);

    useEffect(() => {
        const fetchNotificationsData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${baseUrl}/admin/getNotificationsData`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const notificationsData = response.data;
                setNotificationsData(notificationsData);
                setFilteredNotifications(notificationsData);
            } catch (error) {
                //console.log("error", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotificationsData();
    }, []);

    useEffect(() => {
        //console.log("searchTerm", searchTerm);
        //console.log("companies", companiesData);
        if (searchTerm) {
            setFilteredUsers((companiesData || []).filter(user =>
                (user.companyName && user.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
            ));
        } else {
            setFilteredUsers(companiesData);
        }
    }, [searchTerm]);

    useEffect(() => {
        //console.log("transactionSearchTerm", transactionSearchTerm);
        //console.log("payments", paymentsData);
        if (transactionSearchTerm) {
            setFilteredTransactions((paymentsData || []).filter(transaction => {
                const term = transactionSearchTerm.toLowerCase();
                return (
                    (transaction.transaction_id && transaction.transaction_id.toLowerCase().includes(term)) ||
                    (transaction.user_id && transaction.user_id.toLowerCase().includes(term)) ||
                    (transaction.payment_method && String(transaction.payment_method).toLowerCase().includes(term)) ||
                    (transaction.companyName && transaction.companyName.toLowerCase().includes(term))
                );
            }));
        } else {
            setFilteredTransactions(paymentsData);
        }
    }, [transactionSearchTerm]);

    useEffect(() => {
        //console.log("supportSearchTerm", supportSearchTerm);
        //console.log("support", supportTicketsData);
        const term = (supportSearchTerm || '').toLowerCase();
        const baseAll = supportTicketsData || [];
        const baseEnterprise = baseAll.filter(t => (t.plan_name || '').toLowerCase() === 'enterprise');
        const filterFn = (ticket) =>
            (ticket.type && ticket.type.toLowerCase().includes(term)) ||
            (ticket.subject && ticket.subject.toLowerCase().includes(term)) ||
            (ticket.ticket_id && ticket.ticket_id.toLowerCase().includes(term));

        setFilteredSupport(term ? baseAll.filter(filterFn) : baseAll);
        setFilteredEnterpriseSupport(term ? baseEnterprise.filter(filterFn) : baseEnterprise);
    }, [supportSearchTerm]);

    useEffect(() => {
        //console.log("notificationSearchTerm", notificationSearchTerm);
        //console.log("notifications", notificationsData);

        if (notificationSearchTerm) {
            const term = notificationSearchTerm.toLowerCase();
            setFilteredNotifications((notificationsData || []).filter(notification =>
                (notification.title && notification.title.toLowerCase().includes(term)) ||
                (notification.description && notification.description.toLowerCase().includes(term)) ||
                (notification.type && notification.type.toLowerCase().includes(term))
            ));
        } else {
            setFilteredNotifications(notificationsData);
        }
    }, [notificationSearchTerm]);

    useEffect(() => {
        const base = notificationsData || [];
        const filtered = base.filter(notification => {
            // time filter
            const time = new Date(notification.created_at || notification.createdAt || notification.time);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const last7Days = new Date(today);
            last7Days.setDate(today.getDate() - 7);
            const last14Days = new Date(today);
            last14Days.setDate(today.getDate() - 14);
            const last30Days = new Date(today);
            last30Days.setDate(today.getDate() - 30);

            let timeOk = true;
            if (notificationTimeFilter === 'today') timeOk = time.toDateString() === today.toDateString();
            else if (notificationTimeFilter === 'yesterday') timeOk = time.toDateString() === yesterday.toDateString();
            else if (notificationTimeFilter === 'last7Days') timeOk = time >= last7Days;
            else if (notificationTimeFilter === 'last14Days') timeOk = time >= last14Days;
            else if (notificationTimeFilter === 'last30Days') timeOk = time >= last30Days;

            // category filter
            const type = (notification.type || '').toLowerCase();
            const cat = (notificationCategoryFilter || 'All Categories').toLowerCase();
            const categoryOk = cat === 'all categories' ? true : type === cat;

            return timeOk && categoryOk;
        });
        setFilteredNotifications(filtered);
    }, [notificationsData, notificationTimeFilter, notificationCategoryFilter]);

    useEffect(() => {
        const base = companiesData || [];
        if (userStatusFilter === 'all') {
            setFilteredUsers(base);
        } else if (userStatusFilter === 'blocked') {
            setFilteredUsers(base.filter(u => u.blocked === true));
        } else if (userStatusFilter === 'active') {
            setFilteredUsers(base.filter(u => !u.blocked && (u.status || '').toLowerCase() === 'active'));
        } else if (userStatusFilter === 'inactive') {
            setFilteredUsers(base.filter(u => !u.blocked && (u.status || '').toLowerCase() === 'inactive'));
        } else {
            setFilteredUsers(base.filter(u => !u.blocked && (u.status || '').toLowerCase() === userStatusFilter));
        }
    }, [companiesData, userStatusFilter]);

    useEffect(() => {
        const base = paymentsData || [];
        const byStatus = transactionStatusFilter === 'all' ? base : base.filter(t => t.status === transactionStatusFilter);
        let result = byStatus;
        if (transactionDateFilter !== 'all') {
            const now = new Date();
            let since = null;
            if (transactionDateFilter === 'last7Days') since = new Date(now.setDate((new Date()).getDate() - 7));
            else if (transactionDateFilter === 'last15Days') since = new Date(now.setDate((new Date()).getDate() - 15));
            else if (transactionDateFilter === 'last30Days') since = new Date(now.setDate((new Date()).getDate() - 30));
            if (since) {
                result = result.filter(t => new Date(t.created_at || t.createdAt) >= since);
            }
        }
        setFilteredTransactions(result);
    }, [paymentsData, transactionStatusFilter, transactionDateFilter]);

    useEffect(() => {
        const baseAll = supportTicketsData || [];
        const baseEnterprise = baseAll.filter(t => (t.plan_name || '').toLowerCase() === 'enterprise');

        const filterPipeline = (base) => {
            const byStatus = supportStatusFilter === 'all' ? base : base.filter(t => (t.status === supportStatusFilter));
            const byPriority = supportPriorityFilter === 'all' ? byStatus : byStatus.filter(t => (t.priority || '').toLowerCase() === supportPriorityFilter.toLowerCase());
            const byType = supportTypeFilter === 'all' ? byPriority : byPriority.filter(t => (t.category || '').toLowerCase() === supportTypeFilter.toLowerCase());
            return byType;
        };

        setFilteredSupport(filterPipeline(baseAll));
        setFilteredEnterpriseSupport(filterPipeline(baseEnterprise));
    }, [supportTicketsData, supportStatusFilter, supportPriorityFilter, supportTypeFilter]);

    // Removed duplicate notifications filter effect; combined above

    useEffect(() => {
        const baseAll = supportTicketsData || [];
        const baseEnterprise = baseAll.filter(support => (support.plan_name || '').toLowerCase() === 'enterprise');
        if (completedTickets) {
            setFilteredSupport(baseAll.filter(support => support.status === 'Completed'));
            setFilteredEnterpriseSupport(baseEnterprise.filter(support => support.status === 'Completed'));
        } else {
            setFilteredSupport(baseAll.filter(support => support.status !== 'Completed'));
            setFilteredEnterpriseSupport(baseEnterprise.filter(support => support.status !== 'Completed'));
        }
    }, [completedTickets, supportTicketsData]);

    useEffect(() => {
        // Reset pagination when search terms change
        setCurrentPage(1);
        closeAllInvoiceRows();
    }, [searchTerm]);

    useEffect(() => {
        // Reset pagination when transaction search terms change
        setCurrentPageTransactions(1);
        closeAllInvoiceRows();
    }, [transactionSearchTerm]);

    useEffect(() => {
        // Reset pagination when support search terms change
        setCurrentPageSupport(1);
        setCurrentPageEnterpriseSupport(1);
        closeAllInvoiceRows();
    }, [supportSearchTerm]);

    useEffect(() => {
        // Reset pagination when notification search terms change
        setCurrentPageNotifications(1);
        closeAllInvoiceRows();
    }, [notificationSearchTerm]);

    useEffect(() => {
        // Reset pagination when user filters change
        setCurrentPage(1);
        closeAllInvoiceRows();
    }, [userStatusFilter]);

    useEffect(() => {
        // Reset pagination when transaction filters change
        setCurrentPageTransactions(1);
        closeAllInvoiceRows();
    }, [transactionStatusFilter, transactionDateFilter]);

    useEffect(() => {
        // Reset pagination when support filters change
        setCurrentPageSupport(1);
        setCurrentPageEnterpriseSupport(1);
        closeAllInvoiceRows();
    }, [supportStatusFilter, supportPriorityFilter, supportTypeFilter]);

    useEffect(() => {
        // Reset pagination when notification filters change
        setCurrentPageNotifications(1);
        closeAllInvoiceRows();
    }, [notificationTimeFilter, notificationCategoryFilter]);



    const renderUserManagement = () => (
        <div className='h-full '>
            {/* Summary Cards */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                {/* CARD 1 - Total Proposals */}

                <div className="h-[242px] rounded-2xl bg-gradient-to-b from-[#413B99] to-[#6C63FF] p-6 flex justify-between items-center shadow-lg w-full">
                    {/* Left Content */}
                    <div>
                        <h2 className="text-white text-2xl font-bold">Welcome!</h2>
                        <p className="text-white text-sm mt-2">View your Total Proposals created</p>
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-white text-4xl font-bold">
                                {usersStats["Total Proposals"]}
                            </span>
                            <img src={parrow} alt="trend" className="w-[56px] h-[56px]" />
                        </div>
                    </div>

                    {/* Right Illustration */}
                    <div>
                        <img src={proposalimg} alt="Proposals" className="mt-[92px] w-[192px] h-[150px]" />
                    </div>
                </div>


                {/* CARD 2 - Remaining Data */}
                <div className="h-[242px] rounded-2xl bg-gradient-to-b from-[#413B99] to-[#6C63FF] p-6 flex justify-between shadow-lg w-full">
                    {/* Left Section */}
                    <div>
                        <h2 className="text-white text-2xl font-bold">Total Users</h2>
                        <p className="text-white text-4xl font-bold mt-2">
                            {usersStats["Total Users"]}
                        </p>

                        <div className="flex gap-4 mt-4">
                            {/* Active Users */}
                            <div className="w-[129px] h-[84px] bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 border border-white">
                                <p className="text-black text-[14px]">Active Users</p>
                                <p className="flex text-lg font-bold">
                                    <span className="text-white text-4xl font-bold">
                                        {usersStats["Active Users"]}
                                    </span>
                                    <img src={bluearrow} alt="trend" className="w-[56px] h-[56px]" />
                                </p>
                            </div>
                            {/* Inactive Users */}
                            <div className="w-[129px] h-[84px] bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 border border-white">
                                <p className="text-black text-[14px]">Inactive Users</p>
                                <p className="flex text-lg font-bold">
                                    <span className="text-white text-4xl font-bold">
                                        {usersStats["Inactive Users"]}
                                    </span>
                                    <img src={redarrow} alt="trend" className="w-[50px] h-[50px]" />
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Illustration */}
                    <div className="flex items-center">
                        <img src={user} alt="Users" className="mt-[92px] w-[192px] h-[150px]" />
                    </div>
                </div>
            </div>


            {/* Search and Filter Bar */}
            <div className="mb-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                        <div className="relative">
                            <MdOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    closeAllInvoiceRows();
                                }}
                                className="pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent w-[530px] text-[#374151] placeholder-[#9CA3AF] bg-white"
                            />
                        </div>

                        <div className="relative">
                            <button className="bg-white flex items-center justify-center space-x-2 px-4 py-2 border border-[#E5E7EB] rounded-lg transition-colors w-full sm:w-auto"
                                onClick={() => setUserFilterModal(!userFilterModal)}
                            >
                                <MdOutlineFilterList className="w-5 h-5" />
                                <span className="text-[16px] text-[#9CA3AF]">Filter</span>
                            </button>

                            {userFilterModal && (
                                <div className="absolute top-10 left-0 w-64 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2 z-1000 border border-[#E5E7EB] z-1000">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[14px] font-medium text-[#111827]">Filters</span>
                                        <button
                                            className="text-[12px] text-[#2563EB] hover:underline"
                                            onClick={() => setUserStatusFilter('all')}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                        <input type="radio" name="userStatusFilter" id="user_all" value="all"
                                            checked={userStatusFilter === 'all'}
                                            onChange={(e) => handleUserStatusChangeFilter(e.target.value)}
                                            className="mt-1"
                                        />
                                        <label htmlFor="user_all" className="cursor-pointer leading-none">All</label>
                                    </div>
                                    {/* Status */}
                                    <span className="text-[16px] font-medium text-[#4B5563]">Status :</span>
                                    <div className="ml-4">
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="userStatusFilter" id="active" value="active"
                                                checked={userStatusFilter === 'active'}
                                                onClick={(e) => { if (userStatusFilter === e.target.value) handleUserStatusChangeFilter('all'); }}
                                                onChange={(e) => handleUserStatusChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="active" className="cursor-pointer leading-none">Active</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="userStatusFilter" id="blocked" value="blocked"
                                                checked={userStatusFilter === 'blocked'}
                                                onClick={(e) => { if (userStatusFilter === e.target.value) handleUserStatusChangeFilter('all'); }}
                                                onChange={(e) => handleUserStatusChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="blocked" className="cursor-pointer leading-none">Blocked</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="userStatusFilter" id="inactive" value="inactive"
                                                checked={userStatusFilter === 'inactive'}
                                                onClick={(e) => { if (userStatusFilter === e.target.value) handleUserStatusChangeFilter('all'); }}
                                                onChange={(e) => handleUserStatusChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="inactive" className="cursor-pointer leading-none">Inactive</label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-center sm:justify-end">
                        <button
                            onClick={handleExportUsers}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-b from-[#6C63FF] to-[#3F73BD] text-white rounded-lg transition-colors w-full sm:w-auto"
                        >
                            <MdOutlineFileUpload className="w-5 h-5" />
                            <span className="text-[16px] text-white">Export</span>
                        </button>
                    </div>

                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-[#E5E7EB] mb-6 overflow-x-auto rounded-2xl">
                <table className="w-full rounded-2xl">
                    <thead className="bg-[#F8F8FF] border-b border-[#0000001A]">
                        <tr>
                            <th className="p-4 text-left text-[16px] font-medium text-[#4B5563] w-1/10">
                                #
                            </th>
                            <th className="p-4 text-left text-[16px] font-medium text-[#4B5563] w-1/3">
                                Company Name
                            </th>
                            <th className="p-4 text-left text-[16px] font-medium text-[#4B5563] w-1/3">
                                Email
                            </th>
                            <th className="p-4 text-left text-[16px] font-medium text-[#4B5563] w-1/6">
                                Status
                            </th>
                            <th className="p-4 text-left text-[16px] font-medium text-[#4B5563] w-1/6">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            const paginatedUsers = paginateData(filteredUsers, currentPage, rowsPerPage);
                            return paginatedUsers.length > 0 ? paginatedUsers.map((user, index) => (
                                <React.Fragment key={index}>
                                    <tr>
                                        <td className="bg-white p-4 whitespace-nowrap text-[16px] font-medium text-[#4B5563]">
                                            {(currentPage - 1) * rowsPerPage + (index + 1)}
                                        </td>
                                        <td className="flex  p-4 whitespace-nowrap">

                                            <img src={`${import.meta.env.VITE_API_BASE_URL}/profile/getProfileImage/file/${user.logoUrl}`} alt="User Logo" className="mt-1 mr-1 w-[30px] h-[30px] rounded-full" />

                                            <div className="flex flex-col">
                                                <span className="text-[16px] font-medium text-[#4B5563]">{user.companyName}</span>
                                                <span className="text-[14px] text-[#6C63FF] ">{user.website}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-[16px] text-[#6C63FF]">
                                            {user.email}
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-[12px] rounded-full ${getStatusColor(user.blocked ? 'Blocked' : user.status)}`}>
                                                {user.blocked ? 'Blocked' : user.status}
                                            </span>
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-[16px] font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    className="p-2 rounded-lg transition-colors flex items-center justify-center hover:bg-blue-50"
                                                    onClick={() => openUserModal(user)}
                                                    title="View Details"
                                                >
                                                    <MdOutlineVisibility className="w-5 h-5 text-[#2563EB]" />
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-[16px] font-medium text-[#4B5563] text-center">
                                        No users found
                                    </td>
                                </tr>
                            );
                        })()}
                    </tbody>
                </table>
                {filteredUsers.length > 0 && (
                    <PaginationComponent
                        currentPage={currentPage}
                        totalPages={getTotalPages(filteredUsers, rowsPerPage)}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            closeAllInvoiceRows();
                        }}
                        totalItems={filteredUsers.length}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(newRowsPerPage) => {
                            setRowsPerPage(newRowsPerPage);
                            setCurrentPage(1); // Reset to first page when changing rows per page
                            closeAllInvoiceRows();
                        }}
                    />
                )}
            </div>
        </div>
    );


    const renderPayments = () => (
        <div className="h-full">
            <div className="flex flex-row gap-4">
                {/* Card-1 - Total Revenue */}

                <div className="h-[242px] rounded-2xl bg-gradient-to-b from-[#413B99] to-[#6C63FF] p-6 flex justify-between shadow-lg w-full">
                    {/* Left Section */}
                    <div>
                        <h2 className="text-white text-2xl font-bold">Total Revenue</h2>
                        <p className="text-white text-4xl font-bold mt-2">
                            {paymentsStats["Total Revenue"]}
                        </p>

                        <div className="flex gap-4 mt-4">
                            {/* Successful Payments */}
                            <div className="w-[129px] h-[84px] bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 border border-white">
                                <p className="text-black text-[14px]">Successful</p>
                                <p className="flex text-lg font-bold">
                                    <span className="text-white text-4xl font-bold">
                                        {paymentsStats["Successful Payments"]}
                                    </span>
                                    <img src={bluearrow} alt="trend" className="w-[56px] h-[56px]" />
                                </p>
                            </div>

                            {/* Failed Payments */}
                            <div className="w-[129px] h-[84px] bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 border border-white">
                                <p className="text-black text-[14px]">Failed</p>
                                <p className="flex text-lg font-bold">
                                    <span className="text-white text-4xl font-bold">
                                        {paymentsStats["Failed Payments"]}
                                    </span>
                                    <img src={redarrow} alt="trend" className="w-[50px] h-[50px]" />
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Illustration */}
                    <div className="flex items-center">
                        <img src={revenue} alt="Users" className="mt-[92px] w-[192px] h-[150px]" />
                    </div>
                </div>

                {/* Card-2 - Total Users */}


                <div className="h-[242px] rounded-2xl bg-gradient-to-b from-[#413B99] to-[#6C63FF] p-6 flex justify-between shadow-lg w-full">
                    {/* Left Section */}
                    <div>

                        <h2 className="text-white text-2xl font-bold">Active Subscriptions</h2>
                        <p className="text-white text-4xl font-bold mt-2">
                            {paymentsStats["Active Subscriptions"]}
                        </p>

                        <div className="flex gap-4 mt-4">
                            {/* Successful Payments */}
                            <div className="w-[135px] h-[84px] bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 border border-white">
                                <p className="text-black text-[14px]">Total Refunds</p>
                                <p className="flex text-lg font-bold">
                                    <span className="text-white text-4xl font-bold">
                                        {paymentsStats["Total Refunds"]}
                                    </span>
                                    <img src={bluearrow} alt="trend" className="w-[56px] h-[56px]" />
                                </p>
                            </div>

                            {/* Failed Payments */}
                            <div className="w-[140px] h-[84px] bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 border border-white">
                                <p className="text-black text-[14px]">Pending Refunds</p>
                                <p className="flex text-lg font-bold">
                                    <span className="text-white text-4xl font-bold">
                                        {paymentsStats["Pending Refunds"]}
                                    </span>
                                    <img src={redarrow} alt="trend" className="w-[50px] h-[50px]" />
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Illustration */}
                    <div className="flex items-center">
                        <img src={payment} alt="Users" className="mt-[92px] w-[180px] h-[150px]" />
                    </div>
                </div>


            </div>


            {/* Search and Filter Bar */}
            <div className="mb-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Search */}
                        <div className="relative">
                            <MdOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={transactionSearchTerm}
                                onChange={(e) => {
                                    setTransactionSearchTerm(e.target.value);
                                    closeAllInvoiceRows();
                                }}
                                className="pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent w-[530px] text-[#374151] placeholder-[#9CA3AF] bg-white"
                            />
                        </div>

                        {/* Filter */}
                        <div className="relative">
                            <button
                                className="bg-white flex items-center justify-center space-x-2 px-4 py-2 border border-[#E5E7EB] rounded-lg transition-colors w-full sm:w-auto"
                                onClick={() => setTransactionFilterModal(!transactionFilterModal)}
                            >
                                <MdOutlineFilterList className="w-5 h-5" />
                                <span className="text-[16px] text-[#9CA3AF]">Filter</span>
                            </button>
                            {transactionFilterModal && (
                                <div className="absolute top-10 left-0 w-64 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2 z-50 border border-[#E5E7EB]">
                                    {/* Filter content same as before */}
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[14px] font-medium text-[#111827]">Filters</span>
                                        <button
                                            className="text-[12px] text-[#2563EB] hover:underline"
                                            onClick={() => { handleTransactionStatusChangeFilter('all'); handleTransactionDateChangeFilter('all'); }}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    {/* All */}
                                    <div className="flex items-center space-x-2">
                                        <input type="radio" name="transactionStatusFilter" id="all" value="all"
                                            checked={transactionStatusFilter === 'all'}
                                            onChange={(e) => handleTransactionStatusChangeFilter(e.target.value)}
                                        />
                                        <label htmlFor="all" className="cursor-pointer leading-none">All</label>
                                    </div>
                                    {/* Status */}
                                    <span className="text-[16px] font-medium text-[#4B5563]">Status :</span>
                                    <div className="ml-4">
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="transactionStatusFilter" id="success" value="Success"
                                                checked={transactionStatusFilter === 'Success'}
                                                onClick={(e) => { if (transactionStatusFilter === e.target.value) handleTransactionStatusChangeFilter('all'); }}
                                                onChange={(e) => handleTransactionStatusChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="success" className="cursor-pointer leading-none">Success</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="transactionStatusFilter" id="failed" value="Failed"
                                                checked={transactionStatusFilter === 'Failed'}
                                                onClick={(e) => { if (transactionStatusFilter === e.target.value) handleTransactionStatusChangeFilter('all'); }}
                                                onChange={(e) => handleTransactionStatusChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="failed" className="cursor-pointer leading-none">Failed</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="transactionStatusFilter" id="refunded" value="Refunded"
                                                checked={transactionStatusFilter === 'Refunded'}
                                                onClick={(e) => { if (transactionStatusFilter === e.target.value) handleTransactionStatusChangeFilter('all'); }}
                                                onChange={(e) => handleTransactionStatusChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="refunded" className="cursor-pointer leading-none">Refunded</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="transactionStatusFilter" id="pendingRefund" value="Pending Refund"
                                                checked={transactionStatusFilter === 'Pending Refund'}
                                                onClick={(e) => { if (transactionStatusFilter === e.target.value) handleTransactionStatusChangeFilter('all'); }}
                                                onChange={(e) => handleTransactionStatusChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="pendingRefund" className="cursor-pointer leading-none">Pending Refund</label>
                                        </div>
                                    </div>
                                    {/* Date */}
                                    <span className="text-[16px] font-medium text-[#4B5563]">Date :</span>
                                    <div className="ml-4">
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="transactionDateFilter" id="today" value="Today"
                                                checked={transactionDateFilter === 'Today'}
                                                onClick={(e) => { if (transactionDateFilter === e.target.value) handleTransactionDateChangeFilter('all'); }}
                                                onChange={(e) => handleTransactionDateChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="today" className="cursor-pointer leading-none">Today</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="transactionDateFilter" id="last24hours" value="Last 24 Hours"
                                                checked={transactionDateFilter === 'Last 24 Hours'}
                                                onClick={(e) => { if (transactionDateFilter === e.target.value) handleTransactionDateChangeFilter('all'); }}
                                                onChange={(e) => handleTransactionDateChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="last24hours" className="cursor-pointer leading-none">Last 24 Hours</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="transactionDateFilter" id="last7days" value="Last 7 Days"
                                                checked={transactionDateFilter === 'Last 7 Days'}
                                                onClick={(e) => { if (transactionDateFilter === e.target.value) handleTransactionDateChangeFilter('all'); }}
                                                onChange={(e) => handleTransactionDateChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="last7days" className="cursor-pointer leading-none">Last 7 Days</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="transactionDateFilter" id="last14days" value="Last 14 Days"
                                                checked={transactionDateFilter === 'Last 14 Days'}
                                                onClick={(e) => { if (transactionDateFilter === e.target.value) handleTransactionDateChangeFilter('all'); }}
                                                onChange={(e) => handleTransactionDateChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="last14days" className="cursor-pointer leading-none">Last 14 Days</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="transactionDateFilter" id="last30days" value="Last 30 Days"
                                                checked={transactionDateFilter === 'Last 30 Days'}
                                                onClick={(e) => { if (transactionDateFilter === e.target.value) handleTransactionDateChangeFilter('all'); }}
                                                onChange={(e) => handleTransactionDateChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="last30days" className="cursor-pointer leading-none">Last 30 Days</label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Export Button */}
                    <div className="flex items-center justify-center sm:justify-end">
                        <button
                            onClick={handleExportTransactions}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-b from-[#6C63FF] to-[#3F73BD] text-white rounded-lg transition-colors w-full sm:w-auto"
                        >
                            <MdOutlineFileUpload className="w-5 h-5" />
                            <span className="text-[16px] text-white">Export</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white border border-[#E5E7EB] mb-6 overflow-x-auto rounded-2xl">
                <table className="w-full rounded-2xl">
                    <thead className="bg-[#F8F8FF] border-b border-[#0000001A]">
                        <tr>
                            <th className="p-4 text-left text-[16px] font-medium text-[#4B5563]">
                                Transaction ID
                            </th>
                            <th className="p-4 text-left text-[16px] font-medium text-[#4B5563]">
                                Company/User
                            </th>
                            <th className="p-4 text-left text-[16px] font-medium text-[#4B5563]">
                                Amount
                            </th>
                            <th className="p-4 text-left text-[16px] font-medium text-[#4B5563]">
                                Status
                            </th>
                            <th className="p-4 text-left text-[16px] font-medium text-[#4B5563]">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            const paginatedTransactions = paginateData(
                                filteredTransactions,
                                currentPageTransactions,
                                rowsPerPage
                            );
                            return paginatedTransactions.length > 0 ? (
                                paginatedTransactions.map((transaction, index) => (
                                    <React.Fragment key={index}>
                                        <tr className="hover:bg-[#F8FAFC] transition-colors">
                                            <td className="p-4 whitespace-nowrap text-[16px] font-medium text-[#4B5563]">
                                                {transaction.transaction_id}
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-[16px] font-medium text-[#4B5563]">
                                                {transaction.companyName}
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-[16px] font-medium text-[#6C63FF]">
                                                ${transaction.price}
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-3 py-1 text-[12px] font-semibold rounded-full ${getStatusColor(
                                                        transaction.status
                                                    )}`}
                                                >
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-[16px] font-medium">
                                                <button
                                                    className="p-2 rounded-lg transition-colors flex items-center justify-center hover:bg-blue-50"
                                                    onClick={() =>
                                                        toggleInvoiceRow(`payment-${transaction.transaction_id}`)
                                                    }
                                                    title="View Invoice"
                                                >
                                                    <MdOutlineVisibility className="w-5 h-5 text-[#6C63FF]" />
                                                </button>
                                            </td>
                                        </tr>
                                        <InlineInvoiceModal
                                            data={transaction}
                                            isOpen={openInvoiceRows.has(
                                                `payment-${transaction.transaction_id}`
                                            )}
                                            onClose={() =>
                                                toggleInvoiceRow(`payment-${transaction.transaction_id}`)
                                            }
                                        />
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-4 whitespace-nowrap text-[16px] font-medium text-[#4B5563] text-center"
                                    >
                                        No transactions found
                                    </td>
                                </tr>
                            );
                        })()}
                    </tbody>
                </table>

                {filteredTransactions.length > 0 && (
                    <PaginationComponent
                        currentPage={currentPageTransactions}
                        totalPages={getTotalPages(filteredTransactions, rowsPerPage)}
                        onPageChange={(page) => {
                            setCurrentPageTransactions(page);
                            closeAllInvoiceRows();
                        }}
                        totalItems={filteredTransactions.length}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(newRowsPerPage) => {
                            setRowsPerPage(newRowsPerPage);
                            setCurrentPageTransactions(1);
                            closeAllInvoiceRows();
                        }}
                    />
                )}
            </div>
        </div>
    );





    const [plans, setPlans] = useState([]);
    const [editingPlans, setEditingPlans] = useState({});
    const [isYearlyb, setIsYearlyb] = useState(false);
    const [isYearlyp, setIsYearlyp] = useState(false);
    const [isYearlye, setIsYearlye] = useState(false);
    const [isContact, setIsContact] = useState(false);


    const subPlan = async () => {
        try {
            const data = await axios.get(`${baseUrl}/admin/getSubscriptionPlansData`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setPlans(data.data);
            // console.log("data.data.plans", data.data.plans);
            for (let i = 0; i < data.data.plans.length; i++) {
                if (data.data.plans[i].name === "Enterprise") {
                    setIsContact(data.data.plans[i].isContact);
                    // console.log("Enterprise isContact:", data.data.plans[i].isContact);
                    break;
                }
            }
        } catch (err) {
            // console.error("Failed to fetch plans:", err);
            Swal.fire({
                title: "Failed to fetch plans:",
                icon: "warning",
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: false,
            });
        }
    };

    useEffect(() => {
        subPlan();
    }, []);

    useEffect(() => {
        // console.log("Updated isContact:", isContact);
    }, [isContact]);


    const startEdit = (plan) => {
        const value = {
            editPrice: {
                value:
                    plan.name === "Basic" && isYearlyb
                        ? plan.yearlyPrice
                        : plan.name === "Pro" && isYearlyp
                            ? plan.yearlyPrice
                            : plan.name === "Enterprise" && isYearlye
                                ? plan.yearlyPrice
                                : plan.monthlyPrice,
                planId: plan._id,
                planName: plan.name,
            },
            editValue: {
                maxEditors: plan.maxEditors,
                maxViewers: plan.maxViewers,
                maxRFPProposalGenerations: plan.maxRFPProposalGenerations,
                maxGrantProposalGenerations: plan.maxGrantProposalGenerations,
            },
        };
        setEditingPlans((prev) => ({ ...prev, [plan._id]: value }));
    };

    const cancelEdit = (planId) => {
        setEditingPlans((prev) => {
            const updated = { ...prev };
            delete updated[planId];
            return updated;
        });
    };


    const saveEdit = async (planId) => {
        const planState = editingPlans[planId];
        if (!planState) return;

        setLoading(true);
        try {
            let payload = {};
            const { editPrice, editValue } = planState;

            if (editPrice.planName === "Basic") {
                payload = isYearlyb
                    ? { yearlyPrice: editPrice.value }
                    : { monthlyPrice: editPrice.value };
            } else if (editPrice.planName === "Pro") {
                payload = isYearlyp
                    ? { yearlyPrice: editPrice.value }
                    : { monthlyPrice: editPrice.value };
            } else if (editPrice.planName === "Enterprise") {
                payload = isYearlye
                    ? { yearlyPrice: editPrice.value }
                    : { monthlyPrice: editPrice.value };
            }

            payload = { ...payload, ...editValue };

            await axios.put(
                `${baseUrl}/admin/updateSubscriptionPlanPrice/${editPrice.planId}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );

            await subPlan();
            cancelEdit(planId);
        } catch (err) {
            // console.error("Failed to update plan:", err);
            Swal.fire({
                title: "Failed to update plan:",
                icon: "warning",
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: false,
            });
        } finally {
            setLoading(false);
        }
    };






    const getPlanSection = (planName) => {
        const plan = plans.plans?.find((p) => p.name === planName);
        if (!plan) return null;

        const editPrice = editingPlans[plan._id]?.editPrice;

        return (
            <div
                className={`border rounded-2xl p-6 w-full h-[650px] shadow-md relative transition-transform hover:scale-105 flex flex-col ${plans.mostPopularPlan === planName
                    ? "border-blue-500"
                    : "border-gray-300"
                    }`}
            >
                {plans.mostPopularPlan === planName && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#2F3349] to-[#717AAF] text-white text-xs px-3 py-1 rounded-full">
                        Most Popular
                    </div>
                )}

                {/* Yearly Price */}
                {/* Toggle switch button */}

                {/* Plan Name */}

                {/* Price */}

                {/* Features */}
                {planName === "Basic" ? (
                    <>
                        {!editingPlans[plan._id] ? (
                            <p className="text-2xl font-bold mb-4">
                                ${isYearlyb ? plan.yearlyPrice : plan.monthlyPrice}
                                <span className="text-sm font-normal">/{isYearlyb ? "year" : "month"}</span>
                            </p>
                        ) : (
                            <input
                                type="number"
                                value={editPrice?.value || ""}
                                onChange={(e) =>
                                    setEditingPlans((prev) => ({
                                        ...prev,
                                        [plan._id]: {
                                            ...prev[plan._id],
                                            editPrice: { ...prev[plan._id].editPrice, value: e.target.value },
                                        },
                                    }))
                                }
                                className="text-2xl font-bold mb-4 border rounded-lg px-2 py-1 w-full"
                            />
                        )}
                        <div className="flex items-center mb-4 relative bg-gray-200 rounded-full w-[160px] p-1 ml-[50%] -translate-x-1/2">
                            {/* Sliding background knob */}
                            <div
                                className={`absolute top-1 left-1 w-[75px] h-[28px] rounded-full bg-[#6C63FF] transition-transform duration-300 ${isYearlyb ? "translate-x-[78px]" : "translate-x-0"
                                    }`}
                            ></div>

                            {/* Monthly button */}
                            <span
                                className={`relative z-10 flex-1 text-center py-1 text-sm font-medium cursor-pointer transition-colors ${!isYearlyb ? "text-white" : "text-[#6C63FF]"
                                    }`}
                                onClick={() => setIsYearlyb(false)}
                                style={{ userSelect: "none" }}
                            >
                                Monthly
                            </span>

                            {/* Yearly button */}
                            <span
                                className={`relative z-10 flex-1 text-center py-1 text-sm font-medium cursor-pointer transition-colors ${isYearlyb ? "text-white" : "text-[#6C63FF]"
                                    }`}
                                onClick={() => setIsYearlyb(true)}
                                style={{ userSelect: "none" }}
                            >
                                Yearly
                            </span>
                        </div>
                        <h2 className="text-lg font-semibold mb-2">{plan.name}</h2>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                {editingPlans[plan._id] ? (
                                    <>
                                        Up to
                                        <input
                                            type="number"
                                            value={editingPlans[plan._id].editValue.maxRFPProposalGenerations}
                                            onChange={(e) =>
                                                setEditingPlans((prev) => ({
                                                    ...prev,
                                                    [plan._id]: {
                                                        ...prev[plan._id],
                                                        editValue: {
                                                            ...prev[plan._id].editValue,
                                                            maxRFPProposalGenerations: e.target.value,
                                                        },
                                                    },
                                                }))
                                            }
                                            className="w-1/2 border rounded-lg px-2 py-1"
                                        />
                                        AI - RFP Proposal Generations
                                    </>
                                ) : (
                                    <span>
                                        Up to{" "}
                                        {editingPlans[plan._id]?.editValue?.maxRFPProposalGenerations ??
                                            plan.maxRFPProposalGenerations}{" "}
                                        AI - RFP Proposal Generations
                                    </span>
                                )}


                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                {editingPlans[plan._id] ? (
                                    <>
                                        Up to
                                        <input
                                            type="number"
                                            value={editingPlans[plan._id].editValue.maxGrantProposalGenerations}
                                            onChange={(e) =>
                                                setEditingPlans((prev) => ({
                                                    ...prev,
                                                    [plan._id]: {
                                                        ...prev[plan._id],
                                                        editValue: {
                                                            ...prev[plan._id].editValue,
                                                            maxGrantProposalGenerations: e.target.value,
                                                        },
                                                    },
                                                }))
                                            }
                                            className="w-1/2 border rounded-lg px-2 py-1"
                                        />
                                        AI - Grant Proposal Generations
                                    </>
                                ) : (
                                    <span>
                                        Up to{" "}
                                        {editingPlans[plan._id]?.editValue?.maxGrantProposalGenerations ??
                                            plan.maxGrantProposalGenerations}{" "}
                                        AI - Grant Proposal Generations
                                    </span>
                                )}

                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                AI-Driven RFP Discovery
                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                AI-Driven Grant Discovery
                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                AI-Proposal Recommendation
                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                Basic Compliance Check
                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                Proposal Tracking Dashboard
                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                {editingPlans[plan._id] ? (
                                    <>
                                        Up to
                                        <input
                                            type="number"
                                            value={editingPlans[plan._id].editValue.maxEditors}
                                            onChange={(e) =>
                                                setEditingPlans((prev) => ({
                                                    ...prev,
                                                    [plan._id]: {
                                                        ...prev[plan._id],
                                                        editValue: {
                                                            ...prev[plan._id].editValue,
                                                            maxEditors: e.target.value,
                                                        },
                                                    },
                                                }))
                                            }
                                            className="w-1/2 border rounded-lg px-2 py-1"
                                        />
                                        Editors,
                                        <input
                                            type="number"
                                            value={editingPlans[plan._id].editValue.maxViewers}
                                            onChange={(e) =>
                                                setEditingPlans((prev) => ({
                                                    ...prev,
                                                    [plan._id]: {
                                                        ...prev[plan._id],
                                                        editValue: {
                                                            ...prev[plan._id].editValue,
                                                            maxViewers: e.target.value,
                                                        },
                                                    },
                                                }))
                                            }
                                            className="w-1/2 border rounded-lg px-2 py-1"
                                        />
                                        Viewers, Unlimited Members
                                    </>
                                ) : (
                                    <>
                                        {editingPlans[plan._id]?.editValue?.maxEditors
                                            ? `${editingPlans[plan._id].editValue.maxEditors} Editors, ${editingPlans[plan._id].editValue.maxViewers} Viewers, Unlimited Members`
                                            : `${plan.maxEditors} Editors, ${plan.maxViewers} Viewers, Unlimited Members`}
                                    </>
                                )}


                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                Team Collaboration
                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                Support
                            </li>
                        </ul>
                    </>
                ) : planName === "Pro" ? (
                    <>
                        {!editingPlans[plan._id] ? (
                            <p className="text-2xl font-bold mb-4">
                                ${isYearlyp ? plan.yearlyPrice : plan.monthlyPrice}
                                <span className="text-sm font-normal">/{isYearlyp ? "year" : "month"}</span>
                            </p>
                        ) : (
                            <input
                                type="number"
                                value={editPrice?.value || ""}
                                onChange={(e) =>
                                    setEditingPlans((prev) => ({
                                        ...prev,
                                        [plan._id]: {
                                            ...prev[plan._id],
                                            editPrice: { ...prev[plan._id].editPrice, value: e.target.value },
                                        },
                                    }))
                                }
                                className="text-2xl font-bold mb-4 border rounded-lg px-2 py-1 w-full"
                            />
                        )}
                        <div className="flex items-center mb-4 relative bg-gray-200 rounded-full w-[160px] p-1 ml-[50%] -translate-x-1/2">
                            {/* Sliding background knob */}
                            <div
                                className={`absolute top-1 left-1 w-[75px] h-[28px] rounded-full bg-[#6C63FF] transition-transform duration-300 ${isYearlyp ? "translate-x-[78px]" : "translate-x-0"
                                    }`}
                            ></div>

                            {/* Monthly button */}
                            <span
                                className={`relative z-10 flex-1 text-center py-1 text-sm font-medium cursor-pointer transition-colors ${!isYearlyp ? "text-white" : "text-[#6C63FF]"
                                    }`}
                                onClick={() => setIsYearlyp(false)}
                                style={{ userSelect: "none" }}
                            >
                                Monthly
                            </span>

                            {/* Yearly button */}
                            <span
                                className={`relative z-10 flex-1 text-center py-1 text-sm font-medium cursor-pointer transition-colors ${isYearlyp ? "text-white" : "text-[#6C63FF]"
                                    }`}
                                onClick={() => setIsYearlyp(true)}
                                style={{ userSelect: "none" }}
                            >
                                Yearly
                            </span>
                        </div>
                        <h2 className="text-lg font-semibold mb-2">{plan.name}</h2>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center text-[#6C63FF] text-lg font-semibold">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                Includes All Basic Features
                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                {editingPlans[plan._id] ? (
                                    <span className="flex items-center gap-2">
                                        Up to
                                        <input
                                            type="number"
                                            value={editingPlans[plan._id].editValue.maxRFPProposalGenerations}
                                            onChange={(e) =>
                                                setEditingPlans((prev) => ({
                                                    ...prev,
                                                    [plan._id]: {
                                                        ...prev[plan._id],
                                                        editValue: {
                                                            ...prev[plan._id].editValue,
                                                            maxRFPProposalGenerations: e.target.value,
                                                        },
                                                    },
                                                }))
                                            }
                                            className="w-20 border rounded-lg px-2 py-1 text-center"
                                        />
                                        AI - RFP Proposal Generations
                                    </span>
                                ) : (
                                    <span>
                                        Up to{" "}
                                        {editingPlans[plan._id]?.editValue?.maxRFPProposalGenerations
                                            ? editingPlans[plan._id].editValue.maxRFPProposalGenerations
                                            : plan.maxRFPProposalGenerations}{" "}
                                        AI - RFP Proposal Generations
                                    </span>
                                )}

                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                {editingPlans[plan._id] ? (
                                    <>
                                        Up to
                                        <input type="number" value={editingPlans[plan._id].editValue.maxGrantProposalGenerations} onChange={(e) => setEditingPlans((prev) => ({ ...prev, [plan._id]: { ...prev[plan._id], editValue: { ...prev[plan._id].editValue, maxGrantProposalGenerations: e.target.value } } }))} className="w-1/2 border rounded-lg px-2 py-1" />
                                        AI - Grant Proposal Generations
                                    </>
                                ) : (
                                    <span>
                                        Up to {editingPlans[plan._id]?.editValue?.maxGrantProposalGenerations ? editingPlans[plan._id].editValue.maxGrantProposalGenerations : plan.maxGrantProposalGenerations} AI - Grant Proposal Generations
                                    </span>
                                )}

                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                {editingPlans[plan._id] ? (
                                    <>
                                        Up to
                                        <input type="number" value={editingPlans[plan._id].editValue.maxEditors} onChange={(e) => setEditingPlans((prev) => ({ ...prev, [plan._id]: { ...prev[plan._id], editValue: { ...prev[plan._id].editValue, maxEditors: e.target.value } } }))} className="w-1/2 border rounded-lg px-2 py-1" />
                                        Editors,
                                        <input type="number" value={editingPlans[plan._id].editValue.maxViewers} onChange={(e) => setEditingPlans((prev) => ({ ...prev, [plan._id]: { ...prev[plan._id], editValue: { ...prev[plan._id].editValue, maxViewers: e.target.value } } }))} className="w-1/2 border rounded-lg px-2 py-1" />
                                        Viewers, Unlimited Members
                                    </>
                                ) : (
                                    <>
                                        {editingPlans[plan._id]?.editValue?.maxEditors
                                            ? `${editingPlans[plan._id].editValue.maxEditors} Editors, ${editingPlans[plan._id].editValue.maxViewers} Viewers, Unlimited Members`
                                            : `${plan.maxEditors} Editors, ${plan.maxViewers} Viewers, Unlimited Members`}
                                    </>
                                )}

                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                Advance Compliance Check
                            </li>
                        </ul>
                    </>
                ) : planName === "Enterprise" ? (
                    <>

                        {/*IsContact Toggle Button */}
                        <div className="flex justify-end">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-700">Contact Us</span>
                                <button
                                    onClick={updateContacts}
                                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isContact ? "bg-green-500" : "bg-gray-300"
                                        }`}
                                >
                                    <div
                                        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isContact ? "translate-x-6" : "translate-x-0"
                                            }`}
                                    ></div>
                                </button>
                            </div>
                        </div>


                        {!editingPlans[plan._id] ? (
                            <p className="text-2xl font-bold mb-4">
                                ${isYearlye ? plan.yearlyPrice : plan.monthlyPrice}
                                <span className="text-sm font-normal">/{isYearlye ? "year" : "month"}</span>
                            </p>
                        ) : (
                            <input
                                type="number"
                                value={editPrice?.value || ""}
                                onChange={(e) =>
                                    setEditingPlans((prev) => ({
                                        ...prev,
                                        [plan._id]: {
                                            ...prev[plan._id],
                                            editPrice: { ...prev[plan._id].editPrice, value: e.target.value },
                                        },
                                    }))
                                }
                                className="text-2xl font-bold mb-4 border rounded-lg px-2 py-1 w-full"
                            />
                        )}


                        <div className="flex items-center mb-4 relative bg-gray-200 rounded-full w-[160px] p-1 ml-[50%] -translate-x-1/2">
                            {/* Sliding background knob */}
                            <div
                                className={`absolute top-1 left-1 w-[75px] h-[28px] rounded-full bg-[#6C63FF] transition-transform duration-300 ${isYearlye ? "translate-x-[78px]" : "translate-x-0"
                                    }`}
                            ></div>

                            {/* Monthly button */}
                            <span
                                className={`relative z-10 flex-1 text-center py-1 text-sm font-medium cursor-pointer transition-colors ${!isYearlye ? "text-white" : "text-[#6C63FF]"
                                    }`}
                                onClick={() => setIsYearlye(false)}
                                style={{ userSelect: "none" }}
                            >
                                Monthly
                            </span>

                            {/* Yearly button */}
                            <span
                                className={`relative z-10 flex-1 text-center py-1 text-sm font-medium cursor-pointer transition-colors ${isYearlye ? "text-white" : "text-[#6C63FF]"
                                    }`}
                                onClick={() => setIsYearlye(true)}
                                style={{ userSelect: "none" }}
                            >
                                Yearly
                            </span>
                        </div>


                        <h2 className="text-lg font-semibold mb-2">{plan.name}</h2>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center text-[#6C63FF] text-lg font-semibold">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                Includes All Basic & Pro Features
                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                {editingPlans[plan._id] ? (
                                    <>
                                        Up to

                                        <input type="number" value={editingPlans[plan._id].editValue.maxRFPProposalGenerations} onChange={(e) => setEditingPlans((prev) => ({ ...prev, [plan._id]: { ...prev[plan._id], editValue: { ...prev[plan._id].editValue, maxRFPProposalGenerations: e.target.value } } }))} className="w-1/2 border rounded-lg px-2 py-1" />
                                        AI - RFP Proposal Generations
                                    </>
                                ) : (
                                    <span>
                                        {isContact
                                            ? "Custom AI-RFP Proposal Generations"
                                            : `Up to ${editingPlans[plan._id]?.editValue?.maxRFPProposalGenerations
                                                ? editingPlans[plan._id].editValue.maxRFPProposalGenerations
                                                : plan.maxRFPProposalGenerations
                                            } AI - RFP Proposal Generations`
                                        }
                                    </span>
                                )}

                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                {editingPlans[plan._id] ? (
                                    <>
                                        Up to
                                        <input
                                            type="number"
                                            value={editingPlans[plan._id].editValue.maxGrantProposalGenerations}
                                            onChange={(e) =>
                                                setEditingPlans((prev) => ({
                                                    ...prev,
                                                    [plan._id]: {
                                                        ...prev[plan._id],
                                                        editValue: {
                                                            ...prev[plan._id].editValue,
                                                            maxGrantProposalGenerations: e.target.value,
                                                        },
                                                    },
                                                }))
                                            }
                                            className="w-1/2 border rounded-lg px-2 py-1"
                                        />
                                        AI - Grant Proposal Generations
                                    </>
                                ) : (
                                    <span>

                                        {isContact
                                            ? "Custom AI-Grant Proposal Generations"
                                            : `Up to ${editingPlans[plan._id]?.editValue?.maxGrantProposalGenerations
                                                ? editingPlans[plan._id].editValue.maxGrantProposalGenerations
                                                : plan.maxGrantProposalGenerations
                                            } AI - Grant Proposal Generations`
                                        }

                                    </span>
                                )}

                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                {isContact
                                    ? "Custom Editors, Custom Viewers, Custom Members"
                                    : "Unlimited Editors, Unlimited Viewers, Unlimited Members"
                                }


                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-green-500 p-1">
                                    <FaRegCheckCircle className="w-4 h-4" />
                                </span>
                                Dedicated Support
                            </li>


                        </ul>
                    </>
                ) : null}

                {
                    !isContact && (
                        !editingPlans[plan._id] ? (
                            <button
                                className="w-full py-2 rounded-lg bg-gradient-to-b from-[#6C63FF] to-[#3F73BD] text-white font-medium shadow mt-auto"
                                onClick={() => startEdit(plan)}
                            >
                                Edit
                            </button>
                        ) : (
                            <div className="flex gap-2 mt-auto">
                                <button
                                    className="w-1/2 py-2 rounded-lg bg-gray-300 text-black font-medium shadow"
                                    onClick={() => cancelEdit(plan._id)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="w-1/2 py-2 rounded-lg bg-gradient-to-b from-[#6C63FF] to-[#3F73BD] text-white font-medium shadow"
                                    onClick={() => saveEdit(plan._id)}
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save"}
                                </button>
                            </div>
                        )
                    )
                }
            </div>
        );



    };
    const updateContacts = async () => {
        const plan = plans.plans?.find((p) => p.name === "Enterprise");
        try {
            await axios.put(
                `${baseUrl}/admin/updateSubscriptionPlanIsContact/${plan._id}`,
                {
                    isContact: !isContact,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            setIsContact(!isContact);
        } catch (error) {
            // console.error(error);
            Swal.fire({
                title: "Failed to update contacts: " + (error.response?.data?.message || error.message),
                icon: "error",
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: false,
            });
        } finally {
            setLoading(false);
        }
    };




    const renderPlanManagement = () => (
        <div className="h-full">

            <div className="flex flex-row gap-4">
                {/* Card-1 - Total Revenue */}

                <div className="h-[139px] rounded-2xl bg-gradient-to-b from-[#413B99] to-[#6C63FF] p-6 flex justify-between shadow-lg w-full">
                    {/* Left Section */}
                    <div>
                        <h2 className="text-white text-2xl font-bold">Active Users</h2>
                        <p className="text-white text-4xl font-bold mt-2">
                            {planManagementStats["Active Users"]}
                        </p>

                    </div>

                    {/* Right Illustration */}
                    <div className="flex items-center">
                        <img src={user} alt="Users" className="mt-[20px] w-[180px] h-[120px]" />
                    </div>
                </div>

                {/* Card-2 - Total Users */}


                <div className="h-[139px] rounded-2xl bg-gradient-to-b from-[#413B99] to-[#6C63FF] p-6 flex justify-between shadow-lg w-full">
                    {/* Left Section */}
                    <div>

                        <h2 className="text-white text-2xl font-bold">Revenue This Month</h2>
                        <p className="text-white text-4xl font-bold mt-2">
                            {planManagementStats["Revenue This Month"]}
                        </p>

                    </div>

                    {/* Right Illustration */}
                    <div className="flex items-center">
                        <img src={revenue} alt="Users" className="mt-[20px] w-[180px] h-[120px]" />
                    </div>
                </div>

            </div>
            {/* Card-3 - Total Users */}

            <div className="flex flex-col lg:flex-row w-full gap-6 justify-center items-start mt-10">
                {getPlanSection("Basic")}
                {getPlanSection("Pro")}
                {getPlanSection("Enterprise")}
            </div>

            {
                isContact && (
                    <ShowCustomDetails />
                )
            }

        </div>
    );

    const [contactRequestSearchTerm, setContactRequestSearchTerm] = useState('');
    const [contactRequestData, setContactRequestData] = useState([]);
    const [filteredContactRequest, setFilteredContactRequest] = useState([]);
    const [currentPageContact, setCurrentPageContact] = useState(1);
    const [contactDetailsModalOpen, setContactDetailsModalOpen] = useState(false);
    const [selectedContactRequest, setSelectedContactRequest] = useState(null);

    const contactRequestDatafetch = async () => {
        try {
            const response = await axios.get(`${baseUrl}/admin/getContactData`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setContactRequestData(response.data || []);
            setFilteredContactRequest(response.data || []);
        } catch (e) {
            // ignore
        }
    };

    useEffect(() => {
        contactRequestDatafetch();
    }, []);

    useEffect(() => {
        const term = (contactRequestSearchTerm || '').toLowerCase();
        const base = contactRequestData || [];
        const filtered = term
            ? base.filter(r =>
                (r.name || '').toLowerCase().includes(term) ||
                (r.company || '').toLowerCase().includes(term) ||
                (r.email || '').toLowerCase().includes(term) ||
                (r.status || '').toLowerCase().includes(term)
            )
            : base;
        setFilteredContactRequest(filtered);
    }, [contactRequestSearchTerm, contactRequestData]);

    const renderContactRequest = () => (
        <div className='h-full'>
            {/* Search Bar */}
            <div className="mb-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="relative">
                            <MdOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, company, email, or status"
                                value={contactRequestSearchTerm}
                                onChange={(e) => {
                                    setContactRequestSearchTerm(e.target.value);
                                    setCurrentPageContact(1);
                                    closeAllInvoiceRows();
                                }}
                                className="pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent w-[530px] text-[#374151] placeholder-[#9CA3AF] bg-white"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Requests Table */}
            <div className="bg-white border border-[#E5E7EB] mb-6 overflow-x-auto rounded-2xl">
                <table className="w-full rounded-2xl">
                    <thead className="bg-[#F8FAFC] border-b border-[#0000001A]">
                        <tr>
                            <th className="p-4 text-left text-[16px] font-medium text-[#4B5563]">Name</th>
                            <th className="p-4 text-left text-[16px] font-medium text-[#4B5563]">Company</th>
                            <th className="p-4 text-left text-[16px] font-medium text-[#4B5563]">Email</th>
                            <th className="p-4 text-left text-[16px] font-medium text-[#4B5563]">Description</th>
                            <th className="p-4 text-left text-[16px] font-medium text-[#4B5563]">Status</th>
                            <th className="p-4 text-left text-[16px] font-medium text-[#4B5563]">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            const statusWeight = (s) => {
                                const t = (s || '').toLowerCase();
                                if (t === 'open') return 0;
                                if (t === 'connected') return 2;
                                return 1;
                            };
                            const sorted = [...(filteredContactRequest || [])].sort((a, b) => statusWeight(a?.status) - statusWeight(b?.status));
                            const paginated = paginateData(sorted, currentPageContact, rowsPerPage);
                            return paginated.length > 0 ? paginated.map((row, idx) => (
                                <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                                    <td className="p-4 text-[16px] text-[#4B5563]">{row.name || '—'}</td>
                                    <td className="p-4 text-[16px] text-[#4B5563]">{row.company || '—'}</td>
                                    <td className="p-4 text-[16px] text-[#6C63FF]">{row.email || '—'}</td>
                                    <td className="p-4 text-[16px] text-[#4B5563]"><div className="max-w-[240px] line-clamp-2 truncate">{row.description || '—'}</div></td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-[12px] font-semibold rounded-full ${getStatusColor((row.status || 'Pending'))}`}>
                                            {row.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-[16px] text-[#4B5563] whitespace-nowrap">
                                        <button
                                            className="text-[#2563EB] px-4 py-2 rounded-md"
                                            onClick={() => {
                                                const selected = (contactRequestData || []).find(r => r._id === row._id);
                                                setSelectedContactRequest(selected || row);
                                                setContactDetailsModalOpen(true);
                                            }}
                                        >
                                            <MdOutlineVisibility className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-500">No contact requests found</td>
                                </tr>
                            );
                        })()}
                    </tbody>
                </table>
                {filteredContactRequest.length > 0 && (
                    <PaginationComponent
                        currentPage={currentPageContact}
                        totalPages={getTotalPages(filteredContactRequest, rowsPerPage)}
                        onPageChange={(page) => { setCurrentPageContact(page); closeAllInvoiceRows(); }}
                        totalItems={filteredContactRequest.length}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(newRowsPerPage) => { setRowsPerPage(newRowsPerPage); setCurrentPageContact(1); closeAllInvoiceRows(); }}
                    />
                )}
            </div>

            {contactDetailsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" onClick={(e) => { if (e.target === e.currentTarget) setContactDetailsModalOpen(false); }}>
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">Contact Request</h3>
                            <button onClick={() => setContactDetailsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <MdOutlineClose className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="text-sm text-gray-700 space-y-1 mb-4">
                            <p><strong>Name:</strong> {selectedContactRequest?.name || '—'}</p>
                            <p><strong>Company:</strong> {selectedContactRequest?.company || '—'}</p>
                            <p><strong>Email:</strong> {selectedContactRequest?.email || '—'}</p>
                            <p><strong>Status:</strong> {selectedContactRequest?.status || 'Pending'}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                onClick={async () => {
                                    try {
                                        const id = selectedContactRequest?._id;
                                        await axios.delete(`${baseUrl}/admin/deleteContactData/${id}`, {
                                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                        });
                                        setContactRequestData(prev => (prev || []).filter(r => r._id !== id));
                                        setFilteredContactRequest(prev => (prev || []).filter(r => r._id !== id));
                                        setContactDetailsModalOpen(false);
                                        toast.success('Contact request deleted');
                                    } catch (e) {
                                        toast.error('Failed to delete');
                                    }
                                }}
                            >
                                Delete
                            </button>
                            {selectedContactRequest?.status !== 'Connected' && (
                                <button
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    onClick={async () => {
                                        try {
                                            const id = selectedContactRequest?._id;
                                            await axios.put(`${baseUrl}/admin/updateContactData/${id}`, { status: 'Connected' }, {
                                                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                            });
                                            setContactRequestData(prev => (prev || []).map(r => r._id === id ? { ...r, status: 'Connected' } : r));
                                            setFilteredContactRequest(prev => (prev || []).map(r => r._id === id ? { ...r, status: 'Connected' } : r));
                                            setSelectedContactRequest(prev => prev ? { ...prev, status: 'Connected' } : prev);
                                            setContactDetailsModalOpen(false);
                                            toast.success('Marked as Connected');
                                        } catch (e) {
                                            toast.error('Failed to update');
                                        }
                                    }}
                                >
                                    Mark as Connected
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );


    const renderSupport = () => (
        <div className='h-full'>
            {/* Support Inner Tabs */}
            <div className="mb-6">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => { setSupportTab('active'); setCompletedTickets(false) }}
                        className={`py-2 px-1 border-b-2 font-medium text-[16px] transition-colors ${supportTab === 'active'
                            ? 'border-[#6C63FF] text-[#6C63FF]'
                            : 'border-transparent text-[#4B5563]'
                            }`}
                    >
                        Active Tickets
                    </button>
                    <button
                        onClick={() => { setSupportTab('Enterprise'); setCompletedTickets(false) }}
                        className={`py-2 px-1 border-b-2 font-medium text-[16px] transition-colors ${supportTab === 'Enterprise'
                            ? 'border-[#6C63FF] text-[#6C63FF]'
                            : 'border-transparent text-[#4B5563]'
                            }`}
                    >
                        Enterprise Tickets
                    </button>
                    <button
                        onClick={() => { setSupportTab('resolved'); setCompletedTickets(true) }}
                        className={`py-2 px-1 border-b-2 font-medium text-[16px] transition-colors ${supportTab === 'resolved'
                            ? 'border-[#6C63FF] text-[#6C63FF]'
                            : 'border-transparent text-[#4B5563]'
                            }`}
                    >
                        Resolved Tickets
                    </button>
                </nav>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* {console.log("kunal"+supportTicketsStats)} */}
                {Object.keys(supportTicketsStats).map((key, index) => (
                    <div
                        key={index}
                        className="h-[139px] rounded-2xl bg-gradient-to-b from-[#413B99] to-[#6C63FF] flex justify-between shadow-lg w-full"
                    >
                        {/* Left Section */}
                        <div>
                            <h2 className="pl-6 pt-6 text-white text-lg w-full">{key}</h2>
                            <p className="pl-6 text-white text-4xl font-bold mt-2">
                                {supportTicketsStats[key]}
                            </p>
                        </div>

                        {/* Right Section with Dynamic Icons */}
                        <div className="flex items-center overflow-hidden relative">
                            {key === "Billing & Payments" && (
                                <img src={revenue} className="mt-[20px] ml-[50px] w-[180px] h-[120px]" />
                            )}
                            {key === "Proposal Issues" && (
                                <img src={proposalimg} className="mt-[20px] ml-[50px] w-[180px] h-[120px]" />
                            )}
                            {key === "Account & Access" && (
                                <img src={user} className="mt-[20px] ml-[50px] w-[180px] h-[120px]" />
                            )}
                            {key === "Technical Errors" && (
                                <img src={error} className="mt-[20px] ml-[50px] w-[180px] h-[120px]" />
                            )}
                            {key === "Feature Requests" && (
                                <img src={request} className="mt-[20px] ml-[50px] w-[180px] h-[120px]" />
                            )}
                            {![
                                "Billing & Payments",
                                "Proposal Issues",
                                "Account & Access",
                                "Technical Errors",
                                "Feature Requests",
                            ].includes(key) && (
                                    <img src={other} className="mt-[20px] ml-[50px] w-[180px] h-[120px]" />
                                )}
                        </div>
                    </div>
                ))}
            </div>


            {/* Search and Filter Bar */}
            <div className="mb-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="relative">
                            <MdOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={supportSearchTerm}
                                onChange={(e) => {
                                    setSupportSearchTerm(e.target.value);
                                    closeAllInvoiceRows();
                                }}
                                className="pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent w-[530px] text-[#374151] placeholder-[#9CA3AF] bg-white"
                            />
                        </div>
                        <div className="relative">
                            <button className="bg-white flex items-center justify-center space-x-2 px-4 py-2 border border-[#E5E7EB] rounded-lg transition-colors w-full sm:w-auto"
                                onClick={() => setSupportFilterModal(!supportFilterModal)}
                            >
                                <MdOutlineFilterList className="w-5 h-5" />
                                <span>Filter</span>
                            </button>

                            {supportFilterModal && (
                                <div className="absolute top-10 left-0 w-64 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2 z-1000 border border-[#E5E7EB]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[14px] font-medium text-[#111827]">Filters</span>
                                        <button
                                            className="text-[12px] text-[#2563EB] hover:underline"
                                            onClick={() => { handleSupportStatusChangeFilter('all'); handleSupportPriorityChangeFilter('all'); handleSupportTypeChangeFilter('all'); }}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    {/* All */}
                                    <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                        <input type="radio" name="supportAll" id="support_all" value="all"
                                            checked={supportStatusFilter === 'all' && supportPriorityFilter === 'all' && supportTypeFilter === 'all'}
                                            onChange={() => { handleSupportStatusChangeFilter('all'); handleSupportPriorityChangeFilter('all'); handleSupportTypeChangeFilter('all'); }}
                                            className="mt-1"
                                        />
                                        <label htmlFor="support_all" className="cursor-pointer leading-none">All</label>
                                    </div>
                                    {/* Status */}
                                    <span className="text-[16px] font-medium text-[#4B5563]">Status :</span>
                                    <div className="ml-4">
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="supportStatusFilter" id="pending" value="Pending"
                                                checked={supportStatusFilter === 'Pending'}
                                                onClick={(e) => { if (supportStatusFilter === e.target.value) handleSupportStatusChangeFilter('all'); }}
                                                onChange={(e) => handleSupportStatusChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="pending" className="cursor-pointer leading-none">Pending</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="supportStatusFilter" id="inProgress" value="In Progress"
                                                checked={supportStatusFilter === 'In Progress'}
                                                onClick={(e) => { if (supportStatusFilter === e.target.value) handleSupportStatusChangeFilter('all'); }}
                                                onChange={(e) => handleSupportStatusChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="inProgress" className="cursor-pointer leading-none">In Progress</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="supportStatusFilter" id="reopened" value="Re-Opened"
                                                checked={supportStatusFilter === 'Re-Opened'}
                                                onClick={(e) => { if (supportStatusFilter === e.target.value) handleSupportStatusChangeFilter('all'); }}
                                                onChange={(e) => handleSupportStatusChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="reopened" className="cursor-pointer leading-none">Re-Opened</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="supportStatusFilter" id="completed" value="Completed"
                                                checked={supportStatusFilter === 'Completed'}
                                                onClick={(e) => { if (supportStatusFilter === e.target.value) handleSupportStatusChangeFilter('all'); }}
                                                onChange={(e) => handleSupportStatusChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="completed" className="cursor-pointer leading-none">Completed</label>
                                        </div>
                                    </div>
                                    {/* Priority */}
                                    <span className="text-[16px] font-medium text-[#4B5563]">Priority :</span>
                                    <div className="ml-4">
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="supportPriorityFilter" id="low" value="low"
                                                checked={supportPriorityFilter === 'low'}
                                                onClick={(e) => { if (supportPriorityFilter === e.target.value) handleSupportPriorityChangeFilter('all'); }}
                                                onChange={(e) => handleSupportPriorityChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="low" className="cursor-pointer leading-none">Low</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="supportPriorityFilter" id="medium" value="medium"
                                                checked={supportPriorityFilter === 'medium'}
                                                onClick={(e) => { if (supportPriorityFilter === e.target.value) handleSupportPriorityChangeFilter('all'); }}
                                                onChange={(e) => handleSupportPriorityChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="medium" className="cursor-pointer leading-none">Medium</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="supportPriorityFilter" id="high" value="high"
                                                checked={supportPriorityFilter === 'high'}
                                                onClick={(e) => { if (supportPriorityFilter === e.target.value) handleSupportPriorityChangeFilter('all'); }}
                                                onChange={(e) => handleSupportPriorityChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="high" className="cursor-pointer leading-none">High</label>
                                        </div>
                                    </div>
                                    {/* Category */}
                                    <span className="text-[16px] font-medium text-[#4B5563]">Category :</span>
                                    <div className="ml-4">
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="supportTypeFilter" id="billingPayments" value="billing & payments"
                                                checked={supportTypeFilter === 'billing & payments'}
                                                onClick={(e) => { if (supportTypeFilter === e.target.value) handleSupportTypeChangeFilter('all'); }}
                                                onChange={(e) => handleSupportTypeChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="billingPayments" className="cursor-pointer leading-none">Billing & Payments</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="supportTypeFilter" id="technicalErrors" value="technical errors"
                                                checked={supportTypeFilter === 'technical errors'}
                                                onClick={(e) => { if (supportTypeFilter === e.target.value) handleSupportTypeChangeFilter('all'); }}
                                                onChange={(e) => handleSupportTypeChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="technicalErrors" className="cursor-pointer leading-none">Technical Errors</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="supportTypeFilter" id="featureRequests" value="feature requests"
                                                checked={supportTypeFilter === 'feature requests'}
                                                onClick={(e) => { if (supportTypeFilter === e.target.value) handleSupportTypeChangeFilter('all'); }}
                                                onChange={(e) => handleSupportTypeChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="featureRequests" className="cursor-pointer leading-none">Feature Requests</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="supportTypeFilter" id="accountAccess" value="account & access"
                                                checked={supportTypeFilter === 'account & access'}
                                                onClick={(e) => { if (supportTypeFilter === e.target.value) handleSupportTypeChangeFilter('all'); }}
                                                onChange={(e) => handleSupportTypeChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="accountAccess" className="cursor-pointer leading-none">Account & Access</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="supportTypeFilter" id="proposalIssues" value="proposal issues"
                                                checked={supportTypeFilter === 'proposal issues'}
                                                onClick={(e) => { if (supportTypeFilter === e.target.value) handleSupportTypeChangeFilter('all'); }}
                                                onChange={(e) => handleSupportTypeChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="proposalIssues" className="cursor-pointer leading-none">Proposal Issues</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="supportTypeFilter" id="others" value="others"
                                                checked={supportTypeFilter === 'others'}
                                                onClick={(e) => { if (supportTypeFilter === e.target.value) handleSupportTypeChangeFilter('all'); }}
                                                onChange={(e) => handleSupportTypeChangeFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="others" className="cursor-pointer leading-none">Others</label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {supportTab === 'Enterprise' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] mb-6 overflow-x-auto">
                    <table className="w-full rounded-2xl">
                        <thead className="bg-[#F8FAFC] border-b border-[#0000001A]">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider w-1/6">
                                    Category
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider w-1/6">
                                    Sub Category
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider w-1/3">
                                    Description
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider w-1/6">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider w-1/6">
                                    Priority
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider w-1/6">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider w-1/12">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {(() => {
                                const paginatedEnterprise = paginateData(filteredEnterpriseSupport, currentPageEnterpriseSupport, rowsPerPage);
                                return paginatedEnterprise.length > 0 ? paginatedEnterprise.map((ticket, index) => (
                                    <React.Fragment key={index}>
                                        <tr>
                                            <td className="p-4 whitespace-nowrap text-[16px] font-medium text-[#4B5563]">
                                                {ticket.category}
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-[16px] text-[#4B5563]">
                                                {ticket.subCategory}
                                            </td>
                                            <td className="p-4 text-[16px] text-[#4B5563]">
                                                <div className="max-w-[200px] line-clamp-2 truncate text-ellipsis">
                                                    <span className="text-ellipsis overflow-hidden">{ticket.description}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-[#6C63FF] whitespace-nowrap">
                                                {formatDate(ticket.createdAt)}
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-[12px] font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-[12px] font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-[16px] font-medium">
                                                <button
                                                    className="p-2 rounded-lg transition-colors flex items-center justify-center hover:bg-blue-50"
                                                    onClick={() => openSupportModal(ticket)}
                                                    title="View Details"
                                                >
                                                    <MdOutlineVisibility className="w-5 h-5 text-[#6C63FF]" />
                                                </button>
                                            </td>
                                        </tr>

                                    </React.Fragment>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-[16px] font-medium text-[#4B5563] text-center">
                                            No tickets found
                                        </td>
                                    </tr>
                                );
                            })()}
                        </tbody>
                    </table>
                    {filteredEnterpriseSupport.length > 0 && (
                        <PaginationComponent
                            currentPage={currentPageEnterpriseSupport}
                            totalPages={getTotalPages(filteredEnterpriseSupport, rowsPerPage)}
                            onPageChange={(page) => {
                                setCurrentPageEnterpriseSupport(page);
                                closeAllInvoiceRows();
                            }}
                            totalItems={filteredEnterpriseSupport.length}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(newRowsPerPage) => {
                                setRowsPerPage(newRowsPerPage);
                                setCurrentPageEnterpriseSupport(1);
                                closeAllInvoiceRows();
                            }}
                        />
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] mb-6 overflow-x-auto">
                    <table className="w-full rounded-2xl">
                        <thead className="bg-[#F8FAFC] border-b border-[#0000001A]">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider w-1/6">
                                    Category
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider w-1/6">
                                    Sub Category
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider w-1/3">
                                    Description
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider w-1/6">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider w-1/6">
                                    Priority
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider w-1/6">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider w-1/12">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {(() => {
                                const nonEnterprise = (filteredSupport || []).filter(t => (t.plan_name || '').toLowerCase() !== 'enterprise');
                                const paginatedSupport = paginateData(nonEnterprise, currentPageSupport, rowsPerPage);
                                return paginatedSupport.length > 0 ? paginatedSupport.map((ticket, index) => (
                                    <React.Fragment key={index}>
                                        <tr>
                                            <td className="p-4 whitespace-nowrap text-[16px] font-medium text-[#4B5563]">
                                                {ticket.category}
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-[16px] text-[#4B5563]">
                                                {ticket.subCategory}
                                            </td>
                                            <td className="p-4 text-[16px] text-[#4B5563]">
                                                <div className="max-w-[200px] line-clamp-2 truncate text-ellipsis">
                                                    <span className="text-ellipsis overflow-hidden">{ticket.description}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-[#6C63FF] whitespace-nowrap">
                                                {formatDate(ticket.createdAt)}
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-[12px] font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-[12px] font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-[16px] font-medium">
                                                <button
                                                    className="p-2 rounded-lg transition-colors flex items-center justify-center hover:bg-blue-50"
                                                    onClick={() => openSupportModal(ticket)}
                                                    title="View Details"
                                                >
                                                    <MdOutlineVisibility className="w-5 h-5 text-[#6C63FF]" />
                                                </button>
                                            </td>
                                        </tr>

                                    </React.Fragment>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-[16px] font-medium text-[#4B5563] text-center">
                                            No tickets found
                                        </td>
                                    </tr>
                                );
                            })()}
                        </tbody>
                    </table>
                    {(() => { const nonEnterprise = (filteredSupport || []).filter(t => (t.plan_name || '').toLowerCase() !== 'enterprise'); return nonEnterprise.length > 0; })() && (
                        <PaginationComponent
                            currentPage={currentPageSupport}
                            totalPages={getTotalPages((filteredSupport || []).filter(t => (t.plan_name || '').toLowerCase() !== 'enterprise'), rowsPerPage)}
                            onPageChange={(page) => {
                                setCurrentPageSupport(page);
                                closeAllInvoiceRows();
                            }}
                            totalItems={(filteredSupport || []).filter(t => (t.plan_name || '').toLowerCase() !== 'enterprise').length}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(newRowsPerPage) => {
                                setRowsPerPage(newRowsPerPage);
                                setCurrentPageSupport(1); // Reset to first page when changing rows per page
                                closeAllInvoiceRows();
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );

    function timeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const seconds = Math.floor((now - past) / 1000);

        const intervals = [
            { label: "year", seconds: 31536000 },
            { label: "month", seconds: 2592000 },
            { label: "day", seconds: 86400 },
            { label: "hour", seconds: 3600 },
            { label: "minute", seconds: 60 },
            { label: "second", seconds: 1 },
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count > 0) {
                return count === 1 ? `${count} ${interval.label} ago` : `${count} ${interval.label}s ago`;
            }
        }
        return "just now";
    }



    const renderNotifications = () => {
        const getNotificationIcon = (icon) => {
            switch (icon) {
                case 'User':
                    return <MdOutlineAccountCircle className="w-5 h-5" />;
                case 'Payment':
                    return <MdOutlineShoppingBag className="w-5 h-5" />;
                case 'Support':
                    return <MdOutlineHeadphones className="w-5 h-5" />;
                case 'Subscription':
                    return <MdOutlineMoney className="w-5 h-5" />;
                default:
                    return <MdOutlineAccountCircle className="w-5 h-5" />;
            }
        };

        return (
            <div className="h-full">
                {/* Filters and Search */}
                <div className="pb-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="relative w-[540px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdOutlineSearch className="h-4 w-4 text-[#4B5563]" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search"
                                value={notificationSearchTerm}
                                onChange={(e) => {
                                    setNotificationSearchTerm(e.target.value);
                                }}
                                className="block w-full pl-10 pr-3 py-2 border border-[#4B5563] rounded-lg leading-5 bg-white placeholder-[#4B5563] focus:outline-none focus:placeholder-[#4B5563] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 "
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="relative notification-filter-modal">
                                <button className="flex items-center justify-center space-x-2 px-3 py-2 text-sm text-[#111827] bg-white border border-[#4B5563] rounded-lg hover:bg-[#4B5563] hover:text-white w-full sm:w-auto"
                                    onClick={() => setNotificationTimeFilterModal(!notificationTimeFilterModal)}
                                >
                                    <MdOutlineFilterList className="w-4 h-4" />
                                    <span>{formatFilterDisplay(notificationTimeFilter, 'time') || 'All Time'}</span>
                                    <MdOutlineKeyboardArrowDown className="w-4 h-4" />
                                </button>

                                {notificationTimeFilterModal && (
                                    <div className="notification-filter-modal absolute top-10 left-0 w-64 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2 z-[9999] border border-[#E5E7EB] sm:left-0 left-1/2 transform -translate-x-1/2 transition-all duration-200 ease-in-out">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[14px] font-medium text-[#111827]">Time</span>
                                            <button
                                                className="text-[12px] text-[#2563EB] hover:underline"
                                                onClick={() => {
                                                    setNotificationTimeFilter('All Time');
                                                }}
                                            >
                                                Clear
                                            </button>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="notificationTimeFilter" id="allTime" value="All Time"
                                                checked={notificationTimeFilter === 'All Time'}
                                                onChange={(e) => {
                                                    setNotificationTimeFilter(e.target.value);
                                                }}
                                                className="mt-1"
                                            />
                                            <label htmlFor="allTime" className="cursor-pointer leading-none">All Time</label>
                                        </div>


                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2 text-[14px]">
                                            <input type="radio" name="notificationTimeFilter" id="today" value="today"
                                                checked={notificationTimeFilter === 'today'}
                                                onChange={(e) => {
                                                    setNotificationTimeFilter(e.target.value);
                                                }}
                                                className="mt-1"
                                            />
                                            <label htmlFor="today" className="cursor-pointer leading-none">Today</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="notificationTimeFilter" id="yesterday" value="yesterday"
                                                checked={notificationTimeFilter === 'yesterday'}
                                                onChange={(e) => {
                                                    setNotificationTimeFilter(e.target.value);
                                                }}
                                                className="mt-1"
                                            />
                                            <label htmlFor="yesterday" className="cursor-pointer leading-none">Yesterday</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="notificationTimeFilter" id="last7Days" value="last7Days"
                                                checked={notificationTimeFilter === 'last7Days'}
                                                onChange={(e) => {
                                                    setNotificationTimeFilter(e.target.value);
                                                }}
                                                className="mt-1"
                                            />
                                            <label htmlFor="last7Days" className="cursor-pointer leading-none">Last 7 Days</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="notificationTimeFilter" id="last14Days" value="last14Days"
                                                checked={notificationTimeFilter === 'last14Days'}
                                                onChange={(e) => {
                                                    setNotificationTimeFilter(e.target.value);
                                                }}
                                                className="mt-1"
                                            />
                                            <label htmlFor="last14Days" className="cursor-pointer leading-none">Last 14 Days</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="notificationTimeFilter" id="last30Days" value="last30Days"
                                                checked={notificationTimeFilter === 'last30Days'}
                                                onChange={(e) => {
                                                    setNotificationTimeFilter(e.target.value);
                                                }}
                                                className="mt-1"
                                            />
                                            <label htmlFor="last30Days" className="cursor-pointer leading-none">Last 30 Days</label>
                                        </div>


                                    </div>
                                )}
                            </div>
                            <div className="relative notification-filter-modal">
                                <button className="flex items-center justify-center space-x-2 px-3 py-2 text-sm text-[#111827] bg-white border border-[#4B5563] rounded-lg hover:bg-[#4B5563] hover:text-white w-full sm:w-auto"
                                    onClick={() => setNotificationCategoryFilterModal(!notificationCategoryFilterModal)}
                                >
                                    <span>{formatFilterDisplay(notificationCategoryFilter, 'category') || 'All Categories'}</span>
                                    <MdOutlineKeyboardArrowDown className="w-4 h-4" />
                                </button>

                                {notificationCategoryFilterModal && (
                                    <div className="notification-filter-modal absolute top-10 left-0 w-64 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2 z-[9999] border border-[#E5E7EB] sm:left-0 left-1/2 transform -translate-x-1/2 transition-all duration-200 ease-in-out">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[14px] font-medium text-[#111827]">Category</span>
                                            <button
                                                className="text-[12px] text-[#2563EB] hover:underline"
                                                onClick={() => handleNotificationCategoryFilter('All Categories')}
                                            >
                                                Clear
                                            </button>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="notificationCategoryFilter" id="allCategories" value="All Categories"
                                                checked={notificationCategoryFilter === 'All Categories'}
                                                onChange={(e) => handleNotificationCategoryFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="allCategories" className="cursor-pointer leading-none">All Categories</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="notificationCategoryFilter" id="accountAccess" value="account access"
                                                checked={notificationCategoryFilter === 'account access'}
                                                onChange={(e) => handleNotificationCategoryFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="accountAccess" className="cursor-pointer leading-none">Account & Access</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="notificationCategoryFilter" id="billingPayments" value="billing & payments"
                                                checked={notificationCategoryFilter === 'billing & payments'}
                                                onChange={(e) => handleNotificationCategoryFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="billingPayments" className="cursor-pointer leading-none">Billing & Payments</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="notificationCategoryFilter" id="technicalErrors" value="technical errors"
                                                checked={notificationCategoryFilter === 'technical errors'}
                                                onChange={(e) => handleNotificationCategoryFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="technicalErrors" className="cursor-pointer leading-none">Technical Errors</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="notificationCategoryFilter" id="featureRequests" value="feature requests"
                                                checked={notificationCategoryFilter === 'feature requests'}
                                                onChange={(e) => handleNotificationCategoryFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="featureRequests" className="cursor-pointer leading-none">Feature Requests</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="notificationCategoryFilter" id="proposalIssues" value="proposal issues"
                                                checked={notificationCategoryFilter === 'proposal issues'}
                                                onChange={(e) => handleNotificationCategoryFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="proposalIssues" className="cursor-pointer leading-none">Proposal Issues</label>
                                        </div>
                                        <div className="flex items-start space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer mb-2">
                                            <input type="radio" name="notificationCategoryFilter" id="others" value="others"
                                                checked={notificationCategoryFilter === 'others'}
                                                onChange={(e) => handleNotificationCategoryFilter(e.target.value)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="others" className="cursor-pointer leading-none">Others</label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                {(() => {
                    const paginatedNotifications = paginateData(filteredNotifications, currentPageNotifications, rowsPerPage);
                    return paginatedNotifications.length > 0 ? paginatedNotifications.map((item) => (
                        <div key={item.id} className="bg-white p-4 transition-colors border border-[#E5E7EB] rounded-lg mb-4">
                            <div className="flex items-start space-x-4">
                                {/* Icon */}
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        {getNotificationIcon(item.category)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm text-[#4B5563] mb-1">{item.type}</p>
                                            <h3 className="text-sm font-medium text-[#000000] mb-1">{item.title}</h3>
                                            <p className="text-sm text-[#4B5563]">{item.description}</p>
                                        </div>
                                        <div className="flex-shrink-0 ml-4">
                                            <p className="text-sm text-[#4B5563]">{timeAgo(item.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="px-6 py-4 whitespace-nowrap text-[16px] font-medium text-[#4B5563] text-center">
                            No notifications found
                        </div>
                    );
                })()}

                {/* Pagination for notifications */}
                {filteredNotifications.length > 0 && (
                    <div className="mt-6">
                        <PaginationComponent
                            currentPage={currentPageNotifications}
                            totalPages={getTotalPages(filteredNotifications, rowsPerPage)}
                            onPageChange={(page) => {
                                setCurrentPageNotifications(page);
                            }}
                            totalItems={filteredNotifications.length}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(newRowsPerPage) => {
                                setRowsPerPage(newRowsPerPage);
                                setCurrentPageNotifications(1); // Reset to first page when changing rows per page
                            }}
                        />
                    </div>
                )}
            </div>
        );
    };

    const handleLogout = async () => {
        try {
            const res = await axios.post(`${baseUrl}/auth/logout`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            //console.log("Logout response: ", res);
            if (res.status === 200) {
                localStorage.clear();
                sessionStorage.clear();
                setTimeout(() => {
                    navigate('/');
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            // console.error("Error in logout: ", error);
            Swal.fire({
                title: "Error in logout: ",
                icon: "warning",
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: false,
            });
        }
    };

    // Modal Components
    const UserViewModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-lg flex items-center justify-center z-50" onClick={handleModalBackdropClick}>
            <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
                    <button
                        onClick={() => setViewUserModal(false)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <MdOutlineClose className="w-6 h-6" />
                    </button>
                </div>
                {selectedUser && (
                    <div className="space-y-6 bg-white rounded-lg p-6">
                        {/* Basic Information */}
                        <div className="bg-[#F7F7F7] rounded-lg shadow-sm p-4">

                            <div className="flex flex-col gap-4">
                                <div className='flex flex-row gap-2'>
                                    <div>
                                        <img src={`${import.meta.env.VITE_API_BASE_URL}/profile/getProfileImage/file/${selectedUser.logoUrl}`} alt="Company Logo" className="w-[124px] h-[124px] border rounded-lg border-[#E5E7EB]" />
                                    </div>

                                    <div className='flex flex-col gap-2'>
                                        <div className='flex flex-row gap-2 mt-2'>
                                            <label className="block text-[14px] font-medium text-gray-700 mb-1">ID: </label>
                                            <p className="text-gray-900 font-mono text-sm">{selectedUser._id}</p>
                                        </div>
                                        <div className='flex flex-row gap-2'>
                                            <p className="text-gray-900 font-bold text-2xl mb-1">{selectedUser.companyName}</p>
                                            <span className={`h-fit px-2 py-1 text-xs rounded-full ${getStatusColor(selectedUser.blocked ? 'Blocked' : (selectedUser.status || 'Active'))}`}>
                                                {selectedUser.blocked ? 'Blocked' : (selectedUser.status || 'Active')}
                                            </span>
                                        </div>
                                        <div className='flex flex-row gap-2'>
                                            <p className="text-gray-900 font-bold text-sm mb-1">Subscription Type</p>
                                            <span className={`h-fit px-2 py-1 text-xs rounded-full`}>
                                                {selectedUser.plan_name === null ? 'None' : selectedUser.plan_name}
                                            </span>
                                        </div>

                                        <div className="flex flex-row gap-4">
                                            <p className="flex items-center gap-2 text-[#6C63FF] font-medium">
                                                <MdOutlineEmail className="w-4 h-4" />
                                                {selectedUser.email}
                                            </p>

                                            <p className="flex items-center gap-2 text-[#6C63FF] font-medium">
                                                <MdLanguage className="w-4 h-4" />
                                                {selectedUser.website}
                                            </p>

                                            <p className="flex items-center gap-2 text-[#6C63FF] font-medium">
                                                <IoLogoLinkedin className="w-4 h-4" />
                                                {selectedUser.linkedIn}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#6B7280] mb-1">About</label>
                                    <p className="text-gray-900">{selectedUser.bio || 'N/A'}</p>
                                </div>

                                <div className='flex flex-row gap-[100px]'>
                                    <div className='flex flex-col gap-1'>
                                        <label className="block text-sm font-medium text-[#6B7280] ">User ID</label>
                                        <p className="text-gray-900 font-mono text-sm">{selectedUser.userId || 'N/A'}</p>
                                    </div>
                                    <div className='flex flex-col gap-1'>
                                        <label className="block text-sm font-medium text-[#6B7280] ">Admin Name</label>
                                        <p className="text-gray-900">{selectedUser.adminName || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Services, Industries, Awards, Clients */}
                        <div className='flex flex-row gap-4'>
                            <Card title="Services" items={selectedUser.services} />
                            <Card title="Industries" items={selectedUser.preferredIndustries} />
                            <Card title="Awards" items={selectedUser.awards} />
                            <Card title="Clients" items={selectedUser.clients} />
                        </div>


                        <div className='flex flex-row gap-4'>
                            {/* Documents */}
                            {selectedUser.documents && selectedUser.documents.length > 0 && (
                                <div className="bg-[#F7F7F7] p-4 rounded-lg shadow-lg w-[573px] h-[284px]">
                                    <h3 className="text-lg font-semibold text-[#6C63FF] mb-4">Documents</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {selectedUser.documents.map((doc, index) => (
                                            <div key={index} className="flex items-center justify-between bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition">
                                                <div className="flex items-center space-x-3">
                                                    <div className=" rounded-lg">
                                                        <MdOutlineFilePresent className="w-5 h-5 text-[#6C63FF]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800 truncate max-w-[150px]">{doc.name}</p>
                                                        <p className="text-xs text-gray-500">{doc.type.toUpperCase()}, {(doc.size / 1024).toFixed(0)} KB</p>
                                                    </div>
                                                </div>
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-[#6C63FF] hover:text-purple-800">
                                                    <MdOutlineFileDownload className="w-5 h-5 text-[#6C63FF]" />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            )}

                            {/* Licenses & Certifications */}
                            {selectedUser.licensesAndCertifications &&
                                selectedUser.licensesAndCertifications.length > 0 && (
                                    <div className="bg-[#F7F7F7] p-4 rounded-lg shadow-lg w-[573px] h-[284px]">
                                        {/* Section Title */}
                                        <h3 className="text-lg font-semibold text-[#6C63FF] mb-4">
                                            Licenses & Certificates
                                        </h3>

                                        {/* Grid Layout */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {selectedUser.licensesAndCertifications.map((license, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
                                                >
                                                    {/* Title Row */}
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <img src={licenseimg} alt="License" className="w-[22px] h-[22px]" />
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {license.name}
                                                        </p>
                                                    </div>

                                                    <div className="px-4">
                                                        {/* Issuer */}

                                                        <p className="text-sm text-gray-600 font-bold">{license.issuer}</p>

                                                        {/* Validity */}
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Valid till: <span className="font-medium">{license.validTill}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                        </div>

                        {/* Employees */}
                        {selectedUser.employees && selectedUser.employees.length > 0 && (
                            <div className="bg-gradient-to-b from-[#6C63FF] to-[#3B3B98] p-4 rounded-lg shadow-sm w-full         h-[550px]">
                                {/* Header */}
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Employees
                                </h3>

                                {/* Grid of Employee Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-[450px] overflow-y-auto">
                                    {selectedUser.employees.map((employee, index) => (
                                        <div
                                            key={index}
                                            className="bg-white p-4 w-[220px] h-[180px] rounded-lg shadow hover:shadow-md transition mb-4"
                                        >
                                            {/* Access Level Badge */}
                                            <div className="mb-4">
                                                <span
                                                    className={`text-xs font-semibold px-2 py-1 rounded-full ${employee.accessLevel === 'Admin'
                                                        ? 'bg-green-100 text-green-600'
                                                        : employee.accessLevel === 'Editor'
                                                            ? 'bg-yellow-100 text-yellow-600'
                                                            : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                >
                                                    {employee.accessLevel}
                                                </span>
                                            </div>

                                            {/* Employee Avatar and Name */}
                                            <div className="flex items-center space-x-3 mb-2">
                                                <img
                                                    src={`${import.meta.env.VITE_API_BASE_URL}/profile/getProfileImage/file/${employee.logoUrl}`}
                                                    alt={employee.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">

                                                        {employee.name}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        {employee.jobTitle}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm text-[#6C63FF]"   >
                                                    <MdOutlineEmail className="w-4 h-4 px-1" />
                                                    <span className="truncate">{employee.email}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-[#6C63FF]">
                                                    <MdOutlinePhone className="w-4 h-4 px-1" />
                                                    <span>{employee.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}




                        {/* Actions */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                onClick={() => handleUserBlockToggle(selectedUser._id, selectedUser.blocked || false)}
                                className={`px-4 py-2 rounded-lg transition-colors ${selectedUser.blocked
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                            >
                                {selectedUser.blocked ? 'Unblock User' : 'Block User'}
                            </button>
                            <button
                                onClick={() => setViewUserModal(false)}
                                className="px-4 py-2 border border-[#4B5563] rounded-lg text-[#111827] hover:bg-[#F8FAFC]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const SupportViewModal = () => {
        const [showConversation, setShowConversation] = useState(false);

        return (
            <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-lg flex items-center justify-center z-50" onClick={handleModalBackdropClick}>
                <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-[#E5E7EB]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Support Ticket Details</h2>
                        <button
                            onClick={() => setViewSupportModal(false)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <MdOutlineClose className="w-6 h-6" />
                        </button>
                    </div>
                    {selectedSupport && (
                        <div className="space-y-6 bg-white rounded-lg">

                            {/* Basic Information */}
                            <div className="bg-[#F7F7F7] p-4 rounded-lg">


                                <div className="flex flex-row justify-between gap-2 w-full ">
                                    <div>
                                        Basic Information
                                        <div className="mt-4 flex flex-row gap-2">
                                            <img src={`${import.meta.env.VITE_API_BASE_URL}/profile/getProfileImage/file/${selectedSupport.logoUrl}`} alt="User" className="w-[120px] h-[120px] rounded-lg object-cover border border-[#E5E7EB]" />
                                            <div className="flex flex-col p-2">
                                                <p className='text-2xl font-bold'>{selectedSupport.companyName}</p>
                                                <div className='flex flex-row gap-4'>
                                                    <div className='flex flex-col gap-2'>
                                                        <p className='text-[#6B7280]'>Status</p>
                                                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(selectedSupport.status)}`}>
                                                            {selectedSupport.status}
                                                        </span>
                                                    </div>
                                                    <div className='flex flex-col gap-2'>
                                                        <p className='text-[#6B7280]'>Priority</p>
                                                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedSupport.priority)}`}>
                                                            {selectedSupport.priority}
                                                        </span>
                                                    </div>
                                                    <div className='flex flex-col gap-2'>
                                                        <p className='text-[#6B7280]'>Plan Name</p>
                                                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(selectedSupport.plan_name)}`}>
                                                            {selectedSupport.plan_name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col items-end">
                                            <p className="text-[#6B7280] text-sm">Created At</p>
                                            <p className="text-gray-900 font-mono">
                                                {new Date(selectedSupport.createdAt).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <p className="text-[#6B7280] text-sm">Last Updated</p>
                                            <p className="text-gray-900 font-mono">
                                                {new Date(selectedSupport.updatedAt).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </p>
                                        </div>
                                    </div>




                                </div>


                                <div className="mt-4">
                                    <div className="flex flex-row gap-4">

                                        <div className="flex flex-col gap-2">
                                            <label className="block text-sm font-medium text-[#6B7280] mb-1">Ticket ID</label>
                                            <p className="text-gray-900 font-mono">{selectedSupport._id}</p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="block text-sm font-medium text-[#6B7280] mb-1">User ID</label>
                                            <p className="text-gray-900 font-mono">{selectedSupport.userId}</p>
                                        </div>

                                    </div>


                                    <div className="flex flex-row gap-4 mt-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="block text-sm font-medium text-[#6B7280] mb-1">Category</label>
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedSupport.category)}`}>
                                                {selectedSupport.category}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="block text-sm font-medium text-[#6B7280] mb-1">Sub Category</label>
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedSupport.subCategory)}`}>
                                                {selectedSupport.subCategory}
                                            </span>
                                        </div>
                                    </div>
                                </div>


                                <div className="mt-4">
                                    {selectedSupport.description && (

                                        <div className="flex flex-col">
                                            <h3 className="text-sm font-medium text-[#6B7280] mb-3">Description</h3>
                                            <p className="text-gray-700 whitespace-pre-line">{selectedSupport.description || 'No description provided'}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4">
                                    {selectedSupport.attachments && selectedSupport.attachments.length > 0 && (
                                        <div className="flex flex-col">
                                            <h3 className="text-sm font-medium text-[#6B7280] mb-3">Attachments</h3>
                                            <div className="flex flex-row gap-2">
                                                {selectedSupport.attachments.map((attachment, index) => (
                                                    <div
                                                        key={index}
                                                        className="border border-[#4B5563] rounded-lg p-3 bg-gradient-to-b from-[#6C63FF] to-[#3F73BD]"
                                                    >
                                                        <div className="space-y-2">
                                                            <a
                                                                href={`${import.meta.env.VITE_API_BASE_URL}/image/get_image/${attachment.fileUrl}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-white  hover:underline text-sm"
                                                            >
                                                                View Attachment
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>


                            </div>




                            {/* Resolved Description */}
                            <div className={`${selectedSupport.status === "Completed" ? 'opacity-70' : ''} bg-gradient-to-b from-[#413B99] to-[#6C63FF] border border-emerald-100 p-4 rounded-lg shadow-sm ${selectedSupport.status === "Completed" ? 'mt-4' : ''}`}>
                                <h3 className="text-lg font-medium text-white mb-3">Resolved Description</h3>
                                <div>
                                    <label className="block text-sm text-[#B6B6B6] font-medium text-white mb-2">Resolution Details</label>
                                    <textarea
                                        ref={supportResolvedDescriptionRef}
                                        placeholder="Describe how the issue was resolved..."
                                        className={`${selectedSupport.status === "Completed" ? 'bg-white' : 'bg-white'} w-full text-black p-3 border border-gray-300 rounded-lg resize-none`}
                                        rows="3"
                                        disabled={selectedSupport.status === "Completed"}
                                        defaultValue={selectedSupport.resolvedDescription || ''}
                                    />
                                    {selectedSupport.status === "Completed" && (
                                        <p className="text-sm text-white mt-1">This field is read-only for completed tickets.</p>
                                    )}
                                </div>
                            </div>

                            {/* Conversation Interface */}
                            <div className={`${selectedSupport.status === "Completed" ? 'opacity-70' : ''} bg-gradient-to-b from-[#413B99] to-[#6C63FF] border border-purple-100 p-4 rounded-lg shadow-sm`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-white">Conversation</h3>
                                    <button
                                        onClick={() => {
                                            setShowConversation(!showConversation);
                                        }}
                                        className="text-sm text-white hover:text-white font-medium flex items-center gap-1"
                                    >
                                        {showConversation ? 'Hide Conversation' : 'View Conversation'}
                                        <svg
                                            className={`w-4 h-4 transition-transform ${showConversation ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Collapsible Conversation Section */}
                                {showConversation && (
                                    <>
                                        {/* Display existing conversation */}

                                        <div className="mb-4 bg-white rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
                                            {/* Combined Messages Sorted by Timestamp */}
                                            {(() => {
                                                const allMessages = [];

                                                // Add user messages with type indicator
                                                if (selectedSupport.userMessages && selectedSupport.userMessages.length > 0) {
                                                    selectedSupport.userMessages.forEach(msg => {
                                                        allMessages.push({
                                                            ...msg,
                                                            type: 'user',
                                                            timestamp: new Date(msg.createdAt || msg.created_at || Date.now()).getTime()
                                                        });
                                                    });
                                                }

                                                // Add admin messages with type indicator
                                                if (selectedSupport.adminMessages && selectedSupport.adminMessages.length > 0) {
                                                    selectedSupport.adminMessages.forEach(msg => {
                                                        allMessages.push({
                                                            ...msg,
                                                            type: 'admin',
                                                            timestamp: new Date(msg.createdAt || msg.created_at || Date.now()).getTime()
                                                        });
                                                    });
                                                }

                                                // Sort all messages by timestamp
                                                allMessages.sort((a, b) => a.timestamp - b.timestamp);

                                                return allMessages.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {allMessages.map((msg, index) => (
                                                            <div key={index} className={`flex ${msg.type === 'user' ? 'justify-start' : 'justify-end'}`}>
                                                                <div className={`rounded-lg p-3 max-w-xs lg:max-w-md ${msg.type === 'user'
                                                                    ? 'bg-blue-100'
                                                                    : 'bg-green-100'
                                                                    }`}>
                                                                    <div className={`text-sm ${msg.type === 'user'
                                                                        ? 'text-blue-900'
                                                                        : 'text-green-900'
                                                                        }`}>
                                                                        {msg.message}
                                                                    </div>
                                                                    <div className={`text-xs mt-1 ${msg.type === 'user'
                                                                        ? 'text-blue-600'
                                                                        : 'text-green-600'
                                                                        }`}>
                                                                        {new Date(msg.createdAt || msg.created_at || Date.now()).toLocaleString()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : null;
                                            })()}

                                            {(!selectedSupport.userMessages || selectedSupport.userMessages.length === 0) &&
                                                (!selectedSupport.adminMessages || selectedSupport.adminMessages.length === 0) && (
                                                    <div className="text-center text-gray-500 text-sm py-4">
                                                        No messages yet. Start the conversation below.
                                                    </div>
                                                )}
                                        </div>

                                        {/* Add Message Input Field */}
                                        <div className="bg-white rounded-lg p-4 border-t border-purple-200 pt-4">
                                            <textarea
                                                ref={adminMessageRef}
                                                placeholder="Enter your message..."
                                                className="w-full rounded-lg resize-none"
                                                rows="3"
                                                disabled={selectedSupport.status === 'Completed'}
                                            />

                                            {/* Add Message Button in Conversation Area */}
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => {
                                                        if (adminMessageRef.current && adminMessageRef.current.value.trim()) {
                                                            handleAddMessage(selectedSupport._id);
                                                        } else {
                                                            toast.warning('Please enter an admin message');
                                                        }
                                                    }}
                                                    disabled={selectedSupport.status === 'Completed'}
                                                    className="w-[#70px] px-4 py-2 bg-gradient-to-b from-[#6C63FF] to-[#3F73BD] text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    Send
                                                </button>
                                            </div>

                                        </div>


                                    </>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center pt-4 gap-4">
                                <div className="flex space-x-2">

                                    <button
                                        onClick={() => {
                                            setViewSupportModal(false);
                                            // Clear admin message when closing
                                            if (adminMessageRef.current) {
                                                adminMessageRef.current.value = '';
                                            }
                                            // Clear resolved description when closing
                                            if (supportResolvedDescriptionRef.current) {
                                                supportResolvedDescriptionRef.current.value = '';
                                            }

                                        }}
                                        className="px-4 py-2 border border-[#4B5563] rounded-lg text-[#111827] hover:bg-[#F8FAFC]"
                                    >
                                        Close
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        if (supportResolvedDescriptionRef.current.value.trim()) {
                                            handleSupportStatusUpdate(selectedSupport._id, 'Completed');
                                        } else {
                                            toast.warning('Please enter a resolving description for the ticket');
                                        }
                                    }}
                                    disabled={selectedSupport.status === 'Completed'}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {selectedSupport.status === 'Completed' ? 'Already Resolved' : 'Resolve Ticket'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Invoice utility functions
    const downloadInvoiceAsPDF = async (data) => {
        try {
            // Create a temporary div for the invoice content
            const invoiceDiv = document.createElement('div');
            invoiceDiv.innerHTML = `
                <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px;">
                        <img src="/vite.svg" alt="Company Logo" style="width: 60px; height: 60px; margin-right: 20px;">
                        <div>
                            <h1 style="color: #2563eb; margin: 0; font-size: 28px; font-weight: bold;">RFP2GRANTS</h1>
                            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 16px;">Professional Proposal Management</p>
                        </div>
                    </div>
                    
                    <h2 style="color: #111827; margin: 30px 0 20px 0; font-size: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
                        Payment Invoice - ${data.transaction_id}
                    </h2>
                    
                    <div style="margin: 30px 0;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                            <div>
                                <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Invoice Details</h3>
                                <div style="margin-bottom: 15px;">
                                    <span style="font-weight: bold; color: #111827;">Transaction ID:</span>
                                    <span style="margin-left: 10px; color: #6b7280;">${data.transaction_id}</span>
                                </div>
                                <div style="margin-bottom: 15px;">
                                
                                    <span style="font-weight: bold; color: #111827;">Subscription Type:</span>
                                    <span style="margin-left: 10px; color: #6b7280;">${data.planName || 'N/A'}</span>
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <span style="font-weight: bold; color: #111827;">Amount:</span>
                                    <span style="margin-left: 10px; color: #6b7280;">$${data.price}</span>
                                </div>
                            </div>
                            <div>
                                <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Additional Information</h3>
                                <div style="margin-bottom: 15px;">
                                    <span style="font-weight: bold; color: #111827;">Status:</span>
                                    <span style="margin-left: 10px; color: #6b7280;">${data.status}</span>
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <span style="font-weight: bold; color: #111827;">User ID:</span>
                                    <span style="margin-left: 10px; color: #6b7280;">${data.user_id}</span>
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <span style="font-weight: bold; color: #111827;">Created Date:</span>
                                    <span style="margin-left: 10px; color: #6b7280;">${data.created_at || data.createdAt || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="color: #6b7280; font-size: 14px;">
                                Invoice generated on ${new Date().toLocaleDateString()}
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 20px; font-weight: bold; color: #111827; margin-bottom: 5px;">
                                    Total Amount: $${data.price}
                                </div>
                                <div style="color: #6b7280; font-size: 14px;">Thank you for your business!</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Use html2pdf to generate PDF
            const { default: html2pdf } = await import('html2pdf.js');

            const opt = {
                margin: 10,
                filename: `invoice-${data.transaction_id}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(invoiceDiv).save();

            toast.success('Invoice downloaded successfully!');
        } catch (error) {
            // console.error('Error downloading invoice:', error);
            toast.error('Failed to download invoice. Please try again.');
        }
    };

    const printInvoice = (data) => {
        try {
            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invoice - ${data.transaction_id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                        .invoice-header { display: flex; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
                        .logo { width: 60px; height: 60px; margin-right: 20px; }
                        .company-name { color: #2563eb; margin: 0; font-size: 28px; font-weight: bold; }
                        .company-tagline { color: #6b7280; margin: 5px 0 0 0; font-size: 16px; }
                        .invoice-title { color: #111827; margin: 30px 0 20px 0; font-size: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
                        .invoice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
                        .section-title { color: #374151; margin: 0 0 15px 0; font-size: 18px; }
                        .detail-row { margin-bottom: 15px; }
                        .label { font-weight: bold; color: #111827; }
                        .value { margin-left: 10px; color: #6b7280; }
                        .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; }
                        .footer-content { display: flex; justify-content: space-between; align-items: center; }
                        .total-amount { font-size: 20px; font-weight: bold; color: #111827; margin-bottom: 5px; }
                        .thank-you { color: #6b7280; font-size: 14px; }
                        @media print {
                            body { padding: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="invoice-header">
                        <img src="/vite.svg" alt="Company Logo" class="logo">
                        <div>
                            <h1 class="company-name">RFP App</h1>
                            <p class="company-tagline">Professional Proposal Management</p>
                        </div>
                    </div>
                    
                    <h2 class="invoice-title">Payment Invoice - ${data.transaction_id}</h2>
                    
                    <div class="invoice-grid">
                        <div>
                            <h3 class="section-title">Invoice Details</h3>
                            <div class="detail-row">
                                <span class="label">Transaction ID:</span>
                                <span class="value">${data.transaction_id}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Amount:</span>
                                <span class="value">$${data.price}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Subscription Type:</span>
                                <span class="value">${data.planName || 'N/A'}</span>
                            </div>
                            
                        </div>
                        <div>
                            <h3 class="section-title">Additional Information</h3>
                            <div class="detail-row">
                                <span class="label">Status:</span>
                                <span class="value">${data.status}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">User ID:</span>
                                <span class="value">${data.user_id}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Created Date:</span>
                                <span class="value">${data.created_at || data.createdAt || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <div class="footer-content">
                            <div style="color: #6b7280; font-size: 14px;">
                                Invoice generated on ${new Date().toLocaleDateString()}
                            </div>
                            <div style="text-align: right;">
                                <div class="total-amount">Total Amount: $${data.price}</div>
                                <div class="thank-you">Thank you for your business!</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="no-print" style="text-align: center; margin-top: 30px; padding: 20px;">
                        <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                            Print Invoice
                        </button>
                        <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-left: 10px;">
                            Close
                        </button>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();

            toast.success('Invoice opened for printing!');
        } catch (error) {
            // console.error('Error printing invoice:', error);
            toast.error('Failed to open invoice for printing. Please try again.');
        }
    };

    // Inline Invoice Modal Component
    const InlineInvoiceModal = ({ data, isOpen, onClose }) => {
        if (!isOpen || !data) return null;

        const getInvoiceTitle = () => {
            return `Payment Invoice - ${data.transaction_id}`;
        };

        const getInvoiceData = () => {
            // console.log("data", data);
            return [
                { label: 'Transaction ID', value: data.transaction_id },
                { label: 'Amount', value: `$${data.price}` },


                { label: 'Subscription Type', value: data.planName || 'None' },
                { label: 'Status', value: data.status },
                { label: 'User ID', value: data.user_id },
                { label: 'Created Date', value: data.created_at || data.createdAt || 'N/A' }
            ];
        };

        return (
            <tr className="bg-[#F8FAFC]">
                <td colSpan="100%" className="px-4 py-6">
                    <div className="bg-white rounded-lg border border-[#4B5563] p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[#000000]">{getInvoiceTitle()}</h3>
                            <button
                                onClick={onClose}
                                className="text-[#4B5563] hover:text-[#4B5563] p-1"
                            >
                                <MdOutlineClose className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Logo and Company Header */}
                        <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
                            <img src="/vite.svg" alt="Company Logo" className="w-12 h-12 mr-4" />
                            <div>
                                <h4 className="text-xl font-bold text-[#2563eb]">RFP2GRANTS</h4>
                                <p className="text-sm text-[#6b7280]">Professional Proposal Management</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {getInvoiceData().map((item, index) => (
                                <div key={index}>
                                    <label className="block text-sm font-medium text-[#111827] mb-1">
                                        {item.label}
                                    </label>
                                    <p className="text-[#000000]">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-[#4B5563]">
                                    Invoice generated on {new Date().toLocaleDateString()}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => downloadInvoiceAsPDF(data)}
                                        className="px-4 py-2 bg-gradient-to-b from-[#6C63FF] to-[#3F73BD] text-white rounded-lg  transition-colors flex items-center space-x-2"
                                    >
                                        <MdOutlineFileUpload className="w-4 h-4" />
                                        <span>Download PDF</span>
                                    </button>
                                    <button
                                        onClick={() => printInvoice(data)}
                                        className="px-4 py-2 border border-[#4B5563] text-[#111827] rounded-lg hover:bg-[#F8FAFC] transition-colors flex items-center space-x-2"
                                    >
                                        <MdOutlineDocumentScanner className="w-4 h-4" />
                                        <span>Print</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <ToastContainer />

            {/* Modals */}
            {viewUserModal && <UserViewModal />}
            {viewSupportModal && <SupportViewModal />}



            {/* Mobile Menu Overlay - Only visible on small screens */}
            {showMobileMenu && (
                <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
                    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg flex flex-col">

                        {/* Header Section */}
                        <div className="p-4 border-b border-[#4B5563] flex items-center justify-between">
                            <div className="w-[127px] h-[36px]">
                                <img src="/Logo.png" alt="logo" className="w-full h-full" />
                            </div>
                            <button
                                className="p-2 transition-colors"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                <MdOutlineMenu className="w-6 h-6 text-[#4B5563]" />
                            </button>
                        </div>

                        {/* Navigation Section */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <nav className="space-y-2">
                                {/* User Management */}
                                <button
                                    className={`w-full text-left rounded-lg p-3 flex items-center space-x-3 transition-colors ${activeTab === "user-management"
                                        ? "bg-[#2563eb] text-white"
                                        : "text-[#4B5563]"
                                        }`}
                                    onClick={() => {
                                        setActiveTab("user-management");
                                        closeAllInvoiceRows();
                                        setShowMobileMenu(false);
                                    }}
                                >
                                    <MdOutlineManageAccounts className="w-4 h-4" />
                                    <span className="text-[16px] font-medium">User Management</span>
                                </button>

                                {/* Payments */}
                                <button
                                    className={`w-full text-left rounded-lg p-3 flex items-center space-x-3 transition-colors ${activeTab === "payments"
                                        ? "bg-[#2563eb] text-white"
                                        : "text-[#4B5563]"
                                        }`}
                                    onClick={() => {
                                        setActiveTab("payments");
                                        closeAllInvoiceRows();
                                        setShowMobileMenu(false);
                                    }}
                                >
                                    <MdOutlinePayments className="w-4 h-4" />
                                    <span className="text-[16px] font-medium">Payments</span>
                                </button>

                                {/* Plan Management */}
                                <button
                                    className={`w-full text-left rounded-lg p-3 flex items-center space-x-3 transition-colors ${activeTab === "plan-management"
                                        ? "bg-[#2563eb] text-white"
                                        : "text-[#4B5563]"
                                        }`}
                                    onClick={() => {
                                        setActiveTab("plan-management");
                                        closeAllInvoiceRows();
                                        setShowMobileMenu(false);
                                    }}
                                >
                                    <LuCrown className="w-4 h-4" />
                                    <span className="text-[16px] font-medium">Plan Management</span>
                                </button>

                                {/* Contact Request */}
                                <button
                                    className={`w-full text-left rounded-lg p-3 flex items-center space-x-3 transition-colors ${activeTab === "contact-request"
                                        ? "bg-[#2563eb] text-white"
                                        : "text-[#4B5563]"
                                        }`}
                                    onClick={() => {
                                        setActiveTab("contact-request");
                                        closeAllInvoiceRows();
                                        setShowMobileMenu(false);
                                    }}
                                >
                                    <MdOutlinePermContactCalendar className="w-4 h-4" />
                                    <span className="text-[16px] font-medium">Contact Request</span>
                                </button>

                                {/* Support */}
                                <button
                                    className={`w-full text-left rounded-lg p-3 flex items-center space-x-3 transition-colors ${activeTab === "support"
                                        ? "bg-[#2563eb] text-white"
                                        : "text-[#4B5563]"
                                        }`}
                                    onClick={() => {
                                        setActiveTab("support");
                                        closeAllInvoiceRows();
                                        setShowMobileMenu(false);
                                    }}
                                >
                                    <MdOutlineHeadsetMic className="w-4 h-4" />
                                    <span className="text-[16px] font-medium">Support</span>
                                </button>


                                {/* Website */}
                                <button
                                    className="w-full text-left rounded-lg p-3 flex items-center space-x-3 transition-colors text-[#4B5563] hover:bg-gray-100"
                                    onClick={() => window.open(`${import.meta.env.VITE_APP_BASE_URL}/`, "_blank")}
                                >
                                    <MdLanguage className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-[16px] font-medium">Website</span>
                                </button>

                                {/* Change Password */}
                                <button
                                    onClick={() => navigate('/change-password')}
                                    className="w-full text-left rounded-lg p-3 flex items-center space-x-3 transition-colors text-[#4B5563] hover:bg-gray-100"
                                >
                                    <MdOutlineLock className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-[16px] font-medium">Change Password</span>
                                </button>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left rounded-lg p-3 flex items-center space-x-3 transition-colors text-[#4B5563] hover:bg-gray-100"
                                >
                                    <MdOutlineLogout className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-[16px] font-medium">Logout</span>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}



            <div className="flex h-screen relative ">
                {/* Left Sidebar - Half visible by default, expands on hover */}
                {/* Toggle Hover Feature Button */}

                <div
                    className={`hidden lg:flex w-20 hover:w-64
                            bg-[#2F3349] border-r border-[#0000001A] flex-shrink-0 transition-all duration-300 ease-in-out absolute left-0 top-0 h-full z-20 overflow-hidden group`}
                >
                    <div className="p-4 h-screen flex flex-col justify-between">
                        {/* Top Section */}
                        <div>
                            <div className="hidden group-hover:block w-[127px] h-[36px] mb-4">
                                <img src={"/Logo.png"} alt="logo" className="w-full h-full" />
                            </div>

                            <nav className="space-y-2">
                                <button
                                    className={`w-full text-left text-white rounded-lg p-3 flex items-center justify-center lg:justify-start space-x-3 transition-colors ${activeTab === 'user-management' ? 'bg-[#6C63FF] text-white' : 'text-white'
                                        }`}
                                    onClick={() => {
                                        setActiveTab('user-management');
                                        closeAllInvoiceRows();
                                    }}
                                >
                                    <MdOutlineManageAccounts className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-[16px] font-medium lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                                        User Management
                                    </span>
                                </button>

                                <button
                                    className={`w-full text-left text-white rounded-lg p-3 flex items-center justify-center lg:justify-start space-x-3 transition-colors ${activeTab === 'payments' ? 'bg-[#6C63FF] text-white' : 'text-white'
                                        }`}
                                    onClick={() => {
                                        setActiveTab('payments');
                                        closeAllInvoiceRows();
                                    }}
                                >
                                    <MdOutlinePayments className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-[16px] font-medium lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                                        Payments
                                    </span>
                                </button>

                                <button
                                    className={`w-full text-left text-white rounded-lg p-3 flex items-center justify-center lg:justify-start space-x-3 transition-colors ${activeTab === 'plan-management' ? 'bg-[#6C63FF] text-white' : 'text-white'
                                        }`}
                                    onClick={() => {
                                        setActiveTab('plan-management');
                                        closeAllInvoiceRows();
                                    }}
                                >
                                    <LuCrown className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-[16px] font-medium lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                                        Plan Management
                                    </span>
                                </button>

                                <button
                                    className={`w-full text-left text-white rounded-lg p-3 flex items-center justify-center lg:justify-start space-x-3 transition-colors ${activeTab === 'contact-request' ? 'bg-[#6C63FF] text-white' : 'text-white'
                                        }`}
                                    onClick={() => {
                                        setActiveTab('contact-request');
                                        closeAllInvoiceRows();
                                    }}
                                >
                                    <MdOutlinePermContactCalendar className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-[16px] font-medium lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                                        Contact Request
                                    </span>
                                </button>

                                <button
                                    className={`w-full text-left text-white rounded-lg p-3 flex items-center justify-center lg:justify-start space-x-3 transition-colors ${activeTab === 'support' ? 'bg-[#6C63FF] text-white' : 'text-white'
                                        }`}
                                    onClick={() => {
                                        setActiveTab('support');
                                        closeAllInvoiceRows();
                                    }}
                                >
                                    <MdOutlineHeadsetMic className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-[16px] font-medium lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                                        Support
                                    </span>
                                </button>
                            </nav>
                        </div>

                        {/* Bottom Section */}
                        <nav className="text-white py-2">
                            <div className="flex flex-col items-center justify-center">
                                <button
                                    className="w-full text-left text-white rounded-lg p-3 flex items-center justify-center lg:justify-start space-x-3 transition-colors "
                                >

                                    <MdLanguage className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-[16px] font-medium lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                                        <a href={`${import.meta.env.VITE_APP_BASE_URL}/`} target="_blank" rel="noopener noreferrer">Website</a>

                                    </span>
                                </button>
                                <button
                                    onClick={() => navigate('/change-password')}
                                    className="w-full text-left text-white rounded-lg p-3 flex items-center justify-center lg:justify-start space-x-3 transition-colors "
                                >
                                    <MdOutlineLock className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-[16px] font-medium lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                                        Change Password
                                    </span>
                                </button>
                                <button
                                    onClick={() => handleLogout()}
                                    className="w-full text-left text-white rounded-lg p-3 flex items-center justify-center lg:justify-start space-x-3 transition-colors "
                                >
                                    <MdOutlineLogout className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-[16px] font-medium lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                                        Logout
                                    </span>
                                </button>
                            </div>


                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out lg:ml-20`}>
                    {/* Scrollable Content Area */}

                    {/* Top Header Bar */}
                    <div className="bg-gray px-2 py-2">
                        <div className="flex items-center justify-between bg-gradient-to-r from-[#2F3349] to-[#717AAF] border rounded-lg pr-2 py-2">
                            <div className="flex items-center space-x-6">
                                {/* Mobile Menu Button - Only visible on small screens */}
                                <button
                                    className="lg:hidden p-2 transition-colors"
                                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                                >
                                    <MdOutlineMenu className="w-6 h-6 text-[#4B5563]" />
                                </button>

                                <div className="flex items-center">
                                    <div className="w-full h-8 rounded-lg flex items-center justify-center mr-3">
                                        <span className="text-white font-bold text-lg">{activeTab === 'user-management' ? 'User Management' : activeTab === 'payments' ? 'Payments' : activeTab === 'plan-management' ? 'Plan Management' : activeTab === 'contact-request' ? 'Contact Request' : activeTab === 'support' ? 'Support' : activeTab === 'notifications' ? 'Notifications' : 'Contact Request'}</span>

                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button className="p-2 transition-colors relative"
                                    onClick={() => {
                                        activeTab === 'notifications' ? setActiveTab('user-management') : setActiveTab('notifications');
                                        closeAllInvoiceRows();
                                    }}
                                >
                                    <MdOutlineNotifications className="relative w-6 h-6 text-white" />
                                    {notificationsData.length > 0 && (
                                        <span className="absolute top-[1px] right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                                    )}
                                </button>
                                <div className="w-8 h-8 bg-[#2563eb] rounded-full flex items-center justify-center transition-colors cursor-pointer">
                                    <MdOutlinePerson className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>



                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 min-h-full">
                            {/* Content based on active tab */}
                            {activeTab === 'user-management' && renderUserManagement()}
                            {activeTab === 'payments' && renderPayments()}
                            {activeTab === 'plan-management' && renderPlanManagement()}
                            {activeTab === 'support' && renderSupport()}
                            {activeTab === 'notifications' && renderNotifications()}
                            {activeTab === 'contact-request' && renderContactRequest()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdmin;