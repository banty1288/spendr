import { BillParticipant, Settlement } from "../types/billSplit";

export interface ParticipantDraft extends Partial<BillParticipant> {
  userId: string;
  name: string;
  amountPaid: number;
  amountOwed: number;
  shares?: number;
  percentage?: number;
}

export function calculateSplit(
  totalAmount: number,
  participants: ParticipantDraft[],
  splitMethod: "equal" | "percentage" | "custom" | "share"
): ParticipantDraft[] {
  if (participants.length === 0) return participants;

  const results = [...participants];

  switch (splitMethod) {
    case "equal":
      const equalAmount = totalAmount / results.length;
      results.forEach(p => p.amountOwed = equalAmount);
      break;

    case "percentage":
      results.forEach(p => {
        const pct = p.percentage || 0;
        p.amountOwed = (totalAmount * pct) / 100;
      });
      break;

    case "custom":
      // amountOwed should already be set by the user in the UI.
      // We could add validation to ensure they sum to totalAmount.
      break;

    case "share":
      const totalShares = results.reduce((acc, p) => acc + (p.shares || 1), 0);
      if (totalShares > 0) {
        results.forEach(p => {
          p.amountOwed = (totalAmount * (p.shares || 1)) / totalShares;
        });
      }
      break;
  }

  return results;
}

export interface SimplifiedDebt {
  payerId: string;
  payerName: string;
  receiverId: string;
  receiverName: string;
  amount: number;
}

// Computes who owes whom for a single bill, returning an array of SimplifiedDebt.
export function computeSettlements(participants: BillParticipant[]): SimplifiedDebt[] {
  const balances: Record<string, { userId: string; name: string; balance: number }> = {};

  // Net Balance = Paid - Owed. 
  // Positive balance means they are owed money.
  // Negative balance means they owe money.
  participants.forEach(p => {
    if (!balances[p.userId]) {
      balances[p.userId] = { userId: p.userId, name: p.name, balance: 0 };
    }
    balances[p.userId].balance += (p.amountPaid - p.amountOwed);
  });

  const debtors = Object.values(balances).filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance); // Most negative first
  const creditors = Object.values(balances).filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance); // Most positive first

  const settlements: SimplifiedDebt[] = [];

  let i = 0; // Debtors index
  let j = 0; // Creditors index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amountToSettle = Math.min(-debtor.balance, creditor.balance);

    if (amountToSettle > 0.01) {
      settlements.push({
        payerId: debtor.userId,
        payerName: debtor.name,
        receiverId: creditor.userId,
        receiverName: creditor.name,
        amount: Number(amountToSettle.toFixed(2)),
      });
    }

    debtor.balance += amountToSettle;
    creditor.balance -= amountToSettle;

    if (Math.abs(debtor.balance) < 0.01) i++;
    if (Math.abs(creditor.balance) < 0.01) j++;
  }

  return settlements;
}
