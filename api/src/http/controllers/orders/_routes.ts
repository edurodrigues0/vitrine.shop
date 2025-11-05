import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { authenticatedRateLimit } from "~/http/middleware/rate-limit";
import { requireOrderOwner } from "~/http/middleware/permissions";
import { createOrderController } from "./create";
import { findOrderByIdController } from "./find-by-id";
import { findOrderItemsController } from "./find-items";
import { findOrdersByStoreController } from "./find-by-store";
import { updateOrderStatusController } from "./update-status";

export const ordersRoutes = Router();

ordersRoutes.post("/orders", authenticatedRateLimit, authenticateMiddleware, createOrderController);
ordersRoutes.get("/orders", authenticatedRateLimit, authenticateMiddleware, findOrdersByStoreController);
ordersRoutes.get("/orders/:id", authenticatedRateLimit, authenticateMiddleware, requireOrderOwner, findOrderByIdController);
ordersRoutes.get("/orders/:id/items", authenticatedRateLimit, authenticateMiddleware, requireOrderOwner, findOrderItemsController);
ordersRoutes.put("/orders/:id/status", authenticatedRateLimit, authenticateMiddleware, requireOrderOwner, updateOrderStatusController);

