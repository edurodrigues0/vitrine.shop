import { eq } from "drizzle-orm";
import type { DrizzleORM } from "~/database/connection";
import { type Store, stores } from "~/database/schema";
import type { CreateStoreParams, StoresRepository } from "../stores-repository";

export class DrizzleStoresRepository implements StoresRepository {
	constructor(private readonly drizzle: typeof DrizzleORM) {}

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
				theme,
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
}
