import { useMemo } from "react";
import { Home, Compass, Calendar, BarChart2, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = useMemo(() => [
    { icon: Home, label: t("nav.home", "Home"), path: "/home", color: "#00D4FF" },
    { icon: Compass, label: t("nav.insights", "Insights"), path: "/insights", color: "#00FF99" },
    { icon: Calendar, label: t("nav.daily", "Daily"), path: "/daily", color: "#8B5CF6" },
    { icon: BarChart2, label: t("nav.analytics", "Analytics"), path: "/analytics", color: "#00D4FF" },
    { icon: User, label: t("nav.profile", "Profile"), path: "/profile", color: "#A1A1AA" },
  ], [t]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none pb-safe-nav pb-4">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.1 }}
        className="w-full max-w-[400px] bg-card/90 backdrop-blur-xl border border-border rounded-full relative overflow-hidden pointer-events-auto shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
      >
        <nav aria-label="Primary" className="flex items-center justify-between px-2 py-2 relative">
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
                className="flex flex-1 flex-col items-center justify-center gap-1 relative rounded-full h-14 outline-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                {/* Active Pill Glow */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 rounded-full"
                      style={{ background: `linear-gradient(135deg, ${item.color}22, ${item.color}0A)` }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative z-10 flex flex-col items-center justify-center">
                  <Icon
                    size={22}
                    className="transition-colors duration-300"
                    style={isActive ? { color: item.color } : { color: "var(--muted-foreground)" }}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isActive && (
                    <motion.span 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] font-bold mt-0.5"
                      style={{ color: item.color }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </nav>
      </motion.div>
    </div>
  );
}
