import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { userNotificationRef, userNotificationsRef } from "./paths";
import type { SmartNotification, NotificationStatus } from "../../types/notification";

export async function fetchUserNotifications(uid: string): Promise<SmartNotification[]> {
  const q = query(
    userNotificationsRef(uid),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as SmartNotification)
  );
}

export async function addNotification(uid: string, notification: Omit<SmartNotification, "id" | "createdAt" | "status">) {
  const notifRef = doc(userNotificationsRef(uid));
  const newNotif: SmartNotification = {
    ...notification,
    id: notifRef.id,
    status: "unread",
    createdAt: new Date().toISOString(),
  };

  await setDoc(notifRef, {
    ...newNotif,
    _createdAt: serverTimestamp(),
  });

  return newNotif;
}

export async function markNotificationStatus(
  uid: string,
  notificationId: string,
  status: NotificationStatus
) {
  const notifRef = userNotificationRef(uid, notificationId);
  await updateDoc(notifRef, { status, _updatedAt: serverTimestamp() });
}

export async function markAllNotificationsRead(uid: string) {
  const q = query(
    userNotificationsRef(uid),
    where("status", "==", "unread")
  );
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { status: "read", _updatedAt: serverTimestamp() });
  });

  await batch.commit();
}
