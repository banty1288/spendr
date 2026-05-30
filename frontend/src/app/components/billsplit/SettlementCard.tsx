import React, { useState } from 'react';
import { IndianRupee, ArrowRight, CheckCircle2, Share } from 'lucide-react';
import { SimplifiedDebt } from '../../../lib/settlementEngine';
import { useAuthStore } from '../../../store/authStore';
import { generateUpiIntent } from '../../../lib/upi';

interface SettlementCardProps {
  debt: SimplifiedDebt;
  receiverUpiId?: string;
  onMarkPaid: (debt: SimplifiedDebt) => Promise<void>;
}

export function SettlementCard({ debt, receiverUpiId, onMarkPaid }: SettlementCardProps) {
  const { user } = useAuthStore();
  const isPayer = user?.uid === debt.payerId;
  const isReceiver = user?.uid === debt.receiverId;
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayUPI = () => {
    if (!receiverUpiId) {
      alert("Receiver hasn't provided a UPI ID.");
      return;
    }
    const upiLink = generateUpiIntent({
      pa: receiverUpiId,
      pn: debt.receiverName,
      am: debt.amount.toString(),
      cu: 'INR',
      tn: `Settle up for Spendr Bill`
    });
    
    // Attempt to open UPI app
    window.location.href = upiLink;
  };

  const handleRequestMoney = () => {
    if (!receiverUpiId) {
      alert("You haven't provided your UPI ID to request money.");
      return;
    }
    const upiLink = generateUpiIntent({
      pa: receiverUpiId,
      pn: debt.receiverName,
      am: debt.amount.toString(),
      cu: 'INR',
      tn: `Spendr Bill Split`
    });

    if (navigator.share) {
      navigator.share({
        title: 'Payment Request',
        text: `Hi ${debt.payerName}, you owe me ₹${debt.amount}. Please pay using this link:`,
        url: upiLink
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(upiLink);
      alert('Payment link copied to clipboard! You can paste it in WhatsApp.');
    }
  };

  const handleMarkPaid = async () => {
    if (!confirm(`Confirm you want to mark ₹${debt.amount} as paid?`)) return;
    setIsProcessing(true);
    try {
      await onMarkPaid(debt);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-medium text-xs z-10 border border-[#0A0A0A]">
            {debt.payerName.charAt(0)}
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-medium text-xs border border-[#0A0A0A]">
            {debt.receiverName.charAt(0)}
          </div>
        </div>
        <div>
          <p className="text-white text-sm">
            <span className="font-semibold">{isPayer ? 'You' : debt.payerName}</span> owes{' '}
            <span className="font-semibold">{isReceiver ? 'You' : debt.receiverName}</span>
          </p>
          <p className="text-white/60 text-xs font-medium flex items-center mt-0.5">
            <IndianRupee className="w-3 h-3 mr-0.5" />
            {debt.amount.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {isPayer && receiverUpiId && (
          <button 
            onClick={handlePayUPI}
            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
          >
            Pay UPI
          </button>
        )}

        {isReceiver && receiverUpiId && (
          <button 
            onClick={handleRequestMoney}
            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
          >
            <Share className="w-3.5 h-3.5" /> Request
          </button>
        )}
        
        {(isPayer || isReceiver) && (
          <button 
            onClick={handleMarkPaid}
            disabled={isProcessing}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            {isProcessing ? 'Wait...' : <><CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid</>}
          </button>
        )}
      </div>
    </div>
  );
}
