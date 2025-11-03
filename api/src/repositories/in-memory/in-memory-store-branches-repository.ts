import type { StoreBranch } from "~/database/schema";
import type {
	CreateStoreBranchParams,
	FindAllStoreBranchesParams,
	StoreBranchesRepository,
	UpdateStoreBranchParams,
} from "../store-branches-repository";

export class InMemoryStoreBranchesRepository
	implements StoreBranchesRepository
{
	public items: StoreBranch[] = [];

	async create({
		parentStoreId,
		name,
		cityId,
		whatsapp,
		description,
		isMain = false,
	}: CreateStoreBranchParams): Promise<{ branch: StoreBranch }> {
		const id = crypto.randomUUID();
		const createdAt = new Date();
		const updatedAt = new Date();

		const branch: StoreBranch = {
			id,
			parentStoreId,
			name,
			cityId,
			whatsapp: whatsapp ?? null,
			description: description ?? null,
			isMain,
			createdAt,
			updatedAt,
		};

		this.items.push(branch);

		return { branch };
	}

	async findById({ id }: { id: string }): Promise<StoreBranch | null> {
		const branch = this.items.find((item) => item.id === id);
		return branch ?? null;
	}

	async findByStoreId({
		storeId,
	}: {
		storeId: string;
	}): Promise<StoreBranch[]> {
		const branches = this.items.filter(
			(item) => item.parentStoreId === storeId,
		);
		return branches;
	}

	async findByCityId({
		storeId,
		cityId,
	}: {
		storeId: string;
		cityId: string;
	}): Promise<StoreBranch[]> {
		const branches = this.items.filter(
			(item) => item.parentStoreId === storeId && item.cityId === cityId,
		);
		return branches;
	}

	async findAll({
		page,
		limit,
		filters,
	}: FindAllStoreBranchesParams): Promise<{
		branches: StoreBranch[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}> {
		const { parentStoreId, cityId, name, isMain } = filters;

		let branches = this.items;

		if (parentStoreId) {
			branches = branches.filter(
				(item) => item.parentStoreId === parentStoreId,
			);
		}

		if (cityId) {
			branches = branches.filter((item) => item.cityId === cityId);
		}

		if (name) {
			branches = branches.filter((item) =>
				item.name.toLowerCase().includes(name.toLowerCase()),
			);
		}

		if (isMain !== undefined) {
			branches = branches.filter((item) => item.isMain === isMain);
		}

		const totalItems = branches.length;
		const totalPages = Math.ceil(totalItems / limit);
		const paginatedBranches = branches.slice(
			(page - 1) * limit,
			page * limit,
		);

		return {
			branches: paginatedBranches,
			pagination: {
				currentPage: page,
				perPage: limit,
				totalItems,
				totalPages,
			},
		};
	}

	async update({
		id,
		data,
	}: UpdateStoreBranchParams): Promise<StoreBranch | null> {
		const branchIndex = this.items.findIndex((item) => item.id === id);

		if (branchIndex < 0) {
			return null;
		}

		const currentBranch = this.items[branchIndex];

		if (!currentBranch) {
			return null;
		}

		const updatedBranch: StoreBranch = {
			...currentBranch,
			name: data.name ?? currentBranch.name,
			cityId: data.cityId ?? currentBranch.cityId,
			whatsapp: data.whatsapp !== undefined ? data.whatsapp : currentBranch.whatsapp,
			description:
				data.description !== undefined
					? data.description
					: currentBranch.description,
			isMain: data.isMain !== undefined ? data.isMain : currentBranch.isMain,
			updatedAt: new Date(),
		};

		this.items[branchIndex] = updatedBranch;

		return updatedBranch;
	}

	async delete({ id }: { id: string }): Promise<void> {
		const branchIndex = this.items.findIndex((item) => item.id === id);

		if (branchIndex >= 0) {
			this.items.splice(branchIndex, 1);
		}
	}
}

