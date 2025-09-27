import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const JWTVerifierContext = createContext();

export const useJWTVerifier = () => useContext(JWTVerifierContext);

export const JWTVerifierProvider = ({ children }) => {
    const [isTokenValid, setIsTokenValid] = useState(true);
    const navigate = useNavigate();
    const timeoutRef = useRef(null);

    const scheduleLogout = (expiryTime) => {
        const now = Date.now();
        const delay = expiryTime - now;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            setIsTokenValid(false);
            localStorage.removeItem('token');
            navigate('/login');
        }, delay);
    };

    const verifyAndSchedule = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsTokenValid(false);
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const expiryTime = decodedToken.exp * 1000;
            const now = Date.now();

            if (expiryTime <= now) {
                setIsTokenValid(false);
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            setIsTokenValid(true);
            scheduleLogout(expiryTime);
        } catch (error) {
            setIsTokenValid(false);
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    useEffect(() => {
        // Run on mount
        verifyAndSchedule();

        // Listen for changes to localStorage (e.g. login/logout in another tab)
        const handleStorageChange = (event) => {
            if (event.key === 'token') {
                verifyAndSchedule();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [navigate]);

    return (
        <JWTVerifierContext.Provider value={{ isTokenValid, verifyAndSchedule }}>
            {children}
        </JWTVerifierContext.Provider>
    );
};
