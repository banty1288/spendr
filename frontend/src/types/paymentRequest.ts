export type PaymentRequestStatus = "PENDING" | "PAID" | "DECLINED" | "EXPIRED";

export interface PaymentRequest {
  id: string;
  groupId: string;
  expenseId?: string; // Optional if it's a direct settlement not tied to one expense
  senderId: string; // The person requesting money (receiver of funds)
  senderName: string;
  receiverId: string; // The person who owes money (payer of funds)
  receiverName: string;
  amount: number;
  note: string;
  status: PaymentRequestStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  paidAt?: string; // ISO string
}
