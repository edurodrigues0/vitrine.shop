import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { makeDeleteUserUseCase } from "~/use-cases/@factories/users/make-delete-user-use-case";

const deleteUserParamsSchema = z.object({
	id: z.string().uuid(),
});

export async function deleteUserController(
	request: Request,
	response: Response,
) {
	try {
		const { id } = deleteUserParamsSchema.parse(request.params);

		const deleteUserUseCase = makeDeleteUserUseCase();

		await deleteUserUseCase.execute({ id });

		return response.status(204).send();
	} catch (error) {
		console.error("Error deleting user:", error);

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
