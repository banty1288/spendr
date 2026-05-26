import { generateJsonText } from "./client/index";
import { AiError, toAiError } from "./errors";
import { buildCoachingPrompt } from "./coachingPrompts";
import { buildAiUserContext, formatContextForPrompt } from "./context";
import { isAiEnabled } from "./config/index";
import type { SmartNotification } from "../../types/notification";
import type { Transaction } from "../../types/transaction";
import type { UserData } from "../../types/user";
import type { AiUserContext } from "./types";

function parseCoachingResponse(raw: string): Omit<SmartNotification, "id" | "status" | "createdAt">[] {
  try {
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.notifications)) {
      throw new Error("Invalid format: missing notifications array");
    }
    return data.notifications;
  } catch (err) {
    throw new AiError("PARSE", "Failed to parse coaching notifications", false);
  }
}

export async function generateCoachingInsights({
  userData,
  transactions,
}: {
  userData: UserData | null | undefined;
  transactions: Transaction[];
}): Promise<Omit<SmartNotification, "id" | "status" | "createdAt">[]> {
  if (!isAiEnabled()) {
    // Fallback data for dev
    return [
      {
        type: "encouragement",
        title: "You're doing great!",
        message: "You stayed under budget this week. Keep up the good work.",
        priority: "normal",
      },
      {
        type: "coaching",
        title: "Weekend Planning",
        message: "Consider setting aside a small budget for weekend dining to avoid overspending.",
        priority: "low",
      }
    ];
  }

  const context: AiUserContext = buildAiUserContext(userData, transactions);
  const prompt = buildCoachingPrompt(formatContextForPrompt(context));

  try {
    const raw = await generateJsonText({ prompt });
    return parseCoachingResponse(raw);
  } catch (err) {
    throw toAiError(err);
  }
}
