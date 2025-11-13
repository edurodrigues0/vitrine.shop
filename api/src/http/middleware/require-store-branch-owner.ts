import type { Response, NextFunction } from "express";
import { makeFindStoreByIdUseCase } from "~/use-cases/@factories/stores/make-find-store-by-id-use-case";
import { DrizzleORM } from "~/database/connection";
import { DrizzleStoreBranchesRepository } from "~/repositories/drizzle/store-branches-repository";
import type { AuthenticatedRequest } from "./authenticate";

/**
 * Middleware para verificar se o usuário é dono da store de uma branch
 */
export async function requireStoreBranchOwner(
	request: AuthenticatedRequest,
	response: Response,
	next: NextFunction,
) {
	try {
		const branchId = request.params.branchId || request.params.id;
		const userId = request.user?.id;

		if (!branchId) {
			return response.status(400).json({
				message: "Branch ID is required",
			});
		}

		if (!userId) {
			return response.status(401).json({
				message: "Unauthorized",
			});
		}

		// Buscar a branch para obter o parentStoreId
		const storeBranchesRepository = new DrizzleStoreBranchesRepository(DrizzleORM);
		const branch = await storeBranchesRepository.findById({ id: branchId });

		if (!branch) {
			return response.status(404).json({
				message: "Store branch not found",
			});
		}

		// Buscar a store para verificar o owner
		const findStoreByIdUseCase = makeFindStoreByIdUseCase();
		const { store } = await findStoreByIdUseCase.execute({ id: branch.parentStoreId });

		if (!store) {
			return response.status(404).json({
				message: "Store not found",
			});
		}

		// Verificar se o usuário é o dono da loja
		if (store.ownerId !== userId) {
			return response.status(403).json({
				message: "You do not have permission to access this store branch",
			});
		}

		// Adicionar a branch e store à requisição para uso posterior
		(request as AuthenticatedRequest & { branch: typeof branch; store: typeof store }).branch = branch;
		(request as AuthenticatedRequest & { branch: typeof branch; store: typeof store }).store = store;

		next();
	} catch (error) {
		console.error("Error in requireStoreBranchOwner middleware:", error);
		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

