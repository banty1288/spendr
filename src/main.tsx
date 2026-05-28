import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { logger } from "./lib/logger";
import "./store/authStore";
import "./lib/i18n"; // Fix i18n initialization
import App from "./app/App.tsx";
import "./styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

/** Log unhandled promise rejections without taking down the UI */
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    logger.fatal("Unhandled promise rejection", event.reason);
    if (import.meta.env.PROD) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <GlobalErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </GlobalErrorBoundary>
);
