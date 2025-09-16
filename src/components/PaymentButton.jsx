import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdOutlinePayments } from 'react-icons/md';

const PaymentButton = ({
    variant = 'primary',
    size = 'md',
    className = '',
    children = 'Upgrade Plan',
    showIcon = true
}) => {
    const navigate = useNavigate();

    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
        primary: 'bg-gradient-to-r from-[#6C63FF] to-[#8B7CF6] text-white hover:from-[#5A52E8] hover:to-[#7A6CF0] focus:ring-[#6C63FF]',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
        outline: 'border-2 border-[#6C63FF] text-[#6C63FF] hover:bg-[#6C63FF] hover:text-white focus:ring-[#6C63FF]',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
        <button
            onClick={() => navigate('/payment')}
            className={classes}
        >
            {showIcon && <MdOutlinePayments className="w-5 h-5 mr-2" />}
            {children}
        </button>
    );
};

export default PaymentButton;
