import { motion } from "motion/react";
import { Sparkles, Target, Trophy, Flame, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/authStore";
import { useUserData } from "../../hooks/useUserData";
import { useTransactions } from "../../hooks/useTransactions";
import { useAchievements } from "../../hooks/useAchievements";
import { format } from "date-fns";

export function Daily() {
  const { t } = useTranslation();
  const authUser = useAuthStore((s) => s.user);
  const { data: userData } = useUserData();
  const { transactions } = useTransactions();
  const { statuses: achievements } = useAchievements(transactions, userData ?? null);

  const streak = userData?.streakDays ?? 0;
  
  // Dummy missions for now
  const missions = [
    { id: 1, title: "Log your first expense", xp: 50, completed: transactions.length > 0 },
    { id: 2, title: "Stay under budget today", xp: 100, completed: false },
    { id: 3, title: "Review AI Insights", xp: 20, completed: true },
  ];

  return (
    <div className="min-h-[100dvh] pb-safe-nav bg-background px-4 md:px-8 lg:px-12 pt-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground">Daily Mission</h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), "EEEE, MMMM do")}
        </p>
      </motion.div>

      {/* Streak & XP Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-card border border-border p-5 rounded-3xl flex flex-col items-center justify-center shadow-lg"
        >
          <div className="bg-[#ff9500]/10 p-3 rounded-2xl mb-3">
            <Flame size={28} className="text-[#ff9500]" />
          </div>
          <h2 className="text-2xl font-black text-foreground">{streak}</h2>
          <p className="text-sm text-muted-foreground font-medium">Day Streak</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-card border border-border p-5 rounded-3xl flex flex-col items-center justify-center shadow-lg"
        >
          <div className="bg-primary/10 p-3 rounded-2xl mb-3">
            <Trophy size={28} className="text-primary" />
          </div>
          <h2 className="text-2xl font-black text-primary">
            {userData?.totalPoints ?? 0}
          </h2>
          <p className="text-sm text-muted-foreground font-medium">Total XP</p>
        </motion.div>
      </div>

      {/* Daily Challenges */}
      <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Target size={20} className="text-accent" />
        Today's Challenges
      </h3>
      
      <div className="space-y-3 mb-8">
        {missions.map((mission, idx) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              mission.completed 
                ? "bg-accent/5 border-accent/20" 
                : "bg-card border-border"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1 rounded-full ${mission.completed ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                <CheckCircle size={16} />
              </div>
              <p className={`font-medium ${mission.completed ? "text-foreground line-through opacity-70" : "text-foreground"}`}>
                {mission.title}
              </p>
            </div>
            <div className="text-sm font-bold text-primary">
              +{mission.xp} XP
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Recommendation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-3xl p-6 relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 text-primary opacity-10">
          <Sparkles size={120} />
        </div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
          <Sparkles size={18} className="text-primary" />
          Finny's Tip
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          You're doing great! Try to log your lunch expense right after you eat to keep your streak alive. Small habits build big wealth.
        </p>
      </motion.div>

    </div>
  );
}
