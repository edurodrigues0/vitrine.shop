import { and, count, desc, eq, ilike } from "drizzle-orm";
import type { DrizzleORM } from "~/database/connection";
import { type Store, stores } from "~/database/schema";
import type {
	CreateStoreParams,
	FindAllStoresParams,
	StoresRepository,
	UpdateStoreParams,
} from "../stores-repository";

export class DrizzleStoresRepository implements StoresRepository {
	constructor(private readonly drizzle: typeof DrizzleORM) { }

	async create({
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
	}: CreateStoreParams): Promise<Store> {
		const [store] = await this.drizzle
			.insert(stores)
			.values({
				name,
				slug,
				whatsapp,
				bannerUrl,
				instagramUrl,
				ownerId,
				cityId,
				theme: theme ?? {
					primary: "#000000",
					secondary: "#FFFFFF",
					bg: "#FFFFFF",
					surface: "#F3F4F6",
					text: "#000000",
					textSecondary: "#6B7280",
					highlight: "#FBBF24",
					border: "#E5E7EB",
					hover: "#DBEAFE",
				},
				facebookUrl,
				description,
				cnpjcpf,
				logoUrl,
			})
			.returning();

		if (!store) {
			throw new Error("Failed to create store");
		}

		return store;
	}

	async findByCnpjcpf({ cnpjcpf }: { cnpjcpf: string }): Promise<Store | null> {
		const [store] = await this.drizzle
			.select()
			.from(stores)
			.where(eq(stores.cnpjcpf, cnpjcpf));

		return store ?? null;
	}

	async findByWhatsapp({
		whatsapp,
	}: {
		whatsapp: string;
	}): Promise<Store | null> {
		const [store] = await this.drizzle
			.select()
			.from(stores)
			.where(eq(stores.whatsapp, whatsapp));

		return store ?? null;
	}

	async findBySlug({ slug }: { slug: string }): Promise<Store | null> {
		const [store] = await this.drizzle
			.select()
			.from(stores)
			.where(eq(stores.slug, slug));

		return store ?? null;
	}

	async findByOwnerId({ ownerId }: { ownerId: string }): Promise<Store | null> {
		const [store] = await this.drizzle
			.select()
			.from(stores)
			.where(eq(stores.ownerId, ownerId));

		return store ?? null;
	}

	async findById({ id }: { id: string }): Promise<Store | null> {
		const [store] = await this.drizzle
			.select()
			.from(stores)
			.where(eq(stores.id, id));

		return store ?? null;
	}

	async findAll({ page, limit, filters }: FindAllStoresParams): Promise<{
		stores: Store[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}> {
		const offset = (page - 1) * limit;

		// Construir condições de filtro
		const conditions = [];

		if (filters.name) {
			conditions.push(ilike(stores.name, `%${filters.name}%`));
		}

		if (filters.description) {
			conditions.push(ilike(stores.description, `%${filters.description}%`));
		}

		if (filters.slug) {
			conditions.push(ilike(stores.slug, `%${filters.slug}%`));
		}

		if (filters.ownerId) {
			conditions.push(eq(stores.ownerId, filters.ownerId));
		}

		if (filters.cityId) {
			conditions.push(eq(stores.cityId, filters.cityId));
		}

		if (filters.isPaid !== undefined) {
			conditions.push(eq(stores.isPaid, filters.isPaid));
		}

		// Se não houver filtro por ownerId, filtrar apenas lojas ativas (para busca pública)
		// Se houver filtro por ownerId, mostrar todas as lojas do usuário (para gestão)
		if (!filters.ownerId) {
			conditions.push(eq(stores.status, "ACTIVE"));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const storesResult = await this.drizzle
			.select({
				id: stores.id,
				name: stores.name,
				description: stores.description,
				cnpjcpf: stores.cnpjcpf,
				logoUrl: stores.logoUrl,
				whatsapp: stores.whatsapp,
				slug: stores.slug,
				instagramUrl: stores.instagramUrl,
				facebookUrl: stores.facebookUrl,
				bannerUrl: stores.bannerUrl,
				theme: stores.theme,
				cityId: stores.cityId,
				ownerId: stores.ownerId,
				status: stores.status,
				isPaid: stores.isPaid,
				createdAt: stores.createdAt,
				updatedAt: stores.updatedAt,
			})
			.from(stores)
			.where(whereClause)
			.orderBy(desc(stores.createdAt))
			.limit(limit)
			.offset(offset);

		// Contar total de itens
		const [totalResult] = await this.drizzle
			.select({ count: count() })
			.from(stores)
			.where(whereClause);

		const totalItems = totalResult?.count ?? 0;
		const totalPages = Math.ceil(totalItems / limit);

		return {
			stores: storesResult,
			pagination: {
				totalItems,
				totalPages,
				currentPage: page,
				perPage: limit,
			},
		};
	}

	async update({ id, data }: UpdateStoreParams): Promise<Store | null> {
		// Preparar dados para atualização, garantindo que campos undefined não sobrescrevam valores existentes
		const updateData: Record<string, unknown> = {
			updatedAt: new Date(),
		};

		// Atualizar apenas campos que foram fornecidos
		if (data.name !== undefined) updateData.name = data.name;
		if (data.description !== undefined) updateData.description = data.description;
		if (data.cnpjcpf !== undefined) updateData.cnpjcpf = data.cnpjcpf;
		if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
		if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
		if (data.slug !== undefined) updateData.slug = data.slug;
		if (data.instagramUrl !== undefined) updateData.instagramUrl = data.instagramUrl;
		if (data.facebookUrl !== undefined) updateData.facebookUrl = data.facebookUrl;
		if (data.bannerUrl !== undefined) updateData.bannerUrl = data.bannerUrl;
		if (data.theme !== undefined) updateData.theme = data.theme;
		if (data.cityId !== undefined) updateData.cityId = data.cityId;
		if (data.status !== undefined) updateData.status = data.status;
		if (data.isPaid !== undefined) updateData.isPaid = data.isPaid;

		const [updatedStore] = await this.drizzle
			.update(stores)
			.set(updateData)
			.where(eq(stores.id, id))
			.returning();

		return updatedStore ?? null;
	}

	async delete({ id }: { id: string }): Promise<void> {
		await this.drizzle.delete(stores).where(eq(stores.id, id));
	}
}
