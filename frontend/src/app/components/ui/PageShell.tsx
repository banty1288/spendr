/**
 * PageShell — Standard full-screen page wrapper for all Spendr screens.
 * Provides:
 *  - consistent dark background
 *  - animated ambient background orbs
 *  - safe bottom padding for BottomNav
 *  - no horizontal overflow
 *  - smooth page enter animation
 */
import { motion } from "motion/react";
import { memo } from "react";
import type { ReactNode } from "react";

interface OrbConfig {
  color: string;
  position: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "center";
}

interface PageShellProps {
  children: ReactNode;
  orbs?: OrbConfig[];
  className?: string;
  /** Extra bottom padding beyond the default pb-28 */
  extraPad?: boolean;
}

const orbClasses: Record<OrbConfig["position"], string> = {
  "top-right": "absolute -top-20 right-[-80px]",
  "top-left": "absolute -top-20 left-[-80px]",
  "bottom-right": "absolute bottom-0 right-[-80px]",
  "bottom-left": "absolute bottom-0 left-[-80px]",
  "center": "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};

export const PageShell = memo(function PageShell({ children, orbs, className = "", extraPad = false }: PageShellProps) {
  const defaultOrbs: OrbConfig[] = orbs ?? [
    { color: "#00d9ff", position: "top-right" },
    { color: "#9d4edd", position: "bottom-left" },
  ];

  return (
    <div className={`min-h-[100dvh] ${extraPad ? "pb-[150px]" : "pb-[100px]"} relative overflow-x-clip bg-background ${className}`}>
      {/* Ambient background — static divs (no animation for performance) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {defaultOrbs.map((orb, i) => (
          <div
            key={i}
            className={`${orbClasses[orb.position]} w-72 h-72 sm:w-96 sm:h-96 rounded-full hidden opacity-20`}
            style={{ backgroundColor: orb.color }}
          />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04),transparent_60%)]" />
      </div>

      {/* Page content */}
      <div className="relative z-10 w-full min-w-0 max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
});
