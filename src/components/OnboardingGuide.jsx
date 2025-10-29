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
        console.log(`[OnboardingGuide] getStepsForCurrentPage - Path: ${currentPath}, Total steps defined: ${steps.length}`);

        const availableSteps = steps.filter(step => {
            const hasStepRef = hasRef(step.target);
            console.log(`[OnboardingGuide] Step "${step.target}": hasRef = ${hasStepRef}`);
            return hasStepRef;
        });

        console.log(`[OnboardingGuide] Available steps with refs: ${availableSteps.length}`);

        const mappedSteps = availableSteps.map((step) => {
            const ref = refs[step.target];
            const targetElement = ref?.current;
            console.log(`[OnboardingGuide] Mapping step "${step.target}": ref exists = ${!!ref}, current exists = ${!!targetElement}`);
            return {
                ...step,
                // Convert ref key to actual DOM element for Joyride
                target: targetElement || null,
            };
        }).filter(step => step.target !== null);

        console.log(`[OnboardingGuide] Final steps count: ${mappedSteps.length}`);
        return mappedSteps;
    }, [currentPath, refs, hasRef]);

    // Single unified effect to handle tour initialization - simplified approach
    useEffect(() => {
        console.log(`[OnboardingGuide] Effect triggered - Path: ${currentPath}, UserId: ${userId}, Role: ${role}, OnboardingCompleted: ${onboardingCompleted}`);

        // Wait for userId to load - don't start until we have it
        // But allow the effect to run to prepare for when userId arrives
        if (onboardingCompleted) {
            console.log(`[OnboardingGuide] Early return - onboarding already completed`);
            setRunTour(false);
            setIsReady(false);
            return;
        }

        // If we have userId, validate role
        if (userId && role !== 'company' && role !== 'Editor' && role !== 'Viewer') {
            console.log(`[OnboardingGuide] Early return - invalid role: ${role}`);
            setRunTour(false);
            setIsReady(false);
            return;
        }

        // Continue to set up the checking mechanism even if userId isn't loaded yet
        // This allows the tour to start automatically when both userId and refs are ready
        console.log(`[OnboardingGuide] Proceeding with tour setup (userId will be checked in checkAndStartTour)`);
        console.log(`[OnboardingGuide] Current refs:`, Object.keys(refs));
        console.log(`[OnboardingGuide] RefsUpdateTrigger: ${refsUpdateTrigger}`);

        // Reset state when path changes
        setRunTour(false);
        setIsReady(false);
        setCurrentStepIndex(0);

        // Get steps from pageSteps directly (not from computed function to avoid circular deps)
        const stepsForPage = pageSteps[currentPath] || [];
        console.log(`[OnboardingGuide] Steps for path ${currentPath}: ${stepsForPage.length}`);
        if (stepsForPage.length === 0) {
            console.log(`[OnboardingGuide] No steps defined for this path, returning`);
            // No steps for this page
            return;
        }

        // Use a ref to track if we've started, to avoid dependency issues
        let hasStarted = false;
        let intervalId = null;

        // Function to check and start tour
        const checkAndStartTour = () => {
            // First check if we have userId - if not, wait
            if (!userId) {
                console.log(`[OnboardingGuide] checkAndStartTour: userId still not loaded, waiting...`);
                return false;
            }

            if (hasStarted) {
                console.log(`[OnboardingGuide] checkAndStartTour: Already started, skipping`);
                return true;
            }

            console.log(`[OnboardingGuide] checkAndStartTour: Checking ${stepsForPage.length} steps...`);
            console.log(`[OnboardingGuide] Current refs keys:`, Object.keys(refs));

            // Check refs directly instead of using hasRef callback
            const availableSteps = stepsForPage.filter(step => {
                const ref = refs[step.target];
                const hasRefObj = !!ref;
                const hasCurrent = ref && ref.current !== null && ref.current !== undefined;
                console.log(`[OnboardingGuide] Step "${step.target}": ref exists = ${hasRefObj}, ref.current exists = ${hasCurrent}, ref.current =`, ref?.current);
                return hasCurrent;
            });

            console.log(`[OnboardingGuide] Available steps: ${availableSteps.length}/${stepsForPage.length}`);

            if (availableSteps.length > 0) {
                console.log(`[OnboardingGuide] ✅ Starting tour! Available steps:`, availableSteps.map(s => s.target));
                hasStarted = true;
                setIsReady(true);
                console.log(`[OnboardingGuide] Set isReady = true`);

                // Clear interval if it exists
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }

                // Use a delay to ensure everything is fully rendered
                setTimeout(() => {
                    console.log(`[OnboardingGuide] Setting runTour = true`);
                    setRunTour(true);
                }, 800);
                return true;
            }
            console.log(`[OnboardingGuide] Not enough steps available yet (${availableSteps.length}/${steps.length}), will retry...`);
            return false;
        };

        // Immediate check
        console.log(`[OnboardingGuide] Performing immediate check...`);
        checkAndStartTour();

        // Set up continuous checking every 200ms
        console.log(`[OnboardingGuide] Setting up interval check every 200ms`);
        intervalId = setInterval(() => {
            if (checkAndStartTour()) {
                console.log(`[OnboardingGuide] Tour started, clearing interval`);
                clearInterval(intervalId);
                intervalId = null;
            }
        }, 200);

        // Check on various events as backup
        const checkOnEvent = () => {
            setTimeout(() => {
                checkAndStartTour();
            }, 400);
        };

        // Window load event
        if (document.readyState === 'complete') {
            checkOnEvent();
        } else {
            window.addEventListener('load', checkOnEvent, { once: true });
        }

        // DOMContentLoaded event
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkOnEvent, { once: true });
        } else {
            checkOnEvent();
        }

        // Cleanup after 30 seconds
        const timeoutId = setTimeout(() => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        }, 30000);

        // Cleanup function
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
            clearTimeout(timeoutId);
            window.removeEventListener('load', checkOnEvent);
            document.removeEventListener('DOMContentLoaded', checkOnEvent);
        };
    }, [currentPath, userId, role, onboardingCompleted, refs, refsUpdateTrigger]);

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

    // Don't render if role is explicitly invalid (but wait for userId to load)
    // Only block if we have a userId and the role is invalid
    if (userId && role !== 'company' && role !== 'Editor' && role !== 'Viewer') {
        console.log(`[OnboardingGuide] Not rendering - invalid role: ${role}`);
        return null;
    }

    // Don't render if onboarding is already completed
    if (onboardingCompleted) {
        console.log(`[OnboardingGuide] Not rendering - onboarding already completed`);
        return null;
    }

    // Render Joyride even if no steps yet - it will handle it gracefully
    // But only if we have at least one step available
    if (!steps || steps.length === 0) {
        console.log(`[OnboardingGuide] Not rendering - no steps available (${steps?.length || 0})`);
        // Still render nothing if no steps available
        return null;
    }

    const shouldRun = runTour && isReady && steps.length > 0;
    console.log(`[OnboardingGuide] Render check - userId: ${userId}, runTour: ${runTour}, isReady: ${isReady}, steps: ${steps.length}, shouldRun: ${shouldRun}`);

    return (
        <Joyride
            steps={steps}
            run={shouldRun}
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
