import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { createCategoryController } from "./create";
import { deleteCategoryController } from "./delete";
import { findAllCategoriesController } from "./find-all";
import { findCategoryBySlugController } from "./find-by-slug";
import { updateCategoryController } from "./update";

export const categoriesRoutes = Router();

categoriesRoutes.post(
	"/categories",
	authenticateMiddleware,
	createCategoryController,
);

categoriesRoutes.get("/categories", findAllCategoriesController);

categoriesRoutes.get("/categories/slug/:slug", findCategoryBySlugController);

categoriesRoutes.put(
	"/categories/:id",
	authenticateMiddleware,
	updateCategoryController,
);

categoriesRoutes.delete(
	"/categories/:id",
	authenticateMiddleware,
	deleteCategoryController,
);
