import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2 } from "lucide-react";
import type { Transaction, TransactionInput, TransactionType } from "../../../types/transaction";
import { categoriesForType } from "../../../lib/transactions/constants";

interface TransactionFormSheetProps {
  open: boolean;
  mode: "add" | "edit";
  initial?: Transaction | null;
  onClose: () => void;
  onSubmit: (input: TransactionInput) => Promise<void>;
  isSubmitting?: boolean;
}

const defaultForm = (): TransactionInput => ({
  merchant: "",
  amount: 0,
  type: "expense",
  categoryId: "food",
  notes: "",
  date: new Date().toISOString().slice(0, 16),
});

export function TransactionFormSheet({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  isSubmitting,
}: TransactionFormSheetProps) {
  const [form, setForm] = useState<TransactionInput>(defaultForm);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        merchant: initial.merchant,
        amount: initial.amount,
        type: initial.type,
        categoryId: initial.categoryId,
        notes: initial.notes,
        date: initial.date.slice(0, 16),
      });
    } else {
      setForm(defaultForm());
    }
  }, [open, initial]);

  const categories = categoriesForType(form.type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.merchant.trim() || form.amount <= 0) return;
    await onSubmit({
      ...form,
      date: new Date(form.date).toISOString(),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/70 z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-[70] flex justify-center"
          >
            <div className="w-full max-w-[430px] bg-[#0a0a14] border-t border-border rounded-t-3xl px-6 pt-6 pb-10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {mode === "add" ? "Add transaction" : "Edit transaction"}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full bg-card shadow-sm border border-border"
                >
                  <X size={20} className="text-white/70" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2">
                  {(["expense", "income"] as TransactionType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          type: t,
                          categoryId: categoriesForType(t)[0]?.id ?? "other",
                        }))
                      }
                      className={`flex-1 py-3 rounded-2xl font-medium text-sm capitalize transition-colors ${
                        form.type === t
                          ? t === "income"
                            ? "bg-card text-[#00ff88] border border-[#00ff88]/40"
                            : "bg-card text-[#ff3366] border border-[#ff3366]/40"
                          : "bg-card shadow-sm text-white/50 border border-border"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <input
                  required
                  placeholder="Merchant name"
                  value={form.merchant}
                  onChange={(e) => setForm((f) => ({ ...f, merchant: e.target.value }))}
                  className="w-full bg-card shadow-sm border border-border rounded-2xl py-4 px-4 text-white placeholder:text-white/40 focus:border-[#00d9ff] focus:outline-none"
                />

                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Amount"
                  value={form.amount || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full bg-card shadow-sm border border-border rounded-2xl py-4 px-4 text-white placeholder:text-white/40 focus:border-[#00d9ff] focus:outline-none"
                />

                <div>
                  <p className="text-white/50 text-xs mb-2">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, categoryId: cat.id }))}
                        className={`px-3 py-2 rounded-xl text-sm border transition-colors ${
                          form.categoryId === cat.id
                            ? "border-white/30 bg-white/10 text-white"
                            : "border-border bg-card shadow-sm text-white/50"
                        }`}
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full bg-card shadow-sm border border-border rounded-2xl py-4 px-4 text-white focus:border-[#00d9ff] focus:outline-none"
                />

                <textarea
                  placeholder="Notes (optional)"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full bg-card shadow-sm border border-border rounded-2xl py-3 px-4 text-white placeholder:text-white/40 focus:border-[#00d9ff] focus:outline-none resize-none"
                />

                <button
                  type="submit"
                  disabled={isSubmitting || !form.merchant.trim() || form.amount <= 0}
                  className="w-full bg-gradient-to-r from-[#00d9ff] to-[#00ff88] text-black py-4 rounded-2xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : mode === "add" ? (
                    "Add transaction"
                  ) : (
                    "Save changes"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
