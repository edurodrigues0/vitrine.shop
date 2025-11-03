import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { uploadMiddleware } from "~/http/middleware/upload";
import { createProductImageController } from "./create";
import { deleteProductImageController } from "./delete";
import { findProductImagesByProductVariationIdController } from "./find-by-product-id";
import { updateProductImageController } from "./update";

export const productImagesRoutes = Router();

productImagesRoutes.post(
	"/product-images",
	authenticateMiddleware,
	uploadMiddleware.single("image"),
	createProductImageController,
);

productImagesRoutes.delete(
	"/product-images/:id",
	authenticateMiddleware,
	deleteProductImageController,
);

productImagesRoutes.get(
	"/product-images/variation/:productVariationId",
	authenticateMiddleware,
	findProductImagesByProductVariationIdController,
);

productImagesRoutes.put(
	"/product-images/:id",
	authenticateMiddleware,
	updateProductImageController,
);
