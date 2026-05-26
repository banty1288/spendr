import type { AiUserContext, SpendrAIAnalysis } from "./types";

/** Development fallback when quota is exceeded */
export function getDevMockAnalysis(context: AiUserContext): SpendrAIAnalysis {
  const name = context.displayName.split(" ")[0] || "there";

  return {
    spendingAnalysis: {
      summary: `${name}, your recent activity shows a mix of steady essentials and a few discretionary peaks. This is a development preview while Gemini quota resets.`,
      topCategories: ["Food & Dining", "Transport", "Entertainment"],
      trends:
        "Weekday spending is lower than weekends. Consider setting a weekend budget cap.",
    },
    emotionalSpending: {
      summary:
        "Spending may increase during stress or social events — common pattern for your profile.",
      triggers: ["Stress", "Social outings", "Late-night browsing"],
      patterns: "Emotional purchases cluster after 8pm on Fridays.",
    },
    savingsRecommendations: {
      headline: "Three quick wins for your savings",
      recommendations: [
        "Automate a small transfer on payday before discretionary spending.",
        "Set a 24-hour rule for non-essential purchases over ₹4000.",
        "Review subscriptions and cancel one unused service this week.",
      ],
      projectedAnnualSavings: "Up to ₹100,000/year with consistent habits",
    },
    financialInsights: {
      summary: `Hi ${name} — you're building good awareness. Focus on one habit this week: pause before impulse buys.`,
      healthScore: 78,
      disciplinePercent: 82,
      cards: [
        {
          type: "strength",
          title: "Consistent Tracking",
          description: "You're logging transactions regularly, which improves forecast accuracy.",
          metric: `${context.transactionCount} logged`,
        },
        {
          type: "weakness",
          title: "Discretionary Drift",
          description: "Non-essential categories may be creeping above your target range.",
          metric: "Review top 3 categories",
        },
        {
          type: "trigger",
          title: "Weekend Spike",
          description: "Social and entertainment spending tends to rise on weekends.",
          metric: "2.1× vs weekdays",
        },
        {
          type: "suggestion",
          title: "Pay Yourself First",
          description: "Move a fixed amount to savings immediately after income deposits.",
          metric: "₹4000–8000 / pay cycle",
        },
      ],
    },
    weeklySummary: {
      periodLabel: "This week",
      summary:
        "Net cash flow is stable. Biggest opportunity: reduce small recurring charges.",
      highlights: [
        "Income and expenses are balanced",
        "One category dominates spending",
        "Savings goal progress is on track",
      ],
    },
    coaching: {
      title: "Your coach says",
      message:
        "Pick one spending trigger to watch this week. Awareness beats perfection.",
      actionStep: "Set a ₹3000 weekend fun budget in Spendr.",
    },
  };
}
