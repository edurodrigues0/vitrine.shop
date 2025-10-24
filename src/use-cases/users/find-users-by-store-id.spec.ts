import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUsersRepository } from "~/repositories/in-memory/in-memory-users-repository";
import { FindUserByStoreIdUseCase } from "./find-users-by-store-id";

describe("FindUserByStoreIdUseCase", () => {
	let usersRepository: InMemoryUsersRepository;
	let sut: FindUserByStoreIdUseCase;

	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		sut = new FindUserByStoreIdUseCase(usersRepository);
	});

	it("should be able to find users by store id", async () => {
		const storeId = crypto.randomUUID();

		await usersRepository.create({
			name: "John Doe",
			email: "john@example.com",
			password: "hashed_password",
			role: "OWNER",
		});

		// Manually set storeId
		usersRepository.items[0]!.storeId = storeId;

		await usersRepository.create({
			name: "Jane Doe",
			email: "jane@example.com",
			password: "hashed_password",
			role: "EMPLOYEE",
		});

		// Manually set storeId
		usersRepository.items[1]!.storeId = storeId;

		const { users, pagination } = await sut.execute({
			storeId,
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(users).toHaveLength(2);
		expect(pagination.totalItems).toBe(2);
		expect(pagination.totalPages).toBe(1);
		expect(pagination.currentPage).toBe(1);
		expect(pagination.perPage).toBe(10);
	});

	it("should return only users from the specified store", async () => {
		const storeId1 = crypto.randomUUID();
		const storeId2 = crypto.randomUUID();

		await usersRepository.create({
			name: "Store 1 User",
			email: "store1@example.com",
			password: "hashed_password",
			role: "OWNER",
		});
		usersRepository.items[0]!.storeId = storeId1;

		await usersRepository.create({
			name: "Store 2 User",
			email: "store2@example.com",
			password: "hashed_password",
			role: "OWNER",
		});
		usersRepository.items[1]!.storeId = storeId2;

		const { users } = await sut.execute({
			storeId: storeId1,
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(users).toHaveLength(1);
		expect(users[0]?.email).toBe("store1@example.com");
		expect(users[0]?.storeId).toBe(storeId1);
	});

	it("should filter users by email", async () => {
		const storeId = crypto.randomUUID();

		await usersRepository.create({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "hashed_password",
			role: "OWNER",
		});
		usersRepository.items[0]!.storeId = storeId;

		await usersRepository.create({
			name: "Jane Smith",
			email: "jane.smith@example.com",
			password: "hashed_password",
			role: "EMPLOYEE",
		});
		usersRepository.items[1]!.storeId = storeId;

		const { users } = await sut.execute({
			storeId,
			page: 1,
			limit: 10,
			filters: {
				email: "jane",
			},
		});

		expect(users).toHaveLength(1);
		expect(users[0]?.email).toBe("jane.smith@example.com");
	});

	it("should filter users by name", async () => {
		const storeId = crypto.randomUUID();

		await usersRepository.create({
			name: "John Doe",
			email: "john@example.com",
			password: "hashed_password",
			role: "OWNER",
		});
		usersRepository.items[0]!.storeId = storeId;

		await usersRepository.create({
			name: "Jane Doe",
			email: "jane@example.com",
			password: "hashed_password",
			role: "EMPLOYEE",
		});
		usersRepository.items[1]!.storeId = storeId;

		const { users } = await sut.execute({
			storeId,
			page: 1,
			limit: 10,
			filters: {
				name: "john",
			},
		});

		expect(users).toHaveLength(1);
		expect(users[0]?.name).toBe("John Doe");
	});

	it("should filter users by role", async () => {
		const storeId = crypto.randomUUID();

		await usersRepository.create({
			name: "Owner User",
			email: "owner@example.com",
			password: "hashed_password",
			role: "OWNER",
		});
		usersRepository.items[0]!.storeId = storeId;

		await usersRepository.create({
			name: "Employee User",
			email: "employee@example.com",
			password: "hashed_password",
			role: "EMPLOYEE",
		});
		usersRepository.items[1]!.storeId = storeId;

		await usersRepository.create({
			name: "Admin User",
			email: "admin@example.com",
			password: "hashed_password",
			role: "ADMIN",
		});
		usersRepository.items[2]!.storeId = storeId;

		const { users } = await sut.execute({
			storeId,
			page: 1,
			limit: 10,
			filters: {
				role: "EMPLOYEE",
			},
		});

		expect(users).toHaveLength(1);
		expect(users[0]!.role).toBe("EMPLOYEE");
	});

	it("should apply multiple filters at once", async () => {
		const storeId = crypto.randomUUID();

		await usersRepository.create({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "hashed_password",
			role: "OWNER",
		});
		usersRepository.items[0]!.storeId = storeId;

		await usersRepository.create({
			name: "Jane Doe",
			email: "jane.doe@example.com",
			password: "hashed_password",
			role: "EMPLOYEE",
		});
		usersRepository.items[1]!.storeId = storeId;

		await usersRepository.create({
			name: "Bob Smith",
			email: "bob.smith@example.com",
			password: "hashed_password",
			role: "EMPLOYEE",
		});
		usersRepository.items[2]!.storeId = storeId;

		const { users } = await sut.execute({
			storeId,
			page: 1,
			limit: 10,
			filters: {
				name: "doe",
				role: "EMPLOYEE",
			},
		});

		expect(users).toHaveLength(1);
		expect(users[0]?.name).toBe("Jane Doe");
		expect(users[0]?.role).toBe("EMPLOYEE");
	});

	it("should paginate results correctly", async () => {
		const storeId = crypto.randomUUID();

		// Create 5 users
		for (let i = 1; i <= 5; i++) {
			await usersRepository.create({
				name: `User ${i}`,
				email: `user${i}@example.com`,
				password: "hashed_password",
				role: "EMPLOYEE",
			});
			usersRepository.items[i - 1]!.storeId = storeId;
		}

		// Page 1 with limit 2
		const page1 = await sut.execute({
			storeId,
			page: 1,
			limit: 2,
			filters: {},
		});

		expect(page1.users).toHaveLength(2);
		expect(page1.pagination.totalItems).toBe(5);
		expect(page1.pagination.totalPages).toBe(3);
		expect(page1.pagination.currentPage).toBe(1);

		// Page 2 with limit 2
		const page2 = await sut.execute({
			storeId,
			page: 2,
			limit: 2,
			filters: {},
		});

		expect(page2.users).toHaveLength(2);
		expect(page2.pagination.currentPage).toBe(2);

		// Page 3 with limit 2 (should have only 1 user)
		const page3 = await sut.execute({
			storeId,
			page: 3,
			limit: 2,
			filters: {},
		});

		expect(page3.users).toHaveLength(1);
		expect(page3.pagination.currentPage).toBe(3);
	});

	it("should return empty array when no users match the store id", async () => {
		const storeId = crypto.randomUUID();
		const differentStoreId = crypto.randomUUID();

		await usersRepository.create({
			name: "John Doe",
			email: "john@example.com",
			password: "hashed_password",
			role: "OWNER",
		});
		usersRepository.items[0]!.storeId = differentStoreId;

		const { users, pagination } = await sut.execute({
			storeId,
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(users).toHaveLength(0);
		expect(pagination.totalItems).toBe(0);
		expect(pagination.totalPages).toBe(0);
	});

	it("should return empty array when filters match no users", async () => {
		const storeId = crypto.randomUUID();

		await usersRepository.create({
			name: "John Doe",
			email: "john@example.com",
			password: "hashed_password",
			role: "OWNER",
		});
		usersRepository.items[0]!.storeId = storeId;

		const { users } = await sut.execute({
			storeId,
			page: 1,
			limit: 10,
			filters: {
				email: "nonexistent",
			},
		});

		expect(users).toHaveLength(0);
	});

	it("should handle case-insensitive filters", async () => {
		const storeId = crypto.randomUUID();

		await usersRepository.create({
			name: "John Doe",
			email: "JOHN.DOE@EXAMPLE.COM",
			password: "hashed_password",
			role: "OWNER",
		});

		usersRepository.items[0]!.storeId = storeId;

		const resultByEmail = await sut.execute({
			storeId,
			page: 1,
			limit: 10,
			filters: {
				email: "john.doe",
			},
		});

		expect(resultByEmail.users).toHaveLength(1);

		const resultByName = await sut.execute({
			storeId,
			page: 1,
			limit: 10,
			filters: {
				name: "JOHN",
			},
		});

		expect(resultByName.users).toHaveLength(1);
	});
});
