import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStoreBranchesRepository } from "~/repositories/in-memory/in-memory-store-branches-repository";
import { FindAllStoreBranchesUseCase } from "./find-all-store-branches";

describe("FindAllStoreBranchesUseCase", () => {
	let storeBranchesRepository: InMemoryStoreBranchesRepository;
	let sut: FindAllStoreBranchesUseCase;

	beforeEach(() => {
		storeBranchesRepository = new InMemoryStoreBranchesRepository();
		sut = new FindAllStoreBranchesUseCase(storeBranchesRepository);
	});

	it("should be able to find all branches", async () => {
		const storeId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		await storeBranchesRepository.create({
			parentStoreId: storeId,
			name: "Filial 1",
			cityId,
		});

		await storeBranchesRepository.create({
			parentStoreId: storeId,
			name: "Filial 2",
			cityId,
		});

		const { branches, pagination } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(branches).toHaveLength(2);
		expect(pagination.totalItems).toBe(2);
		expect(pagination.totalPages).toBe(1);
	});

	it("should filter branches by parentStoreId", async () => {
		const storeId1 = crypto.randomUUID();
		const storeId2 = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		await storeBranchesRepository.create({
			parentStoreId: storeId1,
			name: "Store 1 - Filial",
			cityId,
		});

		await storeBranchesRepository.create({
			parentStoreId: storeId2,
			name: "Store 2 - Filial",
			cityId,
		});

		const { branches } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { parentStoreId: storeId1 },
		});

		expect(branches).toHaveLength(1);
		expect(branches[0]?.parentStoreId).toBe(storeId1);
	});

	it("should filter branches by cityId", async () => {
		const storeId = crypto.randomUUID();
		const cityId1 = crypto.randomUUID();
		const cityId2 = crypto.randomUUID();

		await storeBranchesRepository.create({
			parentStoreId: storeId,
			name: "Filial BH",
			cityId: cityId1,
		});

		await storeBranchesRepository.create({
			parentStoreId: storeId,
			name: "Filial SP",
			cityId: cityId2,
		});

		const { branches } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { cityId: cityId1 },
		});

		expect(branches).toHaveLength(1);
		expect(branches[0]?.cityId).toBe(cityId1);
	});

	it("should filter branches by name", async () => {
		const storeId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		await storeBranchesRepository.create({
			parentStoreId: storeId,
			name: "Filial Centro",
			cityId,
		});

		await storeBranchesRepository.create({
			parentStoreId: storeId,
			name: "Filial Savassi",
			cityId,
		});

		const { branches } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { name: "centro" },
		});

		expect(branches).toHaveLength(1);
		expect(branches[0]?.name).toBe("Filial Centro");
	});

	it("should filter branches by isMain", async () => {
		const storeId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		await storeBranchesRepository.create({
			parentStoreId: storeId,
			name: "Matriz",
			cityId,
			isMain: true,
		});

		await storeBranchesRepository.create({
			parentStoreId: storeId,
			name: "Filial",
			cityId,
			isMain: false,
		});

		const { branches } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { isMain: true },
		});

		expect(branches).toHaveLength(1);
		expect(branches[0]?.isMain).toBe(true);
	});

	it("should paginate results correctly", async () => {
		const storeId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		for (let i = 1; i <= 5; i++) {
			await storeBranchesRepository.create({
				parentStoreId: storeId,
				name: `Filial ${i}`,
				cityId,
			});
		}

		const page1 = await sut.execute({
			page: 1,
			limit: 2,
			filters: {},
		});

		expect(page1.branches).toHaveLength(2);
		expect(page1.pagination.totalItems).toBe(5);
		expect(page1.pagination.totalPages).toBe(3);

		const page2 = await sut.execute({
			page: 2,
			limit: 2,
			filters: {},
		});

		expect(page2.branches).toHaveLength(2);
		expect(page2.pagination.currentPage).toBe(2);
	});

	it("should return empty array when no branches match filters", async () => {
		const { branches } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { name: "nonexistent" },
		});

		expect(branches).toHaveLength(0);
	});
});

