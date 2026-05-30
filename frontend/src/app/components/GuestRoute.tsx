import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../store/authStore";
import { useOnboardingCompleted } from "../../hooks/useUserData";
import { AuthLoadingScreen } from "./AuthLoadingScreen";

/** Public routes (e.g. login) — redirects authenticated users into the app. */
export function GuestRoute() {
  const { user, initialized, bootstrapping } = useAuthStore();
  const { isCompleted, isLoading, isError } = useOnboardingCompleted();

  if (!initialized) {
    return <AuthLoadingScreen message="Checking session…" />;
  }

  if (!user) {
    return <Outlet />;
  }

  if (bootstrapping || isLoading) {
    return <AuthLoadingScreen message="Loading your profile…" />;
  }

  if (isError) {
    return <Outlet />;
  }

  return <Navigate to={isCompleted ? "/home" : "/setup"} replace />;
}
