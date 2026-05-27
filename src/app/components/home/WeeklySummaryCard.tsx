import { motion } from "motion/react";
import { CalendarDays, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import type { WeeklyReport } from "../../../types/weeklyReport";

interface WeeklySummaryCardProps {
  report: WeeklyReport | null;
  isLoading: boolean;
}

export function WeeklySummaryCard({ report, isLoading }: WeeklySummaryCardProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-card shadow-sm  p-5 rounded-3xl border border-border mb-6 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-white/10 rounded" />
          <div className="h-4 w-32 bg-white/10 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-white/10 rounded-full" />
          <div className="h-4 w-full bg-white/10 rounded-full" />
          <div className="h-4 w-2/3 bg-white/10 rounded-full" />
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-card shadow-sm  p-5 rounded-3xl border border-border mb-6 cursor-pointer group"
      onClick={() => navigate("/analytics")} // Or /insights
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-white/70">
          <CalendarDays size={18} className="text-[#00d9ff]" />
          <span className="font-medium text-sm">Weekly Recap</span>
          <span className="text-white/30 text-xs">· {report.periodLabel}</span>
        </div>
        <ArrowRight size={16} className="text-white/30 group-hover:text-white/70 transition-colors" />
      </div>
      
      <p className="text-white/90 text-sm leading-relaxed mb-4">
        {report.trendSummary}
      </p>

      {report.wins && report.wins.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {report.wins.slice(0, 2).map((win, idx) => (
            <span key={idx} className="bg-card text-[#00d9ff] px-2.5 py-1 rounded-full text-[10px] font-medium border border-[#00d9ff]/20">
              {win.title}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
