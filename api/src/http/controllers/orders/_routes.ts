import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { createOrderController } from "./create";
import { findOrderByIdController } from "./find-by-id";
import { findOrderItemsController } from "./find-items";
import { findOrdersByStoreController } from "./find-by-store";
import { updateOrderStatusController } from "./update-status";

export const ordersRoutes = Router();

ordersRoutes.post("/orders", authenticateMiddleware, createOrderController);
ordersRoutes.get("/orders", authenticateMiddleware, findOrdersByStoreController);
ordersRoutes.get("/orders/:id", authenticateMiddleware, findOrderByIdController);
ordersRoutes.get("/orders/:id/items", authenticateMiddleware, findOrderItemsController);
ordersRoutes.put("/orders/:id/status", authenticateMiddleware, updateOrderStatusController);

