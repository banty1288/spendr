import { motion } from "motion/react";
import { Lightbulb, Sparkles } from "lucide-react";
import type { SmartNotification } from "../../../types/notification";

interface CoachingWidgetProps {
  notification: SmartNotification;
  onClick: () => void;
}

export function CoachingWidget({ notification, onClick }: CoachingWidgetProps) {
  const isWarning = notification.type === "warning" || notification.type === "emotional";
  
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-3xl border relative overflow-hidden bg-gradient-to-r ${
        isWarning 
          ? "from-card to-card border-[#ff3366]/30" 
          : "from-card to-card border-[#ffd60a]/30"
      }`}
    >
      <div className="absolute right-0 top-0 w-32 h-32 bg-card shadow-sm rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-start gap-3 relative z-10">
        <div className={`p-2 rounded-xl ${isWarning ? "bg-card text-[#ff3366]" : "bg-card text-[#ffd60a]"}`}>
          {isWarning ? <Sparkles size={20} /> : <Lightbulb size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold text-sm mb-1">{notification.title}</h4>
          <p className="text-white/70 text-xs leading-relaxed line-clamp-2">
            {notification.message}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
