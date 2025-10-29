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
    const { refs, currentPath, hasRef, refsUpdateTrigger } = useOnboarding();
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
                scrollOffset: 80,
            },
            {
                target: 'dashboard-proposals',
                content: 'View and manage all your RFP proposals here. Track their status, deadlines, and progress.',
                placement: 'top',
                title: 'Your Proposals',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
            },
            {
                target: 'dashboard-calendar',
                content: 'Check your calendar for important deadlines and scheduled events. Never miss a proposal deadline!',
                placement: 'left',
                title: 'Calendar View',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
            },
            {
                target: 'dashboard-stats',
                content: 'Quick statistics show your total proposals, in-progress items, submitted proposals, and wins.',
                placement: 'bottom',
                title: 'Key Statistics',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
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
                scrollOffset: 80,
            },
            {
                target: 'profile-completion',
                content: 'Keep track of your profile completion percentage. Complete your profile to get better RFP matching results and increase your chances of winning proposals!',
                placement: 'bottom',
                title: 'Profile Completion',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
            },
            {
                target: 'profile-sidebar',
                content: 'Use the sidebar to navigate between different sections: Overview, Team Details, Proposals, Documents, Case Studies, Certificates, and Payment. Click on any section to explore its features.',
                placement: 'right',
                title: 'Navigation',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
            },
            {
                target: 'profile-deadlines',
                content: 'Check upcoming deadlines in the right sidebar to stay on top of your important dates and never miss a proposal deadline! This helps you prioritize your work effectively.',
                placement: 'left',
                title: 'Upcoming Deadlines',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
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
                scrollOffset: 80,
            },
            {
                target: 'discover-filters',
                content: 'Use the left sidebar to filter RFPs and Grants by industry, deadline, funding amount, and more. Save your preferred filters for quick access.',
                placement: 'right',
                title: 'Search Filters',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
            },
            {
                target: 'discover-results',
                content: 'Browse through matched RFPs and Grants. Click on any item to view details, save it for later, or start creating a proposal.',
                placement: 'top',
                title: 'RFP & Grant Results',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
            },
            {
                target: 'discover-actions',
                content: 'You can save interesting RFPs, upload your own RFP documents, or generate proposals directly from here.',
                placement: 'bottom',
                title: 'Quick Actions',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
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
                scrollOffset: 80,
            },
            {
                target: 'proposals-list',
                content: 'View all your proposals in one place. Filter by status, search by name, and organize them for easy management.',
                placement: 'top',
                title: 'Proposals List',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
            },
            {
                target: 'proposals-actions',
                content: 'Create new proposals, delete old ones, or check compliance. Use the action buttons to manage your proposals efficiently.',
                placement: 'bottom',
                title: 'Proposal Actions',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
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
                scrollOffset: 80,
            },
            {
                target: 'support-create',
                content: 'Click here to create a new support ticket. Provide details about your issue or question, and our team will respond quickly.',
                placement: 'bottom',
                title: 'Create Ticket',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
            },
            {
                target: 'support-tickets',
                content: 'View all your previous support tickets and their status. Track responses and updates from our support team.',
                placement: 'top',
                title: 'Ticket History',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
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

    // Wait for target elements to be available - start tour with available steps
    const waitForElements = useCallback(() => {
        const maxAttempts = 30;
        let attempts = 0;

        const checkElements = () => {
            const steps = pageSteps[currentPath] || [];

            if (steps.length === 0) {
                // No steps for this page, no need to wait
                return;
            }

            // Check if at least one step has a ref with a current element (i.e., available)
            const availableSteps = steps.filter(step => hasRef(step.target));

            // Start tour if we have at least one available step, or if we've tried enough times
            const shouldStart = availableSteps.length > 0 || attempts >= maxAttempts;

            if (shouldStart) {
                setIsReady(true);
                if (availableSteps.length > 0 && !onboardingCompleted) {
                    // Start the tour with a small delay to ensure DOM is ready
                    setTimeout(() => {
                        setRunTour(true);
                    }, 500);
                }
            } else {
                attempts++;
                // Check more frequently in the beginning
                const delay = attempts < 10 ? 150 : attempts < 20 ? 300 : 500;
                setTimeout(checkElements, delay);
            }
        };

        // Start checking immediately
        checkElements();
    }, [currentPath, hasRef, onboardingCompleted]);

    // Main effect to start the tour - runs when path changes or refs update
    useEffect(() => {
        // Check if user should see onboarding
        if (!userId || (role !== 'company' && role !== 'Editor' && role !== 'Viewer')) {
            return;
        }

        // Check if onboarding already completed
        if (onboardingCompleted) {
            return;
        }

        // Reset state when path changes
        setRunTour(false);
        setIsReady(false);
        setCurrentStepIndex(0);

        // Start checking for elements
        waitForElements();
    }, [currentPath, userId, role, onboardingCompleted, waitForElements]);

    // Trigger when refs are updated
    useEffect(() => {
        if (!userId || (role !== 'company' && role !== 'Editor' && role !== 'Viewer') || onboardingCompleted) {
            return;
        }

        if (refsUpdateTrigger > 0) {
            const timer = setTimeout(() => {
                waitForElements();
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [refsUpdateTrigger, userId, role, onboardingCompleted, waitForElements]);

    // Continuous check for refs availability - more aggressive and persistent
    useEffect(() => {
        if (!userId || (role !== 'company' && role !== 'Editor' && role !== 'Viewer') || onboardingCompleted) {
            return;
        }

        let attempts = 0;
        const maxAttempts = 80; // Check for 20 seconds (80 * 250ms)

        // Continuous interval check for refs becoming available
        const checkInterval = setInterval(() => {
            attempts++;
            const steps = pageSteps[currentPath] || [];

            if (steps.length > 0) {
                const availableSteps = steps.filter(step => hasRef(step.target));

                if (availableSteps.length > 0) {
                    setIsReady((ready) => {
                        if (!ready) {
                            // Small delay to ensure DOM is settled, then start tour
                            setTimeout(() => {
                                setRunTour(true);
                            }, 300);
                            return true;
                        }
                        return ready;
                    });

                    // Stop checking once we've started
                    clearInterval(checkInterval);
                }
            }

            // Stop after max attempts
            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
            }
        }, 250);

        // Also listen to window load event as backup
        const handleLoad = () => {
            setTimeout(() => {
                const steps = pageSteps[currentPath] || [];
                if (steps.length > 0) {
                    const availableSteps = steps.filter(step => hasRef(step.target));
                    if (availableSteps.length > 0 && !isReady) {
                        setIsReady(true);
                        setTimeout(() => {
                            setRunTour(true);
                        }, 500);
                    }
                }
            }, 300);
        };

        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad);
        }

        // Clean up after 25 seconds
        const timeout = setTimeout(() => {
            clearInterval(checkInterval);
        }, 25000);

        return () => {
            clearInterval(checkInterval);
            clearTimeout(timeout);
            window.removeEventListener('load', handleLoad);
        };
    }, [currentPath, userId, role, onboardingCompleted, hasRef, isReady]);

    const handleJoyrideCallback = useCallback((data) => {
        const { status, type, index, step } = data;

        // Scroll to the top of the target element before showing each step
        if (type === EVENTS.STEP_BEFORE) {
            if (step && step.target) {
                // Wait a bit to ensure the element is rendered and Joyride has processed it
                setTimeout(() => {
                    const element = step.target;
                    // Check if it's a DOM element
                    if (element && element.nodeType === 1 && typeof element.scrollIntoView === 'function') {
                        try {
                            // Get element's position
                            const rect = element.getBoundingClientRect();
                            const scrollY = window.scrollY || window.pageYOffset || 0;
                            const elementTop = rect.top + scrollY;
                            const offset = 80; // Offset for fixed navbar/header

                            // Scroll to position with offset
                            window.scrollTo({
                                top: Math.max(0, elementTop - offset),
                                behavior: 'smooth'
                            });
                        } catch (error) {
                            // Fallback to simple scrollIntoView if getBoundingClientRect fails
                            element.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                                inline: 'nearest'
                            });
                            // Apply offset after scrollIntoView
                            setTimeout(() => {
                                const scrollY = window.scrollY || window.pageYOffset || 0;
                                const offset = 80;
                                window.scrollTo({
                                    top: Math.max(0, scrollY - offset),
                                    behavior: 'smooth'
                                });
                            }, 100);
                        }
                    }
                }, 150);
            }
        }

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

    // Render Joyride even if no steps yet - it will handle it gracefully
    // But only if we have at least one step available
    if (!steps || steps.length === 0) {
        // Still render nothing if no steps available
        return null;
    }

    return (
        <Joyride
            steps={steps}
            run={runTour && isReady && steps.length > 0}
            continuous={true}
            showProgress={true}
            showSkipButton={true}
            scrollToFirstStep={true}
            scrollOffset={80}
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
