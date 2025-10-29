import React, { useState, useRef, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';

const libraries = ['places'];

const LocationInput = ({
    id,
    label,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    placeholder = "E.g., San Francisco, CA",
    className = ""
}) => {
    const [inputValue, setInputValue] = useState(value || '');
    const autocompleteRef = useRef(null);
    const inputRef = useRef(null);

    // Get API key from environment variable
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: apiKey || '',
        libraries,
    });

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    useEffect(() => {
        if (!isLoaded || !inputRef.current || loadError || !apiKey || !window.google?.maps?.places) {
            return;
        }

        // Initialize autocomplete
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ['geocode', 'establishment'],
            fields: ['formatted_address', 'name', 'geometry', 'address_components'],
        });

        autocompleteRef.current = autocomplete;

        // Handle place selection
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
                const selectedLocation = place.formatted_address;
                setInputValue(selectedLocation);
                onChange({ target: { value: selectedLocation } });
            } else if (place.name) {
                const selectedLocation = place.name;
                setInputValue(selectedLocation);
                onChange({ target: { value: selectedLocation } });
            }
        });

        return () => {
            if (autocompleteRef.current && window.google?.maps?.event) {
                window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
            }
        };
    }, [isLoaded, loadError, apiKey, onChange]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(e);
    };

    // If API key is not available, show regular input
    if (!apiKey || loadError) {
        return (
            <div className={`mb-4 ${className}`}>
                <label htmlFor={id} className="text-[18px] md:text-[24px] font-medium text-[#111827]">
                    {label} {required && "*"}
                </label>
                <input
                    id={id}
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    required={required}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={`w-full border rounded-md mt-1 p-2 bg-[#F0F0F0] ${error ? "border-red-500" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
                {!apiKey && (
                    <div className="text-yellow-600 text-xs mt-1">
                        ℹ️ Google Maps API key not configured. Location autocomplete is disabled.
                    </div>
                )}
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className={`mb-4 ${className}`}>
                <label htmlFor={id} className="text-[18px] md:text-[24px] font-medium text-[#111827]">
                    {label} {required && "*"}
                </label>
                <input
                    id={id}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    required={required}
                    disabled={true}
                    placeholder="Loading Google Maps..."
                    className="w-full border rounded-md mt-1 p-2 bg-[#F0F0F0] opacity-50 cursor-not-allowed"
                />
            </div>
        );
    }

    return (
        <div className={`mb-4 ${className}`}>
            <label htmlFor={id} className="text-[18px] md:text-[24px] font-medium text-[#111827]">
                {label} {required && "*"}
            </label>
            <input
                id={id}
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                required={required}
                disabled={disabled}
                placeholder={placeholder}
                className={`w-full border rounded-md mt-1 p-2 bg-[#F0F0F0] ${error ? "border-red-500" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
        </div>
    );
};

export default LocationInput;

