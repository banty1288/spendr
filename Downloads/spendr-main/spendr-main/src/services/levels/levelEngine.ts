import { format, parseISO, startOfDay, startOfWeek, subDays } from "date-fns";
import type { AchievementStatus } from "../../types/achievement";
import type { Transaction } from "../../types/transaction";
import type { UserData } from "../../types/user";
import type { FinancialLevelSummary, FinancialMilestone, FinancialXpGain } from "../../types/financialLevel";

const LEVEL_THRESHOLDS = [1, 5, 10, 20, 50, 100];

export function getRankTitle(level: number) {
  if (level >= 50) return "Financial Master";
  if (level >= 20) return "Wealth Strategist";
  if (level >= 10) return "Smart Saver";
  if (level >= 5) return "Budget Builder";
  return "Money Beginner";
}

export function getLevelFromXp(totalXp: number) {
  return Math.max(1, Math.floor(totalXp / 1000) + 1);
}

export function getLevelXpThreshold(level: number) {
  return Math.max(0, (level - 1) * 1000);
}

export function getNextMilestone(level: number): FinancialMilestone {
  const nextThreshold = LEVEL_THRESHOLDS.find((threshold) => level < threshold) ?? (level + 1);
  const label = nextThreshold >= 50
    ? "Reach Financial Mastery"
    : nextThreshold >= 20
    ? "Become a Wealth Strategist"
    : nextThreshold >= 10
    ? "Unlock Smart Saver status"
    : nextThreshold >= 5
    ? "Unlock Budget Builder rank"
    : "Start your money journey";

  return {
    id: `milestone_${nextThreshold}`,
    title: `${label}`,
    description: `Earn ${nextThreshold * 1000 - getLevelXpThreshold(level + 1)} more XP to hit Level ${nextThreshold}.`,
    threshold: nextThreshold,
    unlocked: false,
  };
}

export function buildMilestoneList(level: number): FinancialMilestone[] {
  return LEVEL_THRESHOLDS.map((threshold) => ({
    id: `milestone_${threshold}`,
    title:
      threshold >= 50
        ? "Financial Master"
        : threshold >= 20
        ? "Wealth Strategist"
        : threshold >= 10
        ? "Smart Saver"
        : threshold >= 5
        ? "Budget Builder"
        : "Money Beginner",
    description:
      threshold >= 50
        ? "Elite finance habits, long-term planning, and powerful cash flow management."
        : threshold >= 20
        ? "Strong savings habits and confident spending strategy."
        : threshold >= 10
        ? "Smart saving, better budgeting, and steady money growth."
        : threshold >= 5
        ? "Foundational budgeting and healthier habits."
        : "Start earning XP through transactions and savings.",
    threshold,
    unlocked: level >= threshold,
  }));
}

function todayKey(date: Date) {
  return format(startOfDay(date), "yyyy-MM-dd");
}

function getWindowDays(days: number) {
  const today = startOfDay(new Date());
  return Array.from({ length: days }, (_, index) => todayKey(subDays(today, index)));
}

export function buildFinancialLevelSummary(
  transactions: Transaction[],
  achievements: AchievementStatus[],
  userData: UserData | null
): FinancialLevelSummary {
  const achievementXp = achievements.reduce(
    (sum, status) => (status.earned ? sum + status.rewardXp : sum),
    0
  );

  const transactionXp = Math.min(transactions.length * 20, 2000);

  const dailyMap = new Map<string, { income: number; expense: number; maxExpense: number }>();
  for (const transaction of transactions) {
    const key = todayKey(parseISO(transaction.date));
    const existing = dailyMap.get(key) ?? { income: 0, expense: 0, maxExpense: 0 };
    if (transaction.type === "income") {
      existing.income += transaction.amount;
    } else {
      existing.expense += transaction.amount;
      existing.maxExpense = Math.max(existing.maxExpense, transaction.amount);
    }
    dailyMap.set(key, existing);
  }

  const last7Days = getWindowDays(7);
  const thisWeek = getWindowDays(7);

  const totalIncomeThisMonth = transactions.reduce((sum, transaction) => {
    const date = parseISO(transaction.date);
    return date.getMonth() === new Date().getMonth() &&
      date.getFullYear() === new Date().getFullYear() &&
      transaction.type === "income"
      ? sum + transaction.amount
      : sum;
  }, 0);

  const totalExpenseThisMonth = transactions.reduce((sum, transaction) => {
    const date = parseISO(transaction.date);
    return date.getMonth() === new Date().getMonth() &&
      date.getFullYear() === new Date().getFullYear() &&
      transaction.type === "expense"
      ? sum + transaction.amount
      : sum;
  }, 0);

  const consecutiveSavingsDays = last7Days.reduce((count, dateKey) => {
    const day = dailyMap.get(dateKey);
    return day && day.income - day.expense >= 0 ? count + 1 : count;
  }, 0);

  const safeImpulseDays = last7Days.reduce((count, dateKey) => {
    const day = dailyMap.get(dateKey);
    return day && day.maxExpense <= 40 ? count + 1 : count;
  }, 0);

  const currentWeekNet = thisWeek.reduce((net, key) => {
    const day = dailyMap.get(key);
    return net + (day ? day.income - day.expense : 0);
  }, 0);

  const healthyBudgetXp =
    totalIncomeThisMonth > 0 && totalExpenseThisMonth <= totalIncomeThisMonth * 0.8
      ? 140
      : 0;
  const streakXp = consecutiveSavingsDays >= 7 ? 180 : consecutiveSavingsDays * 10;
  const emotionalXp = safeImpulseDays >= 5 ? 100 : safeImpulseDays * 12;
  const habitXp = userData?.profile?.budgetingHabits?.length ? 80 : 0;
  const checkInXp = currentWeekNet >= 0 ? 90 : 0;

  const behaviorXp = Math.min(
    healthyBudgetXp + streakXp + emotionalXp + habitXp + checkInXp,
    700
  );

  const totalXp = achievementXp + transactionXp + behaviorXp;
  const currentLevel = getLevelFromXp(totalXp);
  const currentXp = totalXp - getLevelXpThreshold(currentLevel);
  const nextLevelXp = getLevelXpThreshold(currentLevel + 1);
  const xpToNext = Math.max(0, nextLevelXp - totalXp);
  const progress = nextLevelXp === 0 ? 100 : Math.min(100, (currentXp / 1000) * 100);

  const gains: FinancialXpGain[] = [
    {
      id: "transactions",
      title: "Transaction Logging",
      subtitle: `${transactions.length} entries captured`,
      xp: transactionXp,
      timestamp: new Date().toISOString(),
    },
    {
      id: "achievements",
      title: "Achievement XP",
      subtitle: `${achievements.filter((status) => status.earned).length} rewards earned`,
      xp: achievementXp,
      timestamp: new Date().toISOString(),
    },
    {
      id: "budget_behavior",
      title: "Healthy spending",
      subtitle: healthyBudgetXp > 0 ? "Under budget this month" : "Improve your spending mix",
      xp: healthyBudgetXp,
      timestamp: new Date().toISOString(),
    },
    {
      id: "savings_streak",
      title: "Savings streak",
      subtitle: `${consecutiveSavingsDays}/7 days under budget`,
      xp: streakXp,
      timestamp: new Date().toISOString(),
    },
    {
      id: "emotional_control",
      title: "Impulse control",
      subtitle: `${safeImpulseDays} safer days this week`,
      xp: emotionalXp,
      timestamp: new Date().toISOString(),
    },
  ];

  const recentGains = gains
    .filter((gain) => gain.xp > 0)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 4);

  return {
    currentLevel,
    currentXp,
    totalXp,
    rankTitle: getRankTitle(currentLevel),
    progress,
    nextLevel: currentLevel + 1,
    nextLevelXp,
    xpToNext,
    nextMilestone: getNextMilestone(currentLevel),
    milestonesUnlocked: buildMilestoneList(currentLevel),
    recentGains,
    achievementXp,
    transactionXp,
    behaviorXp,
    updatedAt: new Date().toISOString(),
  };
}
