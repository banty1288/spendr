export type NotificationType =
  | "warning"
  | "encouragement"
  | "streak"
  | "challenge"
  | "emotional"
  | "summary"
  | "coaching"
  | "milestone"
  | "badge"
  | "insight";

export type NotificationStatus = "unread" | "read" | "archived";

export interface SmartNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  actionUrl?: string; // Optional deep link for the notification
  priority: "high" | "normal" | "low";
  createdAt: string; // ISO string
  _createdAt?: any; // Firestore server timestamp
}

export interface NotificationPreferences {
  warnings: boolean;
  encouragement: boolean;
  streaks: boolean;
  challenges: boolean;
  emotional: boolean;
  coaching: boolean;
  milestones: boolean;
}
