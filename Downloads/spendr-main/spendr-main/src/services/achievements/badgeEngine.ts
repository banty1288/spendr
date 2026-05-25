import { format, parseISO, startOfDay, startOfWeek, subDays } from "date-fns";
import type { Transaction } from "../../types/transaction";
import type { UserData } from "../../types/user";
import type {
  AchievementDefinition,
  AchievementStatus,
  UserAchievementRecord,
} from "../../types/achievement";

const todayKey = (date: Date) => format(startOfDay(date), "yyyy-MM-dd");

export const badgeDefinitions: AchievementDefinition[] = [
  {
    id: "first_expense_logged",
    title: "First Expense Logged",
    description: "Capture your first expense and start building better habits.",
    category: "consistency",
    rarity: "common",
    icon: "🧾",
    rewardXp: 50,
    total: 1,
    progressLabel: "expense logged",
  },
  {
    id: "seven_day_savings_streak",
    title: "7-Day Savings Streak",
    description: "Keep your daily spending under control for a full week.",
    category: "streak",
    rarity: "rare",
    icon: "🔥",
    rewardXp: 220,
    total: 7,
    progressLabel: "days saved",
  },
  {
    id: "budget_master",
    title: "Budget Master",
    description: "Control spending across 3 categories and earn your first budget badge.",
    category: "budgeting",
    rarity: "uncommon",
    icon: "💼",
    rewardXp: 150,
    total: 3,
    progressLabel: "categories managed",
  },
  {
    id: "impulse_control",
    title: "Impulse Control",
    description: "Stay under a small spending threshold for one week straight.",
    category: "emotional",
    rarity: "rare",
    icon: "🧠",
    rewardXp: 180,
    total: 7,
    progressLabel: "safe days",
  },
  {
    id: "smart_saver",
    title: "Smart Saver",
    description: "Save at least 20% of your income this month.",
    category: "savings",
    rarity: "epic",
    icon: "💎",
    rewardXp: 260,
    total: 20,
    progressLabel: "monthly savings %",
  },
  {
    id: "no_overspending_week",
    title: "No Overspending Week",
    description: "Finish the current week with more income than spending.",
    category: "consistency",
    rarity: "uncommon",
    icon: "✅",
    rewardXp: 120,
    total: 1,
    progressLabel: "week goal",
  },
  {
    id: "financial_discipline_pro",
    title: "Financial Discipline Pro",
    description: "Complete 30 tracked transactions and show consistency.",
    category: "growth",
    rarity: "epic",
    icon: "🚀",
    rewardXp: 320,
    total: 30,
    progressLabel: "transactions tracked",
  },
  {
    id: "onboarding_completion",
    title: "Welcome Aboard",
    description: "Finish onboarding to unlock Spendr’s premium guidance.",
    category: "onboarding",
    rarity: "common",
    icon: "✨",
    rewardXp: 75,
    total: 1,
    progressLabel: "onboarding done",
  },
];

function buildProgressText(def: AchievementDefinition, current: number, total: number) {
  if (def.id === "smart_saver") {
    return `${current}% of ${total}%`;
  }

  if (def.total === 1) {
    return current >= total ? "Completed" : "In progress";
  }

  return `${current} / ${total} ${def.progressLabel}`;
}

function buildDailyMap(transactions: Transaction[]) {
  const map = new Map<string, { income: number; expense: number; maxExpense: number }>();

  for (const transaction of transactions) {
    const key = todayKey(parseISO(transaction.date));
    const existing = map.get(key) ?? { income: 0, expense: 0, maxExpense: 0 };

    if (transaction.type === "income") {
      existing.income += transaction.amount;
    } else {
      existing.expense += transaction.amount;
      existing.maxExpense = Math.max(existing.maxExpense, transaction.amount);
    }

    map.set(key, existing);
  }

  return map;
}

function getWindowDays(days: number) {
  const today = startOfDay(new Date());
  return Array.from({ length: days }, (_, index) =>
    todayKey(subDays(today, index))
  );
}

export function buildAchievementStatuses(
  transactions: Transaction[],
  userData: UserData | null,
  earnedRecords: UserAchievementRecord[] = []
): AchievementStatus[] {
  const dailyMap = buildDailyMap(transactions);
  const last7Days = getWindowDays(7);
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const today = startOfDay(new Date());
  const weekDays = Array.from({ length: 7 }, (_, index) =>
    todayKey(subDays(today, index))
  );

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

  const currentMonthNet = totalIncomeThisMonth - totalExpenseThisMonth;
  const savingsPct =
    totalIncomeThisMonth > 0
      ? Math.round((currentMonthNet / totalIncomeThisMonth) * 100)
      : 0;

  const expenseCategories = new Set(
    transactions
      .filter((transaction) => transaction.type === "expense")
      .map((transaction) => transaction.categoryId)
  );

  const consecutiveSavingsDays = last7Days.reduce((count, dateKey) => {
    const day = dailyMap.get(dateKey);
    return day && day.income - day.expense >= 0 ? count + 1 : count;
  }, 0);

  const safeImpulseDays = last7Days.reduce((count, dateKey) => {
    const day = dailyMap.get(dateKey);
    return day && day.maxExpense <= 40 ? count + 1 : count + (day ? 0 : 1);
  }, 0);

  const currentWeekNet = weekDays.reduce((net, key) => {
    const day = dailyMap.get(key);
    return net + (day ? day.income - day.expense : 0);
  }, 0);

  const expenseCount = transactions.filter((transaction) => transaction.type === "expense").length;

  const earnedLookup = new Set(earnedRecords.map((record) => record.id));

  return badgeDefinitions.map((badge) => {
    let current = 0;

    switch (badge.id) {
      case "first_expense_logged":
        current = expenseCount >= 1 ? 1 : 0;
        break;
      case "seven_day_savings_streak":
        current = consecutiveSavingsDays;
        break;
      case "budget_master":
        current = Math.min(badge.total, expenseCategories.size);
        break;
      case "impulse_control":
        current = safeImpulseDays;
        break;
      case "smart_saver":
        current = Math.min(badge.total, Math.max(0, savingsPct));
        break;
      case "no_overspending_week":
        current = currentWeekNet >= 0 ? 1 : 0;
        break;
      case "financial_discipline_pro":
        current = Math.min(badge.total, transactions.length);
        break;
      case "onboarding_completion":
        current = userData?.onboardingCompleted ? 1 : 0;
        break;
      default:
        current = 0;
    }

    const unlocked = earnedLookup.has(badge.id) || current >= badge.total;
    const earnedRecord = earnedRecords.find((record) => record.id === badge.id);

    return {
      ...badge,
      earned: unlocked,
      unlockedAt: earnedRecord?.unlockedAt,
      current: Math.min(current, badge.total),
      percent: badge.total > 0 ? Math.round((Math.min(current, badge.total) / badge.total) * 100) : 0,
      progressText: buildProgressText(badge, Math.min(current, badge.total), badge.total),
    };
  });
}

export function getAchievementDefinitionById(id: string) {
  return badgeDefinitions.find((badge) => badge.id === id);
}
