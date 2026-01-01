import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { publicRateLimit, authenticatedRateLimit } from "~/http/middleware/rate-limit";
import { requireProductOwner } from "~/http/middleware/permissions";
import { createProductController } from "./create";
import { deleteProductController } from "./delete";
import { findAllProductsController } from "./find-all";
import { findProductByIdController } from "./find-by-id";
import { findProductsByStoreIdController } from "./find-by-store-id";
import { updateProductController } from "./update";
import { requirePaidSubscription } from "~/http/middleware/require-paid-subscription";

export const productsRoutes = Router();

productsRoutes.post(
	"/products",
	authenticatedRateLimit,
	authenticateMiddleware,
	requirePaidSubscription,
	createProductController,
);
productsRoutes.get("/products", publicRateLimit, findAllProductsController);
productsRoutes.get("/products/store/:storeId", publicRateLimit, findProductsByStoreIdController);
productsRoutes.get("/products/:id", publicRateLimit, findProductByIdController);
productsRoutes.put(
	"/products/:id",
	authenticatedRateLimit,
	authenticateMiddleware,
	requireProductOwner,
	requirePaidSubscription,
	updateProductController,
);
productsRoutes.delete(
	"/products/:id",
	authenticatedRateLimit,
	authenticateMiddleware,
	requireProductOwner,
	requirePaidSubscription,
	deleteProductController,
);
