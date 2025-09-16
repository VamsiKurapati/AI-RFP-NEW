// Stripe Configuration
export const STRIPE_CONFIG = {
    // Replace with your actual Stripe publishable key
    PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,

    // API endpoints (these should match your backend)
    API_ENDPOINTS: {
        CREATE_PAYMENT_INTENT: '/create-payment-intent',
        ACTIVATE_SUBSCRIPTION: '/activate-subscription',
        GET_SUBSCRIPTION_STATUS: '/subscription-status',
        CANCEL_SUBSCRIPTION: '/cancel-subscription',
        UPDATE_PAYMENT_METHOD: '/update-payment-method'
    },

    // Payment method types
    PAYMENT_METHODS: {
        CARD: 'card'
    },

    // Billing cycles
    BILLING_CYCLES: {
        MONTHLY: 'monthly',
        YEARLY: 'yearly'
    }
};

// Stripe Elements styling
export const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
                color: '#aab7c4',
            },
            ':-webkit-autofill': {
                color: '#fce883',
            },
        },
        invalid: {
            iconColor: '#FFC7EE',
            color: '#FFC7EE',
        },
    },
    hidePostalCode: true,
    // Enable real-time validation
    options: {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
        },
    }
};

// Error messages for common Stripe errors
export const STRIPE_ERROR_MESSAGES = {
    'card_declined': 'Your card was declined. Please try a different card.',
    'expired_card': 'Your card has expired. Please use a different card.',
    'incorrect_cvc': 'Your card\'s security code is incorrect.',
    'incorrect_number': 'Your card number is incorrect.',
    'insufficient_funds': 'Your card has insufficient funds.',
    'invalid_cvc': 'Your card\'s security code is invalid.',
    'invalid_expiry_month': 'Your card\'s expiration month is invalid.',
    'invalid_expiry_year': 'Your card\'s expiration year is invalid.',
    'invalid_number': 'Your card number is invalid.',
    'processing_error': 'An error occurred while processing your card. Please try again.',
    'rate_limit': 'Too many requests made to the API too quickly.',
    'authentication_required': 'Your card requires additional authentication. Please complete the verification process.',
    'setup_intent_authentication_required': 'Your card requires additional authentication. Please complete the verification process.',
    'payment_intent_authentication_required': 'Your card requires additional authentication. Please complete the verification process.',
};

// Helper function to get user-friendly error message
export const getStripeErrorMessage = (error) => {
    if (error.type === 'card_error' || error.type === 'validation_error') {
        return error.message;
    }

    if (error.code && STRIPE_ERROR_MESSAGES[error.code]) {
        return STRIPE_ERROR_MESSAGES[error.code];
    }

    return 'An unexpected error occurred. Please try again.';
};

// Enhanced error handling for different payment scenarios
export const handleStripeError = (error) => {
    switch (error.code) {
        case 'card_declined':
            return 'Your card was declined. Please try a different card.';
        case 'expired_card':
            return 'Your card has expired. Please use a different card.';
        case 'incorrect_cvc':
            return 'Your card\'s security code is incorrect.';
        case 'insufficient_funds':
            return 'Your card has insufficient funds.';
        case 'authentication_required':
        case 'setup_intent_authentication_required':
        case 'payment_intent_authentication_required':
            return 'Your card requires additional authentication. Please complete the verification process.';
        case 'processing_error':
            return 'An error occurred while processing your card. Please try again.';
        case 'rate_limit':
            return 'Too many requests. Please wait a moment and try again.';
        default:
            return error.message || 'An unexpected error occurred. Please try again.';
    }
};

// Helper function to format currency
export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount / 100); // Stripe amounts are in cents
};

// Helper function to validate Stripe publishable key
export const validateStripeKey = (key) => {
    if (!key) return false;
    // Check if it's a valid Stripe publishable key format
    return /^pk_(test_|live_)[a-zA-Z0-9]{24,}$/.test(key);
};

// Helper function to get Stripe configuration status
export const getStripeConfigStatus = () => {
    const key = STRIPE_CONFIG.PUBLISHABLE_KEY;
    const isValid = validateStripeKey(key);

    return {
        hasKey: !!key,
        isValid: isValid,
        isTestKey: key && key.startsWith('pk_test_'),
        isLiveKey: key && key.startsWith('pk_live_'),
        isDefaultKey: key === 'pk_test_51N8example_key_here'
    };
};

// Helper function to validate card number (basic Luhn algorithm)
export const validateCardNumber = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(cleaned)) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
};
