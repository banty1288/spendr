import type { Transaction } from "../../types/transaction";
import type { UserData } from "../../types/user";

export interface WeeklyReportPromptContext {
  uid: string;
  displayName: string;
  email: string;
  weekStartDate: string;
  weekEndDate: string;
  periodLabel: string;
  transactions: Transaction[];
  previousWeekExpenses: number;
  savingsGoals?: string[];
  spendingProfile?: string;
  emotionalTriggers?: string[];
}

export function buildWeeklyReportPrompt(context: WeeklyReportPromptContext): string {
  const transactionDetails = context.transactions
    .map(
      (t) =>
        `- ${t.merchant}: ₹${t.amount.toFixed(2)} (${t.type}, ${t.categoryId}, ${new Date(t.date).toLocaleDateString()})`
    )
    .join("\n");

  const period = `${new Date(context.weekStartDate).toLocaleDateString()} - ${new Date(context.weekEndDate).toLocaleDateString()}`;

  return `You are an expert financial coach analyzing spending patterns for a premium wealth management app. Generate a comprehensive, emotionally intelligent weekly financial report.

USER CONTEXT:
- Name: ${context.displayName}
- Period: ${period} (${context.periodLabel})
- Spending Profile: ${context.spendingProfile || "General user"}
- Known Emotional Triggers: ${context.emotionalTriggers?.join(", ") || "Not specified"}
- Savings Goals: ${context.savingsGoals?.join(", ") || "Not specified"}
- Previous Week Expenses: ₹${context.previousWeekExpenses.toFixed(2)}

TRANSACTIONS THIS WEEK:
${transactionDetails}

TASK: Generate a JSON response with this exact structure. Be specific, data-driven, and emotionally intelligent:

{
  "periodLabel": "${context.periodLabel}",
  "totalIncome": <number>,
  "totalExpenses": <number>,
  "netCashFlow": <number>,
  "expenseChange": <number>,
  "categoryBreakdown": [
    {
      "categoryId": "string",
      "categoryName": "string",
      "amount": <number>,
      "percentOfTotal": <number>,
      "trend": "up|down|neutral",
      "trendPercent": <number>
    }
  ],
  "wins": [
    {
      "title": "string",
      "description": "string",
      "impact": "savings|discipline|consistency",
      "amount": <number or null>
    }
  ],
  "highlightSummary": "1-2 sentence narrative of positive behaviors",
  "riskyBehaviors": [
    {
      "type": "impulse|emotional|recurring|outlier",
      "description": "string",
      "category": "string",
      "amount": <number>,
      "confidence": <0-100>,
      "suggestion": "actionable advice string"
    }
  ],
  "riskAssessment": "1 sentence overall risk level assessment",
  "emotionalTrends": [
    {
      "date": "ISO date",
      "spendingType": "rational|emotional|impulse",
      "amount": <number>,
      "note": "optional context"
    }
  ],
  "emotionalInsight": "2-3 sentence analysis of emotional spending patterns",
  "dominantEmotionalTrigger": "primary trigger or null",
  "savingsRate": <number 0-100>,
  "weeklyTrends": [
    {
      "metric": "string",
      "currentWeek": <number>,
      "previousWeek": <number>,
      "change": <number>,
      "changePercent": <number>,
      "direction": "up|down|neutral"
    }
  ],
  "trendSummary": "1-2 sentence summary of key trends",
  "improvementGoals": [
    {
      "goalId": "string",
      "title": "string",
      "description": "string",
      "targetAmount": <number or null>,
      "category": "string or null",
      "priority": "high|medium|low",
      "aiReasoning": "why this goal matters"
    }
  ],
  "coachingInsights": [
    {
      "category": "string",
      "insight": "string",
      "actionableStep": "specific action",
      "emoji": "relevant emoji"
    }
  ],
  "coachingMessage": "1-2 paragraphs of motivational, personalized financial guidance",
  "healthScore": {
    "discipline": <0-100>,
    "consistency": <0-100>,
    "savingsRate": <0-100>,
    "emotionalControl": <0-100>,
    "overallScore": <0-100>
  }
}

GUIDELINES:
- Be encouraging but honest
- Reference specific transactions when possible
- Identify patterns, not just individual transactions
- Make actionable recommendations
- Celebrate wins even if they're small
- Use emotional intelligence to understand underlying spending drivers
- Keep language conversational and supportive
- Provide specific amounts in Rupees (₹) in recommendations
- Consider the user's savings goals when available`;
}
