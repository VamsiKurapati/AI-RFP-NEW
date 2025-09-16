// Page to handle forgot password with OTP verification

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ToastContainer from "./ToastContainer";
import { FaLock, FaSpinner, FaEnvelope, FaKey } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdOutlineCheck, MdOutlineClose } from "react-icons/md";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/auth`;

    // Step management
    const [currentStep, setCurrentStep] = useState(1); // 1: Email step, 2: OTP step

    // Email step state
    const [email, setEmail] = useState("");
    const [emailLoading, setEmailLoading] = useState(false);

    // OTP step state
    const [otp, setOtp] = useState("");
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    // OTP Timer state
    const [otpTimer, setOtpTimer] = useState(0); // Timer in seconds
    const [otpExpired, setOtpExpired] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0); // Resend cooldown in seconds
    const [resendLoading, setResendLoading] = useState(false);

    // Password validation state
    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false
    });

    const validatePassword = (password) => {
        const validation = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            specialChar: /[!@#$%^&*]/.test(password)
        };
        setPasswordValidation(validation);
        return validation;
    };

    // Reset validation when newPassword is cleared
    useEffect(() => {
        if (!newPassword) {
            setPasswordValidation({
                length: false,
                uppercase: false,
                lowercase: false,
                number: false,
                specialChar: false
            });
        }
    }, [newPassword]);

    // OTP Timer effect
    useEffect(() => {
        let interval;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prev) => {
                    if (prev <= 1) {
                        setOtpExpired(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    // Resend cooldown effect
    useEffect(() => {
        let interval;
        if (resendCooldown > 0) {
            interval = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendCooldown]);

    // Auto request new OTP when timer expires
    useEffect(() => {
        if (otpExpired && currentStep === 2) {
            handleResendOTP();
        }
    }, [otpExpired, currentStep]);

    const PasswordValidation = (password) => {
        if (password.length < 8) {
            return "Password must be at least 8 characters long";
        }
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*]/.test(password);
        if (!hasUpperCase) {
            return "Password must contain at least one uppercase letter";
        }
        if (!hasLowerCase) {
            return "Password must contain at least one lowercase letter";
        }
        if (!hasNumber) {
            return "Password must contain at least one number";
        }
        if (!hasSpecialChar) {
            return "Password must contain at least one special character";
        }
        return "";
    }

    // Step 1: Send email for OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();

        if (email === "") {
            toast.error("Email is required");
            return;
        }

        try {
            setEmailLoading(true);
            const response = await axios.post(`${baseUrl}/forgotPassword`, {
                email
            });

            if (response.status === 200) {
                toast.success("OTP sent to your email address");
                // Start 10-minute timer (600 seconds)
                setOtpTimer(600);
                setOtpExpired(false);
                setTimeout(() => {
                    setCurrentStep(2);
                }, 1500);
            }
        } catch (error) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to send OTP. Please try again.");
            }
        } finally {
            setEmailLoading(false);
        }
    }

    // Resend OTP function
    const handleResendOTP = async () => {
        if (resendCooldown > 0) {
            toast.error(`Please wait ${resendCooldown} seconds before requesting a new OTP`);
            return;
        }

        try {
            setResendLoading(true);
            const response = await axios.post(`${baseUrl}/forgotPassword`, {
                email
            });

            if (response.status === 200) {
                toast.success("New OTP sent to your email address");
                // Reset timer to 10 minutes
                setOtpTimer(600);
                setOtpExpired(false);
                // Clear OTP digits
                setOtpDigits(["", "", "", "", "", ""]);
                setOtp("");
                // Set 30-second cooldown for resend
                setResendCooldown(30);
            }
        } catch (error) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to resend OTP. Please try again.");
            }
        } finally {
            setResendLoading(false);
        }
    }

    // Format timer display
    const formatTimer = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Handle OTP digit input
    const handleOtpDigitChange = (index, value) => {
        // Only allow single digit
        if (value.length > 1) return;

        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtpDigits = [...otpDigits];
        newOtpDigits[index] = value;
        setOtpDigits(newOtpDigits);

        // Update the OTP string
        const otpString = newOtpDigits.join("");
        setOtp(otpString);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    // Handle backspace
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    // Handle paste
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtpDigits = ["", "", "", "", "", ""];

        for (let i = 0; i < pastedData.length; i++) {
            newOtpDigits[i] = pastedData[i];
        }

        setOtpDigits(newOtpDigits);
        setOtp(pastedData);

        // Focus the next empty input or the last one
        const nextEmptyIndex = newOtpDigits.findIndex(digit => digit === "");
        const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
        const nextInput = document.getElementById(`otp-${focusIndex}`);
        if (nextInput) nextInput.focus();
    };

    // Step 2: Verify OTP and reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (otp === "" || newPassword === "" || confirmNewPassword === "") {
            toast.error("All fields are required");
            return;
        }

        if (otpExpired) {
            toast.error("OTP has expired. Please request a new one.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            toast.error("New password and confirm new password do not match");
            return;
        }

        const newPasswordValidation = PasswordValidation(newPassword);
        if (newPasswordValidation !== "") {
            toast.error(newPasswordValidation);
            return;
        }

        try {
            setOtpLoading(true);
            const response = await axios.post(`${baseUrl}/resetPassword`, {
                email,
                otp,
                newPassword
            });

            if (response.status === 200) {
                toast.success("Password reset successfully");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else if (response.status === 404) {
                if (response.data.message === "Invalid OTP") {
                    toast.error("Invalid OTP");
                } else if (response.data.message === "User not found") {
                    toast.error("User not found");
                } else if (response.data.message === "OTP expired") {
                    toast.error("OTP expired");
                    setTimeout(() => {
                        setCurrentStep(1);
                        setOtp("");
                        setOtpDigits(["", "", "", "", "", ""]);
                        setNewPassword("");
                        setConfirmNewPassword("");
                    }, 1500);
                } else {
                    toast.error("Failed to reset password. Please try again.");
                }
            } else if (response.status === 400) {
                toast.error(response.data.message || "Failed to reset password. Please try again.");
                setOtp("");
                setOtpDigits(["", "", "", "", "", ""]);
                setNewPassword("");
                setConfirmNewPassword("");
            }
        } catch (error) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error(error.response.data.message || "Failed to reset password. Please try again.");
            }
        } finally {
            setOtpLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row items-center justify-center px-6 py-12">
            <ToastContainer />

            {/* Left Image */}
            <div className="w-full md:w-1/2 flex justify-center mb-10 md:mb-0">
                <img src="/Login.png" alt="Login Illustration" className="w-2/3 max-w-sm" />
            </div>

            {/* Right Form */}
            <div className="w-full md:w-1/2 max-w-lg bg-[#F8F9FA] p-8 rounded-xl shadow-lg">
                {currentStep === 1 ? (
                    // Step 1: Email Input
                    <>
                        <h1 className="text-[32px] font-semibold text-[#2563EB] mb-2">Forgot Password</h1>
                        <p className="font-normal text-[16px] text-[#6B7280] mb-6">
                            Enter your email address and we'll send you an OTP to reset your password
                        </p>
                        <form onSubmit={handleSendOTP}>
                            <div className="mb-6 relative">
                                <label htmlFor="email" className="block text-[14px] font-medium text-[#374151] mb-2 flex items-center gap-2">
                                    <FaEnvelope className="text-[#2563EB] text-[18px]" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                                    placeholder="Enter your email address"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="w-1/2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center justify-center gap-2"
                                    onClick={() => navigate(-1)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-1/2 bg-[#2563EB] text-white px-4 py-2 rounded-md hover:bg-[#1D4ED8] flex items-center justify-center gap-2"
                                    disabled={emailLoading}
                                >
                                    {emailLoading ? <FaSpinner className="animate-spin" /> : <FaEnvelope />}
                                    {emailLoading ? "Sending OTP..." : "Send OTP"}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    // Step 2: OTP and Password Input
                    <>
                        <h1 className="text-[32px] font-semibold text-[#2563EB] mb-2">Reset Password</h1>
                        <p className="font-normal text-[16px] text-[#6B7280] mb-6">
                            Enter the OTP sent to <span className="font-semibold text-[#2563EB]">{email}</span> and your new password
                        </p>

                        {/* OTP Timer and Status */}
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${otpExpired ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {otpExpired ? 'OTP Expired' : 'OTP Valid'}
                                    </span>
                                </div>
                                {otpTimer > 0 && !otpExpired && (
                                    <div className="text-sm font-mono text-blue-600">
                                        Expires in: {formatTimer(otpTimer)}
                                    </div>
                                )}
                            </div>
                            {otpExpired && (
                                <div className="mt-2 text-sm text-red-600">
                                    OTP has expired. Please request a new one.
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleResetPassword}>
                            <div className="mb-4">
                                <label className="block text-[14px] font-medium text-[#374151] mb-2 flex items-center gap-2">
                                    <FaKey className="text-[#2563EB] text-[18px]" />
                                    OTP Code
                                </label>
                                <div className="flex gap-2 mb-3">
                                    {otpDigits.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            value={digit}
                                            onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            onPaste={handleOtpPaste}
                                            className="w-12 h-12 text-center text-lg font-semibold border border-[#D1D5DB] rounded-md focus:ring-2 focus:ring-[#2563EB] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                            maxLength="1"
                                            disabled={otpExpired}
                                            required
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={resendLoading || resendCooldown > 0 || otpExpired}
                                        className="px-4 py-2 text-sm font-medium text-[#2563EB] border border-[#2563EB] rounded-md hover:bg-[#2563EB] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        {resendLoading ? (
                                            <FaSpinner className="animate-spin" />
                                        ) : (
                                            <FaEnvelope />
                                        )}
                                        {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend'}
                                    </button>
                                </div>
                                {resendCooldown > 0 && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Please wait {resendCooldown} seconds before requesting a new OTP
                                    </p>
                                )}
                            </div>

                            <div className="mb-4 relative">
                                <label htmlFor="newPassword" className="block text-[14px] font-medium text-[#374151] mb-2 flex items-center gap-2">
                                    <FaLock className="text-[#2563EB] text-[18px]" />
                                    New Password
                                </label>
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        validatePassword(e.target.value);
                                    }}
                                    className="w-full px-3 py-2 pr-10 border border-[#D1D5DB] rounded-md focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <FaEyeSlash className="text-[#2563EB] text-[18px]" /> : <FaEye className="text-[#2563EB] text-[18px]" />}
                                </button>
                            </div>

                            <div className="mb-4 relative">
                                <label htmlFor="confirmNewPassword" className="block text-[14px] font-medium text-[#374151] mb-2 flex items-center gap-2">
                                    <FaLock className="text-[#2563EB] text-[18px]" />
                                    Confirm New Password
                                </label>
                                <input
                                    type={showConfirmNewPassword ? "text" : "password"}
                                    id="confirmNewPassword"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    className="w-full px-3 py-2 pr-10 border border-[#D1D5DB] rounded-md focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                >
                                    {showConfirmNewPassword ? <FaEyeSlash className="text-[#2563EB] text-[18px]" /> : <FaEye className="text-[#2563EB] text-[18px]" />}
                                </button>
                            </div>

                            <div className="mb-4">
                                {/* Password Strength Indicator */}
                                {newPassword && (
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[14px] font-medium text-[#374151]">Password Strength:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[12px] text-gray-500">
                                                    {newPassword.length}/8 characters
                                                </span>
                                                <span className={`text-[12px] font-medium ${Object.values(passwordValidation).every(Boolean) ? 'text-green-600' :
                                                    Object.values(passwordValidation).filter(Boolean).length >= 3 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                    {Object.values(passwordValidation).every(Boolean) ? 'Strong' :
                                                        Object.values(passwordValidation).filter(Boolean).length >= 3 ? 'Medium' : 'Weak'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${Object.values(passwordValidation).every(Boolean) ? 'bg-green-500' :
                                                    Object.values(passwordValidation).filter(Boolean).length >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{
                                                    width: `${(Object.values(passwordValidation).filter(Boolean).length / 5) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                <h4 className="text-[14px] font-medium text-[#374151] mb-3">Password Requirements:</h4>
                                <div className="space-y-2">
                                    <div className={`flex items-center gap-2 text-[14px] ${passwordValidation.length ? 'text-green-600' : 'text-gray-500'}`}>
                                        {passwordValidation.length ? (
                                            <MdOutlineCheck className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <MdOutlineClose className="w-4 h-4 text-gray-400" />
                                        )}
                                        <span>At least 8 characters long</span>
                                    </div>

                                    <div className={`flex items-center gap-2 text-[14px] ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                                        {passwordValidation.uppercase ? (
                                            <MdOutlineCheck className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <MdOutlineClose className="w-4 h-4 text-gray-400" />
                                        )}
                                        <span>One uppercase letter</span>
                                    </div>

                                    <div className={`flex items-center gap-2 text-[14px] ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                                        {passwordValidation.lowercase ? (
                                            <MdOutlineCheck className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <MdOutlineClose className="w-4 h-4 text-gray-400" />
                                        )}
                                        <span>One lowercase letter</span>
                                    </div>

                                    <div className={`flex items-center gap-2 text-[14px] ${passwordValidation.number ? 'text-green-600' : 'text-gray-500'}`}>
                                        {passwordValidation.number ? (
                                            <MdOutlineCheck className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <MdOutlineClose className="w-4 h-4 text-gray-400" />
                                        )}
                                        <span>One number</span>
                                    </div>

                                    <div className={`flex items-center gap-2 text-[14px] ${passwordValidation.specialChar ? 'text-green-600' : 'text-gray-500'}`}>
                                        {passwordValidation.specialChar ? (
                                            <MdOutlineCheck className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <MdOutlineClose className="w-4 h-4 text-gray-400" />
                                        )}
                                        <span>One special character (!@#$%^&*)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="w-1/2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center justify-center gap-2"
                                    onClick={() => setCurrentStep(1)}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="w-1/2 bg-[#2563EB] text-white px-4 py-2 rounded-md hover:bg-[#1D4ED8] flex items-center justify-center gap-2"
                                    disabled={otpLoading || otpExpired}
                                >
                                    {otpLoading ? <FaSpinner className="animate-spin" /> : <FaLock />}
                                    {otpLoading ? "Resetting Password..." : otpExpired ? "OTP Expired" : "Reset Password"}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
