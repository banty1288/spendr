export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  currency?: string;
  baseAmountUsd?: number;
  type: TransactionType;
  categoryId: string;
  notes: string;
  /** ISO 8601 date string (transaction date) */
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionInput {
  merchant: string;
  amount: number;
  currency?: string;
  baseAmountUsd?: number;
  type: TransactionType;
  categoryId: string;
  notes?: string;
  date: string;
}

export type TransactionSort = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

export interface TransactionFilters {
  search: string;
  categoryId: string | "all";
  type: TransactionType | "all";
  month: string | "all";
}

export const DEFAULT_TRANSACTION_FILTERS: TransactionFilters = {
  search: "",
  categoryId: "all",
  type: "all",
  month: "all",
};
