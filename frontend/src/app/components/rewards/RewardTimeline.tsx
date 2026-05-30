import { motion } from "motion/react";
import { Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { RewardEvent } from "../../../types/reward";

interface RewardTimelineProps {
  rewards: RewardEvent[];
}

export function RewardTimeline({ rewards }: RewardTimelineProps) {
  if (rewards.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <p className="text-white/40 text-sm">No recent reward activity.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[1.15rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-white/10 before:to-transparent">
      {rewards.map((reward, index) => (
        <motion.div
          key={reward.id}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative flex items-center justify-between group is-active"
        >
          {/* Timeline Dot */}
          <div className="absolute left-[-2.25rem] flex h-8 w-8 items-center justify-center rounded-full bg-black border-2 border-[#00ff88]/30 shadow-[0_0_10px_rgba(0,255,136,0.2)]">
            <span className="text-sm">{reward.icon || "✨"}</span>
          </div>

          <div className="bg-card shadow-sm  p-4 rounded-2xl border border-border flex items-center gap-4 w-full ml-4 hover:bg-white/10 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{reward.title}</p>
              <p className="text-white/40 text-xs truncate">{reward.subtitle}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-card to-card px-3 py-1 rounded-full">
                <Zap size={14} className="text-[#00ff88]" />
                <span className="text-[#00ff88] font-bold text-sm">+{reward.xp}</span>
              </div>
              <span className="text-white/30 text-[10px]">
                {formatDistanceToNow(new Date(reward.timestamp), { addSuffix: true })}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
