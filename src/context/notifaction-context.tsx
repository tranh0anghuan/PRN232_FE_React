"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { getUserFromToken, isLoggedIn } from "@/utils/token/auth";
import { userNotificationService } from "@/services/user/notifcation/service";

interface NotificationContextType {
  unreadCount: number;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  setUnreadCount: (count: number) => void;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!isLoggedIn()) {
      setUnreadCount(0);
      return;
    }

    const user = getUserFromToken();
    if (!user?.username) return;

    try {
      const response = await userNotificationService.getByUsername(
        user.username
      );
      if (response.success && response.data) {
        const unreadNotifications = response.data.filter(
          (notification) => !notification.isRead
        );
        setUnreadCount(unreadNotifications.length);
      }
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
    }
  };

  const incrementUnreadCount = () => {
    setUnreadCount((prev) => prev + 1);
  };

  const decrementUnreadCount = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const refreshUnreadCount = async () => {
    await fetchUnreadCount();
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const value: NotificationContextType = {
    unreadCount,
    incrementUnreadCount,
    decrementUnreadCount,
    setUnreadCount,
    refreshUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}
