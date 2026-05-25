import type { LucideIcon } from "lucide-react";
import {
  Wallet,
  ShoppingBag,
  PiggyBank,
  Target,
  Zap,
  Heart,
  ClipboardList,
} from "lucide-react";
import type { OnboardingStepMeta } from "../../types/onboarding";

export interface SelectOption {
  id: string;
  label: string;
  emoji: string;
}

export const INCOME_RANGES = [
  "Under ₹25,000",
  "₹25,000 – ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹2,00,000",
  "₹2,00,000+",
] as const;

export const SPENDING_CATEGORIES: SelectOption[] = [
  { id: "food", label: "Food & Dining", emoji: "🍕" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
  { id: "transport", label: "Transport", emoji: "🚕" },
  { id: "entertainment", label: "Entertainment", emoji: "🎮" },
  { id: "bills", label: "Bills & Utilities", emoji: "💡" },
  { id: "health", label: "Health & Fitness", emoji: "💪" },
  { id: "subscriptions", label: "Subscriptions", emoji: "📱" },
  { id: "rent", label: "Rent / EMI", emoji: "🏢" },
];

export const SAVINGS_OPTIONS: SelectOption[] = [
  { id: "emergency", label: "Emergency Fund", emoji: "🛡️" },
  { id: "travel", label: "Travel & Vacation", emoji: "✈️" },
  { id: "house", label: "Buy a House", emoji: "🏠" },
  { id: "car", label: "Buy a Car", emoji: "🚗" },
  { id: "retirement", label: "Retirement", emoji: "🏖️" },
  { id: "education", label: "Education", emoji: "🎓" },
  { id: "wedding", label: "Wedding", emoji: "💍" },
  { id: "investment", label: "Investments", emoji: "📈" },
];

export const TARGET_SAVINGS = [
  "₹1,00,000",
  "₹5,00,000",
  "₹10,00,000",
  "₹25,00,000",
  "₹50,00,000+",
] as const;

export const FINANCIAL_GOALS_OPTIONS: SelectOption[] = [
  { id: "debt_free", label: "Become Debt-Free", emoji: "🔓" },
  { id: "invest", label: "Start Investing", emoji: "📊" },
  { id: "budget", label: "Stick to a Budget", emoji: "📋" },
  { id: "save_more", label: "Save More Monthly", emoji: "💰" },
  { id: "side_income", label: "Build Side Income", emoji: "🚀" },
  { id: "credit_score", label: "Improve Credit Score", emoji: "⭐" },
];

export const TIME_HORIZONS = [
  "3 months",
  "6 months",
  "1 year",
  "2–3 years",
  "5+ years",
] as const;

export const IMPULSE_FREQUENCY = [
  "Almost never",
  "Once a month",
  "Weekly",
  "Multiple times a week",
  "Daily",
] as const;

export const IMPULSE_CATEGORIES: SelectOption[] = [
  { id: "online", label: "Online Shopping", emoji: "🛒" },
  { id: "food_delivery", label: "Food Delivery", emoji: "🍔" },
  { id: "fashion", label: "Fashion & Clothes", emoji: "👗" },
  { id: "gadgets", label: "Gadgets & Tech", emoji: "📱" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "beauty", label: "Beauty & Self-care", emoji: "💅" },
];

export const EMOTIONAL_TRIGGERS: SelectOption[] = [
  { id: "stress", label: "Stress & Anxiety", emoji: "😰" },
  { id: "boredom", label: "Boredom", emoji: "😑" },
  { id: "celebration", label: "Celebration", emoji: "🎉" },
  { id: "sadness", label: "Sadness", emoji: "😢" },
  { id: "social_pressure", label: "Social Pressure", emoji: "👥" },
  { id: "fomo", label: "FOMO", emoji: "😱" },
  { id: "reward", label: "Self-Reward", emoji: "🏆" },
  { id: "none", label: "None of these", emoji: "✨" },
];

export const COPING_STRATEGIES = [
  "I usually realize after buying",
  "I wait 24 hours before purchasing",
  "I talk to someone first",
  "I look for alternatives",
  "I don't have a strategy yet",
] as const;

export const BUDGETING_HABITS: SelectOption[] = [
  { id: "track_all", label: "Track every expense", emoji: "📒" },
  { id: "monthly_budget", label: "Monthly budget plan", emoji: "📋" },
  { id: "weekly_review", label: "Weekly spending review", emoji: "📅" },
  { id: "category_limits", label: "Category spending limits", emoji: "🎯" },
  { id: "apps_tools", label: "Use budgeting apps", emoji: "📱" },
  { id: "wing_it", label: "Mostly wing it", emoji: "🎲" },
  { id: "want_start", label: "Want to start budgeting", emoji: "🌱" },
];

export const ONBOARDING_STEPS: (OnboardingStepMeta & { icon: LucideIcon })[] = [
  {
    id: "income",
    title: "Monthly Income",
    subtitle: "Help us personalize your experience",
    icon: Wallet,
    gradient: "from-[#00d9ff] to-[#0066ff]",
    glow: "#00d9ff",
  },
  {
    id: "category",
    title: "Top Spending",
    subtitle: "Where does most of your money go?",
    icon: ShoppingBag,
    gradient: "from-[#ff6b6b] to-[#ff8e53]",
    glow: "#ff6b6b",
  },
  {
    id: "savings",
    title: "Savings Goals",
    subtitle: "What are you saving for?",
    icon: PiggyBank,
    gradient: "from-[#00ff88] to-[#00d9a5]",
    glow: "#00ff88",
  },
  {
    id: "goals",
    title: "Financial Goals",
    subtitle: "Dream big, plan smart",
    icon: Target,
    gradient: "from-[#a855f7] to-[#6366f1]",
    glow: "#a855f7",
  },
  {
    id: "impulse",
    title: "Impulse Habits",
    subtitle: "Let's tackle impulse buys",
    icon: Zap,
    gradient: "from-[#ffd93d] to-[#ff6b6b]",
    glow: "#ffd93d",
  },
  {
    id: "emotional",
    title: "Emotional Triggers",
    subtitle: "Understand your spending emotions",
    icon: Heart,
    gradient: "from-[#ec4899] to-[#f43f5e]",
    glow: "#ec4899",
  },
  {
    id: "budgeting",
    title: "Budgeting Habits",
    subtitle: "How do you manage money today?",
    icon: ClipboardList,
    gradient: "from-[#00d9ff] to-[#9d4edd]",
    glow: "#9d4edd",
  },
];
