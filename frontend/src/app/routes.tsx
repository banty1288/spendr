import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthenticatedGate } from "./components/AuthenticatedGate";
import { AppShell } from "./components/layout/AppShell";
import { GuestRoute } from "./components/GuestRoute";
import { AuthLoadingScreen } from "./components/AuthLoadingScreen";
import { Splash } from "./screens/Splash";
import { Onboarding } from "./screens/Onboarding";
import { Login } from "./screens/Login";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";
const ScreenLoader = () => <div className="p-4 animate-pulse">Loading...</div>;

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
const FinancialWellness = lazy(() =>
  import("./screens/FinancialWellness").then((m) => ({ default: m.FinancialWellness }))
);
const Daily = lazy(() =>
  import("./screens/Daily").then((m) => ({ default: m.Daily }))
);
const BillSplit = lazy(() =>
  import("./screens/BillSplit").then((m) => ({ default: m.BillSplit }))
);
const Groups = lazy(() =>
  import("./screens/Groups").then((m) => ({ default: m.GroupsPage }))
);
const GroupDetails = lazy(() =>
  import("./screens/GroupDetails").then((m) => ({ default: m.GroupDetails }))
);
const AIBudgetPlanner = lazy(() =>
  import("./screens/AIBudgetPlanner").then((m) => ({ default: m.AIBudgetPlanner }))
);
// VoiceAssistant is now embedded via AIAssistantPanel in AppShell — no route needed

const Profile = lazy(() =>
  import("./screens/Profile").then((m) => ({ default: m.Profile }))
);
const WeeklyReport = lazy(() =>
  import("./screens/WeeklyReport").then((m) => ({ default: m.WeeklyReport }))
);

const PersonalInfo = lazy(() => import("./screens/settings/PersonalInfo").then(m => ({ default: m.PersonalInfo })));
const Notifications = lazy(() => import("./screens/settings/Notifications").then(m => ({ default: m.Notifications })));
const Security = lazy(() => import("./screens/settings/Security").then(m => ({ default: m.Security })));
const LinkedAccounts = lazy(() => import("./screens/settings/LinkedAccounts").then(m => ({ default: m.LinkedAccounts })));
const AppSettings = lazy(() => import("./screens/settings/AppSettings").then(m => ({ default: m.AppSettings })));
const HelpSupport = lazy(() => import("./screens/settings/HelpSupport").then(m => ({ default: m.HelpSupport })));

function LazyScreen({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ScreenLoader />}>
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <RouteErrorBoundary />,
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
                path: "weekly-report",
                element: (
                  <LazyScreen>
                    <WeeklyReport />
                  </LazyScreen>
                ),
              },
              {
                element: <AppShell />,
                children: [
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
                    path: "financial-wellness",
                    element: (
                      <LazyScreen>
                        <FinancialWellness />
                      </LazyScreen>
                    ),
                  },
                  {
                    path: "daily",
                    element: (
                      <LazyScreen>
                        <Daily />
                      </LazyScreen>
                    ),
                  },
                  {
                    path: "bill-split",
                    element: (
                      <LazyScreen>
                        <BillSplit />
                      </LazyScreen>
                    ),
                  },
                  {
                    path: "groups",
                    element: (
                      <LazyScreen>
                        <Groups />
                      </LazyScreen>
                    ),
                  },
                  {
                    path: "groups/:groupId",
                    element: (
                      <LazyScreen>
                        <GroupDetails />
                      </LazyScreen>
                    ),
                  },
                  {
                    path: "budget-planner",
                    element: (
                      <LazyScreen>
                        <AIBudgetPlanner />
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
                ]
              },
              // /assistant route removed — AI assistant is now a persistent embedded panel in AppShell

              { path: "settings/personal-info", element: <LazyScreen><PersonalInfo /></LazyScreen> },
              { path: "settings/notifications", element: <LazyScreen><Notifications /></LazyScreen> },
              { path: "settings/security", element: <LazyScreen><Security /></LazyScreen> },
              { path: "settings/linked-accounts", element: <LazyScreen><LinkedAccounts /></LazyScreen> },
              { path: "settings/app", element: <LazyScreen><AppSettings /></LazyScreen> },
              { path: "settings/support", element: <LazyScreen><HelpSupport /></LazyScreen> },
            ],
          },
        ],
      },
    ],
  },
]);
