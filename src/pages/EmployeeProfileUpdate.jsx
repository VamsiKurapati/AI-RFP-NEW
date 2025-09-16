import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdOutlineSave, MdOutlineBusinessCenter, MdOutlineDomain } from "react-icons/md";
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { useEmployeeProfile } from "../context/EmployeeProfileContext";
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

const EmployeeProfileUpdate = () => {
    const navigate = useNavigate();
    const { employeeData, loading } = useEmployeeProfile();

    const [form, setForm] = useState({
        location: employeeData?.location || "",
        email: employeeData?.email || "",
        phone: employeeData?.phone || "",
        name: employeeData?.name || "",
        highestQualification: employeeData?.highestQualification || "",
        skills: employeeData?.skills ? employeeData.skills.join(", ") : "" || "",
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const phoneNumber = parsePhoneNumberFromString(form.phone.startsWith('+') ? form.phone : `+${form.phone}`);

        if (!form.name.trim()) newErrors.name = "Employee name is required";
        if (!form.location.trim()) newErrors.location = "Location is required";
        if (!form.highestQualification.trim()) newErrors.highestQualification = "Highest qualification is required";
        if (!form.skills.trim()) newErrors.skills = "Skills are required";
        if (!form.email.trim()) newErrors.email = "Email is required";

        if (!form.phone.trim()) newErrors.phone = "Phone number is required";
        else if (!phoneNumber || !phoneNumber.isValid()) newErrors.phone = "Enter a valid phone number (7-15 digits, numbers only)";

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (form.email && !emailRegex.test(form.email)) {
            newErrors.email = "Please enter a valid email address";
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

        try {
            const formData = new FormData();
            formData.append("location", form.location);
            formData.append("email", form.email);
            formData.append("phone", form.phone);
            formData.append("name", form.name);
            formData.append("highestQualification", form.highestQualification);

            // , separating skills by commas
            let skillsArray = form.skills.split(',').map(skill => skill.trim());
            if (skillsArray.length === 0 || (skillsArray.length === 1 && skillsArray[0] === "")) {
                skillsArray = [];
            }
            formData.append("skills", skillsArray);

            const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/profile/updateEmployeeProfile`, formData,
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
                    navigate("/employee_profile_dashboard");
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
        navigate("/employee_profile_dashboard");
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-center w-full mx-auto gap-4">
                            <h1 className="text-2xl font-semibold text-[#111827]">Edit Employee Profile</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="w-full mx-auto px-8 md:px-12 py-8">
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
                                    id="name"
                                    label="Employee Name"
                                    value={form.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    error={errors.name}
                                    required
                                    disabled={loading}
                                    placeholder="Enter Your Name"
                                />
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
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    error={errors.email}
                                    required
                                    disabled={true}
                                    placeholder="contact@company.com"
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
                        </div>

                        <h2 className="text-xl font-semibold text-[#111827] mt-8 mb-6 flex items-center gap-2">
                            <MdOutlineDomain className="w-6 h-6 text-[#2563EB]" />
                            Education and Skills
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                            <div className="col-span-2 md:col-span-1">
                                <FormInput
                                    id="highestQualification"
                                    label="Highest Qualification"
                                    value={form.highestQualification}
                                    onChange={(e) => handleInputChange('highestQualification', e.target.value)}
                                    error={errors.highestQualification}
                                    required
                                    disabled={loading}
                                    placeholder="e.g., Bachelor's in Computer Science"
                                />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <FormInput
                                    id="skills"
                                    label="Skills"
                                    value={form.skills}
                                    onChange={(e) => handleInputChange('skills', e.target.value)}
                                    error={errors.skills}
                                    required
                                    disabled={loading}
                                    placeholder="e.g., JavaScript, React"
                                />
                                <span className="text-[16px] font-light text-[#111827]">
                                    (Please enter your skills separated by commas)
                                </span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div className="flex gap-3 justify-center items-center w-full mx-auto pb-8 px-8 md:px-12">
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

export default EmployeeProfileUpdate; 