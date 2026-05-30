import { Outlet } from "react-router";
import { BottomNav } from "../BottomNav";
import { AIAssistantPanel } from "../assistant/AIAssistantPanel";
import { AIAssistantTrigger } from "../assistant/AIAssistantTrigger";

/**
 * AppShell is the primary layout for all authenticated tab screens.
 * It ensures the BottomNav is globally persistent and that all screen content
 * naturally pads itself above the navigation bar and device safe-areas.
 * The AI Assistant panel and trigger are mounted here so they overlay any screen
 * without any page navigation or route changes.
 */
export function AppShell() {
  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* 
        The main content area grows to fill space.
        pb-[100px] ensures enough padding for the BottomNav.
        We also add safe-area-inset-bottom so iOS/Android bottom bars don't clip it.
      */}
      <main className="flex-1 pb-[calc(100px+env(safe-area-inset-bottom,0px))] w-full h-full relative z-10">
        <Outlet />
      </main>

      {/* Global Bottom Navigation */}
      <BottomNav />

      {/* Persistent AI Assistant — no routing, overlays current page */}
      <AIAssistantTrigger />
      <AIAssistantPanel />
    </div>
  );
}
