import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import 'react-phone-input-2/lib/style.css';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import PhoneInput from 'react-phone-input-2';
import Swal from "sweetalert2";

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
  ...props
}) => (
  <div className="mb-2">
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
      className={`w-full border rounded-md mt-1 p-2 bg-[#F0F0F0] ${error ? "border-red-500" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      {...props}
    />
    {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
  </div>
);

// Phone input component to reduce duplication
const PhoneInputField = ({
  value,
  onChange,
  error,
  disabled = false
}) => (
  <div className="mb-2">
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

const CreateProfile = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const role = state?.role;
  // const role = "company";
  // const role = "freelancer";
  const signupData = state?.signupData;

  const [form, setForm] = useState({
    companyName: signupData?.organization || "",
    adminName: "",
    industry: "",
    location: "",
    website: "",
    email: signupData?.email || "",
    phone: signupData?.mobile || "",
    linkedIn: "",
    bio: "",
    fullName: signupData?.fullName || "",
    jobTitle: "",
    numberOfEmployees: "",
    establishedYear: "",
    customIndustry: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Helper to check valid URL
  function isValidUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  useEffect(() => {
    if (!role) navigate("/sign_up");
  }, [role, navigate]);

  const validateForm = () => {
    const newErrors = {};
    const phoneNumber = parsePhoneNumberFromString(form.phone.startsWith('+') ? form.phone : `+${form.phone}`);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (role === "company") {
      if (!form.companyName.trim()) newErrors.companyName = "Company Name is required";

      if (!form.adminName.trim()) newErrors.adminName = "Admin Name is required";

      if (!form.industry.trim()) newErrors.industry = "Industry is required";
      else if (form.industry === "Other" && !form.customIndustry.trim()) newErrors.industry = "Please specify your industry";

      if (!form.numberOfEmployees.trim()) newErrors.numberOfEmployees = "Number of employees is required";

      if (!form.bio.trim()) newErrors.bio = "Bio is required";
      else if (form.bio.length < 100) newErrors.bio = "Bio must be at least 100 characters long";

      if (!form.website.trim()) newErrors.website = "Website is required";
      else if (!isValidUrl(form.website)) newErrors.website = "Please enter a valid URL (e.g., https://example.com)";

      if (!form.phone.trim()) newErrors.phone = "Phone number is required";
      else if (!phoneNumber || !phoneNumber.isValid()) newErrors.phone = "Enter a valid phone number (7-15 digits, numbers only)";

      if (!form.email.trim()) newErrors.email = "Email is required";
      else if (!email || !emailRegex.test(form.email)) newErrors.email = "Enter a valid Email address";

      if (!form.linkedIn.trim()) newErrors.linkedIn = "LinkedIn is required";
      else if (!isValidUrl(form.linkedIn)) newErrors.linkedIn = "Please enter a valid URL (e.g., https://linkedin.com/username)";

      if (!form.location.trim()) newErrors.location = "Location is required";

      if (!form.establishedYear.trim()) newErrors.establishedYear = "Established year is required";
    } else {
      if (!form.fullName.trim()) newErrors.fullName = "Full name is required";

      if (!form.location.trim()) newErrors.location = "Location is required";

      if (!form.companyName.trim()) newErrors.companyName = "Company name is required";

      if (!form.email.trim()) newErrors.email = "Email is required";

      if (!form.jobTitle.trim()) newErrors.jobTitle = "Job title is required";

      if (!form.phone.trim()) newErrors.phone = "Phone number is required";
      else if (!phoneNumber || !phoneNumber.isValid()) newErrors.phone = "Enter a valid phone number (7-15 digits, numbers only)";

      if (!form.linkedIn.trim()) newErrors.linkedIn = "LinkedIn is required";
      else if (!isValidUrl(form.linkedIn)) newErrors.linkedIn = "Please enter a valid URL (e.g., https://linkedin.com/username)";
    }
    return newErrors;
  };

  const handleSubmit = async () => {
    setErrors({});
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("role", role);
      formData.append("email", form.email);
      if (signupData?.password) {
        formData.append("password", signupData?.password);
      } else {
        setRedirecting(true);
        Swal.fire({
          title: "Please sign up again to create your profile",
          icon: "warning",
          timer: 2000,
          showConfirmButton: false,
          showCancelButton: false,
        });
        setTimeout(() => navigate("/sign_up"), 2000);
        return;
      }
      formData.append("fullName", form.fullName);
      formData.append("phone", form.phone);

      if (role === "company") {
        formData.append("companyName", form.companyName);
        formData.append("adminName", form.adminName);
        formData.append("industry", form.industry === "Other" ? form.customIndustry : form.industry);
        formData.append("numberOfEmployees", form.numberOfEmployees);
        formData.append("bio", form.bio);
        formData.append("website", form.website);
        formData.append("linkedIn", form.linkedIn);
        formData.append("location", form.location);
        formData.append("establishedYear", form.establishedYear);
      } else {
        formData.append("companyName", form.companyName);
        formData.append("location", form.location);
        formData.append("jobTitle", form.jobTitle);
        formData.append("linkedIn", form.linkedIn);
      }

      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/signup`, formData);

      if (res.status === 201) {
        Swal.fire({
          title: "Profile created successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          showCancelButton: false,
        });
        setForm({
          companyName: "",
          adminName: "",
          industry: "",
          location: "",
          website: "",
          email: "",
          phone: "",
          linkedIn: "",
          bio: "",
          fullName: "",
          jobTitle: "",
          numberOfEmployees: "",
          establishedYear: "",
          customIndustry: "",
        });
        setErrors({});
        navigate("/dashboard");
      }
    } catch (err) {
      // console.error(err);
      Swal.fire({
        title: "Submission failed: " + (err.response?.data?.message || err.message),
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if form should be disabled
  const isFormDisabled = loading || redirecting;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-blue-600 mb-4">
        {role === "company" ? "Company Profile" : "Your Profile"}
      </h2>
      <p className="text-[16px] text-[#4B5563] mb-1">
        {role === "company"
          ? "Enter all the company details to get started with RFPs."
          : "Enter all your details to complete your account."}
      </p>
      <p className="font-medium italic text-[14px] text-[#9CA3AF] mb-6">
        (* All fields are mandatory.)
      </p>

      {redirecting && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          Redirecting to sign up page...
        </div>
      )}

      {role === "company" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <FormInput
              id="companyName"
              label="Company Name"
              value={form.companyName}
              onChange={e => setForm({ ...form, companyName: e.target.value })}
              error={errors.companyName}
              required
              disabled={isFormDisabled}
            />
            <FormInput
              id="adminName"
              label="Admin Name"
              value={form.adminName}
              onChange={e => setForm({ ...form, adminName: e.target.value })}
              error={errors.adminName}
              required
              disabled={isFormDisabled}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="industry" className="text-[18px] md:text-[24px] font-medium text-[#111827]">
              Industry/Domain *
            </label>
            <select
              id="industry"
              value={form.industry}
              onChange={e => setForm({ ...form, industry: e.target.value, customIndustry: "" })}
              disabled={isFormDisabled}
              className={`w-full border rounded-md mt-1 p-2 bg-[#F0F0F0] ${errors.industry ? "border-red-500" : ""} ${isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              required
            >
              <option value="">Select Industry</option>
              {INDUSTRY_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {form.industry === "Other" && (
              <input
                type="text"
                className={`w-full border rounded-md mt-2 p-2 bg-[#F0F0F0] ${isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                placeholder="Please specify your industry"
                value={form.customIndustry}
                onChange={e => setForm({ ...form, customIndustry: e.target.value })}
                disabled={isFormDisabled}
                required
              />
            )}
            {errors.industry && <div className="text-red-500 text-sm mt-1">{errors.industry}</div>}
          </div>
          <div className="col-span-2 md:col-span-1">
            <FormInput
              id="location"
              label="Location"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder="Eg: California, USA"
              error={errors.location}
              required
              disabled={isFormDisabled}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <FormInput
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              required
              disabled={isFormDisabled}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <PhoneInputField
              value={form.phone}
              onChange={phone => setForm({ ...form, phone })}
              error={errors.phone}
              disabled={isFormDisabled}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="establishedYear" className="text-[18px] md:text-[24px] font-medium text-[#111827]">
              Established Year *
            </label>
            <select
              id="establishedYear"
              value={form.establishedYear}
              onChange={e => setForm({ ...form, establishedYear: e.target.value })}
              disabled={isFormDisabled}
              className={`w-full border rounded-md mt-1 p-2 bg-[#F0F0F0] ${errors.establishedYear ? "border-red-500" : ""} ${isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              required
            >
              <option value="">Select Year</option>
              {getYearOptions().map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {errors.establishedYear && <div className="text-red-500 text-sm mt-1">{errors.establishedYear}</div>}
          </div>
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="numberOfEmployees" className="text-[18px] md:text-[24px] font-medium text-[#111827]">
              Total No.of Employees *
            </label>
            <select
              id="numberOfEmployees"
              value={form.numberOfEmployees}
              onChange={e => setForm({ ...form, numberOfEmployees: e.target.value })}
              disabled={isFormDisabled}
              className={`w-full border rounded-md mt-1 p-2 bg-[#F0F0F0] ${errors.numberOfEmployees ? "border-red-500" : ""} ${isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              required
            >
              <option value="">Select Range</option>
              {EMPLOYEE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {errors.numberOfEmployees && <div className="text-red-500 text-sm mt-1">{errors.numberOfEmployees}</div>}
          </div>
          <div className="col-span-2">
            <div className="mb-2">
              <label htmlFor="bio" className="text-[18px] md:text-[24px] font-medium text-[#111827]">
                Bio *
              </label>
              <textarea
                id="bio"
                className={`w-full border rounded-md mt-1 p-2 bg-[#F0F0F0] ${errors.bio ? "border-red-500" : ""} ${isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                rows={4}
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                disabled={isFormDisabled}
                required
              />
              {errors.bio && <div className="text-red-500 text-sm mt-1">{errors.bio}</div>}
            </div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <FormInput
              id="website"
              label="Website"
              type="url"
              value={form.website}
              onChange={e => setForm({ ...form, website: e.target.value })}
              error={errors.website}
              required
              disabled={isFormDisabled}
              pattern="https?://.+"
              title="Please enter a valid URL starting with http:// or https://"
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <FormInput
              id="linkedIn"
              label="LinkedIn"
              type="url"
              value={form.linkedIn}
              onChange={e => setForm({ ...form, linkedIn: e.target.value })}
              error={errors.linkedIn}
              required
              disabled={isFormDisabled}
              pattern="https?://.+"
              title="Please enter a valid URL starting with http:// or https://"
            />
          </div>
        </div>
      )}

      {role === "freelancer" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: "fullName", label: "Full Name", type: "text" },
            { key: "location", label: "Location", type: "text" },
            { key: "companyName", label: "Company Name", type: "text" },
            { key: "email", label: "Email", type: "email" },
            { key: "jobTitle", label: "Job Title", type: "text" },
            { key: "linkedIn", label: "LinkedIn", type: "url", pattern: "https?://.+", title: "Please enter a valid URL starting with http:// or https://" },
          ].map(field => (
            <FormInput
              key={field.key}
              id={field.key}
              label={field.label}
              type={field.type}
              value={form[field.key]}
              onChange={e => setForm({ ...form, [field.key]: e.target.value })}
              error={errors[field.key]}
              required
              disabled={isFormDisabled}
              {...(field.pattern ? { pattern: field.pattern } : {})}
              {...(field.maxLength ? { maxLength: field.maxLength } : {})}
            />
          ))}
          <div className="col-span-2 md:col-span-1">
            <PhoneInputField
              value={form.phone}
              onChange={phone => setForm({ ...form, phone })}
              error={errors.phone}
              disabled={isFormDisabled}
            />
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          className={`px-4 py-2 rounded bg-gray-200 ${isFormDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={() => navigate("/sign_up")}
          disabled={isFormDisabled}
        >
          Cancel
        </button>
        <button
          className={`px-4 py-2 rounded bg-blue-600 text-white ${isFormDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={() => handleSubmit()}
          disabled={isFormDisabled}
        >
          {loading ? "Creating..." : redirecting ? "Redirecting..." : "Create profile"}
        </button>
      </div>
    </div>
  );
};

export default CreateProfile;
