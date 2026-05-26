import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserNotifications, addNotification, markNotificationStatus, markAllNotificationsRead } from "../lib/firebase/notifications";
import { generateCoachingInsights } from "../services/ai/coachingGateway";
import { useAuthStore } from "../store/authStore";
import { generateRequestHash } from "../services/ai/requestLock";
import type { SmartNotification, NotificationStatus } from "../types/notification";
import type { UserData } from "../types/user";
import type { Transaction } from "../types/transaction";

export function useNotifications(userData: UserData | null | undefined, transactions: Transaction[]) {
  const user = useAuthStore((state) => state.user);
  const uid = user?.uid;
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const queryKey = ["notifications", uid];

  const query = useQuery({
    queryKey,
    queryFn: () => (uid ? fetchUserNotifications(uid) : Promise.resolve([])),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const notifications = query.data ?? [];
  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const markAsReadMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: NotificationStatus }) =>
      markNotificationStatus(uid!, id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(uid!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const markAsRead = useCallback((id: string) => {
    markAsReadMutation.mutate({ id, status: "read" });
  }, [markAsReadMutation]);

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const generateCoaching = useCallback(async () => {
    if (!uid || isGenerating) return;
    try {
      setIsGenerating(true);
      const newInsights = await generateCoachingInsights({ userData, transactions });
      
      // Save all new insights to Firebase
      for (const insight of newInsights) {
        await addNotification(uid, insight);
      }
      
      // Refresh the query
      queryClient.invalidateQueries({ queryKey });
    } catch (error) {
      console.error("Failed to generate coaching insights:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [uid, isGenerating, userData, transactions, queryClient, queryKey]);

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    isGenerating,
    generateCoaching,
    markAsRead,
    markAllAsRead,
  };
}
