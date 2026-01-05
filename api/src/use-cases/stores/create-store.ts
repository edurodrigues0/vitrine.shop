import type { Store } from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";
import type { SubscriptionsRepository } from "~/repositories/subscriptions-repository";
import { PlanLimitsService } from "~/services/plan-limits-service";
import { StoreLimitExceededError } from "../@errors/plans/store-limit-exceeded-error";
import { SubscriptionRequiredError } from "../@errors/plans/subscription-required-error";
import { StoreWithSameCnpjCpfError } from "../@errors/stores/store-with-same-cpnjcpf-error";
import { StoreWithSameSlugError } from "../@errors/stores/store-with-same-slug";
import { StoreWithSameWhatsappError } from "../@errors/stores/store-with-same-whatsapp-error";

interface CreateStoreUseCaseRequest {
	name: string;
	description?: string | null;
	cnpjcpf: string;
	logoUrl?: string | null;
	whatsapp: string;
	slug: string;
	instagramUrl?: string | null;
	facebookUrl?: string | null;
	bannerUrl?: string | null;
	theme: {
		primary: string;
		primaryGradient?: string;
		secondary: string;
		bg: string;
		surface: string;
		text: string;
		textSecondary: string;
		highlight: string;
		border: string;
		hover: string;
		overlay?: string;
	};
	cityId: string;
	ownerId: string;
}

interface CreateStoreUseCaseRespose {
	store: Store;
}

export class CreateStoreUseCase {
	constructor(
		private readonly storesRepository: StoresRepository,
		private readonly subscriptionsRepository: SubscriptionsRepository,
	) {}

	async execute({
		name,
		description,
		bannerUrl,
		cityId,
		cnpjcpf,
		facebookUrl,
		instagramUrl,
		logoUrl,
		ownerId,
		slug,
		theme,
		whatsapp,
	}: CreateStoreUseCaseRequest): Promise<CreateStoreUseCaseRespose> {
		// Buscar assinatura do usuário
		const subscription = await this.subscriptionsRepository.findByUserId({
			userId: ownerId,
		});

		// Validar se assinatura existe e está ativa
		if (!subscription) {
			throw new SubscriptionRequiredError();
		}

		if (subscription.status !== "PAID") {
			throw new SubscriptionRequiredError();
		}

		// Verificar se a assinatura não expirou
		const now = new Date();
		const periodEnd = new Date(subscription.currentPeriodEnd);

		if (now > periodEnd) {
			throw new SubscriptionRequiredError();
		}

		// Validar limite de lojas do plano
		const limits = PlanLimitsService.getLimits(subscription.planId);

		if (limits.maxStores !== null) {
			const storeCount = await this.storesRepository.countByOwnerId({
				ownerId,
			});

			if (PlanLimitsService.hasReachedLimit(storeCount, limits.maxStores)) {
				throw new StoreLimitExceededError(
					limits.maxStores,
					storeCount,
					subscription.planId,
				);
			}
		}

		const storeWithSameCnpjcpf = await this.storesRepository.findByCnpjcpf({
			cnpjcpf,
		});

		if (storeWithSameCnpjcpf) {
			throw new StoreWithSameCnpjCpfError();
		}

		const storeWithSameWhatsapp = await this.storesRepository.findByWhatsapp({
			whatsapp,
		});

		if (storeWithSameWhatsapp) {
			throw new StoreWithSameWhatsappError();
		}

		const storeWithSameSlug = await this.storesRepository.findBySlug({ slug });

		if (storeWithSameSlug) {
			throw new StoreWithSameSlugError();
		}

		const store = await this.storesRepository.create({
			name,
			description,
			cnpjcpf,
			logoUrl,
			whatsapp,
			slug,
			instagramUrl,
			facebookUrl,
			bannerUrl,
			theme,
			cityId,
			ownerId,
		});

		return { store };
	}
}
