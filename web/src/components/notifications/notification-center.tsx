"use client";

import { useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, Trash2, X, Package, AlertTriangle, ShoppingBag, Store, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { useRouter } from "next/navigation";
import type { Notification } from "@/dtos/notification";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NotificationCenterProps {
	isOpen: boolean;
	onClose: () => void;
}

const notificationIcons: Record<string, typeof Bell> = {
	NEW_ORDER: ShoppingBag,
	ORDER_STATUS_CHANGED: Package,
	LOW_STOCK: AlertTriangle,
	PRODUCT_ADDED: Package,
	STORE_UPDATED: Store,
	SYSTEM: Info,
};

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
	const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
	const router = useRouter();
	const centerRef = useRef<HTMLDivElement>(null);

	// Fechar ao clicar fora
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (centerRef.current && !centerRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	const handleNotificationClick = (notification: Notification) => {
		// Marcar como lida
		if (!notification.read) {
			markAsRead(notification.id);
		}

		// Navegar para item relacionado
		if (notification.relatedId && notification.relatedType === "order") {
			router.push(`/dashboard/pedidos`);
			onClose();
		}
	};

	const handleMarkAllAsRead = () => {
		markAllAsRead();
	};

	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<div 
				className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
				onClick={onClose}
			/>
			{/* Modal */}
			<div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4 pointer-events-none">
				<div
					ref={centerRef}
					className="w-full max-w-md max-h-[600px] flex flex-col shadow-lg border rounded-lg bg-background pointer-events-auto"
					style={{ backgroundColor: 'hsl(var(--background))' }}
				>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<div className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						<h2 className="text-lg font-semibold">Notificações</h2>
						{unreadCount > 0 && (
							<span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
								{unreadCount}
							</span>
						)}
					</div>
					<div className="flex items-center gap-2">
						{unreadCount > 0 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleMarkAllAsRead}
								className="text-xs"
							>
								<CheckCheck className="h-4 w-4 mr-1" />
								Marcar todas
							</Button>
						)}
						<Button
							variant="ghost"
							size="icon"
							onClick={onClose}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Notifications List */}
				<div className="flex-1 overflow-y-auto">
					{notifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center p-8 text-center">
							<Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
							<p className="text-sm text-muted-foreground">
								Nenhuma notificação
							</p>
						</div>
					) : (
						<div className="divide-y">
							{notifications.map((notification) => {
								const Icon = notificationIcons[notification.type] || Bell;
								const isUnread = !notification.read;

								return (
									<div
										key={notification.id}
										className={`p-4 hover:bg-accent transition-colors cursor-pointer ${
											isUnread ? "bg-primary/5" : ""
										}`}
										onClick={() => handleNotificationClick(notification)}
									>
										<div className="flex items-start gap-3">
											<div
												className={`p-2 rounded-lg ${
													isUnread
														? "bg-primary/10 text-primary"
														: "bg-muted text-muted-foreground"
												}`}
											>
												<Icon className="h-4 w-4" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between gap-2">
													<div className="flex-1">
														<p
															className={`text-sm font-semibold ${
																isUnread ? "text-foreground" : "text-muted-foreground"
															}`}
														>
															{notification.title}
														</p>
														<p className="text-sm text-muted-foreground mt-1">
															{notification.message}
														</p>
														<p className="text-xs text-muted-foreground mt-2">
															{formatDistanceToNow(new Date(notification.createdAt), {
																addSuffix: true,
																locale: ptBR,
															})}
														</p>
													</div>
													<div className="flex items-center gap-1">
														{isUnread && (
															<Button
																variant="ghost"
																size="icon"
																className="h-6 w-6"
																onClick={(e) => {
																	e.stopPropagation();
																	markAsRead(notification.id);
																}}
															>
																<Check className="h-3 w-3" />
															</Button>
														)}
														<Button
															variant="ghost"
															size="icon"
															className="h-6 w-6 text-destructive hover:text-destructive"
															onClick={(e) => {
																e.stopPropagation();
																deleteNotification(notification.id);
															}}
														>
															<Trash2 className="h-3 w-3" />
														</Button>
													</div>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
		</>
	);
}

