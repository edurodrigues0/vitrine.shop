"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { useState } from "react";
import { NotificationCenter } from "./notification-center";

export function NotificationBell() {
	const { unreadCount } = useNotifications();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="relative">
			<Button
				variant="ghost"
				size="icon"
				onClick={() => setIsOpen(!isOpen)}
				className="relative"
				title="Notificações"
			>
				<Bell className="h-5 w-5" />
				{unreadCount > 0 && (
					<span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
						{unreadCount > 99 ? "99+" : unreadCount}
					</span>
				)}
			</Button>
			{isOpen && (
				<NotificationCenter
					isOpen={isOpen}
					onClose={() => setIsOpen(false)}
				/>
			)}
		</div>
	);
}

