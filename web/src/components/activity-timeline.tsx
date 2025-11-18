"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { storesService } from "@/services/stores-service";
import { useSelectedStore } from "@/hooks/use-selected-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, Package, Eye, Clock, Filter, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

interface Activity {
	id: string;
	type: "ORDER" | "PRODUCT" | "VISIT";
	title: string;
	description: string;
	createdAt: string;
	relatedId?: string;
}

type ActivityType = "ORDER" | "PRODUCT" | "VISIT" | "ALL";
type ActivityPeriod = 1 | 7 | 30 | 90;

const activityIcons = {
	ORDER: ShoppingBag,
	PRODUCT: Package,
	VISIT: Eye,
};

const activityColors = {
	ORDER: "text-green-600 dark:text-green-400 bg-green-500/10 dark:bg-green-500/20",
	PRODUCT: "text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20",
	VISIT: "text-purple-600 dark:text-purple-400 bg-purple-500/10 dark:bg-purple-500/20",
};

const activityTypeLabels = {
	ALL: "Todas",
	ORDER: "Pedidos",
	PRODUCT: "Produtos",
	VISIT: "Visitas",
};

const limitOptions = [5, 10, 20, 50];

interface ActivityTimelineProps {
	defaultLimit?: number;
	defaultDays?: ActivityPeriod;
	showFilters?: boolean;
}

export function ActivityTimeline({
	defaultLimit = 10,
	defaultDays = 7,
	showFilters = true,
}: ActivityTimelineProps = {}) {
	const { selectedStore } = useSelectedStore();
	const [selectedType, setSelectedType] = useState<ActivityType>("ALL");
	const [selectedPeriod, setSelectedPeriod] = useState<ActivityPeriod>(defaultDays);
	const [limit, setLimit] = useState<number>(defaultLimit);

	const { data, isLoading } = useQuery<{ activities: Activity[] }>({
		queryKey: ["activities", selectedStore?.id, selectedPeriod, limit],
		queryFn: () =>
			storesService.getRecentActivities(selectedStore!.id, {
				limit,
				days: selectedPeriod,
			}),
		enabled: !!selectedStore?.id,
		staleTime: 1000 * 60, // 1 minute
	});

	const filteredActivities = useMemo(() => {
		const activities = data?.activities || [];
		if (selectedType === "ALL") {
			return activities;
		}
		return activities.filter((activity) => activity.type === selectedType);
	}, [data?.activities, selectedType]);

	if (!selectedStore) {
		return null;
	}

	if (isLoading) {
		return (
			<Card className="p-6">
				<div className="flex items-center justify-center py-8">
					<Loader2 className="h-6 w-6 animate-spin text-primary" />
				</div>
			</Card>
		);
	}

	const hasActiveFilters = selectedType !== "ALL";

	const resetFilters = () => {
		setSelectedType("ALL");
		setSelectedPeriod(defaultDays);
		setLimit(defaultLimit);
	};

	if (!selectedStore) {
		return null;
	}

	if (isLoading) {
		return (
			<Card className="p-6">
				<div className="flex items-center justify-center py-8">
					<Loader2 className="h-6 w-6 animate-spin text-primary" />
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-semibold flex items-center gap-2">
					<Clock className="h-5 w-5" />
					Atividades Recentes
				</h2>
				{showFilters && (
					<div className="flex items-center gap-2">
						{hasActiveFilters && (
							<Button
								variant="ghost"
								size="sm"
								onClick={resetFilters}
								className="text-xs"
							>
								<X className="h-3 w-3 mr-1" />
								Limpar
							</Button>
						)}
					</div>
				)}
			</div>

			{showFilters && (
				<div className="mb-6 space-y-4">
					{/* Filtro por Tipo */}
					<div>
						<label className="text-sm font-medium mb-2 block flex items-center gap-2">
							<Filter className="h-4 w-4" />
							Tipo de Atividade
						</label>
						<div className="flex flex-wrap gap-2">
							{(Object.keys(activityTypeLabels) as ActivityType[]).map((type) => (
								<Button
									key={type}
									variant={selectedType === type ? "default" : "outline"}
									size="sm"
									onClick={() => setSelectedType(type)}
									className="text-xs"
								>
									{activityTypeLabels[type]}
								</Button>
							))}
						</div>
					</div>

					{/* Filtro por Período e Limite */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="text-sm font-medium mb-2 block">Período</label>
							<select
								value={selectedPeriod}
								onChange={(e) => setSelectedPeriod(Number(e.target.value) as ActivityPeriod)}
								className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
							>
								<option value={1}>Últimas 24 horas</option>
								<option value={7}>Últimos 7 dias</option>
								<option value={30}>Últimos 30 dias</option>
								<option value={90}>Últimos 90 dias</option>
							</select>
						</div>
						<div>
							<label className="text-sm font-medium mb-2 block">Limite</label>
							<select
								value={limit}
								onChange={(e) => setLimit(Number(e.target.value))}
								className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
							>
								{limitOptions.map((option) => (
									<option key={option} value={option}>
										{option} atividades
									</option>
								))}
							</select>
						</div>
					</div>
				</div>
			)}

			{filteredActivities.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					<p>Nenhuma atividade encontrada</p>
					{hasActiveFilters && (
						<p className="text-sm mt-1">
							Tente ajustar os filtros ou período de busca
						</p>
					)}
					{!hasActiveFilters && (
						<p className="text-sm mt-1">
							As atividades aparecerão aqui quando houver movimentação
						</p>
					)}
				</div>
			) : (
				<div className="space-y-4">
					{filteredActivities.map((activity, index) => {
					const Icon = activityIcons[activity.type];
					const colorClass = activityColors[activity.type];
					const isLast = index === filteredActivities.length - 1;

					return (
						<div key={activity.id} className="relative">
							{/* Linha vertical */}
							{!isLast && (
								<div className="absolute left-5 top-10 bottom-0 w-0.5 bg-border" />
							)}
							<div className="flex items-start gap-4">
								{/* Ícone */}
								<div
									className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}
								>
									<Icon className="h-5 w-5" />
								</div>
								{/* Conteúdo */}
								<div className="flex-1 min-w-0 pt-1">
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1">
											<p className="font-semibold text-sm">{activity.title}</p>
											<p className="text-sm text-muted-foreground mt-1">
												{activity.description}
											</p>
										</div>
										{activity.type === "ORDER" && activity.relatedId && (
											<Link
												href={`/pedidos?order=${activity.relatedId}`}
												className="text-xs text-primary hover:underline shrink-0"
											>
												Ver pedido
											</Link>
										)}
										{activity.type === "PRODUCT" && activity.relatedId && (
											<Link
												href={`/produtos/${activity.relatedId}/editar`}
												className="text-xs text-primary hover:underline shrink-0"
											>
												Ver produto
											</Link>
										)}
									</div>
									<p className="text-xs text-muted-foreground mt-2">
										{formatDistanceToNow(new Date(activity.createdAt), {
											addSuffix: true,
											locale: ptBR,
										})}
									</p>
								</div>
							</div>
						</div>
					);
					})}
					{filteredActivities.length > 0 && (
						<div className="pt-4 border-t text-center text-sm text-muted-foreground">
							Mostrando {filteredActivities.length} de {data?.activities.length || 0} atividades
						</div>
					)}
				</div>
			)}
		</Card>
	);
}

