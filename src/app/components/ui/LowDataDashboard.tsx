import { motion } from "motion/react";
import { ArrowRight, Sparkles, Target, Wallet } from "lucide-react";

interface LowDataEmptyStateProps {
  transactionsCount: number;
  hasReport: boolean;
  onAddTransaction: () => void;
  onRunAi: () => void;
  onViewReport: () => void;
}

interface ChecklistItem {
  title: string;
  subtitle: string;
  completed: boolean;
}

interface FinancialSetupChecklistProps {
  items: ChecklistItem[];
}

export function LowDataEmptyState({
  transactionsCount,
  hasReport,
  onAddTransaction,
  onRunAi,
  onViewReport,
}: LowDataEmptyStateProps) {
  const target = 5;
  const remaining = Math.max(0, target - transactionsCount);
  const progress = Math.min(100, Math.round((transactionsCount / target) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="rounded-2xl bg-[#00d9ff]/10 p-3 text-[#00d9ff]">
          <Sparkles size={22} />
        </div>
        <div>
          <p className="text-white/70 text-xs uppercase tracking-[0.2em]">Starter intelligence</p>
          <h2 className="text-white text-xl sm:text-2xl font-bold">
            Your financial story is still forming.
          </h2>
        </div>
      </div>

      <p className="text-white/60 text-sm leading-relaxed mb-5 max-w-2xl">
        Spendr learns fastest when you add regular transactions. Complete a few more entries to unlock deeper AI insights, emotional spending patterns, and smarter guidance.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 mb-5">
        <div className="rounded-3xl border border-white/10 bg-background/20 p-4">
          <p className="text-white/50 text-xs uppercase tracking-[0.18em]">Transactions so far</p>
          <p className="text-white text-3xl font-semibold mt-3">{transactionsCount}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-background/20 p-4">
          <p className="text-white/50 text-xs uppercase tracking-[0.18em]">AI unlock progress</p>
          <p className="text-white text-3xl font-semibold mt-3">{progress}%</p>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10 mb-5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-[#00d9ff] to-[#00ff88]"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        <div className="rounded-3xl bg-[#00d9ff]/10 border border-white/10 p-4">
          <p className="text-white/60 text-xs">Next milestone</p>
          <p className="text-white font-semibold text-lg mt-2">
            {remaining} more transaction{remaining === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-3xl bg-[#9d4edd]/10 border border-white/10 p-4">
          <p className="text-white/60 text-xs">Personality</p>
          <p className="text-white font-semibold text-lg mt-2">Still forming</p>
        </div>
        <div className="rounded-3xl bg-[#ffd60a]/10 border border-white/10 p-4">
          <p className="text-white/60 text-xs">Emotional patterns</p>
          <p className="text-white font-semibold text-lg mt-2">Pending</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={onAddTransaction}
          className="rounded-3xl bg-[#00d9ff]/20 px-4 py-3 text-sm font-semibold text-white hover:bg-[#00d9ff]/30 transition-colors"
        >
          <Wallet size={16} className="inline mr-2" />
          Add transaction
        </button>
        <button
          type="button"
          onClick={onRunAi}
          className="rounded-3xl bg-[#00ff88]/10 border border-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-[#00ff88]/15 transition-colors"
        >
          <Sparkles size={16} className="inline mr-2" />
          Run starter AI
        </button>
        <button
          type="button"
          onClick={onViewReport}
          className="rounded-3xl bg-white/5 border border-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
        >
          <ArrowRight size={16} className="inline mr-2" />
          View report
        </button>
      </div>

      <p className="text-white/50 text-xs mt-4">
        Pro tip: Adding a few everyday transactions helps Spendr unlock a stronger, emotionally aware report faster.
      </p>
    </motion.div>
  );
}

export function FinancialSetupChecklist({ items }: FinancialSetupChecklistProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="rounded-2xl bg-[#ffd60a]/10 p-3 text-[#ffd60a]">
          <Target size={22} />
        </div>
        <div>
          <p className="text-white/70 text-xs uppercase tracking-[0.2em]">Growth checklist</p>
          <h3 className="text-white text-lg font-semibold">Build smarter money habits</h3>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-3xl border border-white/10 bg-background/10 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white font-semibold leading-snug">{item.title}</p>
                <p className="text-white/55 text-xs mt-1">{item.subtitle}</p>
              </div>
              <div
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  item.completed ? "bg-[#00ff88]/15 text-[#00ff88]" : "bg-white/10 text-white/70"
                }`}
              >
                {item.completed ? "Done" : "Pending"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
