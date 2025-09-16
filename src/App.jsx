import { Routes, Route, Navigate } from 'react-router-dom';

import { lazy, Suspense, useEffect } from "react";
import CanvaApp from './pages/CanvaApp';
// import { useUser } from './context/UserContext';
const ProtectedRoutes = lazy(() => import('./pages/ProtectedRoutes'));

const Home = lazy(() => import("./pages/HomePage"));
const Contact = lazy(() => import("./pages/Contact"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const ProfileForm = lazy(() => import("./pages/ProfileForm"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

const Discovery = lazy(() => import("./pages/Discover"));

const Proposals = lazy(() => import("./pages/Proposals"));
const GenerateProposalPage = lazy(() => import("./pages/GenerateProposalPage"));
const BasicComplianceCheck = lazy(() => import("./pages/BasicComplianceCheck"));
const AdvancedComplianceCheck = lazy(() => import("./pages/AdvancedComplianceCheck"));

const Dashboard = lazy(() => import("./pages/Dashboard"));

const EmployeeProfileDashboard = lazy(() => import("./pages/EmployeeProfileDashboard"));
const EmployeeProfileUpdate = lazy(() => import("./pages/EmployeeProfileUpdate"));
const CompanyProfileDashboard = lazy(() => import("./pages/CompanyProfileDashboard"));
const CompanyProfileUpdate = lazy(() => import("./pages/CompanyProfileUpdate"));

const SuperAdmin = lazy(() => import("./Super_Admin/SuperAdmin"));
const ImageUpload = lazy(() => import("./Super_Admin/ImageUpload"));

const SupportTicket = lazy(() => import("./pages/SupportTicket"));
const StripePaymentPage = lazy(() => import("./pages/StripePaymentPage"));

const App = () => {
  // const { role } = useUser();

  return (
    <>

      <Suspense fallback={<></>}>
        <Routes>
          <Route path="/" element={<><Home /></>} />

          <Route path="/contact" element={<Contact />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign_up" element={<SignUpPage />} />
          <Route path="/create-profile" element={<ProfileForm />} />
          <Route path="/change-password" element={<ProtectedRoutes allowedRoles={["company", "Editor", "Viewer", "SuperAdmin"]}>
            <ChangePassword />
          </ProtectedRoutes>} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/discover" element={<ProtectedRoutes allowedRoles={["company", "Editor", "Viewer"]}>
            <Discovery />
          </ProtectedRoutes>} />

          <Route path="/proposals" element={<ProtectedRoutes allowedRoles={["company", "Editor", "Viewer"]}>
            <Proposals />
          </ProtectedRoutes>} />

          <Route path="/proposal_page" element={
            <ProtectedRoutes allowedRoles={["company", "Editor", "Viewer"]}>
              <GenerateProposalPage />
            </ProtectedRoutes>
          } />
          <Route path="/basic-compliance-check" element={<ProtectedRoutes allowedRoles={["company", "Editor", "Viewer"]}>
            <BasicComplianceCheck />
          </ProtectedRoutes>} />
          <Route path="/advanced-compliance-check" element={<ProtectedRoutes allowedRoles={["company", "Editor", "Viewer"]}>
            <AdvancedComplianceCheck />
          </ProtectedRoutes>} />

          <Route path="/dashboard" element={
            <ProtectedRoutes allowedRoles={["company", "Editor", "Viewer"]}>
              <Dashboard />
            </ProtectedRoutes>
          } />
          {/* <Route path="/dashboard" element={ Dashboard } /> */}

          <Route path="/company_profile_dashboard" element={
            <ProtectedRoutes allowedRoles={["company"]}>
              <CompanyProfileDashboard />
            </ProtectedRoutes>
          } />
          <Route path="/company-profile-update" element={
            <ProtectedRoutes allowedRoles={["company"]}>
              <CompanyProfileUpdate />
            </ProtectedRoutes>
          } />

          <Route path="/employee_profile_dashboard" element={
            <ProtectedRoutes allowedRoles={["Editor", "Viewer"]}>
              <EmployeeProfileDashboard />
            </ProtectedRoutes>
          } />
          <Route path="/employee-profile-update" element={
            <ProtectedRoutes allowedRoles={["Editor", "Viewer"]}>
              <EmployeeProfileUpdate />
            </ProtectedRoutes>
          } />

          <Route path="/editor" element={
            <ProtectedRoutes allowedRoles={["company", "Editor"]}>
              <CanvaApp />
            </ProtectedRoutes>
          } />

          <Route path="/admin" element={
            <ProtectedRoutes allowedRoles={["SuperAdmin"]}>
              <SuperAdmin />
            </ProtectedRoutes>
          } />

          <Route path="/image-upload" element={
            <ProtectedRoutes allowedRoles={["SuperAdmin"]}>
              <ImageUpload />
            </ProtectedRoutes>
          } />

          <Route path="/support-ticket" element={
            <ProtectedRoutes allowedRoles={["company", "Editor", "Viewer"]}>
              <SupportTicket />
            </ProtectedRoutes>
          } />

          <Route path="/payment" element={
            <ProtectedRoutes allowedRoles={["company", "Editor", "Viewer"]}>
              <StripePaymentPage />
            </ProtectedRoutes>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
