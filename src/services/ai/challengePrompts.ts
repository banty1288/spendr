export const CHALLENGE_SYSTEM_PROMPT = `You are Spendr, a premium fintech AI coach. Generate personalized savings challenges based on the user's spending data and emotional insights.
Respond ONLY with valid JSON matching the schema exactly. No markdown outside JSON.
Make challenges empathetic, actionable, and tailored to the user's recent spending patterns. Use the user's native currency (INR/₹) for all amounts. NEVER use USD or $.`;

export const CHALLENGE_SCHEMA = `{
  "recommendations": [
    {
      "title": "string (short, engaging)",
      "description": "string (1-2 sentences)",
      "category": "savings_goals | no_spend | emotional_reduction | subscription_cleanup | budget_discipline | healthy_habit | category_reduction",
      "difficulty": "easy | medium | hard",
      "targetAmount": number (the numeric goal, e.g. 50, 3, 100),
      "unit": "string (e.g. 'USD', 'days', 'items', '%')",
      "rewardXp": number (easy: 50, medium: 100, hard: 200),
      "durationDays": number (e.g. 3, 5, 7, 30),
      "targetCategoryId": "string (optional, category ID if applicable)",
      "reasoning": "string (why you recommend this challenge)"
    }
  ]
}`;

export function buildChallengePrompt(contextBlock: string): string {
  return `${CHALLENGE_SYSTEM_PROMPT}

USER CONTEXT:
${contextBlock}

Return JSON matching this schema:
${CHALLENGE_SCHEMA}`;
}
