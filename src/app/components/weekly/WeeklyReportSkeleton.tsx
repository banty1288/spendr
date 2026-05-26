import { motion } from "motion/react";

export function WeeklyReportSkeleton() {
  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="h-10 w-40 bg-white/10 rounded-lg animate-pulse" />
      </div>

      {/* Health Score Skeleton */}
      <div className="px-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse mb-4" />
          <div className="flex gap-4">
            <div className="flex-1 h-32 bg-white/10 rounded-lg animate-pulse" />
            <div className="w-32 h-32 bg-white/10 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Card 1 */}
      <div className="px-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
          <div className="h-6 w-40 bg-white/10 rounded-lg animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      {/* Card 2 */}
      <div className="px-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
          <div className="h-6 w-40 bg-white/10 rounded-lg animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      {/* Card 3 */}
      <div className="px-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="h-32 bg-white/10 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
