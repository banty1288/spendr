import { motion } from "motion/react";
import { AssistantState } from "../../../hooks/useVoiceAssistant";

interface OrbProps {
  state: AssistantState;
}

export function VoiceOrb({ state }: OrbProps) {
  // Determine animation properties based on state
  let scale = [1, 1];
  let colors = ["#00d9ff", "#9d4edd"];
  let duration = 2;

  if (state === "listening") {
    scale = [1, 1.2, 1];
    colors = ["#00d9ff", "#00ff88", "#00d9ff"];
    duration = 1.5;
  } else if (state === "thinking") {
    scale = [1, 1.05, 1];
    colors = ["#9d4edd", "#ff3366", "#9d4edd"];
    duration = 1;
  } else if (state === "speaking") {
    scale = [1, 1.3, 1.1, 1.4, 1];
    colors = ["#ff3366", "#ffb703", "#ff3366"];
    duration = 0.8;
  } else if (state === "error") {
    colors = ["#ff3366", "#ff0000"];
    scale = [1, 1];
  }

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Outer Glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl opacity-60"
        animate={{
          scale: scale,
          background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Core Orb */}
      <motion.div
        className="absolute w-32 h-32 rounded-full backdrop-blur-md shadow-[0_0_40px_rgba(255,255,255,0.2)]"
        animate={{
          scale: state === "idle" || state === "error" ? 1 : [1, 1.1, 1],
          background: `linear-gradient(45deg, ${colors[0]}, ${colors[1]})`,
        }}
        transition={{
          duration: duration * 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Inner Highlight */}
      <div className="absolute w-24 h-24 rounded-full bg-white/20 blur-md top-8 left-8" />
    </div>
  );
}
