import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import { MdOutlineSearch, MdViewQuilt, MdOutlineSecurity, MdChat, MdOutlineAnalytics, MdOutlineCheckCircle, MdOutlineRocketLaunch, MdOutlineCalendarMonth, MdOutlineCancel } from "react-icons/md";
import { BiTrophy } from "react-icons/bi";
import { IoMdStats } from "react-icons/io";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useSubscriptionPlans } from "../context/SubscriptionPlansContext";

export default function HomePage() {
  const navigate = useNavigate();

  const { subscriptionPlans } = useSubscriptionPlans();
  const [isMonthly, setIsMonthly] = useState([true, true, true]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const features = [
    { title: "AI RFP Discovery", desc: "Find relevant RFPs matched to your business capabilities", image: <MdOutlineSearch className="w-10 h-10 text-[#2563EB]" /> },
    { title: "Smart Templates", desc: "Industry-specific templates with AI-powered customization", image: <MdViewQuilt className="w-10 h-10 text-[#2563EB]" /> },
    { title: "Collaborative Teams", desc: "Work efficiently by teaming up with your employees.", image: <BiTrophy className="w-10 h-10 text-[#2563EB]" /> },
    { title: "Compliance Check", desc: "Automated compliance against RFP verification", image: <MdOutlineSecurity className="w-10 h-10 text-[#2563EB]" /> },
  ];

  const features_2 = [
    { title: "Discover", desc: "Find the right grant opportunities with AI suggestions.", image: <MdOutlineSearch className="w-10 h-10 text-[#2563EB]" /> },
    { title: "Draft", desc: "Use guided templates and AI assistance to write strong grants.", image: <MdViewQuilt className="w-10 h-10 text-[#2563EB]" /> },
    { title: "Collaborate", desc: "Work with your entire team on one platform.", image: <BiTrophy className="w-10 h-10 text-[#2563EB]" /> },
    { title: "Comply", desc: "Run compliance & eligibility checks before submission.", image: <MdOutlineSecurity className="w-10 h-10 text-[#2563EB]" /> },
  ];

  const proposalManagement = [
    {
      title: "AI Recommended Proposals",
      desc: "Get AI based recommendations for proposals",
      image: <MdOutlineRocketLaunch className="w-[34px] h-[34px] text-[#2563EB]" />,
    },
    {
      title: "Real-time Proposal Monitoring",
      desc: "Monitor all your proposals at one place",
      image: <MdOutlineAnalytics className="w-[34px] h-[34px] text-[#2563EB]" />,
    },
    {
      title: "Real-Time Status Updates",
      desc: "Check real time updates",
      image: <IoMdStats className="w-[34px] h-[34px] text-[#2563EB]" />,
    },
    {
      title: "Calendar Tracking",
      desc: "Track your proposals on your calendar",
      image: <MdOutlineCalendarMonth className="w-[34px] h-[34px] text-[#2563EB]" />,
    }
  ];

  const benefits = [
    {
      title: "DISCOVER",
      subtitle: "RFP & Grant Discovery",
      desc: "Uncover the right opportunities faster with AI-powered search and personalized RFP recommendations based on your industry, preferences, and history.",
      image: "/why_1.png",
    },
    {
      title: "GENERATE",
      subtitle: "Smart Templates",
      desc: "Build compelling, high-converting proposals instantly using dynamic templates, auto-filled sections, and real-time AI-driven content enhancements.",
      image: "/why_2.png",
    },
    {
      title: "COLLABORATE",
      subtitle: "Team Collaboration Tools",
      desc: "Bring your entire team together with live co-editing, threaded comments, version control, and seamless workflow — all in one collaborative workspace.",
      image: "/why_3.png",
    },
    {
      title: "ANALYZE",
      subtitle: "Compliance Check Analysis",
      desc: "Run instant compliance checks to flag missing sections, formatting errors, and legal gaps — so your proposals are error-free and submission-ready.",
      image: "/why_4.png",
    },
    {
      title: "MANAGE",
      subtitle: "Real time Proposal Tracking",
      desc: "Visualize every stage of your proposal lifecycle — from drafting to submission — with real-time status updates, deadline alerts, and performance insights.",
      image: "/why_5.png",
    },
  ];

  const plans = [
    {
      name: "Basic",
      headerColor: "bg-teal-500",
      monthlyPrice: subscriptionPlans.find((p) => p.name === "Basic")?.monthlyPrice,
      annualPrice: subscriptionPlans.find((p) => p.name === "Basic")?.yearlyPrice,
      features: [
        `Up to ${subscriptionPlans.find((p) => p.name === "Basic")?.maxRFPProposalGenerations} AI - RFP Proposal Generations`,
        `Up to ${subscriptionPlans.find((p) => p.name === "Basic")?.maxGrantProposalGenerations} AI - Grant Proposal Generations`,
        "AI-Driven RFP Discovery",
        "AI-Driven Grant Discovery",
        "AI-Proposal Recommendation",
        "Basic Compliance Check",
        "Proposal Tracking Dashboard",
        `${subscriptionPlans.find((p) => p.name === "Basic")?.maxEditors} Editors, ${subscriptionPlans.find((p) => p.name === "Basic")?.maxViewers} Viewers, Unlimited Members`,
        "Team Collaboration",
        "Support",
      ],
      missingFeatures: [
        "Advanced Compliance Check",
      ],
      button: "Get Started",
    },
    {
      name: "Pro",
      headerColor: "bg-purple-500",
      monthlyPrice: subscriptionPlans.find((p) => p.name === "Pro")?.monthlyPrice,
      annualPrice: subscriptionPlans.find((p) => p.name === "Pro")?.yearlyPrice,
      features: [
        "Includes All Basic Features",
        `Up to ${subscriptionPlans.find((p) => p.name === "Pro")?.maxRFPProposalGenerations} AI - RFP Proposal Generations`,
        `Up to ${subscriptionPlans.find((p) => p.name === "Pro")?.maxGrantProposalGenerations} AI - Grant Proposal Generations`,
        `${subscriptionPlans.find((p) => p.name === "Pro")?.maxEditors} Editors, ${subscriptionPlans.find((p) => p.name === "Pro")?.maxViewers} Viewers, Unlimited Members`,
        "Advanced Compliance Check",
      ],
      missingFeatures: [
        "Dedicated Support",
      ],
      button: "Get Started",
    },
    {
      name: "Enterprise",
      headerColor: "bg-gray-700",
      monthlyPrice: `${subscriptionPlans.find((p) => p.name === "Enterprise" && !p.isContact) ? `${subscriptionPlans.find((p) => p.name === "Enterprise" && !p.isContact)?.monthlyPrice}` : "N/A"}`,
      annualPrice: `${subscriptionPlans.find((p) => p.name === "Enterprise" && !p.isContact) ? `${subscriptionPlans.find((p) => p.name === "Enterprise" && !p.isContact)?.yearlyPrice}` : "N/A"}`,
      features: [
        "Includes All Basic & Pro Features",
        `${subscriptionPlans.find((p) => p.name === "Enterprise" && !p.isContact) ? `Up to ${subscriptionPlans.find((p) => p.name === "Enterprise" && !p.isContact)?.maxRFPProposalGenerations} AI - RFP Proposal Generations` : "Custom RFP Proposal Generations"}`,
        `${subscriptionPlans.find((p) => p.name === "Enterprise" && !p.isContact) ? `Up to ${subscriptionPlans.find((p) => p.name === "Enterprise" && !p.isContact)?.maxGrantProposalGenerations} AI - Grant Proposal Generations` : "Custom Grant Proposal Generations"}`,
        `${subscriptionPlans.find((p) => p.name === "Enterprise" && !p.isContact) ? `Up to ${subscriptionPlans.find((p) => p.name === "Enterprise" && !p.isContact)?.maxEditors} Editors, ${subscriptionPlans.find((p) => p.name === "Enterprise" && !p.isContact)?.maxViewers} Viewers, Unlimited Members` : "Custom Editors, Custom Viewers, Unlimited Members"}`,
        "Dedicated Support",
      ],
      missingFeatures: [],
      button: `${subscriptionPlans.find((p) => p.name === "Enterprise" && p.isContact) ? "Get In Touch" : "Get Started"}`,
    },
  ];

  const handleBillingToggle = (planIndex, isMonthlyBilling) => {
    const newIsMonthly = [...isMonthly];
    newIsMonthly[planIndex] = isMonthlyBilling;
    setIsMonthly(newIsMonthly);
  };

  const getBorderColor = (planName) => {
    if (planName === "Enterprise") return "border-[#2F3349]";
    if (planName === "Pro") return "border-[#614DDB]";
    return "border-[#03D4CC]";
  };

  const handleContactClick = () => {
    navigate("/contact");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <section className="w-full font-inter bg-white">
      <Navbar />

      <div className="fixed top-1/2 sm:top-[60%] lg:top-[70%] right-1 sm:right-4 w-12 sm:w-16 h-12 sm:h-[62px] bg-[#2563EB] rounded-xl">
        <button
          className="w-full h-full flex items-center justify-center"
          onClick={() => navigate('/login')}
        >
          <MdChat className="w-12 sm:w-10 h-8 sm:h-10 text-[#FFFFFF]" />
        </button>
      </div>

      {/* Hero Section */}
      <section
        className="mt-12 sm:mt-[62px]"
        style={{ background: "linear-gradient(180deg, #EEF4FF 50%, #FFFFFF 100%)" }} >
        <div className="flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-8 md:py-16">
          {/* Left Text Section */}
          <div className="w-full md:w-1/2 text-left mb-10 md:mb-0 lg:ml-24">
            <h1 className="text-[28px] sm:text-[32px] lg:text-[36px] font-semibold text-[#000000] leading-tight">
              From Requests to Results - Smarter, Faster.
            </h1>
            <p className="text-[14px] lg:text-[16px] text-[#6B7280] font-medium mt-4">
              AI-powered drafting, compliance, and collaboration to help you secure proposals & grants with confidence.
            </p>
            <div className="md:hidden w-full xs:w-[70%] h-[200px] mx-auto md:h-full lg:w-1/2 mt-4">
              <img
                src="/homepage.png"
                alt="Hero Analytics Dashboard"
                className="w-full h-full rounded shadow-lg"
              />
            </div>
            <div className="flex gap-4 mt-6">
              <button className="bg-[#2563EB] px-3 sm:px-6 py-2 rounded-lg text-[16px] text-[#FFFFFF] font-regular"
                onClick={() => navigate("/login")}
              >
                Get Started
              </button>
              <button className="border border-1 border-[#00000033] px-3 sm:px-6 py-2 rounded-lg flex items-center gap-2 text-[16px] text-[#000000] font-regular"
                onClick={() => navigate("/")}
              >
                <FaPlay className="text-[#000000]" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Right Image Section */}
          <div className="hidden md:block w-[90%] xs:w-[50%] h-[200px] md:h-full lg:w-1/2">
            <img
              src="/homepage.png"
              alt="Hero Analytics Dashboard"
              className="w-full h-full rounded shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="bg-white scroll-mt-20">
        <div className="py-8 md:py-16 px-8 md:px-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="mx-auto text-[30px] text-[#2F3349] font-semibold">Streamline your <span className="text-[#2563EB]">RFP</span> Process</h2>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((item, idx) => (
              <div key={idx} className="bg-[#0000000A] border border-1 border-[#E5E7EB] p-4 rounded-[16px] hover:shadow transition">
                <div className="flex items-center gap-4 mb-4"> {item.image} </div>
                <div className="flex flex-col items-start text-left gap-2">
                  <h3 className="font-medium text-[20px] text-[#111827]">{item.title}</h3>
                  <p className="font-regular text-[16px] text-[#6B7280]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="py-8 md:py-16 px-8 md:px-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="mx-auto text-[30px] text-[#2F3349] font-semibold">Improve your <span className="text-[#2563EB]">Grant Writing</span> Process</h2>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-6">
            {features_2.map((item, idx) => (
              <div key={idx} className="bg-[#EEF6FF] border border-1 border-[#E5E7EB] p-4 rounded-[16px] hover:shadow transition">
                <div className="flex items-center gap-4 mb-4"> {item.image} </div>
                <div className="flex flex-col items-start text-left gap-2">
                  <h3 className="font-medium text-[20px] text-[#111827]">{item.title}</h3>
                  <p className="font-regular text-[16px] text-[#6B7280]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comprehensive Proposal Management */}
        <div className="py-8 md:py-16 bg-white px-8 md:px-16">
          <h2 className="text-[30px] font-semibold mb-4 text-[#2F3349] text-center">Comprehensive Proposal <span className="text-[#2563EB]">Management</span></h2>
          <div className="flex gap-8 flex-col md:flex-row items-center justify-center lg:ml-24">
            <div className="w-full md:w-1/2">
              <img src="/proposal_management.png" alt="Proposal Management" className="w-full rounded-lg shadow-lg mb-4" />
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              {proposalManagement.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 flex items-center justify-center mt-1">
                    {item.image}
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <h3 className="text-[24px] font-semibold text-[#111827]">{item.title}</h3>
                    <p className="text-[16px] text-[#6B7280] font-regular">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose AI RFP */}
      <section className="py-8 md:py-16 bg-white px-8 md:px-16 scroll-mt-20" id="solutions">
        <h2 className="text-[30px] font-semibold mb-4 text-[#2F3349] text-center">Why Choose <span className="text-[#2563EB]">RFP2Grant</span>?</h2>
        {benefits.map((item, idx) => (
          <div key={idx} className={`flex flex-row items-center justify-center text-left gap-4 xs:gap-8 lg:gap-20 space-y-4 lg:px-8 mb-8 lg:mb-12 ${idx % 2 === 1 ? "flex-row" : "flex-row-reverse"}`}>
            <img src={item.image} alt={item.title} className="w-[100px] xs:w-[150px] md:w-[250px] lg:w-[300px] h-[120px] xs:h-[200px] md:h-full object-cover rounded-lg mb-4" />
            <div className="flex flex-col items-left gap-2 mb-2">
              <h4 className="text-[#2563EB] text-[24px] sm:text-[32px] md:text-[36px] font-bold">{item.title}</h4>
              <h3 className="text-[#111827] text-[20px] sm:text-[28px] md:text-[32px] font-medium">{item.subtitle}</h3>
              <p className="text-[#6B7280] text-[14px] sm:text-[20px] md:text-[22px] font-regular">{item.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Plans Section */}
      <section className="pb-20 bg-white px-8 md:px-16 scroll-mt-20" id="plans">
        <h2 className="text-[30px] text-[#2F3349] font-bold mb-8 text-center">Choose Your <span className="text-[#2563EB]">Plan</span></h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <div key={idx} className={`relative p-6 border-2 rounded-lg ${getBorderColor(plan.name)}`}>
              {/* Plan Header */}
              <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 ${plan.headerColor} text-white p-4 rounded-lg px-6 py-2 mb-6`}>
                <h3 className="text-[20px] font-semibold text-center">{plan.name}</h3>
              </div>

              {/* Price */}
              {(plan.monthlyPrice !== "N/A" && plan.annualPrice !== "N/A") ? (
                <>
                  <div className="text-center mb-6">
                    <p className="text-[28px] font-bold text-[#000000]">
                      ${isMonthly[idx] ? plan.monthlyPrice : plan.annualPrice}
                      <span className="text-[20px] text-[#6B7280] font-regular">{isMonthly[idx] ? "/month" : "/year"}</span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <p className="text-[28px] font-bold text-[#000000]">
                      <span className="text-[#2563EB]">Custom</span> Pricing
                    </p>
                  </div>
                </>
              )}

              {/* Features List */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <MdOutlineCheckCircle className="text-[#10B981] w-5 h-5 flex-shrink-0 mt-[1px]" />
                    <span className="text-[16px] text-[#000000] font-regular">
                      {feature.includes("Includes All Basic Features") || feature.includes("Includes All Basic & Pro Features") ? (
                        <span className="text-[#2563EB] font-semibold">{feature}</span>
                      ) : (
                        feature
                      )}
                    </span>
                  </li>
                ))}
                {plan.missingFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <MdOutlineCancel className="text-[#DC2622] w-5 h-5 flex-shrink-0 mt-[1px]" />
                    <span className="text-[16px] text-[#000000] font-regular">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Billing Toggle */}
              {plan.monthlyPrice !== "N/A" && plan.annualPrice !== "N/A" && (
                <>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <button
                      className={`text-sm font-medium transition-colors ${isMonthly[idx]
                        ? "bg-[#2563EB] text-white px-4 py-2 rounded-lg"
                        : "text-[#2563EB]"
                        }`}
                      onClick={() => handleBillingToggle(idx, true)}
                    >
                      Monthly
                    </button>
                    <button
                      className={`text-sm font-medium transition-colors ${!isMonthly[idx]
                        ? "bg-[#2563EB] text-white px-4 py-2 rounded-lg"
                        : "text-[#2563EB]"
                        }`}
                      onClick={() => handleBillingToggle(idx, false)}
                    >
                      Yearly
                    </button>
                  </div>
                </>
              )}

              {/* Get Started Button */}
              <button
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${plan.name === "Enterprise"
                  ? "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50"
                  : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                onClick={() => (plan.name === "Enterprise" && !plan.isContact) ? handleContactClick() : navigate("/sign_up")}
              >
                {plan.button}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-[#1E293B] text-center py-12 px-8 md:px-16">
        <h3 className="text-[36px] text-[#FFFFFF] font-semibold mb-2">Ready to get started</h3>
        <p className="text-[#FFFFFF] text-[16px] font-medium mb-4">Join thousands of satisfied customers and transform your business today.</p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button className="w-[140px] sm:w-auto bg-[#2563EB] hover:bg-[#1d4ed8] transition text-white px-6 py-2 rounded-lg text-[16px] font-medium shadow"
            onClick={() => navigate("/sign_up")}
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
    </section>
  );
}
