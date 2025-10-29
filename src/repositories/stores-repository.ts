import type * as schema from "~/database/schema";

export interface CreateStoreParams {
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

export interface FindAllStoresParams {
	page: number;
	limit: number;
	filters: {
		name?: string;
		description?: string;
		cnpjcpf?: string;
		whatsapp?: string;
		slug?: string;
		cityName?: string;
		ownerId?: string;
		isPaid?: boolean;
		createdAt?: Date;
	};
}

export interface UpdateStoreParams {
	id: string;
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
			primaryColor: string;
			secondaryColor: string;
			tertiaryColor: string;
		};
		cityId?: string;
	};
}

export interface StoresRepository {
	create({
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
	}: CreateStoreParams): Promise<schema.Store>;

	findByCnpjcpf({ cnpjcpf }: { cnpjcpf: string }): Promise<schema.Store | null>;
	findByWhatsapp({
		whatsapp,
	}: {
		whatsapp: string;
	}): Promise<schema.Store | null>;
	findById({ id }: { id: string }): Promise<schema.Store | null>;
	findBySlug({ slug }: { slug: string }): Promise<schema.Store | null>;
	findByOwnerId({ ownerId }: { ownerId: string }): Promise<schema.Store | null>;
	findAll({ page, limit, filters }: FindAllStoresParams): Promise<{
		stores: schema.Store[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}>;

	update({ id, data }: UpdateStoreParams): Promise<schema.Store | null>;

	delete({ id }: { id: string }): Promise<void>;
}
