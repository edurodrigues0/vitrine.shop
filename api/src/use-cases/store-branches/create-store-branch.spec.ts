import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStoreBranchesRepository } from "~/repositories/in-memory/in-memory-store-branches-repository";
import { CreateStoreBranchUseCase } from "./create-store-branch";

describe("CreateStoreBranchUseCase", () => {
	let storeBranchesRepository: InMemoryStoreBranchesRepository;
	let sut: CreateStoreBranchUseCase;

	beforeEach(() => {
		storeBranchesRepository = new InMemoryStoreBranchesRepository();
		sut = new CreateStoreBranchUseCase(storeBranchesRepository);
	});

	it("should be able to create a new store branch", async () => {
		const parentStoreId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		const { branch } = await sut.execute({
			parentStoreId,
			name: "Filial Centro",
			cityId,
			whatsapp: "31999999999",
			description: "Filial localizada no centro da cidade",
		});

		expect(branch).toBeTruthy();
		expect(branch.id).toBeTruthy();
		expect(branch.parentStoreId).toBe(parentStoreId);
		expect(branch.name).toBe("Filial Centro");
		expect(branch.cityId).toBe(cityId);
		expect(branch.whatsapp).toBe("31999999999");
	});

	it("should be able to create a main branch", async () => {
		const parentStoreId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		const { branch } = await sut.execute({
			parentStoreId,
			name: "Matriz",
			cityId,
			isMain: true,
		});

		expect(branch.isMain).toBe(true);
	});

	it("should create branch with default isMain as false", async () => {
		const parentStoreId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		const { branch } = await sut.execute({
			parentStoreId,
			name: "Filial",
			cityId,
		});

		expect(branch.isMain).toBe(false);
	});

	it("should be able to create branch without optional fields", async () => {
		const parentStoreId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		const { branch } = await sut.execute({
			parentStoreId,
			name: "Filial Simples",
			cityId,
		});

		expect(branch).toBeTruthy();
		expect(branch.whatsapp).toBeNull();
		expect(branch.description).toBeNull();
	});

	it("should save branch in repository", async () => {
		const parentStoreId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		await sut.execute({
			parentStoreId,
			name: "Filial Test",
			cityId,
		});

		expect(storeBranchesRepository.items).toHaveLength(1);
	});

	it("should create multiple branches for same store", async () => {
		const parentStoreId = crypto.randomUUID();
		const cityId1 = crypto.randomUUID();
		const cityId2 = crypto.randomUUID();

		await sut.execute({
			parentStoreId,
			name: "Filial 1",
			cityId: cityId1,
		});

		await sut.execute({
			parentStoreId,
			name: "Filial 2",
			cityId: cityId2,
		});

		expect(storeBranchesRepository.items).toHaveLength(2);
		expect(
			storeBranchesRepository.items.every(
				(item) => item.parentStoreId === parentStoreId,
			),
		).toBe(true);
	});

	it("should create branches with timestamps", async () => {
		const parentStoreId = crypto.randomUUID();
		const cityId = crypto.randomUUID();

		const { branch } = await sut.execute({
			parentStoreId,
			name: "Filial",
			cityId,
		});

		expect(branch.createdAt).toBeInstanceOf(Date);
		expect(branch.updatedAt).toBeInstanceOf(Date);
	});
});
