import { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { auth } from "../lib/firebase";

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      queryClient.clear();
      navigate("/login", { replace: true });
      toast.success("Signed out successfully");
    } catch {
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
}
