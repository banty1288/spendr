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
          ? "from-[#ff3366]/20 to-[#9d4edd]/10 border-[#ff3366]/30" 
          : "from-[#ffd60a]/20 to-[#ff6b35]/10 border-[#ffd60a]/30"
      }`}
    >
      <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-start gap-3 relative z-10">
        <div className={`p-2 rounded-xl ${isWarning ? "bg-[#ff3366]/20 text-[#ff3366]" : "bg-[#ffd60a]/20 text-[#ffd60a]"}`}>
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
