import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdOutlinePayments, MdOutlineSecurity, MdOutlineCreditCard } from 'react-icons/md';
import { FaShieldAlt } from 'react-icons/fa';

const PaymentNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        {
            path: '/payment',
            label: 'Payment Plans',
            icon: MdOutlinePayments,
            description: 'View and select subscription plans'
        },
        {
            path: '/payment-demo',
            label: 'Payment Demo',
            icon: MdOutlineCreditCard,
            description: 'Explore payment button variants'
        }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center mb-4">
                <FaShieldAlt className="w-5 h-5 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Payment Center</h3>
            </div>

            <div className="space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${isActive(item.path)
                                    ? 'border-[#6C63FF] bg-[#6C63FF] text-white'
                                    : 'border-gray-200 hover:border-[#6C63FF] hover:bg-[#6C63FF] hover:text-white'
                                }`}
                        >
                            <div className="flex items-center">
                                <Icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-white' : 'text-gray-500'
                                    }`} />
                                <div>
                                    <div className="font-medium">{item.label}</div>
                                    <div className={`text-sm ${isActive(item.path) ? 'text-white opacity-90' : 'text-gray-500'
                                        }`}>
                                        {item.description}
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                    <MdOutlineSecurity className="w-4 h-4 mr-2" />
                    <span>Secure payment processing with Stripe</span>
                </div>
            </div>
        </div>
    );
};

export default PaymentNavigation;
