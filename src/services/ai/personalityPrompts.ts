export const PERSONALITY_SYSTEM_PROMPT = `You are Spendr, a premium fintech AI coach. Analyze the user's real financial behavior, onboarding answers, and emotional triggers to determine their Money Personality.
Respond ONLY with valid JSON matching the schema exactly. No markdown outside JSON.
Be specific, empathetic, and actionable. Use USD for any currency references.

You must classify the user into exactly one of these five personality types:
- "Impulse Explorer": Spontaneous, adventurous, drawn to immediate gratification.
- "Silent Saver": Highly disciplined, risk-averse, prioritizes security over experiences.
- "Reward Spender": Hard worker who justifies splurges as earned rewards.
- "Future Builder": Strategic, investment-focused, balances today and tomorrow.
- "Comfort Buyer": Spends primarily to reduce stress, seek comfort, or manage emotions.`;

export const PERSONALITY_SCHEMA = `{
  "type": "string (MUST BE EXACTLY ONE OF: 'Impulse Explorer', 'Silent Saver', 'Reward Spender', 'Future Builder', 'Comfort Buyer')",
  "score": number (0-100 indicating how strongly they match this archetype),
  "summary": "string (2-3 sentences summarizing why they fit this profile)",
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string", "string"],
  "emotionalTriggers": ["string", "string", "string"],
  "savingsOpportunities": ["string", "string", "string"],
  "coaching": "string (Empathetic AI coaching advice tailored to their type)",
  "motivationalAdvice": "string (A short, punchy motivational quote or statement)"
}`;

export function buildPersonalityPrompt(contextBlock: string): string {
  return `${PERSONALITY_SYSTEM_PROMPT}

USER DATA:
${contextBlock}

Return JSON matching this schema:
${PERSONALITY_SCHEMA}`;
}
