import { generateJsonText } from "./client/index";
import { toAiError } from "./errors";

export interface ParsedSplitCommand {
  items: {
    name: string;
    amount: number;
    assignedTo: { name: string; portion: number }[];
  }[];
  taxInstruction: "equal" | "proportional" | "ignore";
}

export async function parseSplitCommand(command: string, availableItems: any[]): Promise<ParsedSplitCommand> {
  const prompt = `You are a helpful AI assistant for a bill splitting app. 
The user is giving a natural language command to split a receipt.
Here are the items on the receipt: ${JSON.stringify(availableItems)}

User command: "${command}"

Map the user's intent to the available items. Determine who had what portion of which item.
For example, if John and Jane shared a Pizza, assignedTo should be [{name: "John", portion: 0.5}, {name: "Jane", portion: 0.5}].
If the user mentions tax or tip, specify how it should be split ("equal" or "proportional"). Default is proportional.

Return strictly valid JSON matching this TypeScript interface:
{
  items: {
    name: string; // Must exactly match an item name from the receipt
    amount: number;
    assignedTo: { name: string; portion: number }[];
  }[];
  taxInstruction: "equal" | "proportional" | "ignore";
}
Do not wrap in markdown or include explanations.`;

  try {
    const raw = await generateJsonText({ prompt });
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    
    return {
      items: parsed.items || [],
      taxInstruction: parsed.taxInstruction || "proportional"
    };
  } catch (err) {
    throw toAiError(err);
  }
}
