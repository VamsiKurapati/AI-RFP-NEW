import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, EyeOff, Eye } from "lucide-react";
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Swal from "sweetalert2";

const SignupForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // Step 0 = Choose Role
  const [role, setRole] = useState(""); // company | freelancer
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    organization: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateStepOne = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) newErrors.email = "Enter a valid email address";
    if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const validateStepTwo = () => {
    const newErrors = {};
    const phoneNumber = parsePhoneNumberFromString(form.mobile.startsWith('+') ? form.mobile : `+${form.mobile}`);
    if (!phoneNumber || !phoneNumber.isValid()) newErrors.mobile = "Enter a valid phone number (7-15 digits, numbers only)";
    if (!form.organization.trim()) newErrors.organization = "Organization is required";
    return newErrors;
  };

  const handleSubmit = async () => {
    const stepTwoErrors = validateStepTwo();
    if (Object.keys(stepTwoErrors).length > 0) {
      setErrors(stepTwoErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      navigate("/create-profile", { state: { role, signupData: form } });
    } catch (error) {
      Swal.fire({
        title: "Signup failed: " + (error.response?.data?.message || "Server error"),
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        showCancelButton: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center px-6 py-12 bg-white">
      {/* STEP 0 - JOIN AS */}
      {step === 0 && (
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-between">
            <img src="/Logo.png" alt="Logo" className="w-[180px] h-[72px]" />
          </div>
          <h2 className="text-[32px] font-semibold text-[#2563EB] mb-4">Welcome to (RFP2Grant)</h2>
          <h3 className="text-[32px] font-medium text-[#111827]">Join as</h3>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                setRole("company");
                setStep(1);
              }}
              className="bg-[#2563EB] text-white py-2 rounded-md font-semibold"
            >
              Company
            </button>
            <button
              onClick={() => {
                setRole("freelancer");
                setStep(1);
              }}
              className="border border-1 border-[#2563EB] text-[#2563EB] py-2 rounded-md font-semibold"
            >
              Freelancer
            </button>
          </div>
        </div>
      )}

      {step > 0 && role === "company" && (
        <>
          <div className="w-full md:w-1/2 flex justify-center mb-10 md:mb-0">
            <img src="/Sign_Up.png" alt="SignUp" className="w-2/3 max-w-sm" />
          </div>

          <div className="w-full md:w-1/2 max-w-lg">
            <div className="flex items-center justify-between">
              <img src="/Logo.png" alt="Logo" className="w-[180px] h-[72px]" />
            </div>
            <h2 className="text-[32px] font-semibold text-[#2563EB] mb-1">Sign up</h2>
            <p className="font-normal text-[16px] text-[#6B7280] mb-6">
              Enter your work details to create your account
            </p>

            {/* STEP 1 - BASIC DETAILS */}
            {step === 1 && (
              <>
                <div className="space-y-4">
                  {["fullName", "email", "password", "confirmPassword"].map((field) => (
                    <div key={field}>
                      <label className="block text-lg font-medium text-gray-800 mb-1">
                        {field === "fullName"
                          ? "Full Name"
                          : field === "email"
                            ? "Email"
                            : field === "password"
                              ? "Create Password"
                              : "Confirm Password"}
                      </label>
                      <div className="relative">
                        <input
                          type={field.includes("password") ? (showPassword ? "text" : "password") : field === "email" ? "email" : "text"}
                          name={field}
                          required={field === "fullName" || field === "email" || field === "password" || field === "confirmPassword"}
                          placeholder={
                            field === "password"
                              ? "Minimum 8 characters"
                              : field === "confirmPassword"
                                ? "Retype password"
                                : `Enter ${field}`
                          }
                          value={form[field]}
                          onChange={handleChange}
                          className={`w-full p-3 bg-[#0000000F] rounded-md ${errors[field] ? "border border-red-500" : ""} pr-12`}
                        />

                        {field.includes("password") && (
                          <button
                            type="button"
                            className="absolute right-3 top-3 text-gray-600"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        )}
                      </div>
                      {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
                    </div>
                  ))}
                </div>

                <div className="text-right mt-6">
                  <button
                    onClick={() => {
                      const validation = validateStepOne();
                      if (Object.keys(validation).length === 0) {
                        setStep(2);
                      } else {
                        setErrors(validation);
                      }
                    }}
                    className="text-[#2563EB] text-[22px] font-medium inline-flex items-center justify-center gap-1"
                  >
                    Next <ArrowRight />
                  </button>
                </div>
              </>
            )}

            {/* STEP 2 - EXTRA DETAILS */}
            {step === 2 && (
              <>
                <div className="space-y-4">
                  <button
                    onClick={() => setStep(1)}
                    className="text-[#2563EB] text-[22px] font-medium inline-flex items-center justify-center gap-1"
                  >
                    <ArrowLeft /> Back
                  </button>

                  <div>
                    <label className="text-lg font-medium text-gray-800 mb-1 block">
                      Mobile Number
                    </label>
                    <PhoneInput
                      country={'in'}
                      value={form.mobile}
                      onChange={mobile => setForm({ ...form, mobile })}
                      inputProps={{
                        name: 'mobile',
                        required: true,
                        autoFocus: true,
                        placeholder: "Enter your mobile number"
                      }}
                      inputStyle={{
                        width: "100%",
                        paddingLeft: "56px",
                        height: "40px",
                        backgroundColor: "#D9D9D966",
                        fontSize: "20px",
                        color: "#000000",
                        // border: "2px solid #000000B2",
                        // borderRadius: "10px",
                        boxSizing: "border-box"
                      }}
                      containerStyle={{
                        width: "100%"
                      }}
                      dropdownStyle={{
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 99999
                      }}
                      buttonStyle={{
                        height: "40px",
                        // border: "2px solid #000000B2",
                        // borderRadius: "10px 0 0 10px",
                        boxSizing: "border-box"
                      }}
                      containerClass="w-full md:w-[436px] mt-1"
                    />
                    {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
                  </div>

                  <div>
                    <label className="text-lg font-medium text-gray-800 mb-1 block">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      name="organization"
                      placeholder="Enter organization"
                      value={form.organization}
                      onChange={handleChange}
                      className={`w-full p-3 bg-[#0000000F] rounded-md ${errors.organization ? "border border-red-500" : ""}`}
                    />
                    {errors.organization && <p className="text-red-500 text-sm">{errors.organization}</p>}
                  </div>
                </div>

                <button
                  className="w-full mt-6 bg-[#2563EB] text-white py-3 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Sign Up"}
                </button>
              </>
            )}

            <div className="mt-4 text-center text-[16px] text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-[#2563EB] font-medium hover:underline">
                Log In
              </a>
            </div>
          </div>
        </>
      )}

      {step > 0 && role === "freelancer" && (
        <div>
          <span className="text-[32px] font-semibold text-[#2563EB] mb-1">This is still in development</span>
          <p className="text-[16px] text-[#6B7280] mb-6">
            We are working on this feature and it will be available soon.
          </p>
          <button className="bg-[#2563EB] text-white py-2 rounded-md font-semibold" onClick={() => navigate("/")}>
            Go to Home
          </button>
        </div>
      )}
    </div>
  );
};

export default SignupForm;
