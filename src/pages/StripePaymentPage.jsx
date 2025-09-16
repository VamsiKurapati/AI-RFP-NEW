import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaCreditCard, FaShieldAlt, FaLock, FaArrowLeft, FaBan } from 'react-icons/fa';
import { MdOutlinePayments, MdOutlineSecurity, MdOutlineSupport } from 'react-icons/md';
import axios from 'axios';
import { STRIPE_CONFIG, CARD_ELEMENT_OPTIONS, getStripeErrorMessage, getStripeConfigStatus, handleStripeError } from '../config/stripe';
import { useSubscriptionPlans } from '../context/SubscriptionPlansContext';
import Swal from 'sweetalert2';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_CONFIG.PUBLISHABLE_KEY);

const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/stripe`;

const CheckoutForm = ({ selectedPlan, billingCycle, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [clientSecret, setClientSecret] = useState('');

    // Get Stripe configuration status
    const stripeConfig = getStripeConfigStatus();

    useEffect(() => {
        // Create payment intent on the server
        const createPaymentIntent = async () => {
            if (!selectedPlan || !selectedPlan._id) {
                setError('No plan selected. Please select a plan first.');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication required. Please log in again.');
                    return;
                }

                const response = await axios.post(
                    `${baseUrl}${STRIPE_CONFIG.API_ENDPOINTS.CREATE_PAYMENT_INTENT}`,
                    {
                        planId: selectedPlan._id,
                        billingCycle: billingCycle,
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (response.data && response.data.clientSecret) {
                    setClientSecret(response.data.clientSecret);
                } else {
                    setError('Invalid response from payment server. Please try again.');
                }
            } catch (err) {
                // console.error('Error creating payment intent:', err);
                if (err.response && err.response.status === 401) {
                    setError('Authentication expired. Please log in again.');
                } else if (err.response && err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Failed to initialize payment. Please try again.');
                }
            }
        };

        if (selectedPlan && selectedPlan._id) {
            createPaymentIntent();
        }
    }, [selectedPlan, billingCycle]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements || !clientSecret || !selectedPlan) {
            setError('Payment system is not ready or no plan is selected.');
            return;
        }

        setLoading(true);
        setError(null);

        // Get the card element
        const cardElement = elements.getElement(CardElement);

        // Validate card element
        if (!cardElement) {
            setError('Card information is required. Please enter your card details.');
            setLoading(false);
            return;
        }

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    // Billing details will be handled by the backend using logged-in user info
                },
            },
            // Enable 3D Secure authentication
            setup_future_usage: 'off_session',
        });

        if (stripeError) {
            setError(handleStripeError(stripeError));
            setLoading(false);
        } else if (paymentIntent.status === 'succeeded') {
            // Handle successful payment
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication required. Please log in again.');
                    setLoading(false);
                    return;
                }

                const response = await axios.post(
                    `${baseUrl}${STRIPE_CONFIG.API_ENDPOINTS.ACTIVATE_SUBSCRIPTION}`,
                    {
                        planId: selectedPlan._id,
                        billingCycle: billingCycle,
                        paymentIntentId: paymentIntent.id
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (response.status === 200 || response.status === 201) {
                    onSuccess(paymentIntent);
                } else {
                    setError('Payment successful but subscription activation failed. Please contact support.');
                }
            } catch (err) {
                // console.error('Error activating subscription:', err);
                if (err.response && err.response.status === 401) {
                    setError('Authentication expired. Please log in again.');
                } else if (err.response && err.response.data && err.response.data.message) {
                    setError(`Payment successful but subscription activation failed: ${err.response.data.message}`);
                } else {
                    setError('Payment successful but subscription activation failed. Please contact support.');
                }
            }
            setLoading(false);
        } else if (paymentIntent.status === 'requires_action') {
            // Handle 3D Secure authentication
            try {
                const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);

                if (confirmError) {
                    setError(handleStripeError(confirmError));
                    setLoading(false);
                } else {
                    // Payment succeeded after 3D Secure authentication
                    try {
                        const token = localStorage.getItem('token');
                        if (!token) {
                            setError('Authentication required. Please log in again.');
                            setLoading(false);
                            return;
                        }

                        const response = await axios.post(
                            `${baseUrl}${STRIPE_CONFIG.API_ENDPOINTS.ACTIVATE_SUBSCRIPTION}`,
                            {
                                planId: selectedPlan._id,
                                billingCycle: billingCycle,
                                paymentIntentId: paymentIntent.id
                            },
                            {
                                headers: { Authorization: `Bearer ${token}` }
                            }
                        );

                        if (response.status === 200 || response.status === 201) {
                            onSuccess(paymentIntent);
                        } else {
                            setError('Payment successful but subscription activation failed. Please contact support.');
                        }
                    } catch (err) {
                        // console.error('Error activating subscription after 3D Secure:', err);
                        if (err.response && err.response.status === 401) {
                            setError('Authentication expired. Please log in again.');
                        } else if (err.response && err.response.data && err.response.data.message) {
                            setError(`Payment successful but subscription activation failed: ${err.response.data.message}`);
                        } else {
                            setError('Payment successful but subscription activation failed. Please contact support.');
                        }
                    }
                    setLoading(false);
                }
            } catch (err) {
                // console.error('Error during 3D Secure authentication:', err);
                setError('Authentication failed. Please try again.');
                setLoading(false);
            }
        }
    };

    const cardElementOptions = CARD_ELEMENT_OPTIONS;

    // Check if Stripe is properly loaded - moved after all hooks
    if (!stripe || !elements) {
        let errorMessage = "Payment system is not ready. Please refresh the page and try again.";

        if (stripeConfig.isDefaultKey) {
            errorMessage = "Stripe is not configured. Please contact support or check your environment variables.";
        } else if (!stripeConfig.isValid) {
            errorMessage = "Invalid Stripe configuration. Please check your publishable key.";
        }

        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <FaBan className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            Payment System Error
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{errorMessage}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Details
                        </label>
                        <div className="border border-gray-300 rounded-md p-3 bg-gray-50 focus-within:border-[#6C63FF] focus-within:ring-1 focus-within:ring-[#6C63FF] transition-colors">
                            <CardElement
                                options={cardElementOptions}
                                onChange={(event) => {
                                    if (event.error) {
                                        setError(handleStripeError(event.error));
                                    } else {
                                        setError(null);
                                    }
                                }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Your card information is secure and encrypted
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-gradient-to-r from-[#6C63FF] to-[#8B7CF6] text-white font-semibold py-3 px-6 rounded-lg hover:from-[#5A52E8] hover:to-[#7A6CF0] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {loading ? (
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing Payment...</span>
                    </div>
                ) : (
                    <>
                        <MdOutlinePayments className="w-5 h-5 mr-2" />
                        {billingCycle === 'yearly'
                            ? `Pay $${selectedPlan.yearlyPrice} yearly`
                            : `Pay $${selectedPlan.monthlyPrice} monthly`
                        }
                    </>
                )}
            </button>

            <div className="text-center text-sm text-gray-500">
                <p className="flex items-center justify-center">
                    <FaShieldAlt className="w-4 h-4 mr-2 text-green-500" />
                    Your payment is secure and encrypted
                </p>
            </div>
        </form>
    );
};

const StripePaymentPage = () => {
    const navigate = useNavigate();
    const { subscriptionPlans, mostPopularPlan } = useSubscriptionPlans();

    // Get Stripe configuration status
    const stripeConfig = getStripeConfigStatus();

    // Create subscription plans data with proper null checks
    const subscriptionPlansData = React.useMemo(() => {
        if (!subscriptionPlans || subscriptionPlans.length === 0) {
            // console.log("No subscription plans available from context");
            Swal.fire({
                title: "No subscription plans available from context",
                icon: "warning",
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: false,
            });
            return [];
        }

        // Helper function to safely get plan data
        const getPlanData = (planName) => {
            const plan = subscriptionPlans.find((p) => p.name === planName);
            if (!plan) {
                // console.warn(`Plan ${planName} not found in subscription plans`);
                Swal.fire({
                    title: `Plan ${planName} not found in subscription plans`,
                    icon: "warning",
                    timer: 1500,
                    showConfirmButton: false,
                    showCancelButton: false,
                });
                return null;
            }
            return plan;
        };

        const basicPlan = getPlanData("Basic");
        const proPlan = getPlanData("Pro");
        const enterprisePlan = getPlanData("Enterprise");

        // Return empty array if any required plan is missing
        if (!basicPlan || !proPlan || !enterprisePlan) {
            // console.error("One or more required subscription plans are missing");
            Swal.fire({
                title: "One or more required subscription plans are missing",
                icon: "warning",
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: false,
            });
            return [];
        }

        const plans = [
            {
                id: "basic",
                name: "Basic Plan",
                _id: basicPlan._id,
                monthlyPrice: basicPlan.monthlyPrice || 0,
                yearlyPrice: basicPlan.yearlyPrice || 0,
                features: [
                    `Up to ${basicPlan.maxRFPProposalGenerations || 0} AI - RFP Proposal Generations per month`,
                    `Up to ${basicPlan.maxGrantProposalGenerations || 0} AI - Grant Proposal Generations per month`,
                    "AI-Driven RFP Discovery",
                    "AI-Driven Grant Discovery",
                    "AI-Proposal Recommendation",
                    "Basic Compliance Check",
                    "Proposal Tracking Dashboard",
                    `${basicPlan.maxEditors || 0} Editors, ${basicPlan.maxViewers || 0} Viewers, Unlimited Members`,
                    "Team Collaboration",
                    "Support",
                ],
                missingFeatures: ["Advanced Compliance Check"],
                popular: mostPopularPlan === "Basic",
            },
            {
                id: "professional",
                name: "Professional Plan",
                _id: proPlan._id,
                monthlyPrice: proPlan.monthlyPrice || 0,
                yearlyPrice: proPlan.yearlyPrice || 0,
                features: [
                    "Includes All Basic Features",
                    `Up to ${proPlan.maxRFPProposalGenerations || 0} AI - RFP Proposal Generations per month`,
                    `Up to ${proPlan.maxGrantProposalGenerations || 0} AI - Grant Proposal Generations per month`,
                    `${proPlan.maxEditors || 0} Editors, ${proPlan.maxViewers || 0} Viewers, Unlimited Members`,
                    "Advanced Compliance Check",
                ],
                missingFeatures: ["Dedicated Support"],
                popular: mostPopularPlan === "Pro",
            },
        ];

        //  Only include Enterprise plan if isContact is NOT true
        if (!enterprisePlan.isContact) {
            plans.push({
                id: "enterprise",
                name: "Enterprise Plan",
                _id: enterprisePlan._id,
                monthlyPrice: enterprisePlan.monthlyPrice || 0,
                yearlyPrice: enterprisePlan.yearlyPrice || 0,
                features: [
                    "Includes All Basic & Pro Features",
                    `Up to ${enterprisePlan.maxRFPProposalGenerations || 0} AI - RFP Proposal Generations per month`,
                    `Up to ${enterprisePlan.maxGrantProposalGenerations || 0} AI - Grant Proposal Generations per month`,
                    "Unlimited Editors, Unlimited Viewers, Unlimited Members",
                    "Dedicated Support",
                ],
                missingFeatures: [],
                popular: mostPopularPlan === "Enterprise",
            });
        }

        return plans;
    }, [subscriptionPlans, mostPopularPlan]);


    const [selectedPlan, setSelectedPlan] = useState(null);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [showCheckout, setShowCheckout] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Set default selected plan when data is available
    useEffect(() => {
        if (subscriptionPlansData.length > 0 && !selectedPlan) {
            setSelectedPlan(subscriptionPlansData[1]); // Default to Professional
            setIsLoading(false);
        }
    }, [subscriptionPlansData, selectedPlan]);

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        setShowCheckout(true);
    };

    const handlePaymentSuccess = (paymentIntent) => {
        setPaymentSuccess(true);
        // Redirect to dashboard after a delay
        setTimeout(() => {
            navigate('/dashboard');
        }, 3000);
    };

    const handlePaymentError = (error) => {
        // console.error('Payment error:', error);
        Swal.fire({
            title: 'Payment error:',
            icon: "warning",
            text: error,
            timer: 1500,
            showConfirmButton: false,
            showCancelButton: false,
        });
        // Error is handled in the CheckoutForm component
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6C63FF] mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Plans...</h2>
                    <p className="text-gray-600">
                        Please wait while we load your subscription options.
                    </p>
                </div>
            </div>
        );
    }

    if (paymentSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                    <p className="text-gray-600 mb-6">
                        Your subscription has been activated. You'll be redirected to your dashboard shortly.
                    </p>
                    <div className="animate-pulse">
                        <div className="w-2 h-2 bg-green-500 rounded-full mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <FaArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </button>
                        <div className="flex items-center space-x-2">
                            <MdOutlineSecurity className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-gray-600">Secure Payment</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Select the perfect plan for your RFP management needs. All plans include our core features with different usage limits.
                    </p>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-full p-1 shadow-lg border">
                        <div className="flex">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${billingCycle === 'monthly'
                                    ? 'bg-[#6C63FF] text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${billingCycle === 'yearly'
                                    ? 'bg-[#6C63FF] text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Yearly
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row gap-8 mb-12 justify-center">
                    {subscriptionPlansData && subscriptionPlansData.length > 0 ? (
                        subscriptionPlansData.map((plan) => (
                            <div
                                key={plan.id}
                                className={`bg-white rounded-2xl shadow-lg relative border-2 transition-all duration-300 hover:shadow-xl ${plan.popular ? 'border-[#6C63FF]' : 'border-[#E5E7EB]'
                                    } ${selectedPlan?.id === plan.id ? 'ring-2 ring-[#6C63FF] ring-opacity-50' : ''}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-[#6C63FF] to-[#8B7CF6] text-white text-xs font-semibold px-4 py-1 rounded-full">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="p-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold text-gray-900">
                                            ${billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                                        </span>
                                        <span className="text-gray-600">
                                            /{billingCycle === 'yearly' ? 'year' : 'month'}
                                        </span>
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <FaCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                        {plan.missingFeatures.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <FaBan className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handlePlanSelect(plan)}
                                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${plan.popular
                                            ? 'bg-gradient-to-r from-[#6C63FF] to-[#8B7CF6] text-white hover:from-[#5A52E8] hover:to-[#7A6CF0]'
                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                            }`}
                                    >
                                        {selectedPlan?.id === plan.id ? 'Selected' : 'Choose Plan'}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-12">
                            <div className="text-gray-500">
                                <p>No subscription plans available at the moment.</p>
                                <p>Please try again later or contact support.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Checkout Section */}
                {showCheckout && selectedPlan && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Complete Your Purchase</h2>
                            <button
                                onClick={() => setShowCheckout(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Order Summary */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Plan:</span>
                                        <span className="font-medium">{selectedPlan.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Billing Cycle:</span>
                                        <span className="font-medium capitalize">{billingCycle}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Amount:</span>
                                        <span className="font-bold text-lg">
                                            ${billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice}
                                        </span>
                                    </div>
                                    {billingCycle === 'yearly' && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Yearly Savings:</span>
                                            <span className="font-medium">
                                                ${Math.round((selectedPlan.monthlyPrice * 12 - selectedPlan.yearlyPrice) / 12)}/month
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Form */}
                            <div>
                                <Elements stripe={stripePromise}>
                                    <CheckoutForm
                                        selectedPlan={selectedPlan}
                                        billingCycle={billingCycle}
                                        onSuccess={handlePaymentSuccess}
                                        onError={handlePaymentError}
                                    />
                                </Elements>
                            </div>
                        </div>
                    </div>
                )}

                {/* Features Section */}
                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Why Choose Our Platform?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaShieldAlt className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise Security</h3>
                            <p className="text-gray-600">
                                Bank-level encryption and security measures to protect your sensitive data.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MdOutlineSupport className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
                            <p className="text-gray-600">
                                Round-the-clock customer support to help you succeed with your RFPs.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaCreditCard className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Billing</h3>
                            <p className="text-gray-600">
                                Monthly or yearly plans with easy upgrades and cancellations.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-16 text-center">
                    <div className="flex items-center justify-center space-x-8 text-gray-400">
                        <div className="flex items-center">
                            <FaLock className="w-4 h-4 mr-2" />
                            <span className="text-sm">SSL Encrypted</span>
                        </div>
                        <div className="flex items-center">
                            <FaShieldAlt className="w-4 h-4 mr-2" />
                            <span className="text-sm">PCI Compliant</span>
                        </div>
                        <div className="flex items-center">
                            <MdOutlinePayments className="w-4 h-4 mr-2" />
                            <span className="text-sm">Stripe Powered</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StripePaymentPage;
