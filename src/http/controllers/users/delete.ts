import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { UserNotFoundError } from "~/use-cases/@errors/users/user-not-found-error";
import { makeDeleteUserUseCase } from "~/use-cases/@factories/users/make-delete-user-use-case";

const deleteUserParamsSchema = z.object({
	id: z.string().uuid(),
});

export async function deleteUserController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const user = request.user;

		if (user?.role === "EMPLOYEE") {
			return response.status(403).json({
				message: "Resource forbidden",
			});
		}

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
