import { motion } from "motion/react";

interface AiInsightSectionProps {
  title: string;
  accent?: string;
  children: React.ReactNode;
  delay?: number;
}

export function AiInsightSection({
  title,
  accent = "#9d4edd",
  children,
  delay = 0,
}: AiInsightSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/5 backdrop-blur-sm p-5 rounded-3xl border border-white/10 mb-4"
    >
      <h3
        className="text-white font-bold mb-3 text-sm uppercase tracking-wide"
        style={{ color: accent }}
      >
        {title}
      </h3>
      {children}
    </motion.div>
  );
}
