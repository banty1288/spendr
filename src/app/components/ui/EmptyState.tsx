/**
 * EmptyState — Polished empty state component for all Spendr screens.
 */
import { motion } from "motion/react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  accentColor?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  accentColor = "#00d9ff",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center text-center px-6 py-14"
    >
      {/* Icon orb */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative mb-6"
      >
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-30 scale-150"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="relative w-20 h-20 rounded-3xl flex items-center justify-center border"
          style={{
            backgroundColor: `${accentColor}18`,
            borderColor: `${accentColor}30`,
          }}
        >
          <div style={{ color: accentColor }}>{icon}</div>
        </div>
      </motion.div>

      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed max-w-[260px] mb-6">{description}</p>

      {action && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={action.onClick}
          className="px-6 py-3 rounded-2xl font-semibold text-sm text-black"
          style={{ backgroundColor: accentColor }}
        >
          {action.label}
        </motion.button>
      )}
      {secondaryAction && (
        <button
          onClick={secondaryAction.onClick}
          className="mt-3 text-white/40 text-sm hover:text-white/70 transition-colors"
        >
          {secondaryAction.label}
        </button>
      )}
    </motion.div>
  );
}
