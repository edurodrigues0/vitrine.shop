import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { createAttributeController } from "./create";
import { deleteAttributeController } from "./delete";
import { findAllAttributesController } from "./find-all";
import { findAttributeByIdController } from "./find-by-id";
import { updateAttributeController } from "./update";

export const attributesRoutes = Router();

attributesRoutes.post(
	"/attributes",
	authenticateMiddleware,
	createAttributeController,
);

attributesRoutes.get(
	"/attributes",
	authenticateMiddleware,
	findAllAttributesController,
);

attributesRoutes.get(
	"/attributes/:id",
	authenticateMiddleware,
	findAttributeByIdController,
);

attributesRoutes.put(
	"/attributes/:id",
	authenticateMiddleware,
	updateAttributeController,
);

attributesRoutes.delete(
	"/attributes/:id",
	authenticateMiddleware,
	deleteAttributeController,
);

