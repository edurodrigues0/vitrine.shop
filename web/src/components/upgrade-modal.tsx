"use client";

import { useRouter } from "next/navigation";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { formatLimit } from "@/services/plan-limits-service";

interface UpgradeModalProps {
	open: boolean;
	onClose: () => void;
	current: number;
	limit: number;
	resource: "produtos" | "lojas" | "usuários";
	planId?: string;
}

/**
 * Modal informativo exibido quando o limite de recursos é excedido.
 * Oferece a opção de fazer upgrade do plano.
 */
export function UpgradeModal({
	open,
	onClose,
	current,
	limit,
	resource,
	planId,
}: UpgradeModalProps) {
	const router = useRouter();

	const handleUpgrade = () => {
		onClose();
		router.push("/planos");
	};

	const resourceSingular = resource === "produtos" 
		? "produto" 
		: resource === "lojas" 
			? "loja" 
			: "usuário";

	return (
		<AlertDialog
			open={open}
			onOpenChange={onClose}
			title="Limite de recursos atingido"
			description={`Você já atingiu o limite máximo de ${formatLimit(limit)} ${resource} do seu plano atual. Para criar mais ${resourceSingular}, faça upgrade do seu plano.`}
			confirmText="Ver Planos"
			cancelText="Fechar"
			variant="default"
			onConfirm={handleUpgrade}
			onCancel={onClose}
		>
			<div className="space-y-3 mt-4">
				<div className="flex justify-between items-center text-sm">
					<span className="text-muted-foreground">Uso atual:</span>
					<span className="font-semibold">{current} / {formatLimit(limit)}</span>
				</div>
				{planId && (
					<div className="flex justify-between items-center text-sm">
						<span className="text-muted-foreground">Plano atual:</span>
						<span className="font-semibold capitalize">
							{planId.split("-")[0]}
						</span>
					</div>
				)}
			</div>
		</AlertDialog>
	);
}
