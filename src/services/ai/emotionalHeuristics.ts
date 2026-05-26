import { getHours, getDay, parseISO } from "date-fns";
import type { Transaction } from "../../types/transaction";
import type { UserData } from "../../types/user";
import type {
  EmotionalInsightCard,
  EmotionalPatternType,
  EmotionalRiskLevel,
  EmotionalSpendingInsights,
  SpendingBehaviorTimelineItem,
} from "../../types/emotionalInsight";
import { getCategoryById } from "../../lib/transactions/constants";
import { formatCurrency } from "../../lib/userDisplay";

const SUBSCRIPTION_WORDS = [
  "netflix",
  "spotify",
  "prime",
  "icloud",
  "subscription",
  "youtube",
  "hulu",
  "membership",
  "patreon",
  "adobe",
];

function riskLevel(score: number): EmotionalRiskLevel {
  if (score >= 70) return "high";
  if (score >= 42) return "medium";
  return "low";
}

function confidence(count: number, total: number): number {
  if (total <= 0) return 45;
  return Math.round(Math.min(92, 52 + (count / total) * 80));
}

function sum(transactions: Transaction[]) {
  return transactions.reduce((total, tx) => total + (tx.baseAmountUsd ?? tx.amount), 0);
}

function expenseTransactions(transactions: Transaction[]) {
  return transactions.filter((tx) => tx.type === "expense");
}

function buildCard(params: {
  type: EmotionalPatternType;
  title: string;
  summary: string;
  evidence: string;
  recommendation: string;
  severity: EmotionalRiskLevel;
  confidence: number;
}): EmotionalInsightCard {
  return params;
}

export function generateEmotionalHeuristicInsights(
  userData: UserData | null | undefined,
  transactions: Transaction[],
  fingerprint: string
): EmotionalSpendingInsights {
  const expenses = expenseTransactions(transactions);
  const totalExpense = sum(expenses);
  const profile = userData?.profile;

  const lateNight = expenses.filter((tx) => {
    const hour = getHours(parseISO(tx.date));
    return hour >= 21 || hour < 5;
  });
  const weekend = expenses.filter((tx) => {
    const day = getDay(parseISO(tx.date));
    return day === 0 || day === 6;
  });
  const shopping = expenses.filter((tx) =>
    ["shopping", "entertainment", "travel"].includes(tx.categoryId)
  );
  const comfort = expenses.filter((tx) =>
    ["food", "entertainment", "health"].includes(tx.categoryId)
  );
  const recurringMap = new Map<string, Transaction[]>();
  for (const tx of expenses) {
    const key = tx.merchant.trim().toLowerCase();
    if (!key) continue;
    recurringMap.set(key, [...(recurringMap.get(key) ?? []), tx]);
  }
  const recurring = [...recurringMap.values()].filter((items) => items.length >= 2);
  const subscriptions = expenses.filter((tx) => {
    const label = `${tx.merchant} ${tx.notes}`.toLowerCase();
    return SUBSCRIPTION_WORDS.some((word) => label.includes(word));
  });

  const alerts: EmotionalInsightCard[] = [];
  const behavioralInsights: EmotionalInsightCard[] = [];
  const timeline: SpendingBehaviorTimelineItem[] = [];

  if (lateNight.length > 0) {
    const amount = sum(lateNight);
    alerts.push(
      buildCard({
        type: "late_night",
        title: "Late-night spending signal",
        summary: "Your spending has activity during lower-control hours.",
        evidence: `${lateNight.length} late-night expense${lateNight.length === 1 ? "" : "s"} totaling ${formatCurrency(amount)}.`,
        recommendation: "Add a next-morning review rule for non-essential purchases after 9pm.",
        severity: amount > totalExpense * 0.25 ? "high" : "medium",
        confidence: confidence(lateNight.length, expenses.length),
      })
    );
    timeline.push({
      label: "Late-night purchases",
      description: `${formatCurrency(amount)} spent during late-night windows.`,
      amount,
      riskLevel: amount > totalExpense * 0.25 ? "high" : "medium",
    });
  }

  if (weekend.length > 0) {
    const amount = sum(weekend);
    const weekdayAmount = Math.max(1, totalExpense - amount);
    const spike = amount / weekdayAmount;
    behavioralInsights.push(
      buildCard({
        type: "weekend_spike",
        title: "Weekend spending spike",
        summary: "Weekend decisions may be driving a larger share of discretionary spend.",
        evidence: `${formatCurrency(amount)} spent on weekends, ${spike.toFixed(1)}x weekday spending.`,
        recommendation: "Set a weekend spending cap before Friday evening.",
        severity: spike >= 1 ? "high" : "medium",
        confidence: confidence(weekend.length, expenses.length),
      })
    );
    timeline.push({
      label: "Weekend pressure",
      description: `${weekend.length} weekend expense${weekend.length === 1 ? "" : "s"} detected.`,
      amount,
      riskLevel: spike >= 1 ? "high" : "medium",
    });
  }

  if (shopping.length > 0) {
    const amount = sum(shopping);
    alerts.push(
      buildCard({
        type: "impulse",
        title: "Impulse category drift",
        summary: "Shopping, entertainment, or travel purchases are creating impulse risk.",
        evidence: `${formatCurrency(amount)} across ${shopping.length} discretionary transaction${shopping.length === 1 ? "" : "s"}.`,
        recommendation: "Use a 24-hour hold for non-essential purchases above your comfort threshold.",
        severity: amount > totalExpense * 0.35 ? "high" : "medium",
        confidence: confidence(shopping.length, expenses.length),
      })
    );
  }

  if (comfort.length > 0 && profile?.emotionalTriggers?.length) {
    const amount = sum(comfort);
    behavioralInsights.push(
      buildCard({
        type: "comfort",
        title: "Comfort spending pattern",
        summary: "Your onboarding triggers overlap with categories often used for emotional relief.",
        evidence: `${formatCurrency(amount)} in comfort-adjacent categories: ${profile.emotionalTriggers.join(", ")}.`,
        recommendation: "Pair the trigger with a no-cost reset habit before buying.",
        severity: amount > totalExpense * 0.3 ? "high" : "medium",
        confidence: 74,
      })
    );
  }

  if (recurring.length > 0) {
    const recurringTx = recurring.flat();
    const amount = sum(recurringTx);
    behavioralInsights.push(
      buildCard({
        type: "recurring",
        title: "Recurring purchase loop",
        summary: "Repeated merchants may indicate habitual emotional spending.",
        evidence: `${recurring.length} repeated merchant${recurring.length === 1 ? "" : "s"} totaling ${formatCurrency(amount)}.`,
        recommendation: "Review recurring merchants and keep only those still aligned with your goals.",
        severity: amount > totalExpense * 0.25 ? "high" : "medium",
        confidence: confidence(recurringTx.length, expenses.length),
      })
    );
  }

  if (subscriptions.length > 0) {
    const amount = sum(subscriptions);
    alerts.push(
      buildCard({
        type: "subscription_creep",
        title: "Subscription creep",
        summary: "Recurring services can quietly reduce your monthly savings room.",
        evidence: `${subscriptions.length} possible subscription charge${subscriptions.length === 1 ? "" : "s"} totaling ${formatCurrency(amount)}.`,
        recommendation: "Cancel or pause one unused subscription this week.",
        severity: amount > totalExpense * 0.18 ? "high" : "medium",
        confidence: confidence(subscriptions.length, expenses.length),
      })
    );
  }

  if (alerts.length === 0 && behavioralInsights.length === 0) {
    behavioralInsights.push(
      buildCard({
        type: "stress",
        title: "Pattern baseline forming",
        summary: "Spendr needs more transaction history to identify stronger emotional signals.",
        evidence: `${transactions.length} transaction${transactions.length === 1 ? "" : "s"} available for analysis.`,
        recommendation: "Keep logging purchases and tag notes when mood influences a transaction.",
        severity: "low",
        confidence: 48,
      })
    );
  }

  const highSeverity = [...alerts, ...behavioralInsights].filter(
    (item) => item.severity === "high"
  ).length;
  const mediumSeverity = [...alerts, ...behavioralInsights].filter(
    (item) => item.severity === "medium"
  ).length;
  const emotionalRiskScore = Math.min(
    100,
    Math.round(22 + highSeverity * 22 + mediumSeverity * 12 + Math.min(20, expenses.length * 1.5))
  );
  const topCategory = expenses
    .reduce((map, tx) => {
      map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + (tx.baseAmountUsd ?? tx.amount));
      return map;
    }, new Map<string, number>());
  const topCategoryId = [...topCategory.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const topCategoryName = topCategoryId ? getCategoryById(topCategoryId).label : "discretionary spending";
  const triggers = [
    ...(profile?.emotionalTriggers ?? []),
    lateNight.length ? "Late-night browsing" : "",
    weekend.length ? "Weekend social pressure" : "",
    shopping.length ? "Impulse shopping" : "",
    subscriptions.length ? "Passive subscriptions" : "",
  ].filter(Boolean);

  return {
    emotionalRiskScore,
    riskLevel: riskLevel(emotionalRiskScore),
    alerts: alerts.slice(0, 4),
    behavioralInsights: behavioralInsights.slice(0, 4),
    triggerAnalysis: {
      primaryTriggers: triggers.slice(0, 5),
      summary: `Your strongest current signal is ${topCategoryName}. Watch it when emotion, convenience, or reward-seeking is high.`,
    },
    savingsWarnings: [
      totalExpense > 0
        ? `${formatCurrency(Math.max(0, sum([...lateNight, ...shopping, ...subscriptions])))} is tied to higher-risk emotional patterns.`
        : "No expense history yet. Add transactions to unlock savings warnings.",
      "Small recurring charges deserve a monthly review because they reduce savings without a fresh decision.",
    ],
    coachingRecommendations: [
      "Name the emotion before buying. If it is stress, delay the purchase by 20 minutes.",
      "Create one weekend limit before plans begin.",
      "Move a small amount to savings before discretionary spending starts.",
    ],
    habitSuggestions: [
      "Use a 24-hour rule for shopping and entertainment purchases.",
      "Review subscriptions every Sunday.",
      "Add notes to purchases that were driven by mood or reward.",
    ],
    motivationalFeedback:
      "You are not trying to remove joy from spending. You are building enough awareness to choose it on purpose.",
    timeline: timeline.slice(0, 5),
    generatedAt: new Date().toISOString(),
    fingerprint,
  };
}
