import { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
            console.log(`[OnboardingContext] registerRef called for "${key}" - ref exists: ${!!ref}, ref.current: ${!!ref?.current}`);
            setRefs(prev => {
                // Only update if it's a new ref or different
                if (!prev[key] || prev[key] !== ref) {
                    console.log(`[OnboardingContext] Adding/updating ref for "${key}"`);
                    return {
                        ...prev,
                        [key]: ref
                    };
                }
                console.log(`[OnboardingContext] Ref "${key}" already registered, skipping update`);
                return prev;
            });
            // Trigger update to re-check refs
            setRefsUpdateTrigger(prev => {
                const newValue = prev + 1;
                console.log(`[OnboardingContext] RefsUpdateTrigger: ${prev} -> ${newValue}`);
                return newValue;
            });
        } else {
            console.log(`[OnboardingContext] registerRef called for "${key}" but ref is null/undefined`);
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
        console.log(`[OnboardingContext] hasRef("${key}") = ${hasRefValue} (ref exists: ${!!ref}, current exists: ${!!ref?.current})`);
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

