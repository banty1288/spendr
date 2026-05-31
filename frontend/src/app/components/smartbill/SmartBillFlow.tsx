import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { Camera, Image as ImageIcon, X, Wand2, ArrowRight, Check } from 'lucide-react';
import { parseReceiptImage, ParsedReceipt } from '../../../services/ai/receiptParser';
import { useTransactions } from '../../../hooks/useTransactions';
import { useAuthStore } from '../../../store/authStore';
import { Transaction } from '../../../types/transaction';
import { toast } from 'sonner';

interface SmartBillFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SmartBillFlow({ isOpen, onClose }: SmartBillFlowProps) {
  const [step, setStep] = useState<'upload' | 'scanning' | 'review'>('upload');
  const [receiptData, setReceiptData] = useState<ParsedReceipt | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addTransaction } = useTransactions();
  const { user } = useAuthStore();

  const handleClose = () => {
    setStep('upload');
    setReceiptData(null);
    setPreviewUrl(null);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep('scanning');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setPreviewUrl(base64);
      
      try {
        const parsed = await parseReceiptImage(base64, file.type);
        setReceiptData(parsed);
        setStep('review');
      } catch (err) {
        console.error("OCR Error:", err);
        toast.error("Failed to read receipt. Please try again.");
        setStep('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveExpense = async () => {
    if (!receiptData || !user) return;
    
    const newTx: Omit<Transaction, "id" | "createdAt" | "updatedAt"> = {
      amount: receiptData.totalAmount,
      type: "expense",
      categoryId: "general", // Can be enhanced with AI category mapping
      merchant: receiptData.merchantName,
      date: new Date().toISOString(), // Use current time or parsed date
      notes: "Scanned via Smart Bill",
    };

    try {
      await addTransaction(newTx);
      toast.success("Expense saved successfully!");
      handleClose();
    } catch (err) {
      toast.error("Failed to save expense");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full h-[90vh] sm:h-auto sm:max-h-[90vh] max-w-lg bg-card sm:rounded-3xl rounded-t-3xl border-t sm:border border-border flex flex-col overflow-hidden shadow-[0_0_40px_rgba(0,255,153,0.1)] relative"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-border bg-card/50 backdrop-blur-md z-10">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            Smart Bill
          </h2>
          <button onClick={handleClose} className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 relative z-10">
          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full space-y-6 py-12">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <div className="text-center space-y-2 max-w-xs">
                  <h3 className="text-xl font-bold text-foreground">Scan your receipt</h3>
                  <p className="text-sm text-muted-foreground">AI will extract the merchant, amount, and items automatically.</p>
                </div>

                <div className="w-full space-y-3 mt-8">
                  <button onClick={() => fileInputRef.current?.click()} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                    <Camera className="w-5 h-5" /> Take Photo
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="w-full bg-card hover:bg-muted border border-border text-foreground py-4 rounded-2xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2">
                    <ImageIcon className="w-5 h-5" /> Upload Image
                  </button>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload}
                  capture="environment"
                />
              </motion.div>
            )}

            {step === 'scanning' && (
              <motion.div key="scanning" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full py-20">
                <div className="relative w-32 h-32 mb-8">
                  {previewUrl && (
                    <img src={previewUrl} alt="Receipt Preview" className="w-full h-full object-cover rounded-2xl opacity-50 grayscale" />
                  )}
                  <div className="absolute inset-0 rounded-2xl border-2 border-primary border-dashed animate-[spin_4s_linear_infinite]" />
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Wand2 className="w-8 h-8 text-primary animate-bounce" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground">Analyzing Receipt...</h3>
                <p className="text-sm text-muted-foreground mt-2">Extracting merchant and amounts</p>
              </motion.div>
            )}

            {step === 'review' && receiptData && (
              <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center shadow-inner">
                  <p className="text-sm text-primary font-medium mb-1">Total Amount</p>
                  <h3 className="text-4xl font-black text-foreground">₹{receiptData.totalAmount.toFixed(2)}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{receiptData.merchantName}</p>
                </div>

                {receiptData.items.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Line Items</h4>
                    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                      {receiptData.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-foreground">{item.name}</span>
                          <span className="text-foreground font-semibold">₹{item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="pt-3 mt-3 border-t border-border flex justify-between items-center">
                        <span className="text-muted-foreground">Tax & Tip</span>
                        <span className="text-muted-foreground">₹{(receiptData.taxAmount + receiptData.tipAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 pt-4">
                  <button onClick={handleSaveExpense} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" /> Confirm as Expense
                  </button>
                  <button onClick={handleClose} className="w-full bg-transparent hover:bg-muted text-muted-foreground py-4 rounded-2xl font-semibold transition-all">
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
