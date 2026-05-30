export type SplitMethod = "equal" | "percentage" | "custom" | "share";
export type SettlementStatus = "pending" | "partially_paid" | "paid" | "settled";

export interface BillSplit {
  id: string;
  title: string;
  description?: string;
  totalAmount: number;
  currency: string;
  category: string;
  splitMethod: SplitMethod;
  status: SettlementStatus;
  createdBy: string;
  createdByName: string;
  createdAt: string; // ISO string
  date: string; // ISO string
}

export interface BillParticipant {
  id: string; // Document ID
  billId: string; // Reference to BillSplit
  userId: string; // The Spendr user ID (or a temporary ID if manual)
  name: string;
  avatarUrl?: string;
  upiId?: string;
  phoneNumber?: string;
  
  // Split logic parameters
  shares?: number;     // For 'share' split
  percentage?: number; // For 'percentage' split
  
  // Calculated financial states
  amountOwed: number; // The amount they should theoretically pay according to the split
  amountPaid: number; // The amount they actually paid/contributed UP FRONT
  
  status: SettlementStatus;
  joinedAt: string; // ISO string
}

export interface Settlement {
  id: string;
  billId?: string; // Optional: If it relates to a specific bill, or general debt
  payerId: string;
  receiverId: string;
  amount: number;
  status: "pending" | "completed";
  paymentDate?: string; // ISO string
  upiTransactionRef?: string;
  createdAt: string;
}

export type ActivityType = "created" | "edited" | "paid" | "settled" | "reminder_sent";

export interface BillActivity {
  id: string;
  billId: string;
  type: ActivityType;
  actorId: string;
  actorName: string;
  targetId?: string;
  targetName?: string;
  amount?: number;
  message?: string;
  timestamp: string;
}
