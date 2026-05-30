import { motion } from "motion/react";
import type { AssistantState } from "../../../hooks/useVoiceAssistant";

interface Props {
  state: AssistantState;
  size?: "sm" | "md";
}

const stateColors: Record<AssistantState, string> = {
  idle: "#ffffff30",
  connecting: "#00d9ff",
  listening: "#00ff88",
  thinking: "#9d4edd",
  speaking: "#ff6b35",
  error: "#ff3366",
};

const glowColors: Record<AssistantState, string> = {
  idle: "rgba(255,255,255,0.05)",
  connecting: "rgba(0,217,255,0.25)",
  listening: "rgba(0,255,136,0.25)",
  thinking: "rgba(157,78,221,0.3)",
  speaking: "rgba(255,107,53,0.3)",
  error: "rgba(255,51,102,0.25)",
};

export function InlineVoiceOrb({ state, size = "md" }: Props) {
  const isActive = state !== "idle" && state !== "error";
  const color = stateColors[state];
  const glow = glowColors[state];
  const dim = size === "sm" ? 48 : 64;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: dim, height: dim }}
    >
      {/* Outer glow ring */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: glow }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Core orb */}
      <motion.div
        className="rounded-full"
        style={{
          width: dim * 0.65,
          height: dim * 0.65,
          background: `radial-gradient(circle at 35% 35%, ${color}, ${color}88)`,
          boxShadow: `0 0 ${dim * 0.3}px ${color}66`,
        }}
        animate={
          isActive
            ? { scale: [1, 1.08, 1] }
            : { scale: 1 }
        }
        transition={
          isActive
            ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
            : {}
        }
      />

      {/* Sound wave bars (listening / speaking) */}
      {(state === "listening" || state === "speaking") && (
        <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-[3px] rounded-full"
              style={{ backgroundColor: color }}
              animate={{
                height: [4, 12 + i * 3, 4],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
