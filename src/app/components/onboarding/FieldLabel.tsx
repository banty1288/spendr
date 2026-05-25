interface FieldLabelProps {
  children: React.ReactNode;
}

export function FieldLabel({ children }: FieldLabelProps) {
  return (
    <label className="text-white/50 text-xs uppercase tracking-wider mb-3 block">
      {children}
    </label>
  );
}
