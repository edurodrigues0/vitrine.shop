import type { Store } from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";
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
	constructor(private readonly storesRepository: StoresRepository) { }

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
