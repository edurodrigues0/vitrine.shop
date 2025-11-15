import type { StoreBranch } from "~/database/schema";

export interface CreateStoreBranchParams {
	parentStoreId: string;
	name: string;
	cityId: string;
	whatsapp?: string;
	description?: string;
	isMain?: boolean;
}

export interface FindAllStoreBranchesParams {
	page: number;
	limit: number;
	filters: {
		parentStoreId?: string;
		cityId?: string;
		name?: string;
		isMain?: boolean;
	};
}

export interface UpdateStoreBranchParams {
	id: string;
	data: {
		name?: string;
		cityId?: string;
		whatsapp?: string;
		description?: string;
		isMain?: boolean;
		logoUrl?: string;
	};
}

export interface StoreBranchesRepository {
	create({
		parentStoreId,
		name,
		cityId,
		whatsapp,
		description,
		isMain,
	}: CreateStoreBranchParams): Promise<{ branch: StoreBranch }>;

	findById({ id }: { id: string }): Promise<StoreBranch | null>;

	findByStoreId({
		storeId,
	}: {
		storeId: string;
	}): Promise<StoreBranch[]>;

	findByCityId({
		storeId,
		cityId,
	}: {
		storeId: string;
		cityId: string;
	}): Promise<StoreBranch[]>;

	findAll({ page, limit, filters }: FindAllStoreBranchesParams): Promise<{
		branches: StoreBranch[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}>;

	update({ id, data }: UpdateStoreBranchParams): Promise<StoreBranch | null>;

	delete({ id }: { id: string }): Promise<void>;
}

