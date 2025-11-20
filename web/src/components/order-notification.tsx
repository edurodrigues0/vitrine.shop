"use client";

import { useOrderNotifications, type OrderNotification } from "@/contexts/order-notifications-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle2, Store, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface OrderNotificationProps {
  notification: OrderNotification;
  citySlug?: string;
}

export function OrderNotificationComponent({ notification, citySlug }: OrderNotificationProps) {
  const { dismissNotification } = useOrderNotifications();

  const timeAgo = useMemo(() => {
    const now = new Date();
    const time = new Date(notification.timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  }, [notification.timestamp]);

  if (notification.dismissed) {
    return null;
  }

  return (
    <Card className="p-4 border-primary/30 bg-background animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 text-xs">
              Pedido Confirmado
            </Badge>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dispensar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h4 className="font-semibold text-sm mb-1">
            Pedido solicitado para {notification.storeName}
          </h4>
          <p className="text-xs text-muted-foreground mb-2">
            Seu pedido foi registrado com sucesso! Você pode continuar comprando ou finalizar outros pedidos.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs text-muted-foreground">Pedido #{notification.orderId.slice(0, 8)}</p>
            <span className="text-xs text-muted-foreground">•</span>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface OrderNotificationsListProps {
  citySlug?: string;
  maxItems?: number;
}

export function OrderNotificationsList({ citySlug, maxItems = 3 }: OrderNotificationsListProps) {
  const { notifications, getUnreadCount } = useOrderNotifications();

  const unreadNotifications = useMemo(() => {
    return notifications
      .filter((n) => !n.dismissed)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, maxItems);
  }, [notifications, maxItems]);

  const unreadCount = getUnreadCount();

  if (unreadNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 w-full max-w-sm pointer-events-none">
      <div className="pointer-events-auto space-y-2">
        {unreadNotifications.map((notification) => (
          <OrderNotificationComponent
            key={notification.id}
            notification={notification}
            citySlug={citySlug}
          />
        ))}
      </div>
    </div>
  );
}
