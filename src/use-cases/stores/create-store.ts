import type { Store } from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";

interface CreateStoreUseCaseRequest {
	name: string;
	description: string;
	cnpjcpf: string;
	logoUrl: string;
	whatsapp: string;
	slug: string;
	instagramUrl: string;
	facebookUrl: string;
	bannerUrl: string;
	theme: {
		primaryColor: string;
		secondaryColor: string;
		tertiaryColor: string;
	};
	cityId: string;
	ownerId: string;
}

interface CreateStoreUseCaseRespose {
	store: Store;
}

export class CreateStoreUseCase {
	constructor(private readonly storesRepository: StoresRepository) {}

	async execucte({
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
			throw new Error("Store with same CNPJ/CPF already exists");
		}

		const storeWithSameWhatsapp = await this.storesRepository.findByWhatsapp({
			whatsapp,
		});

		if (storeWithSameWhatsapp) {
			throw new Error("Store with same WhatsApp already exists");
		}

		const storeWithSameSlug = await this.storesRepository.findBySlug({ slug });

		if (storeWithSameSlug) {
			throw new Error("Store with same slug already exists");
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
