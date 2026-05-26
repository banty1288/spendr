/**
 * BackButton — Consistent animated back button for all inner screens.
 */
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export function BackButton({ onClick, label }: BackButtonProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={label ?? "Go back"}
      className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/10 hover:bg-white/10 transition-colors shrink-0"
    >
      <ArrowLeft size={20} className="text-white" />
    </motion.button>
  );
}
