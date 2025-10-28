import { Router } from "express";
import { createUserController } from "./create";
import { deleteUserController } from "./delete";
// import { findUserByEmailController } from "./find-by-email";
import { findAllUsersController } from "./find-all";
import { findUserByIdController } from "./find-by-id";
import { findUsersByStoreIdController } from "./find-by-store-id";
import { updateUserController } from "./update";

export const usersRoutes = Router();

usersRoutes.post("/users", createUserController);
usersRoutes.get("/users", findAllUsersController);
// usersRoutes.get("/users/email", findUserByEmailController);
usersRoutes.get("/users/:id", findUserByIdController);
usersRoutes.get("/users/store/:storeId", findUsersByStoreIdController);
usersRoutes.put("/users/:id", updateUserController);
usersRoutes.delete("/users/:id", deleteUserController);
