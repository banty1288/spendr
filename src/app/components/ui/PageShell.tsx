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

export function PageShell({ children, orbs, className = "", extraPad = false }: PageShellProps) {
  const defaultOrbs: OrbConfig[] = orbs ?? [
    { color: "#00d9ff", position: "top-right" },
    { color: "#9d4edd", position: "bottom-left" },
  ];

  return (
    <div className={`min-h-[100dvh] ${extraPad ? "pb-safe-nav" : "pb-safe-nav"} relative overflow-x-clip bg-background ${className}`}>
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {defaultOrbs.map((orb, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.25, 0.18] }}
            transition={{ duration: 14 + i * 4, repeat: Infinity, ease: "easeInOut" }}
            className={`${orbClasses[orb.position]} w-72 h-72 sm:w-96 sm:h-96 rounded-full hidden`}
            style={{ backgroundColor: orb.color }}
          />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04),transparent_60%)]" />
      </div>

      {/* Page enter animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative z-10 w-full min-w-0 max-w-7xl mx-auto"
      >
        {children}
      </motion.div>
    </div>
  );
}
