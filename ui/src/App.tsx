import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { AuthProvider } from "./contexts/AuthContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { SessionExpiryProvider } from "./contexts/SessionExpiryContext";
import { SessionExpiryModal } from "./components/session-expiry";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuthCallback from "./components/OAuthCallback";
import { VersionFooter } from "./components/VersionFooter";
import Login from "./user/Login";
import GodLogin from "./god/GodLogin";
import Signup from "./user/Signup";
import VerifyOTP from "./user/VerifyOTP";
import ForgotPassword from "./user/ForgotPassword";
import ResetPassword from "./user/ResetPassword";
import MfaVerify from "./user/mfa-verify/MfaVerify";
import Profile from "./user/profile/Profile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { ApiDocsPage } from "./pages/api-docs";
import Layout from "./components/Layout";
import GodLayout from "./god/GodLayout";
import GodDashboard from "./god/GodDashboard";
import OrganizationForm from "./god/OrganizationForm";
import OrganizationsList from "./god/OrganizationsList";
import OrganizationUsers from "./god/OrganizationUsers";
import OrganizationStatistics from "./god/OrganizationStatistics";
import AdminDashboard from "./admin/AdminDashboard";
import AdminUsers from "./admin/AdminUsers";
import NotFound from "./pages/NotFound";
import Logout from "./pages/Logout";

function App() {
  return (
    <SnackbarProvider>
      <AuthProvider>
        <SessionExpiryProvider>
          <OrganizationProvider>
            <Router>
              {/* Session Expiry Modal - Global */}
              <SessionExpiryModal />
              <Routes>
                {/* Public Routes - No AppBar */}
                <Route path="/" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/login/god" element={<GodLogin />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify" element={<VerifyOTP />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/mfa-verify" element={<MfaVerify />} />
                <Route path="/oauth-callback" element={<OAuthCallback />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/api-docs" element={<ApiDocsPage />} />

                {/* User Profile Route */}
                <Route path="/profile/:tab?" element={<Profile />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />

                {/* Protected Routes - With AppBar */}
                <Route
                  path="/god/organizations"
                  element={
                    <ProtectedRoute requiredRole="god">
                      <Layout>
                        <GodLayout>
                          <OrganizationsList />
                        </GodLayout>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/god/dashboard"
                  element={
                    <ProtectedRoute requiredRole="god">
                      <Layout>
                        <GodLayout>
                          <GodDashboard />
                        </GodLayout>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/god/organization/create"
                  element={
                    <ProtectedRoute requiredRole="god">
                      <Layout>
                        <GodLayout>
                          <OrganizationForm />
                        </GodLayout>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/god/organization/create/:pageId"
                  element={
                    <ProtectedRoute requiredRole="god">
                      <Layout>
                        <GodLayout>
                          <OrganizationForm />
                        </GodLayout>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/god/organization/update/:orgId"
                  element={
                    <ProtectedRoute requiredRole="god">
                      <Layout>
                        <GodLayout>
                          <OrganizationForm />
                        </GodLayout>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/god/organization/update/:orgId/:pageId"
                  element={
                    <ProtectedRoute requiredRole="god">
                      <Layout>
                        <GodLayout>
                          <OrganizationForm />
                        </GodLayout>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/god/organization/:id/users"
                  element={
                    <ProtectedRoute requiredRole="god">
                      <Layout>
                        <GodLayout>
                          <OrganizationUsers />
                        </GodLayout>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/god/organization/:id/statistics"
                  element={
                    <ProtectedRoute requiredRole="god">
                      <Layout>
                        <GodLayout>
                          <OrganizationStatistics />
                        </GodLayout>
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* 404 - Catch all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <VersionFooter />
            </Router>
          </OrganizationProvider>
        </SessionExpiryProvider>
      </AuthProvider>
    </SnackbarProvider>
  );
}

export default App;
