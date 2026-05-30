import { useRouteError } from "react-router";
import { ErrorFallback } from "./ErrorFallback";
import { logAppError } from "../../lib/errorReporting";

export function RouteErrorBoundary() {
  const error = useRouteError();

  // Route errors can sometimes be plain strings or Response objects from loaders
  let normalizedError: Error;
  if (error instanceof Error) {
    normalizedError = error;
  } else if (typeof error === "string") {
    normalizedError = new Error(error);
  } else if (error && typeof error === "object" && "status" in error && "statusText" in error) {
    // It's a React Router response object (e.g., 404, 500)
    normalizedError = new Error(`${(error as any).status} ${(error as any).statusText}`);
  } else {
    normalizedError = new Error("An unknown routing error occurred.");
  }

  // Optionally log the error to your reporting service
  logAppError(normalizedError);

  const handleRetry = () => {
    // For route errors, retrying often means reloading or going back
    window.location.reload();
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <ErrorFallback
      error={normalizedError}
      onRetry={handleRetry}
      onReload={handleReload}
    />
  );
}
