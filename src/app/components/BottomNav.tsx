import { Home, Sparkles, TrendingUp, Trophy, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t("nav.home", "Home"), path: "/home", color: "#00d9ff" },
    { icon: Sparkles, label: t("nav.insights", "Insights"), path: "/insights", color: "#9d4edd" },
    { icon: TrendingUp, label: t("nav.analytics", "Analytics"), path: "/analytics", color: "#00ff88" },
    { icon: Trophy, label: t("nav.rewards", "Rewards"), path: "/gamification", color: "#ffd60a" },
    { icon: User, label: t("nav.profile", "Profile"), path: "/profile", color: "#ff3366" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-2 pointer-events-none">
      {/* Gradient fade above nav */}
      <div className="absolute bottom-full left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.1 }}
        className="w-full max-w-[430px] md:max-w-2xl bg-[#09090b]/95 border border-border border-b-0 rounded-t-3xl relative overflow-hidden pointer-events-auto shadow-2xl"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)", willChange: "transform" }}
      >
        {/* Top shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/3 to-transparent pointer-events-none" />

        <nav aria-label="Primary" className="flex items-center justify-around gap-1 px-2 py-2 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className="flex min-w-0 flex-1 flex-col items-center gap-0.5 relative rounded-2xl px-1 py-1.5 outline-none"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                {/* Active indicator pip */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full"
                      style={{ backgroundColor: item.color }}
                      transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon wrapper */}
                <motion.div
                  className="p-2 rounded-2xl relative"
                  style={
                    isActive
                      ? { background: `linear-gradient(135deg, ${item.color}28, ${item.color}12)` }
                      : {}
                  }
                  animate={
                    isActive
                      ? { boxShadow: [`0 0 0px ${item.color}00`, `0 0 18px ${item.color}35`, `0 0 0px ${item.color}00`] }
                      : { boxShadow: "none" }
                  }
                  transition={{ duration: 2.5, repeat: isActive ? Infinity : 0 }}
                >
                  <Icon
                    size={22}
                    className="transition-all"
                    style={isActive ? { color: item.color } : { color: "rgba(255,255,255,0.38)" }}
                  />
                </motion.div>

                {/* Label */}
                <span
                  className="max-[340px]:sr-only text-[10px] leading-none font-medium transition-colors truncate max-w-full"
                  style={isActive ? { color: item.color } : { color: "rgba(255,255,255,0.35)" }}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </nav>
      </motion.div>
    </div>
  );
}
