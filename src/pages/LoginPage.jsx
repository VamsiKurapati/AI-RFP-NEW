import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ToastContainer from "./ToastContainer";
import { useUser } from "../context/UserContext";
import { useJWTVerifier } from "../context/JWTVerifier";
import { sanitizeFormData, sanitizeEmail } from "../utils/sanitization";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const { setRole } = useUser();

  const { setIsTokenValid, verifyAndSchedule } = useJWTVerifier();

  // Clear all localStorage data when the component mounts
  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleChange = (e) => {
    const sanitizedValue = e.target.name === 'email'
      ? sanitizeEmail(e.target.value)
      : e.target.value;
    setForm({ ...form, [e.target.name]: sanitizedValue });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    return newErrors;
  };

  const triggerRFPDiscovery = (token, role) => {
    if (role !== "SuperAdmin") {
      if (token && token !== null && token !== "") {
        axios.post(`${import.meta.env.VITE_API_BASE_URL}/rfp/triggerRFPDiscovery`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }
  };

  const handleLogin = async () => {
    // Clear all localStorage data
    localStorage.clear();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Sanitize form data before sending
      const sanitizedForm = sanitizeFormData(form);
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, sanitizedForm);
      if (res.status === 200) {
        triggerRFPDiscovery(res.data.token, res.data.user.role);
        toast.success("Login successful");
        const token = res.data.token;
        const role = res.data.user.role;
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", token);
        const subscription = res.data.subscription;
        localStorage.setItem("subscription", JSON.stringify(subscription));
        setRole(role === "SuperAdmin" ? "SuperAdmin" : role === "company" ? "company" : res.data.user.accessLevel || "Viewer");
        localStorage.setItem("userRole", role === "SuperAdmin" ? "SuperAdmin" : role === "company" ? "company" : res.data.user.accessLevel || "Viewer");
        role === "SuperAdmin" ? navigate("/admin") : navigate("/dashboard");
        setIsTokenValid(true);
        verifyAndSchedule();
      } else {
        toast.error(res.data.message);
        setIsTokenValid(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
      setIsTokenValid(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center px-6 py-12 bg-white">
      <ToastContainer />
      {/* Left Image */}
      <div className="w-full md:w-1/2 flex justify-center mb-10 md:mb-0">
        <img src="/Login.png" alt="Login Illustration" className="w-2/3 max-w-sm" />
      </div>

      {/* Right Form */}
      <div className="w-full md:w-1/2 max-w-lg">
        <div className="flex items-center justify-between">
          <img src="/logo_1.png" alt="Logo" className="w-[180px] h-[72px]" />
        </div>
        <p className="font-normal text-[16px] text-[#6B7280] mb-6 mt-1">
          Welcome back! Login to continue
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-[24px] text-[#111827] font-medium mb-1">Email Id</label>
            <input
              type="email"
              name="email"
              placeholder="Enter Your Company Email Id"
              value={form.email}
              onChange={handleChange}
              className={`w-full bg-[#0000000F] text-[16px] text-[#6B7280] p-3 rounded-md ${errors.email ? "border border-red-500" : ""
                }`}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div className="relative">
            <label className="block text-[24px] text-[#111827] font-medium mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter Your Password"
              value={form.password}
              onChange={handleChange}
              className={`w-full bg-[#0000000F] text-[16px] text-[#6B7280] p-3 rounded-md pr-12 ${errors.password ? "border border-red-500" : ""
                }`}
            />
            <button
              type="button"
              className="absolute right-3 top-[52px]  text-gray-600"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>
        </div>

        <button
          className="w-full mt-6 bg-[#2563EB] text-white py-3 rounded-md font-semibold text-[20px] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Logging in...
            </>
          ) : (
            'Log In'
          )}
        </button>

        <div className="mt-4 text-center text-[16px] text-gray-600 mb-4">
          Don't have an account?{" "}
          <a href="/sign_up" className="text-[#2563EB] font-medium hover:underline">
            Sign Up
          </a>
        </div>

        <div className="text-center text-[16px] text-gray-600">
          <a href="/forgot-password" className="text-[#2563EB] font-medium hover:underline">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

