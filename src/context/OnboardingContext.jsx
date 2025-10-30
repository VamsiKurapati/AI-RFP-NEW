import { createContext, useContext, useState, useCallback } from 'react';
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
    const [refsUpdateTrigger, setRefsUpdateTrigger] = useState(0);

    // Register a ref for a specific step key - register immediately even if current is null
    const registerRef = useCallback((key, ref) => {
        if (ref) {
            setRefs(prev => {
                // Only update if it's a new ref or different
                if (!prev[key] || prev[key] !== ref) {
                    return {
                        ...prev,
                        [key]: ref
                    };
                }
                return prev;
            });
            // Trigger update to re-check refs
            setRefsUpdateTrigger(prev => {
                const newValue = prev + 1;
                return newValue;
            });
        }
    }, []);

    // Get ref by key
    const getRef = useCallback((key) => {
        return refs[key];
    }, [refs]);

    // Check if a ref exists and has a current element
    const hasRef = useCallback((key) => {
        const ref = refs[key];
        const hasRefValue = ref && ref.current !== null && ref.current !== undefined;
        return hasRefValue;
    }, [refs]);

    // Get current page path
    const currentPath = location.pathname;

    return (
        <OnboardingContext.Provider value={{
            registerRef,
            getRef,
            hasRef,
            refs,
            currentPath,
            refsUpdateTrigger
        }}>
            {children}
        </OnboardingContext.Provider>
    );
};

