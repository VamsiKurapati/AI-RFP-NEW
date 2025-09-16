import { createContext, useContext, useState, useEffect, useMemo } from 'react';

export const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [role, setRole] = useState(localStorage.getItem("userRole") || null);
    const [userId, setUserId] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser)._id : null;
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const newRole = localStorage.getItem("userRole");
            const storedUser = localStorage.getItem("user");
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;

            setUserId(parsedUser?._id || null);

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

    const contextValue = useMemo(() => ({ role, setRole, userId, setUserId }), [role, userId]);

    return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};