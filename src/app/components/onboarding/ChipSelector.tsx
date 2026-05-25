import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { SelectOption } from "../../../lib/onboarding/constants";

interface ChipSelectorProps {
  options: SelectOption[];
  selected: string[];
  onToggle: (id: string) => void;
  multi?: boolean;
  maxSelections?: number;
}

export function ChipSelector({
  options,
  selected,
  onToggle,
  multi = true,
  maxSelections,
}: ChipSelectorProps) {
  const handleToggle = (id: string) => {
    if (!multi) {
      onToggle(id);
      return;
    }
    if (selected.includes(id)) {
      onToggle(id);
      return;
    }
    if (maxSelections && selected.length >= maxSelections) return;
    onToggle(id);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const active = selected.includes(opt.id);
        const disabled =
          multi &&
          !!maxSelections &&
          !active &&
          selected.length >= maxSelections;

        return (
          <motion.button
            key={opt.id}
            type="button"
            whileTap={{ scale: disabled ? 1 : 0.96 }}
            disabled={disabled}
            onClick={() => handleToggle(opt.id)}
            className={`relative flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 text-left ${
              active
                ? "bg-white/10 border-white/30 shadow-lg shadow-white/5"
                : disabled
                  ? "bg-white/[0.02] border-white/[0.04] opacity-40 cursor-not-allowed"
                  : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
            }`}
          >
            {active && (
              <motion.div
                layoutId={multi ? undefined : "onboarding-chip-active"}
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
            <span className="text-2xl relative z-10">{opt.emoji}</span>
            <span className="text-sm font-medium text-white/90 relative z-10">
              {opt.label}
            </span>
            {active && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00ff88] flex items-center justify-center z-10"
              >
                <Check size={12} className="text-black" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
