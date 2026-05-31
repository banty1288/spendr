import React, { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { Receipt, X, Check, Users, ArrowRight, Wand2 } from 'lucide-react';
import { BillSplit, BillParticipant, SplitMethod, BillItem } from '../../../types/billSplit';
import { ReceiptScanner } from './ReceiptScanner';
import { ParsedReceipt } from '../../../services/ai/receiptParser';
import { useAuthStore } from '../../../store/authStore';

interface SplitCreationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bill: Omit<BillSplit, "id" | "createdAt" | "status">, participants: Omit<BillParticipant, "id" | "billId" | "joinedAt">[]) => Promise<string>;
}

type Step = 'method' | 'scan' | 'edit_items' | 'assign' | 'review';

export function SplitCreationFlow({ isOpen, onClose, onSubmit }: SplitCreationFlowProps) {
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>('method');
  
  const [title, setTitle] = useState("New Bill");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [items, setItems] = useState<BillItem[]>([]);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setStep('method');
    setTitle("New Bill");
    setTotalAmount(0);
    setItems([]);
    setTaxAmount(0);
    setTipAmount(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleScanComplete = (receipt: ParsedReceipt) => {
    setTitle(`Bill from ${receipt.merchantName}`);
    setTotalAmount(receipt.totalAmount);
    setTaxAmount(receipt.taxAmount);
    setTipAmount(receipt.tipAmount);
    setItems(receipt.items.map((i, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      name: i.name,
      amount: i.amount,
      assignedTo: []
    })));
    setStep('edit_items');
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    
    // Fallback: If not itemized, just do equal split for now. 
    // In a full implementation, we'd have a UI to select participants and map them.
    const bill: Omit<BillSplit, "id" | "createdAt" | "status"> = {
      title,
      totalAmount,
      taxAmount,
      tipAmount,
      currency: "INR",
      category: "general",
      splitMethod: items.length > 0 ? "itemized" : "equal",
      items,
      createdBy: user.uid,
      createdByName: user.displayName || "User",
      date: new Date().toISOString()
    };

    // For demo purposes, we will just assign the whole bill to the creator if no one else is selected
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
        className="w-full h-[90vh] sm:h-auto sm:max-h-[90vh] max-w-2xl bg-[#0A0A0A] sm:rounded-3xl rounded-t-3xl border-t sm:border border-white/10 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-[#0A0A0A] z-10">
          <h2 className="text-xl font-bold text-white tracking-tight">Create Split</h2>
          <button onClick={handleClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/70">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {step === 'method' && (
              <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-6">How would you like to enter the bill?</h3>
                
                <button 
                  onClick={() => setStep('scan')}
                  className="w-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 hover:border-emerald-500/60 p-6 rounded-2xl flex items-center gap-4 transition-all group text-left"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wand2 className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Smart Scan</h4>
                    <p className="text-white/60 text-sm mt-1">Take a photo of the receipt and let AI extract all items automatically.</p>
                  </div>
                </button>

                <button 
                  onClick={() => setStep('edit_items')}
                  className="w-full bg-white/5 border border-white/10 hover:bg-white/10 p-6 rounded-2xl flex items-center gap-4 transition-all group text-left"
                >
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Receipt className="w-7 h-7 text-white/70" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Manual Entry</h4>
                    <p className="text-white/60 text-sm mt-1">Enter the total amount and split it equally or by percentage.</p>
                  </div>
                </button>
              </motion.div>
            )}

            {step === 'scan' && (
              <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ReceiptScanner onScanComplete={handleScanComplete} onClose={() => setStep('method')} />
              </motion.div>
            )}

            {step === 'edit_items' && (
              <motion.div key="edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Bill Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50" />
                </div>

                {items.length > 0 ? (
                  <div>
                    <h3 className="text-white font-semibold mb-3">Line Items ({items.length})</h3>
                    <div className="space-y-2">
                      {items.map((item, idx) => (
                        <div key={item.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                          <span className="text-white font-medium">{item.name}</span>
                          <span className="text-emerald-400 font-semibold">₹{item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                      <span className="text-white font-bold">Total Extracted</span>
                      <span className="text-emerald-400 font-bold text-lg">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Total Amount (₹)</label>
                    <input type="number" value={totalAmount || ''} onChange={e => setTotalAmount(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-emerald-500/50" placeholder="0.00" />
                  </div>
                )}

                <button onClick={handleSubmit} disabled={isSubmitting || totalAmount <= 0} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-8">
                  {isSubmitting ? "Saving..." : <><Check className="w-5 h-5" /> Save Bill</>}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
