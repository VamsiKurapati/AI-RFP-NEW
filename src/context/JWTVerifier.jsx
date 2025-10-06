import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

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
            Swal.fire({
                title: 'Token Expired',
                text: 'Please login again',
                confirmButtonColor: '#2563EB'
            })
            setTimeout(() => {
                navigate('/login');
            }, 2000);
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
                Swal.fire({
                    title: 'Token Expired',
                    text: 'Please login again',
                    confirmButtonColor: '#2563EB'
                })
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
                return;
            }

            setIsTokenValid(true);
            scheduleLogout(expiryTime);
        } catch (error) {
            setIsTokenValid(false);
            localStorage.removeItem('token');
            Swal.fire({
                title: 'Error',
                text: 'Please login again',
                confirmButtonColor: '#2563EB'
            })
            setTimeout(() => {
                navigate('/login');
            }, 2000);
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
        <JWTVerifierContext.Provider value={{ isTokenValid, setIsTokenValid, verifyAndSchedule }}>
            {children}
        </JWTVerifierContext.Provider>
    );
};
