import { generateJsonText } from "./client/index";
import { toAiError } from "./errors";
import { BillItem } from "../../types/billSplit";

export interface ParsedReceipt {
  merchantName: string;
  totalAmount: number;
  taxAmount: number;
  tipAmount: number;
  date: string;
  items: Omit<BillItem, "id" | "assignedTo">[];
}

export async function parseReceiptImage(base64Image: string, mimeType: string): Promise<ParsedReceipt> {
  const prompt = `You are an expert expense parsing AI. Analyze the attached receipt image.
Extract the merchant name, total amount, total tax amount, and total tip amount.
Also extract every line item on the receipt, including its name and final price.
Ignore intermediate subtotals. If tax or tip is not explicitly stated, return 0.
Return the result strictly as a JSON object matching this TypeScript interface:
{
  merchantName: string;
  totalAmount: number; // total amount including tax and tip
  taxAmount: number;
  tipAmount: number;
  date: string; // ISO format or YYYY-MM-DD
  items: { name: string; amount: number; }[]
}
Output only valid JSON.`;

  try {
    const raw = await generateJsonText({ 
      prompt,
      inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType }
    });

    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    
    return {
      merchantName: parsed.merchantName || "Unknown Merchant",
      totalAmount: Number(parsed.totalAmount) || 0,
      taxAmount: Number(parsed.taxAmount) || 0,
      tipAmount: Number(parsed.tipAmount) || 0,
      date: parsed.date || new Date().toISOString(),
      items: Array.isArray(parsed.items) ? parsed.items.map((i: any) => ({
        name: i.name || "Item",
        amount: Number(i.amount) || 0
      })) : []
    };
  } catch (err) {
    throw toAiError(err);
  }
}
