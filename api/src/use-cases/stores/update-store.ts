import type { Store } from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";
import { FailedToUpdateStoreError } from "../@errors/stores/failed-to-update-store-error";
import { StoreNotFoundError } from "../@errors/stores/store-not-found-error";
import { StoreWithSameCnpjCpfError } from "../@errors/stores/store-with-same-cpnjcpf-error";
import { StoreWithSameSlugError } from "../@errors/stores/store-with-same-slug";
import { StoreWithSameWhatsappError } from "../@errors/stores/store-with-same-whatsapp-error";

interface UpdateStoreUseCaseRequest {
	id: string;
	ownerId: string;
	data: {
		name?: string;
		description?: string;
		cnpjcpf?: string;
		logoUrl?: string;
		whatsapp?: string;
		slug?: string;
		instagramUrl?: string;
		facebookUrl?: string;
		bannerUrl?: string;
		theme?: {
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
		cityId?: string;
	};
}

interface UpdateStoreUseCaseResponse {
	store: Store | null;
}

export class UpdateStoreUseCase {
	constructor(private readonly storesRepository: StoresRepository) { }

	async execute({
		id,
		ownerId,
		data,
	}: UpdateStoreUseCaseRequest): Promise<UpdateStoreUseCaseResponse> {
		const store = await this.storesRepository.findById({
			id,
		});

		if (!store) {
			throw new StoreNotFoundError();
		}

		// Verificar se o usuário é o dono da loja
		if (store.ownerId !== ownerId) {
			throw new StoreNotFoundError(); // Não revelar que a loja existe
		}

		// Verificar duplicação de CNPJ/CPF se estiver sendo atualizado
		if (data.cnpjcpf && data.cnpjcpf !== store.cnpjcpf) {
			const storeWithSameCnpjcpf = await this.storesRepository.findByCnpjcpf({
				cnpjcpf: data.cnpjcpf,
			});

			if (storeWithSameCnpjcpf) {
				throw new StoreWithSameCnpjCpfError();
			}
		}

		// Verificar duplicação de WhatsApp se estiver sendo atualizado
		if (data.whatsapp && data.whatsapp !== store.whatsapp) {
			const storeWithSameWhatsapp = await this.storesRepository.findByWhatsapp({
				whatsapp: data.whatsapp,
			});

			if (storeWithSameWhatsapp) {
				throw new StoreWithSameWhatsappError();
			}
		}

		// Verificar duplicação de slug se estiver sendo atualizado
		if (data.slug && data.slug !== store.slug) {
			const storeWithSameSlug = await this.storesRepository.findBySlug({
				slug: data.slug,
			});

			if (storeWithSameSlug) {
				throw new StoreWithSameSlugError();
			}
		}

		const updatedStore = await this.storesRepository.update({
			id,
			data,
		});

		if (!updatedStore) {
			throw new FailedToUpdateStoreError();
		}

		return { store: updatedStore };
	}
}
