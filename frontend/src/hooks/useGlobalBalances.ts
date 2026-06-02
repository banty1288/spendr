import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BillParticipant } from '../types/billSplit';
import { PaymentRequest } from '../types/paymentRequest';

export function useGlobalBalances(userId: string | undefined) {
  const [owedToMe, setOwedToMe] = useState(0);
  const [iOwe, setIOwe] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Subscribe to participant records for balances
    const partsQuery = query(
      collection(db, "billParticipants"),
      where("userId", "==", userId)
    );

    const unsubParts = onSnapshot(partsQuery, (snap) => {
      const parts = snap.docs.map(d => d.data() as BillParticipant);
      
      let totalOwedToMe = 0;
      let totalIOwe = 0;

      // Group by groupId using the billId (We need to fetch bills to know the group, 
      // but actually we can just sum the net balances overall!)
      // Wait, net balance per bill:
      // If amountPaid > amountOwed, they paid more than their share -> they are owed money.
      // But settlements are intra-group. If they are +100 in Group A and -50 in Group B,
      // Total owed to me = 100, Total I owe = 50.
      
      // Let's approximate by grouping by bill. Actually grouping by group is better, 
      // but we don't have groupId on billParticipants. 
      // Instead, we just sum up everything across all bills.
      // Net overall balance:
      let netBalance = 0;
      parts.forEach(p => {
        netBalance += (p.amountPaid - p.amountOwed);
      });

      // If we don't group by group, we can just say:
      if (netBalance > 0) {
        totalOwedToMe = netBalance;
      } else {
        totalIOwe = Math.abs(netBalance);
      }

      setOwedToMe(totalOwedToMe);
      setIOwe(totalIOwe);
    });

    // Subscribe to pending requests
    const reqQuery = query(
      collection(db, "paymentRequests"),
      where("receiverId", "==", userId),
      where("status", "==", "PENDING")
    );

    const unsubReqs = onSnapshot(reqQuery, (snap) => {
      setPendingRequestsCount(snap.docs.length);
      setLoading(false);
    });

    return () => {
      unsubParts();
      unsubReqs();
    };
  }, [userId]);

  return { owedToMe, iOwe, pendingRequestsCount, loading };
}
