import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStoreBranchesRepository } from "~/repositories/in-memory/in-memory-store-branches-repository";
import { FindStoreBranchesByCityUseCase } from "./find-store-branches-by-city";

describe("FindStoreBranchesByCityUseCase", () => {
	let storeBranchesRepository: InMemoryStoreBranchesRepository;
	let sut: FindStoreBranchesByCityUseCase;

	beforeEach(() => {
		storeBranchesRepository = new InMemoryStoreBranchesRepository();
		sut = new FindStoreBranchesByCityUseCase(storeBranchesRepository);
	});

	it("should be able to find branches by store and city", async () => {
		const storeId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		await storeBranchesRepository.create({
			parentStoreId: storeId,
			name: "Filial BH Centro",
			cityId,
		});

		await storeBranchesRepository.create({
			parentStoreId: storeId,
			name: "Filial BH Savassi",
			cityId,
		});

		const { branches } = await sut.execute({ storeId, cityId });

		expect(branches).toHaveLength(2);
	});

	it("should filter branches by city", async () => {
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

		const { branches } = await sut.execute({ storeId, cityId: cityId1 });

		expect(branches).toHaveLength(1);
		expect(branches[0]?.cityId).toBe(cityId1);
		expect(branches[0]?.name).toBe("Filial BH");
	});

	it("should return empty array when no branches in city", async () => {
		const storeId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		const { branches } = await sut.execute({ storeId, cityId });

		expect(branches).toHaveLength(0);
	});

	it("should not return branches from other stores in same city", async () => {
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

		const { branches } = await sut.execute({ storeId: storeId1, cityId });

		expect(branches).toHaveLength(1);
		expect(branches[0]?.parentStoreId).toBe(storeId1);
	});
});

