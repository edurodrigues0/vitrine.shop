import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { createProductVariationsController } from "./create";
import { deleteProductVariationController } from "./delete";
import { findProductVariationByIdController } from "./find-by-id";
import { findProductVariationsByProductIdController } from "./find-by-product-id";
import { updateProductVariationController } from "./update";

export const productVariationsRoutes = Router();

productVariationsRoutes.post(
	"/product-variations",
	authenticateMiddleware,
	createProductVariationsController,
);

productVariationsRoutes.delete(
	"/product-variations/:id",
	authenticateMiddleware,
	deleteProductVariationController,
);

productVariationsRoutes.get(
	"/product-variations/:id",
	authenticateMiddleware,
	findProductVariationByIdController,
);

productVariationsRoutes.get(
	"/product-variations/product/:productId",
	authenticateMiddleware,
	findProductVariationsByProductIdController,
);

productVariationsRoutes.put(
	"/product-variations/:id",
	authenticateMiddleware,
	updateProductVariationController,
);
