import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "../../store/authStore";
import { useOnboardingCompleted } from "../../hooks/useUserData";
import { AuthLoadingScreen } from "./AuthLoadingScreen";

const SETUP_PATH = "/setup";

/**
 * Single onboarding guard for all authenticated app routes.
 * Prevents conflicting redirects from parallel layout routes.
 */
export function AuthenticatedGate() {
  const location = useLocation();
  const { initialized, bootstrapping } = useAuthStore();
  const { isCompleted, isLoading, isError } = useOnboardingCompleted();

  if (!initialized || bootstrapping || isLoading) {
    return <AuthLoadingScreen message="Loading your profile…" />;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-black px-8 text-center">
        <p className="text-white/80 text-sm">
          Could not load your profile. Check your connection and try again.
        </p>
      </div>
    );
  }

  const onSetup = location.pathname === SETUP_PATH;

  if (!isCompleted && !onSetup) {
    return <Navigate to={SETUP_PATH} replace />;
  }

  if (isCompleted && onSetup) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
