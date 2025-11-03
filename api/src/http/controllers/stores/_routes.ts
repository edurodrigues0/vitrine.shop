import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { createStoreController } from "./create";
import { findAllStoresController } from "./find-all";
import { findStoreByIdController } from "./find-by-id";
import { findStoreBySlugController } from "./find-by-slug";
import { updateStoreController } from "./update";

export const storesRoutes = Router();

storesRoutes.post("/stores", authenticateMiddleware, createStoreController);
storesRoutes.get("/stores", findAllStoresController);
storesRoutes.get("/stores/:id", findStoreByIdController);
storesRoutes.get("/stores/slug/:slug", findStoreBySlugController);
storesRoutes.put("/stores/:id", authenticateMiddleware, updateStoreController);
