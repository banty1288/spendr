import React, { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Users } from 'lucide-react';
import { BillSplit, BillParticipant } from '../../../types/billSplit';
import { useAuthStore } from '../../../store/authStore';

interface SplitCreationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bill: Omit<BillSplit, "id" | "createdAt" | "status">, participants: Omit<BillParticipant, "id" | "billId" | "joinedAt">[]) => Promise<string>;
}

export function SplitCreationFlow({ isOpen, onClose, onSubmit }: SplitCreationFlowProps) {
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState("New Bill");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setTitle("New Bill");
    setTotalAmount(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    
    // Manual equal split setup
    const bill: Omit<BillSplit, "id" | "createdAt" | "status"> = {
      title,
      totalAmount,
      taxAmount: 0,
      tipAmount: 0,
      currency: "INR",
      category: "general",
      splitMethod: "equal",
      items: [],
      createdBy: user.uid,
      createdByName: user.displayName || "User",
      date: new Date().toISOString()
    };

    // For manual split, we just assign to the creator right now.
    // In a full implementation, we'd have a UI to select friends.
    const participants: Omit<BillParticipant, "id" | "billId" | "joinedAt">[] = [{
      userId: user.uid,
      name: user.displayName || "You",
      avatarUrl: user.photoURL || undefined,
      amountOwed: totalAmount,
      amountPaid: totalAmount,
      status: "settled"
    }];

    try {
      await onSubmit(bill, participants);
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full h-[90vh] sm:h-auto sm:max-h-[90vh] max-w-2xl bg-card sm:rounded-3xl rounded-t-3xl border-t sm:border border-border flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-border bg-card z-10">
          <h2 className="text-xl font-bold text-foreground tracking-tight">Create Manual Split</h2>
          <button onClick={handleClose} className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div key="edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Bill Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors" 
                  placeholder="Dinner at Restaurant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Total Amount (₹)</label>
                <input 
                  type="number" 
                  value={totalAmount || ''} 
                  onChange={e => setTotalAmount(Number(e.target.value))} 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-xl font-bold focus:outline-none focus:border-primary/50 transition-colors" 
                  placeholder="0.00" 
                />
              </div>

              <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3">
                <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  By default, you are paying for this bill. You can edit participants and exact amounts on the next screen once created.
                </p>
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting || totalAmount <= 0} 
                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-8"
              >
                {isSubmitting ? "Creating..." : <><Check className="w-5 h-5" /> Create Split Bill</>}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
