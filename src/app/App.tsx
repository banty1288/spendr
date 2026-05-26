import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { router } from "./routes";
import { useUserData } from "../hooks/useUserData";

function ThemeController() {
  const { data: userData } = useUserData();
  const theme = userData?.settings?.app?.theme || "dark";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return null;
}

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function App() {
  return (
    <AppErrorBoundary name="app">
      <ThemeController />
      <div className="min-h-screen transition-colors duration-300">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
            </div>
          }
        >
          <RouterProvider router={router} />
        </Suspense>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            },
          }}
        />
      </div>
    </AppErrorBoundary>
  );
}
