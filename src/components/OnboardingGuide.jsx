import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Joyride, { STATUS, EVENTS } from 'react-joyride';
import { useUser } from '../context/UserContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useLocation, useNavigate } from 'react-router-dom';

const OnboardingGuide = () => {
    const [runTour, setRunTour] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const { userId, role, onboardingCompleted, setOnboardingCompleted } = useUser();
    const { refs, currentPath, hasRef } = useOnboarding();
    const location = useLocation();
    const navigate = useNavigate();

    // Define steps for different pages
    const pageSteps = {
        '/dashboard': [
            {
                target: 'dashboard-overview',
                content: 'Welcome to your Dashboard! Here you can see all your proposals, upcoming deadlines, and key statistics at a glance.',
                placement: 'bottom',
                title: 'Dashboard Overview',
                disableBeacon: true,
                disableScrolling: false,
            },
            {
                target: 'dashboard-proposals',
                content: 'View and manage all your RFP proposals here. Track their status, deadlines, and progress.',
                placement: 'top',
                title: 'Your Proposals',
                disableBeacon: true,
                disableScrolling: false,
            },
            {
                target: 'dashboard-calendar',
                content: 'Check your calendar for important deadlines and scheduled events. Never miss a proposal deadline!',
                placement: 'left',
                title: 'Calendar View',
                disableBeacon: true,
                disableScrolling: false,
            },
            {
                target: 'dashboard-stats',
                content: 'Quick statistics show your total proposals, in-progress items, submitted proposals, and wins.',
                placement: 'bottom',
                title: 'Key Statistics',
                disableBeacon: true,
                disableScrolling: false,
            },
        ],
        '/company-profile': [
            {
                target: 'profile-overview',
                content: 'Welcome! This is your Company Profile Overview. Here you can see your company information, statistics, and key metrics at a glance.',
                placement: 'bottom',
                title: 'Dashboard Overview',
                disableBeacon: true,
                disableScrolling: false,
            },
            {
                target: 'profile-completion',
                content: 'Keep track of your profile completion percentage. Complete your profile to get better RFP matching results and increase your chances of winning proposals!',
                placement: 'bottom',
                title: 'Profile Completion',
                disableBeacon: true,
                disableScrolling: false,
            },
            {
                target: 'profile-sidebar',
                content: 'Use the sidebar to navigate between different sections: Overview, Team Details, Proposals, Documents, Case Studies, Certificates, and Payment. Click on any section to explore its features.',
                placement: 'right',
                title: 'Navigation',
                disableBeacon: true,
                disableScrolling: false,
            },
            {
                target: 'profile-deadlines',
                content: 'Check upcoming deadlines in the right sidebar to stay on top of your important dates and never miss a proposal deadline! This helps you prioritize your work effectively.',
                placement: 'left',
                title: 'Upcoming Deadlines',
                disableBeacon: true,
                disableScrolling: false,
            },
        ],
        '/discover': [
            {
                target: 'discover-header',
                content: 'Welcome to the Discover page! Here you can find RFPs and Grants that match your company profile. Use filters to narrow down your search.',
                placement: 'bottom',
                title: 'Discover RFPs & Grants',
                disableBeacon: true,
                disableScrolling: false,
            },
            {
                target: 'discover-filters',
                content: 'Use the left sidebar to filter RFPs and Grants by industry, deadline, funding amount, and more. Save your preferred filters for quick access.',
                placement: 'right',
                title: 'Search Filters',
                disableBeacon: true,
                disableScrolling: false,
            },
            {
                target: 'discover-results',
                content: 'Browse through matched RFPs and Grants. Click on any item to view details, save it for later, or start creating a proposal.',
                placement: 'top',
                title: 'RFP & Grant Results',
                disableBeacon: true,
                disableScrolling: false,
            },
            {
                target: 'discover-actions',
                content: 'You can save interesting RFPs, upload your own RFP documents, or generate proposals directly from here.',
                placement: 'bottom',
                title: 'Quick Actions',
                disableBeacon: true,
                disableScrolling: false,
            },
        ],
        '/proposals': [
            {
                target: 'proposals-header',
                content: 'This is your Proposals page where you can manage all your RFP and Grant proposals. Track their status, edit them, and submit them when ready.',
                placement: 'bottom',
                title: 'Proposals Management',
                disableBeacon: true,
                disableScrolling: false,
            },
            {
                target: 'proposals-list',
                content: 'View all your proposals in one place. Filter by status, search by name, and organize them for easy management.',
                placement: 'top',
                title: 'Proposals List',
                disableBeacon: true,
                disableScrolling: false,
            },
            {
                target: 'proposals-actions',
                content: 'Create new proposals, delete old ones, or check compliance. Use the action buttons to manage your proposals efficiently.',
                placement: 'bottom',
                title: 'Proposal Actions',
                disableBeacon: true,
                disableScrolling: false,
            },
        ],
        '/support-ticket': [
            {
                target: 'support-header',
                content: 'Need help? Use the Support Ticket system to contact our team. Create a ticket with your question or issue.',
                placement: 'bottom',
                title: 'Support Center',
                disableBeacon: true,
                disableScrolling: false,
            },
            {
                target: 'support-create',
                content: 'Click here to create a new support ticket. Provide details about your issue or question, and our team will respond quickly.',
                placement: 'bottom',
                title: 'Create Ticket',
                disableBeacon: true,
                disableScrolling: false,
            },
            {
                target: 'support-tickets',
                content: 'View all your previous support tickets and their status. Track responses and updates from our support team.',
                placement: 'top',
                title: 'Ticket History',
                disableBeacon: true,
                disableScrolling: false,
            },
        ],
    };

    // Get steps for current page, filtered by available refs
    const getStepsForCurrentPage = useCallback(() => {
        const steps = pageSteps[currentPath] || [];
        return steps.filter(step => {
            // Check if ref exists for this step
            return hasRef(step.target);
        }).map((step) => {
            const ref = refs[step.target];
            return {
                ...step,
                // Convert ref key to actual DOM element for Joyride
                target: ref?.current || null,
            };
        }).filter(step => step.target !== null);
    }, [currentPath, refs, hasRef]);

    // Wait for all target elements to be available
    const waitForElements = useCallback(() => {
        const maxAttempts = 15;
        let attempts = 0;

        const checkElements = () => {
            const steps = pageSteps[currentPath] || [];
            const allStepsHaveRefs = steps.every(step => {
                return hasRef(step.target);
            });

            if (allStepsHaveRefs || attempts >= maxAttempts) {
                setIsReady(true);
                if (allStepsHaveRefs && !onboardingCompleted && steps.length > 0) {
                    // Additional delay to ensure everything is rendered
                    setTimeout(() => {
                        setRunTour(true);
                    }, 800);
                }
            } else {
                attempts++;
                setTimeout(checkElements, 400);
            }
        };

        checkElements();
    }, [currentPath, hasRef, onboardingCompleted]);

    useEffect(() => {
        // Check if user has completed onboarding
        if (userId && (role === 'company' || role === 'Editor' || role === 'Viewer')) {
            if (!onboardingCompleted) {
                // Reset when path changes
                setRunTour(false);
                setIsReady(false);
                setCurrentStepIndex(0);

                // Wait for page to be fully loaded before checking elements
                if (document.readyState === 'complete') {
                    setTimeout(waitForElements, 500);
                } else {
                    window.addEventListener('load', () => setTimeout(waitForElements, 500));
                    return () => window.removeEventListener('load', waitForElements);
                }
            }
        }
    }, [userId, role, onboardingCompleted, waitForElements, currentPath]);

    const handleJoyrideCallback = useCallback((data) => {
        const { status, type, index } = data;

        if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
            // Mark onboarding as completed
            if (userId) {
                setOnboardingCompleted(true);
            }
            setRunTour(false);
            setCurrentStepIndex(0);
        }

        // Handle step changes
        if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
            setCurrentStepIndex(index);
        }

        // Handle errors gracefully
        if (status === STATUS.ERROR) {
            if (type === EVENTS.STEP_NOT_FOUND || type === EVENTS.TARGET_NOT_FOUND) {
                console.warn(`Tour step ${index} target not found, skipping...`);
                const currentSteps = getStepsForCurrentPage();
                if (index >= currentSteps.length - 1) {
                    if (userId) {
                        setOnboardingCompleted(true);
                    }
                    setRunTour(false);
                }
            }
        }
    }, [userId, setOnboardingCompleted, getStepsForCurrentPage]);

    const steps = useMemo(() => {
        return getStepsForCurrentPage();
    }, [getStepsForCurrentPage]);

    // Don't render if user hasn't loaded or shouldn't see the tour
    if (!userId || (role !== 'company' && role !== 'Editor' && role !== 'Viewer')) {
        return null;
    }

    // Don't render if onboarding is already completed
    if (onboardingCompleted) {
        return null;
    }

    // Don't render if no steps for current page
    if (!steps || steps.length === 0) {
        return null;
    }

    return (
        <Joyride
            steps={steps}
            run={runTour && isReady}
            continuous={true}
            showProgress={true}
            showSkipButton={true}
            scrollToFirstStep={true}
            disableCloseOnEsc={false}
            disableOverlayClose={false}
            callback={handleJoyrideCallback}
            floaterProps={{
                disableAnimation: false,
            }}
            spotlightPadding={5}
            hideCloseButton={false}
            styles={{
                options: {
                    primaryColor: '#2563EB',
                    textColor: '#111827',
                    overlayColor: 'rgba(0, 0, 0, 0.5)',
                    arrowColor: '#2563EB',
                    backgroundColor: '#FFFFFF',
                    zIndex: 10000,
                },
                tooltip: {
                    borderRadius: 8,
                    padding: 20,
                },
                tooltipContainer: {
                    textAlign: 'left',
                },
                buttonNext: {
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    padding: '10px 20px',
                    outline: 'none',
                },
                buttonBack: {
                    color: '#6B7280',
                    marginRight: 10,
                    fontSize: 14,
                    outline: 'none',
                },
                buttonSkip: {
                    color: '#6B7280',
                    fontSize: 14,
                    outline: 'none',
                },
            }}
            locale={{
                back: 'Back',
                close: 'Close',
                last: 'Finish',
                next: 'Next',
                skip: 'Skip Tour',
            }}
        />
    );
};

export default OnboardingGuide;
