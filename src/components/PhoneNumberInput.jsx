import React from 'react';
import PhoneInput from 'react-phone-input-2';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import 'react-phone-input-2/lib/style.css';

const PhoneNumberInput = ({
    value = '',
    onChange,
    error,
    disabled = false,
    required = false,
    label = 'Phone Number',
    placeholder = 'Enter Your Phone Number',
    className = '',
    inputStyle = {},
    containerStyle = {},
    buttonStyle = {},
    dropdownStyle = {},
    containerClass = '',
    country = 'us',
    enableSearch = true,
    disableCountryCode = false,
    ...props
}) => {
    const handlePhoneChange = (phone) => {
        onChange(phone);
    };

    const defaultInputStyle = {
        width: "100%",
        paddingLeft: "56px",
        height: "40px",
        backgroundColor: "#F0F0F0",
        fontSize: "16px",
        color: "#000000",
        border: "1px solid #D1D5DB",
        borderRadius: "6px",
        boxSizing: "border-box",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "text",
        ...inputStyle
    };

    const defaultContainerStyle = {
        width: "100%",
        ...containerStyle
    };

    const defaultButtonStyle = {
        height: "40px",
        border: "1px solid #D1D5DB",
        borderRadius: "6px 0 0 6px",
        boxSizing: "border-box",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...buttonStyle
    };

    const defaultDropdownStyle = {
        maxHeight: "200px",
        overflowY: "auto",
        zIndex: 99999,
        ...dropdownStyle
    };

    return (
        <div className={`mb-4 ${className}`}>
            <label className="text-[18px] md:text-[24px] font-medium text-[#111827] mb-1 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <PhoneInput
                country={country}
                value={value}
                onChange={handlePhoneChange}
                disabled={disabled}
                enableSearch={enableSearch}
                disableCountryCode={disableCountryCode}
                inputProps={{
                    name: 'phone',
                    required: required,
                    autoFocus: false,
                    placeholder: placeholder,
                    disabled: disabled,
                    ...props
                }}
                inputStyle={defaultInputStyle}
                containerStyle={defaultContainerStyle}
                dropdownStyle={defaultDropdownStyle}
                buttonStyle={defaultButtonStyle}
                containerClass={`w-full mt-1 ${containerClass}`}
            />
            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
        </div>
    );
};

// Export validation function for use in forms
export const validatePhoneNumber = (phone, required = true) => {
    if (!phone || phone.length === 0) {
        return required ? 'Phone number is required' : '';
    }

    try {
        // Clean the phone number by removing common formatting characters
        let cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
        cleanPhone = "+" + cleanPhone;
        const phoneNumber = parsePhoneNumberFromString(cleanPhone);

        if (!phoneNumber) {
            return 'Please enter a phone number';
        }

        if (!phoneNumber.isValid()) {
            return 'Please enter a valid phone number';
        }

        if (phoneNumber.nationalNumber.length < 7 || phoneNumber.nationalNumber.length > 15) {
            return 'Phone number must be between 7-15 digits';
        }

        return '';
    } catch (error) {
        return 'Error: Please enter a valid phone number';
    }
};

export default PhoneNumberInput;
