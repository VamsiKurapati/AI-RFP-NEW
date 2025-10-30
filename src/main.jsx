import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import '@fontsource/inter'; // Defaults to 400
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';

import { ProfileProvider } from './context/ProfileContext';
import { EmployeeProfileProvider } from './context/EmployeeProfileContext';
import { SubscriptionPlansProvider } from './context/SubscriptionPlansContext';
import { JWTVerifierProvider } from './context/JWTVerifier';
import { OnboardingProvider } from './context/OnboardingContext';
import ErrorBoundary from './components/ErrorBoundary';
import './utils/onboardingUtils'; // Load onboarding utilities for debugging

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <UserProvider>
        <OnboardingProvider>
          <ProfileProvider>
            <EmployeeProfileProvider>
              <SubscriptionPlansProvider>
                <JWTVerifierProvider>
                  <App />
                </JWTVerifierProvider>
              </SubscriptionPlansProvider>
            </EmployeeProfileProvider>
          </ProfileProvider>
        </OnboardingProvider>
      </UserProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
