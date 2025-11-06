import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { authenticatedRateLimit, publicRateLimit } from "~/http/middleware/rate-limit";
import { createAddressController } from "./create";
import { deleteAddressController } from "./delete";
import { findAllAddressesController } from "./find-all";
import { findAddressByIdController } from "./find-by-id";
import { updateAddressController } from "./update";

export const addressesRoutes = Router();

addressesRoutes.post("/addresses", authenticatedRateLimit, authenticateMiddleware, createAddressController);
addressesRoutes.get("/addresses", publicRateLimit, findAllAddressesController);
addressesRoutes.get("/addresses/:id", publicRateLimit, findAddressByIdController);
addressesRoutes.put("/addresses/:id", authenticatedRateLimit, authenticateMiddleware, updateAddressController);
addressesRoutes.delete("/addresses/:id", authenticatedRateLimit, authenticateMiddleware, deleteAddressController);

