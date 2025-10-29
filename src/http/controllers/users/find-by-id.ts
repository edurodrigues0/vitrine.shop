import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { UserNotFoundError } from "~/use-cases/@errors/users/user-not-found-error";
import { makeFindUserByIdUseCase } from "~/use-cases/@factories/users/make-find-user-by-id-use-case";

const findUserByIdParamsSchema = z.object({
	id: z.string().uuid(),
});

export async function findUserByIdController(
	request: Request,
	response: Response,
) {
	try {
		const { id } = findUserByIdParamsSchema.parse(request.params);

		const findUserByIdUseCase = makeFindUserByIdUseCase();

		const { user } = await findUserByIdUseCase.execute({ id });

		return response.status(200).json({
			user: {
				id: user?.id,
				name: user?.name,
				email: user?.email,
				role: user?.role,
				storeId: user?.storeId,
				createdAt: user?.createdAt,
			},
		});
	} catch (error) {
		console.error("Error finding user by id:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof UserNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
