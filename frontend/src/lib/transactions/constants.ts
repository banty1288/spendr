import type { TransactionType } from "../../types/transaction";

export interface TransactionCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  type: TransactionType | "both";
}

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  { id: "food", label: "Food & Dining", icon: "🍽️", color: "#00d9ff", type: "expense" },
  { id: "transport", label: "Transport", icon: "🚗", color: "#9d4edd", type: "expense" },
  { id: "entertainment", label: "Entertainment", icon: "🎬", color: "#00ff88", type: "expense" },
  { id: "shopping", label: "Shopping", icon: "🛍️", color: "#ff3366", type: "expense" },
  { id: "bills", label: "Bills & Utilities", icon: "💡", color: "#ffd60a", type: "expense" },
  { id: "health", label: "Health", icon: "💊", color: "#ff6b35", type: "expense" },
  { id: "education", label: "Education", icon: "🎓", color: "#c77dff", type: "expense" },
  { id: "travel", label: "Travel", icon: "✈️", color: "#00d9ff", type: "expense" },
  { id: "income", label: "Income", icon: "💰", color: "#00ff88", type: "income" },
  { id: "other", label: "Other", icon: "📦", color: "#ffffff", type: "both" },
];

export function getCategoryById(id: string): TransactionCategory {
  return (
    TRANSACTION_CATEGORIES.find((c) => c.id === id) ??
    TRANSACTION_CATEGORIES[TRANSACTION_CATEGORIES.length - 1]
  );
}

export function categoriesForType(type: TransactionType): TransactionCategory[] {
  return TRANSACTION_CATEGORIES.filter(
    (c) => c.type === type || c.type === "both"
  );
}
