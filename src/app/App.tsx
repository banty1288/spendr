import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { router } from "./routes";

export default function App() {
  return (
    <AppErrorBoundary name="app">
      <div className="dark min-h-screen">
        <RouterProvider router={router} />
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "#0a0a14",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
            },
          }}
        />
      </div>
    </AppErrorBoundary>
  );
}
