export function GradientBackdrop() {
  return (
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#00d9ff]/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-40 left-0 w-80 h-80 bg-[#00ff88]/30 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#9d4edd]/20 rounded-full blur-[150px]" />
    </div>
  );
}
