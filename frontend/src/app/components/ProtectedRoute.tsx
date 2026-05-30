import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../store/authStore";
import { AuthLoadingScreen } from "./AuthLoadingScreen";

export function ProtectedRoute() {
  const { user, initialized } = useAuthStore();

  if (!initialized) {
    return <AuthLoadingScreen message="Checking session…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
