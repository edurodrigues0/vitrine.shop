import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStoreBranchesRepository } from "~/repositories/in-memory/in-memory-store-branches-repository";
import { BranchNotFoundError } from "../@errors/store-branches/branch-not-found-error";
import { DeleteStoreBranchUseCase } from "./delete-store-branch";

describe("DeleteStoreBranchUseCase", () => {
	let storeBranchesRepository: InMemoryStoreBranchesRepository;
	let sut: DeleteStoreBranchUseCase;

	beforeEach(() => {
		storeBranchesRepository = new InMemoryStoreBranchesRepository();
		sut = new DeleteStoreBranchUseCase(storeBranchesRepository);
	});

	it("should be able to delete a branch", async () => {
		const storeId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		const { branch } = await storeBranchesRepository.create({
			parentStoreId: storeId,
			name: "Filial to Delete",
			cityId,
		});

		await sut.execute({ id: branch.id });

		const deletedBranch = await storeBranchesRepository.findById({
			id: branch.id,
		});

		expect(deletedBranch).toBeNull();
	});

	it("should throw error when branch is not found", async () => {
		await expect(sut.execute({ id: "non-existent-id" })).rejects.toBeInstanceOf(
			BranchNotFoundError,
		);
	});

	it("should delete only the specified branch", async () => {
		const storeId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		const { branch: branch1 } = await storeBranchesRepository.create({
			parentStoreId: storeId,
			name: "Filial 1",
			cityId,
		});

		const { branch: branch2 } = await storeBranchesRepository.create({
			parentStoreId: storeId,
			name: "Filial 2",
			cityId,
		});

		await sut.execute({ id: branch1.id });

		const remainingBranch = await storeBranchesRepository.findById({
			id: branch2.id,
		});

		expect(remainingBranch).toBeTruthy();
		expect(remainingBranch?.name).toBe("Filial 2");
	});

	it("should remove branch from repository items", async () => {
		const storeId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		const { branch } = await storeBranchesRepository.create({
			parentStoreId: storeId,
			name: "Filial",
			cityId,
		});

		expect(storeBranchesRepository.items).toHaveLength(1);

		await sut.execute({ id: branch.id });

		expect(storeBranchesRepository.items).toHaveLength(0);
	});
});
