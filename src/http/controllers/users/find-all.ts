import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { makeFindAllUsersUseCase } from "~/use-cases/@factories/users/make-find-all-users-use-case";

const findAllUsersQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	name: z.string().optional(),
	email: z.string().optional(),
	role: z.enum(["ADMIN", "OWNER", "EMPLOYEE"]).optional(),
});

export async function findAllUsersController(
	request: Request,
	response: Response,
) {
	try {
		const { page, limit, name, email, role } = findAllUsersQuerySchema.parse(
			request.query,
		);

		const findAllUsersUseCase = makeFindAllUsersUseCase();

		const { users, pagination } = await findAllUsersUseCase.execute({
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
		console.error("Error finding all users:", error);

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
