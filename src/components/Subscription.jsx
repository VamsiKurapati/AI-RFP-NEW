import { useState, useEffect } from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSubscriptionPlans } from "../context/SubscriptionPlansContext";

export default function Subscription({ plan }) {
  const navigate = useNavigate();
  const { subscriptionPlans, mostPopularPlan } = useSubscriptionPlans();
  const [plans, setPlans] = useState([]);
  const [popularPlan, setPopularPlan] = useState(null);
  const [isYearlyb, setIsYearlyb] = useState(false);
  const [isYearlyp, setIsYearlyp] = useState(false);
  const [isYearlye, setIsYearlye] = useState(false);

  useEffect(() => {
    setPlans(subscriptionPlans);
    setPopularPlan(mostPopularPlan);
  }, [subscriptionPlans, mostPopularPlan]);

  const getPlanSection = (planName) => {
    const plan = plans?.find((p) => p.name === planName);
    if (!plan) return null;

    return (
      <div
        className={`border rounded-2xl p-4 w-[340px] h-[500px] shadow-md relative transition-transform hover:scale-105 flex flex-col bg-white mt-[100px] ${popularPlan === planName ? "border-blue-500" : "border-gray-300"
          }`}
      >
        {popularPlan === planName && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#2F3349] to-[#717AAF] text-white text-xs px-2 py-0.5 rounded-full">
            Most Popular
          </div>
        )}

        {planName === "Basic" ? (
          <>
            <div className="flex items-center mb-4 relative bg-gray-200 rounded-full w-[120px] p-1 ml-[50%] -translate-x-1/2">
              <div
                className={`absolute top-1 left-1 w-[55px] h-[22px] rounded-full bg-[#6C63FF] transition-transform duration-300 ${isYearlyb ? "translate-x-[58px]" : "translate-x-0"
                  }`}
              ></div>
              <span
                className={`relative z-10 flex-1 text-center py-0.5 text-xs font-medium cursor-pointer transition-colors ${!isYearlyb ? "text-white" : "text-[#6C63FF]"
                  }`}
                onClick={() => setIsYearlyb(false)}
                style={{ userSelect: "none" }}
              >
                Monthly
              </span>
              <span
                className={`relative z-10 flex-1 text-center py-0.5 text-xs font-medium cursor-pointer transition-colors ${isYearlyb ? "text-white" : "text-[#6C63FF]"
                  }`}
                onClick={() => setIsYearlyb(true)}
                style={{ userSelect: "none" }}
              >
                Yearly
              </span>
            </div>

            <p className="text-xl font-bold mb-4 text-center">
              ${isYearlyb ? plan.yearlyPrice : plan.monthlyPrice}
              <span className="text-xs font-normal">/{isYearlyb ? "year" : "month"}</span>
            </p>

            <p className="text-[24px] font-semibold mb-2">{plan.name}</p>
            <ul className="space-y-1 mb-4 text-sm">
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                <span>Up to {plan.maxRFPProposalGenerations} AI - RFP Proposal Generations</span>
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                <span>Up to {plan.maxGrantProposalGenerations} AI - Grant Proposal Generations</span>
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                AI-Driven RFP Discovery
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                AI-Driven Grant Discovery
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                AI-Proposal Recommendation
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                Basic Compliance Check
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                Proposal Tracking Dashboard
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                {`${plan.maxEditors} Editors, ${plan.maxViewers} Viewers, Unlimited Members`}
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                Team Collaboration
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                Support
              </li>
            </ul>
            <button className="w-full py-1.5 rounded-lg bg-gradient-to-b from-[#6C63FF] to-[#3F73BD] text-white text-sm font-medium shadow mt-auto" onClick={() => navigate("/payment")}>
          Get Started
        </button>
          </>
        ) : planName === "Pro" ? (
          <>


            <div className="flex items-center mb-4 relative bg-gray-200 rounded-full w-[120px] p-1 ml-[50%] -translate-x-1/2">
              <div
                className={`absolute top-1 left-1 w-[55px] h-[22px] rounded-full bg-[#6C63FF] transition-transform duration-300 ${isYearlyp ? "translate-x-[58px]" : "translate-x-0"
                  }`}
              ></div>
              <span
                className={`relative z-10 flex-1 text-center py-0.5 text-xs font-medium cursor-pointer transition-colors ${!isYearlyp ? "text-white" : "text-[#6C63FF]"
                  }`}
                onClick={() => setIsYearlyp(false)}
                style={{ userSelect: "none" }}
              >
                Monthly
              </span>
              <span
                className={`relative z-10 flex-1 text-center py-0.5 text-xs font-medium cursor-pointer transition-colors ${isYearlyp ? "text-white" : "text-[#6C63FF]"
                  }`}
                onClick={() => setIsYearlyp(true)}
                style={{ userSelect: "none" }}
              >
                Yearly
              </span>
            </div>

            <p className="text-xl font-bold mb-4 text-center">
              ${isYearlyp ? plan.yearlyPrice : plan.monthlyPrice}
              <span className="text-xs font-normal">/{isYearlyp ? "year" : "month"}</span>
            </p>

            <p className="text-[24px] font-semibold mb-2">{plan.name}</p>
            <ul className="space-y-1 mb-4 text-sm">
              <li className="flex items-center text-[#6C63FF] text-sm font-semibold">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                Includes All Basic Features
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                <span>Up to {plan.maxRFPProposalGenerations} AI - RFP Proposal Generations</span>
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                <span>Up to {plan.maxGrantProposalGenerations} AI - Grant Proposal Generations</span>
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                {`${plan.maxEditors} Editors, ${plan.maxViewers} Viewers, Unlimited Members`}
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                Advance Compliance Check
              </li>
            </ul>
            <button className="w-full py-1.5 rounded-lg bg-gradient-to-b from-[#6C63FF] to-[#3F73BD] text-white text-sm font-medium shadow mt-auto" onClick={() => navigate("/payment")}>
          Get Started
        </button>
          </>
        ) : planName === "Enterprise" ? (
          <>

            {!plan.isContact && (
              
            <div>
            <div className="flex items-center mb-4 relative bg-gray-200 rounded-full w-[120px] p-1 ml-[50%] -translate-x-1/2">
              <div
                className={`absolute top-1 left-1 w-[55px] h-[22px] rounded-full bg-[#6C63FF] transition-transform duration-300 ${isYearlye ? "translate-x-[58px]" : "translate-x-0"
                  }`}
              ></div>
              <span
                className={`relative z-10 flex-1 text-center py-0.5 text-xs font-medium cursor-pointer transition-colors ${!isYearlye ? "text-white" : "text-[#6C63FF]"
                  }`}
                onClick={() => setIsYearlye(false)}
                style={{ userSelect: "none" }}
              >
                Monthly
              </span>
              <span
                className={`relative z-10 flex-1 text-center py-0.5 text-xs font-medium cursor-pointer transition-colors ${isYearlye ? "text-white" : "text-[#6C63FF]"
                  }`}
                onClick={() => setIsYearlye(true)}
                style={{ userSelect: "none" }}
              >
                Yearly
              </span>
            </div>

            <p className="text-xl font-bold mb-4 text-center">
              ${isYearlye ? plan.yearlyPrice : plan.monthlyPrice}
              <span className="text-xs font-normal">/{isYearlye ? "year" : "month"}</span>
            </p>

            </div>

            )}

            <p className="text-[24px] font-semibold mb-2">{plan.name}</p>
            <ul className="space-y-1 mb-4 text-sm">
              <li className="flex items-center text-[#6C63FF] text-sm font-semibold">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                Includes All Basic & Pro Features
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                {plan.isContact ? "Custom AI-RFP Proposal Generations" :
                <span>Up to {plan.maxRFPProposalGenerations} AI - RFP Proposal Generations</span>}
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                {plan.isContact ? "Custom AI-Grant Proposal Generations" :
                <span>Up to {plan.maxGrantProposalGenerations} AI - Grant Proposal Generations</span>}
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                {plan.isContact ? "Custom Editors, Custom Viewers, Custom Members" : "Unlimited Editors, Unlimited Viewers, Unlimited Members"}
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 p-1"><FaRegCheckCircle className="w-3.5 h-3.5" /></span>
                Dedicated Support
              </li>
            </ul>

            {plan.isContact ? (
              <button className="w-full py-1.5 rounded-lg bg-gradient-to-b from-[#6C63FF] to-[#3F73BD] text-white text-sm font-medium shadow mt-auto" onClick={() => navigate("/support-ticket")}>
                Get in Touch
              </button>
            ) : (
              <button className="w-full py-1.5 rounded-lg bg-gradient-to-b from-[#6C63FF] to-[#3F73BD] text-white text-sm font-medium shadow mt-auto" onClick={() => navigate("/payment")}>
                Get Started
              </button>
            )}
          </>
        ) : null}

       
      </div>
    );
  };

  return (
    // <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 justify-center z-50">
    <div className="flex flex-col lg:flex-row w-full h-full overflow-y-auto max-w-5xl gap-4 justify-center items-start p-6  ">
      {getPlanSection("Basic")}
      {getPlanSection("Pro")}
      {getPlanSection("Enterprise")}

    </div>
    // </div>

  );
}
