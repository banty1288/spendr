import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X } from "lucide-react";
import { useAssistantStore } from "../../../store/assistantStore";

export function AIAssistantTrigger() {
  const { isOpen, toggle } = useAssistantStore();

  return (
    <motion.button
      id="ai-assistant-trigger"
      aria-label="Open Finny AI Assistant"
      onClick={toggle}
      className="fixed bottom-[110px] right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF99]"
      style={{
        background: isOpen
          ? "rgba(24, 24, 27, 0.95)"
          : "linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(139, 92, 246, 0.4))",
        boxShadow: isOpen
          ? "0 10px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)"
          : "0 10px 40px rgba(0,212,255,0.3), inset 0 1px 1px rgba(255,255,255,0.4)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer Pulse */}
      <AnimatePresence>
        {!isOpen && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border border-[#00D4FF]/40"
              animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-[#8B5CF6]/30"
              animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
            />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X size={24} className="text-muted-foreground" />
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            {/* Glowing core */}
            <div className="absolute inset-0 bg-white blur-[8px] opacity-40 rounded-full"></div>
            <Sparkles size={26} className="text-[#00D4FF] relative z-10" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
