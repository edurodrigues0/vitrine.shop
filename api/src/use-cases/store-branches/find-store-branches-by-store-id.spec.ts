import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStoreBranchesRepository } from "~/repositories/in-memory/in-memory-store-branches-repository";
import { FindStoreBranchesByStoreIdUseCase } from "./find-store-branches-by-store-id";

describe("FindStoreBranchesByStoreIdUseCase", () => {
	let storeBranchesRepository: InMemoryStoreBranchesRepository;
	let sut: FindStoreBranchesByStoreIdUseCase;

	beforeEach(() => {
		storeBranchesRepository = new InMemoryStoreBranchesRepository();
		sut = new FindStoreBranchesByStoreIdUseCase(storeBranchesRepository);
	});

	it("should be able to find all branches by store id", async () => {
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

		const { branches } = await sut.execute({ storeId });

		expect(branches).toHaveLength(2);
		expect(branches[0]?.name).toBe("Filial 1");
		expect(branches[1]?.name).toBe("Filial 2");
	});

	it("should return only branches from the specified store", async () => {
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

		const { branches } = await sut.execute({ storeId: storeId1 });

		expect(branches).toHaveLength(1);
		expect(branches[0]?.parentStoreId).toBe(storeId1);
	});

	it("should return empty array when store has no branches", async () => {
		const storeId = crypto.randomUUID();

		const { branches } = await sut.execute({ storeId });

		expect(branches).toHaveLength(0);
	});

	it("should return branches with all properties", async () => {
		const storeId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		await storeBranchesRepository.create({
			parentStoreId: storeId,
			name: "Filial Centro",
			cityId,
			whatsapp: "31999999999",
			description: "Filial principal",
			isMain: true,
		});

		const { branches } = await sut.execute({ storeId });

		expect(branches[0]).toHaveProperty("id");
		expect(branches[0]).toHaveProperty("parentStoreId");
		expect(branches[0]).toHaveProperty("name");
		expect(branches[0]).toHaveProperty("cityId");
		expect(branches[0]).toHaveProperty("whatsapp");
		expect(branches[0]).toHaveProperty("description");
		expect(branches[0]).toHaveProperty("isMain");
		expect(branches[0]).toHaveProperty("createdAt");
		expect(branches[0]).toHaveProperty("updatedAt");
	});
});

