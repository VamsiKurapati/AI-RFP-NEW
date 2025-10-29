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
            console.log(`[OnboardingGuide] refsRef updated - old keys (${oldKeys.length}):`, oldKeys, `new keys (${newKeys.length}):`, newKeys);
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
        const pageOrder = ['/dashboard', '/company-profile', '/discover', '/proposals', '/support-ticket'];
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
        console.log(`[OnboardingGuide] Created ${flatSteps.length} total steps for continuous tour`);
        return flatSteps;
    }, []);

    // Get current step index from localStorage or start from 0
    const getCurrentStepIndex = useCallback(() => {
        const stored = localStorage.getItem('onboarding_step_index');
        return stored ? parseInt(stored, 10) : 0;
    }, []);

    const setCurrentStepIndexStorage = useCallback((index) => {
        localStorage.setItem('onboarding_step_index', index.toString());
        setCurrentStepIndex(index);
    }, []);

    // Get the current step from allSteps based on stored index
    const getCurrentStep = useCallback(() => {
        const storedIndex = getCurrentStepIndex();
        const step = allSteps[storedIndex];
        if (step) {
            console.log(`[OnboardingGuide] Current step ${storedIndex}/${allSteps.length}: ${step.title} on page ${step.pagePath}`);
        }
        return step;
    }, [allSteps, getCurrentStepIndex]);

    // Get steps for rendering - only the current step from allSteps
    const getStepsForRender = useCallback(() => {
        const actualPath = location.pathname;
        const storedIndex = getCurrentStepIndex();
        const currentStep = allSteps[storedIndex];

        // If we're past the last step, return empty
        if (storedIndex >= allSteps.length) {
            console.log(`[OnboardingGuide] Tour completed - step index ${storedIndex} >= total ${allSteps.length}`);
            return [];
        }

        // If current step exists and is on current page, return it
        if (currentStep && currentStep.pagePath === actualPath) {
            console.log(`[OnboardingGuide] Current step ${storedIndex} is on current page ${actualPath}`);

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
                    console.warn(`[OnboardingGuide] Error checking element:`, e);
                }

                if (isInDOM && isVisible) {
                    const mappedStep = {
                        ...currentStep,
                        target: ref.current,
                    };
                    console.log(`[OnboardingGuide] ✅ Step ready for render: ${currentStep.title}`);
                    return [mappedStep];
                } else {
                    console.log(`[OnboardingGuide] Step not ready: inDOM=${isInDOM}, visible=${isVisible}`);
                }
            } else {
                console.log(`[OnboardingGuide] Step ref not available yet: ${currentStep.target}`);
            }
        } else if (currentStep) {
            // Step is on a different page - we'll navigate there
            console.log(`[OnboardingGuide] Current step ${storedIndex} is on ${currentStep.pagePath}, but we're on ${actualPath}`);
        }

        return [];
    }, [location.pathname, allSteps, getCurrentStepIndex]);

    // Effect to navigate to the page where the current step is located
    useEffect(() => {
        if (onboardingCompleted || !runTour) return;

        const storedIndex = getCurrentStepIndex();
        const currentStep = allSteps[storedIndex];

        if (currentStep && currentStep.pagePath !== location.pathname) {
            console.log(`[OnboardingGuide] 🧭 Navigating to ${currentStep.pagePath} for step ${storedIndex}`);
            navigate(currentStep.pagePath, { replace: true });
        }
    }, [runTour, location.pathname, allSteps, getCurrentStepIndex, onboardingCompleted, navigate]);

    // Single unified effect to handle tour initialization - continuous tour
    useEffect(() => {
        console.log(`[OnboardingGuide] Effect triggered - Path: ${currentPath}, UserId: ${userId}, Role: ${role}, OnboardingCompleted: ${onboardingCompleted}`);

        // Wait for userId to load - don't start until we have it
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

        const storedIndex = getCurrentStepIndex();
        const currentStep = allSteps[storedIndex];

        // If we've completed all steps, mark onboarding as completed
        if (storedIndex >= allSteps.length) {
            console.log(`[OnboardingGuide] All steps completed (${storedIndex}/${allSteps.length})`);
            if (userId) {
                setOnboardingCompleted(true);
            }
            setRunTour(false);
            setIsReady(false);
            localStorage.removeItem('onboarding_step_index');
            return;
        }

        // If no current step, start from beginning
        if (!currentStep) {
            console.log(`[OnboardingGuide] No current step, starting from beginning`);
            setCurrentStepIndexStorage(0);
            return;
        }

        console.log(`[OnboardingGuide] Continuous tour - step ${storedIndex}/${allSteps.length}: ${currentStep.title} on ${currentStep.pagePath}`);
        console.log(`[OnboardingGuide] Current refs:`, Object.keys(refs));
        console.log(`[OnboardingGuide] RefsUpdateTrigger: ${refsUpdateTrigger}`);

        // If current step is on different page, navigation effect will handle it
        if (currentStep.pagePath !== location.pathname) {
            console.log(`[OnboardingGuide] Current step is on ${currentStep.pagePath}, waiting for navigation`);
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

                console.log(`[OnboardingGuide] Step "${currentStep.target}": hasRef=${hasRef}, inDOM=${isInDOM}, visible=${isVisible}, onPage=${currentStep.pagePath === location.pathname}`);

                if (isInDOM && isVisible && currentStep.pagePath === location.pathname) {
                    console.log(`[OnboardingGuide] ✅✅✅ STARTING TOUR! Step ${storedIndex}/${allSteps.length} ready`);
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
                        console.log(`[OnboardingGuide] 🚀 Setting runTour = true`);
                        setRunTour(true);
                    }, 300);

                    return true;
                }
            }

            console.log(`[OnboardingGuide] Waiting for refs for step "${currentStep.target}"...`);
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
            // Mark onboarding as completed
            if (userId) {
                setOnboardingCompleted(true);
            }
            setRunTour(false);
            setCurrentStepIndexStorage(0);
            localStorage.removeItem('onboarding_step_index');
            return;
        }

        // Handle step advancement - move to next step in allSteps
        if (type === EVENTS.STEP_AFTER) {
            const currentIndex = getCurrentStepIndex();
            const nextIndex = currentIndex + 1;

            console.log(`[OnboardingGuide] Step ${currentIndex} completed, moving to step ${nextIndex}`);

            if (nextIndex >= allSteps.length) {
                // All steps completed
                console.log(`[OnboardingGuide] 🎉 All ${allSteps.length} steps completed!`);
                if (userId) {
                    setOnboardingCompleted(true);
                }
                setRunTour(false);
                setCurrentStepIndexStorage(0);
                localStorage.removeItem('onboarding_step_index');
            } else {
                // Continue to next step
                setCurrentStepIndexStorage(nextIndex);
                const nextStep = allSteps[nextIndex];

                // If next step is on a different page, stop tour and let navigation effect handle it
                if (nextStep.pagePath !== location.pathname) {
                    console.log(`[OnboardingGuide] Next step is on different page (${nextStep.pagePath}), pausing tour`);
                    setRunTour(false);
                    // Navigation effect will resume tour once on correct page
                } else {
                    console.log(`[OnboardingGuide] Next step is on same page, continuing tour`);
                    // Tour will continue automatically on same page
                }
            }
        }

        // Handle errors gracefully
        if (status === STATUS.ERROR) {
            if (type === EVENTS.STEP_NOT_FOUND || type === EVENTS.TARGET_NOT_FOUND) {
                console.warn(`Tour step ${index} target not found, moving to next step`);
                const currentIndex = getCurrentStepIndex();
                const nextIndex = currentIndex + 1;

                if (nextIndex >= allSteps.length) {
                    if (userId) {
                        setOnboardingCompleted(true);
                    }
                    setRunTour(false);
                    localStorage.removeItem('onboarding_step_index');
                } else {
                    setCurrentStepIndexStorage(nextIndex);
                }
            }
        }
    }, [userId, setOnboardingCompleted, allSteps, location.pathname, getCurrentStepIndex, setCurrentStepIndexStorage]);

    // Compute steps for rendering - recalculate whenever runTour or refsUpdateTrigger changes
    // IMPORTANT: This MUST recalculate when runTour becomes true, using fresh refsRef.current
    const steps = useMemo(() => {
        // Ensure refsRef is synced before computing steps
        refsRef.current = refs;

        // Force recalculation by calling getStepsForCurrentPage fresh
        const computedSteps = getStepsForCurrentPage();
        console.log(`[OnboardingGuide] 🔄 Steps memo computed: ${computedSteps.length} steps`);
        console.log(`[OnboardingGuide]   - runTour: ${runTour}`);
        console.log(`[OnboardingGuide]   - isReady: ${isReady}`);
        console.log(`[OnboardingGuide]   - refsUpdateTrigger: ${refsUpdateTrigger}`);
        console.log(`[OnboardingGuide]   - refsRef keys:`, Object.keys(refsRef.current));

        if (computedSteps.length > 0) {
            console.log(`[OnboardingGuide] ✅ Step targets:`, computedSteps.map(s => ({
                target: s.target ? `${s.target.tagName || typeof s.target}` : 'NULL',
                title: s.title,
                hasTarget: !!s.target,
                targetInDOM: s.target ? document.body.contains(s.target) : false
            })));
        } else {
            console.warn(`[OnboardingGuide] ⚠️ Steps memo returned 0 steps!`);
            console.warn(`[OnboardingGuide]   - runTour: ${runTour}`);
            console.warn(`[OnboardingGuide]   - isReady: ${isReady}`);
            console.warn(`[OnboardingGuide]   - Checking refs directly:`, Object.entries(refsRef.current).map(([key, ref]) => ({
                key,
                hasRef: !!ref,
                hasCurrent: !!ref?.current,
                currentType: ref?.current ? ref.current.constructor.name : 'null',
                inDOM: ref?.current ? document.body.contains(ref.current) : false
            })));
        }
        return computedSteps;
    }, [getStepsForCurrentPage, refsUpdateTrigger, runTour, isReady, refs]);

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
    console.log(`[OnboardingGuide] 🎯 RENDER CHECK:`);
    console.log(`  - userId: ${userId}`);
    console.log(`  - runTour: ${runTour}`);
    console.log(`  - isReady: ${isReady}`);
    console.log(`  - steps.length: ${steps.length}`);
    if (steps.length > 0) {
        console.log(`  - steps with targets:`, steps.map(s => ({
            target: s.target ? `${s.target.tagName || typeof s.target}` : 'NULL',
            title: s.title
        })));
    }
    console.log(`  - shouldRun: ${shouldRun}`);

    // Additional check - if we should run but steps have no targets, log warning
    if (runTour && isReady && steps.length === 0) {
        console.warn(`[OnboardingGuide] ⚠️ WARNING: runTour and isReady are true but no steps available!`);
        console.warn(`[OnboardingGuide] This suggests getStepsForCurrentPage returned empty - checking refs now:`, Object.keys(refsRef.current));
    }

    // Log when Joyride is about to render
    if (shouldRun && steps.length > 0) {
        console.log(`[OnboardingGuide] 🎉 RENDERING JOYRIDE COMPONENT with ${steps.length} steps`);
        console.log(`[OnboardingGuide] First step:`, {
            targetExists: !!steps[0].target,
            targetType: steps[0].target?.constructor?.name,
            targetTagName: steps[0].target?.tagName,
            title: steps[0].title
        });
    }

    return (
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
    );
};

export default OnboardingGuide;
