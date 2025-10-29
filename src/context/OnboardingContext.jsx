import { createContext, useContext, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export const OnboardingContext = createContext();

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error('useOnboarding must be used within OnboardingProvider');
    }
    return context;
};

export const OnboardingProvider = ({ children }) => {
    const location = useLocation();
    const [refs, setRefs] = useState({});

    // Register a ref for a specific step key
    const registerRef = useCallback((key, ref) => {
        if (ref && ref.current) {
            setRefs(prev => ({
                ...prev,
                [key]: ref
            }));
        }
    }, []);

    // Get ref by key
    const getRef = useCallback((key) => {
        return refs[key];
    }, [refs]);

    // Check if a ref exists
    const hasRef = useCallback((key) => {
        const ref = refs[key];
        return ref && ref.current !== null;
    }, [refs]);

    // Get current page path
    const currentPath = location.pathname;

    return (
        <OnboardingContext.Provider value={{
            registerRef,
            getRef,
            hasRef,
            refs,
            currentPath
        }}>
            {children}
        </OnboardingContext.Provider>
    );
};

