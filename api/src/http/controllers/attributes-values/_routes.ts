import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { createAttributeValueController } from "./create";
import { deleteAttributeValueController } from "./delete";
import { findAttributeValueByIdController } from "./find-by-id";
import { findAttributeValuesByAttributeIdController } from "./find-by-attribute-id";
import { updateAttributeValueController } from "./update";

export const attributesValuesRoutes = Router();

attributesValuesRoutes.post(
	"/attributes-values",
	authenticateMiddleware,
	createAttributeValueController,
);

attributesValuesRoutes.get(
	"/attributes-values/:id",
	authenticateMiddleware,
	findAttributeValueByIdController,
);

attributesValuesRoutes.get(
	"/attributes-values/attribute/:attributeId",
	authenticateMiddleware,
	findAttributeValuesByAttributeIdController,
);

attributesValuesRoutes.put(
	"/attributes-values/:id",
	authenticateMiddleware,
	updateAttributeValueController,
);

attributesValuesRoutes.delete(
	"/attributes-values/:id",
	authenticateMiddleware,
	deleteAttributeValueController,
);

