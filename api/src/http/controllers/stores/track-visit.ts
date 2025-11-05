import type { Request, Response } from "express";
import { DrizzleORM } from "~/database/connection";
import { DrizzleStoreVisitsRepository } from "~/repositories/drizzle/store-visits-repository";
import { makeFindStoreByIdUseCase } from "~/use-cases/@factories/stores/make-find-store-by-id-use-case";
import { StoreNotFoundError } from "~/use-cases/@errors/stores/store-not-found-error";

/**
 * @swagger
 * /stores/{id}/visit:
 *   post:
 *     summary: Registra uma visita a uma loja
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Visita registrada com sucesso
 *       404:
 *         description: Loja não encontrada
 */
export async function trackStoreVisitController(
	request: Request,
	response: Response,
) {
	try {
		const { id } = request.params;

		if (!id) {
			return response.status(400).json({
				message: "ID da loja é obrigatório",
			});
		}

		// Verificar se a loja existe
		const findStoreByIdUseCase = makeFindStoreByIdUseCase();
		try {
			await findStoreByIdUseCase.execute({ id });
		} catch (error) {
			if (error instanceof StoreNotFoundError) {
				return response.status(404).json({
					message: "Loja não encontrada",
				});
			}
			throw error;
		}

		// Obter IP e User-Agent
		let ipAddress: string | undefined;
		if (request.ip) {
			ipAddress = request.ip;
		} else if (request.headers["x-forwarded-for"]) {
			const forwardedFor = request.headers["x-forwarded-for"];
			ipAddress = typeof forwardedFor === "string" 
				? forwardedFor.split(",")[0].trim() 
				: String(forwardedFor).split(",")[0].trim();
		} else if (request.socket.remoteAddress) {
			ipAddress = request.socket.remoteAddress;
		}
		const userAgent = request.headers["user-agent"] || undefined;

		// Registrar visita
		const storeVisitsRepository = new DrizzleStoreVisitsRepository(DrizzleORM);
		await storeVisitsRepository.create({
			storeId: id,
			ipAddress: typeof ipAddress === "string" ? ipAddress : undefined,
			userAgent,
		});

		return response.status(200).json({
			message: "Visita registrada com sucesso",
		});
	} catch (error) {
		console.error("Error tracking store visit:", error);
		console.error("Error details:", {
			message: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});

		return response.status(500).json({
			message: "Internal server error",
			error: process.env.NODE_ENV === "development" 
				? (error instanceof Error ? error.message : String(error))
				: undefined,
		});
	}
}

