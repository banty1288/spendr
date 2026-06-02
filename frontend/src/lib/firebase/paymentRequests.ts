import { collection, doc, setDoc, getDocs, query, where, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { PaymentRequest, PaymentRequestStatus } from "../../types/paymentRequest";

const PAYMENT_REQUESTS_COLLECTION = "paymentRequests";

export async function createPaymentRequest(
  data: Omit<PaymentRequest, "id" | "createdAt" | "updatedAt" | "status">
): Promise<string> {
  const reqRef = doc(collection(db, PAYMENT_REQUESTS_COLLECTION));
  
  const request: PaymentRequest = {
    ...data,
    id: reqRef.id,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(reqRef, request);
  return reqRef.id;
}

export async function getPaymentRequestsForUser(userId: string): Promise<PaymentRequest[]> {
  const incomingQuery = query(
    collection(db, PAYMENT_REQUESTS_COLLECTION),
    where("receiverId", "==", userId)
  );
  
  const outgoingQuery = query(
    collection(db, PAYMENT_REQUESTS_COLLECTION),
    where("senderId", "==", userId)
  );

  const [incomingSnaps, outgoingSnaps] = await Promise.all([
    getDocs(incomingQuery),
    getDocs(outgoingQuery)
  ]);

  const requests: PaymentRequest[] = [];
  
  incomingSnaps.forEach(d => requests.push(d.data() as PaymentRequest));
  outgoingSnaps.forEach(d => {
    // Avoid duplicates if user requested money from themselves (shouldn't happen, but just in case)
    if (!requests.some(r => r.id === d.id)) {
      requests.push(d.data() as PaymentRequest);
    }
  });

  return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updatePaymentRequestStatus(
  requestId: string,
  status: PaymentRequestStatus
): Promise<void> {
  const reqRef = doc(db, PAYMENT_REQUESTS_COLLECTION, requestId);
  const updates: Partial<PaymentRequest> = {
    status,
    updatedAt: new Date().toISOString(),
  };

  if (status === "PAID") {
    updates.paidAt = new Date().toISOString();
  }

  await updateDoc(reqRef, updates);
}

export function subscribeToGroupPaymentRequests(
  groupId: string,
  callback: (requests: PaymentRequest[]) => void
) {
  const q = query(
    collection(db, PAYMENT_REQUESTS_COLLECTION),
    where("groupId", "==", groupId)
  );

  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => doc.data() as PaymentRequest);
    callback(requests);
  });
}
