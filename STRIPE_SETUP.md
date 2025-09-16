# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payments for your RFP application.

## Prerequisites

1. A Stripe account (sign up at [stripe.com](https://stripe.com))
2. Node.js and npm installed
3. Your RFP application backend running

## Installation

The required Stripe packages have already been installed:

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## Configuration

### 1. Update Stripe Configuration

Edit `src/config/stripe.js` and replace the placeholder publishable key:

```javascript
export const STRIPE_CONFIG = {
  // Replace with your actual Stripe publishable key
  PUBLISHABLE_KEY: 'pk_test_your_actual_key_here',
  // ... rest of config
};
```

### 2. Get Your Stripe Keys

1. Log into your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to Developers → API keys
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Copy your **Secret key** (starts with `sk_test_` for test mode)

### 3. Backend API Endpoints

You'll need to implement these endpoints in your backend:

#### Create Payment Intent
```
POST /api/create-payment-intent
Body: {
  planId: string,
  billingCycle: 'monthly' | 'yearly',
  amount: number
}
Response: {
  clientSecret: string
}
```

#### Activate Subscription
```
POST /api/activate-subscription
Body: {
  planId: string,
  billingCycle: 'monthly' | 'yearly',
  paymentIntentId: string
}
Response: {
  success: boolean,
  subscriptionId: string
}
```

## Backend Implementation Example (Node.js/Express)

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { planId, billingCycle, amount } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        planId,
        billingCycle
      }
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activate subscription
app.post('/api/activate-subscription', async (req, res) => {
  try {
    const { planId, billingCycle, paymentIntentId } = req.body;
    
    // Create or update subscription in your database
    // Update user's subscription status
    
    res.json({ 
      success: true, 
      subscriptionId: 'sub_123' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Testing

### Test Card Numbers

Use these test card numbers in Stripe test mode:

- **Visa**: `4242424242424242`
- **Mastercard**: `5555555555554444`
- **Declined**: `4000000000000002`
- **Requires Authentication**: `4000002500003155`

### Test Mode vs Live Mode

- **Test Mode**: Use `pk_test_` keys for development
- **Live Mode**: Use `pk_live_` keys for production

## Features

### 1. Subscription Plans
- Basic Plan: $29/month or $290/year
- Professional Plan: $79/month or $790/year (Most Popular)
- Enterprise Plan: $199/month or $1990/year

### 2. Payment Features
- Secure card processing with Stripe Elements
- Monthly/Yearly billing cycles
- 20% discount on yearly plans
- Real-time validation and error handling
- Responsive design for all devices

### 3. Security Features
- PCI compliant payment processing
- SSL encryption
- Stripe's secure infrastructure
- No sensitive data stored locally

## Usage

### Navigate to Payment Page
```javascript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/payment');
```

### Use Payment Button Component
```javascript
import PaymentButton from '../components/PaymentButton';

<PaymentButton variant="primary" size="lg">
  Upgrade Now
</PaymentButton>
```

## Customization

### Update Subscription Plans
Edit the `subscriptionPlans` array in `StripePaymentPage.jsx`:

```javascript
const subscriptionPlans = [
  {
    id: 'your_plan_id',
    name: 'Your Plan Name',
    price: 99,
    yearlyPrice: 990,
    features: ['Feature 1', 'Feature 2'],
    popular: false
  }
];
```

### Update Styling
The payment page uses Tailwind CSS. You can customize colors, spacing, and layout by modifying the CSS classes.

### Update API Endpoints
Modify the endpoints in `src/config/stripe.js` to match your backend API structure.

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Check that your publishable key is correct
   - Ensure you're using the right key for test/live mode

2. **Payment fails**
   - Verify your backend endpoints are working
   - Check Stripe dashboard for error logs
   - Ensure your secret key is correct on the backend

3. **Card element not loading**
   - Check browser console for JavaScript errors
   - Verify Stripe.js is loading correctly
   - Ensure your publishable key is valid

### Debug Mode

Enable Stripe debug mode by adding this to your configuration:

```javascript
const stripePromise = loadStripe(STRIPE_CONFIG.PUBLISHABLE_KEY, {
  stripeAccount: 'your_connect_account_id' // if using Connect
});
```

## Production Deployment

1. **Update Keys**: Switch from test to live keys
2. **SSL**: Ensure your site uses HTTPS
3. **Webhooks**: Set up Stripe webhooks for production events
4. **Monitoring**: Monitor payments in Stripe dashboard
5. **Testing**: Test with real cards in live mode

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [React Stripe Elements](https://stripe.com/docs/stripe-js/react)

## Security Notes

- Never expose your secret key in frontend code
- Always use HTTPS in production
- Implement proper authentication for payment endpoints
- Validate all input data on the backend
- Monitor for suspicious activity
