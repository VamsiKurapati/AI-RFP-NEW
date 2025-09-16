import React, { useState } from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/admin`;

const PricingCard = ({ id, plan, price, features, popular, highlightFirst, onPriceUpdated }) => {
    // Custom hook to handle edit price functionality
    const useEditPlanPrice = (planId, initialPrice, onPriceUpdated) => {
        const [isEditing, setIsEditing] = useState(false);
        const [editPrice, setEditPrice] = useState(initialPrice);
        const [loading, setLoading] = useState(false);


        const startEdit = () => setIsEditing(true);

        const cancelEdit = () => {
            setEditPrice(initialPrice);
            setIsEditing(false);
        };

        const saveEdit = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                // console.log("Making API call to:", `${baseUrl}/updateSubscriptionPlan/${planId}`);
                // console.log("Request payload:", { price: editPrice });

                const response = await axios.put(
                    `${baseUrl}/updateSubscriptionPlanPrice/${planId}`,
                    { price: editPrice },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // console.log("API response:", response.data);
                onPriceUpdated && onPriceUpdated(editPrice);
                setIsEditing(false);
            } catch (err) {
                // console.error("API error:", err);
                Swal.fire({
                    title: "Failed to update price: " + (err.response?.data?.message || err.message),
                    icon: "error",
                    timer: 1500,
                    showConfirmButton: false,
                    showCancelButton: false,
                });
            } finally {
                setLoading(false);
            }
        };

        return {
            isEditing,
            editPrice,
            setEditPrice,
            loading,
            startEdit,
            cancelEdit,
            saveEdit,
        };
    };

    const {
        isEditing,
        editPrice,
        setEditPrice,
        loading,
        startEdit,
        cancelEdit,
        saveEdit,
    } = useEditPlanPrice(id, price, onPriceUpdated);

    return (
        <div
            className={`border rounded-2xl p-6 w-full h-[600px] shadow-md relative transition-transform hover:scale-105 flex flex-col ${popular ? "border-blue-500" : "border-gray-300"
                }`}
        >
            {popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#2F3349] to-[#717AAF] text-white text-xs px-3 py-1 rounded-full">
                    Most Popular
                </div>
            )}
            {/* Toggle for Monthly/Yearly */}
            <div className="flex justify-center mb-4">
                <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
                    <button
                        type="button"
                        className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${!isEditing && !editPrice?.isYearly
                            ? "bg-[#6C63FF] text-white"
                            : !isEditing && editPrice?.isYearly
                                ? "text-[#6C63FF]"
                                : !editPrice?.isYearly
                                    ? "bg-[#6C63FF] text-white"
                                    : "text-[#6C63FF]"
                            }`}
                        onClick={() => {
                            if (isEditing) {
                                setEditPrice((prev) =>
                                    typeof prev === "object"
                                        ? { ...prev, isYearly: false }
                                        : { value: prev, isYearly: false }
                                );
                            }
                        }}
                        disabled={!isEditing}
                    >
                        Monthly
                    </button>
                    <button
                        type="button"
                        className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${(!isEditing && editPrice?.isYearly) ||
                            (isEditing && editPrice?.isYearly)
                            ? "bg-[#6C63FF] text-white"
                            : "text-[#6C63FF]"
                            }`}
                        onClick={() => {
                            if (isEditing) {
                                setEditPrice((prev) =>
                                    typeof prev === "object"
                                        ? { ...prev, isYearly: true }
                                        : { value: prev, isYearly: true }
                                );
                            }
                        }}
                        disabled={!isEditing}
                    >
                        Yearly
                    </button>
                </div>
            </div>
            <h2 className="text-lg font-semibold mb-2">{plan}</h2>

            {!isEditing ? (
                <p className="text-2xl font-bold mb-4">
                    ${price}
                    <span className="text-sm font-normal">/month</span>
                </p>
            ) : (
                <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="text-2xl font-bold mb-4 border rounded-lg px-2 py-1 w-full"
                />
            )}

            <ul className="space-y-2 mb-6">
                {features.map((feature, index) => (
                    <li
                        key={index}
                        className={`flex items-center ${index === 0 && highlightFirst
                            ? "text-[#6C63FF] text-lg font-semibold"
                            : "text-gray-700"
                            }`}
                    >
                        <span className="text-green-500 p-1">
                            <FaRegCheckCircle className="w-4 h-4" />
                        </span>
                        {feature}
                    </li>
                ))}
            </ul>

            {!isEditing ? (
                <button
                    className="w-full py-2 rounded-lg bg-gradient-to-b from-[#6C63FF] to-[#3F73BD] text-white font-medium shadow mt-auto"
                    onClick={startEdit}
                >
                    Edit
                </button>
            ) : (
                <div className="flex gap-2 mt-auto">
                    <button
                        className="w-1/2 py-2 rounded-lg bg-gray-300 text-black font-medium shadow"
                        onClick={cancelEdit}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="w-1/2 py-2 rounded-lg bg-gradient-to-b from-[#6C63FF] to-[#3F73BD] text-white font-medium shadow"
                        onClick={saveEdit}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default PricingCard;