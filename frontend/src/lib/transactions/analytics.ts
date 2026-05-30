import {
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import type {
  Transaction,
  TransactionFilters,
  TransactionSort,
} from "../../types/transaction";
import { getCategoryById } from "./constants";

export function signedAmount(tx: Transaction): number {
  const amt = tx.amount;
  return tx.type === "income" ? amt : -amt;
}

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  const q = filters.search.trim().toLowerCase();

  return transactions.filter((tx) => {
    if (filters.categoryId !== "all" && tx.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.type !== "all" && tx.type !== filters.type) {
      return false;
    }
    if (filters.month !== "all") {
      const d = parseISO(tx.date);
      const monthKey = format(d, "yyyy-MM");
      if (monthKey !== filters.month) return false;
    }
    if (q) {
      const haystack = `${tx.merchant} ${tx.notes} ${getCategoryById(tx.categoryId).label}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function sortTransactions(
  transactions: Transaction[],
  sort: TransactionSort
): Transaction[] {
  const copy = [...transactions];
  switch (sort) {
    case "date_asc":
      return copy.sort((a, b) => a.date.localeCompare(b.date));
    case "amount_desc":
      return copy.sort((a, b) => b.amount - a.amount);
    case "amount_asc":
      return copy.sort((a, b) => a.amount - b.amount);
    case "date_desc":
    default:
      return copy.sort((a, b) => b.date.localeCompare(a.date));
  }
}

export interface CategoryBreakdownItem {
  categoryId: string;
  name: string;
  value: number;
  color: string;
  icon: string;
  count: number;
}

export function getCategoryBreakdown(
  transactions: Transaction[],
  month?: string
): CategoryBreakdownItem[] {
  const expenses = transactions.filter((tx) => {
    if (tx.type !== "expense") return false;
    if (!month || month === "all") return true;
    return format(parseISO(tx.date), "yyyy-MM") === month;
  });

  const map = new Map<string, CategoryBreakdownItem>();

  for (const tx of expenses) {
    const cat = getCategoryById(tx.categoryId);
    const existing = map.get(tx.categoryId);
    const amt = tx.amount;
    if (existing) {
      existing.value += amt;
      existing.count += 1;
    } else {
      map.set(tx.categoryId, {
        categoryId: tx.categoryId,
        name: cat.label,
        value: amt,
        color: cat.color,
        icon: cat.icon,
        count: 1,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.value - a.value);
}

export interface MonthlySummary {
  month: string;
  label: string;
  income: number;
  expenses: number;
  net: number;
}

export function getMonthlySummaries(
  transactions: Transaction[],
  months = 6
): MonthlySummary[] {
  const now = new Date();
  const result: MonthlySummary[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = subMonths(now, i);
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    const monthKey = format(d, "yyyy-MM");

    let income = 0;
    let expenses = 0;

    for (const tx of transactions) {
      const txDate = parseISO(tx.date);
      if (!isWithinInterval(txDate, { start, end })) continue;
      const amt = tx.amount;
      if (tx.type === "income") income += amt;
      else expenses += amt;
    }

    result.push({
      month: monthKey,
      label: format(d, "MMM"),
      income,
      expenses,
      net: income - expenses,
    });
  }

  return result;
}

export function getMonthTotals(transactions: Transaction[], month: string) {
  let income = 0;
  let expenses = 0;

  for (const tx of transactions) {
    if (format(parseISO(tx.date), "yyyy-MM") !== month) continue;
    const amt = tx.amount;
    if (tx.type === "income") income += amt;
    else expenses += amt;
  }

  return { income, expenses, net: income - expenses };
}

export function computeBalanceFromTransactions(transactions: Transaction[]): number {
  return transactions.reduce((sum, tx) => sum + signedAmount(tx), 0);
}

export function getAvailableMonths(transactions: Transaction[]): string[] {
  const set = new Set<string>();
  for (const tx of transactions) {
    set.add(format(parseISO(tx.date), "yyyy-MM"));
  }
  set.add(format(new Date(), "yyyy-MM"));
  return [...set].sort((a, b) => b.localeCompare(a));
}
