import React, { useState, useEffect, useCallback } from 'react';
import Joyride, { STATUS, EVENTS } from 'react-joyride';
import { useUser } from '../context/UserContext';

const OnboardingGuide = () => {
    const [runTour, setRunTour] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const { userId, role, onboardingCompleted, setOnboardingCompleted } = useUser();

    // Helper function to check if an element exists
    const checkElementExists = (selector) => {
        try {
            return document.querySelector(selector) !== null;
        } catch (error) {
            return false;
        }
    };

    // Wait for all target elements to be available
    const waitForElements = useCallback(() => {
        const maxAttempts = 10;
        let attempts = 0;

        const checkElements = () => {
            const targets = [
                '[data-tour="overview-section"]',
                '[data-tour="profile-completion"]',
                '[data-tour="sidebar-navigation"]',
                '[data-tour="deadlines-section"]'
            ];

            const allExist = targets.every(target => checkElementExists(target));

            if (allExist || attempts >= maxAttempts) {
                setIsReady(true);
                if (allExist && !onboardingCompleted) {
                    // Additional delay to ensure everything is rendered
                    setTimeout(() => {
                        setRunTour(true);
                    }, 500);
                }
            } else {
                attempts++;
                setTimeout(checkElements, 300);
            }
        };

        checkElements();
    }, [onboardingCompleted]);

    useEffect(() => {
        // Check if user has completed onboarding
        if (userId && (role === 'company' || role === 'Editor' || role === 'Viewer')) {
            if (!onboardingCompleted) {
                // Wait for page to be fully loaded before checking elements
                if (document.readyState === 'complete') {
                    waitForElements();
                } else {
                    window.addEventListener('load', waitForElements);
                    return () => window.removeEventListener('load', waitForElements);
                }
            }
        }
    }, [userId, role, onboardingCompleted, waitForElements]);

    const steps = [
        {
            target: '[data-tour="overview-section"]',
            content: 'Welcome! This is your Company Dashboard Overview. Here you can see your company information, statistics, and key metrics at a glance.',
            placement: 'bottom',
            title: 'Dashboard Overview',
            disableBeacon: true,
            disableScrolling: false,
            spotlightClicks: false,
        },
        {
            target: '[data-tour="profile-completion"]',
            content: 'Keep track of your profile completion percentage. Complete your profile to get better RFP matching results and increase your chances of winning proposals!',
            placement: 'bottom',
            title: 'Profile Completion',
            disableBeacon: true,
            disableScrolling: false,
            spotlightClicks: false,
        },
        {
            target: '[data-tour="sidebar-navigation"]',
            content: 'Use the sidebar to navigate between different sections: Overview, Team Details, Proposals, Documents, Case Studies, Certificates, and Payment. Click on any section to explore its features.',
            placement: 'right',
            title: 'Navigation',
            disableBeacon: true,
            disableScrolling: false,
            spotlightClicks: false,
        },
        {
            target: '[data-tour="deadlines-section"]',
            content: 'Check upcoming deadlines in the right sidebar to stay on top of your important dates and never miss a proposal deadline! This helps you prioritize your work effectively.',
            placement: 'left',
            title: 'Upcoming Deadlines',
            disableBeacon: true,
            disableScrolling: false,
            spotlightClicks: false,
        },
    ];

    const handleJoyrideCallback = useCallback((data) => {
        const { status, type, index } = data;

        if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
            // Mark onboarding as completed
            if (userId) {
                setOnboardingCompleted(true);
            }
            setRunTour(false);
        }

        // Handle errors gracefully
        if (status === STATUS.ERROR) {
            // If a step fails, try to continue or skip it
            if (type === EVENTS.STEP_NOT_FOUND || type === EVENTS.TARGET_NOT_FOUND) {
                console.warn(`Tour step ${index} target not found, skipping...`);
                // If it's the last step or we can't continue, finish the tour
                if (index >= steps.length - 1) {
                    if (userId) {
                        setOnboardingCompleted(true);
                    }
                    setRunTour(false);
                }
            }
        }
    }, [userId, setOnboardingCompleted]);

    // Don't render if user hasn't loaded or shouldn't see the tour
    if (!userId || (role !== 'company' && role !== 'Editor' && role !== 'Viewer')) {
        return null;
    }

    // Don't render if onboarding is already completed
    if (onboardingCompleted) {
        return null;
    }

    // Filter steps to only include those with existing targets
    const validSteps = steps.filter(step => {
        if (step.target === 'body') return true;
        return checkElementExists(step.target);
    });

    // If no valid steps, don't show tour
    if (validSteps.length === 0 && isReady) {
        // If we're ready but no steps are valid, mark onboarding as complete
        if (userId) {
            setOnboardingCompleted(true);
        }
        return null;
    }

    return (
        <Joyride
            steps={validSteps.length > 0 ? validSteps : steps}
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

