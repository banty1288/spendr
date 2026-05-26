/**
 * ScreenLoader — Skeleton loading states for screen-level content.
 * Each variant matches a different screen's layout.
 */
import { motion } from "motion/react";

function Pulse({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      className={`bg-white/8 rounded-2xl ${className ?? ""}`}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return <Pulse className={`w-full ${className ?? "h-28"}`} />;
}

export function SkeletonText({ className }: { className?: string }) {
  return <Pulse className={`h-4 ${className ?? "w-32"}`} />;
}

export function SkeletonAvatar({ size = 10 }: { size?: number }) {
  return (
    <Pulse className="rounded-full shrink-0" style={{ width: `${size * 4}px`, height: `${size * 4}px` } as React.CSSProperties} />
  );
}

/** Full-screen hero card + two stat cards + list */
export function HomeScreenSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonCard className="h-48 rounded-3xl" />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonCard className="h-28 rounded-3xl" />
        <SkeletonCard className="h-28 rounded-3xl" />
      </div>
      <SkeletonCard className="h-64 rounded-3xl" />
      <SkeletonCard className="h-40 rounded-3xl" />
    </div>
  );
}

/** List of transaction skeleton rows */
export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white/5 rounded-2xl border border-white/8 p-4 flex items-center gap-4"
        >
          <Pulse className="w-12 h-12 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Pulse className="h-4 w-32" />
            <Pulse className="h-3 w-20" />
          </div>
          <Pulse className="h-5 w-16" />
        </motion.div>
      ))}
    </div>
  );
}

/** Analytics chart skeleton */
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonCard className="h-36 rounded-3xl" />
      <SkeletonCard className="h-52 rounded-3xl" />
      <SkeletonCard className="h-44 rounded-3xl" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white/5 rounded-2xl border border-white/8 p-4 flex items-center gap-4">
            <Pulse className="w-10 h-10 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-4 w-28" />
              <Pulse className="h-3 w-16" />
            </div>
            <Pulse className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Generic card grid skeleton */
export function CardGridSkeleton({ cols = 2, rows = 2, cardHeight = "h-32" }: { cols?: number; rows?: number; cardHeight?: string }) {
  return (
    <div className={`grid grid-cols-${cols} gap-3`}>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <SkeletonCard key={i} className={`${cardHeight} rounded-3xl`} />
      ))}
    </div>
  );
}
