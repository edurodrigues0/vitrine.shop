import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { createUserController } from "./create";
import { deleteUserController } from "./delete";
// import { findUserByEmailController } from "./find-by-email";
import { findAllUsersController } from "./find-all";
import { findUserByIdController } from "./find-by-id";
import { findUsersByStoreIdController } from "./find-by-store-id";
import { updateUserController } from "./update";

export const usersRoutes = Router();

usersRoutes.post("/users", createUserController);
usersRoutes.get("/users", authenticateMiddleware, findAllUsersController);
// usersRoutes.get("/users/email", findUserByEmailController);
usersRoutes.get("/users/:id", authenticateMiddleware, findUserByIdController);
usersRoutes.get(
	"/users/store/:storeId",
	authenticateMiddleware,
	findUsersByStoreIdController,
);
usersRoutes.put("/users/:id", authenticateMiddleware, updateUserController);
usersRoutes.delete("/users/:id", authenticateMiddleware, deleteUserController);
