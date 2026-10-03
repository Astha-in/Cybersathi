import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import AppLayout from "./components/layout/AppLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import GoogleCallback from "./pages/GoogleCallback";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import History from "./pages/History";
import Settings from "./pages/Settings";

/**
 * Blocks rendering until AuthContext finishes its startup /auth/me check.
 * - While isLoading: render nothing (avoids flash-of-login-page).
 * - After loading: redirect to /login only when definitively unauthenticated.
 * This allows the token-refresh flow inside authenticatedFetch to complete
 * before we decide whether the user is logged in.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    // Auth check in progress — render nothing to avoid flickering.
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isLoading, isAuthenticated } = useAuth();

  // Still verifying session — render nothing.
  if (isLoading) {
    return null;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Register />
          )
        }
      />

      {/* Google OAuth Callback */}
      <Route
        path="/google-callback"
        element={<GoogleCallback />}
      />
      <Route
        path="/auth/google/callback"
        element={<GoogleCallback />}
      />

      {/* Protected application */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Default route */}
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />

      {/* Unknown routes */}
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default AppRoutes;
