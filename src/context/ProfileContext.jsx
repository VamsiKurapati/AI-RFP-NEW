import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const [companyData, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasInitialized, setHasInitialized] = useState(false);

    const { role } = useUser();

    // Fetch company data from backend
    const fetchCompanyData = useCallback(async () => {
        // Only fetch if we haven't initialized yet or if we don't have data or if role is null
        if (role === null || !["company", "Editor", "Viewer"].includes(role) || (hasInitialized && companyData)) {
            return;
        }

        if (role === "company") {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/profile/getProfile`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                const data = {
                    companyName: response.data.companyName,
                    adminName: response.data.adminName,
                    industry: response.data.industry,
                    location: response.data.location,
                    email: response.data.email,
                    phone: response.data.phone,
                    website: response.data.website,
                    linkedIn: response.data.linkedIn,
                    activity: response.data.activity || [],
                    deadlines: response.data.deadlines || [],
                    profile: {
                        bio: response.data.bio,
                        services: response.data.services,
                        awards: response.data.awards,
                        clients: response.data.clients,
                        preferredIndustries: response.data.preferredIndustries
                    },
                    employees: response.data.employees,
                    companyDetails: {
                        "No.of employees": { value: response.data.numberOfEmployees },
                        "Founded": { value: response.data.establishedYear }
                    },
                    caseStudiesList: response.data.caseStudies,
                    certificationsList: response.data.licensesAndCertifications,
                    documentList: response.data.documents,
                    stats: {
                        totalProposals: response.data.totalProposals,
                        wonProposals: response.data.wonProposals,
                        successRate: response.data.successRate,
                        activeProposals: response.data.activeProposals
                    },
                    proposalList: response.data.proposals,
                    logoUrl_1: response.data.logoUrl ? `${import.meta.env.VITE_API_BASE_URL}/profile/getProfileImage/file/${response.data.logoUrl}` : null
                };
                setCompanyData(data);
                setHasInitialized(true);
            } catch (err) {
                setError(err.message);
                setCompanyData(null);
                setHasInitialized(true);
            } finally {
                setLoading(false);
            }
        }

        if (role === "Editor" || role === "Viewer") {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/profile/getCompanyProfile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (res.status === 200) {
                    const data = {
                        companyName: res.data.companyName,
                        adminName: res.data.adminName,
                        industry: res.data.industry,
                        profile: {
                            bio: res.data.bio,
                        },
                        employees: res.data.employees,
                        companyDetails: {
                            "No.of employees": { value: res.data.numberOfEmployees },
                        },
                        caseStudiesList: res.data.caseStudies,
                        proposalList: res.data.proposals,
                    };
                    setCompanyData(data);
                    setHasInitialized(true);
                }
            } catch (error) {
                setError(error.message);
                setCompanyData(null);
                setHasInitialized(true);
            } finally {
                setLoading(false);
            }
        }
    }, [role, hasInitialized, companyData]);

    // Reset state when role changes
    useEffect(() => {
        if (role) {
            setHasInitialized(false);
            setCompanyData(null);
            setError(null);
        }
    }, [role]);

    useEffect(() => {
        fetchCompanyData();
    }, [fetchCompanyData]);

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        companyData,
        loading,
        error,
        refreshProfile: fetchCompanyData
    }), [companyData, loading, error, fetchCompanyData, setCompanyData]);

    return (
        <ProfileContext.Provider value={contextValue}>
            {children}
        </ProfileContext.Provider>
    );
};
