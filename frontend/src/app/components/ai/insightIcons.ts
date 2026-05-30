import {
  TrendingUp,
  AlertCircle,
  Brain,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import type { InsightCardType } from "../../../services/ai/types";

const MAP: Record<InsightCardType, LucideIcon> = {
  strength: TrendingUp,
  weakness: AlertCircle,
  trigger: Brain,
  suggestion: Lightbulb,
};

const COLORS: Record<InsightCardType, string> = {
  strength: "#00ff88",
  weakness: "#ff3366",
  trigger: "#9d4edd",
  suggestion: "#00d9ff",
};

export function getInsightIcon(type: InsightCardType): LucideIcon {
  return MAP[type];
}

export function getInsightColor(type: InsightCardType): string {
  return COLORS[type];
}
