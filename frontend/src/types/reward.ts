export type RewardEventType = "achievement" | "challenge" | "streak" | "behavior" | "milestone" | "transaction" | "level_up";

export interface RewardEvent {
  id: string;
  type: RewardEventType;
  title: string;
  subtitle: string;
  xp: number;
  icon?: string;
  timestamp: string;
}

export interface RewardNotificationPayload {
  title: string;
  subtitle: string;
  xp: number;
  icon?: string;
}
