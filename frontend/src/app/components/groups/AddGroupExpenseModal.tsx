import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Users, IndianRupee } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { GroupMember } from '../../../types/groups';
import { BillSplit, BillParticipant } from '../../../types/billSplit';

interface AddGroupExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  members: GroupMember[];
  onSubmit: (bill: Omit<BillSplit, "id" | "createdAt" | "status">, participants: Omit<BillParticipant, "id" | "billId" | "joinedAt">[]) => Promise<void>;
}

export function AddGroupExpenseModal({ isOpen, onClose, groupId, members, onSubmit }: AddGroupExpenseModalProps) {
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [payerId, setPayerId] = useState<string>(user?.uid || '');
  const [splitMethod, setSplitMethod] = useState<'equal' | 'custom'>('equal');
  
  // By default, everyone is included
  const [includedMembers, setIncludedMembers] = useState<Set<string>>(new Set(members.map(m => m.userId)));
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMember = (uid: string) => {
    const next = new Set(includedMembers);
    if (next.has(uid)) {
      next.delete(uid);
    } else {
      next.add(uid);
    }
    setIncludedMembers(next);
  };

  const handleCustomAmountChange = (uid: string, amount: string) => {
    const val = parseFloat(amount) || 0;
    setCustomAmounts(prev => ({ ...prev, [uid]: val }));
  };

  const isValid = useMemo(() => {
    if (!title.trim() || !totalAmount || Number(totalAmount) <= 0 || includedMembers.size === 0 || !payerId) return false;
    if (splitMethod === 'custom') {
      const sum = Array.from(includedMembers).reduce((acc, uid) => acc + (customAmounts[uid] || 0), 0);
      return Math.abs(sum - Number(totalAmount)) < 0.01;
    }
    return true;
  }, [title, totalAmount, includedMembers, payerId, splitMethod, customAmounts]);

  const handleSubmit = async () => {
    if (!isValid || !user) return;
    setIsSubmitting(true);
    
    const amount = Number(totalAmount);

    const bill: Omit<BillSplit, "id" | "createdAt" | "status"> = {
      groupId,
      title: title.trim(),
      totalAmount: amount,
      currency: "INR",
      category: "general",
      splitMethod,
      createdBy: user.uid,
      createdByName: user.displayName || "User",
      date: new Date().toISOString()
    };

    const participants: Omit<BillParticipant, "id" | "billId" | "joinedAt">[] = [];
    const membersArray = Array.from(includedMembers);
    
    let remainingAmount = amount;

    membersArray.forEach((uid, index) => {
      const member = members.find(m => m.userId === uid);
      const isPayer = uid === payerId;
      
      let amountOwed = 0;
      if (splitMethod === 'equal') {
        if (index === membersArray.length - 1) {
          // Last person gets the exact remainder to prevent rounding errors
          amountOwed = Number(remainingAmount.toFixed(2));
        } else {
          amountOwed = Number((amount / includedMembers.size).toFixed(2));
          remainingAmount -= amountOwed;
        }
      } else {
        amountOwed = Number((customAmounts[uid] || 0).toFixed(2));
      }

      participants.push({
        userId: uid,
        name: member?.name || "Unknown",
        avatarUrl: member?.avatarUrl,
        amountOwed,
        amountPaid: isPayer ? amount : 0,
        status: isPayer && amountOwed <= amount ? "paid" : "pending"
      });
    });

    try {
      await onSubmit(bill, participants);
      onClose();
      // Reset
      setTitle('');
      setTotalAmount('');
      setSplitMethod('equal');
      setIncludedMembers(new Set(members.map(m => m.userId)));
      setCustomAmounts({});
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm">
          <motion.div 
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            className="w-full h-[95vh] sm:h-auto sm:max-h-[90vh] max-w-lg bg-card sm:rounded-3xl rounded-t-3xl border border-border flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Add Group Expense</h2>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">What was this for?</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. Dinner, Groceries"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Amount</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      type="number" 
                      value={totalAmount} 
                      onChange={e => setTotalAmount(e.target.value ? Number(e.target.value) : '')} 
                      placeholder="0.00"
                      className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-xl font-bold text-foreground focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Paid By</label>
                  <select 
                    value={payerId}
                    onChange={(e) => setPayerId(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary transition-colors"
                  >
                    {members.map(m => (
                      <option key={m.userId} value={m.userId}>
                        {m.userId === user?.uid ? 'You' : m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Split Method</label>
                  <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <button 
                      onClick={() => setSplitMethod('equal')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${splitMethod === 'equal' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                    >
                      Equally
                    </button>
                    <button 
                      onClick={() => setSplitMethod('custom')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${splitMethod === 'custom' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                    >
                      Custom Amounts
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">For Who?</label>
                  <div className="space-y-2 border border-border rounded-xl p-2 bg-background">
                    {members.map(m => (
                      <div key={m.userId} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                          <input 
                            type="checkbox" 
                            checked={includedMembers.has(m.userId)}
                            onChange={() => toggleMember(m.userId)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="text-foreground font-medium">
                            {m.userId === user?.uid ? 'You' : m.name}
                          </span>
                        </label>
                        {splitMethod === 'custom' && includedMembers.has(m.userId) && (
                          <div className="w-24">
                            <input 
                              type="number"
                              value={customAmounts[m.userId] || ''}
                              onChange={(e) => handleCustomAmountChange(m.userId, e.target.value)}
                              placeholder="0"
                              className="w-full bg-background border border-border rounded-lg px-2 py-1 text-right text-sm focus:border-primary transition-colors"
                            />
                          </div>
                        )}
                        {splitMethod === 'equal' && includedMembers.has(m.userId) && (
                          <span className="text-sm text-muted-foreground">
                            ₹{totalAmount ? (Number(totalAmount) / includedMembers.size).toFixed(2) : '0.00'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-border bg-card">
              <button 
                onClick={handleSubmit} 
                disabled={!isValid || isSubmitting} 
                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Adding..." : <><Check className="w-5 h-5" /> Save Expense</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
