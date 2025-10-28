import type { Response } from "express";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";

export async function meController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		if (!request.user) {
			return response.status(401).json({
				error: "User not authenticated",
			});
		}

		return response.status(200).json({
			user: request.user,
		});
	} catch (_error) {
		return response.status(500).json({
			error: "Internal server error",
		});
	}
}
