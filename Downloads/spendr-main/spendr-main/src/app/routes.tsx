import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthenticatedGate } from "./components/AuthenticatedGate";
import { GuestRoute } from "./components/GuestRoute";
import { AuthLoadingScreen } from "./components/AuthLoadingScreen";
import { Splash } from "./screens/Splash";
import { Onboarding } from "./screens/Onboarding";
import { Login } from "./screens/Login";

const OnboardingFlow = lazy(() =>
  import("./screens/OnboardingFlow").then((m) => ({ default: m.OnboardingFlow }))
);
const Home = lazy(() =>
  import("./screens/Home").then((m) => ({ default: m.Home }))
);
const Transactions = lazy(() =>
  import("./screens/Transactions").then((m) => ({ default: m.Transactions }))
);
const AIInsights = lazy(() =>
  import("./screens/AIInsights").then((m) => ({ default: m.AIInsights }))
);
const MoneyPersonality = lazy(() =>
  import("./screens/MoneyPersonality").then((m) => ({
    default: m.MoneyPersonality,
  }))
);
const Analytics = lazy(() =>
  import("./screens/Analytics").then((m) => ({ default: m.Analytics }))
);
const Savings = lazy(() =>
  import("./screens/Savings").then((m) => ({ default: m.Savings }))
);
const Gamification = lazy(() =>
  import("./screens/Gamification").then((m) => ({ default: m.Gamification }))
);
const Premium = lazy(() =>
  import("./screens/Premium").then((m) => ({ default: m.Premium }))
);
const Profile = lazy(() =>
  import("./screens/Profile").then((m) => ({ default: m.Profile }))
);
const WeeklyReport = lazy(() =>
  import("./screens/WeeklyReport").then((m) => ({ default: m.WeeklyReport }))
);

function LazyScreen({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AuthLoadingScreen message="Loading…" />}>
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Splash },
      { path: "onboarding", Component: Onboarding },
      {
        element: <GuestRoute />,
        children: [{ path: "login", Component: Login }],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AuthenticatedGate />,
            children: [
              {
                path: "setup",
                element: (
                  <LazyScreen>
                    <OnboardingFlow />
                  </LazyScreen>
                ),
              },
              {
                path: "home",
                element: (
                  <LazyScreen>
                    <Home />
                  </LazyScreen>
                ),
              },
              {
                path: "transactions",
                element: (
                  <LazyScreen>
                    <Transactions />
                  </LazyScreen>
                ),
              },
              {
                path: "insights",
                element: (
                  <LazyScreen>
                    <AIInsights />
                  </LazyScreen>
                ),
              },
              {
                path: "personality",
                element: (
                  <LazyScreen>
                    <MoneyPersonality />
                  </LazyScreen>
                ),
              },
              {
                path: "analytics",
                element: (
                  <LazyScreen>
                    <Analytics />
                  </LazyScreen>
                ),
              },
              {
                path: "savings",
                element: (
                  <LazyScreen>
                    <Savings />
                  </LazyScreen>
                ),
              },
              {
                path: "gamification",
                element: (
                  <LazyScreen>
                    <Gamification />
                  </LazyScreen>
                ),
              },
              {
                path: "premium",
                element: (
                  <LazyScreen>
                    <Premium />
                  </LazyScreen>
                ),
              },
              {
                path: "profile",
                element: (
                  <LazyScreen>
                    <Profile />
                  </LazyScreen>
                ),
              },
              {
                path: "weekly-report",
                element: (
                  <LazyScreen>
                    <WeeklyReport />
                  </LazyScreen>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
]);
