import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { makeFindUsersByStoreIdUseCase } from "~/use-cases/@factories/users/make-find-users-by-store-id-use-case";

const findUsersByStoreIdQuerySchema = z.object({
	storeId: z.string().uuid(),
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	name: z.string().optional(),
	email: z.string().optional(),
	role: z.enum(["ADMIN", "OWNER", "EMPLOYEE"]).optional(),
});

export async function findUsersByStoreIdController(
	request: Request,
	response: Response,
) {
	try {
		const { storeId, page, limit, name, email, role } =
			findUsersByStoreIdQuerySchema.parse(request.query);

		const findUsersByStoreIdUseCase = makeFindUsersByStoreIdUseCase();

		const { users, pagination } = await findUsersByStoreIdUseCase.execute({
			storeId,
			page,
			limit,
			filters: {
				name,
				email,
				role,
			},
		});

		return response.status(200).json({
			users,
			meta: {
				totalItems: pagination.totalItems,
				totalPages: pagination.totalPages,
				currentPage: pagination.currentPage,
				perPage: pagination.perPage,
			},
		});
	} catch (error) {
		console.error("Error finding users by store id:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
