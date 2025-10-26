import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStoreBranchesRepository } from "~/repositories/in-memory/in-memory-store-branches-repository";
import { UpdateStoreBranchUseCase } from "./update-store-branch";

describe("UpdateStoreBranchUseCase", () => {
	let storeBranchesRepository: InMemoryStoreBranchesRepository;
	let sut: UpdateStoreBranchUseCase;

	beforeEach(() => {
		storeBranchesRepository = new InMemoryStoreBranchesRepository();
		sut = new UpdateStoreBranchUseCase(storeBranchesRepository);
	});

	it("should be able to update branch name", async () => {
		const storeId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		const { branch: createdBranch } =
			await storeBranchesRepository.create({
				parentStoreId: storeId,
				name: "Filial Centro",
				cityId,
			});

		const { branch } = await sut.execute({
			id: createdBranch.id,
			data: { name: "Filial Centro - BH" },
		});

		expect(branch.name).toBe("Filial Centro - BH");
	});

	it("should be able to update branch city", async () => {
		const storeId = crypto.randomUUID();
		const cityId1 = crypto.randomUUID();
		const cityId2 = crypto.randomUUID();

		const { branch: createdBranch } =
			await storeBranchesRepository.create({
				parentStoreId: storeId,
				name: "Filial",
				cityId: cityId1,
			});

		const { branch } = await sut.execute({
			id: createdBranch.id,
			data: { cityId: cityId2 },
		});

		expect(branch.cityId).toBe(cityId2);
	});

	it("should be able to update branch whatsapp", async () => {
		const storeId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		const { branch: createdBranch } =
			await storeBranchesRepository.create({
				parentStoreId: storeId,
				name: "Filial",
				cityId,
				whatsapp: "31999999999",
			});

		const { branch } = await sut.execute({
			id: createdBranch.id,
			data: { whatsapp: "31988888888" },
		});

		expect(branch.whatsapp).toBe("31988888888");
	});

	it("should be able to update isMain status", async () => {
		const storeId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		const { branch: createdBranch } =
			await storeBranchesRepository.create({
				parentStoreId: storeId,
				name: "Filial",
				cityId,
				isMain: false,
			});

		const { branch } = await sut.execute({
			id: createdBranch.id,
			data: { isMain: true },
		});

		expect(branch.isMain).toBe(true);
	});

	it("should throw error when branch is not found", async () => {
		await expect(
			sut.execute({
				id: "non-existent-id",
				data: { name: "Test" },
			}),
		).rejects.toThrow("Branch not found");
	});

	it("should not update fields that are not provided", async () => {
		const storeId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		const { branch: createdBranch } =
			await storeBranchesRepository.create({
				parentStoreId: storeId,
				name: "Filial Centro",
				cityId,
				whatsapp: "31999999999",
			});

		const { branch } = await sut.execute({
			id: createdBranch.id,
			data: { name: "Filial Centro - Atualizada" },
		});

		expect(branch.name).toBe("Filial Centro - Atualizada");
		expect(branch.whatsapp).toBe("31999999999");
		expect(branch.cityId).toBe(cityId);
	});

	it("should update updatedAt timestamp", async () => {
		const storeId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		const { branch: createdBranch } =
			await storeBranchesRepository.create({
				parentStoreId: storeId,
				name: "Filial",
				cityId,
			});

		const originalUpdatedAt = createdBranch.updatedAt;

		// Pequeno delay para garantir que o timestamp seja diferente
		await new Promise((resolve) => setTimeout(resolve, 10));

		const { branch } = await sut.execute({
			id: createdBranch.id,
			data: { name: "Filial Updated" },
		});

		expect(branch.updatedAt.getTime()).toBeGreaterThan(
			originalUpdatedAt.getTime(),
		);
	});
});

