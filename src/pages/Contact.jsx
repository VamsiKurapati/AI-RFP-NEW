import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useState } from 'react';
import axios from 'axios';
import contact from '../assets/Contact.png';
import { FaPlay } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';


export default function Contact() {
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Simple validation
    if (!formData.name.trim()) {
      setMessage("Name is required.");
      setLoading(false);
      return;
    }

    if (!formData.company.trim()) {
      setMessage("Company name is required.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setMessage("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setMessage("Description is required.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/contact`, formData);
      if (response.status === 201) {
        setMessage(response.data.message || 'Your request has been sent successfully!');
        setFormData({ name: "", company: "", email: "", description: "" });
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <Navbar />

      {/* Blue Heading Section */}
      <div className="flex flex-col items-start bg-[#EFF6FF] border-b mt-16 p-4 px-8 md:px-16">
        <div className="flex flex-col items-start w-full max-w-4xl pt-11 mb-8">
          <p className="text-[30px] font-semibold text-[#2563EB]">Contact Us</p>
          <p className="text-[#4B5563]">Feel free to request a demo or to know about our custom pricing</p>
        </div>

        {/* Main Form Section */}
        <div className="flex items-center justify-center min-h-[70vh] w-full">
          <div className="flex flex-col-reverse md:flex-row w-full bg-white rounded-lg shadow p-4 md:p-8">

            {/* Left Side: Form */}
            <div className="w-full md:w-1/2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border-b border-gray-300 focus:border-blue-500 outline-none pb-2"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    name="company"
                    placeholder="Enter company name"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full border-b border-gray-300 focus:border-blue-500 outline-none pb-2"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border-b border-gray-300 focus:border-blue-500 outline-none pb-2"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    placeholder="Enter description of your request"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border-b border-gray-300 focus:border-blue-500 outline-none pb-2"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  {loading ? "Sending..." : "Submit"}
                </button>
              </form>

              {message && (
                <p className="mt-4 text-sm text-green-600">{message}</p>
              )}
            </div>

            {/* Right Side: Illustration */}
            <div className="w-full md:w-1/2 flex items-center justify-center mt-8 md:mt-0">
              <img
                src={contact}
                alt="Contact Illustration"
                className="w-64 md:w-full h-[300px] md:h-full"
              />
            </div>

          </div>
        </div>
      </div>

      <section className="bg-[#1E293B] text-center py-12 px-8 md:px-16">
        <h3 className="text-[36px] text-[#FFFFFF] font-semi-bold mb-2">Ready to get started</h3>
        <p className="text-[#FFFFFF] text-[16px] font-medium mb-4">Join thousands of satisfied customers and transform your business today.</p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button className="w-[140px] sm:w-auto bg-[#2563EB] hover:bg-[#1d4ed8] transition text-white px-6 py-2 rounded-lg text-[16px] font-medium shadow"
            onClick={() => navigate("/")}
          >
            Get Started
          </button>
          <button className="w-[180px] sm:w-auto bg-white hover:bg-gray-100 transition border border-gray-300 px-6 py-2 rounded-lg flex items-center justify-center gap-2 text-[16px] text-black font-medium shadow"
            onClick={() => navigate("/")}
          >
            <FaPlay className="text-black" />
            Watch Demo
          </button>
        </div>
      </section>
      <Footer />
    </div>
  )
}