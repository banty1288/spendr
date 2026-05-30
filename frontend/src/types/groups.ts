export interface Group {
  id: string;
  name: string;
  description?: string;
  type: "trip" | "flatmates" | "office" | "other";
  createdBy: string;
  currency: string;
  coverImageUrl?: string;
  createdAt: string; // ISO String
}

export interface GroupMember {
  id: string; // usually same as userId
  groupId: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  phoneNumber?: string;
  upiId?: string;
  role: "admin" | "member";
  joinedAt: string; // ISO String
}

export interface GroupBalance {
  groupId: string;
  userId: string;
  netBalance: number; // Positive means they are owed money, Negative means they owe money
  totalPaid: number;
  totalOwed: number;
}
