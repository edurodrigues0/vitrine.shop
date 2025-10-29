import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { createStoreController } from "./create";
import { findStoreByIdController } from "./find-by-id";
import { findStoreBySlugController } from "./find-by-slug";

export const storesRoutes = Router();

storesRoutes.post("/stores", authenticateMiddleware, createStoreController);
storesRoutes.get("/stores/:id", findStoreByIdController);
storesRoutes.get("/stores/slug/:slug", findStoreBySlugController);
