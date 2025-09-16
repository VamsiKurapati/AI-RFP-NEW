import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDashcube } from 'react-icons/fa';


export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleRefClick = (id) => {
        navigate("/");
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }

    return (
        <>
            {/* Navbar */}
            <nav className="fixed top-0 left-0 z-50 w-full flex items-center justify-between bg-white p-4 shadow-md px-8 md:px-16">
                <div className="w-[127px] h-[36px] hover:cursor-pointer" onClick={() => navigate("/")}>
                    <img src={"/Logo.png"} alt="logo" className="w-full h-full" />
                </div>

                <div className="hidden md:flex space-x-8">
                    <a href="#about" className="text-[#111827] hover:text-[#2563EB]" onClick={() => handleRefClick("about")}>About Us</a>
                    <a href="#solutions" className="text-[#111827] hover:text-[#2563EB]" onClick={() => handleRefClick("solutions")}>Solutions</a>
                    <a href="#plans" className="text-[#111827] hover:text-[#2563EB]" onClick={() => handleRefClick("plans")}>Plans</a>
                </div>

                <div className="hidden md:flex items-center space-x-4">
                    <button className="text-[#6B7280] text-[16px] px-4 py-2"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </button>
                    <button className="bg-[#2563EB] text-white px-4 py-2 rounded-lg transition"
                        onClick={() => navigate("/contact")}
                    >
                        Request Demo
                    </button>
                </div>

                <div className="md:hidden">
                    <button className="text-gray-700 focus:outline-none"
                        onClick={() => setIsOpen(!isOpen)}>
                        <FaDashcube className="w-6 h-6" />
                    </button>
                </div>

                {isOpen && (
                    <div className="absolute top-16 right-0 backdrop-blur bg-white/60 shadow-lg w-full md:hidden transition-all duration-300 ease-in-out z-100">
                        <div className="flex flex-col items-center space-y-4 p-4">
                            <a href="#about" className="text-[#111827] hover:text-[#2563EB]" onClick={() => handleRefClick("about")}>About Us</a>
                            <a href="#solutions" className="text-[#111827] hover:text-[#2563EB]" onClick={() => handleRefClick("solutions")}>Solutions</a>
                            <a href="#plans" className="text-[#111827] hover:text-[#2563EB]" onClick={() => handleRefClick("plans")}>Plans</a>
                            <button className="text-[#6B7280] text-[16px] px-4 py-2"
                                onClick={() => navigate("/login")}
                            >
                                Login
                            </button>
                            <button className="bg-[#2563EB] text-white px-4 py-2 rounded-lg transition"
                                onClick={() => navigate("/contact")}
                            >
                                Request Demo
                            </button>
                        </div>
                    </div>
                )}
            </nav>
        </>
    )
}