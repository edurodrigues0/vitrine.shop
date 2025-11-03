import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { makeFindUserByEmailUseCase } from "~/use-cases/@factories/users/make-find-user-by-email-use-case";

const findUserByEmailQuerySchema = z.object({
	email: z.string().email(),
});

export async function findUserByEmailController(
	request: Request,
	response: Response,
) {
	try {
		const { email } = findUserByEmailQuerySchema.parse(request.query);

		const findUserByEmailUseCase = makeFindUserByEmailUseCase();

		const { user } = await findUserByEmailUseCase.execute({ email });

		return response.status(200).json({ user });
	} catch (error) {
		console.error("Error finding user by email:", error);

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
