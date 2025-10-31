/**
 * Utility functions for resetting onboarding tour
 */

if (typeof window !== 'undefined') {
    window.resetOnboarding = () => {
        try {
            // Clear tour state
            localStorage.removeItem('onboarding_step_index');
            localStorage.removeItem('onboarding_start_index');

            // Reset onboarding status in user object
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.onboarding_status = false;
                localStorage.setItem('user', JSON.stringify(user));
            }

            return true;
        } catch (error) {
            return false;
        }
    };

    // Check onboarding status
    window.checkOnboardingStatus = () => {
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            const status = {
                userId: user?._id || null,
                role: localStorage.getItem('userRole'),
                onboardingCompleted: user?.onboarding_status || false,
                stepIndex: localStorage.getItem('onboarding_step_index'),
                startIndex: localStorage.getItem('onboarding_start_index'),
                userObject: user
            };

            return status;
        } catch (error) {
            return null;
        }
    };

    // Force start tour (for debugging)
    window.forceStartTour = () => {
        window.resetOnboarding();
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };
}
