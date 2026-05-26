export type SubscriptionTier = "free" | "pro" | "elite";
export type SubscriptionStatus = "active" | "trialing" | "expired" | "cancelled" | "none";
export type BillingCycle = "monthly" | "yearly";

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  color: string;
  badge: string;
  features: string[];
}

export interface UserSubscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  trialStartedAt?: string;
  trialEndsAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  /** Reserved for future Stripe/Razorpay integration */
  paymentProvider?: "stripe" | "razorpay" | null;
  externalSubscriptionId?: string | null;
  updatedAt: string;
}

export type PremiumFeature =
  | "unlimited_ai_insights"
  | "advanced_emotional_analysis"
  | "premium_coaching"
  | "deep_weekly_reports"
  | "unlimited_challenges"
  | "advanced_analytics"
  | "ai_behavioral_predictions"
  | "premium_badges"
  | "exclusive_levels"
  | "ai_voice_coach";

export const FEATURE_TIER_MAP: Record<PremiumFeature, SubscriptionTier[]> = {
  unlimited_ai_insights: ["pro", "elite"],
  advanced_emotional_analysis: ["pro", "elite"],
  premium_coaching: ["pro", "elite"],
  deep_weekly_reports: ["pro", "elite"],
  unlimited_challenges: ["pro", "elite"],
  advanced_analytics: ["elite"],
  ai_behavioral_predictions: ["elite"],
  premium_badges: ["pro", "elite"],
  exclusive_levels: ["elite"],
  ai_voice_coach: ["elite"],
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: "#ffffff",
    badge: "Free",
    features: [
      "5 AI insight runs/month",
      "Basic emotional analysis",
      "3 savings challenges",
      "Core analytics",
      "Standard badges",
    ],
  },
  {
    tier: "pro",
    name: "Spendr Pro",
    monthlyPrice: 9.99,
    yearlyPrice: 79.99,
    color: "#00d9ff",
    badge: "PRO",
    features: [
      "Unlimited AI insights",
      "Advanced emotional analysis",
      "Premium AI coaching",
      "Deep weekly AI reports",
      "Unlimited savings challenges",
      "Premium badges & levels",
    ],
  },
  {
    tier: "elite",
    name: "Spendr Elite",
    monthlyPrice: 19.99,
    yearlyPrice: 159.99,
    color: "#ffd60a",
    badge: "ELITE",
    features: [
      "Everything in Pro",
      "Advanced AI analytics",
      "AI behavioral predictions",
      "Exclusive financial levels",
      "AI Voice Coach (coming soon)",
      "Priority support",
    ],
  },
];

export const DEFAULT_SUBSCRIPTION: UserSubscription = {
  tier: "free",
  status: "none",
  billingCycle: "monthly",
  paymentProvider: null,
  externalSubscriptionId: null,
  updatedAt: new Date().toISOString(),
};
