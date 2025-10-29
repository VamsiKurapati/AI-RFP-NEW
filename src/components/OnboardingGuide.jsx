import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

    // Use a ref to store the latest refs so we can access them in closures without stale values
    const refsRef = useRef(refs);
    useEffect(() => {
        refsRef.current = refs;
    }, [refs]);

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

        // Get steps from pageSteps - check both currentPath and location.pathname
        const contextPathSteps = pageSteps[currentPath] || [];
        const locationPathSteps = pageSteps[location.pathname] || [];
        const stepsForPage = locationPathSteps.length > 0 ? locationPathSteps : contextPathSteps;

        console.log(`[OnboardingGuide] Steps check - contextPath=${currentPath} (${contextPathSteps.length} steps), locationPath=${location.pathname} (${locationPathSteps.length} steps)`);
        console.log(`[OnboardingGuide] Available page paths:`, Object.keys(pageSteps));
        console.log(`[OnboardingGuide] Using ${stepsForPage.length} steps for path: ${location.pathname}`);

        if (stepsForPage.length === 0) {
            console.log(`[OnboardingGuide] ⚠️ No steps defined for paths ${currentPath} or ${location.pathname}, returning`);
            return;
        }

        let intervalId = null;
        let observer = null;
        let hasStartedLocally = false;

        // Function to check and start tour - reads fresh refs from closure/state
        const checkAndStartTour = () => {
            // Must have userId
            if (!userId) {
                return false;
            }

            // Check if already started (use state to avoid stale closure)
            if (hasStartedLocally || runTour) {
                return true;
            }

            // Read fresh refs from refsRef to avoid stale closures
            const currentRefs = refsRef.current;

            // Use location.pathname as source of truth for current path
            const actualPath = location.pathname;
            const stepsForCurrentPage = pageSteps[actualPath] || [];

            // Also check currentPath from context in case they differ
            if (stepsForCurrentPage.length === 0 && actualPath !== currentPath) {
                console.log(`[OnboardingGuide] WARNING: Path mismatch - location.pathname=${actualPath}, currentPath=${currentPath}`);
                const stepsFromContext = pageSteps[currentPath] || [];
                if (stepsFromContext.length > 0) {
                    console.log(`[OnboardingGuide] Using steps from context path instead`);
                    stepsForCurrentPage.push(...stepsFromContext);
                }
            }

            console.log(`[OnboardingGuide] checkAndStartTour: actualPath=${actualPath}, contextPath=${currentPath}, Steps=${stepsForCurrentPage.length}...`);
            console.log(`[OnboardingGuide] All registered ref keys:`, Object.keys(currentRefs));

            // Check each step's ref using fresh refs
            let availableCount = 0;
            const availableStepsList = [];
            stepsForCurrentPage.forEach(step => {
                const ref = currentRefs[step.target];
                const hasRefObj = !!ref;
                const hasCurrent = ref && ref.current !== null && ref.current !== undefined;

                // Also verify element is actually in the DOM and visible
                let isInDOM = false;
                let isVisible = false;
                if (hasCurrent) {
                    isInDOM = document.body.contains(ref.current);
                    const rect = ref.current.getBoundingClientRect();
                    isVisible = rect.width > 0 || rect.height > 0;
                }

                console.log(`[OnboardingGuide] Step "${step.target}": ref=${hasRefObj}, current=${hasCurrent}, inDOM=${isInDOM}, visible=${isVisible}`);

                if (hasCurrent && isInDOM && isVisible) {
                    availableCount++;
                    availableStepsList.push(step.target);
                } else if (hasCurrent && !isInDOM) {
                    console.log(`[OnboardingGuide] ⚠️ Step "${step.target}" has ref.current but element not in DOM!`);
                } else if (hasCurrent && isInDOM && !isVisible) {
                    console.log(`[OnboardingGuide] ⚠️ Step "${step.target}" is in DOM but has zero dimensions!`);
                }
            });

            if (availableCount > 0) {
                console.log(`[OnboardingGuide] Available steps list:`, availableStepsList);
            }

            console.log(`[OnboardingGuide] Available steps: ${availableCount}/${stepsForCurrentPage.length}`);

            // Start tour if we have at least one available step
            if (availableCount > 0 && !hasStartedLocally) {
                console.log(`[OnboardingGuide] ✅✅✅ STARTING TOUR! ${availableCount} steps ready`);
                hasStartedLocally = true;
                setIsReady(true);

                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
                if (observer) {
                    observer.disconnect();
                    observer = null;
                }

                setTimeout(() => {
                    console.log(`[OnboardingGuide] 🚀 Setting runTour = true`);
                    setRunTour(true);
                }, 500);

                return true;
            }

            if (availableCount === 0) {
                console.log(`[OnboardingGuide] Waiting for refs... (0/${stepsForCurrentPage.length} ready)`);
            }
            return false;
        };

        // Immediate check
        console.log(`[OnboardingGuide] Performing immediate check...`);
        checkAndStartTour();

        // Set up VERY aggressive checking - every 100ms for up to 60 seconds
        console.log(`[OnboardingGuide] Setting up aggressive interval check every 100ms`);
        let checkCount = 0;
        const maxChecks = 600; // 60 seconds

        intervalId = setInterval(() => {
            checkCount++;
            if (checkAndStartTour()) {
                console.log(`[OnboardingGuide] Tour started, clearing interval`);
                clearInterval(intervalId);
                intervalId = null;
                return;
            }
            if (checkCount >= maxChecks) {
                console.log(`[OnboardingGuide] Max checks reached (${maxChecks}), stopping`);
                clearInterval(intervalId);
                intervalId = null;
            }
        }, 100);

        // Use MutationObserver to watch for DOM changes - catches when refs get populated
        observer = new MutationObserver(() => {
            if (!hasStartedLocally && !runTour) {
                setTimeout(() => {
                    checkAndStartTour();
                }, 100);
            }
        });

        // Start observing immediately if body exists
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style'] // Watch for class/style changes that might indicate rendering
            });
            console.log(`[OnboardingGuide] MutationObserver started on document.body`);
        }

        // Also set up observer when document becomes ready
        const setupObserver = () => {
            if (document.body && observer) {
                try {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: ['class', 'style']
                    });
                    console.log(`[OnboardingGuide] MutationObserver set up on document.body`);
                } catch (e) {
                    console.warn(`[OnboardingGuide] Error setting up observer:`, e);
                }
            }
        };

        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setupObserver();
        } else {
            const onReady = () => {
                setupObserver();
                setTimeout(checkAndStartTour, 200);
            };
            window.addEventListener('load', onReady, { once: true });
            document.addEventListener('DOMContentLoaded', onReady, { once: true });
        }

        // Cleanup after 60 seconds
        const timeoutId = setTimeout(() => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            observer.disconnect();
        }, 60000);

        // Cleanup function
        return () => {
            console.log(`[OnboardingGuide] Cleaning up effect for path: ${currentPath}`);
            hasStartedLocally = false;
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            clearTimeout(timeoutId);
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        };
    }, [currentPath, userId, role, onboardingCompleted, refsUpdateTrigger, location.pathname]);

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

    // Compute steps for rendering
    const steps = useMemo(() => {
        return getStepsForCurrentPage();
    }, [getStepsForCurrentPage]);

    // Don't render if role is invalid (when userId is available)
    if (userId && role !== 'company' && role !== 'Editor' && role !== 'Viewer') {
        console.log(`[OnboardingGuide] Not rendering - invalid role: ${role}`);
        return null;
    }

    // Don't render if onboarding is already completed
    if (onboardingCompleted) {
        console.log(`[OnboardingGuide] Not rendering - onboarding already completed`);
        return null;
    }

    // Don't render if no steps available
    if (!steps || steps.length === 0) {
        return null;
    }

    const shouldRun = runTour && isReady && steps.length > 0;
    console.log(`[OnboardingGuide] Render - userId: ${userId}, runTour: ${runTour}, isReady: ${isReady}, steps: ${steps.length}, shouldRun: ${shouldRun}`);

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
