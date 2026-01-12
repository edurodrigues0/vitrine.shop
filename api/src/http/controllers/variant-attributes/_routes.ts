import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { createVariantAttributeController } from "./create";
import { deleteVariantAttributeController } from "./delete";
import { findVariantAttributesByVariantIdController } from "./find-by-variant-id";

export const variantAttributesRoutes = Router();

variantAttributesRoutes.post(
	"/variant-attributes",
	authenticateMiddleware,
	createVariantAttributeController,
);

variantAttributesRoutes.get(
	"/variant-attributes/variant/:variantId",
	authenticateMiddleware,
	findVariantAttributesByVariantIdController,
);

variantAttributesRoutes.delete(
	"/variant-attributes/variant/:variantId/attribute/:attributeId",
	authenticateMiddleware,
	deleteVariantAttributeController,
);

