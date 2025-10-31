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
        const oldKeys = Object.keys(refsRef.current);
        refsRef.current = refs;
        const newKeys = Object.keys(refs);
        if (oldKeys.length !== newKeys.length || JSON.stringify(oldKeys.sort()) !== JSON.stringify(newKeys.sort())) {
        }
    }, [refs]);

    // Define steps for different pages - flat structure for continuous tour
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
                page: '/dashboard',
            },
            {
                target: 'dashboard-proposals',
                content: 'View and manage all your RFP proposals here. Track their status, deadlines, and progress.',
                placement: 'top',
                title: 'Your Proposals',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
                page: '/dashboard',
            },
            {
                target: 'dashboard-calendar',
                content: 'Check your calendar for important deadlines and scheduled events. Never miss a proposal deadline!',
                placement: 'left',
                title: 'Calendar View',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
                page: '/dashboard',
            },
            {
                target: 'dashboard-stats',
                content: 'Quick statistics show your total proposals, in-progress items, submitted proposals, and wins.',
                placement: 'bottom',
                title: 'Key Statistics',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
                page: '/dashboard',
            },
        ],
        '/company-profile': [
            {
                target: 'profile-overview',
                content: 'Welcome! This is your Company Profile Overview. Here you can see your company information, statistics, and key metrics at a glance.',
                placement: 'bottom',
                title: 'Company Profile Overview',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
                page: '/company-profile',
            },
            {
                target: 'profile-completion',
                content: 'Keep track of your profile completion percentage. Complete your profile to get better RFP matching results and increase your chances of winning proposals!',
                placement: 'bottom',
                title: 'Profile Completion',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
                page: '/company-profile',
            },
            {
                target: 'profile-sidebar',
                content: 'Use the sidebar to navigate between different sections: Overview, Team Details, Proposals, Documents, Case Studies, Certificates, and Payment. Click on any section to explore its features.',
                placement: 'right',
                title: 'Navigation',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
                page: '/company-profile',
            },
            {
                target: 'profile-deadlines',
                content: 'Check upcoming deadlines in the right sidebar to stay on top of your important dates and never miss a proposal deadline! This helps you prioritize your work effectively.',
                placement: 'left',
                title: 'Upcoming Deadlines',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
                page: '/company-profile',
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
                page: '/discover',
            },
            {
                target: 'discover-filters',
                content: 'Use the left sidebar to filter RFPs and Grants by industry, deadline, funding amount, and more. Save your preferred filters for quick access.',
                placement: 'right',
                title: 'Search Filters',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
                page: '/discover',
            },
            {
                target: 'discover-results',
                content: 'Browse through matched RFPs and Grants. Click on any item to view details, save it for later, or start creating a proposal.',
                placement: 'top',
                title: 'RFP & Grant Results',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
                page: '/discover',
            },
            {
                target: 'discover-actions',
                content: 'You can save interesting RFPs, upload your own RFP documents, or generate proposals directly from here.',
                placement: 'bottom',
                title: 'Quick Actions',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
                page: '/discover',
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
                page: '/proposals',
            },
            {
                target: 'proposals-list',
                content: 'View all your proposals in one place. Filter by status, search by name, and organize them for easy management.',
                placement: 'top',
                title: 'Proposals List',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
                page: '/proposals',
            },
            {
                target: 'proposals-actions',
                content: 'Create new proposals, delete old ones, or check compliance. Use the action buttons to manage your proposals efficiently.',
                placement: 'bottom',
                title: 'Proposal Actions',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
                page: '/proposals',
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
                page: '/support-ticket',
            },
            {
                target: 'support-create',
                content: 'Click here to create a new support ticket. Provide details about your issue or question, and our team will respond quickly.',
                placement: 'bottom',
                title: 'Create Ticket',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
                page: '/support-ticket',
            },
            {
                target: 'support-tickets',
                content: 'View all your previous support tickets and their status. Track responses and updates from our support team.',
                placement: 'top',
                title: 'Ticket History',
                disableBeacon: true,
                disableScrolling: false,
                scrollOffset: 80,
                page: '/support-ticket',
            },
        ],
    };

    // Flatten all steps into a single continuous tour array
    const allSteps = useMemo(() => {
        const flatSteps = [];
        const profileStep = role === 'company' ? '/company-profile' : '/employee-profile';
        const pageOrder = ['/dashboard', '/discover', '/proposals', profileStep, '/support-ticket'];
        pageOrder.forEach(pagePath => {
            const steps = pageSteps[pagePath] || [];
            steps.forEach(step => {
                flatSteps.push({
                    ...step,
                    stepIndex: flatSteps.length, // Global index
                    pagePath, // Which page this step belongs to
                });
            });
        });
        console.log("flatSteps", flatSteps);
        return flatSteps;
    }, [role]);

    // Get current step index from localStorage or start from any random step (for circular tour)
    const getCurrentStepIndex = useCallback(() => {
        const stored = localStorage.getItem('onboarding_step_index');
        return stored ? parseInt(stored, 10) : 0;
    }, []);

    // Get starting step index - the point where the circular tour began
    const getStartingStepIndex = useCallback(() => {
        const stored = localStorage.getItem('onboarding_start_index');
        if (stored !== null) {
            return parseInt(stored, 10);
        }
        // If no start index, use current index as start (first time)
        const current = getCurrentStepIndex();
        localStorage.setItem('onboarding_start_index', current.toString());
        return current;
    }, [getCurrentStepIndex]);

    const setCurrentStepIndexStorage = useCallback((index) => {
        localStorage.setItem('onboarding_step_index', index.toString());
        setCurrentStepIndex(index);
    }, []);

    // Get the current step from allSteps based on stored index
    const getCurrentStep = useCallback(() => {
        const storedIndex = getCurrentStepIndex();
        const step = allSteps[storedIndex];
        if (step) {
        }
        return step;
    }, [allSteps, getCurrentStepIndex]);

    // Guard to prevent rapid navigation
    const navigationGuardRef = useRef(false);
    // Store the intended step index to avoid stale reads
    const intendedStepIndexRef = useRef(null);

    // Effect to navigate to the page where the current step is located
    useEffect(() => {
        if (onboardingCompleted) return;

        // Prevent rapid re-navigation - if guard is active, don't navigate
        if (navigationGuardRef.current) {
            return;
        }

        // Use the intended step index if set, otherwise use currentStepIndex from localStorage directly
        let stepIndexToUse;
        if (intendedStepIndexRef.current !== null) {
            stepIndexToUse = intendedStepIndexRef.current;
            intendedStepIndexRef.current = null; // Clear after using
        } else {
            // Read directly from localStorage to get the latest value, avoiding stale state
            const storedIndex = localStorage.getItem('onboarding_step_index');
            stepIndexToUse = storedIndex ? parseInt(storedIndex, 10) : currentStepIndex;
        }

        const currentStep = allSteps[stepIndexToUse];

        if (currentStep && currentStep.pagePath !== location.pathname) {
            navigationGuardRef.current = true;

            console.log(`[OnboardingGuide] Navigating to ${currentStep.pagePath} for step "${currentStep.target}" (step index: ${stepIndexToUse})`);
            // Reset tourStartedRef when navigating so tour can restart on new page
            tourStartedRef.current = false;
            // Use replace: true to prevent adding to history and avoid loops
            navigate(currentStep.pagePath, { replace: true });

            // Reset guard after navigation completes
            setTimeout(() => {
                navigationGuardRef.current = false;
            }, 800); // Increased timeout to prevent rapid re-navigation
        }
    }, [location.pathname, allSteps, currentStepIndex, onboardingCompleted, navigate]);

    // Use a ref to track if tour has been started to prevent multiple initializations
    const tourStartedRef = useRef(false);

    // Single unified effect to handle tour initialization - continuous tour
    useEffect(() => {

        // 🧩 Ensure userId is loaded before starting any onboarding logic
        if (!userId) {
            // Try to load userId from localStorage if not available
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    if (parsedUser._id) {
                        // User may need to refresh
                    }
                } catch (e) {
                    // Error parsing user from localStorage
                }
            }
            return;
        }

        // Wait for onboarding completion
        if (onboardingCompleted) {
            setRunTour(false);
            setIsReady(false);
            tourStartedRef.current = false;
            return;
        }

        // If we have userId, validate role
        if (userId && role !== 'company' && role !== 'Editor' && role !== 'Viewer') {
            setRunTour(false);
            setIsReady(false);
            tourStartedRef.current = false;
            return;
        }

        const storedIndex = getCurrentStepIndex();
        const startIndex = getStartingStepIndex();
        const currentStep = allSteps[storedIndex];

        // If tour is already running on the same page, don't re-initialize
        // But allow re-initialization if we've navigated to a new page (tourStartedRef will be reset)
        if (runTour && tourStartedRef.current && currentStep && currentStep.pagePath === location.pathname) {
            return;
        }

        // Check if we've completed the circular loop (shouldn't happen here, but safety check)
        if (storedIndex === startIndex && localStorage.getItem('onboarding_step_index') && storedIndex !== 0) {
            // Check if this is after completing a full loop (not the initial start)
            // This is handled in the callback, so just return here
            if (userId) {
                setOnboardingCompleted(true);
            }
            setRunTour(false);
            setIsReady(false);
            localStorage.removeItem('onboarding_step_index');
            localStorage.removeItem('onboarding_start_index');
            return;
        }

        // If no current step, initialize start index and current step
        if (!currentStep) {
            // Set start index to current page's first step, or 0
            const pageStepsForCurrentPath = allSteps.filter(s => s.pagePath === location.pathname);
            const firstStepOnPage = pageStepsForCurrentPath[0];
            if (firstStepOnPage) {
                const initialIndex = allSteps.findIndex(s => s.target === firstStepOnPage.target && s.pagePath === firstStepOnPage.pagePath);
                if (initialIndex !== -1) {
                    setCurrentStepIndexStorage(initialIndex);
                    localStorage.setItem('onboarding_start_index', initialIndex.toString());
                    return;
                }
            }
            // Fallback to 0
            setCurrentStepIndexStorage(0);
            localStorage.setItem('onboarding_start_index', '0');
            return;
        }

        // If current step is on different page, navigation effect will handle it
        if (currentStep.pagePath !== location.pathname) {
            return;
        }

        let intervalId = null;
        let observer = null;
        let hasStartedLocally = false;

        // Function to check and start tour - checks only the current step
        const checkAndStartTour = () => {
            // Must have userId
            if (!userId) {
                return false;
            }

            // Check if already started (but allow restart if on different page)
            // Only skip if tour is running AND we're on the same page
            const storedIndex = getCurrentStepIndex();
            const currentStep = allSteps[storedIndex];
            if (hasStartedLocally || (runTour && tourStartedRef.current && currentStep?.pagePath === location.pathname)) {
                return true;
            }

            const storedIndexForCheck = getCurrentStepIndex();
            const currentStepForCheck = allSteps[storedIndexForCheck];

            if (!currentStepForCheck) {
                return false;
            }

            // Read fresh refs from refsRef
            const currentRefs = refsRef.current;
            const ref = currentRefs[currentStepForCheck.target];
            const hasRef = ref && ref.current !== null && ref.current !== undefined;

            if (hasRef) {
                let isInDOM = false;
                try {
                    isInDOM = document.body.contains(ref.current);
                    // Don't check visibility - allow empty divs to show in tour (important for initial onboarding)
                    // Empty sections are common during first-time user experience
                } catch (e) {
                    // Error checking element
                }

                if (isInDOM && currentStepForCheck.pagePath === location.pathname) {
                    hasStartedLocally = true;
                    tourStartedRef.current = true; // Mark as started to prevent re-initialization
                    setIsReady(true);

                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = null;
                    }
                    if (observer) {
                        observer.disconnect();
                        observer = null;
                    }

                    refsRef.current = refs;

                    setTimeout(() => {
                        setRunTour(true);
                    }, 300);

                    return true;
                }
            }

            return false;
        };

        // Immediate check
        checkAndStartTour();

        // Set up VERY aggressive checking - every 100ms for up to 60 seconds
        let checkCount = 0;
        const maxChecks = 600; // 60 seconds

        intervalId = setInterval(() => {
            checkCount++;
            if (checkAndStartTour()) {
                clearInterval(intervalId);
                intervalId = null;
                return;
            }
            if (checkCount >= maxChecks) {
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
                } catch (e) {
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
            // Only reset hasStartedLocally if tour hasn't actually started
            // This prevents cleanup from interfering with an active tour
            if (!runTour && !tourStartedRef.current) {
                hasStartedLocally = false;
            }

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
    }, [userId, role, onboardingCompleted, refsUpdateTrigger, location.pathname, allSteps, getCurrentStepIndex, getStartingStepIndex, setCurrentStepIndexStorage, navigate, currentPath, refs]);

    // Use a ref to store the current steps array so it doesn't change while Joyride is using it
    const stepsRef = useRef([]);
    // Guard to prevent duplicate processing of STATUS.FINISHED
    const finishedProcessingRef = useRef(false);

    const handleJoyrideCallback = useCallback((data) => {
        const { status, type, index, step } = data;

        // Use stepsRef.current instead of callbackSteps from data (which may be undefined)
        const currentSteps = stepsRef.current || [];

        // Scroll to the top of the target element before showing each step
        if (type === EVENTS.STEP_BEFORE) {
            if (step && step.target) {
                setTimeout(() => {
                    const element = step.target;
                    if (element && element.nodeType === 1 && typeof element.scrollIntoView === 'function') {
                        try {
                            const rect = element.getBoundingClientRect();
                            const scrollY = window.scrollY || window.pageYOffset || 0;
                            const elementTop = rect.top + scrollY;
                            const offset = 80;
                            window.scrollTo({
                                top: Math.max(0, elementTop - offset),
                                behavior: 'smooth'
                            });
                        } catch (error) {
                            element.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                                inline: 'nearest'
                            });
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
            // Prevent duplicate processing
            if (finishedProcessingRef.current) {
                return;
            }
            finishedProcessingRef.current = true;

            // When Joyride finishes the current batch (page), continue if there are more steps globally
            const currentIndex = getCurrentStepIndex();
            const startIndex = getStartingStepIndex();
            const currentStep = allSteps[currentIndex];

            if (!currentStep) {
                finishedProcessingRef.current = false;
                return;
            }

            // Find the last step that was shown on the current page
            // The steps array contains all steps shown in this batch, starting from currentIndex
            const stepsOnCurrentPage = allSteps.filter(s => s.pagePath === currentStep.pagePath);
            const lastStepOnPage = stepsOnCurrentPage[stepsOnCurrentPage.length - 1];

            if (!lastStepOnPage) {
                return;
            }

            const lastStepGlobalIndex = allSteps.findIndex(s =>
                s.target === lastStepOnPage.target && s.pagePath === lastStepOnPage.pagePath
            );

            if (lastStepGlobalIndex === -1) {
                return;
            }

            const nextIndexAfterPage = (lastStepGlobalIndex + 1) % allSteps.length;

            if (status === STATUS.FINISHED && nextIndexAfterPage !== startIndex) {
                // More steps exist globally; advance instead of completing
                const nextStep = allSteps[nextIndexAfterPage];
                console.log(`[OnboardingGuide] Page batch finished, advancing to ${nextIndexAfterPage} "${nextStep.target}" on ${nextStep.pagePath}`);

                // Stop tour first to prevent interference
                setRunTour(false);
                tourStartedRef.current = false;
                setIsReady(false);

                // Update step index after a brief delay to ensure tour is stopped first
                setTimeout(() => {
                    setCurrentStepIndexStorage(nextIndexAfterPage);
                    // Reset guard after updating step index
                    finishedProcessingRef.current = false;
                }, 150);
                return;
            }

            // Otherwise, mark onboarding as completed (user finished or skipped the full circle)
            if (userId) {
                setOnboardingCompleted(true);
            }
            setRunTour(false);
            tourStartedRef.current = false; // Reset tour started flag
            setCurrentStepIndexStorage(0);
            localStorage.removeItem('onboarding_step_index');
            localStorage.removeItem('onboarding_start_index');
            finishedProcessingRef.current = false;
            return;
        }

        // Handle step advancement - move to next step in circular tour
        if (type === EVENTS.STEP_AFTER) {
            const currentIndex = getCurrentStepIndex();
            const startIndex = getStartingStepIndex();

            // Use stepsRef.current instead of callbackSteps from data (which may be undefined)
            const currentSteps = stepsRef.current || [];
            const stepsCount = currentSteps.length;

            // Check if this is the placeholder step (content is '...')
            // If yes, skip it immediately and advance to next page
            if (step && step.content === '...' && step.title === '...') {

                // Calculate next step index (skip placeholder)
                const stepsOnCurrentPage = allSteps.filter(s => s.pagePath === location.pathname);
                const lastStepOnPage = stepsOnCurrentPage[stepsOnCurrentPage.length - 1];
                const lastStepGlobalIndex = allSteps.findIndex(s =>
                    s.target === lastStepOnPage.target && s.pagePath === lastStepOnPage.pagePath
                );
                let nextIndex = (lastStepGlobalIndex + 1) % allSteps.length;

                if (nextIndex === startIndex) {
                    // Completed the circle
                    if (userId) {
                        setOnboardingCompleted(true);
                    }
                    setRunTour(false);
                    tourStartedRef.current = false;
                    setCurrentStepIndexStorage(0);
                    localStorage.removeItem('onboarding_step_index');
                    localStorage.removeItem('onboarding_start_index');
                } else {
                    setCurrentStepIndexStorage(nextIndex);
                    const nextStep = allSteps[nextIndex];
                    console.log(`[OnboardingGuide] Advancing to step ${nextIndex} "${nextStep.target}" on page ${nextStep.pagePath}`);

                    // Stop tour - navigation effect will handle moving to next page
                    setRunTour(false);
                    setIsReady(false);
                }
                return;
            }

            // Check if there are more steps on the current page by looking at the steps array
            // Only handle intermediate steps here - let STATUS.FINISHED handle the last step
            const hasMoreStepsOnPage = stepsCount > 0 && (index < stepsCount - 1);

            if (!hasMoreStepsOnPage) {
                // This was the last step in the array - STATUS.FINISHED will handle the completion
                // Don't process it here to avoid duplicate handling
                console.log(`[OnboardingGuide] Last step on page completed (step ${index + 1} of ${stepsCount}) - STATUS.FINISHED will handle advancement`);
                return;
            } else {
                // Still more steps in the array - Joyride handles them automatically
                // DON'T update the index here - let Joyride handle internal step advancement
                // Only update when all steps on page are complete
                console.log(`[OnboardingGuide] Step ${index + 1} of ${stepsCount} on page - Joyride handling internally, no update needed`);
                // Tour continues automatically - Joyride handles internal step advancement
            }
        }

        // Handle errors gracefully
        if (status === STATUS.ERROR) {
            if (type === EVENTS.STEP_NOT_FOUND || type === EVENTS.TARGET_NOT_FOUND) {
                const currentIndex = getCurrentStepIndex();
                const startIndex = getStartingStepIndex();
                const nextIndex = (currentIndex + 1) % allSteps.length; // Wrap around

                if (nextIndex === startIndex) {
                    // Completed the circle
                    if (userId) {
                        setOnboardingCompleted(true);
                    }
                    setRunTour(false);
                    tourStartedRef.current = false;
                    localStorage.removeItem('onboarding_step_index');
                    localStorage.removeItem('onboarding_start_index');
                } else {
                    setCurrentStepIndexStorage(nextIndex);
                    const nextStep = allSteps[nextIndex];
                    if (nextStep.pagePath !== location.pathname) {
                        setRunTour(false);
                        setIsReady(false);
                    }
                }
            }
        }
    }, [userId, setOnboardingCompleted, allSteps, location.pathname, getCurrentStepIndex, getStartingStepIndex, setCurrentStepIndexStorage, setRunTour, navigate]);

    // Compute steps for rendering - recalculate whenever refsUpdateTrigger changes
    // IMPORTANT: This MUST recalculate when runTour becomes true, using fresh refsRef.current
    const steps = useMemo(() => {
        try {
            // Ensure refsRef is synced before computing steps
            refsRef.current = refs;

            // Get current step for rendering - inline the logic instead of calling getStepsForRender
            let computedSteps = [];

            const actualPath = location.pathname;
            const storedIndex = getCurrentStepIndex();

            // Validate index is within bounds
            if (storedIndex < 0 || storedIndex >= allSteps.length) {
                return stepsRef.current.length > 0 ? stepsRef.current : []; // Return previous steps if available
            }

            const currentStep = allSteps[storedIndex];

            // If current step doesn't exist, return empty
            if (!currentStep) {
                return stepsRef.current.length > 0 ? stepsRef.current : []; // Return previous steps if available
            }

            // If current step exists and is on current page, return all steps on this page
            // This ensures Joyride shows "Next" button instead of "Finish"
            if (currentStep && currentStep.pagePath === actualPath) {
                // Get all steps on the current page
                const stepsOnCurrentPage = allSteps.filter(s => s.pagePath === actualPath);

                // Find the index of current step within the page steps
                const currentStepPageIndex = stepsOnCurrentPage.findIndex(s =>
                    s.target === currentStep.target && s.pagePath === currentStep.pagePath
                );

                // Include all steps from current step onwards on this page
                const remainingStepsOnPage = stepsOnCurrentPage.slice(currentStepPageIndex);

                // Map them to include actual DOM elements
                const mappedSteps = remainingStepsOnPage.map(step => {
                    const currentRefs = refsRef.current;
                    const ref = currentRefs[step.target];
                    const hasRef = ref && ref.current !== null && ref.current !== undefined;

                    if (hasRef) {
                        let isInDOM = false;
                        try {
                            isInDOM = document.body.contains(ref.current);
                        } catch (e) {
                            // Error checking ref
                        }

                        if (isInDOM) {
                            return {
                                ...step,
                                target: ref.current,
                            };
                        }
                    }
                    return null;
                }).filter(Boolean); // Remove any null entries

                if (mappedSteps.length > 0) {
                    // Check if there are more steps globally after this page
                    const lastStepOnPage = stepsOnCurrentPage[stepsOnCurrentPage.length - 1];
                    const lastStepGlobalIndex = allSteps.findIndex(s =>
                        s.target === lastStepOnPage.target && s.pagePath === lastStepOnPage.pagePath
                    );

                    if (lastStepGlobalIndex !== -1) {
                        const nextIndexAfterPage = (lastStepGlobalIndex + 1) % allSteps.length;
                        const startIndex = getStartingStepIndex();
                        const hasMoreStepsGlobally = nextIndexAfterPage !== startIndex && nextIndexAfterPage !== lastStepGlobalIndex;

                        // If there are more steps globally, customize the last step to show "Next Page" instead of "Finish"
                        if (hasMoreStepsGlobally && mappedSteps.length > 0) {
                            // Modify the last step to have custom locale
                            const lastMappedStep = mappedSteps[mappedSteps.length - 1];
                            if (lastMappedStep) {
                                mappedSteps[mappedSteps.length - 1] = {
                                    ...lastMappedStep,
                                    locale: {
                                        last: 'Next Page'
                                    }
                                };
                            }
                        }
                    }

                    computedSteps = mappedSteps;
                    stepsRef.current = mappedSteps; // Store for stability
                } else {
                    // Return previous steps if available to prevent tour from disappearing
                    return stepsRef.current.length > 0 ? stepsRef.current : [];
                }
            } else {
                // Return previous steps if available
                return stepsRef.current.length > 0 ? stepsRef.current : [];
            }

            // Return only the valid step(s) - don't add placeholder with null target
            // Joyride's continuous prop will handle showing "Next" vs "Finish" button
            // We'll handle step advancement in the callback

            return computedSteps;
        } catch (error) {
            return stepsRef.current.length > 0 ? stepsRef.current : [];
        }
    }, [refsUpdateTrigger, refs, allSteps, getCurrentStepIndex, getStartingStepIndex, location.pathname]);

    // Don't render if role is invalid (when userId is available)
    if (userId && role !== 'company' && role !== 'Editor' && role !== 'Viewer') {
        return null;
    }

    // Don't render if onboarding is already completed
    if (onboardingCompleted) {
        return null;
    }

    // Don't render if no steps available
    if (!steps || steps.length === 0) {
        return null;
    }

    const shouldRun = runTour && isReady && steps.length > 0;

    return (
        <>
            <Joyride
                steps={steps}
                run={shouldRun}
                continuous={true}
                showProgress={true}
                showSkipButton={true}
                showBackButton={true}
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
                disableScrolling={false}
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
        </>
    );
};

export default OnboardingGuide;
