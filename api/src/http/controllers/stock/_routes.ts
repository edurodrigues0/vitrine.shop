import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { createStockController } from "./create";
import { deleteStockController } from "./delete";
import { findStockByVariantIdController } from "./find-by-variant-id";
import { updateStockController } from "./update";
import { updateStockQuantityController } from "./update-quantity";

export const stockRoutes = Router();

stockRoutes.post("/stock", authenticateMiddleware, createStockController);

stockRoutes.get(
	"/stock/variant/:variantId",
	authenticateMiddleware,
	findStockByVariantIdController,
);

stockRoutes.put("/stock/:id", authenticateMiddleware, updateStockController);

stockRoutes.patch(
	"/stock/variant/:variantId/quantity",
	authenticateMiddleware,
	updateStockQuantityController,
);

stockRoutes.delete("/stock/:id", authenticateMiddleware, deleteStockController);

