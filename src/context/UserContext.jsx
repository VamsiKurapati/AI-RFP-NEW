import { createContext, useContext, useState, useEffect, useMemo } from 'react';

export const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [role, setRole] = useState(localStorage.getItem("userRole") || null);
    const [userId, setUserId] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser)._id : null;
    });
    const [onboardingCompleted, setOnboardingCompletedState] = useState(() => {
        const storedUser = localStorage.getItem("user");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        return parsedUser?.onboarding_status || false;
    });

    const setOnboardingCompleted = (value) => {
        setOnboardingCompletedState(value);
        // Persist to localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                parsedUser.onboarding_status = value;
                localStorage.setItem("user", JSON.stringify(parsedUser));
            } catch (error) {
                console.error("Error updating onboarding status:", error);
            }
        }
    };

    useEffect(() => {
        const handleStorageChange = () => {
            const newRole = localStorage.getItem("userRole");
            const storedUser = localStorage.getItem("user");
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;

            setUserId(parsedUser?._id || null);

            // Update onboarding status from localStorage
            if (parsedUser) {
                setOnboardingCompletedState(parsedUser.onboarding_status || false);
            }

            if (newRole !== role) {
                setRole(newRole);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleStorageChange);
        };
    }, [role]);

    const contextValue = useMemo(() => ({ role, setRole, userId, setUserId, onboardingCompleted, setOnboardingCompleted }), [role, userId, onboardingCompleted]);

    return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};