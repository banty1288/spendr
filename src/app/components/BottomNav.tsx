import { Home, Sparkles, TrendingUp, Trophy, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/home", color: "#00d9ff" },
    { icon: Sparkles, label: "Insights", path: "/insights", color: "#9d4edd" },
    { icon: TrendingUp, label: "Analytics", path: "/analytics", color: "#00ff88" },
    { icon: Trophy, label: "Rewards", path: "/gamification", color: "#ffd60a" },
    { icon: User, label: "Profile", path: "/profile", color: "#ff3366" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-[430px] bg-[#0a0a14]/90 backdrop-blur-2xl border-t border-white/10 relative">
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-50"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className="flex items-center justify-around px-2 py-3 relative">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                    style={{ backgroundColor: item.color }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <motion.div
                  className={`p-2.5 rounded-2xl transition-all relative ${
                    isActive
                      ? ""
                      : "hover:bg-white/5"
                  }`}
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`
                  } : {}}
                  animate={isActive ? {
                    boxShadow: [
                      `0 0 0px ${item.color}00`,
                      `0 0 20px ${item.color}40`,
                      `0 0 0px ${item.color}00`,
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Icon
                    size={22}
                    className={`transition-colors ${
                      isActive
                        ? ""
                        : "text-white/40"
                    }`}
                    style={isActive ? { color: item.color } : {}}
                  />
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      style={{ border: `2px solid ${item.color}` }}
                    />
                  )}
                </motion.div>
                <span className={`text-[10px] font-medium transition-colors ${
                  isActive
                    ? ""
                    : "text-white/40"
                }`}
                style={isActive ? { color: item.color } : {}}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
