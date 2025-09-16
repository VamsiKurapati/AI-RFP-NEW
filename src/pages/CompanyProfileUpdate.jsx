import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdOutlineSave, MdOutlineBusinessCenter, MdOutlineDescription, MdOutlineGroup, MdOutlineCalendarToday, MdOutlineClose } from "react-icons/md";
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { useProfile } from "../context/ProfileContext";
import Swal from "sweetalert2";

const INDUSTRY_OPTIONS = [
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
    "Other",
];

const EMPLOYEE_OPTIONS = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1001-5000",
    "5001-10000",
    "10000+",
];

const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= 1950; y--) {
        years.push(y.toString());
    }
    return years;
};

// Custom MultiSelect Component
const MultiSelect = ({
    options,
    value = [],
    onChange,
    placeholder = "Select options...",
    disabled = false,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = React.useRef(null);

    const filteredOptions = options.filter(option =>
        !value.includes(option) &&
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        if (!value.includes(option)) {
            onChange([...value, option]);
        }
        setSearchTerm("");
        setIsOpen(false);
    };

    const handleRemove = (optionToRemove) => {
        onChange(value.filter(option => option !== optionToRemove));
    };

    const handleInputClick = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Backspace' && searchTerm === '' && value.length > 0) {
            handleRemove(value[value.length - 1]);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div
                className={`w-full border rounded-md p-2 bg-[#F0F0F0] min-h-[40px] flex flex-wrap gap-1 items-center cursor-text ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleInputClick}
            >
                {value.map((selectedOption, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#2563EB] text-white text-sm rounded-md"
                    >
                        {selectedOption}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(selectedOption);
                            }}
                            className="ml-1 hover:bg-[#1d4ed8] rounded-full p-0.5"
                            disabled={disabled}
                        >
                            <MdOutlineClose className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder={value.length === 0 ? placeholder : ""}
                    className="flex-1 bg-transparent outline-none text-sm"
                    disabled={disabled}
                    onFocus={() => setIsOpen(true)}
                />
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => handleSelect(option)}
                            >
                                {option}
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                            No options available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Reusable input component
const FormInput = ({
    label,
    type = "text",
    value,
    onChange,
    error,
    required = false,
    id,
    disabled = false,
    placeholder,
    ...props
}) => (
    <div className="mb-4">
        <label htmlFor={id} className="text-[18px] md:text-[24px] font-medium text-[#111827]">
            {label} {required && "*"}
        </label>
        <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full border rounded-md mt-1 p-2 bg-[#F0F0F0] ${error ? "border-red-500" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            {...props}
        />
        {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
);

// Phone input component
const PhoneInputField = ({
    value,
    onChange,
    error,
    disabled = false
}) => (
    <div className="mb-4">
        <label htmlFor="phone" className="text-[18px] md:text-[24px] font-medium text-[#111827]">
            Phone *
        </label>
        <PhoneInput
            country={'in'}
            value={value}
            onChange={onChange}
            disabled={disabled}
            inputProps={{
                name: 'phone',
                required: true,
                autoFocus: true,
                placeholder: "Enter your mobile number",
                disabled: disabled
            }}
            inputStyle={{
                width: "100%",
                paddingLeft: "56px",
                height: "40px",
                backgroundColor: "#D9D9D966",
                fontSize: "20px",
                color: "#000000",
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? "not-allowed" : "text",
                boxSizing: "border-box"
            }}
            containerStyle={{
                width: "100%",
            }}
            dropdownStyle={{
                maxHeight: "200px",
                overflowY: "auto",
                zIndex: 99999
            }}
            buttonStyle={{
                height: "40px",
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
                boxSizing: "border-box"
            }}
            containerClass="w-full md:w-[436px] mt-1"
        />
        {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
);

const CompanyProfileUpdate = () => {
    const navigate = useNavigate();
    const { companyData, loading } = useProfile();

    const [form, setForm] = useState({
        companyName: companyData?.companyName || "",
        adminName: companyData?.adminName || "",
        industry: companyData?.industry || "",
        location: companyData?.location || "",
        email: companyData?.email || "",
        phone: companyData?.phone || "",
        website: companyData?.website || "",
        linkedIn: companyData?.linkedIn || "",
        bio: companyData?.profile?.bio || "",
        services: companyData?.profile?.services || [""],
        awards: companyData?.profile?.awards || [""],
        clients: companyData?.profile?.clients || [""],
        preferredIndustries: companyData?.profile?.preferredIndustries || [""],
        numberOfEmployees: companyData?.companyDetails?.["No.of employees"]?.value || "",
        founded: companyData?.companyDetails?.["Founded"]?.value || "",
    });

    const [errors, setErrors] = useState({});
    // const [loading, setLoading] = useState(false); // This line is removed

    // Helper to check valid URL
    function isValidUrl(url) {
        try {
            const parsed = new URL(url);
            return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
            return false;
        }
    }

    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    // const handleServiceChange = (index, value) => {
    //     const newServices = [...form.services];
    //     newServices[index] = value;
    //     setForm(prev => ({ ...prev, services: newServices }));
    // };

    // const handleAwardChange = (index, value) => {
    //     const newAwards = [...form.awards];
    //     newAwards[index] = value;
    //     setForm(prev => ({ ...prev, awards: newAwards }));
    // };

    // const handleClientChange = (index, value) => {
    //     const newClients = [...form.clients];
    //     newClients[index] = value;
    //     setForm(prev => ({ ...prev, clients: newClients }));
    // };

    // const addService = () => {
    //     if (form.services.length < 10) {
    //         setForm(prev => ({ ...prev, services: [...prev.services, ""] }));
    //     }
    // };

    // const removeService = (index) => {
    //     if (form.services.length > 1) {
    //         const newServices = form.services.filter((_, i) => i !== index);
    //         setForm(prev => ({ ...prev, services: newServices }));
    //     }
    // };

    // const addAward = () => {
    //     if (form.awards.length < 10) {
    //         setForm(prev => ({ ...prev, awards: [...prev.awards, ""] }));
    //     }
    // };

    // const removeAward = (index) => {
    //     if (form.awards.length > 1) {
    //         const newAwards = form.awards.filter((_, i) => i !== index);
    //         setForm(prev => ({ ...prev, awards: newAwards }));
    //     }
    // };

    // const addClient = () => {
    //     if (form.clients.length < 10) {
    //         setForm(prev => ({ ...prev, clients: [...prev.clients, ""] }));
    //     }
    // };

    // const removeClient = (index) => {
    //     if (form.clients.length > 1) {
    //         const newClients = form.clients.filter((_, i) => i !== index);
    //         setForm(prev => ({ ...prev, clients: newClients }));
    //     }
    // };

    const handleChange = (type, index, value) => {
        if (type === "service") {
            const newServices = [...form.services];
            newServices[index] = value;
            setForm(prev => ({ ...prev, services: newServices }));
        } else if (type === "award") {
            const newAwards = [...form.awards];
            newAwards[index] = value;
            setForm(prev => ({ ...prev, awards: newAwards }));
        } else if (type === "client") {
            const newClients = [...form.clients];
            newClients[index] = value;
            setForm(prev => ({ ...prev, clients: newClients }));
        }
    }

    const add = (type) => {
        if (type === "service") {
            if (form.services.length < 10) {
                setForm(prev => ({ ...prev, services: [...prev.services, ""] }));
            }
        } else if (type === "award") {
            if (form.awards.length < 10) {
                setForm(prev => ({ ...prev, awards: [...prev.awards, ""] }));
            }
        } else if (type === "client") {
            if (form.clients.length < 10) {
                setForm(prev => ({ ...prev, clients: [...prev.clients, ""] }));
            }
        }
    }

    const remove = (type, index) => {
        if (type === "service") {
            const newServices = form.services.filter((_, i) => i !== index);
            setForm(prev => ({ ...prev, services: newServices }));
        } else if (type === "award") {
            const newAwards = form.awards.filter((_, i) => i !== index);
            setForm(prev => ({ ...prev, awards: newAwards }));
        } else if (type === "client") {
            const newClients = form.clients.filter((_, i) => i !== index);
            setForm(prev => ({ ...prev, clients: newClients }));
        }
    }



    const validateForm = () => {
        const newErrors = {};
        const phoneNumber = parsePhoneNumberFromString(form.phone.startsWith('+') ? form.phone : `+${form.phone}`);

        if (!form.companyName.trim()) newErrors.companyName = "Company name is required";
        if (!form.industry.trim()) newErrors.industry = "Industry is required";
        if (!form.location.trim()) newErrors.location = "Location is required";
        if (!form.email.trim()) newErrors.email = "Email is required";
        if (!form.phone.trim()) newErrors.phone = "Phone number is required";
        else if (!phoneNumber || !phoneNumber.isValid()) newErrors.phone = "Enter a valid phone number (7-15 digits, numbers only)";
        if (!form.linkedIn.trim()) newErrors.linkedIn = "LinkedIn is required";
        else if (!isValidUrl(form.linkedIn)) newErrors.linkedIn = "Please enter a valid URL (e.g., https://linkedin.com/username)";
        if (!form.bio.trim()) newErrors.bio = "Company bio is required";
        else if (form.bio.length < 100) newErrors.bio = "Bio must be at least 100 characters long";

        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (form.email && !emailRegex.test(form.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Website validation (optional but if provided, should be valid)
        if (form.website && !isValidUrl(form.website)) {
            newErrors.website = "Please enter a valid URL (e.g., https://example.com)";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // setLoading(true); // This line is removed
        try {
            const formData = new FormData();
            formData.append("companyName", form.companyName);
            formData.append("adminName", form.adminName);
            formData.append("industry", form.industry);
            formData.append("location", form.location);
            formData.append("email", form.email);
            formData.append("phone", form.phone);
            formData.append("website", form.website);
            formData.append("linkedIn", form.linkedIn);
            formData.append("bio", form.bio);
            formData.append("preferredIndustries", JSON.stringify(form.preferredIndustries));
            // const filteredPreferredIndustries = form.preferredIndustries.filter(industry => industry.trim());
            const filteredServices = form.services.filter(service => service.trim());
            formData.append("services", JSON.stringify(filteredServices));
            const filteredAwards = form.awards.filter(award => award.trim());
            formData.append("awards", JSON.stringify(filteredAwards));
            const filteredClients = form.clients.filter(client => client.trim());
            formData.append("clients", JSON.stringify(filteredClients));
            formData.append("numberOfEmployees", form.numberOfEmployees);
            formData.append("establishedYear", form.founded);

            const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/profile/updateCompanyProfile`, formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            if (response.status === 200) {
                Swal.fire({
                    title: 'Profile updated successfully!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    showCancelButton: false,
                });
                setTimeout(() => {
                    navigate("/company_profile_dashboard");
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            // console.error(error);
            Swal.fire({
                title: 'Failed to update profile ',
                text: `${error.response?.data?.message || error.message}`,
                icon: 'error',
                timer: 1500,
                showConfirmButton: true,
                showCancelButton: false,
                confirmButtonText: 'OK',
                confirmButtonColor: '#DC2626',
                cancelButtonColor: '#6B7280',
                cancelButtonText: 'Cancel',
                dangerMode: true,
            });
        } finally {
            // setLoading(false); // This line is removed
        }
    };

    const handleCancel = () => {
        navigate("/company_profile_dashboard");
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-center w-full mx-auto gap-4">
                            {/* <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] transition-colors"
                            >
                                <MdOutlineArrowBack className="w-5 h-5" />
                                Back to Dashboard
                            </button> */}
                            <h1 className="text-2xl font-semibold text-[#111827]">Edit Company Profile</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="w-full mx-auto px-4 sm:px-8 md:px-12 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
                        <h2 className="text-xl font-semibold text-[#111827] mb-6 flex items-center gap-2">
                            <MdOutlineBusinessCenter className="w-6 h-6 text-[#2563EB]" />
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                            <div className="col-span-2 md:col-span-1">
                                <FormInput
                                    id="companyName"
                                    label="Company Name"
                                    value={form.companyName}
                                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                                    error={errors.companyName}
                                    required
                                    disabled={loading}
                                    placeholder="Enter company name"
                                />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <FormInput
                                    id="adminName"
                                    label="Admin Name"
                                    value={form.adminName}
                                    onChange={(e) => handleInputChange('adminName', e.target.value)}
                                    error={errors.adminName}
                                    required
                                    disabled={loading}
                                    placeholder="Enter admin name"
                                />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label htmlFor="industry" className="text-[18px] md:text-[24px] font-medium text-[#111827]">
                                    Industry *
                                </label>
                                <select
                                    id="industry"
                                    value={form.industry}
                                    onChange={e => handleInputChange('industry', e.target.value)}
                                    disabled={loading}
                                    className={`w-full border rounded-md mt-1 p-2 bg-[#F0F0F0] ${errors.industry ? "border-red-500" : ""} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    required
                                >
                                    <option value="">Select Industry</option>
                                    {INDUSTRY_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                {errors.industry && <div className="text-red-500 text-sm mt-1">{errors.industry}</div>}
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <FormInput
                                    id="location"
                                    label="Location"
                                    value={form.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    error={errors.location}
                                    required
                                    disabled={loading}
                                    placeholder="e.g., San Francisco, CA"
                                />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <FormInput
                                    id="email"
                                    label="Email"
                                    type="email"
                                    value={form.email}
                                    // onChange={(e) => handleInputChange('email', e.target.value)}
                                    error={errors.email}
                                    required
                                    disabled={true}
                                    placeholder="Enter email"
                                />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <PhoneInputField
                                    value={form.phone}
                                    onChange={phone => handleInputChange('phone', phone)}
                                    error={errors.phone}
                                    disabled={loading}
                                />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <FormInput
                                    id="website"
                                    label="Website"
                                    type="url"
                                    value={form.website}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    error={errors.website}
                                    disabled={loading}
                                    placeholder="https://www.company.com"
                                />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <FormInput
                                    id="linkedIn"
                                    label="LinkedIn"
                                    type="url"
                                    value={form.linkedIn}
                                    onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                                    error={errors.linkedIn}
                                    required
                                    disabled={loading}
                                    placeholder="https://linkedin.com/company/yourcompany"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Company Description */}
                    <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
                        <h2 className="text-xl font-semibold text-[#111827] mb-6 flex items-center gap-2">
                            <MdOutlineDescription className="w-6 h-6 text-[#2563EB]" />
                            Company Description
                        </h2>

                        <div className="mb-6">
                            <label htmlFor="bio" className="text-[18px] md:text-[24px] font-medium text-[#111827]">
                                Company Bio *
                            </label>
                            <textarea
                                id="bio"
                                value={form.bio}
                                onChange={(e) => handleInputChange('bio', e.target.value)}
                                rows={4}
                                disabled={loading}
                                className={`w-full border rounded-md mt-1 p-2 bg-[#F0F0F0] ${errors.bio ? "border-red-500" : ""} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                placeholder="Describe your company, its mission, and what makes it unique..."
                            />
                            {errors.bio && <div className="text-red-500 text-sm mt-1">{errors.bio}</div>}
                        </div>

                        <div className="mb-6">
                            <label className="text-[18px] md:text-[24px] font-medium text-[#111827] mb-2 block">
                                Services Offered
                            </label>
                            <div className="space-y-3">
                                {form.services.map((service, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={service}
                                            onChange={(e) => handleChange("service", index, e.target.value)}
                                            disabled={loading}
                                            className={`flex-1 border rounded-md p-2 bg-[#F0F0F0] ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                            placeholder={`Service ${index + 1}`}
                                        />
                                        {form.services.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove("service", index)}
                                                disabled={loading}
                                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {form.services.length < 10 && (
                                    <button
                                        type="button"
                                        onClick={() => add("service")}
                                        disabled={loading}
                                        className="text-[#2563EB] hover:text-[#1d4ed8] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        + Add Service
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="text-[18px] md:text-[24px] font-medium text-[#111827] mb-2 block">
                                Awards
                            </label>
                            <div className="space-y-3">
                                {form.awards.map((award, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={award}
                                            onChange={(e) => handleChange("award", index, e.target.value)}
                                            disabled={loading}
                                            className={`flex-1 border rounded-md p-2 bg-[#F0F0F0] ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                            placeholder={`Award ${index + 1}`}
                                        />
                                        {form.awards.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove("award", index)}
                                                disabled={loading}
                                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {form.awards.length < 10 && (
                                    <button
                                        type="button"
                                        onClick={() => add("award")}
                                        disabled={loading}
                                        className="text-[#2563EB] hover:text-[#1d4ed8] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        + Add Award
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="text-[18px] md:text-[24px] font-medium text-[#111827] mb-2 block">
                                Clients
                            </label>
                            <div className="space-y-3">
                                {form.clients.map((client, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={client}
                                            onChange={(e) => handleChange("client", index, e.target.value)}
                                            disabled={loading}
                                            className={`flex-1 border rounded-md p-2 bg-[#F0F0F0] ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                            placeholder={`Client ${index + 1}`}
                                        />
                                        {form.clients.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove("client", index)}
                                                disabled={loading}
                                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {form.clients.length < 10 && (
                                    <button
                                        type="button"
                                        onClick={() => add("client")}
                                        disabled={loading}
                                        className="text-[#2563EB] hover:text-[#1d4ed8] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        + Add Client
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-[18px] md:text-[24px] font-medium text-[#111827] mb-2 block">
                                Preferred Industries
                            </label>
                            {/* Multiple Select from the list of industries */}
                            <MultiSelect
                                options={INDUSTRY_OPTIONS}
                                value={form.preferredIndustries}
                                onChange={(newValue) => setForm(prev => ({ ...prev, preferredIndustries: newValue }))}
                                placeholder="Select preferred industries"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Company Statistics */}
                    <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
                        <h2 className="text-xl font-semibold text-[#111827] mb-6">Company Statistics</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2 md:col-span-1">
                                <label htmlFor="numberOfEmployees" className="text-[18px] md:text-[24px] font-medium text-[#111827] mb-2 block">
                                    Total Employees
                                </label>
                                <div className="flex items-center gap-2">
                                    <MdOutlineGroup className="w-6 h-6 text-[#2563EB]" />
                                    <select
                                        id="numberOfEmployees"
                                        value={form.numberOfEmployees}
                                        onChange={e => handleInputChange('numberOfEmployees', e.target.value)}
                                        disabled={loading}
                                        className={`w-full border rounded-md p-2 bg-[#F0F0F0] ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <option value="">Select Range</option>
                                        {EMPLOYEE_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label htmlFor="founded" className="text-[18px] md:text-[24px] font-medium text-[#111827] mb-2 block">
                                    Founded Year
                                </label>
                                <div className="flex items-center gap-2">
                                    <MdOutlineCalendarToday className="w-6 h-6 text-[#2563EB]" />
                                    <select
                                        id="founded"
                                        value={form.founded}
                                        onChange={e => handleInputChange('founded', e.target.value)}
                                        disabled={loading}
                                        className={`w-full border rounded-md p-2 bg-[#F0F0F0] ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <option value="">Select Year</option>
                                        {getYearOptions().map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div className="flex gap-3 justify-center items-center w-full mx-auto pb-8 px-4 sm:px-8 md:px-12">
                <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <MdOutlineSave className="w-4 h-4" />
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
};

export default CompanyProfileUpdate; 