"use client";

import { CheckCircle2, Clock, Package, Truck, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type OrderStatus = "PENDENTE" | "CONFIRMADO" | "PREPARANDO" | "ENVIADO" | "ENTREGUE" | "CANCELADO";

interface OrderStatusTimelineProps {
	currentStatus: OrderStatus;
	createdAt: string;
	updatedAt: string;
}

const statusOrder: OrderStatus[] = [
	"PENDENTE",
	"CONFIRMADO",
	"PREPARANDO",
	"ENVIADO",
	"ENTREGUE",
];

const statusConfig: Record<
	OrderStatus,
	{ label: string; icon: typeof Clock; color: string; bgColor: string }
> = {
	PENDENTE: {
		label: "Pendente",
		icon: Clock,
		color: "text-yellow-600 dark:text-yellow-400",
		bgColor: "bg-yellow-500/10 dark:bg-yellow-500/20 border-yellow-500/20",
	},
	CONFIRMADO: {
		label: "Confirmado",
		icon: CheckCircle2,
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20",
	},
	PREPARANDO: {
		label: "Preparando",
		icon: Package,
		color: "text-purple-600 dark:text-purple-400",
		bgColor: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/20",
	},
	ENVIADO: {
		label: "Enviado",
		icon: Truck,
		color: "text-indigo-600 dark:text-indigo-400",
		bgColor: "bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/20",
	},
	ENTREGUE: {
		label: "Entregue",
		icon: CheckCircle2,
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-500/10 dark:bg-green-500/20 border-green-500/20",
	},
	CANCELADO: {
		label: "Cancelado",
		icon: XCircle,
		color: "text-red-600 dark:text-red-400",
		bgColor: "bg-red-500/10 dark:bg-red-500/20 border-red-500/20",
	},
};

export function OrderStatusTimeline({
	currentStatus,
	createdAt,
	updatedAt,
}: OrderStatusTimelineProps) {
	const currentIndex = statusOrder.indexOf(currentStatus);
	const isCanceled = currentStatus === "CANCELADO";

	return (
		<div className="space-y-4">
			<h4 className="text-sm font-semibold text-muted-foreground">Histórico de Status</h4>
			<div className="relative">
				{/* Linha vertical */}
				<div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
				
				<div className="space-y-4">
					{statusOrder.map((status, index) => {
						const config = statusConfig[status];
						const Icon = config.icon;
						const isCompleted = index <= currentIndex && !isCanceled;
						const isCurrent = index === currentIndex && !isCanceled;
						const isPending = index > currentIndex && !isCanceled;

						return (
							<div key={status} className="relative flex items-start gap-4">
								{/* Ícone */}
								<div
									className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
										isCurrent
											? `${config.bgColor} ${config.color} border-current ring-2 ring-current/20`
											: isCompleted
												? `${config.bgColor} ${config.color} border-current`
												: "bg-muted border-border text-muted-foreground"
									}`}
								>
									<Icon className="h-5 w-5" />
									{isCompleted && !isCurrent && (
										<div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
											<CheckCircle2 className="h-2.5 w-2.5 text-white" />
										</div>
									)}
								</div>
								{/* Conteúdo */}
								<div className="flex-1 pt-1">
									<div className="flex items-center justify-between">
										<div>
											<p
												className={`font-semibold ${
													isCurrent
														? config.color
														: isCompleted
															? "text-foreground"
															: "text-muted-foreground"
												}`}
											>
												{config.label}
											</p>
											{isCurrent && (
												<p className="text-xs text-muted-foreground mt-1">
													Atualizado em{" "}
													{format(new Date(updatedAt), "dd/MM/yyyy 'às' HH:mm", {
														locale: ptBR,
													})}
												</p>
											)}
											{index === 0 && (
												<p className="text-xs text-muted-foreground mt-1">
													Pedido criado em{" "}
													{format(new Date(createdAt), "dd/MM/yyyy 'às' HH:mm", {
														locale: ptBR,
													})}
												</p>
											)}
										</div>
										{isCurrent && (
											<span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
												Atual
											</span>
										)}
									</div>
								</div>
							</div>
						);
					})}
					
					{/* Status Cancelado */}
					{isCanceled && (
						<div className="relative flex items-start gap-4">
							<div
								className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${statusConfig.CANCELADO.bgColor} ${statusConfig.CANCELADO.color} border-current ring-2 ring-current/20`}
							>
								<XCircle className="h-5 w-5" />
							</div>
							<div className="flex-1 pt-1">
								<div className="flex items-center justify-between">
									<div>
										<p className={`font-semibold ${statusConfig.CANCELADO.color}`}>
											{statusConfig.CANCELADO.label}
										</p>
										<p className="text-xs text-muted-foreground mt-1">
											Cancelado em{" "}
											{format(new Date(updatedAt), "dd/MM/yyyy 'às' HH:mm", {
												locale: ptBR,
											})}
										</p>
									</div>
									<span className="text-xs font-medium text-red-600 bg-red-500/10 px-2 py-1 rounded-full">
										Atual
									</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

