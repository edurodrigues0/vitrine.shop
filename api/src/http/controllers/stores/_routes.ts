import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { publicRateLimit, authenticatedRateLimit } from "~/http/middleware/rate-limit";
import { requireStoreOwner } from "~/http/middleware/permissions";
import { createStoreController } from "./create";
import { findAllStoresController } from "./find-all";
import { findStoreByIdController } from "./find-by-id";
import { findStoreBySlugController } from "./find-by-slug";
import { getStoreStatisticsController } from "./statistics";
import { updateStoreController } from "./update";
import { trackStoreVisitController } from "./track-visit";

export const storesRoutes = Router();

storesRoutes.post("/stores", authenticatedRateLimit, authenticateMiddleware, createStoreController);
storesRoutes.get("/stores", publicRateLimit, findAllStoresController);
storesRoutes.get("/stores/:id", publicRateLimit, findStoreByIdController);
storesRoutes.get("/stores/slug/:slug", publicRateLimit, findStoreBySlugController);
storesRoutes.post("/stores/:id/visit", publicRateLimit, trackStoreVisitController);
storesRoutes.get("/stores/:id/statistics", authenticatedRateLimit, authenticateMiddleware, requireStoreOwner, getStoreStatisticsController);
storesRoutes.put("/stores/:id", authenticatedRateLimit, authenticateMiddleware, requireStoreOwner, updateStoreController);
