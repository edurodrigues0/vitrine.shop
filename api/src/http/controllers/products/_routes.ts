import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { createProductController } from "./create";
import { deleteProductController } from "./delete";
import { findAllProductsController } from "./find-all";
import { findProductByIdController } from "./find-by-id";
import { findProductsByStoreIdController } from "./find-by-store-id";
import { updateProductController } from "./update";

export const productsRoutes = Router();

productsRoutes.post(
	"/products",
	authenticateMiddleware,
	createProductController,
);
productsRoutes.get("/products", findAllProductsController);
productsRoutes.get("/products/:id", findProductByIdController);
productsRoutes.get("/products/store/:storeId", findProductsByStoreIdController);
productsRoutes.put(
	"/products/:id",
	authenticateMiddleware,
	updateProductController,
);
productsRoutes.delete(
	"/products/:id",
	authenticateMiddleware,
	deleteProductController,
);
