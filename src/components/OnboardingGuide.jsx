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
        console.log('[OnboardingGuide] allSteps computed:', {
            role,
            profileStep,
            totalSteps: flatSteps.length,
            stepsByPage: pageOrder.map(p => ({ page: p, count: pageSteps[p]?.length || 0 }))
        });
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

    // Effect to navigate to the page where the current step is located
    useEffect(() => {
        if (onboardingCompleted) return;

        const storedIndex = getCurrentStepIndex();
        const currentStep = allSteps[storedIndex];

        if (currentStep && currentStep.pagePath !== location.pathname) {
            navigate(currentStep.pagePath, { replace: true });
        }
    }, [location.pathname, allSteps, getCurrentStepIndex, onboardingCompleted, navigate]);

    // Single unified effect to handle tour initialization - continuous tour
    useEffect(() => {
        // Debug logging for tour initialization
        console.log('[OnboardingGuide] Tour initialization check:', {
            userId,
            role,
            onboardingCompleted,
            currentPath: location.pathname,
            allStepsLength: allSteps.length,
            refsCount: Object.keys(refs).length,
            refsKeys: Object.keys(refs),
            runTour,
            isReady,
            storedStepIndex: localStorage.getItem('onboarding_step_index'),
            storedStartIndex: localStorage.getItem('onboarding_start_index')
        });

        // 🧩 Ensure userId is loaded before starting any onboarding logic
        if (!userId) {
            console.log("[OnboardingGuide] Waiting for userId before initializing onboarding...");

            // Try to load userId from localStorage if not available
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    if (parsedUser._id) {
                        console.log("[OnboardingGuide] Found userId in localStorage, but not in context. User may need to refresh.");
                    }
                } catch (e) {
                    console.error("[OnboardingGuide] Error parsing user from localStorage:", e);
                }
            }
            return;
        }

        // Wait for onboarding completion
        if (onboardingCompleted) {
            console.log(`[OnboardingGuide] Early return - onboarding already completed`);
            setRunTour(false);
            setIsReady(false);
            return;
        }

        // If we have userId, validate role
        if (userId && role !== 'company' && role !== 'Editor' && role !== 'Viewer') {
            setRunTour(false);
            setIsReady(false);
            return;
        }

        const storedIndex = getCurrentStepIndex();
        const startIndex = getStartingStepIndex();
        const currentStep = allSteps[storedIndex];

        // Check if we've completed the circular loop (shouldn't happen here, but safety check)
        if (storedIndex === startIndex && localStorage.getItem('onboarding_step_index') && storedIndex !== 0) {
            // Check if this is after completing a full loop (not the initial start)
            // This is handled in the callback, so just return here
            console.log(`[OnboardingGuide] Circular tour completed, marking as done`);
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
            console.log(`[OnboardingGuide] No current step, initializing circular tour`);
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

            // Check if already started
            if (hasStartedLocally || runTour) {
                return true;
            }

            const storedIndex = getCurrentStepIndex();
            const currentStep = allSteps[storedIndex];

            if (!currentStep) {
                return false;
            }

            // Read fresh refs from refsRef
            const currentRefs = refsRef.current;
            const ref = currentRefs[currentStep.target];
            const hasRef = ref && ref.current !== null && ref.current !== undefined;

            if (hasRef) {
                let isInDOM = false;
                let isVisible = false;
                try {
                    isInDOM = document.body.contains(ref.current);
                    const rect = ref.current.getBoundingClientRect();
                    isVisible = rect.width > 0 || rect.height > 0;
                } catch (e) {
                    console.warn(`[OnboardingGuide] Error checking element:`, e);
                }

                console.log(`[OnboardingGuide] Checking step "${currentStep.target}":`, {
                    hasRef,
                    isInDOM,
                    isVisible,
                    pageMatch: currentStep.pagePath === location.pathname,
                    elementRect: hasRef ? (() => {
                        try {
                            const rect = ref.current.getBoundingClientRect();
                            return { width: rect.width, height: rect.height, top: rect.top, left: rect.left };
                        } catch (e) { return null; }
                    })() : null
                });

                if (isInDOM && isVisible && currentStep.pagePath === location.pathname) {
                    console.log(`[OnboardingGuide] ✅ Step "${currentStep.target}" is ready! Starting tour...`);
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

                    refsRef.current = refs;

                    setTimeout(() => {
                        setRunTour(true);
                        console.log('[OnboardingGuide] 🎉 Tour started! runTour set to true');
                    }, 300);

                    return true;
                } else {
                    console.log(`[OnboardingGuide] ⏳ Step "${currentStep.target}" not ready yet:`, {
                        isInDOM,
                        isVisible,
                        pageMatch: currentStep.pagePath === location.pathname,
                        waitingFor: [
                            !isInDOM && 'element not in DOM',
                            !isVisible && 'element not visible',
                            currentStep.pagePath !== location.pathname && `wrong page (need ${currentStep.pagePath}, on ${location.pathname})`
                        ].filter(Boolean)
                    });
                }
            } else {
                console.log(`[OnboardingGuide] ⚠️ Ref not found for step "${currentStep.target}"`);
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
            console.log('[OnboardingGuide] Cleaning up tour initialization');
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
    }, [userId, role, onboardingCompleted, refsUpdateTrigger, location.pathname, allSteps, getCurrentStepIndex, getStartingStepIndex, setCurrentStepIndexStorage, navigate, runTour, currentPath, refs]);

    const handleJoyrideCallback = useCallback((data) => {
        const { status, type, index, step, steps: callbackSteps } = data;

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
            // Mark onboarding as completed (user finished or skipped the tour)
            if (userId) {
                setOnboardingCompleted(true);
            }
            setRunTour(false);
            setCurrentStepIndexStorage(0);
            localStorage.removeItem('onboarding_step_index');
            localStorage.removeItem('onboarding_start_index');
            return;
        }

        // Handle step advancement - move to next step in circular tour
        if (type === EVENTS.STEP_AFTER) {
            const currentIndex = getCurrentStepIndex();
            const startIndex = getStartingStepIndex();
            let nextIndex = (currentIndex + 1) % allSteps.length; // Wrap around using modulo

            // If we're on the placeholder step (index 1, no target), skip it and go to actual next step
            // This handles the case where we added a placeholder to show "Next" button
            if (index === 1 && callbackSteps && callbackSteps.length > 1 && (!step || !step.target)) {
                // This was the placeholder step, proceed to actual next
                // Advance to the real next step without showing the placeholder
                const currentIndex = getCurrentStepIndex();
                const startIndex = getStartingStepIndex();
                let nextIndex = (currentIndex + 1) % allSteps.length;

                if (nextIndex === startIndex) {
                    // Completed the loop
                    if (userId) {
                        setOnboardingCompleted(true);
                    }
                    setRunTour(false);
                    setCurrentStepIndexStorage(0);
                    localStorage.removeItem('onboarding_step_index');
                    localStorage.removeItem('onboarding_start_index');
                } else {
                    setCurrentStepIndexStorage(nextIndex);
                    const nextStep = allSteps[nextIndex];
                    if (nextStep.pagePath !== location.pathname) {
                        setRunTour(false);
                    }
                }
                return; // Exit early to prevent double advancement
            }

            // Check if we've completed the circular loop (returned to starting point)
            if (nextIndex === startIndex) {
                // We've completed the full circle - tour is done
                if (userId) {
                    setOnboardingCompleted(true);
                }
                setRunTour(false);
                setCurrentStepIndexStorage(0);
                localStorage.removeItem('onboarding_step_index');
                localStorage.removeItem('onboarding_start_index');
            } else {
                // Continue to next step (wrapping around if needed)
                setCurrentStepIndexStorage(nextIndex);
                const nextStep = allSteps[nextIndex];

                // If next step is on a different page, stop tour and let navigation effect handle it
                if (nextStep.pagePath !== location.pathname) {
                    setRunTour(false);
                    // Navigation effect will resume tour once on correct page
                } else {
                    // Tour will continue automatically on same page
                }
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
                    localStorage.removeItem('onboarding_step_index');
                    localStorage.removeItem('onboarding_start_index');
                } else {
                    setCurrentStepIndexStorage(nextIndex);
                }
            }
        }
    }, [userId, setOnboardingCompleted, allSteps, location.pathname, getCurrentStepIndex, getStartingStepIndex, setCurrentStepIndexStorage, setRunTour]);

    // Compute steps for rendering - recalculate whenever runTour or refsUpdateTrigger changes
    // IMPORTANT: This MUST recalculate when runTour becomes true, using fresh refsRef.current
    const steps = useMemo(() => {
        try {
            // Ensure refsRef is synced before computing steps
            refsRef.current = refs;

            // Get current step for rendering - inline the logic instead of calling getStepsForRender
            let computedSteps = [];

            const actualPath = location.pathname;
            const storedIndex = getCurrentStepIndex();

            console.log('[OnboardingGuide] Computing steps:', {
                storedIndex,
                actualPath,
                allStepsLength: allSteps.length,
                refsAvailable: Object.keys(refsRef.current).length
            });

            // Validate index is within bounds
            if (storedIndex < 0 || storedIndex >= allSteps.length) {
                console.warn(`[OnboardingGuide] Invalid step index: ${storedIndex} (bounds: 0-${allSteps.length - 1})`);
                return [];
            }

            const currentStep = allSteps[storedIndex];

            // If current step doesn't exist, return empty
            if (!currentStep) {
                console.warn(`[OnboardingGuide] Current step at index ${storedIndex} is undefined`);
                return [];
            }

            // If current step exists and is on current page, return it
            if (currentStep && currentStep.pagePath === actualPath) {
                // Check if the step's ref is available
                const currentRefs = refsRef.current;
                const ref = currentRefs[currentStep.target];
                const hasRef = ref && ref.current !== null && ref.current !== undefined;

                if (hasRef) {
                    let isInDOM = false;
                    let isVisible = false;
                    try {
                        isInDOM = document.body.contains(ref.current);
                        const rect = ref.current.getBoundingClientRect();
                        isVisible = rect.width > 0 || rect.height > 0;
                    } catch (e) {
                        console.warn(`[OnboardingGuide] Error checking ref for "${currentStep.target}":`, e);
                    }

                    if (isInDOM && isVisible) {
                        const mappedStep = {
                            ...currentStep,
                            target: ref.current,
                        };
                        computedSteps = [mappedStep];
                        console.log(`[OnboardingGuide] ✅ Step "${currentStep.target}" added to steps array`);
                    } else {
                        console.log(`[OnboardingGuide] ⚠️ Step "${currentStep.target}" ref exists but element not ready:`, {
                            isInDOM,
                            isVisible
                        });
                    }
                } else {
                    console.log(`[OnboardingGuide] ⚠️ Ref not found for step "${currentStep.target}". Available refs:`, Object.keys(currentRefs));
                }
            } else {
                console.log(`[OnboardingGuide] Current step is on different page:`, {
                    stepPage: currentStep.pagePath,
                    currentPage: actualPath
                });
            }

            // For circular tour: add a placeholder "next" step so Joyride shows "Next" instead of "Finish"
            // This tricks Joyride into thinking there's another step coming
            if (computedSteps.length > 0) {
                const currentIndex = getCurrentStepIndex();
                const startIndex = getStartingStepIndex();
                const nextIndex = (currentIndex + 1) % allSteps.length;
                const isCompletingLoop = nextIndex === startIndex;

                // If not completing the loop, add a dummy next step so "Next" button shows
                if (!isCompletingLoop) {
                    const nextStep = allSteps[nextIndex];
                    // Add a placeholder step (without a valid target) so Joyride knows there's more
                    // We'll handle skipping this in the callback
                    computedSteps.push({
                        ...nextStep,
                        target: null, // No target - this will trigger an error that we'll catch
                        content: '...', // Minimal content
                    });
                }
                // If completing loop, leave it as single step so "Finish" shows correctly

            }

            console.log(`[OnboardingGuide] Steps computed: ${computedSteps.length} step(s) ready`);
            return computedSteps;
        } catch (error) {
            console.error('[OnboardingGuide] Error computing steps:', error);
            return [];
        }
    }, [refsUpdateTrigger, runTour, isReady, refs, allSteps, getCurrentStepIndex, getStartingStepIndex, location.pathname]);

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
        console.log('[OnboardingGuide] Not rendering: no steps available', {
            stepsLength: steps?.length,
            runTour,
            isReady,
            onboardingCompleted,
            userId,
            role
        });
        return null;
    }

    const shouldRun = runTour && isReady && steps.length > 0;

    console.log('[OnboardingGuide] Render decision:', {
        shouldRun,
        runTour,
        isReady,
        stepsLength: steps.length,
        onboardingCompleted,
        userId,
        role
    });

    return (
        <div id="joyride-wrapper">
            <Joyride
                steps={steps}
                run={shouldRun}
                key={`joyride-${currentPath}-${runTour ? 'run' : 'stop'}-${steps.length}`}
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
        </div>
    );
};

export default OnboardingGuide;
