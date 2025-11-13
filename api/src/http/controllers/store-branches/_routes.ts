import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { requireStoreOwner } from "~/http/middleware/permissions";
import { requireStoreBranchOwner } from "~/http/middleware/require-store-branch-owner";
import { publicRateLimit, authenticatedRateLimit } from "~/http/middleware/rate-limit";
import { createStoreBranchController } from "./create";
import { deleteStoreBranchController } from "./delete";
import { findAllStoreBranchesController } from "./find-all";
import { findStoreBranchByIdController } from "./find-by-id";
import { findStoreBranchesByStoreIdController } from "./find-by-store-id";
import { updateStoreBranchController } from "./update";

export const storeBranchesRoutes = Router();

// Criar branch - requer autenticação e validação de ownership da store
storeBranchesRoutes.post(
	"/store-branches",
	authenticatedRateLimit,
	authenticateMiddleware,
	createStoreBranchController,
);

// Listar todas as branches do usuário autenticado
storeBranchesRoutes.get(
	"/store-branches",
	authenticatedRateLimit,
	authenticateMiddleware,
	findAllStoreBranchesController,
);

// Listar branches de uma store específica - requer ownership da store
storeBranchesRoutes.get(
	"/store-branches/stores/:storeId",
	authenticatedRateLimit,
	authenticateMiddleware,
	requireStoreOwner,
	findStoreBranchesByStoreIdController,
);

// Buscar branch por ID - requer ownership da branch
storeBranchesRoutes.get(
	"/store-branches/:id",
	authenticatedRateLimit,
	authenticateMiddleware,
	requireStoreBranchOwner,
	findStoreBranchByIdController,
);

// Atualizar branch - requer ownership da branch
storeBranchesRoutes.put(
	"/store-branches/:id",
	authenticatedRateLimit,
	authenticateMiddleware,
	requireStoreBranchOwner,
	updateStoreBranchController,
);

// Deletar branch - requer ownership da branch
storeBranchesRoutes.delete(
	"/store-branches/:id",
	authenticatedRateLimit,
	authenticateMiddleware,
	requireStoreBranchOwner,
	deleteStoreBranchController,
);

