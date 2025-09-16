import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
const SubscriptionPlansContext = createContext();

export const useSubscriptionPlans = () => useContext(SubscriptionPlansContext);

export const SubscriptionPlansProvider = ({ children }) => {
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [mostPopularPlan, setMostPopularPlan] = useState(null);
    const [hasFetchedPlans, setHasFetchedPlans] = useState(false);

    useEffect(() => {
        const fetchSubscriptionPlans = async () => {
            if (subscriptionPlans.length > 0) return;
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/getSubscriptionPlansData`, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                // Validate the response data structure
                if (res.data && res.data.plans && Array.isArray(res.data.plans)) {
                    setSubscriptionPlans(res.data.plans);
                    setMostPopularPlan(res.data.mostPopularPlan || null);
                } else {
                    // console.error('Invalid subscription plans data structure:', res.data);
                    Swal.fire({
                        title: "Invalid subscription plans data structure",
                        icon: "error",
                        timer: 1500,
                        showConfirmButton: false,
                        showCancelButton: false,
                    });
                    setSubscriptionPlans([]);
                    setMostPopularPlan(null);
                }
            } catch (error) {
                // console.error('Error fetching subscription plans:', error);
                Swal.fire({
                    title: "Error fetching subscription plans",
                    icon: "error",
                    timer: 1500,
                    showConfirmButton: false,
                    showCancelButton: false,
                });
                setSubscriptionPlans([]);
                setMostPopularPlan(null);
            }
        };
        if (!hasFetchedPlans) {
            fetchSubscriptionPlans();
            setHasFetchedPlans(true);
        }
    }, [subscriptionPlans]);

    return (
        <SubscriptionPlansContext.Provider value={{ subscriptionPlans, setSubscriptionPlans, mostPopularPlan, setMostPopularPlan }}>
            {children}
        </SubscriptionPlansContext.Provider>
    );
};