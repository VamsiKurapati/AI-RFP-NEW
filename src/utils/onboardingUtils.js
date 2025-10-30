/**
 * Utility functions for debugging and resetting onboarding tour
 * 
 * Usage in browser console:
 *   window.resetOnboarding() - Reset onboarding status and clear tour state
 *   window.checkOnboardingStatus() - Check current onboarding status
 */

// Reset onboarding status (useful for testing)
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
                console.log('✅ Onboarding status reset to false');
            } else {
                console.log('⚠️ No user data found in localStorage');
            }
            
            console.log('🔄 Onboarding reset complete! Reload the page to see the tour.');
            return true;
        } catch (error) {
            console.error('❌ Error resetting onboarding:', error);
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
            
            console.log('📊 Onboarding Status:', status);
            return status;
        } catch (error) {
            console.error('❌ Error checking onboarding status:', error);
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

    console.log('🛠️ Onboarding utilities loaded!');
    console.log('   - window.resetOnboarding() - Reset onboarding');
    console.log('   - window.checkOnboardingStatus() - Check status');
    console.log('   - window.forceStartTour() - Reset and reload');
}

