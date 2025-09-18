import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';

const EmployeeProfileContext = createContext();

export const useEmployeeProfile = () => useContext(EmployeeProfileContext);

export const EmployeeProfileProvider = ({ children }) => {
    const [employeeData, setEmployeeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [proposalsInProgress, setProposalsInProgress] = useState([]);
    const [completedProposals, setCompletedProposals] = useState([]);
    const [hasInitializedProposals, setHasInitializedProposals] = useState(false);
    const [hasInitializedEmployeeData, setHasInitializedEmployeeData] = useState(false);
    const { role } = useUser();

    const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/profile`;

    const fetchProposals = useCallback(async () => {
        // Only fetch if we haven't initialized yet or if we don't have proposals data or if role is null
        if (role === null || ["SuperAdmin", "company"].includes(role) || (hasInitializedProposals && proposalsInProgress.length > 0)) {
            return;
        }

        try {
            const res = await axios.get(`${baseUrl}/getProposals`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = res.data;

            const proposalsInProgress = data.filter(proposal => proposal.status === "In Progress");
            const completedProposals = data.filter(proposal => proposal.status !== "In Progress");
            setProposalsInProgress(proposalsInProgress);
            setCompletedProposals(completedProposals);
            setHasInitializedProposals(true);
        } catch (err) {
            setError(err.message);
            const proposals = [];
            const proposalsInProgress = proposals.filter(proposal => proposal.status === "In Progress");
            const completedProposals = proposals.filter(proposal => proposal.status !== "In Progress");
            setProposalsInProgress(proposalsInProgress);
            setCompletedProposals(completedProposals);
            setHasInitializedProposals(true);
        } finally {
            setLoading(false);
        }
    }, [role, hasInitializedProposals, proposalsInProgress.length]);

    useEffect(() => {
        fetchProposals();
    }, [fetchProposals]);

    const refreshProposals = fetchProposals;

    // Fetch employee data from backend
    const fetchEmployeeData = useCallback(async () => {
        // Only fetch if we haven't initialized yet or if we don't have data or if role is null
        if (role === null || ["SuperAdmin", "company"].includes(role) || (hasInitializedEmployeeData && employeeData)) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${baseUrl}/getEmployeeProfile`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = {
                name: response.data.name,
                jobTitle: response.data.jobTitle,
                accessLevel: response.data.accessLevel,
                companyName: response.data.companyName,
                location: response.data.location,
                highestQualification: response.data.highestQualification,
                skills: response.data.skills,
                email: response.data.email,
                phone: response.data.phone,
                logoUrl_1: response.data.logoUrl ? `${baseUrl}/getProfileImage/file/${response.data.logoUrl}` : null
            };
            setEmployeeData(data);
            setHasInitializedEmployeeData(true);
        } catch (err) {
            setError(err.message);
            setEmployeeData(null);
            setHasInitializedEmployeeData(true);
        } finally {
            setLoading(false);
        }
    }, [role, hasInitializedEmployeeData, employeeData]);

    useEffect(() => {
        fetchEmployeeData();
    }, [fetchEmployeeData]);

    // Reset state when role changes
    useEffect(() => {
        setHasInitializedEmployeeData(false);
        setHasInitializedProposals(false);
        setProposalsInProgress([]);
        setCompletedProposals([]);
        setEmployeeData(null);
        setError(null);
    }, [role]);

    const refreshEmployeeProfile = fetchEmployeeData;

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        employeeData,
        loading,
        error,
        refreshEmployeeProfile,
        proposalsInProgress,
        completedProposals,
        refreshProposals
    }), [employeeData, loading, error, refreshEmployeeProfile, proposalsInProgress, completedProposals, refreshProposals]);

    return (
        <EmployeeProfileContext.Provider value={contextValue}>
            {children}
        </EmployeeProfileContext.Provider>
    );
};