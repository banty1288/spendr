import { motion } from "motion/react";
import { Check } from "lucide-react";

interface PillSelectorProps {
  options: readonly string[] | string[];
  selected: string;
  onSelect: (value: string) => void;
}

export function PillSelector({ options, selected, onSelect }: PillSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <motion.button
            key={opt}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(opt)}
            className={`relative w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all duration-300 ${
              active
                ? "bg-white/10 border-white/30 text-white shadow-lg shadow-white/5"
                : "bg-white/[0.03] border-white/[0.06] text-white/60 hover:bg-white/[0.06] hover:text-white/80"
            }`}
          >
            <span className="relative z-10">{opt}</span>
            {active && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1/2 -translate-y-1/2 right-4 w-5 h-5 rounded-full bg-[#00ff88] flex items-center justify-center z-10"
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
