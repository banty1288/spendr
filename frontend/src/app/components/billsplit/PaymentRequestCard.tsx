import React, { useState } from 'react';
import { IndianRupee, Clock, CheckCircle2, XCircle, Bell } from 'lucide-react';
import { PaymentRequest } from '../../../types/paymentRequest';
import { useAuthStore } from '../../../store/authStore';
import { generateUpiIntent } from '../../../lib/upi';
import { updatePaymentRequestStatus } from '../../../lib/firebase/paymentRequests';
import { toast } from 'sonner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

interface PaymentRequestCardProps {
  request: PaymentRequest;
  onStatusChange?: () => void;
}

export function PaymentRequestCard({ request, onStatusChange }: PaymentRequestCardProps) {
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isSender = user?.uid === request.senderId; // They requested money
  const isReceiver = user?.uid === request.receiverId; // They owe money

  const [receiverUpiId, setReceiverUpiId] = useState<string | undefined>();

  React.useEffect(() => {
    if (request.senderId) {
      getDoc(doc(db, "users", request.senderId)).then(snap => {
        if (snap.exists()) {
          setReceiverUpiId(snap.data().upiId);
        }
      }).catch(console.error);
    }
  }, [request.senderId]);

  const handlePayUPI = () => {
    if (!receiverUpiId) {
      toast.error("The requester hasn't provided a UPI ID.");
      return;
    }
    const upiLink = generateUpiIntent({
      pa: receiverUpiId,
      pn: request.senderName,
      am: request.amount.toString(),
      cu: 'INR',
      tn: `Spendr: ${request.note || 'Payment Request'}`
    });
    window.location.href = upiLink;
  };

  const handleStatusUpdate = async (status: "PAID" | "DECLINED") => {
    if (!confirm(`Are you sure you want to mark this as ${status}?`)) return;
    setIsProcessing(true);
    try {
      await updatePaymentRequestStatus(request.id, status);
      toast.success(`Request marked as ${status}`);
      if (onStatusChange) onStatusChange();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemind = () => {
    toast.success("Reminder sent!");
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold border border-blue-500/30">
            {isSender ? request.receiverName.charAt(0) : request.senderName.charAt(0)}
          </div>
          <div>
            <p className="text-white font-medium text-sm">
              {isSender ? `You requested money from ${request.receiverName}` : `${request.senderName} requested money`}
            </p>
            <p className="text-white/50 text-xs flex items-center mt-0.5">
              <Clock className="w-3 h-3 mr-1" />
              {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-lg flex items-center justify-end">
            <IndianRupee className="w-4 h-4 mr-0.5" />
            {request.amount.toFixed(2)}
          </p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide
            ${request.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' : 
              request.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 
              'bg-red-500/20 text-red-400'}`}
          >
            {request.status}
          </span>
        </div>
      </div>

      {request.note && (
        <p className="text-white/70 text-sm mb-4 italic">"{request.note}"</p>
      )}

      {request.status === 'PENDING' && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
          {isReceiver && (
            <>
              <button 
                onClick={handlePayUPI}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black text-sm font-bold py-2 rounded-lg transition-transform active:scale-95"
              >
                Pay via UPI
              </button>
              <button 
                onClick={() => handleStatusUpdate('PAID')}
                disabled={isProcessing}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" /> Paid
              </button>
              <button 
                onClick={() => handleStatusUpdate('DECLINED')}
                disabled={isProcessing}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </>
          )}

          {isSender && (
            <>
              <button 
                onClick={handleRemind}
                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" /> Send Reminder
              </button>
              <button 
                onClick={() => handleStatusUpdate('PAID')}
                disabled={isProcessing}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Paid
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
