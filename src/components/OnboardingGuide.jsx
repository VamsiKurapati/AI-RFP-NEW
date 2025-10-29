import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useUser } from '../context/UserContext';

const OnboardingGuide = () => {
    const [runTour, setRunTour] = useState(false);
    const { userId, role, onboardingCompleted, setOnboardingCompleted } = useUser();

    useEffect(() => {
        // Check if user has completed onboarding
        if (userId && (role === 'company' || role === 'Editor' || role === 'Viewer')) {
            if (!onboardingCompleted) {
                // Delay tour start to ensure page is fully loaded
                const timer = setTimeout(() => {
                    setRunTour(true);
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [userId, role, onboardingCompleted, setOnboardingCompleted]);

    const steps = [
        {
            target: '[data-tour="overview-section"]',
            content: 'Welcome! This is your Company Dashboard Overview. Here you can see your company information, statistics, and key metrics.',
            placement: 'bottom',
            title: 'Dashboard Overview',
            disableBeacon: true,
        },
        {
            target: '[data-tour="profile-completion"]',
            content: 'Keep track of your profile completion percentage. Complete your profile to get better RFP matching results!',
            placement: 'bottom',
            title: 'Profile Completion',
            disableBeacon: true,
        },
        {
            target: '[data-tour="sidebar-navigation"]',
            content: 'Use the sidebar to navigate between different sections: Overview, Team Details, Proposals, Documents, Case Studies, Certificates, and Payment.',
            placement: 'right',
            title: 'Navigation',
            disableBeacon: true,
        },
        {
            target: 'body',
            content: 'You can explore other sections like Team Details, Proposals, and Documents using the sidebar navigation. Each section helps you manage different aspects of your RFP process.',
            placement: 'center',
            title: 'Explore Sections',
            disableOverlayClose: true,
        },
        {
            target: '[data-tour="deadlines-section"]',
            content: 'Check upcoming deadlines in the right sidebar to stay on top of your important dates and never miss a proposal deadline!',
            placement: 'left',
            title: 'Upcoming Deadlines',
            disableBeacon: true,
        },
    ];

    const handleJoyrideCallback = (data) => {
        const { status, type } = data;

        if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
            // Mark onboarding as completed
            if (userId) {
                setOnboardingCompleted(true);
            }
            setRunTour(false);
        }
    };

    // Don't render if user hasn't loaded or shouldn't see the tour
    if (!userId || (role !== 'company' && role !== 'Editor' && role !== 'Viewer')) {
        return null;
    }

    return (
        <Joyride
            steps={steps}
            run={runTour}
            continuous={true}
            showProgress={true}
            showSkipButton={true}
            scrollToFirstStep={true}
            disableCloseOnEsc={false}
            disableOverlayClose={false}
            callback={handleJoyrideCallback}
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
                buttonNext: {
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    padding: '10px 20px',
                },
                buttonBack: {
                    color: '#6B7280',
                    marginRight: 10,
                    fontSize: 14,
                },
                buttonSkip: {
                    color: '#6B7280',
                    fontSize: 14,
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

