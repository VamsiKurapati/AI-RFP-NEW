import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, EyeOff, Eye } from "lucide-react";
import PhoneNumberInput, { validatePhoneNumber } from '../components/PhoneNumberInput';
import Swal from "sweetalert2";
import axios from "axios";

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

  const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/auth`;

  // Email verification states
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [showResendButton, setShowResendButton] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });

    // Reset email verification if email changes
    if (e.target.name === "email") {
      setIsEmailVerified(false);
      setVerificationCode("");
      setVerificationMessage("");
      setShowResendButton(false);
    }
  };

  // Send verification email
  const sendVerificationEmail = async () => {
    if (!form.email) {
      setErrors({ ...errors, email: "Please enter your email first" });
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) {
      setErrors({ ...errors, email: "Please enter a valid email address" });
      return;
    }

    setIsSendingCode(true);
    setVerificationMessage("");

    try {
      const response = await axios.post(`${baseUrl}/send-verification-email`, {
        email: form.email
      });

      if (response.status === 200) {
        setVerificationMessage("Verification code sent to your email!");
        setShowResendButton(false);
        Swal.fire({
          title: "Verification Code Sent",
          text: "Please check your email for the verification code",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        setVerificationMessage(response.data.message);
        Swal.fire({
          title: "Error",
          text: response.data.message,
        });
      }
    } catch (error) {
      let errorMessage = error.response?.data?.message || "Failed to send verification code";
      let swalTitle = "Error";

      // Handle specific backend error for existing user
      if (error.response?.data?.message?.includes("User already exists")) {
        errorMessage = "An account with this email already exists. Please use a different email or try logging in.";
        swalTitle = "Email Already Exists";
      }

      setVerificationMessage(errorMessage);
      Swal.fire({
        title: swalTitle,
        text: errorMessage,
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  // Verify OTP code
  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      setVerificationMessage("Please enter the verification code");
      return;
    }

    setIsVerifyingCode(true);
    setVerificationMessage("");

    try {
      const response = await axios.post(`${baseUrl}/verify-email-code`, {
        email: form.email,
        code: verificationCode
      });

      if (response.status === 200) {
        setIsEmailVerified(true);
        setVerificationMessage("Email verified successfully!");
        Swal.fire({
          title: "Email Verified",
          text: "Your email has been verified successfully",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        setVerificationMessage(response.data.message);
        Swal.fire({
          title: "Error",
          text: response.data.message,
        });
      }
    } catch (error) {
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.message || "Invalid verification code";
      let swalTitle = "Verification Failed";
      let swalText = errorMessage;

      if (error.response?.data?.message) {
        if (error.response.data.message === "Verification code expired") {
          swalText = "Your verification code has expired. Please click 'Resend Code' to get a new code.";
          swalTitle = "Code Expired";
          // Clear the verification code input for expired codes
          setVerificationCode("");
          setShowResendButton(true);
        } else if (error.response.data.message === "Invalid verification code") {
          swalText = "This verification code is not valid. Please click 'Resend Code' to get a new code.";
          swalTitle = "Invalid Code";
          // Clear the verification code input for invalid codes
          setVerificationCode("");
          setShowResendButton(true);
        } else {
          // For any other error messages, show the original message
          swalText = errorMessage;
          swalTitle = "Verification Failed";
          setShowResendButton(false);
        }
      }

      setVerificationMessage(errorMessage);
      Swal.fire({
        title: swalTitle,
        text: swalText,
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const validatePassword = (password) => {
    const validation = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*]/.test(password)
    };
    return validation;
  };

  const validateStepOne = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) newErrors.email = "Enter a valid email address";
    if (!isEmailVerified) newErrors.email = "Please verify your email address";
    if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    const passwordValidation = validatePassword(form.password);
    if (!passwordValidation.length) newErrors.password = "Password must be at least 8 characters";
    if (!passwordValidation.uppercase) newErrors.password = "Password must contain at least one uppercase letter";
    if (!passwordValidation.lowercase) newErrors.password = "Password must contain at least one lowercase letter";
    if (!passwordValidation.number) newErrors.password = "Password must contain at least one number";
    if (!passwordValidation.specialChar) newErrors.password = "Password must contain at least one special character";
    return newErrors;
  };

  const validateStepTwo = () => {
    const newErrors = {};
    const phoneError = validatePhoneNumber(form.mobile, true);
    if (phoneError) newErrors.mobile = phoneError;
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
            <img src="/logo_1.png" alt="Logo" className="w-[180px] h-[72px]" />
          </div>
          <h2 className="text-[32px] font-semibold text-[#2563EB] mb-4">Welcome to (RFP2Grant)</h2>
          <h3 className="text-[32px] font-medium text-[#111827]">Join as</h3>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                setRole("company");
                setStep(1);
              }}
              className="bg-[#2563EB] text-white py-2 px-4 rounded-md font-semibold"
            >
              Company
            </button>
            <button
              onClick={() => {
                setRole("freelancer");
                setStep(1);
              }}
              className="border border-1 border-[#2563EB] text-[#2563EB] py-2 px-4 rounded-md font-semibold"
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
              <img src="/logo_1.png" alt="Logo" className="w-[180px] h-[72px]" />
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
                        <span className="text-red-500 text-sm"> *</span>
                      </label>
                      <div className="relative">
                        <input
                          type={field.includes("password") ? (showPassword ? "text" : "password") : field === "email" ? "email" : "text"}
                          name={field}
                          required={field === "fullName" || field === "email" || field === "password" || field === "confirmPassword"}
                          placeholder={
                            field === "password"
                              ? "Minimum 8 Characters"
                              : field === "confirmPassword"
                                ? "Retype Password"
                                : `Enter ${field === "fullName" ? "Full Name" : field === "email" ? "Email" : field}`
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

                  {/* Email Verification Section */}
                  {form.email && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Email Verification {isEmailVerified && <span className="text-green-600">✓</span>}
                        </span>
                        <button
                          type="button"
                          onClick={sendVerificationEmail}
                          disabled={isSendingCode || isEmailVerified}
                          className={`px-4 py-2 text-sm font-medium rounded-md ${isEmailVerified
                            ? "bg-green-100 text-green-700 cursor-not-allowed"
                            : isSendingCode
                              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                          {isSendingCode ? "Sending..." : isEmailVerified ? "Verified" : "Verify Email"}
                        </button>
                      </div>

                      {!isEmailVerified && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Verification Code
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                maxLength="6"
                                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={verifyCode}
                                disabled={isVerifyingCode || !verificationCode.trim()}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${isVerifyingCode || !verificationCode.trim()
                                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                  : "bg-green-600 text-white hover:bg-green-700"
                                  }`}
                              >
                                {isVerifyingCode ? "Verifying..." : "Verify Code"}
                              </button>
                            </div>

                            {/* Resend Code Button */}
                            {showResendButton && (
                              <div className="mt-2">
                                <button
                                  type="button"
                                  onClick={sendVerificationEmail}
                                  disabled={isSendingCode}
                                  className={`px-4 py-2 text-sm font-medium rounded-md ${isSendingCode
                                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                    : "bg-orange-600 text-white hover:bg-orange-700"
                                    }`}
                                >
                                  {isSendingCode ? "Sending..." : "Resend Code"}
                                </button>
                              </div>
                            )}
                          </div>
                          {verificationMessage && (
                            <p className={`text-sm ${verificationMessage.includes("success") || verificationMessage.includes("sent")
                              ? "text-green-600"
                              : "text-red-600"
                              }`}>
                              {verificationMessage}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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

                  <PhoneNumberInput
                    label="Mobile Number"
                    value={form.mobile}
                    onChange={mobile => setForm({ ...form, mobile })}
                    error={errors.mobile}
                    required={true}
                    placeholder="Enter Your Mobile Number"
                    country="us"
                    inputStyle={{
                      backgroundColor: "#D9D9D966",
                      fontSize: "20px",
                    }}
                    containerClass="w-full md:w-[436px]"
                  />

                  <div>
                    <label className="text-lg font-medium text-gray-800 mb-1 block">
                      Organization Name
                      <span className="text-red-500 text-sm"> *</span>
                    </label>
                    <input
                      type="text"
                      name="organization"
                      placeholder="Enter Organization"
                      value={form.organization}
                      onChange={handleChange}
                      className={`w-full p-3 bg-[#0000000F] rounded-md ${errors.organization ? "border border-red-500" : ""}`}
                    />
                    {errors.organization && <p className="text-red-500 text-sm">{errors.organization}</p>}
                  </div>
                </div>

                <button
                  className="w-full mt-6 bg-[#2563EB] text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    'Sign Up'
                  )}
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
          <button className="bg-[#2563EB] text-white py-2 px-4 rounded-md font-semibold" onClick={() => navigate("/")}>
            Go to Home
          </button>
        </div>
      )}
    </div>
  );
};

export default SignupForm;
