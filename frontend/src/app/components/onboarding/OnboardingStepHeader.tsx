import type { LucideIcon } from "lucide-react";

interface OnboardingStepHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  gradient: string;
  glow: string;
}

export function OnboardingStepHeader({
  icon: Icon,
  title,
  subtitle,
  gradient,
  glow,
}: OnboardingStepHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-2 mt-2">
      <div
        className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}
        style={{ boxShadow: `0 8px 30px ${glow}30` }}
      >
        <Icon size={24} className="text-black" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-white/50 text-sm">{subtitle}</p>
      </div>
    </div>
  );
}
