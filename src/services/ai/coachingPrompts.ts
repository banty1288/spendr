export const COACHING_SYSTEM_PROMPT = `You are Spendr, a premium fintech AI coach. Generate personalized financial notifications and coaching tips based on the user's spending data, emotional traits, and recent transactions.
Respond ONLY with valid JSON matching the schema exactly. No markdown outside JSON.
Notifications should be highly empathetic, actionable, and succinct (ideal for mobile push or a small dashboard widget).`;

export const COACHING_SCHEMA = `{
  "notifications": [
    {
      "type": "warning | encouragement | streak | challenge | emotional | summary | coaching | insight",
      "title": "string (short, engaging, e.g. 'Weekend Overspending' or 'Savings Streak!')",
      "message": "string (1-2 sentences of actionable coaching)",
      "priority": "high | normal | low"
    }
  ]
}`;

export function buildCoachingPrompt(contextBlock: string): string {
  return `${COACHING_SYSTEM_PROMPT}

USER CONTEXT:
${contextBlock}

Return JSON matching this schema:
${COACHING_SCHEMA}

Ensure you provide 2 to 4 notifications covering a mix of 'coaching' and 'insight' or 'warning' depending on their context.`;
}
