"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface OrderNotification {
  id: string;
  storeId: string;
  storeName: string;
  orderId: string;
  timestamp: string;
  dismissed: boolean;
}

interface OrderNotificationsContextType {
  notifications: OrderNotification[];
  addNotification: (storeId: string, storeName: string, orderId: string) => void;
  dismissNotification: (notificationId: string) => void;
  dismissAll: () => void;
  getUnreadCount: () => number;
}

const OrderNotificationsContext = createContext<OrderNotificationsContextType | undefined>(undefined);

const NOTIFICATIONS_STORAGE_KEY = "vitrine-order-notifications";

export function OrderNotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setNotifications(parsed || []);
        } catch {
          localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
        }
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(notifications),
      );
    }
  }, [notifications]);

  const addNotification = (storeId: string, storeName: string, orderId: string) => {
    const notification: OrderNotification = {
      id: `${Date.now()}-${orderId}`,
      storeId,
      storeName,
      orderId,
      timestamp: new Date().toISOString(),
      dismissed: false,
    };

    setNotifications((prev) => {
      // Não adicionar duplicatas
      const exists = prev.some(
        (n) => n.orderId === orderId && n.storeId === storeId && !n.dismissed,
      );
      if (exists) return prev;
      
      return [notification, ...prev];
    });
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, dismissed: true } : n,
      ),
    );
  };

  const dismissAll = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, dismissed: true })),
    );
  };

  const getUnreadCount = (): number => {
    return notifications.filter((n) => !n.dismissed).length;
  };

  return (
    <OrderNotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        dismissNotification,
        dismissAll,
        getUnreadCount,
      }}
    >
      {children}
    </OrderNotificationsContext.Provider>
  );
}

export function useOrderNotifications() {
  const context = useContext(OrderNotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useOrderNotifications must be used within a OrderNotificationsProvider",
    );
  }
  return context;
}
